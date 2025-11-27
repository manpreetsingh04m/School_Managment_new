/**
 * TEACHER GRADING SYSTEM PAGE
 *
 * This page provides a comprehensive grading system for teachers with three main parts:
 * 1. Section cards showing subjects and terms (e.g., Mathematics Term 1, Science Term 2)
 * 2. Add new section modal with subject selection
 * 3. Student marks entry page with maximum marks and individual student inputs
 *
 * PURPOSE:
 * - Display grading sections as beautiful cards
 * - Allow teachers to create new sections with subject selection
 * - Navigate to student marks entry for each section/subject
 * - Provide intuitive and modern UI for grading management
 *
 * FUNCTIONALITY:
 * - Shows all grading sections as cards with subject icons
 * - Floating action button to add new sections
 * - Modal for creating new sections with subject selection
 * - Navigation to student marks entry page
 * - Student count display for each section
 *
 * DESIGN FEATURES:
 * - Modern card-based layout with icons
 * - Responsive grid system
 * - Beautiful floating action button
 * - Clean modal design
 * - Consistent color scheme and typography
 */

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readStore, storeApi } from "@/lib/store";
import type { Store, GradingSection } from "@/lib/store";
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

export default function TeacherGradingPage() {
  const [state, setState] = useState<Store>({ 
    classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], 
    feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], 
    gradingSections: [], studentMarks: [], subjects: [] 
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; classId?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const store = readStore();
    
    // Get teacher info from authenticated user
    const user = getUser();
    if (user && user.role === "teacher") {
      setTeacherInfo(user);
    }
    
    // If no subjects exist, initialize them
    if (!store.subjects || store.subjects.length === 0) {
      const defaultSubjects = [
        { id: "math", name: "Mathematics" },
        { id: "science", name: "Science" },
        { id: "english", name: "English" },
        { id: "social", name: "Social Studies" },
        { id: "history", name: "History" },
        { id: "geography", name: "Geography" },
        { id: "physics", name: "Physics" },
        { id: "chemistry", name: "Chemistry" },
        { id: "biology", name: "Biology" },
        { id: "computer", name: "Computer Science" },
        { id: "art", name: "Art" },
        { id: "music", name: "Music" },
        { id: "pe", name: "Physical Education" }
      ];
      
      // Add subjects to store
      defaultSubjects.forEach(subject => {
        storeApi.addSubject(subject.name);
      });
      
      // Reload store
      const updatedStore = readStore();
      setState(updatedStore);
    } else {
      setState(store);
    }
  }, []);

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim() || selectedSubjects.length === 0) return;

    storeApi.createGradingSection(sectionName.trim(), selectedSubjects);
    setState(readStore());
    setSectionName("");
    setSelectedSubjects([]);
    setShowAddModal(false);
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleCardClick = (section: GradingSection, subjectId: string) => {
    router.push(`/teacher/grading/${section.id}/${subjectId}`);
  };

  const getSubjectIcon = (subjectName: string) => {
    return subjectIcons[subjectName] || { icon: "📖", color: "bg-gray-100 text-gray-600" };
  };

  const getStudentCount = () => {
    if (!teacherInfo || !teacherInfo.classId) return 0;
    
    // Only class teachers can see student counts
    // Count students from teacher's assigned class only
    return state.students.filter(s => s.classId === teacherInfo.classId).length;
  };

  // Get all unique subjects from all sections
  const allSubjects = state.subjects && state.subjects.length > 0 ? state.subjects : [
    { id: "math", name: "Mathematics" },
    { id: "science", name: "Science" },
    { id: "english", name: "English" },
    { id: "social", name: "Social Studies" },
    { id: "history", name: "History" },
    { id: "geography", name: "Geography" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "biology", name: "Biology" },
    { id: "computer", name: "Computer Science" },
    { id: "art", name: "Art" },
    { id: "music", name: "Music" },
    { id: "pe", name: "Physical Education" }
  ];
  const sections = state.gradingSections || [];

  // Check if teacher is a class teacher
  const isClassTeacher = teacherInfo && teacherInfo.classId;

  // If not a class teacher, show access denied
  if (teacherInfo && !isClassTeacher) {
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
            You are not authorized to access the grading system. 
            Only class teachers can add marks for their assigned class.
            Subject teachers are not allowed to add marks.
          </p>
          <button
            onClick={() => router.push("/teacher")}
            className="bg-cyan-950 text-white px-6 py-2 rounded-lg hover:bg-cyan-900 transition-colors"
          >
            Go back to Dashboard
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Grading System</h1>
          <p className="text-sm text-gray-600 mt-1">Manage student grades and assessments</p>
        </div>
        {/* Debug info - remove in production */}
        <div className="text-xs text-gray-500">
          Subjects: {allSubjects.length} | Sections: {sections.length}
        </div>
      </div>

      {/* Grading Sections Grid */}
      <div className="space-y-8">
        {sections.map(section => (
          <div key={section.id} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{section.name}</h2>
              <span className="text-sm text-gray-500">{section.subjectIds.length} subjects</span>
            </div>
            
            {/* Subjects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.subjectIds.map(subjectId => {
                const subject = allSubjects.find(s => s.id === subjectId);
                if (!subject) return null;
                
                const iconInfo = getSubjectIcon(subject.name);
                 const studentCount = getStudentCount();
                
                return (
                  <div
                    key={`${section.id}-${subjectId}`}
                    onClick={() => handleCardClick(section, subjectId)}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-cyan-500 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${iconInfo.color}`}>
                        {iconInfo.icon}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-800 text-base mb-1">{subject.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600">{studentCount} Students</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sections.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No grading sections yet</h3>
          <p className="text-gray-600 mb-6">Create your first grading section to start managing student grades.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-cyan-950 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-900 transition-colors"
          >
            Create First Section
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-950 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-cyan-900 transition-all duration-200 flex items-center justify-center z-10"
        aria-label="Add new section"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add New Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Add New Section</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSectionName("");
                    setSelectedSubjects([]);
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateSection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section/Term Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter section name"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-950 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">e.g., Term 1, Unit 1, Midterm</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Subject(s)
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {allSubjects.length === 0 ? (
                      <p className="text-sm text-gray-500">No subjects available</p>
                    ) : (
                      <div className="space-y-2">
                        {allSubjects.map((subject: { id: string; name: string }) => (
                          <label key={subject.id} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSubjects.includes(subject.id)}
                              onChange={() => handleSubjectToggle(subject.id)}
                              className="w-4 h-4 text-cyan-950 border-gray-300 rounded focus:ring-cyan-950"
                            />
                            <span className="text-sm text-gray-700">{subject.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select the subjects for this section</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSectionName("");
                      setSelectedSubjects([]);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!sectionName.trim() || selectedSubjects.length === 0}
                    className="flex-1 px-4 py-2 bg-cyan-950 text-white rounded-lg hover:bg-cyan-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Section
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
