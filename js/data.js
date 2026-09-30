/**
 * Academic Performance Hypothesis Testing System
 * Data Generation Module: 2-Year Student Dataset (2025-2026 & 2026-2027)
 */

const StudentDataModule = (() => {
  // Realistic Indian Names
  const firstNamesMale = [
    'Aarav', 'Aditya', 'Amit', 'Arjun', 'Ayush', 'Chirag', 'Dev', 'Dhruv', 
    'Gaurav', 'Harsh', 'Ishaan', 'Karan', 'Manish', 'Nikhil', 'Pankaj', 
    'Pranav', 'Rahul', 'Rishi', 'Rohan', 'Rohit', 'Sahil', 'Sameer', 
    'Shivam', 'Siddharth', 'Suraj', 'Tanmay', 'Utkarsh', 'Varun', 'Vikram', 
    'Yash', 'Abhinav', 'Aniket', 'Deepak', 'Mayank', 'Sarthak', 'Tarun'
  ];

  const firstNamesFemale = [
    'Aanya', 'Aditi', 'Ananya', 'Anushka', 'Bhavna', 'Deepika', 'Divya', 
    'Ishita', 'Kavya', 'Khushi', 'Megha', 'Neha', 'Nisha', 'Pooja', 
    'Prachi', 'Priya', 'Rhea', 'Ritu', 'Sakshi', 'Sanvi', 'Shreya', 
    'Shruti', 'Simran', 'Sneha', 'Tanvi', 'Vanshika', 'Vidhi', 'Yashita', 
    'Aishwarya', 'Akanksha', 'Garima', 'Komal', 'Pallavi', 'Swati'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Rao', 'Gupta', 
    'Mishra', 'Yadav', 'Joshi', 'Chauhan', 'Nair', 'Iyer', 'Bose', 'Das', 
    'Mehta', 'Shah', 'Agarwal', 'Pandey', 'Tiwari', 'Bhat', 'Kulkarni', 
    'Deshmukh', 'Chopra', 'Malhotra', 'Bansal', 'Saxena', 'Mukherjee', 'Pillai'
  ];

  const departments = ['CSE-AIML', 'CSE', 'ECE', 'EEE', 'IT'];
  // Weighted selection for departments to give more CSE-AIML students (~45%)
  const deptWeights = ['CSE-AIML', 'CSE-AIML', 'CSE-AIML', 'CSE-AIML', 'CSE', 'CSE', 'ECE', 'EEE', 'IT'];

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
  function sampleNormal(mean, stdDev, min = 30, max = 100) {
    let u1 = Math.random();
    let u2 = Math.random();
    while (u1 === 0) u1 = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    let val = Math.round(mean + z * stdDev);
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Generate a comprehensive 200-student dataset across 2025-2026 and 2026-2027
   */
  function generateSampleStudents() {
    const students = [];
    let idCounter = 1;

    // Academic Year 1: 2025-2026 (100 students, mean ~71.5)
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
      const age = Math.floor(Math.random() * 4) + 19; // 19 - 22
      const attendance = sampleNormal(82, 9, 60, 100);

      // Marks for 2025-2026: baseline mean ~70-74
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

    // Academic Year 2: 2026-2027 (100 students, mean ~74.5 - slightly improved cohort)
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
      const attendance = sampleNormal(84, 8, 62, 100);

      // Marks for 2026-2027: improved performance in stats and AI
      const math = sampleNormal(73, 12, 34, 100);
      const prog = sampleNormal(76, 11, 38, 100);
      const stats = sampleNormal(74, 12, 35, 99);
      const dbms = sampleNormal(75, 11, 37, 98);
      const ai = sampleNormal(76, 12, 36, 100);

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
