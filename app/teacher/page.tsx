"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUser } from "@/lib/auth";
import { readStore } from "@/lib/store";
import type { Store } from "@/lib/store";

const classes = [
  { id: "1", name: "Grade 8A", students: 32 },
  { id: "2", name: "Grade 9B", students: 35 },
  { id: "3", name: "Grade 10A", students: 28 },
  { id: "4", name: "Grade 10B", students: 30 }
];

export default function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState("1");
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; classId?: string; subjectAssignments?: { classId: string; subject: string }[] } | null>(null);
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });

  useEffect(() => {
    const user = getUser();
    if (user && user.email) {
      const store = readStore();
      const teacher = store.teachers.find(t => t.email === user.email);
      if (teacher) {
        setTeacherInfo(teacher);
        setState(store);
      }
    }
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Welcome, {teacherInfo ? teacherInfo.name : 'Teacher'}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
             {teacherInfo ? 'Teacher' : 'Teacher'} |
            {teacherInfo?.classId ? ` Grade ${teacherInfo.classId}` : ' Multiple Classes'}
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Total Students</p>
          <p className="text-3xl sm:text-4xl font-bold text-sky-600 mt-1 sm:mt-2 hover:text-sky-700 transition-colors duration-300">
            {teacherInfo ? 
              (() => {
                // Get all class IDs where teacher teaches (both class teacher and subject teacher)
                const assignedClassIds = new Set<string>();
                if (teacherInfo.classId) assignedClassIds.add(teacherInfo.classId);
                if (teacherInfo.subjectAssignments) {
                  teacherInfo.subjectAssignments.forEach(assignment => {
                    assignedClassIds.add(assignment.classId);
                  });
                }
                return state.students.filter(s => assignedClassIds.has(s.classId)).length;
              })() : 
              state.students.length
            }
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            {teacherInfo ? 'Your assigned classes' : 'All classes'}
          </p>
        </Card>
        <Card className="text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Today&apos;s Attendance</p>
          <p className="text-3xl sm:text-4xl font-bold text-green-600 mt-1 sm:mt-2 hover:text-green-700 transition-colors duration-300">
            {teacherInfo ? 
              (() => {
                const today = new Date().toISOString().split('T')[0];
                const classStudents = state.students.filter(s => s.classId === teacherInfo.classId);
                const attendanceRecords = state.attendance.filter(a => 
                  a.classId === teacherInfo.classId && a.date === today
                );
                const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
                return `${presentCount}/${classStudents.length}`;
              })() : 
              '0/0'
            }
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Present/Total</p>
        </Card>
        <Card className="text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Average Attendance</p>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600 mt-1 sm:mt-2 hover:text-blue-700 transition-colors duration-300">
            {teacherInfo ? 
              (() => {
                // const classStudents = state.students.filter(s => s.classId === teacherInfo.classId);
                const attendanceRecords = state.attendance.filter(a => a.classId === teacherInfo.classId);
                if (attendanceRecords.length === 0) return '0%';
                const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
                const percentage = Math.round((presentCount / attendanceRecords.length) * 100);
                return `${percentage}%`;
              })() : 
              '0%'
            }
          </p>
          <p className="text-xs sm:text-sm text-green-600">Overall</p>
        </Card>
        <Card className="text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Homework Due</p>
          <p className="text-3xl sm:text-4xl font-bold text-red-600 mt-1 sm:mt-2 hover:text-red-700 transition-colors duration-300">5</p>
          <p className="text-xs sm:text-sm text-gray-600">Tomorrow</p>
        </Card>
      </div>

      {/* Quick Attendance */}
      <Card title="Quick Attendance" actions={
        <Link href="/teacher/attendance" className="text-sky-600 hover:text-sky-700 text-sm font-medium">Full Attendance</Link>
      }>
        <div className="space-y-4">
          {teacherInfo ? 
            (() => {
              const today = new Date().toISOString().split('T')[0];
              const classStudents = state.students.filter(s => s.classId === teacherInfo.classId);
              const attendanceRecords = state.attendance.filter(a => 
                a.classId === teacherInfo.classId && a.date === today
              );
              const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
              const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
              const pendingCount = classStudents.length - presentCount - absentCount;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-green-800">Today&apos;s Attendance</h3>
                      <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                        <div className="text-xs text-green-700">Present</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                        <div className="text-xs text-red-700">Absent</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                        <div className="text-xs text-yellow-700">Pending</div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <Link 
                        href="/teacher/attendance" 
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Take Attendance
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-blue-800">Class Overview</h3>
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">
                        {state.classes.find(c => c.id === teacherInfo.classId)?.name || teacherInfo.classId}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Total Students:</span>
                        <span className="font-semibold text-blue-800">{classStudents.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Attendance Rate:</span>
                        <span className="font-semibold text-blue-800">
                          {classStudents.length > 0 ? Math.round((presentCount / classStudents.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Last Updated:</span>
                        <span className="text-xs text-blue-600">
                          {attendanceRecords.length > 0 ? 'Today' : 'Not taken'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <Link 
                        href="/teacher/attendance/history" 
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        View History
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })() : 
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p>Loading attendance data...</p>
            </div>
          }
        </div>
      </Card>

      {/* My Classes */}
      <Card title="My Classes" actions={
        <Link href="/teacher/classes" className="text-sky-600 hover:text-sky-700 text-sm font-medium">View All Classes</Link>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Mathematics - Grade 8A</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Students:</span>
                <span className="font-medium">32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Class:</span>
                <span className="font-medium">Mar 26, 10:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Room:</span>
                <span className="font-medium">Room 201</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Mathematics - Grade 9B</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Students:</span>
                <span className="font-medium">35</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Class:</span>
                <span className="font-medium">Mar 26, 11:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Room:</span>
                <span className="font-medium">Room 203</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Student Records */}
      <Card title={`Student Records - ${classes.find(c => c.id === selectedClass)?.name}`} actions={
        <div className="flex items-center gap-3">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} ({cls.students} students)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/teacher/classes" className="text-sky-600 hover:text-sky-700 text-sm font-medium">View All Students</Link>
        </div>
      }>
        <div className="space-y-3">
          {teacherInfo ? 
            (() => {
              // Get all class IDs where teacher teaches (both class teacher and subject teacher)
              const assignedClassIds = new Set<string>();
              if (teacherInfo.classId) assignedClassIds.add(teacherInfo.classId);
              if (teacherInfo.subjectAssignments) {
                teacherInfo.subjectAssignments.forEach(assignment => {
                  assignedClassIds.add(assignment.classId);
                });
              }
              
              const assignedStudents = state.students.filter(s => assignedClassIds.has(s.classId));
              
              return assignedStudents.length > 0 ? (
                assignedStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">{student.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Roll No: {student.rollNo} | Class: {state.classes.find(c => c.id === student.classId)?.name || student.classId}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full text-green-600 bg-green-100">
                      Active
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No students found in your assigned classes.</p>
                </div>
              );
            })() : 
            <div className="text-center py-8 text-gray-500">
              <p>No class assigned. Contact admin to assign you to a class.</p>
            </div>
          }
        </div>
      </Card>
    </div>
  );
}
