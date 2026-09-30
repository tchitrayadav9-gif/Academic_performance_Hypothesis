# Academic Performance Hypothesis Testing System

> **Student Academic Statistics, Data Retrieval & Hypothesis Testing Platform**  
> *Designed for B.Tech AIML / CSE Students | Curriculum Module: Testing of Hypothesis – I*

[![HTML5](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20ES6+-orange.svg)](#)
[![Bootstrap 5](https://img.shields.io/badge/UI-Bootstrap%205-purple.svg)](#)
[![Chart.js](https://img.shields.io/badge/Visualizations-Chart.js%20v4-blue.svg)](#)
[![KaTeX](https://img.shields.io/badge/Math-KaTeX-green.svg)](#)

---

## 📌 1. Project Overview

The **Academic Performance Hypothesis Testing System (APHTS)** is an interactive, responsive educational statistical analysis web platform. It bridges classroom statistical theory with practical academic data analysis, allowing students and educators to:
1. Store, search, filter, and retrieve realistic academic records spanning **two academic years (2025–2026 and 2026–2027)**.
2. Calculate comprehensive descriptive statistics dynamically (Mean, Median, Mode, Variance, Standard Deviation, Range, Pass/Fail ratios).
3. Draw representative samples (Random $N$, First $N$, Filtered Cohorts) directly from the student database.
4. Formulate Null ($H_0$) and Alternative ($H_1$) hypotheses.
5. Execute **One-Sample Z-Tests** (when population standard deviation $\sigma$ is known) and **One-Sample Student's T-Tests** (when $\sigma$ is unknown, with degrees of freedom $df = n - 1$).
6. Evaluate Left-tailed, Right-tailed, and Two-tailed directional tests across standard significance levels ($\alpha = 0.01, 0.05, 0.10$).
7. Calculate exact continuous **Critical Values** and **P-Values** dynamically.
8. Visualize sampling distributions, rejection zones (critical regions), and test statistic markers.
9. Export analysis results to CSV/JSON and generate formatted printable academic reports.

---

## 🗂️ 2. Project Directory Structure

```
MathsProject/
│
├── index.html               # Main responsive single-page application
├── README.md                # Comprehensive documentation and viva guide
│
├── css/
│   └── style.css            # Custom responsive styles, badges, print stylesheet
│
└── js/
    ├── data.js              # 200+ realistic Indian student records generator (2025-27)
    ├── storage.js           # LocalStorage persistence layer for CRUD & history
    ├── statistics.js        # Descriptive stats engine (mean, median, s², s, SE, sample size)
    ├── hypothesis.js        # Exact normal/t distributions, PDF/CDF, critical values & p-values
    ├── charts.js            # Chart.js renderers: sampling distribution curve & KPI charts
    ├── reports.js           # CSV/JSON exporters and printable report generator
    └── app.js               # Application orchestrator, modal controllers, routing & UI events
```

---

## 📊 3. Core Modules & Features

### 1. 📈 Dashboard
- High-level KPI cards: Total Students (200), 2025-26 Cohort (100), 2026-27 Cohort (100), Average Marks, Highest/Lowest Marks, Pass Rate, and Average Attendance.
- Interactive visualizations: 2-Year comparison bar charts, Grade distribution doughnut chart, Pass vs. Fail pie chart, and Subject-wise averages.

### 2. 👨‍🎓 Student Data Management
- Complete CRUD operations: Add Student, Edit Records, Delete with confirmation.
- Multi-dimensional filters: Academic Year, Department (CSE-AIML, CSE, ECE, EEE, IT), Section (A, B, C), Grade (A+ to F), and Result (PASS / FAIL).
- Global dynamic search & pagination.
- Instant recalculation of total marks ($/500$), percentage, grade, and pass/fail status.

### 3. 📉 Academic Descriptive Analysis
- Dynamic calculation of Mean ($\bar{x}$), Median, Mode, Sample Variance ($s^2$), Sample Standard Deviation ($s$), Range, and Pass/Fail rates.
- Subject-wise breakdown for Mathematics, Programming, Statistics, DBMS, and AI.
- **2025-26 vs. 2026-27 Academic Comparison**: Directly compares cohort means to highlight student performance trends.
- **Multi-Parameter Data Retrieval Engine**: Filter by Year, Department, Subject, Minimum/Maximum Percentage, and Attendance threshold with immediate statistical metrics.

### 4. 🧮 Hypothesis Testing Engine
- **Test Selection Logic**:
  - If $\sigma$ is provided $\rightarrow$ **One-Sample Z-Test**:
    $$Z = \frac{\bar{x} - \mu_0}{\sigma / \sqrt{n}}$$
  - If $\sigma$ is NOT provided $\rightarrow$ **One-Sample Student's T-Test**:
    $$t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}, \quad df = n - 1$$
- Direct database sample loader: Extract random $N$ or filtered records from the 2-year database to auto-fill sample statistics.
- Raw data parser: Paste custom comma-separated scores.
- Dynamic sampling distribution curve displaying critical values, colored rejection areas, and test statistic placement.
- Rigorous decision rule: **Reject $H_0$** if $p \le \alpha$, otherwise **Fail to Reject $H_0$** (never states "Accept $H_0$").

### 5. 📚 Learning & Theoretical Reference
- **Type I & Type II Error 2×2 Decision Matrix** with visual cues.
- Level of Significance ($\alpha$) explanations.
- Interactive **Sample Size Calculator**:
  $$n = \left(\frac{Z_{\alpha/2} \cdot \sigma}{E}\right)^2$$
- General Descriptive Statistics Calculator.

### 6. 📄 Analysis History & Printable Reports
- Track previously executed tests in LocalStorage.
- Export student records and test history to **CSV** or **JSON**.
- **Printable Academic Report**: Generates formatted, print-ready reports with KaTeX mathematical formulas suitable for PDF saving.

---

## 📐 4. Mathematical Foundations

| Metric / Parameter | Mathematical Formula | Description |
| :--- | :--- | :--- |
| **Sample Mean** | $\bar{x} = \frac{\sum_{i=1}^n x_i}{n}$ | Arithmetic average of sample scores |
| **Sample Variance** | $s^2 = \frac{\sum_{i=1}^n (x_i - \bar{x})^2}{n - 1}$ | Unbiased sample variance with Bessel's correction |
| **Sample Std. Dev.** | $s = \sqrt{s^2}$ | Dispersion of sample marks |
| **Standard Error** | $SE = \frac{s}{\sqrt{n}} \text{ or } \frac{\sigma}{\sqrt{n}}$ | Standard deviation of the sampling distribution |
| **Z-Test Statistic** | $Z = \frac{\bar{x} - \mu_0}{\sigma / \sqrt{n}}$ | Standard normal test when population SD is known |
| **T-Test Statistic** | $t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}$ | Student's t-test statistic with $df = n - 1$ |
| **Two-Tailed P-Value**| $p = 2 \cdot P(T \ge \|t_{stat}\|)$ | Probability of observing extreme deviation in either tail |
| **Right-Tailed P-Value**| $p = P(T \ge t_{stat})$ | Probability of observing deviation in upper tail |
| **Left-Tailed P-Value**| $p = P(T \le t_{stat})$ | Probability of observing deviation in lower tail |

---

## 🎯 5. Step-by-Step Viva / Demo Flow

1. **Dashboard Overview**: Show key performance indicators across the 2-year dataset (200 records).
2. **Student Database Exploration**: Search for a student (e.g. `STU2025-015`), filter by department `CSE-AIML`, and demonstrate editing/adding a student.
3. **Academic Descriptive Analysis**: Show subject-wise means, standard deviations, and the 2025-26 vs. 2026-27 cohort comparison.
4. **Data Retrieval Engine**: Query 2026-27 students with Attendance $\ge 75\%$ and Percentage $\ge 70\%$ to view instant statistical summaries.
5. **Hypothesis Testing (Database Sample)**:
   - Click *Select Sample from Database*.
   - Choose `CSE-AIML` students, `Statistics` marks, Sample Size $n = 30$.
   - Set Hypothesized Population Mean $\mu_0 = 70$, $\alpha = 0.05$, Two-Tailed.
   - Click *Perform Hypothesis Test* to observe the calculated $t$-statistic, critical value, $p$-value, distribution graph, and decision.
6. **Preset Examples**: Load *Example 4 (Z-Test)* and *Example 5 (Small Sample T-Test)* to demonstrate test selection criteria.
7. **Generate Report & Export**: Open the printable report modal and export the dataset to CSV/JSON.

---

## 🚀 6. How to Run Locally

1. Clone or download the repository files into a folder.
2. Open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. No build step or local server required!

---

*Developed for B.Tech AIML Academic Evaluation & Statistical Analytics Demonstration.*
