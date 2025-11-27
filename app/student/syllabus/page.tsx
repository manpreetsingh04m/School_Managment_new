"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function StudentSyllabusPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [], syllabus: [] });
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

  const getSubjectStats = (subjectName: string) => {
    const subjectData = state.subjects.find(s => s.name === subjectName);
    if (!subjectData || !studentInfo) return { chapters: 0, topics: 0 };
    
    const syllabus = storeApi.getSubjectSyllabus(subjectData.id, studentInfo.classId);
    if (!syllabus) return { chapters: 0, topics: 0 };
    
    const totalTopics = syllabus.chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0);
    return { chapters: syllabus.chapters.length, topics: totalTopics };
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/student" 
          className="flex items-center gap-2 text-blue-800 hover:text-blue-900 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Subject Syllabus</h1>
        <p className="text-sm sm:text-base text-gray-500">
          {studentInfo ? `View syllabus for ${studentInfo.classId}` : "View your class syllabus"}
        </p>
      </div>

      {!studentInfo ? (
        <Card title="Access Denied">
          <div className="text-center py-8 text-gray-500">
            <p>Student information not found. Please sign in again.</p>
          </div>
        </Card>
      ) : classSubjects.length === 0 ? (
        <Card title="No Subjects Available">
          <div className="text-center py-8 text-gray-500">
            <p>No subjects are assigned to your class yet.</p>
            <p className="text-sm mt-2">Please contact your teacher or administrator.</p>
          </div>
        </Card>
      ) : (
        <Card title="Your Subjects">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {classSubjects.map((subject) => {
              const stats = getSubjectStats(subject);
              const hasSyllabus = stats.chapters > 0;
              
              return (
                <Link
                  key={subject}
                  href={`/student/syllabus/${encodeURIComponent(subject)}`}
                  className="group block"
                >
                  <div className={`bg-white border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${
                    hasSyllabus ? 'border-blue-200 hover:border-blue-300' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all ${
                          hasSyllabus ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            hasSyllabus ? 'text-blue-600' : 'text-gray-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm sm:text-base transition-colors ${
                            hasSyllabus ? 'text-gray-800 group-hover:text-blue-700' : 'text-gray-600'
                          }`}>
                            {subject}
                          </h3>
                          <p className="text-xs text-gray-500">Syllabus</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          hasSyllabus ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {stats.chapters}
                        </div>
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
                          hasSyllabus ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {hasSyllabus ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {hasSyllabus ? 'View Syllabus' : 'Check Back Later'}
                        </span>
                        <svg className={`w-4 h-4 transition-colors ${
                          hasSyllabus ? 'text-gray-400 group-hover:text-blue-500' : 'text-gray-300'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
