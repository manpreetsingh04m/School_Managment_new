"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useParams } from "next/navigation";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function StudentSubjectSyllabusPage() {
  const params = useParams();
  const subjectName = decodeURIComponent(params.subject as string);
  
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

  const subjectData = state.subjects.find(s => s.name === subjectName);
  const classSyllabus = subjectData && studentInfo ? 
    storeApi.getSubjectSyllabus(subjectData.id, studentInfo.classId) : null;

  const getTotalTopics = () => {
    if (!classSyllabus) return 0;
    return classSyllabus.chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/student/syllabus" 
          className="flex items-center gap-2 text-blue-800 hover:text-blue-900 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Subjects
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{subjectName} - Syllabus</h1>
        <p className="text-sm sm:text-base text-gray-500">
          {studentInfo ? `View syllabus for ${subjectName} in ${studentInfo.classId}` : "View your class syllabus"}
        </p>
      </div>

      {!studentInfo ? (
        <Card title="Access Denied">
          <div className="text-center py-8 text-gray-500">
            <p>Student information not found. Please sign in again.</p>
          </div>
        </Card>
      ) : !classSyllabus ? (
        <Card title="Syllabus Not Available">
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Syllabus Available</h3>
            <p className="text-gray-600 mb-4">
              The syllabus for {subjectName} hasn&apos;t been created yet.
            </p>
            <p className="text-sm text-gray-500">
              Your teacher will add chapters and topics soon. Check back later!
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Subject Overview */}
          <Card title="Subject Overview">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{classSyllabus.chapters.length}</div>
                <div className="text-sm text-gray-600">Total Chapters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{getTotalTopics()}</div>
                <div className="text-sm text-gray-600">Total Topics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {new Date(classSyllabus.updatedAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Last Updated</div>
              </div>
            </div>
          </Card>

          {/* Syllabus Content */}
          <Card title={`${subjectName} - Complete Syllabus`}>
            <div className="space-y-6">
              {/* Syllabus Overview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Syllabus Overview</h3>
                    <p className="text-sm text-blue-600">
                      {classSyllabus.chapters.length} chapters • Last updated {new Date(classSyllabus.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chapters List */}
              <div className="space-y-4">
                {classSyllabus.chapters.map((chapter, index) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-2">
                          {chapter.chapterName}
                        </h3>
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-gray-600">Topics Covered:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {chapter.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                <span className="text-xs text-gray-700">{topic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Study Progress</h3>
                    <p className="text-sm text-gray-600">
                      Complete all {classSyllabus.chapters.length} chapters to master {subjectName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Study Tips */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Study Tips</h3>
                    <p className="text-sm text-green-600">
                      Review each chapter thoroughly and practice the topics regularly for better understanding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
