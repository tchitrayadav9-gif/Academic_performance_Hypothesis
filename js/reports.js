/**
 * Academic Performance Hypothesis Testing System
 * Reports & Data Export Module: CSV, JSON, and Formatted Printable Reports
 */

const ReportsModule = (() => {

  /**
   * Download a Blob as a file
   */
  function downloadBlob(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export student dataset to CSV
   */
  function exportStudentsToCSV(students) {
    if (!students || students.length === 0) {
      alert('No student records available to export.');
      return;
    }

    const headers = [
      'Student ID', 'Name', 'Academic Year', 'Department', 'Section', 'Semester',
      'Gender', 'Age', 'Attendance (%)', 'Mathematics', 'Programming', 'Statistics',
      'DBMS', 'AI', 'Total Marks', 'Percentage', 'Grade', 'Result'
    ];

    const rows = students.map(s => [
      `"${s.studentId}"`,
      `"${s.name}"`,
      `"${s.academicYear}"`,
      `"${s.department}"`,
      `"${s.section}"`,
      s.semester,
      `"${s.gender}"`,
      s.age,
      s.attendance,
      s.mathematics,
      s.programming,
      s.statistics,
      s.database,
      s.ai,
      s.totalMarks,
      s.percentage,
      `"${s.grade}"`,
      `"${s.result}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlob(csvContent, `Academic_Students_Dataset_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Export student dataset to JSON
   */
  function exportStudentsToJSON(students) {
    if (!students || students.length === 0) {
      alert('No student records available to export.');
      return;
    }
    const jsonContent = JSON.stringify(students, null, 2);
    downloadBlob(jsonContent, `Academic_Students_Dataset_${Date.now()}.json`, 'application/json;charset=utf-8;');
  }

  /**
   * Export saved hypothesis analyses to CSV
   */
  function exportAnalysesToCSV(analyses) {
    if (!analyses || analyses.length === 0) {
      alert('No saved analyses available to export.');
      return;
    }

    const headers = [
      'ID', 'Timestamp', 'Test Name', 'Test Type', 'Population Mean (mu0)',
      'Sample Mean (x_bar)', 'Standard Deviation', 'Sample Size (n)',
      'Significance Level (alpha)', 'Test Statistic', 'Critical Value',
      'P-Value', 'Decision', 'Significance Status'
    ];

    const rows = analyses.map(a => [
      `"${a.id}"`,
      `"${a.timestamp}"`,
      `"${a.testName}"`,
      `"${a.testType}"`,
      a.popMean,
      a.sampleMean,
      a.popSd || a.sampleSd,
      a.sampleSize,
      a.alpha,
      a.testStatistic,
      a.criticalValue,
      a.pValue,
      `"${a.decision}"`,
      `"${a.significanceStatus}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlob(csvContent, `Hypothesis_Analyses_History_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Export saved hypothesis analyses to JSON
   */
  function exportAnalysesToJSON(analyses) {
    if (!analyses || analyses.length === 0) {
      alert('No saved analyses available to export.');
      return;
    }
    const jsonContent = JSON.stringify(analyses, null, 2);
    downloadBlob(jsonContent, `Hypothesis_Analyses_History_${Date.now()}.json`, 'application/json;charset=utf-8;');
  }

  /**
   * Print Hypothesis Testing Report
   */
  function printHypothesisReport(testResult, sampleContext = {}) {
    if (!testResult) {
      alert('Please perform a hypothesis test first before generating a report.');
      return;
    }

    const modalBody = document.getElementById('reportModalBody');
    if (!modalBody) return;

    const isReject = testResult.isReject;
    const badgeClass = isReject ? 'badge-fail' : 'badge-pass';

    modalBody.innerHTML = `
      <div class="print-report-container p-3">
        <div class="text-center border-bottom pb-3 mb-4">
          <h3 class="fw-bold text-dark mb-1">Academic Performance Hypothesis Testing Report</h3>
          <p class="text-muted mb-0 small">Course: B.Tech AIML Statistics & Data Analytics | Module VII: Testing of Hypothesis - I</p>
          <p class="text-muted small">Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="p-3 bg-light rounded border">
              <h6 class="fw-bold text-primary mb-2"><i class="fas fa-info-circle me-1"></i> Sample & Dataset Context</h6>
              <ul class="list-unstyled mb-0 small">
                <li><strong>Dataset Source:</strong> ${sampleContext.source || 'Institutional Student Database'}</li>
                <li><strong>Academic Year:</strong> ${sampleContext.year || '2025-2027'}</li>
                <li><strong>Department:</strong> ${sampleContext.dept || 'All Departments'}</li>
                <li><strong>Target Metric:</strong> ${sampleContext.subject || 'Overall Academic Percentage (%)'}</li>
                <li><strong>Sample Size (n):</strong> ${testResult.sampleSize}</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 bg-light rounded border">
              <h6 class="fw-bold text-primary mb-2"><i class="fas fa-flask me-1"></i> Hypothesis Formulation</h6>
              <ul class="list-unstyled mb-0 small">
                <li><strong>Null Hypothesis (H₀):</strong> ${testResult.nullHypothesis}</li>
                <li><strong>Alternative Hypothesis (H₁):</strong> ${testResult.altHypothesis}</li>
                <li><strong>Test Nature:</strong> ${testResult.testType.toUpperCase()}</li>
                <li><strong>Significance Level (α):</strong> ${testResult.alpha} (${(testResult.alpha * 100).toFixed(0)}%)</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header bg-white fw-bold">
            <i class="fas fa-calculator text-primary me-2"></i> Statistical Calculations & Formula
          </div>
          <div class="card-body">
            <div class="row g-3 text-center mb-3">
              <div class="col">
                <small class="text-muted d-block">Hypothesized Mean (μ₀)</small>
                <span class="fs-5 fw-bold">${testResult.popMean}</span>
              </div>
              <div class="col">
                <small class="text-muted d-block">Sample Mean (x̄)</small>
                <span class="fs-5 fw-bold">${testResult.sampleMean}</span>
              </div>
              <div class="col">
                <small class="text-muted d-block">Std. Deviation (${testResult.isZTest ? 'σ' : 's'})</small>
                <span class="fs-5 fw-bold">${testResult.popSd || testResult.sampleSd}</span>
              </div>
              <div class="col">
                <small class="text-muted d-block">Std. Error (SE)</small>
                <span class="fs-5 fw-bold">${testResult.standardError}</span>
              </div>
            </div>

            <div class="p-3 bg-light rounded border text-center my-3">
              <p class="mb-1 fw-bold text-secondary">Statistical Test Applied: ${testResult.testName}</p>
              <div class="my-2">
                ${testResult.isZTest 
                  ? '<code>Z = (x̄ - μ₀) / (σ / √n) = (' + testResult.sampleMean + ' - ' + testResult.popMean + ') / ' + testResult.standardError + '</code>' 
                  : '<code>t = (x̄ - μ₀) / (s / √n) = (' + testResult.sampleMean + ' - ' + testResult.popMean + ') / ' + testResult.standardError + ' (df = ' + testResult.df + ')</code>'
                }
              </div>
              <small class="text-muted">${testResult.testSelectionReason}</small>
            </div>

            <div class="row g-3 text-center mt-2">
              <div class="col">
                <small class="text-muted d-block">Calculated Test Statistic</small>
                <span class="fs-4 fw-bold text-primary">${testResult.testStatistic}</span>
              </div>
              <div class="col">
                <small class="text-muted d-block">Critical Value (Cutoff)</small>
                <span class="fs-4 fw-bold text-dark">${testResult.criticalValue}</span>
              </div>
              <div class="col">
                <small class="text-muted d-block">Calculated P-Value</small>
                <span class="fs-4 fw-bold ${testResult.pValue <= testResult.alpha ? 'text-danger' : 'text-success'}">${testResult.pValue}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-3 rounded mb-4 ${isReject ? 'bg-danger bg-opacity-10 border border-danger' : 'bg-success bg-opacity-10 border border-success'}">
          <h5 class="fw-bold ${isReject ? 'text-danger' : 'text-success'} mb-2">
            <i class="fas ${isReject ? 'fa-times-circle' : 'fa-check-circle'} me-2"></i> Statistical Decision: ${testResult.decision}
          </h5>
          <p class="mb-0 text-dark"><strong>Academic Conclusion:</strong> ${testResult.conclusion}</p>
        </div>

        <div class="border-top pt-3 d-flex justify-content-between text-muted small">
          <span>Student Hypothesis Testing Platform</span>
          <span>Verified Statistical Output</span>
        </div>
      </div>
    `;

    const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
    reportModal.show();
  }

  return {
    exportStudentsToCSV,
    exportStudentsToJSON,
    exportAnalysesToCSV,
    exportAnalysesToJSON,
    printHypothesisReport
  };
})();
