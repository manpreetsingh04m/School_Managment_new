"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readStore } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function ViewNoticesPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [user] = useState(getUser());

  useEffect(() => {
    setState(readStore());
  }, []);

  // Get notices relevant to the student (school-wide or their class)
  const studentClass = user?.grade ? state.classes.find(c => c.name === user.grade) : null;
  const relevantNotices = state.notices.filter(notice => 
    !notice.classId || notice.classId === studentClass?.id
  );

  const getPriorityColor = (index: number) => {
    // Simple priority based on notice age
    if (index === 0) return "bg-red-100 text-red-800";
    if (index < 3) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getTypeColor = (notice: { title: string }) => {
    // Determine type based on notice content
    if (notice.title.toLowerCase().includes('test') || notice.title.toLowerCase().includes('exam')) {
      return "bg-purple-100 text-purple-800";
    }
    if (notice.title.toLowerCase().includes('holiday') || notice.title.toLowerCase().includes('closed')) {
      return "bg-green-100 text-green-800";
    }
    if (notice.title.toLowerCase().includes('assignment') || notice.title.toLowerCase().includes('homework')) {
      return "bg-blue-100 text-blue-800";
    }
    if (notice.title.toLowerCase().includes('sports') || notice.title.toLowerCase().includes('event')) {
      return "bg-orange-100 text-orange-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (notice: { title: string }) => {
    if (notice.title.toLowerCase().includes('test') || notice.title.toLowerCase().includes('exam')) {
      return "Academic";
    }
    if (notice.title.toLowerCase().includes('holiday') || notice.title.toLowerCase().includes('closed')) {
      return "Holiday";
    }
    if (notice.title.toLowerCase().includes('assignment') || notice.title.toLowerCase().includes('homework')) {
      return "Assignment";
    }
    if (notice.title.toLowerCase().includes('sports') || notice.title.toLowerCase().includes('event')) {
      return "Event";
    }
    return "General";
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">School Notices</h1>
        <p className="text-gray-500">Stay updated with the latest school announcements and notices.</p>
      </div>

      <Card>
        <div className="space-y-4">
          {relevantNotices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No notices available for your class.</p>
            </div>
          ) : (
            relevantNotices.slice().reverse().map((notice, index) => (
              <div key={notice.id} className="p-3 sm:p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-lg">{notice.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notice)} self-start sm:self-auto`}>
                        {getTypeLabel(notice)}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(index)} self-start sm:self-auto`}>
                      {index === 0 ? 'HIGH' : index < 3 ? 'MEDIUM' : 'LOW'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{notice.message}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs text-gray-500">
                    <span>Posted on: {new Date(notice.createdAt).toLocaleDateString()}</span>
                    <span>Notice #{notice.id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
