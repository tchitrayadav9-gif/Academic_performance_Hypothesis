/**
 * Academic Performance Hypothesis Testing System
 * Hypothesis Testing Module: Exact Statistical Distributions, Tests & Inference
 */

const HypothesisModule = (() => {

  // ==========================================
  // MATHEMATICAL DISTRIBUTIONS & APPROXIMATIONS
  // ==========================================

  /**
   * Log Gamma Function (Lanczos Approximation)
   */
  function logGamma(z) {
    const p = [
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109586540812,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];
    if (z < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
    }
    z -= 1;
    let x = 0.99999999999980993;
    for (let i = 0; i < p.length; i++) {
      x += p[i] / (z + i + 1);
    }
    const t = z + p.length - 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }

  /**
   * Standard Normal PDF phi(z)
   */
  function normalPdf(z) {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
  }

  /**
   * Standard Normal CDF Phi(z) (Hart approximation)
   */
  function normalCdf(z) {
    if (z === 0) return 0.5;
    const sign = z < 0 ? -1 : 1;
    const absZ = Math.abs(z);
    
    // Complementary error function approximation
    const t = 1.0 / (1.0 + 0.2316419 * absZ);
    const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    const cdf = 1.0 - normalPdf(absZ) * poly;
    
    return sign < 0 ? 1.0 - cdf : cdf;
  }

  /**
   * Inverse Standard Normal CDF (Acklam Algorithm)
   */
  function normalQuantile(p) {
    if (p <= 0 || p >= 1) {
      if (p <= 0) return -Infinity;
      if (p >= 1) return Infinity;
    }

    const a1 = -3.969683028665376e+01;
    const a2 =  2.209460984245205e+02;
    const a3 = -2.759285104469687e+02;
    const a4 =  1.383577518672690e+02;
    const a5 = -3.066479806614716e+01;
    const a6 =  2.506628277459239e+00;

    const b1 = -5.447609879822406e+01;
    const b2 =  1.615858368580409e+02;
    const b3 = -1.556989798598866e+02;
    const b4 =  6.680131188771972e+01;
    const b5 = -1.328068155288572e+01;

    const c1 = -7.784894002430293e-03;
    const c2 = -3.223964580411365e-01;
    const c3 = -2.400758277161838e+00;
    const c4 = -2.549732539343734e+00;
    const c5 =  4.374664141464968e+00;
    const c6 =  2.938163982698783e+00;

    const d1 =  7.784695709041462e-03;
    const d2 =  3.224671290700398e-01;
    const d3 =  2.445134137142996e+00;
    const d4 =  3.754408661907416e+00;

    const p_low = 0.02425;
    const p_high = 1 - p_low;

    let q, r;

    if (p < p_low) {
      // Lower region
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
             ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p <= p_high) {
      // Central region
      q = p - 0.5;
      r = q * q;
      return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
             (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
      // Upper region
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
              ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
  }

  /**
   * Continued fraction for Regularized Incomplete Beta function
   */
  function betaContinuedFraction(a, b, x) {
    const maxIterations = 200;
    const eps = 3.0e-12;
    const qab = a + b;
    const qap = a + 1.0;
    const qam = a - 1.0;
    let c = 1.0;
    let d = 1.0 - qab * x / qap;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1.0 / d;
    let h = d;

    for (let m = 1; m <= maxIterations; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1.0 + aa * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1.0 + aa / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1.0 / d;
      h *= d * c;

      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1.0 + aa * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1.0 + aa / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1.0 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < eps) break;
    }
    return h;
  }

  /**
   * Regularized Incomplete Beta Function I_x(a, b)
   */
  function regularizedBeta(x, a, b) {
    if (x < 0 || x > 1) return 0;
    if (x === 0) return 0;
    if (x === 1) return 1;

    const logBeta = logGamma(a) + logGamma(b) - logGamma(a + b);
    const factor = Math.exp(a * Math.log(x) + b * Math.log(1.0 - x) - logBeta);

    if (x < (a + 1.0) / (a + b + 2.0)) {
      return (factor / a) * betaContinuedFraction(a, b, x);
    } else {
      return 1.0 - (factor / b) * betaContinuedFraction(b, a, 1.0 - x);
    }
  }

  /**
   * Student's t PDF f(t; df)
   */
  function tPdf(t, df) {
    const factor = Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2)) / (Math.sqrt(Math.PI * df));
    return factor * Math.pow(1 + (t * t) / df, -(df + 1) / 2);
  }

  /**
   * Student's t CDF F(t; df)
   */
  function tCdf(t, df) {
    if (df <= 0) return 0.5;
    const x = df / (df + t * t);
    const ib = 0.5 * regularizedBeta(x, df / 2, 0.5);
    return t >= 0 ? 1.0 - ib : ib;
  }

  /**
   * Inverse Student's t CDF (Quantile) using Hill's approximation & Newton-Raphson
   */
  function tQuantile(p, df) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    if (p === 0.5) return 0;
    if (df === 1) {
      return Math.tan(Math.PI * (p - 0.5));
    }
    if (df === 2) {
      return (2 * p - 1) / Math.sqrt(2 * p * (1 - p));
    }

    // Normal approximation baseline
    const z = normalQuantile(p);
    if (df > 100) return z;

    // Hill's initial approximation
    let t = z + (z * z * z + z) / (4 * df) + (5 * Math.pow(z, 5) + 16 * Math.pow(z, 3) + 3 * z) / (96 * df * df);

    // Newton-Raphson refinement
    for (let i = 0; i < 10; i++) {
      const cdf = tCdf(t, df);
      const pdf = tPdf(t, df);
      if (pdf === 0) break;
      const diff = cdf - p;
      if (Math.abs(diff) < 1e-10) break;
      t = t - diff / pdf;
    }
    return t;
  }

  // ==========================================
  // HYPOTHESIS TESTING ENGINE
  // ==========================================

  /**
   * Perform One-Sample Hypothesis Test
   *
   * @param {Object} params
   * @param {number} params.popMean - Hypothesized population mean (mu_0)
   * @param {number} params.sampleMean - Sample mean (x_bar)
   * @param {number} params.sampleSd - Sample standard deviation (s)
   * @param {number} [params.popSd] - Optional known population standard deviation (sigma)
   * @param {number} params.sampleSize - Sample size (n)
   * @param {number} params.alpha - Significance level (e.g. 0.01, 0.05, 0.10)
   * @param {string} params.testType - 'two-tailed', 'right-tailed', 'left-tailed'
   */
  function runHypothesisTest(params) {
    const { popMean, sampleMean, sampleSd, popSd, sampleSize, alpha, testType } = params;

    const n = parseInt(sampleSize, 10);
    const mu0 = parseFloat(popMean);
    const xBar = parseFloat(sampleMean);
    const s = parseFloat(sampleSd);
    const sig = popSd !== undefined && popSd !== null && popSd !== '' && !isNaN(Number(popSd)) && Number(popSd) > 0
      ? parseFloat(popSd) 
      : null;
    const a = parseFloat(alpha);

    // Validation
    if (isNaN(mu0) || isNaN(xBar) || isNaN(n) || n <= 1) {
      throw new Error('Please provide valid numbers. Sample size must be greater than 1.');
    }
    if (sig === null && (isNaN(s) || s <= 0)) {
      throw new Error('Please provide a positive standard deviation.');
    }
    if (a <= 0 || a >= 1) {
      throw new Error('Significance level (alpha) must be between 0 and 1 (e.g. 0.05).');
    }

    // Test selection logic
    const isZTest = sig !== null;
    const testName = isZTest ? 'One-Sample Z-Test' : 'One-Sample T-Test';
    const testSelectionReason = isZTest
      ? 'Population standard deviation (σ = ' + sig + ') was provided. Hence, the standard normal Z-test is used.'
      : 'Population standard deviation (σ) is unknown. Sample standard deviation (s = ' + s.toFixed(3) + ') is used, so the One-Sample Student\'s T-test with df = ' + (n - 1) + ' is applied.';

    const standardError = isZTest ? (sig / Math.sqrt(n)) : (s / Math.sqrt(n));
    const df = isZTest ? null : (n - 1);

    // Calculate Test Statistic
    const testStatistic = (xBar - mu0) / standardError;

    // Calculate Critical Values
    let criticalValue = 0;
    let criticalValueLow = null;
    let criticalValueHigh = null;

    if (isZTest) {
      if (testType === 'two-tailed') {
        criticalValue = Math.abs(normalQuantile(1 - a / 2));
        criticalValueLow = -criticalValue;
        criticalValueHigh = criticalValue;
      } else if (testType === 'right-tailed') {
        criticalValue = normalQuantile(1 - a);
        criticalValueHigh = criticalValue;
      } else if (testType === 'left-tailed') {
        criticalValue = -Math.abs(normalQuantile(1 - a));
        criticalValueLow = criticalValue;
      }
    } else {
      if (testType === 'two-tailed') {
        criticalValue = Math.abs(tQuantile(1 - a / 2, df));
        criticalValueLow = -criticalValue;
        criticalValueHigh = criticalValue;
      } else if (testType === 'right-tailed') {
        criticalValue = tQuantile(1 - a, df);
        criticalValueHigh = criticalValue;
      } else if (testType === 'left-tailed') {
        criticalValue = -Math.abs(tQuantile(1 - a, df));
        criticalValueLow = criticalValue;
      }
    }

    // Calculate P-Value
    let pValue = 0;
    if (isZTest) {
      if (testType === 'two-tailed') {
        pValue = 2 * (1 - normalCdf(Math.abs(testStatistic)));
      } else if (testType === 'right-tailed') {
        pValue = 1 - normalCdf(testStatistic);
      } else if (testType === 'left-tailed') {
        pValue = normalCdf(testStatistic);
      }
    } else {
      if (testType === 'two-tailed') {
        pValue = 2 * (1 - tCdf(Math.abs(testStatistic), df));
      } else if (testType === 'right-tailed') {
        pValue = 1 - tCdf(testStatistic, df);
      } else if (testType === 'left-tailed') {
        pValue = tCdf(testStatistic, df);
      }
    }

    // Ensure p-value boundary
    pValue = Math.max(0, Math.min(1, pValue));

    // Decision Logic
    const isReject = pValue <= a;
    const decision = isReject ? 'Reject H₀' : 'Fail to Reject H₀';
    const significanceStatus = isReject ? 'Statistically Significant' : 'Not Statistically Significant';

    // Hypothesis strings
    const nullHypothesis = `H₀: μ = ${mu0}`;
    let altHypothesis = '';
    if (testType === 'two-tailed') {
      altHypothesis = `H₁: μ ≠ ${mu0}`;
    } else if (testType === 'right-tailed') {
      altHypothesis = `H₁: μ > ${mu0}`;
    } else if (testType === 'left-tailed') {
      altHypothesis = `H₁: μ < ${mu0}`;
    }

    // Human-readable conclusion
    const alphaPercent = (a * 100).toFixed(0);
    let conclusion = '';
    if (isReject) {
      if (testType === 'two-tailed') {
        conclusion = `At the ${alphaPercent}% significance level (α = ${a}), since the p-value (${pValue.toFixed(4)}) is less than or equal to α (${a}) [and |test statistic| = ${Math.abs(testStatistic).toFixed(3)} > critical value = ${criticalValue.toFixed(3)}], we reject the null hypothesis (H₀). There is sufficient statistical evidence to conclude that the population mean marks are significantly different from ${mu0}.`;
      } else if (testType === 'right-tailed') {
        conclusion = `At the ${alphaPercent}% significance level (α = ${a}), since the p-value (${pValue.toFixed(4)}) is less than or equal to α (${a}) [and test statistic = ${testStatistic.toFixed(3)} > critical value = ${criticalValue.toFixed(3)}], we reject the null hypothesis (H₀). There is sufficient statistical evidence to conclude that the population mean marks are significantly greater than ${mu0}.`;
      } else {
        conclusion = `At the ${alphaPercent}% significance level (α = ${a}), since the p-value (${pValue.toFixed(4)}) is less than or equal to α (${a}) [and test statistic = ${testStatistic.toFixed(3)} < critical value = ${criticalValue.toFixed(3)}], we reject the null hypothesis (H₀). There is sufficient statistical evidence to conclude that the population mean marks are significantly less than ${mu0}.`;
      }
    } else {
      if (testType === 'two-tailed') {
        conclusion = `At the ${alphaPercent}% significance level (α = ${a}), since the p-value (${pValue.toFixed(4)}) is greater than α (${a}) [and |test statistic| = ${Math.abs(testStatistic).toFixed(3)} ≤ critical value = ${criticalValue.toFixed(3)}], we fail to reject the null hypothesis (H₀). There is insufficient statistical evidence to conclude that the population mean marks differ from ${mu0}.`;
      } else if (testType === 'right-tailed') {
        conclusion = `At the ${alphaPercent}% significance level (α = ${a}), since the p-value (${pValue.toFixed(4)}) is greater than α (${a}) [and test statistic = ${testStatistic.toFixed(3)} ≤ critical value = ${criticalValue.toFixed(3)}], we fail to reject the null hypothesis (H₀). There is insufficient statistical evidence to conclude that the population mean marks are greater than ${mu0}.`;
      } else {
        conclusion = `At the ${alphaPercent}% significance level (α = ${a}), since the p-value (${pValue.toFixed(4)}) is greater than α (${a}) [and test statistic = ${testStatistic.toFixed(3)} ≥ critical value = ${criticalValue.toFixed(3)}], we fail to reject the null hypothesis (H₀). There is insufficient statistical evidence to conclude that the population mean marks are less than ${mu0}.`;
      }
    }

    return {
      isZTest,
      testName,
      testSelectionReason,
      sampleSize: n,
      popMean: mu0,
      sampleMean: xBar,
      sampleSd: s,
      popSd: sig,
      standardError: parseFloat(standardError.toFixed(4)),
      df: df,
      alpha: a,
      testType,
      nullHypothesis,
      altHypothesis,
      testStatistic: parseFloat(testStatistic.toFixed(4)),
      criticalValue: parseFloat(criticalValue.toFixed(4)),
      criticalValueLow: criticalValueLow !== null ? parseFloat(criticalValueLow.toFixed(4)) : null,
      criticalValueHigh: criticalValueHigh !== null ? parseFloat(criticalValueHigh.toFixed(4)) : null,
      pValue: parseFloat(pValue.toFixed(4)),
      isReject,
      decision,
      significanceStatus,
      conclusion
    };
  }

  return {
    runHypothesisTest,
    normalPdf,
    normalCdf,
    normalQuantile,
    tPdf,
    tCdf,
    tQuantile
  };
})();
