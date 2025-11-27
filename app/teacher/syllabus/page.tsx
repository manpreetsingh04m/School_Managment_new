"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function TeacherSyllabusPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [], syllabus: [] });
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; classId?: string; subjectAssignments?: { classId: string; subject: string }[] } | null>(null);

  useEffect(() => {
    const store = readStore();
    setState(store);
    
    const user = getUser();
    if (user && user.role === "teacher") {
      setTeacherInfo(user);
    }
  }, []);

  // Get subjects assigned to the teacher
  const getTeacherSubjects = () => {
    if (!teacherInfo) return [];
    
    const subjects = new Set<string>();
    
    // Add subjects from class teacher assignment
    if (teacherInfo.classId) {
      const classData = state.classes.find(c => c.id === teacherInfo.classId);
      if (classData?.subjects) {
        classData.subjects.forEach(subject => subjects.add(subject));
      }
    }
    
    // Add subjects from subject assignments
    if (teacherInfo.subjectAssignments) {
      teacherInfo.subjectAssignments.forEach(assignment => {
        subjects.add(assignment.subject);
      });
    }
    
    return Array.from(subjects);
  };

  const teacherSubjects = getTeacherSubjects();

  const getSubjectStats = (subjectName: string) => {
    const subjectData = state.subjects.find(s => s.name === subjectName);
    if (!subjectData || !teacherInfo?.classId) return { chapters: 0, topics: 0 };
    
    const syllabus = storeApi.getSubjectSyllabus(subjectData.id, teacherInfo.classId);
    if (!syllabus) return { chapters: 0, topics: 0 };
    
    const totalTopics = syllabus.chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0);
    return { chapters: syllabus.chapters.length, topics: totalTopics };
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/teacher" 
          className="flex items-center gap-2 text-sky-800 hover:text-sky-900 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Syllabus Management</h1>
        <p className="text-sm sm:text-base text-gray-500">Manage chapters and topics for your assigned subjects.</p>
      </div>

      {!teacherInfo ? (
        <Card title="Access Denied">
          <div className="text-center py-8 text-gray-500">
            <p>Teacher information not found. Please sign in again.</p>
          </div>
        </Card>
      ) : teacherSubjects.length === 0 ? (
        <Card title="No Subjects Assigned">
          <div className="text-center py-8 text-gray-500">
            <p>You are not assigned to teach any subjects yet.</p>
            <p className="text-sm mt-2">Please contact the administrator to assign subjects.</p>
          </div>
        </Card>
      ) : (
        <Card title="Your Subjects">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {teacherSubjects.map((subject) => {
              const stats = getSubjectStats(subject);
              return (
                <Link
                  key={subject}
                  href={`/teacher/syllabus/${encodeURIComponent(subject)}`}
                  className="group block"
                >
                  <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-sky-300 transition-all duration-200 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                          <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base group-hover:text-sky-700 transition-colors">
                            {subject}
                          </h3>
                          <p className="text-xs text-gray-500">Syllabus Management</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-sky-600">{stats.chapters}</div>
                        <div className="text-xs text-gray-500">Chapters</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Total Topics:</span>
                        <span className="font-medium">{stats.topics}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stats.chapters > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {stats.chapters > 0 ? 'Active' : 'Not Started'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Manage Syllabus</span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-sky-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
