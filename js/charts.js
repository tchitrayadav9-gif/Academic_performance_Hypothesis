/**
 * Academic Performance Hypothesis Testing System
 * Charts Module: Chart.js Visualizations & Dynamic Distribution Curves
 */

const ChartsModule = (() => {
  let distributionChartInstance = null;
  let yearComparisonChartInstance = null;
  let subjectAverageChartInstance = null;
  let gradeDistChartInstance = null;
  let passFailChartInstance = null;
  let deptPerformanceChartInstance = null;
  let attendanceDistChartInstance = null;
  let analyticsSubjectChartInstance = null;

  /**
   * Render or Update the Statistical Distribution Curve Chart (Normal or Student's T)
   *
   * @param {Object} testResult - Output from HypothesisModule.runHypothesisTest
   */
  function renderDistributionCurve(testResult) {
    const canvas = document.getElementById('distributionCurveChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (distributionChartInstance) {
      distributionChartInstance.destroy();
    }

    const { isZTest, df, testType, criticalValueLow, criticalValueHigh, testStatistic, isReject } = testResult;

    // Generate points along the X axis from -4.5 to +4.5
    const numPoints = 180;
    const minX = -4.5;
    const maxX = 4.5;
    const step = (maxX - minX) / numPoints;

    const labels = [];
    const mainCurveData = [];
    const rejectionData = [];
    const testStatMarker = [];

    for (let i = 0; i <= numPoints; i++) {
      const x = minX + i * step;
      labels.push(parseFloat(x.toFixed(2)));

      // Calculate PDF value
      const y = isZTest 
        ? HypothesisModule.normalPdf(x) 
        : HypothesisModule.tPdf(x, df);

      mainCurveData.push(y);

      // Check if point falls inside rejection region
      let inRejection = false;
      if (testType === 'two-tailed') {
        if (x <= criticalValueLow || x >= criticalValueHigh) {
          inRejection = true;
        }
      } else if (testType === 'right-tailed') {
        if (x >= criticalValueHigh) {
          inRejection = true;
        }
      } else if (testType === 'left-tailed') {
        if (x <= criticalValueLow) {
          inRejection = true;
        }
      }

      rejectionData.push(inRejection ? y : null);

      // Marker for test statistic
      if (Math.abs(x - testStatistic) < (step / 1.8)) {
        testStatMarker.push(y);
      } else {
        testStatMarker.push(null);
      }
    }

    // Build critical value annotations / dataset
    const datasets = [
      {
        label: 'Rejection Region (Critical Area)',
        data: rejectionData,
        backgroundColor: 'rgba(239, 68, 68, 0.35)',
        borderColor: 'rgba(239, 68, 68, 0.9)',
        borderWidth: 1.5,
        fill: 'origin',
        pointRadius: 0,
        tension: 0.3
      },
      {
        label: isZTest ? 'Standard Normal Distribution φ(z)' : `Student's t-Distribution (df = ${df})`,
        data: mainCurveData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderWidth: 2.5,
        fill: 'origin',
        pointRadius: 0,
        tension: 0.3
      }
    ];

    distributionChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 14,
              font: { family: 'Inter', size: 12, weight: '600' }
            }
          },
          tooltip: {
            callbacks: {
              title: (items) => `Score (z/t): ${items[0].label}`,
              label: (item) => `Density: ${parseFloat(item.raw).toFixed(4)}`
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: isZTest ? 'Standardized Z-Score' : `t-Statistic (Degrees of Freedom: ${df})`,
              font: { weight: 'bold', size: 12 }
            },
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: {
              callback: function(val, index) {
                const num = labels[index];
                return Number.isInteger(num) ? num : '';
              }
            }
          },
          y: {
            title: { display: true, text: 'Probability Density', font: { weight: 'bold', size: 12 } },
            beginAtZero: true,
            grid: { color: 'rgba(226, 232, 240, 0.6)' }
          }
        }
      }
    });
  }

  /**
   * Render Dashboard Charts
   */
  function renderDashboardCharts(students) {
    if (!students || students.length === 0) return;

    // 1. Year Comparison Chart (2025-26 vs 2026-27)
    const y1Students = students.filter(s => s.academicYear === '2025-2026');
    const y2Students = students.filter(s => s.academicYear === '2026-2027');

    const y1Mean = StatisticsModule.calculateMean(y1Students.map(s => s.percentage));
    const y2Mean = StatisticsModule.calculateMean(y2Students.map(s => s.percentage));

    const y1Att = StatisticsModule.calculateMean(y1Students.map(s => s.attendance));
    const y2Att = StatisticsModule.calculateMean(y2Students.map(s => s.attendance));

    const ctxYear = document.getElementById('yearComparisonChart');
    if (ctxYear) {
      if (yearComparisonChartInstance) yearComparisonChartInstance.destroy();
      yearComparisonChartInstance = new Chart(ctxYear.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Average Percentage (%)', 'Average Attendance (%)'],
          datasets: [
            {
              label: '2025-2026',
              data: [parseFloat(y1Mean.toFixed(2)), parseFloat(y1Att.toFixed(2))],
              backgroundColor: 'rgba(99, 102, 241, 0.85)',
              borderRadius: 6
            },
            {
              label: '2026-2027',
              data: [parseFloat(y2Mean.toFixed(2)), parseFloat(y2Att.toFixed(2))],
              backgroundColor: 'rgba(16, 185, 129, 0.85)',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: false, min: 50, max: 100 }
          }
        }
      });
    }

    // 2. Subject Averages Chart
    const subjects = ['Mathematics', 'Programming', 'Statistics', 'Database', 'AI'];
    const subKeys = ['mathematics', 'programming', 'statistics', 'database', 'ai'];
    const subAvgs = subKeys.map(key => parseFloat(StatisticsModule.calculateMean(students.map(s => s[key])).toFixed(2)));

    const ctxSub = document.getElementById('subjectAverageChart');
    if (ctxSub) {
      if (subjectAverageChartInstance) subjectAverageChartInstance.destroy();
      subjectAverageChartInstance = new Chart(ctxSub.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Mathematics', 'Programming', 'Statistics', 'DBMS', 'Artificial Intelligence'],
          datasets: [{
            label: 'Average Score',
            data: subAvgs,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(99, 102, 241, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(236, 72, 153, 0.8)'
            ],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: false, min: 40, max: 100 }
          },
          plugins: { legend: { display: false } }
        }
      });
    }

    // 3. Grade Distribution Doughnut Chart
    const grades = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'];
    const gradeCounts = grades.map(g => students.filter(s => s.grade === g).length);

    const ctxGrade = document.getElementById('gradeDistChart');
    if (ctxGrade) {
      if (gradeDistChartInstance) gradeDistChartInstance.destroy();
      gradeDistChartInstance = new Chart(ctxGrade.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: grades,
          datasets: [{
            data: gradeCounts,
            backgroundColor: [
              '#10b981', '#34d399', '#3b82f6', '#8b5cf6', '#f59e0b', '#fb923c', '#ef4444'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' }
          }
        }
      });
    }

    // 4. Pass vs Fail Pie Chart
    const passCount = students.filter(s => s.result === 'PASS').length;
    const failCount = students.length - passCount;

    const ctxPass = document.getElementById('passFailChart');
    if (ctxPass) {
      if (passFailChartInstance) passFailChartInstance.destroy();
      passFailChartInstance = new Chart(ctxPass.getContext('2d'), {
        type: 'pie',
        data: {
          labels: ['Pass', 'Fail'],
          datasets: [{
            data: [passCount, failCount],
            backgroundColor: ['#10b981', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 5. Department Performance Chart
    const depts = ['CSE-AIML', 'CSE', 'ECE', 'EEE', 'IT'];
    const deptAvgs = depts.map(d => {
      const filtered = students.filter(s => s.department === d);
      return filtered.length > 0 ? parseFloat(StatisticsModule.calculateMean(filtered.map(s => s.percentage)).toFixed(2)) : 0;
    });

    const ctxDept = document.getElementById('deptPerformanceChart');
    if (ctxDept) {
      if (deptPerformanceChartInstance) deptPerformanceChartInstance.destroy();
      deptPerformanceChartInstance = new Chart(ctxDept.getContext('2d'), {
        type: 'bar',
        data: {
          labels: depts,
          datasets: [{
            label: 'Avg Percentage (%)',
            data: deptAvgs,
            backgroundColor: 'rgba(59, 130, 246, 0.75)',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: false, min: 50, max: 100 }
          },
          plugins: { legend: { display: false } }
        }
      });
    }

    // 6. Attendance Distribution
    const attBuckets = ['60-70%', '70-80%', '80-90%', '90-100%'];
    const attCounts = [
      students.filter(s => s.attendance >= 60 && s.attendance < 70).length,
      students.filter(s => s.attendance >= 70 && s.attendance < 80).length,
      students.filter(s => s.attendance >= 80 && s.attendance < 90).length,
      students.filter(s => s.attendance >= 90).length
    ];

    const ctxAtt = document.getElementById('attendanceDistChart');
    if (ctxAtt) {
      if (attendanceDistChartInstance) attendanceDistChartInstance.destroy();
      attendanceDistChartInstance = new Chart(ctxAtt.getContext('2d'), {
        type: 'bar',
        data: {
          labels: attBuckets,
          datasets: [{
            label: 'Students Count',
            data: attCounts,
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }
  }

  /**
   * Render Subject Breakdown Chart for Academic Analysis Tab
   */
  function renderAnalyticsSubjectChart(statsObj) {
    const ctx = document.getElementById('analyticsSubjectChart');
    if (!ctx) return;
    if (analyticsSubjectChartInstance) analyticsSubjectChartInstance.destroy();

    const labels = ['Mathematics', 'Programming', 'Statistics', 'DBMS', 'AI'];
    const avgs = [statsObj.math.mean, statsObj.prog.mean, statsObj.stats.mean, statsObj.dbms.mean, statsObj.ai.mean];
    const stdDevs = [statsObj.math.stdDev, statsObj.prog.stdDev, statsObj.stats.stdDev, statsObj.dbms.stdDev, statsObj.ai.stdDev];

    analyticsSubjectChartInstance = new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Average Score',
            data: avgs,
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderRadius: 6
          },
          {
            label: 'Standard Deviation',
            data: stdDevs,
            backgroundColor: 'rgba(245, 158, 11, 0.85)',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  }

  return {
    renderDistributionCurve,
    renderDashboardCharts,
    renderAnalyticsSubjectChart
  };
})();
