"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Leave } from "@/lib/store";
import Link from "next/link";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function AdminLeavesPage() {
  const [pending, setPending] = useState<Leave[]>([]);
  const [decided, setDecided] = useState<Leave[]>([]);
  const { success, error, toasts, removeToast } = useToast();

  useEffect(() => {
    const s = readStore();
    setPending(storeApi.getLeavesPendingForApprover({ approverRole: 'admin' }));
    
    // Get decided teacher leaves
    const decidedLeaves = (s.leaves || []).filter(l => 
      l.requesterRole === 'teacher' && 
      l.status !== 'pending'
    );
    setDecided(decidedLeaves);
  }, []);

  const decide = (id: string, ok: boolean) => {
    // Find the leave request to get teacher name
    const leave = pending.find(l => l.id === id);
    const teacherName = leave?.requesterName || 'Teacher';
    
    // Use a constant admin id for demo
    storeApi.decideLeave(id, ok, 'admin');
    const s = readStore();
    setPending(storeApi.getLeavesPendingForApprover({ approverRole: 'admin' }));
    
    // Update decided leaves list
    const decidedLeaves = (s.leaves || []).filter(l => 
      l.requesterRole === 'teacher' && 
      l.status !== 'pending'
    );
    setDecided(decidedLeaves);
    
    // Show appropriate toast
    if (ok) {
      success(`Leave approved for ${teacherName}`);
    } else {
      error(`Leave rejected for ${teacherName}`);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 sm:space-y-8">
      <Link href="/admin" className="text-cyan-800 hover:text-cyan-900 text-sm font-medium">← Back to Dashboard</Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Approve Teacher Leaves</h1>

      <Card title="Pending Requests">
        {pending.length === 0 ? (
          <div className="text-sm text-gray-500">No pending requests.</div>
        ) : (
          <div className="divide-y">
            {pending.map(l => (
              <div key={l.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{l.requesterName} — {l.type} Leave</div>
                    <div className="text-xs text-gray-600">{l.startDate} {l.startTime || ''} → {l.endDate} {l.endTime || ''}</div>
                    <div className="text-xs text-gray-500 max-w-[70ch]">{l.reason}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>decide(l.id, true)} className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs">Approve</button>
                    <button onClick={()=>decide(l.id, false)} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Teachers on Leave">
        {decided.length === 0 ? (
          <div className="text-sm text-gray-500">No teachers on leave.</div>
        ) : (
          <div className="divide-y">
            {decided.slice().reverse().map(l => (
              <div key={l.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{l.requesterName} — {l.type} Leave</div>
                    <div className="text-xs text-gray-600">{l.startDate} {l.startTime || ''} → {l.endDate} {l.endTime || ''}</div>
                    <div className="text-xs text-gray-500 max-w-[70ch]">{l.reason}</div>
                    {l.decidedAt && (
                      <div className="text-xs text-gray-400 mt-1">
                        Decided on: {new Date(l.decidedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      l.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {l.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      </div>
    </>
  );
}


