"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useEffect, useState } from "react";
import { readStore } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function ExamSchedulePage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [user] = useState(getUser());

  useEffect(() => {
    setState(readStore());
  }, []);

  // Get exam schedules for the student's class
  const student = user?.email ? state.students.find(s => s.email === user.email) : null;
  const examSchedules = student ? 
    (state.examSchedules || []).filter(exam => exam.classId === student.classId) : 
    (state.examSchedules || []);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Exam Schedule</h1>
        <p className="text-sm sm:text-base text-gray-500">Upcoming exam dates and timings.</p>
      </div>
      <Card>
        <div className="space-y-4">
          {examSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No exam schedules available.</p>
            </div>
          ) : (
            examSchedules.map((exam) => {
              const subject = state.subjects.find(s => s.id === exam.subjectId);
              const timeText = exam.startTime && exam.endTime ? 
                `${exam.startTime} - ${exam.endTime}` : 
                "Time TBD";
              
              return (
                <div key={exam.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg w-fit self-start">
                    <Icon name="calendar" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {subject?.name || 'Unknown Subject'} - {exam.title}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{timeText}</p>
                    {exam.room && <p className="text-xs sm:text-sm text-gray-500">Room: {exam.room}</p>}
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="font-semibold text-indigo-600 text-sm sm:text-base">
                      {new Date(exam.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{new Date(exam.date).getFullYear()}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

