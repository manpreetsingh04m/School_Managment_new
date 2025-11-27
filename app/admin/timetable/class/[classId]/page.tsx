/**
 * CLASS TIMETABLE DETAIL PAGE (Admin)
 *
 * Why this file exists:
 * - Shows a detailed, per-day timetable for a specific class, with the
 *   ability to remove periods or entire day schedules.
 *
 * What it does:
 * - Resolves the dynamic `classId` param
 * - Loads class, teacher, and timetable data from the store
 * - Lets admin switch days, view all periods, and delete entries
 * - Provides quick summary cards (days with timetables, total periods)
 *
 * Where key functionality is:
 * - Day selector chips: update `selectedDay`
 * - Period deletion: `storeApi.updateTimetable` with filtered periods
 * - Day deletion: `storeApi.deleteTimetable`
 * - Data access: `readStore`, `storeApi` (lib/store.ts)
 */
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Store, TimetablePeriod } from "@/lib/store";

const DAYS = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export default function ClassTimetableDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [selectedDay, setSelectedDay] = useState("Monday");
  
  const resolvedParams = React.use(params);

  useEffect(() => {
    const store = readStore();
    setState(store);
  }, []);

  const cls = state.classes.find(c => c.id === resolvedParams.classId);
  const timetables = state.timetables.filter(t => t.classId === resolvedParams.classId);
  const currentTimetable = timetables.find(t => t.day === selectedDay);

  if (!cls) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-800">Class Not Found</h1>
          <p className="text-gray-600 mt-2">The requested class could not be found.</p>
          <Link href="/admin/timetable" className="text-cyan-950 hover:text-cyan-800 font-medium">
            ← Back to Timetable Management
          </Link>
        </div>
      </div>
    );
  }

  // Delete entire day timetable by id
  const deleteTimetable = (timetableId: string) => {
    storeApi.deleteTimetable(timetableId);
    setState(readStore());
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link 
          href="/admin/timetable" 
          className="flex items-center gap-1 sm:gap-2 text-cyan-950 hover:text-cyan-800 font-medium text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Back to Timetable Management</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* Title */}
      <div className="text-center px-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{cls.name} Timetable</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">Complete weekly schedule for this class</p>
      </div>

      {/* Day Selector */}
      <div className="flex justify-center gap-1 sm:gap-2 overflow-x-auto pb-2 px-2 sm:px-4">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 min-w-[60px] sm:min-w-0 ${
              selectedDay === day 
                ? 'bg-cyan-950 text-white shadow-lg shadow-cyan-950/30 scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            <span className="hidden sm:inline">{day.slice(0, 3)}</span>
            <span className="sm:hidden">{day.slice(0, 1)}</span>
          </button>
        ))}
      </div>

      {/* Timetable Details */}
      <Card title={`${selectedDay} Schedule`}>
        {currentTimetable ? (
          <div className="space-y-3 sm:space-y-4">
            {currentTimetable.periods.map((period: TimetablePeriod, index: number) => {
              const teacher = state.teachers.find(t => t.id === period.teacherId);
              return (
                <div key={period.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-950 text-white rounded-lg flex items-center justify-center text-sm sm:text-lg font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                        <div className="break-words">
                          <div className="text-xs sm:text-sm font-medium text-gray-600">Time Slot</div>
                          <div className="text-sm sm:text-lg font-semibold text-gray-800">{period.timeSlot}</div>
                        </div>
                        <div className="break-words">
                          <div className="text-xs sm:text-sm font-medium text-gray-600">Subject</div>
                          <div className="text-sm sm:text-lg font-semibold text-gray-800">{period.subject}</div>
                        </div>
                        <div className="break-words">
                          <div className="text-xs sm:text-sm font-medium text-gray-600">Teacher</div>
                          <div className="text-sm sm:text-lg font-semibold text-gray-800">{teacher?.name || "Unknown"}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete this period?`)) {
                            // Create new periods array without this period
                            const newPeriods = currentTimetable.periods.filter((p: TimetablePeriod) => p.id !== period.id);
                            storeApi.updateTimetable(currentTimetable.id, currentTimetable.day, newPeriods);
                            setState(readStore());
                          }
                        }}
                        className="p-2 sm:p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 touch-manipulation"
                        aria-label="Delete period"
                      >
                        <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
            No timetable created for {selectedDay} yet.
          </div>
        )}
      </Card>

      {/* Class Information */}
      <Card title="Class Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Class Name</div>
            <div className="text-sm sm:text-lg font-semibold text-gray-800">{cls.name}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Class Teacher</div>
            <div className="text-sm sm:text-lg font-semibold text-gray-800">
              {state.teachers.find(t => t.classId === resolvedParams.classId && t.isClassTeacher)?.name || "Not assigned"}
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Days with Timetables</div>
            <div className="text-sm sm:text-lg font-semibold text-gray-800">{timetables.length} days</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Total Periods</div>
            <div className="text-sm sm:text-lg font-semibold text-gray-800">
              {timetables.reduce((sum, t) => sum + t.periods.length, 0)} periods
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Overview */}
      <Card title="Weekly Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {DAYS.map(day => {
            const dayTimetable = timetables.find(t => t.day === day);
            return (
              <div key={day} className={`border rounded-lg p-3 sm:p-4 ${dayTimetable ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800">{day}</h4>
                  {dayTimetable && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the entire ${day} timetable for ${cls.name}?`)) {
                          deleteTimetable(dayTimetable.id);
                        }
                      }}
                      className="p-1 sm:p-1 rounded hover:bg-red-100 text-red-500 hover:text-red-700 touch-manipulation"
                      aria-label={`Delete ${day} timetable`}
                    >
                      <svg className="w-3 h-3 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {dayTimetable ? `${dayTimetable.periods.length} periods` : 'No timetable'}
                </div>
                {dayTimetable && (
                  <div className="mt-1 sm:mt-2 text-xs text-gray-500 break-words">
                    {dayTimetable.periods.slice(0, 2).map((period: TimetablePeriod) => period.subject).join(', ')}
                    {dayTimetable.periods.length > 2 && '...'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
