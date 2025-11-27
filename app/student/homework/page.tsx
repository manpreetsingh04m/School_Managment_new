"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readStore } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function ViewHomeworkPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [studentInfo, setStudentInfo] = useState<{ name: string; classId: string } | null>(null);

  useEffect(() => {
    const store = readStore();
    setState(store);
    
    // Get current user and find their student record
    const user = getUser();
    if (user && user.email) {
      const student = store.students.find(s => s.email === user.email);
      if (student) {
        setStudentInfo(student);
      }
    }
  }, []);

  // Get homework assignments for the student's class
  const homeworkAssignments = studentInfo ? 
    state.homeworkAssignments.filter(hw => {
      // Find the student's class by ID to get the actual class name
      const studentClass = state.classes.find(c => c.id === studentInfo.classId);
      const className = studentClass ? studentClass.name : studentInfo.classId;
      
      // Match homework by class name or class ID
      return hw.classId === className || hw.classId === studentInfo.classId;
    }) : 
    state.homeworkAssignments;

  const getStatusColor = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "bg-red-100 text-red-800";
    if (diffDays <= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "OVERDUE";
    if (diffDays <= 2) return "DUE SOON";
    return "PENDING";
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Homework</h1>
        <p className="text-gray-500">View your assigned homework and assignments.</p>
      </div>

      <Card title="Homework Assignments">
        <div className="space-y-4">
          {homeworkAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No homework assignments available.</p>
              <p className="text-sm mt-2">Check back later for new assignments.</p>
            </div>
          ) : (
            homeworkAssignments.map((homework) => {
              const teacher = state.teachers.find(t => t.id === homework.teacherId);
              return (
                <div key={homework.id} className="p-3 sm:p-4 border rounded-lg bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2 sm:gap-0">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{homework.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(homework.dueDate)} self-start sm:self-auto`}>
                      {getStatusText(homework.dueDate)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed">{homework.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs text-gray-500">
                    <span>Due: {new Date(homework.dueDate).toLocaleDateString()}</span>
                    <span>Teacher: {teacher?.name || "Unknown"}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Subject: {homework.subject}</span>
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