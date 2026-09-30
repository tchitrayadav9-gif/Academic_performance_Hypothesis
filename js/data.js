/**
 * Academic Performance Hypothesis Testing System
 * Data Generation Module: 3-Year Student Dataset (2024-2025, 2025-2026, 2026-2027)
 * Total: 300 Comprehensive Records (100 per Academic Year)
 */

const StudentDataModule = (() => {
  // Realistic Indian Names
  const firstNamesMale = [
    'Aarav', 'Aditya', 'Amit', 'Arjun', 'Ayush', 'Chirag', 'Dev', 'Dhruv', 
    'Gaurav', 'Harsh', 'Ishaan', 'Karan', 'Manish', 'Nikhil', 'Pankaj', 
    'Pranav', 'Rahul', 'Rishi', 'Rohan', 'Rohit', 'Sahil', 'Sameer', 
    'Shivam', 'Siddharth', 'Suraj', 'Tanmay', 'Utkarsh', 'Varun', 'Vikram', 
    'Yash', 'Abhinav', 'Aniket', 'Deepak', 'Mayank', 'Sarthak', 'Tarun',
    'Vivek', 'Harshit', 'Kartik', 'Rajat', 'Alok', 'Mohit', 'Ashish', 'Kunal'
  ];

  const firstNamesFemale = [
    'Aanya', 'Aditi', 'Ananya', 'Anushka', 'Bhavna', 'Deepika', 'Divya', 
    'Ishita', 'Kavya', 'Khushi', 'Megha', 'Neha', 'Nisha', 'Pooja', 
    'Prachi', 'Priya', 'Rhea', 'Ritu', 'Sakshi', 'Sanvi', 'Shreya', 
    'Shruti', 'Simran', 'Sneha', 'Tanvi', 'Vanshika', 'Vidhi', 'Yashita', 
    'Aishwarya', 'Akanksha', 'Garima', 'Komal', 'Pallavi', 'Swati', 'Pooja',
    'Rupali', 'Mansi', 'Payal', 'Isha', 'Roshni', 'Kritika', 'Barkha'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Rao', 'Gupta', 
    'Mishra', 'Yadav', 'Joshi', 'Chauhan', 'Nair', 'Iyer', 'Bose', 'Das', 
    'Mehta', 'Shah', 'Agarwal', 'Pandey', 'Tiwari', 'Bhat', 'Kulkarni', 
    'Deshmukh', 'Chopra', 'Malhotra', 'Bansal', 'Saxena', 'Mukherjee', 'Pillai',
    'Narayanan', 'Dubey', 'Tripathi', 'Thakur', 'Kashyap', 'Garg', 'Choudhary'
  ];

  // Weighted department distribution (Giving more CSE-AIML records ~45%)
  const deptWeights = [
    'CSE-AIML', 'CSE-AIML', 'CSE-AIML', 'CSE-AIML',
    'CSE', 'CSE', 
    'ECE', 
    'EEE', 
    'IT'
  ];

  const sections = ['A', 'B', 'C'];
  const semesters = [3, 4, 5, 6];

  /**
   * Determine grade based on percentage
   */
  function calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }

  /**
   * Determine pass/fail result based on subjects >= 40
   */
  function calculateResult(math, prog, stats, dbms, ai) {
    if (math >= 40 && prog >= 40 && stats >= 40 && dbms >= 40 && ai >= 40) {
      return 'PASS';
    }
    return 'FAIL';
  }

  /**
   * Pseudorandom normal generator (Box-Muller)
   */
  function sampleNormal(mean, stdDev, min = 25, max = 100) {
    let u1 = Math.random();
    let u2 = Math.random();
    while (u1 === 0) u1 = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    let val = Math.round(mean + z * stdDev);
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Generate a comprehensive 300-student dataset across 3 academic years:
   * 2024-2025 (100 students, mean ~67.5%)
   * 2025-2026 (100 students, mean ~72.0%)
   * 2026-2027 (100 students, mean ~76.5%)
   */
  function generateSampleStudents() {
    const students = [];

    // ==========================================
    // YEAR 1: 2024-2025 (100 Students, Baseline Mean ~67-68%)
    // ==========================================
    for (let i = 1; i <= 100; i++) {
      const isMale = Math.random() > 0.46;
      const fName = isMale 
        ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
        : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${fName} ${lName}`;

      const dept = deptWeights[Math.floor(Math.random() * deptWeights.length)];
      const sec = sections[Math.floor(Math.random() * sections.length)];
      const sem = semesters[Math.floor(Math.random() * semesters.length)];
      const age = Math.floor(Math.random() * 4) + 19;
      const attendance = sampleNormal(78, 10, 55, 98);

      // Marks for 2024-2025: Mean ~67, with realistic fails
      const math = sampleNormal(66, 14, 25, 96);
      const prog = sampleNormal(68, 13, 30, 98);
      const stats = sampleNormal(65, 15, 26, 95);
      const dbms = sampleNormal(69, 12, 32, 97);
      const ai = sampleNormal(67, 14, 28, 96);

      const totalMarks = math + prog + stats + dbms + ai;
      const percentage = parseFloat((totalMarks / 5).toFixed(2));
      const grade = calculateGrade(percentage);
      const result = calculateResult(math, prog, stats, dbms, ai);

      const idString = `STU2024-${String(i).padStart(3, '0')}`;

      students.push({
        studentId: idString,
        name: fullName,
        academicYear: '2024-2025',
        department: dept,
        section: sec,
        semester: sem,
        gender: isMale ? 'Male' : 'Female',
        age: age,
        attendance: attendance,
        mathematics: math,
        programming: prog,
        statistics: stats,
        database: dbms,
        ai: ai,
        totalMarks: totalMarks,
        percentage: percentage,
        grade: grade,
        result: result
      });
    }

    // ==========================================
    // YEAR 2: 2025-2026 (100 Students, Mean ~72.0%)
    // ==========================================
    for (let i = 1; i <= 100; i++) {
      const isMale = Math.random() > 0.45;
      const fName = isMale 
        ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
        : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${fName} ${lName}`;

      const dept = deptWeights[Math.floor(Math.random() * deptWeights.length)];
      const sec = sections[Math.floor(Math.random() * sections.length)];
      const sem = semesters[Math.floor(Math.random() * semesters.length)];
      const age = Math.floor(Math.random() * 4) + 19;
      const attendance = sampleNormal(82, 9, 60, 100);

      // Marks for 2025-2026: Mean ~72
      const math = sampleNormal(71, 13, 28, 99);
      const prog = sampleNormal(73, 12, 35, 100);
      const stats = sampleNormal(70, 14, 30, 98);
      const dbms = sampleNormal(72, 11, 36, 97);
      const ai = sampleNormal(71, 13, 32, 99);

      const totalMarks = math + prog + stats + dbms + ai;
      const percentage = parseFloat((totalMarks / 5).toFixed(2));
      const grade = calculateGrade(percentage);
      const result = calculateResult(math, prog, stats, dbms, ai);

      const idString = `STU2025-${String(i).padStart(3, '0')}`;

      students.push({
        studentId: idString,
        name: fullName,
        academicYear: '2025-2026',
        department: dept,
        section: sec,
        semester: sem,
        gender: isMale ? 'Male' : 'Female',
        age: age,
        attendance: attendance,
        mathematics: math,
        programming: prog,
        statistics: stats,
        database: dbms,
        ai: ai,
        totalMarks: totalMarks,
        percentage: percentage,
        grade: grade,
        result: result
      });
    }

    // ==========================================
    // YEAR 3: 2026-2027 (100 Students, Mean ~76.5% - Advanced Cohort)
    // ==========================================
    for (let i = 1; i <= 100; i++) {
      const isMale = Math.random() > 0.48;
      const fName = isMale 
        ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
        : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${fName} ${lName}`;

      const dept = deptWeights[Math.floor(Math.random() * deptWeights.length)];
      const sec = sections[Math.floor(Math.random() * sections.length)];
      const sem = semesters[Math.floor(Math.random() * semesters.length)];
      const age = Math.floor(Math.random() * 4) + 19;
      const attendance = sampleNormal(85, 8, 65, 100);

      // Marks for 2026-2027: Mean ~76-77%
      const math = sampleNormal(75, 11, 36, 100);
      const prog = sampleNormal(78, 10, 38, 100);
      const stats = sampleNormal(76, 11, 35, 99);
      const dbms = sampleNormal(77, 10, 37, 100);
      const ai = sampleNormal(78, 11, 38, 100);

      const totalMarks = math + prog + stats + dbms + ai;
      const percentage = parseFloat((totalMarks / 5).toFixed(2));
      const grade = calculateGrade(percentage);
      const result = calculateResult(math, prog, stats, dbms, ai);

      const idString = `STU2026-${String(i).padStart(3, '0')}`;

      students.push({
        studentId: idString,
        name: fullName,
        academicYear: '2026-2027',
        department: dept,
        section: sec,
        semester: sem,
        gender: isMale ? 'Male' : 'Female',
        age: age,
        attendance: attendance,
        mathematics: math,
        programming: prog,
        statistics: stats,
        database: dbms,
        ai: ai,
        totalMarks: totalMarks,
        percentage: percentage,
        grade: grade,
        result: result
      });
    }

    return students;
  }

  return {
    generateSampleStudents,
    calculateGrade,
    calculateResult
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StudentDataModule;
}
