/**
 * ADMIN TIMETABLE MANAGEMENT PAGE
 *
 * Why this file exists:
 * - Allows administrators to create, view, and delete class timetables for each day.
 *
 * What it does:
 * - Reads classes/teachers/timetables from the local store
 * - Shows per-day view selector and class cards with summary
 * - Opens a modal to add a weekly timetable across days for a selected class
 * - Persists timetables via `storeApi.addTimetable` and supports deletion
 *
 * Where key functionality is:
 * - Day selection UI: day chip buttons
 * - Create timetable: modal form with per-day period lists
 * - Period editing: `updatePeriod` updates time/subject/teacher
 * - Data access: `readStore`, `storeApi` (lib/store.ts)
 */
"use client";
import { useCallback, useEffect, useState } from "react";
// import Link from "next/link";
import Card from "@/components/ui/Card";
import TimePicker from "@/components/ui/time-picker";
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

export default function AdminTimetablePage() {
  // App data loaded from localStorage-backed store
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [showAddTimetable, setShowAddTimetable] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [dayPeriods, setDayPeriods] = useState<Record<string, Omit<TimetablePeriod, "id">[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  });

  useEffect(() => setState(readStore()), []);

  // Append a new empty period row for a day in the creation modal
  const addPeriod = (day: string) => {
    setDayPeriods(prev => ({
      ...prev,
      [day]: [...prev[day], { timeSlot: "12:00 PM - 12:45 PM", teacherId: "", subject: "" }]
    }));
  };

  // Update a field of a period (timeSlot/subject/teacherId) for a day
  const updatePeriod = useCallback((day: string, index: number, field: keyof Omit<TimetablePeriod, "id">, value: string) => {
    setDayPeriods(prev => ({
      ...prev,
      [day]: prev[day].map((period, i) => 
        i === index ? { ...period, [field]: value } : period
      )
    }));
  }, []);

  // Remove a period row from a day
  const removePeriod = (day: string, index: number) => {
    setDayPeriods(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  // Save all days that have valid periods for the selected class
  const saveTimetable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    
    // Save timetables for all days that have periods
    DAYS.forEach(day => {
      const periods = dayPeriods[day];
      const validPeriods = periods.filter(p => p.timeSlot && p.teacherId && p.subject);
      if (validPeriods.length > 0) {
        storeApi.addTimetable(selectedClassId, day, validPeriods);
      }
    });

    setState(readStore());
    setShowAddTimetable(false);
    setSelectedClassId("");
    setDayPeriods({
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    });
  };

  // Subjects available for the chosen class
  const getClassSubjects = (classId: string) => {
    const cls = state.classes.find(c => c.id === classId);
    return cls?.subjects || [];
  };

  // Teachers who can teach a subject (primary or assigned)
  const getAvailableTeachers = (subject: string) => {
    return state.teachers.filter(t => 
      t.subject === subject || 
      (t.subjectAssignments || []).some(a => a.subject === subject)
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Timetable Management</h1>
        <button 
          onClick={() => setShowAddTimetable(true)} 
          className="bg-cyan-950 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-cyan-900 transition-colors flex items-center gap-1 sm:gap-2"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span className="hidden sm:inline">Add Timetable</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <Card title="Existing Timetables">
        {/* Day Selector */}
        <div className="flex justify-center gap-2 overflow-x-auto pb-4 mb-6">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
                selectedDay === day 
                  ? 'bg-cyan-950 text-white shadow-lg shadow-cyan-950/30 scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Class Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.classes.map(cls => {
            const timetable = state.timetables.find(t => t.classId === cls.id && t.day === selectedDay);
            return (
              <div key={cls.id} className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer relative group" onClick={() => window.location.href = `/admin/timetable/class/${cls.id}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{cls.name}</h3>
                    <p className="text-sm text-gray-600">{timetable ? `${timetable.periods.length} periods` : 'No timetable'}</p>
                  </div>
                  {timetable && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete the ${selectedDay} timetable for ${cls.name}?`)) {
                          storeApi.deleteTimetable(timetable.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700"
                      aria-label="Delete timetable"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {timetable && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-gray-600 mb-2">{selectedDay.toUpperCase()} SCHEDULE</div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {timetable.periods.slice(0, 3).map((period) => {
                        const teacher = state.teachers.find(t => t.id === period.teacherId);
                        return (
                          <div key={period.id} className="bg-gray-50 rounded-lg p-2">
                            <div className="text-xs font-medium text-gray-800">{period.timeSlot}</div>
                            <div className="text-xs text-gray-600">{period.subject}</div>
                            <div className="text-xs text-gray-500">By: {teacher?.name || "Unknown"}</div>
                          </div>
                        );
                      })}
                      {timetable.periods.length > 3 && (
                        <div className="text-xs text-gray-400 text-center">
                          +{timetable.periods.length - 3} more periods
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {!timetable && (
                  <div className="mt-4 text-center py-4 text-gray-500 text-sm">
                    No {selectedDay} timetable created yet
                  </div>
                )}
              </div>
            );
          })}
          {state.classes.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No classes created yet. Create classes first to add timetables.
            </div>
          )}
        </div>
      </Card>

      {showAddTimetable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Add Timetable</h2>
              <button 
                onClick={() => setShowAddTimetable(false)} 
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={saveTimetable} className="space-y-6">
              {/* Class Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                <select 
                  value={selectedClassId} 
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  aria-label="Select Class"
                >
                  <option value="">Choose a class...</option>
                  {state.classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {/* Days Tabs */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Weekly Schedule</h3>
                <div className="space-y-6">
                  {DAYS.map(day => (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-gray-800">{day}</h4>
                        <button 
                          type="button" 
                          onClick={() => addPeriod(day)}
                          className="bg-cyan-950 text-white px-3 py-1.5 rounded-md text-sm hover:bg-cyan-900 transition-colors"
                        >
                          + Add Period
                        </button>
                      </div>

                      <div className="space-y-3">
                        {dayPeriods[day].map((period, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">Period {index + 1}</span>
                              <button 
                                type="button" 
                                onClick={() => removePeriod(day, index)}
                                className="text-red-500 hover:text-red-700 p-1"
                                aria-label="Remove period"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Time Slot */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Time Slot</label>
                                <TimePicker 
                                  value={period.timeSlot} 
                                  onChange={(value) => updatePeriod(day, index, 'timeSlot', value)}
                                />
                              </div>

                              {/* Subject */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                                <select 
                                  value={period.subject} 
                                  onChange={e => updatePeriod(day, index, 'subject', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                  required
                                  disabled={!selectedClassId}
                                  aria-label="Select Subject"
                                >
                                  <option value="">Select subject...</option>
                                  {getClassSubjects(selectedClassId).map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Teacher */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Teacher</label>
                                <select 
                                  value={period.teacherId} 
                                  onChange={e => updatePeriod(day, index, 'teacherId', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                  required
                                  disabled={!period.subject}
                                  aria-label="Select Teacher"
                                >
                                  <option value="">Select teacher...</option>
                                  {getAvailableTeachers(period.subject).map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {dayPeriods[day].length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No periods added for {day}. Click &quot;Add Period&quot; to start.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddTimetable(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-cyan-950 text-white rounded-md hover:bg-cyan-900 transition-colors"
                >
                  Save Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}