/**
 * STUDENT STUDY RESOURCES PAGE
 *
 * This page provides a comprehensive study resources system for students with:
 * 1. Subject cards showing all available subjects
 * 2. Navigation to individual subject pages with Video, Notes, and Textbook sections
 * 3. Modern card-based layout similar to teacher grading page
 *
 * PURPOSE:
 * - Display all subjects as beautiful cards
 * - Allow students to access study materials for each subject
 * - Provide intuitive navigation to subject-specific resources
 * - Show resource counts for each subject
 *
 * FUNCTIONALITY:
 * - Shows all subjects as cards with subject icons
 * - Displays resource counts (videos, notes, textbooks)
 * - Navigation to individual subject resource pages
 * - Responsive grid layout
 *
 * DESIGN FEATURES:
 * - Modern card-based layout with icons
 * - Responsive grid system
 * - Consistent color scheme and typography
 * - Hover effects and transitions
 */

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { readStore } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

// Subject icons mapping
const subjectIcons: Record<string, { icon: string; color: string }> = {
  "Mathematics": { icon: "🧮", color: "bg-purple-100 text-purple-600" },
  "Science": { icon: "🔬", color: "bg-green-100 text-green-600" },
  "English": { icon: "📚", color: "bg-amber-100 text-amber-600" },
  "Social Studies": { icon: "🌍", color: "bg-red-100 text-red-600" },
  "History": { icon: "📜", color: "bg-orange-100 text-orange-600" },
  "Geography": { icon: "🗺️", color: "bg-blue-100 text-blue-600" },
  "Physics": { icon: "⚛️", color: "bg-indigo-100 text-indigo-600" },
  "Chemistry": { icon: "🧪", color: "bg-cyan-100 text-cyan-600" },
  "Biology": { icon: "🌱", color: "bg-emerald-100 text-emerald-600" },
  "Computer Science": { icon: "💻", color: "bg-gray-100 text-gray-600" },
  "Art": { icon: "🎨", color: "bg-pink-100 text-pink-600" },
  "Music": { icon: "🎵", color: "bg-violet-100 text-violet-600" },
  "Physical Education": { icon: "⚽", color: "bg-lime-100 text-lime-600" },
};

export default function StudentStudyResourcesPage() {
  const [state, setState] = useState<Store>({ 
    classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], 
    feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], 
    gradingSections: [], studentMarks: [], subjects: [] 
  });
  const [studentInfo, setStudentInfo] = useState<{ name: string; classId: string } | null>(null);

  useEffect(() => {
    const store = readStore();
    setState(store);
    
    const user = getUser();
    if (user && user.email) {
      const student = store.students.find(s => s.email === user.email);
      if (student) {
        setStudentInfo(student);
      }
    }
  }, []);

  // Get subjects for the student's class
  const getClassSubjects = () => {
    if (!studentInfo) return [];
    
    const classData = state.classes.find(c => c.id === studentInfo.classId);
    return classData?.subjects || [];
  };

  const classSubjects = getClassSubjects();

  const getSubjectIcon = (subjectName: string) => {
    return subjectIcons[subjectName] || { icon: "📖", color: "bg-gray-100 text-gray-600" };
  };

  // Mock resource counts - in a real app, this would come from the store
  const getResourceCounts = () => {
    // Mock data - replace with actual data from store
    return {
      videos: Math.floor(Math.random() * 15) + 5,
      notes: Math.floor(Math.random() * 20) + 8,
      textbooks: Math.floor(Math.random() * 5) + 2
    };
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Study Resources</h1>
          <p className="text-sm text-gray-600 mt-1">Access videos, notes, and textbooks for all subjects</p>
        </div>
        <div className="text-xs text-gray-500">
          {classSubjects.length} subjects available
        </div>
      </div>

      {!studentInfo ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Student information not found. Please sign in again.
          </p>
        </div>
      ) : classSubjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects available</h3>
          <p className="text-gray-600 mb-6">No subjects are assigned to your class yet.</p>
          <p className="text-sm text-gray-500">Please contact your teacher or administrator.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Subjects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {classSubjects.map((subject) => {
              const iconInfo = getSubjectIcon(subject);
              const resourceCounts = getResourceCounts();
              const totalResources = resourceCounts.videos + resourceCounts.notes + resourceCounts.textbooks;
              
              return (
                <Link
                  key={subject}
                  href={`/student/study-resources/${encodeURIComponent(subject)}`}
                  className="group block"
                >
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-500 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${iconInfo.color} group-hover:scale-110 transition-transform`}>
                        {iconInfo.icon}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-800 text-base mb-1 group-hover:text-blue-700 transition-colors">
                        {subject}
                      </h3>
                      <p className="text-xs text-gray-500">Study Resources</p>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>📹 Videos:</span>
                        <span className="font-medium">{resourceCounts.videos}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>📝 Notes:</span>
                        <span className="font-medium">{resourceCounts.notes}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>📚 Textbooks:</span>
                        <span className="font-medium">{resourceCounts.textbooks}</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {totalResources} Resources
                        </span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
