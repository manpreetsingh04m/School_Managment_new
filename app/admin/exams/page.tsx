"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function AdminExamsPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [] });
  const [showModal, setShowModal] = useState(false);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [instructions, setInstructions] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const { success, error, toasts, removeToast } = useToast();

  useEffect(() => {
    const store = readStore();
    setState(store);
  }, []);

  const createSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subjectId || !title.trim() || !date) {
      error("Please fill in all required fields");
      return;
    }
    
    storeApi.addExamSchedule("", classId, subjectId, { 
      title: title.trim(), 
      date, 
      startTime: startTime || undefined, 
      endTime: endTime || undefined, 
      room: room || undefined, 
      instructions: instructions || undefined 
    });
    
    // Clear form
    setClassId(""); setSubjectId(""); setTitle(""); setDate(""); 
    setStartTime(""); setEndTime(""); setRoom(""); setInstructions("");
    setShowModal(false);
    setState(readStore());
    
    // Show success toast
    success("Exam schedule created successfully!");
  };

  const schedules = (state.examSchedules || []).slice().reverse();

  const deleteSchedule = () => {
    if (!confirmDelete) return;
    storeApi.removeExamSchedule(confirmDelete.id);
    setState(readStore());
    setConfirmDelete(null);
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Exam Scheduling</h1>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-cyan-950 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-cyan-900 transition-colors flex items-center gap-1 sm:gap-2"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span className="hidden sm:inline">Create Schedule</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      <Card title="All Exam Schedules">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map(s => {
            const cls = state.classes.find(c => c.id === s.classId);
            const subj = state.subjects.find(x => x.id === s.subjectId);
            return (
              <div key={s.id} className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800">{s.title}</div>
                  <div className="text-xs text-gray-500">{s.date}</div>
                </div>
                <div className="mt-1 text-sm text-gray-700">{subj?.name} • {cls?.name}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  {s.startTime && <span className="px-2 py-1 rounded bg-gray-100 border">Start {s.startTime}</span>}
                  {s.endTime && <span className="px-2 py-1 rounded bg-gray-100 border">End {s.endTime}</span>}
                  {s.room && <span className="px-2 py-1 rounded bg-gray-100 border">Room {s.room}</span>}
                </div>
                {s.instructions && <div className="mt-2 text-xs text-gray-500">{s.instructions}</div>}
                <div className="mt-3 flex justify-end gap-2">
                  <button 
                    onClick={() => setConfirmDelete({ id: s.id, title: s.title })} 
                    className="px-3 py-1 rounded-md text-xs bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {schedules.length === 0 && <div className="text-sm text-gray-500">No exams scheduled yet.</div>}
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create Exam Schedule</h2>
              <button 
                onClick={() => setShowModal(false)} 
                aria-label="Close" 
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={createSchedule} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Class</label>
            <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
              <SelectContent>
                    {state.classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Subject</label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Exam Title</label>
                <input 
                  placeholder="e.g., Mid Term, Unit Test, Final Exam" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md"  
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md"  
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Room (optional)</label>
                <input 
                  placeholder="e.g., Room 101" 
                  value={room} 
                  onChange={e => setRoom(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Start Time (optional)</label>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md" 
                  placeholder="Select start time"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">End Time (optional)</label>
                <input 
                  type="time" 
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md" 
                  placeholder="Select end time"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Instructions (optional)</label>
                <textarea 
                  placeholder="Special instructions for students..." 
                  value={instructions} 
                  onChange={e => setInstructions(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md min-h-[80px]" 
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 rounded-md border"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-md bg-cyan-950 text-white hover:bg-cyan-900"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Confirm Deletion</h2>
              <button aria-label="Close" onClick={() => setConfirmDelete(null)} className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-4 sm:mb-6">
              <p>Are you sure you want to permanently delete the exam schedule <span className="font-semibold">&ldquo;{confirmDelete.title}&rdquo;</span>? This action cannot be undone.</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-md border text-sm sm:text-base">Cancel</button>
              <button onClick={deleteSchedule} className="px-4 py-2 rounded-md text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white">
                Delete Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}


