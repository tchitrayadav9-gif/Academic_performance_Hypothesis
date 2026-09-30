/**
 * Academic Performance Hypothesis Testing System
 * Statistics Module: Descriptive Statistics & Sample Utilities
 */

const StatisticsModule = (() => {
  /**
   * Calculate Arithmetic Mean
   */
  function calculateMean(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum / numbers.length;
  }

  /**
   * Calculate Median
   */
  function calculateMedian(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  /**
   * Calculate Mode(s)
   */
  function calculateMode(numbers) {
    if (!numbers || numbers.length === 0) return [];
    const freq = {};
    let maxFreq = 0;

    numbers.forEach(num => {
      const rounded = Math.round(num * 10) / 10;
      freq[rounded] = (freq[rounded] || 0) + 1;
      if (freq[rounded] > maxFreq) {
        maxFreq = freq[rounded];
      }
    });

    if (maxFreq === 1 && numbers.length > 1) {
      return ['No distinct mode'];
    }

    const modes = [];
    for (const key in freq) {
      if (freq[key] === maxFreq) {
        modes.push(parseFloat(key));
      }
    }
    return modes;
  }

  /**
   * Calculate Variance
   * isSample = true uses (n - 1) denominator (unbiased sample variance s^2)
   * isSample = false uses n denominator (population variance sigma^2)
   */
  function calculateVariance(numbers, isSample = true) {
    if (!numbers || numbers.length < (isSample ? 2 : 1)) return 0;
    const mean = calculateMean(numbers);
    const sumSqDiff = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    const divisor = isSample ? numbers.length - 1 : numbers.length;
    return sumSqDiff / divisor;
  }

  /**
   * Calculate Standard Deviation
   */
  function calculateStdDev(numbers, isSample = true) {
    return Math.sqrt(calculateVariance(numbers, isSample));
  }

  /**
   * Calculate Standard Error of the Mean
   */
  function calculateStandardError(stdDev, n) {
    if (!n || n <= 0) return 0;
    return stdDev / Math.sqrt(n);
  }

  /**
   * Calculate Range, Min, Max
   */
  function calculateRange(numbers) {
    if (!numbers || numbers.length === 0) return { min: 0, max: 0, range: 0 };
    let min = numbers[0];
    let max = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] < min) min = numbers[i];
      if (numbers[i] > max) max = numbers[i];
    }
    return { min, max, range: max - min };
  }

  /**
   * Calculate complete descriptive summary for an array of values
   */
  function getDescriptiveSummary(numbers, isSample = true) {
    if (!numbers || numbers.length === 0) {
      return {
        count: 0,
        mean: 0,
        median: 0,
        mode: [],
        min: 0,
        max: 0,
        range: 0,
        variance: 0,
        stdDev: 0,
        standardError: 0
      };
    }

    const count = numbers.length;
    const mean = calculateMean(numbers);
    const median = calculateMedian(numbers);
    const mode = calculateMode(numbers);
    const { min, max, range } = calculateRange(numbers);
    const variance = calculateVariance(numbers, isSample);
    const stdDev = calculateStdDev(numbers, isSample);
    const standardError = calculateStandardError(stdDev, count);

    return {
      count,
      mean: parseFloat(mean.toFixed(4)),
      median: parseFloat(median.toFixed(2)),
      mode: Array.isArray(mode) ? mode.slice(0, 3).join(', ') : mode,
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      range: parseFloat(range.toFixed(2)),
      variance: parseFloat(variance.toFixed(4)),
      stdDev: parseFloat(stdDev.toFixed(4)),
      standardError: parseFloat(standardError.toFixed(4))
    };
  }

  /**
   * Sample Size Calculator for estimating population mean:
   * n = ( (Z_(alpha/2) * sigma) / E )^2
   */
  function calculateSampleSize(confidenceLevel, marginOfError, populationStdDev) {
    if (marginOfError <= 0 || populationStdDev <= 0) return 0;
    let z = 1.96; // 95% default
    if (confidenceLevel === 0.90) z = 1.645;
    else if (confidenceLevel === 0.95) z = 1.960;
    else if (confidenceLevel === 0.99) z = 2.576;

    const n = Math.pow((z * populationStdDev) / marginOfError, 2);
    return Math.ceil(n);
  }

  /**
   * Parse comma-separated or whitespace-separated raw input string into numbers
   */
  function parseRawData(inputString) {
    if (!inputString || typeof inputString !== 'string') return [];
    return inputString
      .replace(/[\n\r\t]/g, ',')
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '' && !isNaN(Number(item)))
      .map(item => parseFloat(item));
  }

  return {
    calculateMean,
    calculateMedian,
    calculateMode,
    calculateVariance,
    calculateStdDev,
    calculateStandardError,
    calculateRange,
    getDescriptiveSummary,
    calculateSampleSize,
    parseRawData
  };
})();
