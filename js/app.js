/**
 * Academic Performance Hypothesis Testing System
 * Main Orchestrator & UI Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let currentStudents = [];
  let filteredStudents = [];
  let currentPage = 1;
  const pageSize = 10;
  let activeTestResult = null;
  let activeSampleContext = {};

  // DOM Elements Initialization
  const navLinks = document.querySelectorAll('.nav-link-item');
  const sections = document.querySelectorAll('.section-view');
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const globalSearchInput = document.getElementById('globalSearchInput');

  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    StorageModule.initStorage();
    loadStudentData();
    setupNavigation();
    setupEventListeners();
    updateDashboardStats();
    renderAnalysisHistory();
    initLearningMath();
  }

  function loadStudentData() {
    currentStudents = StorageModule.getStudents();
    filteredStudents = [...currentStudents];
    renderStudentTable();
    updateDashboardStats();
    updateDataSummaryBadges();
  }

  function updateDataSummaryBadges() {
    const badge = document.getElementById('datasetBadgeCount');
    if (badge) badge.innerText = `${currentStudents.length} Students`;
  }

  // ==========================================
  // NAVIGATION ROUTING
  // ==========================================
  function setupNavigation() {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-target');
        switchSection(targetSection);

        // On mobile, close sidebar after clicking nav link
        if (window.innerWidth <= 991 && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    });

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Direct button route links (e.g. from hero banner)
    document.querySelectorAll('[data-route]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const route = btn.getAttribute('data-route');
        switchSection(route);
      });
    });
  }

  function switchSection(targetId) {
    navLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    const activeLink = document.querySelector(`.nav-link-item[data-target="${targetId}"]`);
    if (activeLink) activeLink.classList.add('active');

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Trigger section-specific renders
      if (targetId === 'dashboard') {
        updateDashboardStats();
      } else if (targetId === 'academic-analysis') {
        runAcademicAnalysis();
      } else if (targetId === 'visualizations') {
        ChartsModule.renderDashboardCharts(currentStudents);
        if (activeTestResult) {
          ChartsModule.renderDistributionCurve(activeTestResult);
        }
      } else if (targetId === 'analysis-history') {
        renderAnalysisHistory();
      }
    }
  }

  // ==========================================
  // DASHBOARD CALCULATIONS & CHARTS
  // ==========================================
  function updateDashboardStats() {
    if (!currentStudents || currentStudents.length === 0) return;

    const totalStudents = currentStudents.length;
    const y1Count = currentStudents.filter(s => s.academicYear === '2025-2026').length;
    const y2Count = currentStudents.filter(s => s.academicYear === '2026-2027').length;

    const allPercentages = currentStudents.map(s => s.percentage);
    const avgMarks = StatisticsModule.calculateMean(allPercentages);
    const { min: lowestMarks, max: highestMarks } = StatisticsModule.calculateRange(allPercentages);

    const passCount = currentStudents.filter(s => s.result === 'PASS').length;
    const passRate = (passCount / totalStudents) * 100;

    const allAttendances = currentStudents.map(s => s.attendance);
    const avgAttendance = StatisticsModule.calculateMean(allAttendances);

    // Update DOM Stat Cards
    const elTotal = document.getElementById('dashTotalStudents');
    if (elTotal) elTotal.innerText = totalStudents;

    const elY1 = document.getElementById('dashY1Students');
    if (elY1) elY1.innerText = y1Count;

    const elY2 = document.getElementById('dashY2Students');
    if (elY2) elY2.innerText = y2Count;

    const elAvg = document.getElementById('dashAvgMarks');
    if (elAvg) elAvg.innerText = `${avgMarks.toFixed(2)}%`;

    const elHigh = document.getElementById('dashHighMarks');
    if (elHigh) elHigh.innerText = `${highestMarks}%`;

    const elLow = document.getElementById('dashLowMarks');
    if (elLow) elLow.innerText = `${lowestMarks}%`;

    const elPass = document.getElementById('dashPassRate');
    if (elPass) elPass.innerText = `${passRate.toFixed(1)}%`;

    const elAtt = document.getElementById('dashAvgAttendance');
    if (elAtt) elAtt.innerText = `${avgAttendance.toFixed(1)}%`;

    // Render Dashboard Charts
    ChartsModule.renderDashboardCharts(currentStudents);
  }

  // ==========================================
  // STUDENT DATA MANAGEMENT (CRUD & TABLE)
  // ==========================================
  function renderStudentTable() {
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) return;

    if (filteredStudents.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="15" class="text-center py-5 text-muted">
            <i class="fas fa-search fa-3x mb-3 text-secondary opacity-50"></i>
            <p class="fs-6 mb-1">No student records found matching the current criteria.</p>
            <small>Try resetting filters or adding new student records.</small>
          </td>
        </tr>
      `;
      renderPagination(0);
      return;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = filteredStudents.slice(startIndex, startIndex + pageSize);

    tableBody.innerHTML = paginatedItems.map(student => {
      const deptBadgeClass = getDeptBadgeClass(student.department);
      const gradeBadgeClass = getGradeBadgeClass(student.grade);
      const resultBadgeClass = student.result === 'PASS' ? 'badge-pass' : 'badge-fail';

      return `
        <tr>
          <td><strong class="text-primary">${student.studentId}</strong></td>
          <td>
            <div class="fw-bold">${student.name}</div>
            <small class="text-muted">${student.gender}, ${student.age} yrs</small>
          </td>
          <td><span class="badge bg-light text-dark border">${student.academicYear}</span></td>
          <td><span class="badge-dept ${deptBadgeClass}">${student.department}</span></td>
          <td>${student.section} (Sem ${student.semester})</td>
          <td>${student.mathematics}</td>
          <td>${student.programming}</td>
          <td>${student.statistics}</td>
          <td>${student.database}</td>
          <td>${student.ai}</td>
          <td><strong>${student.totalMarks}</strong>/500</td>
          <td><strong>${student.percentage}%</strong></td>
          <td><span class="badge-grade ${gradeBadgeClass}">${student.grade}</span></td>
          <td><span class="${resultBadgeClass}">${student.result}</span></td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary btn-sm btn-edit-student" data-id="${student.studentId}" title="Edit Student">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm btn-delete-student" data-id="${student.studentId}" title="Delete Student">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    renderPagination(filteredStudents.length);
    attachStudentActionButtons();
  }

  function getDeptBadgeClass(dept) {
    switch (dept) {
      case 'CSE-AIML': return 'badge-dept-aiml';
      case 'CSE': return 'badge-dept-cse';
      case 'ECE': return 'badge-dept-ece';
      case 'EEE': return 'badge-dept-eee';
      case 'IT': return 'badge-dept-it';
      default: return 'badge-dept-cse';
    }
  }

  function getGradeBadgeClass(grade) {
    switch (grade) {
      case 'A+': return 'grade-aplus';
      case 'A': return 'grade-a';
      case 'B+': return 'grade-bplus';
      case 'B': return 'grade-b';
      case 'C': return 'grade-c';
      case 'D': return 'grade-d';
      case 'F': return 'grade-f';
      default: return 'grade-c';
    }
  }

  function renderPagination(totalCount) {
    const paginationContainer = document.getElementById('studentPagination');
    const paginationInfo = document.getElementById('studentPaginationInfo');
    if (!paginationContainer || !paginationInfo) return;

    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const start = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);

    paginationInfo.innerText = `Showing ${start} to ${end} of ${totalCount} records`;

    let html = '';
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" data-page="${currentPage - 1}">Previous</button>
    </li>`;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>`;
    }

    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <button class="page-link" data-page="${currentPage + 1}">Next</button>
    </li>`;

    paginationContainer.innerHTML = html;

    paginationContainer.querySelectorAll('.page-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'));
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          renderStudentTable();
        }
      });
    });
  }

  function attachStudentActionButtons() {
    document.querySelectorAll('.btn-edit-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditStudentModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDeleteStudentModal(id);
      });
    });
  }

  // ==========================================
  // FILTERS & SEARCH
  // ==========================================
  function applyStudentFilters() {
    const searchVal = (document.getElementById('studentTableSearch')?.value || '').toLowerCase().trim();
    const yearVal = document.getElementById('filterYear')?.value || 'ALL';
    const deptVal = document.getElementById('filterDept')?.value || 'ALL';
    const sectionVal = document.getElementById('filterSection')?.value || 'ALL';
    const gradeVal = document.getElementById('filterGrade')?.value || 'ALL';
    const resultVal = document.getElementById('filterResult')?.value || 'ALL';
    const sortVal = document.getElementById('sortBy')?.value || 'DEFAULT';

    filteredStudents = currentStudents.filter(student => {
      // Global Search Match
      const matchesSearch = !searchVal || 
        student.studentId.toLowerCase().includes(searchVal) ||
        student.name.toLowerCase().includes(searchVal) ||
        student.department.toLowerCase().includes(searchVal);

      // Filters Match
      const matchesYear = yearVal === 'ALL' || student.academicYear === yearVal;
      const matchesDept = deptVal === 'ALL' || student.department === deptVal;
      const matchesSection = sectionVal === 'ALL' || student.section === sectionVal;
      const matchesGrade = gradeVal === 'ALL' || student.grade === gradeVal;
      const matchesResult = resultVal === 'ALL' || student.result === resultVal;

      return matchesSearch && matchesYear && matchesDept && matchesSection && matchesGrade && matchesResult;
    });

    // Sorting
    if (sortVal === 'PERCENT_DESC') {
      filteredStudents.sort((a, b) => b.percentage - a.percentage);
    } else if (sortVal === 'PERCENT_ASC') {
      filteredStudents.sort((a, b) => a.percentage - b.percentage);
    } else if (sortVal === 'NAME_ASC') {
      filteredStudents.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'NAME_DESC') {
      filteredStudents.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortVal === 'ID_ASC') {
      filteredStudents.sort((a, b) => a.studentId.localeCompare(b.studentId));
    }

    currentPage = 1;
    renderStudentTable();
  }

  // ==========================================
  // ADD & EDIT STUDENT MODALS
  // ==========================================
  function openAddStudentModal() {
    const form = document.getElementById('studentForm');
    form.reset();
    document.getElementById('studentModalTitle').innerText = 'Add New Student Record';
    document.getElementById('studentIdInput').removeAttribute('readonly');
    document.getElementById('studentFormMode').value = 'ADD';

    // Suggest auto-generated ID based on current year count
    const nextNum = currentStudents.length + 1;
    document.getElementById('studentIdInput').value = `STU2026-${String(nextNum).padStart(3, '0')}`;

    const modal = new bootstrap.Modal(document.getElementById('studentModal'));
    modal.show();
  }

  function openEditStudentModal(studentId) {
    const student = currentStudents.find(s => s.studentId === studentId);
    if (!student) return;

    document.getElementById('studentModalTitle').innerText = `Edit Student: ${student.studentId}`;
    document.getElementById('studentFormMode').value = 'EDIT';
    const idInput = document.getElementById('studentIdInput');
    idInput.value = student.studentId;
    idInput.setAttribute('readonly', 'true');

    document.getElementById('studentNameInput').value = student.name;
    document.getElementById('studentYearInput').value = student.academicYear;
    document.getElementById('studentDeptInput').value = student.department;
    document.getElementById('studentSectionInput').value = student.section;
    document.getElementById('studentSemInput').value = student.semester;
    document.getElementById('studentGenderInput').value = student.gender;
    document.getElementById('studentAgeInput').value = student.age;
    document.getElementById('studentAttendanceInput').value = student.attendance;

    document.getElementById('studentMathInput').value = student.mathematics;
    document.getElementById('studentProgInput').value = student.programming;
    document.getElementById('studentStatsInput').value = student.statistics;
    document.getElementById('studentDbmsInput').value = student.database;
    document.getElementById('studentAiInput').value = student.ai;

    const modal = new bootstrap.Modal(document.getElementById('studentModal'));
    modal.show();
  }

  function saveStudentForm(e) {
    e.preventDefault();

    const mode = document.getElementById('studentFormMode').value;
    const studentId = document.getElementById('studentIdInput').value.trim();
    const name = document.getElementById('studentNameInput').value.trim();
    const academicYear = document.getElementById('studentYearInput').value;
    const department = document.getElementById('studentDeptInput').value;
    const section = document.getElementById('studentSectionInput').value;
    const semester = parseInt(document.getElementById('studentSemInput').value, 10);
    const gender = document.getElementById('studentGenderInput').value;
    const age = parseInt(document.getElementById('studentAgeInput').value, 10);
    const attendance = parseFloat(document.getElementById('studentAttendanceInput').value);

    const math = parseFloat(document.getElementById('studentMathInput').value);
    const prog = parseFloat(document.getElementById('studentProgInput').value);
    const stats = parseFloat(document.getElementById('studentStatsInput').value);
    const dbms = parseFloat(document.getElementById('studentDbmsInput').value);
    const ai = parseFloat(document.getElementById('studentAiInput').value);

    // Real-time validations
    if (!studentId || !name) {
      showToast('Please enter a valid Student ID and Name.', 'danger');
      return;
    }
    if ([math, prog, stats, dbms, ai].some(m => isNaN(m) || m < 0 || m > 100)) {
      showToast('All subject marks must be valid numbers between 0 and 100.', 'danger');
      return;
    }
    if (isNaN(attendance) || attendance < 0 || attendance > 100) {
      showToast('Attendance must be between 0% and 100%.', 'danger');
      return;
    }

    // Calculations
    const totalMarks = math + prog + stats + dbms + ai;
    const percentage = parseFloat((totalMarks / 5).toFixed(2));
    const grade = StudentDataModule.calculateGrade(percentage);
    const result = StudentDataModule.calculateResult(math, prog, stats, dbms, ai);

    const studentRecord = {
      studentId,
      name,
      academicYear,
      department,
      section,
      semester,
      gender,
      age,
      attendance,
      mathematics: math,
      programming: prog,
      statistics: stats,
      database: dbms,
      ai: ai,
      totalMarks,
      percentage,
      grade,
      result
    };

    try {
      if (mode === 'ADD') {
        StorageModule.addStudent(studentRecord);
        showToast(`Student ${studentRecord.studentId} successfully added!`, 'success');
      } else {
        StorageModule.updateStudent(studentId, studentRecord);
        showToast(`Student ${studentRecord.studentId} successfully updated!`, 'success');
      }

      bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
      loadStudentData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }

  let studentToDeleteId = null;
  function openDeleteStudentModal(id) {
    studentToDeleteId = id;
    const modalEl = document.getElementById('deleteConfirmModal');
    document.getElementById('deleteStudentIdDisplay').innerText = id;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  function confirmDeleteStudent() {
    if (!studentToDeleteId) return;
    try {
      StorageModule.deleteStudent(studentToDeleteId);
      showToast(`Student ${studentToDeleteId} removed.`, 'warning');
      studentToDeleteId = null;
      bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
      loadStudentData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }

  // ==========================================
  // DATA RETRIEVAL & QUERY ENGINE
  // ==========================================
  function runDataRetrieval() {
    const year = document.getElementById('retrievalYear').value;
    const dept = document.getElementById('retrievalDept').value;
    const subject = document.getElementById('retrievalSubject').value;
    const minPercent = parseFloat(document.getElementById('retrievalMinPercent').value) || 0;
    const maxPercent = parseFloat(document.getElementById('retrievalMaxPercent').value) || 100;
    const minAttendance = parseFloat(document.getElementById('retrievalMinAttendance').value) || 0;

    const matched = currentStudents.filter(s => {
      const matchYear = year === 'ALL' || s.academicYear === year;
      const matchDept = dept === 'ALL' || s.department === dept;
      const matchPercent = s.percentage >= minPercent && s.percentage <= maxPercent;
      const matchAtt = s.attendance >= minAttendance;
      return matchYear && matchDept && matchPercent && matchAtt;
    });

    const resultBox = document.getElementById('retrievalResultsBox');
    resultBox.classList.remove('d-none');

    // Calculate metrics for matched records
    const count = matched.length;
    document.getElementById('retrievalFoundCount').innerText = `${count} Students Found`;

    if (count > 0) {
      let targetValues = [];
      if (subject === 'overall') {
        targetValues = matched.map(s => s.percentage);
      } else {
        targetValues = matched.map(s => s[subject]);
      }

      const summary = StatisticsModule.getDescriptiveSummary(targetValues);

      document.getElementById('retrievalAvg').innerText = `${summary.mean.toFixed(2)}`;
      document.getElementById('retrievalHighest').innerText = `${summary.max}`;
      document.getElementById('retrievalLowest').innerText = `${summary.min}`;
      document.getElementById('retrievalSd').innerText = `${summary.stdDev.toFixed(2)}`;

      // Populate Quick Table
      const tableBody = document.getElementById('retrievalTableBody');
      tableBody.innerHTML = matched.slice(0, 15).map(s => `
        <tr>
          <td><strong>${s.studentId}</strong></td>
          <td>${s.name}</td>
          <td>${s.academicYear}</td>
          <td>${s.department}</td>
          <td>${s.attendance}%</td>
          <td><strong>${s.percentage}%</strong></td>
          <td><span class="${s.result === 'PASS' ? 'badge-pass' : 'badge-fail'}">${s.result}</span></td>
        </tr>
      `).join('');

      if (count > 15) {
        document.getElementById('retrievalTableNote').innerText = `Showing first 15 of ${count} matching records.`;
      } else {
        document.getElementById('retrievalTableNote').innerText = `Showing all ${count} matching records.`;
      }
    } else {
      document.getElementById('retrievalAvg').innerText = '0';
      document.getElementById('retrievalHighest').innerText = '0';
      document.getElementById('retrievalLowest').innerText = '0';
      document.getElementById('retrievalSd').innerText = '0';
      document.getElementById('retrievalTableBody').innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-3 text-muted">No records match these criteria.</td>
        </tr>
      `;
    }
  }

  // ==========================================
  // ACADEMIC ANALYSIS TAB
  // ==========================================
  function runAcademicAnalysis() {
    const scope = document.getElementById('analysisScope')?.value || 'ALL';
    let targetStudents = [...currentStudents];

    if (scope === '2025-2026' || scope === '2026-2027') {
      targetStudents = currentStudents.filter(s => s.academicYear === scope);
    } else if (scope.startsWith('DEPT_')) {
      const dept = scope.replace('DEPT_', '');
      targetStudents = currentStudents.filter(s => s.department === dept);
    }

    if (targetStudents.length === 0) return;

    const overallPercentages = targetStudents.map(s => s.percentage);
    const overallStats = StatisticsModule.getDescriptiveSummary(overallPercentages);

    const mathStats = StatisticsModule.getDescriptiveSummary(targetStudents.map(s => s.mathematics));
    const progStats = StatisticsModule.getDescriptiveSummary(targetStudents.map(s => s.programming));
    const statsStats = StatisticsModule.getDescriptiveSummary(targetStudents.map(s => s.statistics));
    const dbmsStats = StatisticsModule.getDescriptiveSummary(targetStudents.map(s => s.database));
    const aiStats = StatisticsModule.getDescriptiveSummary(targetStudents.map(s => s.ai));

    // Update KPI cards in Academic Analysis
    document.getElementById('statMean').innerText = overallStats.mean.toFixed(2);
    document.getElementById('statMedian').innerText = overallStats.median.toFixed(2);
    document.getElementById('statMode').innerText = overallStats.mode;
    document.getElementById('statStdDev').innerText = overallStats.stdDev.toFixed(2);
    document.getElementById('statVariance').innerText = overallStats.variance.toFixed(2);
    document.getElementById('statRange').innerText = `${overallStats.min} - ${overallStats.max} (${overallStats.range})`;

    const passCount = targetStudents.filter(s => s.result === 'PASS').length;
    const passRate = ((passCount / targetStudents.length) * 100).toFixed(1);
    document.getElementById('statPassRate').innerText = `${passRate}%`;
    document.getElementById('statFailRate').innerText = `${(100 - passRate).toFixed(1)}%`;

    // Render Subject-wise chart
    ChartsModule.renderAnalyticsSubjectChart({
      math: mathStats,
      prog: progStats,
      stats: statsStats,
      dbms: dbmsStats,
      ai: aiStats
    });

    // Populate Subject Breakdown Table
    const subTableBody = document.getElementById('subjectStatsTableBody');
    if (subTableBody) {
      const rows = [
        { name: 'Mathematics', stats: mathStats, passRate: ((targetStudents.filter(s => s.mathematics >= 40).length / targetStudents.length) * 100).toFixed(1) },
        { name: 'Programming', stats: progStats, passRate: ((targetStudents.filter(s => s.programming >= 40).length / targetStudents.length) * 100).toFixed(1) },
        { name: 'Statistics', stats: statsStats, passRate: ((targetStudents.filter(s => s.statistics >= 40).length / targetStudents.length) * 100).toFixed(1) },
        { name: 'Database Management (DBMS)', stats: dbmsStats, passRate: ((targetStudents.filter(s => s.database >= 40).length / targetStudents.length) * 100).toFixed(1) },
        { name: 'Artificial Intelligence (AI)', stats: aiStats, passRate: ((targetStudents.filter(s => s.ai >= 40).length / targetStudents.length) * 100).toFixed(1) }
      ];

      subTableBody.innerHTML = rows.map(r => `
        <tr>
          <td><strong>${r.name}</strong></td>
          <td>${r.stats.mean.toFixed(2)}</td>
          <td>${r.stats.max}</td>
          <td>${r.stats.min}</td>
          <td>${r.stats.stdDev.toFixed(2)}</td>
          <td>${r.stats.variance.toFixed(2)}</td>
          <td><span class="badge-pass">${r.passRate}%</span></td>
        </tr>
      `).join('');
    }

    // 2-Year Direct Comparison Metrics
    updateTwoYearComparisonSection();
  }

  function updateTwoYearComparisonSection() {
    const y1Students = currentStudents.filter(s => s.academicYear === '2025-2026');
    const y2Students = currentStudents.filter(s => s.academicYear === '2026-2027');

    if (y1Students.length === 0 || y2Students.length === 0) return;

    const y1Mean = StatisticsModule.calculateMean(y1Students.map(s => s.percentage));
    const y2Mean = StatisticsModule.calculateMean(y2Students.map(s => s.percentage));
    const diff = y2Mean - y1Mean;

    const y1Sd = StatisticsModule.calculateStdDev(y1Students.map(s => s.percentage));
    const y2Sd = StatisticsModule.calculateStdDev(y2Students.map(s => s.percentage));

    const y1Pass = (y1Students.filter(s => s.result === 'PASS').length / y1Students.length) * 100;
    const y2Pass = (y2Students.filter(s => s.result === 'PASS').length / y2Students.length) * 100;

    const y1Att = StatisticsModule.calculateMean(y1Students.map(s => s.attendance));
    const y2Att = StatisticsModule.calculateMean(y2Students.map(s => s.attendance));

    document.getElementById('compY1Avg').innerText = `${y1Mean.toFixed(2)}%`;
    document.getElementById('compY2Avg').innerText = `${y2Mean.toFixed(2)}%`;
    
    const diffEl = document.getElementById('compDiffAvg');
    diffEl.innerText = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%`;
    diffEl.className = diff >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold';

    document.getElementById('compY1Sd').innerText = y1Sd.toFixed(2);
    document.getElementById('compY2Sd').innerText = y2Sd.toFixed(2);
    document.getElementById('compY1Pass').innerText = `${y1Pass.toFixed(1)}%`;
    document.getElementById('compY2Pass').innerText = `${y2Pass.toFixed(1)}%`;
    document.getElementById('compY1Att').innerText = `${y1Att.toFixed(1)}%`;
    document.getElementById('compY2Att').innerText = `${y2Att.toFixed(1)}%`;
  }

  // ==========================================
  // HYPOTHESIS TESTING MODULE
  // ==========================================
  function runHypothesisTestHandler() {
    try {
      const popMean = document.getElementById('hypoPopMean').value;
      const sampleMean = document.getElementById('hypoSampleMean').value;
      const sampleSd = document.getElementById('hypoSampleSd').value;
      const popSd = document.getElementById('hypoPopSd').value;
      const sampleSize = document.getElementById('hypoSampleSize').value;
      const alpha = document.getElementById('hypoAlpha').value;
      const testType = document.getElementById('hypoTestType').value;

      const result = HypothesisModule.runHypothesisTest({
        popMean,
        sampleMean,
        sampleSd,
        popSd,
        sampleSize,
        alpha,
        testType
      });

      activeTestResult = result;
      displayHypothesisResult(result);
      showToast(`Hypothesis Test completed: ${result.decision}`, result.isReject ? 'danger' : 'success');

      // Scroll to result
      document.getElementById('hypothesisResultContainer').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      showToast(err.message, 'danger');
    }
  }

  function displayHypothesisResult(res) {
    const container = document.getElementById('hypothesisResultContainer');
    container.classList.remove('d-none');

    // Header styling
    const header = document.getElementById('hypoResHeader');
    header.className = `hypothesis-header ${res.isReject ? 'header-reject' : 'header-fail-reject'}`;
    document.getElementById('hypoResTestName').innerText = res.testName;
    document.getElementById('hypoResSigStatus').innerText = res.significanceStatus;

    // Decision Banner
    const banner = document.getElementById('hypoResBanner');
    banner.className = `decision-banner ${res.isReject ? 'decision-banner-reject' : 'decision-banner-fail'}`;
    document.getElementById('hypoResDecision').innerText = res.decision;
    document.getElementById('hypoResDecisionReason').innerText = res.isReject
      ? `P-Value (${res.pValue}) ≤ α (${res.alpha}) → Reject H₀`
      : `P-Value (${res.pValue}) > α (${res.alpha}) → Fail to Reject H₀`;

    // Numerical stats boxes
    document.getElementById('hypoResPopMean').innerText = res.popMean;
    document.getElementById('hypoResSampleMean').innerText = res.sampleMean;
    document.getElementById('hypoResSd').innerText = res.popSd ? `${res.popSd} (σ)` : `${res.sampleSd} (s)`;
    document.getElementById('hypoResSampleSize').innerText = res.sampleSize;
    document.getElementById('hypoResStandardError').innerText = res.standardError;
    document.getElementById('hypoResDf').innerText = res.df !== null ? res.df : 'N/A (Z-test)';
    document.getElementById('hypoResTestStat').innerText = res.testStatistic;
    document.getElementById('hypoResCritVal').innerText = res.criticalValue;
    document.getElementById('hypoResPVal').innerText = res.pValue;
    document.getElementById('hypoResAlpha').innerText = `${res.alpha} (${(res.alpha * 100).toFixed(0)}%)`;

    // Hypotheses strings
    document.getElementById('hypoResNullHypo').innerText = res.nullHypothesis;
    document.getElementById('hypoResAltHypo').innerText = res.altHypothesis;

    // Reason & Conclusion
    document.getElementById('hypoResSelectionReason').innerText = res.testSelectionReason;
    document.getElementById('hypoResConclusion').innerText = res.conclusion;

    // Render distribution curve graph
    ChartsModule.renderDistributionCurve(res);
  }

  // ==========================================
  // SAMPLE FROM DATABASE MODAL & LOADER
  // ==========================================
  function generateDatabaseSample() {
    const year = document.getElementById('dbSampleYear').value;
    const dept = document.getElementById('dbSampleDept').value;
    const subject = document.getElementById('dbSampleSubject').value;
    const selectionMethod = document.getElementById('dbSampleMethod').value;
    const sampleSizeInput = parseInt(document.getElementById('dbSampleSize').value, 10);

    if (isNaN(sampleSizeInput) || sampleSizeInput < 2) {
      showToast('Sample size must be at least 2.', 'danger');
      return;
    }

    let matching = currentStudents.filter(s => {
      const matchYear = year === 'ALL' || s.academicYear === year;
      const matchDept = dept === 'ALL' || s.department === dept;
      return matchYear && matchDept;
    });

    if (matching.length < 2) {
      showToast('Not enough students found in database with the selected filters.', 'danger');
      return;
    }

    let selectedStudents = [];
    if (selectionMethod === 'FIRST_N') {
      selectedStudents = matching.slice(0, sampleSizeInput);
    } else if (selectionMethod === 'RANDOM_N') {
      const shuffled = [...matching].sort(() => 0.5 - Math.random());
      selectedStudents = shuffled.slice(0, Math.min(sampleSizeInput, matching.length));
    } else {
      // ALL MATCHING
      selectedStudents = matching;
    }

    if (selectedStudents.length < 2) {
      showToast('Selected sample must contain at least 2 students.', 'danger');
      return;
    }

    // Extract subject/metric values
    let sampleValues = [];
    let subjectName = '';
    if (subject === 'overall') {
      sampleValues = selectedStudents.map(s => s.percentage);
      subjectName = 'Overall Percentage';
    } else {
      sampleValues = selectedStudents.map(s => s[subject]);
      subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
    }

    const summary = StatisticsModule.getDescriptiveSummary(sampleValues);

    // Populate Hypothesis Inputs
    document.getElementById('hypoSampleMean').value = summary.mean.toFixed(2);
    document.getElementById('hypoSampleSd').value = summary.stdDev.toFixed(2);
    document.getElementById('hypoSampleSize').value = summary.count;
    document.getElementById('hypoPopSd').value = ''; // Unknown population SD when drawn from sample

    activeSampleContext = {
      source: 'Student Database Extraction',
      year: year === 'ALL' ? '2025-2027 (Both Years)' : year,
      dept: dept === 'ALL' ? 'All Departments' : dept,
      subject: subjectName,
      sampleSize: summary.count
    };

    bootstrap.Modal.getInstance(document.getElementById('sampleDatabaseModal')).hide();
    showToast(`Successfully extracted sample (n = ${summary.count}, x̄ = ${summary.mean.toFixed(2)}, s = ${summary.stdDev.toFixed(2)}) from Database!`, 'success');
  }

  // ==========================================
  // RAW SAMPLE DATA PARSER
  // ==========================================
  function parseRawSampleDataHandler() {
    const rawInput = document.getElementById('rawSampleDataInput').value;
    const numbers = StatisticsModule.parseRawData(rawInput);

    if (numbers.length < 2) {
      showToast('Please enter at least 2 valid numeric values separated by commas.', 'danger');
      return;
    }

    const summary = StatisticsModule.getDescriptiveSummary(numbers);

    document.getElementById('hypoSampleMean').value = summary.mean.toFixed(2);
    document.getElementById('hypoSampleSd').value = summary.stdDev.toFixed(2);
    document.getElementById('hypoSampleSize').value = summary.count;

    activeSampleContext = {
      source: 'Manual Raw Data Entry',
      year: 'User Input',
      dept: 'Custom',
      subject: 'Sample Series',
      sampleSize: summary.count
    };

    document.getElementById('rawSampleStatsDisplay').innerHTML = `
      <div class="alert alert-info py-2 px-3 mb-0 small">
        <strong>Calculated Sample Stats:</strong> n = ${summary.count} | Mean (x̄) = ${summary.mean.toFixed(2)} | SD (s) = ${summary.stdDev.toFixed(2)} | Variance (s²) = ${summary.variance.toFixed(2)}
      </div>
    `;

    showToast(`Calculated stats for ${summary.count} data points!`, 'success');
  }

  // ==========================================
  // PRESET EXAMPLES LOADER
  // ==========================================
  function loadPresetExample(exampleId) {
    switch (exampleId) {
      case 'ex1':
        // Example 1: Two-Tailed Test (T-Test)
        document.getElementById('hypoPopMean').value = 70;
        document.getElementById('hypoSampleMean').value = 73;
        document.getElementById('hypoSampleSd').value = 8;
        document.getElementById('hypoPopSd').value = '';
        document.getElementById('hypoSampleSize').value = 36;
        document.getElementById('hypoAlpha').value = '0.05';
        document.getElementById('hypoTestType').value = 'two-tailed';
        break;

      case 'ex2':
        // Example 2: Right-Tailed Test
        document.getElementById('hypoPopMean').value = 65;
        document.getElementById('hypoSampleMean').value = 68;
        document.getElementById('hypoSampleSd').value = 7;
        document.getElementById('hypoPopSd').value = '';
        document.getElementById('hypoSampleSize').value = 40;
        document.getElementById('hypoAlpha').value = '0.05';
        document.getElementById('hypoTestType').value = 'right-tailed';
        break;

      case 'ex3':
        // Example 3: Left-Tailed Test
        document.getElementById('hypoPopMean').value = 75;
        document.getElementById('hypoSampleMean').value = 72;
        document.getElementById('hypoSampleSd').value = 9;
        document.getElementById('hypoPopSd').value = '';
        document.getElementById('hypoSampleSize').value = 30;
        document.getElementById('hypoAlpha').value = '0.05';
        document.getElementById('hypoTestType').value = 'left-tailed';
        break;

      case 'ex4':
        // Example 4: Z-Test (Known Pop SD)
        document.getElementById('hypoPopMean').value = 70;
        document.getElementById('hypoSampleMean').value = 74;
        document.getElementById('hypoSampleSd').value = '';
        document.getElementById('hypoPopSd').value = 10;
        document.getElementById('hypoSampleSize').value = 64;
        document.getElementById('hypoAlpha').value = '0.05';
        document.getElementById('hypoTestType').value = 'two-tailed';
        break;

      case 'ex5':
        // Example 5: One-Sample T-Test (Small Sample)
        document.getElementById('hypoPopMean').value = 70;
        document.getElementById('hypoSampleMean').value = 74;
        document.getElementById('hypoSampleSd').value = 8;
        document.getElementById('hypoPopSd').value = '';
        document.getElementById('hypoSampleSize').value = 16;
        document.getElementById('hypoAlpha').value = '0.05';
        document.getElementById('hypoTestType').value = 'two-tailed';
        break;
    }

    switchSection('hypothesis-testing');
    runHypothesisTestHandler();
    showToast(`Loaded ${exampleId.toUpperCase()} configuration!`, 'info');
  }

  // ==========================================
  // ANALYSIS HISTORY (SAVED ANALYSES)
  // ==========================================
  function saveCurrentAnalysis() {
    if (!activeTestResult) {
      showToast('Please run a hypothesis test first before saving.', 'warning');
      return;
    }

    const saved = StorageModule.saveAnalysis({
      ...activeTestResult,
      context: activeSampleContext
    });

    renderAnalysisHistory();
    showToast(`Analysis saved to history! (ID: ${saved.id})`, 'success');
  }

  function renderAnalysisHistory() {
    const historyTable = document.getElementById('analysisHistoryTableBody');
    if (!historyTable) return;

    const analyses = StorageModule.getSavedAnalyses();
    if (analyses.length === 0) {
      historyTable.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-4 text-muted">
            <i class="fas fa-history fa-2x mb-2 text-secondary opacity-50"></i>
            <p class="mb-0">No saved hypothesis test records found.</p>
          </td>
        </tr>
      `;
      return;
    }

    historyTable.innerHTML = analyses.map(a => `
      <tr>
        <td><small class="text-muted">${a.timestamp}</small></td>
        <td><strong>${a.testName}</strong></td>
        <td><span class="badge bg-light text-dark border">${a.testType}</span></td>
        <td>μ₀ = ${a.popMean}, x̄ = ${a.sampleMean} (n = ${a.sampleSize})</td>
        <td>α = ${a.alpha}</td>
        <td><strong>${a.testStatistic}</strong></td>
        <td>${a.pValue}</td>
        <td><span class="${a.isReject ? 'badge-fail' : 'badge-pass'}">${a.decision}</span></td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary btn-sm btn-view-analysis" data-id="${a.id}" title="View Analysis">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm btn-delete-analysis" data-id="${a.id}" title="Delete Record">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach actions
    document.querySelectorAll('.btn-view-analysis').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const selected = analyses.find(x => x.id === id);
        if (selected) {
          activeTestResult = selected;
          activeSampleContext = selected.context || {};
          switchSection('hypothesis-testing');
          displayHypothesisResult(selected);
        }
      });
    });

    document.querySelectorAll('.btn-delete-analysis').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        StorageModule.deleteAnalysis(id);
        renderAnalysisHistory();
        showToast('Saved analysis record deleted.', 'warning');
      });
    });
  }

  // ==========================================
  // UTILITY CALCULATORS
  // ==========================================
  function runSampleSizeCalculator() {
    const conf = parseFloat(document.getElementById('calcConfLevel').value);
    const moe = parseFloat(document.getElementById('calcMoe').value);
    const popSd = parseFloat(document.getElementById('calcPopSd').value);

    if (moe <= 0 || popSd <= 0) {
      showToast('Margin of Error and Population SD must be greater than 0.', 'danger');
      return;
    }

    const n = StatisticsModule.calculateSampleSize(conf, moe, popSd);
    document.getElementById('calcSampleSizeResult').innerHTML = `
      <div class="alert alert-success mt-3 mb-0">
        <h5 class="fw-bold mb-1"><i class="fas fa-check-circle me-1"></i> Recommended Sample Size: n = ${n}</h5>
        <small class="text-muted">Formula: n = ((Z_α/2 · σ) / E)² with Z = ${conf === 0.99 ? '2.576' : conf === 0.95 ? '1.960' : '1.645'}, σ = ${popSd}, E = ${moe}</small>
      </div>
    `;
  }

  function runDescriptiveCalc() {
    const raw = document.getElementById('descCalcInput').value;
    const nums = StatisticsModule.parseRawData(raw);

    if (nums.length === 0) {
      showToast('Please enter valid numbers.', 'danger');
      return;
    }

    const s = StatisticsModule.getDescriptiveSummary(nums);
    document.getElementById('descCalcResult').innerHTML = `
      <div class="row g-2 mt-2">
        <div class="col-4"><div class="stat-box"><span class="stat-box-label">Count (n)</span><div class="stat-box-val">${s.count}</div></div></div>
        <div class="col-4"><div class="stat-box"><span class="stat-box-label">Mean (x̄)</span><div class="stat-box-val">${s.mean.toFixed(2)}</div></div></div>
        <div class="col-4"><div class="stat-box"><span class="stat-box-label">Median</span><div class="stat-box-val">${s.median.toFixed(2)}</div></div></div>
        <div class="col-4"><div class="stat-box"><span class="stat-box-label">Mode</span><div class="stat-box-val">${s.mode}</div></div></div>
        <div class="col-4"><div class="stat-box"><span class="stat-box-label">Std Dev (s)</span><div class="stat-box-val">${s.stdDev.toFixed(2)}</div></div></div>
        <div class="col-4"><div class="stat-box"><span class="stat-box-label">Variance (s²)</span><div class="stat-box-val">${s.variance.toFixed(2)}</div></div></div>
        <div class="col-4"><div class="stat-box"><span class="stat-box-label">Min</span><div class="stat-box-val">${s.min}</div></div></div>
        <div class="col-4"><div class="stat-box"><span class="stat-box-label">Max</span><div class="stat-box-val">${s.max}</div></div></div>
        <div class="col-4"><div class="stat-box"><span class="stat-box-label">Range</span><div class="stat-box-val">${s.range}</div></div></div>
      </div>
    `;
  }

  // ==========================================
  // EVENT LISTENERS BINDING
  // ==========================================
  function setupEventListeners() {
    // Global Search Input
    if (globalSearchInput) {
      globalSearchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const searchInputTable = document.getElementById('studentTableSearch');
        if (searchInputTable) searchInputTable.value = val;
        switchSection('student-data');
        applyStudentFilters();
      });
    }

    // Student Filter Controls
    ['studentTableSearch', 'filterYear', 'filterDept', 'filterSection', 'filterGrade', 'filterResult', 'sortBy'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', applyStudentFilters);
        el.addEventListener('change', applyStudentFilters);
      }
    });

    document.getElementById('btnResetFilters')?.addEventListener('click', () => {
      ['studentTableSearch', 'filterYear', 'filterDept', 'filterSection', 'filterGrade', 'filterResult', 'sortBy'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = el.tagName === 'SELECT' ? (id === 'sortBy' ? 'DEFAULT' : 'ALL') : '';
      });
      applyStudentFilters();
    });

    // Student CRUD
    document.getElementById('btnAddStudentModal')?.addEventListener('click', openAddStudentModal);
    document.getElementById('studentForm')?.addEventListener('submit', saveStudentForm);
    document.getElementById('btnConfirmDeleteStudent')?.addEventListener('click', confirmDeleteStudent);

    // Data Retrieval
    document.getElementById('btnRunRetrieval')?.addEventListener('click', runDataRetrieval);

    // Academic Analysis scope change
    document.getElementById('analysisScope')?.addEventListener('change', runAcademicAnalysis);

    // Hypothesis Testing
    document.getElementById('btnRunHypothesisTest')?.addEventListener('click', runHypothesisTestHandler);
    document.getElementById('btnSaveAnalysis')?.addEventListener('click', saveCurrentAnalysis);
    document.getElementById('btnGenerateReport')?.addEventListener('click', () => {
      ReportsModule.printHypothesisReport(activeTestResult, activeSampleContext);
    });

    // Database Sample Selection
    document.getElementById('btnConfirmDbSample')?.addEventListener('click', generateDatabaseSample);

    // Raw Sample Data Parser
    document.getElementById('btnParseRawSample')?.addEventListener('click', parseRawSampleDataHandler);

    // Example Preset Loaders
    document.querySelectorAll('[data-example]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ex = btn.getAttribute('data-example');
        loadPresetExample(ex);
      });
    });

    // Reset Sample Dataset
    document.getElementById('btnResetDataset')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to restore the default 2-year student dataset (200 records)? Any unsaved modifications will be replaced.')) {
        StorageModule.resetSampleDataset();
        loadStudentData();
        showToast('Sample dataset restored successfully!', 'success');
      }
    });

    // Data Exports
    document.getElementById('btnExportStudentCsv')?.addEventListener('click', () => ReportsModule.exportStudentsToCSV(currentStudents));
    document.getElementById('btnExportStudentJson')?.addEventListener('click', () => ReportsModule.exportStudentsToJSON(currentStudents));
    document.getElementById('btnExportAnalysisCsv')?.addEventListener('click', () => ReportsModule.exportAnalysesToCSV(StorageModule.getSavedAnalyses()));
    document.getElementById('btnExportAnalysisJson')?.addEventListener('click', () => ReportsModule.exportAnalysesToJSON(StorageModule.getSavedAnalyses()));
    document.getElementById('btnClearAllAnalyses')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all saved analyses history?')) {
        StorageModule.clearAllAnalyses();
        renderAnalysisHistory();
        showToast('Analysis history cleared.', 'warning');
      }
    });

    // Utility calculators
    document.getElementById('btnCalcSampleSize')?.addEventListener('click', runSampleSizeCalculator);
    document.getElementById('btnCalcDescStats')?.addEventListener('click', runDescriptiveCalc);
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const icon = type === 'success' ? 'fa-check-circle text-success' : type === 'danger' ? 'fa-exclamation-circle text-danger' : 'fa-info-circle text-primary';
    toast.className = `toast-custom toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${icon} fs-5"></i>
      <div class="flex-grow-1 small">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function initLearningMath() {
    // Math display triggers KaTeX if available
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ]
      });
    }
  }

  // Run the app!
  init();
});
