export const mockStudents = [
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Aisha Bello", class: "SS1" },
  { id: "d4e5f6g7-h8i9-0123-defg-456789012345", name: "Tunde Okoro", class: "SS1" },
];

export const mockResultsByStudent: Record<string, any[]> = {
  "a1b2c3d4-e5f6-7890-abcd-ef1234567890": [
    {
      term: "First Term",
      class: "SS1",
      results: [
        { subject: "Mathematics", ca: 20, exam: 55, total: 75, grade: "B", remark: "Good" },
        { subject: "English",     ca: 18, exam: 52, total: 70, grade: "B", remark: "Very Good" },
        { subject: "Physics",     ca: 22, exam: 60, total: 82, grade: "A", remark: "Excellent" },
        { subject: "Chemistry",   ca: 19, exam: 50, total: 69, grade: "C", remark: "Fair" },
      ],
    },
    {
      term: "Second Term",
      class: "SS1",
      results: [
        { subject: "Mathematics", ca: 25, exam: 60, total: 85, grade: "A", remark: "Excellent" },
        { subject: "English",     ca: 20, exam: 55, total: 75, grade: "B", remark: "Good" },
        { subject: "Physics",     ca: 24, exam: 65, total: 89, grade: "A", remark: "Outstanding" },
        { subject: "Chemistry",   ca: 23, exam: 54, total: 77, grade: "B", remark: "Very Good" },
      ],
    },
    {
      term: "Third Term",
      class: "SS1",
      results: [
        { subject: "Mathematics", ca: 28, exam: 62, total: 90, grade: "A", remark: "Outstanding" },
        { subject: "English",     ca: 22, exam: 56, total: 78, grade: "B", remark: "Very Good" },
        { subject: "Physics",     ca: 27, exam: 63, total: 90, grade: "A", remark: "Excellent" },
        { subject: "Chemistry",   ca: 25, exam: 58, total: 83, grade: "A", remark: "Excellent" },
      ],
    },
    {
      term: "First Term",
      class: "SS2",
      results: [
        { subject: "Mathematics", ca: 21, exam: 57, total: 78, grade: "B", remark: "Good" },
        { subject: "English",     ca: 19, exam: 52, total: 71, grade: "B", remark: "Fair" },
        { subject: "Biology",     ca: 23, exam: 60, total: 83, grade: "A", remark: "Excellent" },
        { subject: "Geography",   ca: 20, exam: 55, total: 75, grade: "B", remark: "Good" },
      ],
    },
    {
      term: "Second Term",
      class: "SS2",
      results: [
        { subject: "Mathematics", ca: 26, exam: 63, total: 89, grade: "A", remark: "Excellent" },
        { subject: "English",     ca: 22, exam: 54, total: 76, grade: "B", remark: "Very Good" },
        { subject: "Biology",     ca: 24, exam: 62, total: 86, grade: "A", remark: "Outstanding" },
        { subject: "Geography",   ca: 21, exam: 58, total: 79, grade: "B", remark: "Good" },
      ],
    },
    {
      term: "Third Term",
      class: "SS2",
      results: [
        { subject: "Mathematics", ca: 27, exam: 65, total: 92, grade: "A", remark: "Outstanding" },
        { subject: "English",     ca: 23, exam: 57, total: 80, grade: "B", remark: "Very Good" },
        { subject: "Biology",     ca: 26, exam: 64, total: 90, grade: "A", remark: "Excellent" },
        { subject: "Geography",   ca: 24, exam: 60, total: 84, grade: "A", remark: "Excellent" },
      ],
    },
    {
      term: "First Term",
      class: "SS3",
      results: [
        { subject: "Mathematics", ca: 22, exam: 56, total: 78, grade: "B", remark: "Good" },
        { subject: "English",     ca: 20, exam: 54, total: 74, grade: "B", remark: "Good" },
        { subject: "Economics",   ca: 24, exam: 60, total: 84, grade: "A", remark: "Excellent" },
        { subject: "Government",  ca: 21, exam: 55, total: 76, grade: "B", remark: "Very Good" },
      ],
    },
    {
      term: "Second Term",
      class: "SS3",
      results: [
        { subject: "Mathematics", ca: 25, exam: 62, total: 87, grade: "A", remark: "Excellent" },
        { subject: "English",     ca: 23, exam: 58, total: 81, grade: "B", remark: "Very Good" },
        { subject: "Economics",   ca: 26, exam: 64, total: 90, grade: "A", remark: "Excellent" },
        { subject: "Government",  ca: 24, exam: 59, total: 83, grade: "A", remark: "Excellent" },
      ],
    },
    {
      term: "Third Term",
      class: "SS3",
      results: [
        { subject: "Mathematics", ca: 28, exam: 65, total: 93, grade: "A", remark: "Excellent" },
        { subject: "English",     ca: 25, exam: 60, total: 85, grade: "A", remark: "Excellent" },
        { subject: "Economics",   ca: 27, exam: 63, total: 90, grade: "A", remark: "Excellent" },
        { subject: "Government",  ca: 26, exam: 61, total: 87, grade: "A", remark: "Excellent" },
      ],
    },
  ],

  "d4e5f6g7-h8i9-0123-defg-456789012345": [
    {
      term: "First Term",
      class: "SS1",
      results: [
        { subject: "Mathematics", ca: 21, exam: 55, total: 76, grade: "A", remark: "Excellent" },
        { subject: "English",     ca: 20, exam: 55, total: 75, grade: "B", remark: "Good" },
        { subject: "Physics",     ca: 15, exam: 45, total: 60, grade: "B", remark: "Good" },
        { subject: "Chemistry",   ca: 19, exam: 30, total: 49, grade: "D", remark: "Fair" },
      ],
    },
    {
      term: "Second Term",
      class: "SS1",
      results: [
        { subject: "Mathematics", ca: 25, exam: 50, total: 75, grade: "A", remark: "Excellent" },
        { subject: "English",     ca: 10, exam: 55, total: 65, grade: "B", remark: "Good" },
        { subject: "Physics",     ca: 30, exam: 40, total: 70, grade: "B", remark: "Very Good" },
        { subject: "Chemistry",   ca: 23, exam: 54, total: 77, grade: "B", remark: "Very Good" },
      ],
    },
    {
      term: "Third Term",
      class: "SS1",
      results: [
        { subject: "Mathematics", ca: 28, exam: 62, total: 90, grade: "A", remark: "Outstanding" },
        { subject: "English",     ca: 22, exam: 56, total: 78, grade: "B", remark: "Very Good" },
        { subject: "Physics",     ca: 27, exam: 63, total: 90, grade: "A", remark: "Excellent" },
        { subject: "Chemistry",   ca: 25, exam: 58, total: 83, grade: "A", remark: "Excellent" },
      ],
    },
    {
      term: "First Term",
      class: "SS2",
      results: [
        { subject: "Mathematics", ca: 21, exam: 57, total: 78, grade: "B", remark: "Good" },
        { subject: "English",     ca: 19, exam: 52, total: 71, grade: "B", remark: "Fair" },
        { subject: "Biology",     ca: 23, exam: 60, total: 83, grade: "A", remark: "Excellent" },
        { subject: "Geography",   ca: 20, exam: 55, total: 75, grade: "B", remark: "Good" },
      ],
    },
    {
      term: "Second Term",
      class: "SS2",
      results: [
        { subject: "Mathematics", ca: 26, exam: 63, total: 89, grade: "A", remark: "Excellent" },
        { subject: "English",     ca: 22, exam: 54, total: 76, grade: "B", remark: "Very Good" },
        { subject: "Biology",     ca: 24, exam: 62, total: 86, grade: "A", remark: "Outstanding" },
        { subject: "Geography",   ca: 21, exam: 58, total: 79, grade: "B", remark: "Good" },
      ],
    },
    {
      term: "Third Term",
      class: "SS2",
      results: [
        { subject: "Mathematics", ca: 27, exam: 65, total: 92, grade: "A", remark: "Outstanding" },
        { subject: "English",     ca: 23, exam: 57, total: 80, grade: "B", remark: "Very Good" },
        { subject: "Biology",     ca: 26, exam: 64, total: 90, grade: "A", remark: "Excellent" },
        { subject: "Geography",   ca: 24, exam: 60, total: 84, grade: "A", remark: "Excellent" },
      ],
    },
    {
      term: "First Term",
      class: "SS3",
      results: [
        { subject: "Mathematics", ca: 22, exam: 56, total: 78, grade: "B", remark: "Good" },
        { subject: "English",     ca: 20, exam: 54, total: 74, grade: "B", remark: "Good" },
        { subject: "Economics",   ca: 24, exam: 60, total: 84, grade: "A", remark: "Excellent" },
        { subject: "Government",  ca: 21, exam: 55, total: 76, grade: "B", remark: "Very Good" },
      ],
    },
    {
      term: "Second Term",
      class: "SS3",
      results: [
        { subject: "Mathematics", ca: 25, exam: 62, total: 87, grade: "A", remark: "Excellent" },
        { subject: "English",     ca: 23, exam: 58, total: 81, grade: "B", remark: "Very Good" },
        { subject: "Economics",   ca: 26, exam: 64, total: 90, grade: "A", remark: "Outstanding" },
        { subject: "Government",  ca: 24, exam: 59, total: 83, grade: "A", remark: "Excellent" },
      ],
    },
    {
      term: "Third Term",
      class: "SS3",
      results: [
        { subject: "Mathematics", ca: 10, exam: 35, total: 45, grade: "D", remark: "Fair" },
        { subject: "English",     ca: 25, exam: 60, total: 85, grade: "A", remark: "Excellent" },
        { subject: "Economics",   ca: 17, exam: 53, total: 70, grade: "B", remark: "Very Good" },
        { subject: "Government",  ca: 26, exam: 61, total: 87, grade: "A", remark: "Excellent" },
      ],
    },
  ],
};
