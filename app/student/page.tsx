/**
 * STUDENT DASHBOARD
 *
 * Why this file exists:
 * - Student landing page summarizing key information and quick links.
 *
 * What it does:
 * - Shows welcome header, quick metrics (attendance, grades, tasks)
 * - Provides links to detailed pages: attendance, marks, homework, contact
 */
"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readStore, storeApi } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function StudentDashboard() {
  const [feesDue, setFeesDue] = useState<string>("--");
  const [studentInfo, setStudentInfo] = useState<{ name: string; classId: string; grade?: string; rollNo?: string } | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<{ present: number; absent: number; total: number; percentage: number } | null>(null);
  const [marksStats, setMarksStats] = useState<{ average: number; totalMarks: number } | null>(null);
  
  useEffect(()=>{
    const store = readStore();
    
    // Get current user and find their student record
    const user = getUser();
    if (user && user.email) {
      const student = store.students.find(s => s.email === user.email);
      if (student) {
        setStudentInfo(student);
        
        // Calculate fees
        const feeState = storeApi.getStudentFeeState(student.id);
        const installments = feeState?.installments || [];
        const total = installments.reduce((s,i)=> s + i.amount, 0);
        const paid = installments.filter(i=>i.paid).reduce((s,i)=> s + i.amount, 0);
        const remaining = Math.max(0, Math.round((total - paid)*100)/100);
        setFeesDue(`₹${remaining.toLocaleString()}`);
        
        // Calculate attendance stats
        const attendanceRecords = store.attendance.filter(a => a.studentId === student.id);
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
        const absentDays = totalDays - presentDays;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        setAttendanceStats({
          percentage: attendancePercentage,
          present: presentDays,
          absent: absentDays,
          total: totalDays
        });
        
        // Calculate marks stats
        const studentMarks = store.studentMarks.filter(m => m.studentId === student.id);
        if (studentMarks.length > 0) {
          const totalMarks = studentMarks.reduce((sum, mark) => sum + mark.marks, 0);
          const totalMaxMarks = studentMarks.reduce((sum, mark) => sum + mark.maxMarks, 0);
          const averagePercentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100 * 10) / 10 : 0;
          
          setMarksStats({
            average: averagePercentage,
            totalMarks: studentMarks.length
          });
        }
        
        return;
      }
    }
    
    // Fallback to first student if no user found
    const first = store.students[0];
    if (first) {
      setStudentInfo(first);
      const feeState = storeApi.getStudentFeeState(first.id);
      const installments = feeState?.installments || [];
      const total = installments.reduce((s,i)=> s + i.amount, 0);
      const paid = installments.filter(i=>i.paid).reduce((s,i)=> s + i.amount, 0);
      const remaining = Math.max(0, Math.round((total - paid)*100)/100);
      setFeesDue(`₹${remaining.toLocaleString()}`);
    }
  }, []);
  return (
    <div className="narrow-mobile space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Welcome, {studentInfo ? studentInfo.name : "Student"}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            {studentInfo ? `${studentInfo.classId} | Roll No. ${studentInfo.rollNo || 'N/A'}` : "Loading..."}
          </p>
        </div>
        <Link href="/student/contact" className="mt-4 sm:mt-0 bg-blue-950 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Contact Teacher
        </Link>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Attendance */}
        <Link href="/student/attendance" className="group">
          <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Attendance</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">View</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {attendanceStats ? `${attendanceStats.percentage}% Present` : "0% Present"}
            </div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
              <span className="text-red-600">
                Absent: {attendanceStats ? attendanceStats.absent : 0} days
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full group-hover:bg-green-200 transition-colors self-start sm:self-auto">
                Present: {attendanceStats ? attendanceStats.present : 0} days
              </span>
            </div>
          </Card>
        </Link>

        {/* Marks */}
        <Link href="/student/marks" className="group">
          <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Overall Grade</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700">Details</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
              {marksStats ? `${marksStats.average}%` : "0%"}
            </div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
              <span className="text-green-600">
                {marksStats ? `${marksStats.totalMarks} assessments` : "No marks yet"}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full group-hover:bg-green-200 transition-colors self-start sm:self-auto">
                {marksStats && marksStats.average >= 90 ? "A+" : 
                 marksStats && marksStats.average >= 80 ? "A" : 
                 marksStats && marksStats.average >= 70 ? "B" : 
                 marksStats && marksStats.average >= 60 ? "C" : "D"}
              </span>
            </div>
          </Card>
        </Link>

        

        {/* Fees (remaining due) */}
        <Link href="/student/fee-status" className="group">
          <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Fees</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-amber-50 text-amber-700">Status</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors">{feesDue}</div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600">
              <span>Remaining Due</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full self-start sm:self-auto">Details</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Today's Classes (Scrollable) */}
      <Card title="Today's Classes" actions={
        <Link href="/student/timetable" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Full Timetable</Link>
      }>
        <div className="max-h-60 overflow-y-auto divide-y">
          {[{time:"08:00 - 08:45",subject:"Mathematics",teacher:"Mr. Johnson",room:"201"},{time:"08:50 - 09:35",subject:"Science",teacher:"Ms. Lee",room:"Lab 1"},{time:"09:40 - 10:25",subject:"English",teacher:"Mrs. Smith",room:"104"},{time:"10:40 - 11:25",subject:"Social Studies",teacher:"Mr. Clark",room:"303"},{time:"11:30 - 12:15",subject:"Computer Science",teacher:"Ms. Davis",room:"ICT"},{time:"12:20 - 01:05",subject:"Physical Education",teacher:"Coach Amit",room:"Ground"}].map((p,idx)=> (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2 sm:gap-0">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-800">{p.subject}</div>
                <div className="text-xs text-gray-500">{p.teacher} • Room {p.room}</div>
              </div>
              <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200 self-start sm:self-auto">{p.time}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Marks & Performance Section */}
      <Card title="Recent Marks" actions={
        <Link href="/student/marks" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All Marks</Link>
      }>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">Subject</th>
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">Test/Exam</th>
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">Marks</th>
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">Grade</th>
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Mathematics</span>
                </td>
                <td className="p-2 sm:p-3 text-sm font-medium text-gray-800">Unit Test 3</td>
                <td className="p-2 sm:p-3 text-sm font-medium text-gray-800">92/100</td>
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">A</span>
                </td>
                <td className="p-2 sm:p-3 text-sm text-gray-600">Mar 20</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Science</span>
                </td>
                <td className="p-2 sm:p-3 text-sm font-medium text-gray-800">Lab Report</td>
                <td className="p-2 sm:p-3 text-sm font-medium text-gray-800">85/100</td>
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">B+</span>
                </td>
                <td className="p-2 sm:p-3 text-sm text-gray-600">Mar 18</td>
              </tr>
              <tr>
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">English</span>
                </td>
                <td className="p-2 sm:p-3 text-sm font-medium text-gray-800">Essay Assignment</td>
                <td className="p-2 sm:p-3 text-sm font-medium text-gray-800">88/100</td>
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">A-</span>
                </td>
                <td className="p-2 sm:p-3 text-sm text-gray-600">Mar 15</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending Homework (compact) */}
      <Card title="Pending Homework" actions={
        <Link href="/student/homework" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
      }>
        <div className="max-h-56 overflow-y-auto divide-y">
          {[
            {subject:'Mathematics', title:'Algebra Practice', due:'Mar 25'},
            {subject:'Science', title:'Lab Report', due:'Mar 25'},
            {subject:'English', title:'Essay Writing', due:'Mar 28'},
          ].map((h,idx)=> (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-800 truncate">{h.title}</div>
                <div className="text-xs text-gray-500">{h.subject} • Due {h.due}</div>
              </div>
              <span className="px-2 py-1 text-xs rounded bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto">Pending</span>
            </div>
          ))}
        </div>
      </Card>
      {/* Current Homework & Assignments Section */}
      <Card title="Current Homework & Assignments" actions={
        <Link href="/student/homework" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
      }>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">Subject</th>
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">Assignment</th>
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">Due Date</th>
                <th className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Mathematics</span>
                </td>
                <td className="p-2 sm:p-3 text-sm font-medium text-gray-800">Exercise 4.2 (Q1-15)</td>
                <td className="p-2 sm:p-3 text-sm text-gray-600">Mar 25</td>
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Overdue</span>
                </td>
              </tr>
              <tr>
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Science</span>
                </td>
                <td className="p-2 sm:p-3 text-sm font-medium text-gray-800">Chapter 3 Summary</td>
                <td className="p-2 sm:p-3 text-sm text-gray-600">Mar 28</td>
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Pending</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}