// components/ResultsViewer.tsx
"use client";
import { useState } from "react";
import { mockResultsByStudent } from "@/core/data/resultData";
import ResultsTable from "./ResultsTable";

export default function ResultsViewer({
  studentId,
  studentName,
  studentClass,
  role,
  studentsInClass = [],
}: {
  studentId?: string;
  studentName?: string;
  studentClass?: string;
  role: "parent" | "teacher";
  studentsInClass?: { id: string; name: string; class: string }[];
}) {
  const [selectedStudentId, setSelectedStudentId] = useState(studentId);
  const [selectedTerm, setSelectedTerm] = useState("Third Term");

  if (!selectedStudentId || !studentClass) {
    return <div className="p-6">Select a student to view results</div>;
  }

  const results =
    (mockResultsByStudent[selectedStudentId] as any)?.[studentClass]?.[selectedTerm] || [];

  return (
    <div className="flex min-h-screen">
      {/* Left Navbar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-lg font-bold mb-4">
          {role === "parent"
            ? "Your Wards"
            : `Students in ${studentClass}`}
        </h2>
        <ul>
          {(role === "parent" ? [{ id: studentId, name: studentName, class: studentClass }] : studentsInClass).map(
            (s) => (
              <li key={s?.id}>
                <button
                  onClick={() => setSelectedStudentId(s?.id)}
                  className={`block w-full text-left px-2 py-1 rounded mb-1 ${
                    selectedStudentId === s?.id
                      ? "bg-blue-500"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {s?.name}
                </button>
              </li>
            )
          )}
        </ul>
      </aside>

      {/* Results Section */}
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">
          Results for {studentName} - {studentClass} ({selectedTerm})
        </h1>

        {/* Term Selector */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Select Term:</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border rounded p-2"
          >
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
        </div>

        <ResultsTable results={results} />
      </main>
    </div>
  );
}
