"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readStore, storeApi } from "@/lib/store";
import type { Store, Student, AttendanceSummary } from "@/lib/store";
import React from "react";

interface Props {
  params: Promise<{ studentId: string }>;
}

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

export default function StudentAttendanceDetailPage({ params }: Props) {
  const resolvedParams = React.use(params);
  const studentId = resolvedParams.studentId;
  
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthlyAttendance, setMonthlyAttendance] = useState<{[key: number]: 'present' | 'absent'}>({});

  useEffect(() => {
    const storeData = readStore();
    setState(storeData);
  }, []);

  useEffect(() => {
    
    if (state.students.length > 0) {
      const foundStudent = state.students.find(s => s.id === studentId);
      if (foundStudent) {
        setStudent(foundStudent);
        
        // Get attendance summary for the student
        const summary = storeApi.getAttendanceSummary(
          studentId, 
          foundStudent.classId, 
          "Morning Attendance"
        );
        setAttendanceSummary(summary);
        
        // Get monthly attendance data
        const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
        
        const allAttendance = storeApi.getAllAttendance();
        const monthlyData: {[key: number]: 'present' | 'absent'} = {};
        
        allAttendance.forEach(record => {
          if (record.studentId === studentId && 
              record.classId === foundStudent.classId &&
              record.subject === "Morning Attendance" &&
              record.date >= startDate && 
              record.date <= endDate) {
            const day = new Date(record.date).getDate();
            monthlyData[day] = record.status;
          }
        });
        
        setMonthlyAttendance(monthlyData);
      }
    }
  }, [state.students, studentId, currentMonth, currentYear]);

  const getDaysInMonth = () => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentYear, currentMonth, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }
    
    return calendarDays;
  };

  const getStatusForDay = (day: number) => {
    return monthlyAttendance[day] || undefined;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (!student) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center py-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Student Not Found</h1>
          <p className="text-gray-600 mt-2">The requested student could not be found.</p>
          <Link 
            href="/teacher/attendance" 
            className="mt-4 inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Attendance
          </Link>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            {student.name} - Attendance Record
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Roll No. {student.rollNo} | {state.classes.find(c => c.id === student.classId)?.name}
          </p>
        </div>
        
        <Link
          href="/teacher/attendance"
          className="mt-4 sm:mt-0 flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Attendance
        </Link>
      </div>

      {/* Statistics Cards */}
      {attendanceSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="text-center">
            <p className="text-base sm:text-lg font-semibold text-gray-700">Total Attendance</p>
            <p className="text-3xl sm:text-4xl font-bold text-sky-600 mt-1 sm:mt-2">
              {attendanceSummary.attendancePercentage}%
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-base sm:text-lg font-semibold text-gray-700">Days Present</p>
            <p className="text-3xl sm:text-4xl font-bold text-green-600 mt-1 sm:mt-2">
              {attendanceSummary.presentDays}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-base sm:text-lg font-semibold text-gray-700">Days Absent</p>
            <p className="text-3xl sm:text-4xl font-bold text-red-600 mt-1 sm:mt-2">
              {attendanceSummary.absentDays}
            </p>
          </Card>
        </div>
      )}

      {/* Calendar */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-base sm:text-lg font-semibold">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 mr-2 rounded"></span>
              Present
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 mr-2 rounded"></span>
              Absent
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 mr-2 rounded"></span>
              No Record
            </div>
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
