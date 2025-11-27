"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import { readStore } from "@/lib/store";
import type { Store, Timetable, TimetablePeriod } from "@/lib/store";

export default function TimetableDetailPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [timetable, setTimetable] = useState<Timetable | null>(null);

  const params = useParams();
  
  useEffect(() => {
    const store = readStore();
    setState(store);
    const foundTimetable = store.timetables.find(t => t.id === params.id);
    setTimetable(foundTimetable || null);
  }, [params.id]);

  if (!timetable) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-800">Timetable Not Found</h1>
          <p className="text-gray-600 mt-2">The requested timetable could not be found.</p>
          <Link href="/admin/timetable" className="text-cyan-950 hover:text-cyan-800 font-medium">
            ← Back to Timetable Management
          </Link>
        </div>
      </div>
    );
  }

  const cls = state.classes.find(c => c.id === timetable.classId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/timetable" 
          className="flex items-center gap-2 text-cyan-950 hover:text-cyan-800 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Timetable Management
        </Link>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{cls?.name || timetable.classId} Timetable</h1>
        <p className="text-gray-500 mt-2">{timetable.day} Schedule</p>
      </div>

      {/* Timetable Details */}
      <Card title="Schedule Details">
        <div className="space-y-4">
          {timetable.periods.map((period: TimetablePeriod, index: number) => {
            const teacher = state.teachers.find(t => t.id === period.teacherId);
            return (
              <div key={period.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-cyan-950 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-600">Time Slot</div>
                        <div className="text-lg font-semibold text-gray-800">{period.timeSlot}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Subject</div>
                        <div className="text-lg font-semibold text-gray-800">{period.subject}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Teacher</div>
                        <div className="text-lg font-semibold text-gray-800">{teacher?.name || "Unknown"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {timetable.periods.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No periods scheduled for this class.
            </div>
          )}
        </div>
      </Card>

      {/* Class Information */}
      <Card title="Class Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Class Name</div>
            <div className="text-lg font-semibold text-gray-800">{cls?.name || timetable.classId}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Day</div>
            <div className="text-lg font-semibold text-gray-800">{timetable.day}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Total Periods</div>
            <div className="text-lg font-semibold text-gray-800">{timetable.periods.length}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Created</div>
            <div className="text-lg font-semibold text-gray-800">
              {new Date(timetable.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Class Teacher</div>
            <div className="text-lg font-semibold text-gray-800">
              {state.teachers.find(t => t.classId === timetable.classId && t.isClassTeacher)?.name || "Not assigned"}
            </div>
          </div>
        </div>
      </Card>

      {/* Subjects Covered */}
      {cls?.subjects && cls.subjects.length > 0 && (
        <Card title="Subjects Covered">
          <div className="flex flex-wrap gap-2">
            {cls.subjects.map((subject, idx) => {
              const colorClasses = [
                "bg-blue-100 text-blue-700",
                "bg-green-100 text-green-700", 
                "bg-purple-100 text-purple-700",
                "bg-orange-100 text-orange-700",
                "bg-pink-100 text-pink-700",
                "bg-indigo-100 text-indigo-700"
              ];
              const color = colorClasses[idx % colorClasses.length];
              
              return (
                <span key={subject} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
                  {subject}
                </span>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
