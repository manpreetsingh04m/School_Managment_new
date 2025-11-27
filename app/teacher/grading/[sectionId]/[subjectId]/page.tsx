/**
 * STUDENT MARKS ENTRY PAGE
 *
 * This page allows teachers to enter marks for students in a specific section and subject.
 * It provides a comprehensive interface for managing student assessments with:
 * - Maximum marks setting
 * - Individual student mark entry
 * - Bulk save functionality
 * - Individual edit capabilities
 *
 * PURPOSE:
 * - Allow teachers to set maximum marks for an assessment
 * - Provide individual mark entry for each student
 * - Enable bulk saving of all marks
 * - Allow individual mark editing after saving
 * - Display student information clearly
 *
 * FUNCTIONALITY:
 * - Set maximum marks for the assessment
 * - Display all students in the class
 * - Enter marks for each student
 * - Save all marks at once
 * - Edit individual student marks
 * - Real-time validation and feedback
 *
 * DESIGN FEATURES:
 * - Clean, modern interface
 * - Responsive design for mobile and desktop
 * - Clear visual hierarchy
 * - Intuitive form controls
 * - Professional styling
 */

"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Store, StudentMarks } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function StudentMarksEntryPage() {
  const [state, setState] = useState<Store>({ 
    classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], 
    feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], 
    gradingSections: [], studentMarks: [], subjects: [] 
  });
  const [maxMarks, setMaxMarks] = useState<string>("");
  const [studentMarks, setStudentMarks] = useState<Record<string, string>>({});
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  // const [isSaving, setIsSaving] = useState(false);
  const [savedMarks, setSavedMarks] = useState<Record<string, StudentMarks>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  
  const router = useRouter();
  const params = useParams();
  const sectionId = params.sectionId as string;
  const subjectId = params.subjectId as string;

  useEffect(() => {
    const store = readStore();
    setState(store);
    
    // Load existing marks
    const existingMarks = storeApi.getStudentMarks(sectionId, subjectId);
    const marksMap: Record<string, StudentMarks> = {};
    existingMarks.forEach(mark => {
      marksMap[mark.studentId] = mark;
    });
    setSavedMarks(marksMap);
    
    // Set max marks from existing data (if any)
    if (existingMarks.length > 0) {
      setMaxMarks(existingMarks[0].maxMarks.toString());
    }
  }, [sectionId, subjectId]);

  const section = state.gradingSections.find(s => s.id === sectionId);
  const subject = state.subjects?.find((s: { id: string; name: string }) => s.id === subjectId) || 
    { id: subjectId, name: subjectId.charAt(0).toUpperCase() + subjectId.slice(1) };
  
  // Get teacher's assigned classes and filter students
  const user = getUser();
  
  // Check if teacher is authorized to grade this subject
  const isAuthorizedToGrade = user && user.role === "teacher" ? 
    (() => {
      // Only class teachers can add marks for their assigned class
      // Subject teachers are NOT allowed to add marks
      return !!user.classId; // Only class teachers have a classId
    })() : false;

  const students = user && user.role === "teacher" && isAuthorizedToGrade ? 
    (() => {
      // Class teacher can grade all students in their assigned class
      const filteredStudents = state.students.filter(s => s.classId === user.classId);
      
      return filteredStudents;
    })() : 
    (() => {
      return [];
    })();

  const showAlertMessage = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleUpdateMaxMarks = () => {
    if (!maxMarks || isNaN(Number(maxMarks)) || Number(maxMarks) <= 0) {
      showAlertMessage("Please enter valid maximum marks", "error");
      return;
    }

    showAlertMessage("Maximum marks updated successfully!", "success");
  };

  const handleEditStudentMarks = (studentId: string) => {
    const savedMark = savedMarks[studentId];
    if (savedMark) {
      setStudentMarks(prev => ({
        ...prev,
        [studentId]: savedMark.marks.toString()
      }));
    }
    setEditingStudent(studentId);
  };

  const handleSaveIndividualMarks = (studentId: string) => {
    const marks = studentMarks[studentId] || "0";
    const marksNum = Number(marks);
    
    if (isNaN(marksNum) || marksNum < 0) {
      showAlertMessage("Please enter valid marks", "error");
      return;
    }

    if (!maxMarks || isNaN(Number(maxMarks)) || Number(maxMarks) <= 0) {
      showAlertMessage("Please set maximum marks first", "error");
      return;
    }

    if (marksNum > Number(maxMarks)) {
      showAlertMessage(`Marks cannot exceed maximum marks (${maxMarks})`, "error");
      return;
    }

    storeApi.saveStudentMarks(
      sectionId, 
      subjectId, 
      studentId, 
      marksNum, 
      Number(maxMarks)
    );

    // Refresh saved marks
    const existingMarks = storeApi.getStudentMarks(sectionId, subjectId);
    const marksMap: Record<string, StudentMarks> = {};
    existingMarks.forEach(mark => {
      marksMap[mark.studentId] = mark;
    });
    setSavedMarks(marksMap);
    
    // Clear editing state
    setEditingStudent(null);
    setStudentMarks(prev => {
      const updated = { ...prev };
      delete updated[studentId];
      return updated;
    });

    showAlertMessage("Marks saved successfully!", "success");
  };

  const handleCancelEdit = (studentId: string) => {
    setEditingStudent(null);
    setStudentMarks(prev => {
      const updated = { ...prev };
      delete updated[studentId];
      return updated;
    });
  };

  if (!section || !subject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Section or Subject not found</h2>
          <button
            onClick={() => router.push("/teacher/grading")}
            className="text-cyan-950 hover:text-cyan-900"
          >
            Go back to Grading System
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorizedToGrade) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You are not authorized to add marks. 
            Only class teachers can add marks for their assigned class.
            Subject teachers are not allowed to add marks.
          </p>
          <button
            onClick={() => router.push("/teacher/grading")}
            className="bg-cyan-950 text-white px-6 py-2 rounded-lg hover:bg-cyan-900 transition-colors"
          >
            Go back to Grading System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/teacher/grading")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Grading
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            {subject.name} - {section.name}
          </h1>
          <p className="text-sm text-gray-600 mt-1">Enter marks for all students</p>
        </div>
      </div>

      {/* Maximum Marks Section */}
      <Card title="Maximum Marks">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Marks
            </label>
            <input
              type="number"
              placeholder="Enter maximum marks"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-950 focus:border-transparent"
              min="1"
            />
          </div>
          <button
            onClick={handleUpdateMaxMarks}
            disabled={!maxMarks || isNaN(Number(maxMarks)) || Number(maxMarks) <= 0}
            className="bg-cyan-950 text-white px-6 py-2 rounded-lg font-medium hover:bg-cyan-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Update Max Marks
          </button>
        </div>
      </Card>

      {/* Student Marks Entry Section */}
      <Card title="Student Marks Entry">
        <div className="space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            students.map(student => {
              const savedMark = savedMarks[student.id];
              const isEditing = editingStudent === student.id;
              const currentMarks = studentMarks[student.id] || "";
              
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{student.name}</h3>
                      <p className="text-sm text-gray-600">Roll No. {student.rollNo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Marks"
                          value={currentMarks}
                          onChange={(e) => setStudentMarks(prev => ({
                            ...prev,
                            [student.id]: e.target.value
                          }))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-950 focus:border-transparent text-center"
                          min="0"
                          max={maxMarks || undefined}
                        />
                        <button
                          onClick={() => handleSaveIndividualMarks(student.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save marks"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCancelEdit(student.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold text-gray-800">
                            {savedMark ? `${savedMark.marks}/${savedMark.maxMarks}` : `0/${maxMarks || 100}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {savedMark ? 
                              `${((savedMark.marks / savedMark.maxMarks) * 100).toFixed(1)}%` : 
                              '0.0%'
                            }
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditStudentMarks(student.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Edit marks"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Popover Alert */}
      {showAlert && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg border-l-4 ${
            alertType === "success" 
              ? "bg-green-50 border-green-500 text-green-800" 
              : "bg-red-50 border-red-500 text-red-800"
          }`}>
            <div className="flex items-center gap-2">
              {alertType === "success" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{alertMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
