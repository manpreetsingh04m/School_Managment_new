/**
 * STUDENT ATTENDANCE PAGE
 *
 * Why this file exists:
 * - Visualizes a student's monthly attendance with legend and summary cards.
 *
 * What it does:
 * - Shows present/absent/holiday status for each day in a calendar grid
 * - Displays quick stats cards for totals
 * - Provides back navigation to student dashboard
 */
"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readStore, storeApi } from "@/lib/store";
import { getUser } from "@/lib/auth";

const CalendarDay = ({ day, status }: { day: number | null; status?: "present" | "absent" | "holiday" }) => {
  if (!day) return <div className="border border-gray-200 h-12 sm:h-16"></div>;
  let bgClass = "bg-white";
  if (status === "present") bgClass = "bg-green-100";
  if (status === "absent") bgClass = "bg-red-100";
  if (status === "holiday") bgClass = "bg-gray-100";
  return (
    <div className={`border border-gray-200 h-12 sm:h-16 p-1 sm:p-2 text-xs sm:text-sm ${bgClass}`}>
      <span className="font-semibold text-gray-700">{day}</span>
    </div>
  );
};

export default function ViewAttendancePage() {
  // const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  // const [user] = useState(getUser());
  const [attendanceSummary, setAttendanceSummary] = useState<{ present: number; absent: number; total: number; percentage: number } | null>(null);

  useEffect(() => {
    const store = readStore();
    
    // Get current user and find their student record
    const currentUser = getUser();
    if (currentUser && currentUser.email) {
      const student = store.students.find(s => s.email === currentUser.email);
      if (student) {
        const summary = storeApi.getAttendanceSummary(student.id, student.classId);
        if (summary) {
          setAttendanceSummary({
            present: summary.presentDays,
            absent: summary.absentDays,
            total: summary.totalDays,
            percentage: summary.attendancePercentage
          });
        }
      }
    }
  }, []);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const firstDayOffset = 4;
  const calendarDays = [...Array(firstDayOffset).fill(null), ...daysInMonth];

  const getStatusForDay = (day: number) => {
    // For demo purposes, show some attendance data
    if ([2, 3, 9, 10, 16, 17, 23, 24, 30, 31].includes(day)) return "holiday";
    if ([12, 25].includes(day)) return "absent";
    if (day <= 28) return "present";
    return undefined;
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Attendance Record</h1>
        <p className="text-sm sm:text-base text-gray-500">Your monthly attendance overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card className="text-center">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Total Attendance</p>
          <p className="text-3xl sm:text-4xl font-bold text-indigo-600 mt-1 sm:mt-2">
            {attendanceSummary ? `${attendanceSummary.percentage}%` : "96%"}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Days Present</p>
          <p className="text-3xl sm:text-4xl font-bold text-green-600 mt-1 sm:mt-2">
            {attendanceSummary ? attendanceSummary.present : "173"}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Days Absent</p>
          <p className="text-3xl sm:text-4xl font-bold text-red-600 mt-1 sm:mt-2">
            {attendanceSummary ? attendanceSummary.absent : "7"}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
          <h3 className="text-base sm:text-lg font-semibold">March 2024</h3>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
            <div className="flex items-center"><span className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 mr-2 rounded"></span>Present</div>
            <div className="flex items-center"><span className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 mr-2 rounded"></span>Absent</div>
            <div className="flex items-center"><span className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 mr-2 rounded"></span>Holiday</div>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center font-medium text-gray-600 text-xs sm:text-sm">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div className="grid grid-cols-7 mt-2">
          {calendarDays.map((day, index) => (
            <CalendarDay key={index} day={day} status={day ? getStatusForDay(day) : undefined} />
          ))}
        </div>
      </Card>
    </div>
  );
}

