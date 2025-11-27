"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { readStore } from "@/lib/store";
import type { Store } from "@/lib/store";

export default function AdminDashboard() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });

  useEffect(() => {
    setState(readStore());
  }, []);

  // Calculate dynamic stats
  const totalStudents = state.students.length;
  const activeTeachers = state.teachers.length;
  const pendingLeaves = (state.leaves || []).filter(l => l.status === 'pending').length;
  const upcomingExams = (state.examSchedules || []).filter(s => new Date(s.date) >= new Date()).length;

  // Get recent students and teachers
  const recentStudents = state.students.slice(-3);
  const recentTeachers = state.teachers.slice(-3);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500">School Management System Overview</p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Total Students</p>
          <p className="text-3xl sm:text-4xl font-bold text-cyan-600 mt-1 sm:mt-2 hover:text-cyan-700 transition-colors duration-300">{totalStudents}</p>
          <p className="text-xs sm:text-sm text-green-600">Active students</p>
        </Card>
        <Card className="text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Active Teachers</p>
          <p className="text-3xl sm:text-4xl font-bold text-green-600 mt-1 sm:mt-2 hover:text-green-700 transition-colors duration-300">{activeTeachers}</p>
          <p className="text-xs sm:text-sm text-green-600">All departments</p>
        </Card>
        <Card className="text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Pending Leaves</p>
          <p className="text-3xl sm:text-4xl font-bold text-red-600 mt-1 sm:mt-2 hover:text-red-700 transition-colors duration-300">{pendingLeaves}</p>
          <p className="text-xs sm:text-sm text-gray-600">Require approval</p>
        </Card>
        <Card className="text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <p className="text-base sm:text-lg font-semibold text-gray-700">Upcoming Exams</p>
          <p className="text-3xl sm:text-4xl font-bold text-cyan-600 mt-1 sm:mt-2 hover:text-cyan-700 transition-colors duration-300">{upcomingExams}</p>
          <p className="text-xs sm:text-sm text-gray-600">Scheduled</p>
        </Card>
      </div>

      {/* Student & Teacher Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Recent Students" actions={
          <Link href="/admin/students" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">View All</Link>
        }>
          <div className="space-y-3">
            {recentStudents.length === 0 ? (
              <p className="text-sm text-gray-500">No students added yet.</p>
            ) : (
              recentStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">{student.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Roll No: {student.rollNo}</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Recent Teachers" actions={
          <Link href="/admin/teachers" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">View All</Link>
        }>
          <div className="space-y-3">
            {recentTeachers.length === 0 ? (
              <p className="text-sm text-gray-500">No teachers added yet.</p>
            ) : (
              recentTeachers.map(teacher => (
                <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">{teacher.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{teacher.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link 
            href="/admin/students" 
            className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
          >
            <Image 
              src="/addStudent.png" 
              alt="Manage Students" 
              width={32} 
              height={32} 
              className="mx-auto mb-2"
            />
            <p className="text-sm font-medium text-gray-700">Manage Students</p>
          </Link>
          
          <Link 
            href="/admin/fees" 
            className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
          >
            <Image 
              src="/manageFees.png" 
              alt="Manage Fees" 
              width={32} 
              height={32} 
              className="mx-auto mb-2"
            />
            <p className="text-sm font-medium text-gray-700">Manage Fees</p>
          </Link>
          
          <Link 
            href="/admin/exams" 
            className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
          >
            <Image 
              src="/scheduleExams.png" 
              alt="Schedule Exams" 
              width={32} 
              height={32} 
              className="mx-auto mb-2"
            />
            <p className="text-sm font-medium text-gray-700">Schedule Exam</p>
          </Link>
          
          <Link 
            href="/admin/notices" 
            className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
          >
            <Image 
              src="/postNotice.png" 
              alt="Post Notice" 
              width={32} 
              height={32} 
              className="mx-auto mb-2"
            />
            <p className="text-sm font-medium text-gray-700">Post Notice</p>
          </Link>
        </div>
      </Card>
    </div>
  );
}
