"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Leave } from "@/lib/store";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function TeacherLeavePage() {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<'Casual' | 'Sick' | 'Annual' | 'Other'>('Casual');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [history, setHistory] = useState<Leave[]>([]);
  const { success, error, toasts, removeToast } = useToast();

  useEffect(() => {
    const s = readStore();
    const u = getUser();
    if (u?.email) {
      const t = s.teachers.find(tt => tt.email === u.email);
      if (t) {
        setTeacherId(t.id);
        setHistory(storeApi.getLeavesForRequester('teacher', t.id));
      }
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !startDate || !endDate || !reason.trim()) {
      error("Please fill in all required fields");
      return;
    }
    
    storeApi.requestLeave({
      requesterRole: 'teacher',
      requesterId: teacherId,
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
    if (teacherId) setHistory(storeApi.getLeavesForRequester('teacher', teacherId));
    
    // Show success toast
    success("Leave application submitted successfully");
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
        <Link href="/teacher" className="text-sky-700 hover:text-sky-800 text-sm font-medium">← Back to Dashboard</Link>
        <button onClick={()=>setShowModal(true)} className="bg-sky-800 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Apply for Leave</button>
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
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Leave Type</label>
                <div className="flex gap-2">
                  {(['Casual','Sick','Annual','Other'] as const).map(t => (
                    <button key={t} type="button" onClick={()=>setType(t)} className={`px-3 py-1.5 rounded-full text-xs border ${type===t?'bg-sky-800 text-white border-sky-800':'bg-gray-50 text-gray-700'}`}>{t} Leave</button>
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
              {/* Contact number field removed */}
              <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                <button className="px-4 py-2 rounded-md bg-sky-800 text-white">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}


