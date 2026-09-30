/**
 * Academic Performance Hypothesis Testing System
 * Storage Module: LocalStorage Persistence Layer with 3-Year Migration Support
 */

const StorageModule = (() => {
  const KEYS = {
    STUDENTS: 'aphts_student_records_v2', // v2 for 3-year dataset
    OLD_STUDENTS: 'aphts_student_records',
    ANALYSES: 'aphts_saved_analyses',
    SETTINGS: 'aphts_settings'
  };

  /**
   * Initialize storage with default data if empty or outdated
   */
  function initStorage() {
    let needsReset = false;
    const existingV2 = localStorage.getItem(KEYS.STUDENTS);

    if (!existingV2) {
      needsReset = true;
    } else {
      try {
        const parsed = JSON.parse(existingV2);
        // Check if 2024-2025 records are present and length >= 300
        const has2024 = parsed.some(s => s.academicYear === '2024-2025');
        if (!has2024 || parsed.length < 300) {
          needsReset = true;
        }
      } catch (e) {
        needsReset = true;
      }
    }

    if (needsReset) {
      const initialStudents = StudentDataModule.generateSampleStudents();
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(initialStudents));
    }

    if (!localStorage.getItem(KEYS.ANALYSES)) {
      localStorage.setItem(KEYS.ANALYSES, JSON.stringify([]));
    }
  }

  /**
   * Retrieve all students
   */
  function getStudents() {
    initStorage();
    try {
      const data = localStorage.getItem(KEYS.STUDENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse students from LocalStorage', e);
      return [];
    }
  }

  /**
   * Save full students array
   */
  function saveStudents(students) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  }

  /**
   * Reset to fresh 3-year sample dataset (300 records)
   */
  function resetSampleDataset() {
    const initialStudents = StudentDataModule.generateSampleStudents();
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(initialStudents));
    return initialStudents;
  }

  /**
   * Add a new student record
   */
  function addStudent(student) {
    const students = getStudents();
    // Validate unique ID
    if (students.some(s => s.studentId.trim().toUpperCase() === student.studentId.trim().toUpperCase())) {
      throw new Error(`Student ID ${student.studentId} already exists!`);
    }
    students.unshift(student);
    saveStudents(students);
    return student;
  }

  /**
   * Update an existing student record
   */
  function updateStudent(studentId, updatedData) {
    const students = getStudents();
    const index = students.findIndex(s => s.studentId === studentId);
    if (index === -1) {
      throw new Error(`Student with ID ${studentId} not found.`);
    }
    students[index] = { ...students[index], ...updatedData };
    saveStudents(students);
    return students[index];
  }

  /**
   * Delete a student record by ID
   */
  function deleteStudent(studentId) {
    let students = getStudents();
    const initialLength = students.length;
    students = students.filter(s => s.studentId !== studentId);
    if (students.length === initialLength) {
      throw new Error(`Student with ID ${studentId} not found.`);
    }
    saveStudents(students);
    return true;
  }

  /**
   * Retrieve saved hypothesis analyses
   */
  function getSavedAnalyses() {
    initStorage();
    try {
      const data = localStorage.getItem(KEYS.ANALYSES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse analyses from LocalStorage', e);
      return [];
    }
  }

  /**
   * Save a hypothesis test analysis
   */
  function saveAnalysis(analysis) {
    const analyses = getSavedAnalyses();
    analysis.id = 'ANA_' + Date.now();
    analysis.timestamp = new Date().toLocaleString();
    analyses.unshift(analysis);
    localStorage.setItem(KEYS.ANALYSES, JSON.stringify(analyses));
    return analysis;
  }

  /**
   * Delete a saved analysis by ID
   */
  function deleteAnalysis(id) {
    let analyses = getSavedAnalyses();
    analyses = analyses.filter(a => a.id !== id);
    localStorage.setItem(KEYS.ANALYSES, JSON.stringify(analyses));
    return true;
  }

  /**
   * Clear all saved analyses
   */
  function clearAllAnalyses() {
    localStorage.setItem(KEYS.ANALYSES, JSON.stringify([]));
    return true;
  }

  return {
    initStorage,
    getStudents,
    saveStudents,
    resetSampleDataset,
    addStudent,
    updateStudent,
    deleteStudent,
    getSavedAnalyses,
    saveAnalysis,
    deleteAnalysis,
    clearAllAnalyses
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageModule;
}
