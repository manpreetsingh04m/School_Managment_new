"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function StudentTimetablePage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [studentClassId, setStudentClassId] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");

  useEffect(() => {
    const store = readStore();
    setState(store);
    
    // Get current user and find their student record
    const user = getUser();
    if (user && user.email) {
      const student = store.students.find(s => s.email === user.email);
      if (student) {
        setStudentClassId(student.classId);
        return;
      }
    }
    
    // Fallback to first student if no user found
    const first = store.students[0];
    if (first) {
      setStudentClassId(first.classId);
    }
  }, []);

  // Seed demo timetable if missing (for showcase)
  useEffect(() => {
    const store = readStore();
    const defaultClass = studentClassId || "8A";
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const hasAny = (store.timetables || []).some(t => t.classId === defaultClass);
    if (!hasAny) {
      const demoPeriods = [
        { timeSlot: "08:00 - 08:45", subject: "Mathematics", teacherId: store.teachers[0]?.id || "T1" },
        { timeSlot: "08:50 - 09:35", subject: "Science", teacherId: store.teachers[1]?.id || "T2" },
        { timeSlot: "09:40 - 10:25", subject: "English", teacherId: store.teachers[2]?.id || "T3" },
        { timeSlot: "10:40 - 11:25", subject: "Social Studies", teacherId: store.teachers[3]?.id || "T1" },
        { timeSlot: "11:30 - 12:15", subject: "Computer Science", teacherId: store.teachers[0]?.id || "T2" },
      ];
      days.forEach(day => {
        storeApi.addTimetable(defaultClass, day, demoPeriods);
      });
      setState(readStore());
      if (!studentClassId) setStudentClassId(defaultClass);
    }
  }, [studentClassId]);

  const classIdUsed = studentClassId || "8A"; // fallback to demo class
  const timetable = state.timetables.find(t => t.classId === classIdUsed && t.day === selectedDay);
  const cls = state.classes.find(c => c.id === classIdUsed);

  if (!timetable) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-800">No Timetable Available</h1>
          <p className="text-gray-600 mt-2">No timetable has been created for {selectedDay} in your class ({cls?.name || studentClassId}) yet.</p>
          <Link href="/student" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/student" 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Timetable</h1>
        <p className="text-gray-500 mt-2">{cls?.name || studentClassId} - {selectedDay} Schedule</p>
      </div>

      {/* Day Selector */}
      <div className="flex justify-center gap-1 sm:gap-2 overflow-x-auto pb-2 px-2 sm:px-4">
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
              selectedDay === day 
                ? 'bg-blue-950 text-white shadow-lg shadow-blue-900/30 scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Timetable */}
      <Card title="Daily Schedule">
        <div className="space-y-3">
          {timetable.periods.map((period: { id: string; timeSlot: string; teacherId: string; subject: string }, index: number) => {
            const teacher = state.teachers.find(t => t.id === period.teacherId);
            return (
              <div key={period.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-950 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-600">Time</div>
                        <div className="font-semibold text-gray-800 text-sm sm:text-base">{period.timeSlot}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-600">Subject</div>
                        <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">{period.subject}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-600">Teacher</div>
                        <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">{teacher?.name || "Unknown"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {timetable.periods.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No periods scheduled for your class.
            </div>
          )}
        </div>
      </Card>

      {/* Class Information */}
      <Card title="Class Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Class</div>
            <div className="text-base sm:text-lg font-semibold text-gray-800">{cls?.name || studentClassId}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Periods</div>
            <div className="text-base sm:text-lg font-semibold text-gray-800">{timetable.periods.length}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Class Teacher</div>
            <div className="text-base sm:text-lg font-semibold text-gray-800">
              {state.teachers.find(t => t.classId === studentClassId && t.isClassTeacher)?.name || "Not assigned"}
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Last Updated</div>
            <div className="text-base sm:text-lg font-semibold text-gray-800">
              {new Date(timetable.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}