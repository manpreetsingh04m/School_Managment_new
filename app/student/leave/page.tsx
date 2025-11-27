"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Leave } from "@/lib/store";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function StudentLeavePage() {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<'Casual' | 'Sick' | 'Annual' | 'Other'>('Casual');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [studentId, setStudentId] = useState<string>("");
  const [history, setHistory] = useState<Leave[]>([]);
  const { success, error, toasts, removeToast } = useToast();

  useEffect(() => {
    const s = readStore();
    const u = getUser();
    
    if (!u) {
      return;
    }
    
    // Check if user is a student, if not show error message
    if (u.role !== 'student') {
      // Don't redirect, just show error
      return;
    }
    
    if (u?.email) {
      const stu = s.students.find(st => st.email === u.email);
      if (stu) {
        setStudentId(stu.id);
        setHistory(storeApi.getLeavesForRequester('student', stu.id));
      }
    }
  }, []);

  // Handle error notifications when modal opens and studentId is missing
  const handleModalOpen = () => {
    if (!studentId) {
      const u = getUser();
      if (!u) {
        error("You are not logged in. Please sign in again.");
      } else if (u.role !== 'student') {
        error("Access denied. This page is for students only.");
      } else {
        error("Student record not found. Please contact administrator.");
      }
    }
    setShowModal(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId || !startDate || !endDate || !reason.trim()) {
      if (!studentId) {
        error("Student ID not found. Please refresh the page and try again.");
      } else if (!startDate) {
        error("Please select a start date.");
      } else if (!endDate) {
        error("Please select an end date.");
      } else if (!reason.trim()) {
        error("Please provide a reason for your leave.");
      }
      return;
    }
    
    try {
      storeApi.requestLeave({
        requesterRole: 'student',
        requesterId: studentId,
        type,
        startDate,
        endDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        reason: reason.trim(),
      });
      
      setShowModal(false);
      setReason(""); setStartDate(""); setEndDate(""); setStartTime(""); setEndTime("");
      // Refresh the history after submitting
      if (studentId) setHistory(storeApi.getLeavesForRequester('student', studentId));
      
      // Show success toast
      success("Leave application submitted successfully");
    } catch {
      error("Failed to submit leave application. Please try again.");
    }
  };

  const statusBadge = (status: Leave['status']) => (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
      status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
      'bg-amber-50 text-amber-700 border border-amber-200'
    }`}>{status.toUpperCase()}</span>
  );

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/student" className="text-blue-800 hover:text-blue-900 text-sm font-medium">← Back to Dashboard</Link>
        <button onClick={handleModalOpen} className="bg-blue-950 hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium">Apply for Leave</button>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Leaves</h1>

      <Card title="Previous Requests">
        {history.length === 0 ? (
          <div className="text-sm text-gray-500">No leave requests yet.</div>
        ) : (
          <div className="divide-y">
            {history.slice().reverse().map(l => (
              <div key={l.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800 text-sm">{l.type} Leave</div>
                  <div className="text-xs text-gray-600">{l.startDate} {l.startTime || ''} → {l.endDate} {l.endTime || ''}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[60ch]">{l.reason}</div>
                </div>
                {statusBadge(l.status)}
              </div>
            ))}
          </div>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
          <div className="bg-white rounded-xl w-full max-w-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">Apply for Leave</h2>
              <button onClick={()=>setShowModal(false)} aria-label="Close" className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!studentId && (
                <div className="sm:col-span-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">⚠️ Student information not loaded. Please refresh the page.</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Leave Type</label>
                <div className="flex gap-2">
                  {(['Casual','Sick','Annual','Other'] as const).map(t => (
                    <button key={t} type="button" onClick={()=>setType(t)} className={`px-3 py-1.5 rounded-full text-xs border ${type===t?'bg-blue-950 text-white border-blue-950':'bg-gray-50 text-gray-700'}`}>{t} Leave</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                <input type="date" placeholder="Start date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">End Date</label>
                <input type="date" placeholder="End date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Start Time (optional)</label>
                <input type="time" placeholder="Start time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">End Time (optional)</label>
                <input type="time" placeholder="End time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Reason for Leave</label>
                <textarea value={reason} onChange={e=>setReason(e.target.value)} className="w-full px-3 py-2 border rounded-md min-h-[100px]" placeholder="Please provide a detailed reason..." />
              </div>
              {/* Contact number and substitute teacher fields removed */}
              <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                <button type="submit" disabled={!studentId} className={`px-4 py-2 rounded-md text-white ${!studentId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-950 hover:bg-blue-900'}`}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}


