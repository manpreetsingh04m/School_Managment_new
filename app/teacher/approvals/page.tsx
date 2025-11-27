"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Leave } from "@/lib/store";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function TeacherApprovalsPage() {
  const [teacherId, setTeacherId] = useState<string>("");
  const [pending, setPending] = useState<Leave[]>([]);
  const [decided, setDecided] = useState<Leave[]>([]);
  const { success, error, toasts, removeToast } = useToast();

  useEffect(() => {
    const s = readStore();
    const u = getUser();
    if (u?.email) {
      const t = s.teachers.find(tt => tt.email === u.email);
      if (t) {
        setTeacherId(t.id);
        const list = storeApi.getLeavesPendingForApprover({ approverRole: 'teacher', approverId: t.id });
        setPending(list);
        
        // Get decided leaves for this teacher's class
        const decidedLeaves = (s.leaves || []).filter(l => 
          l.requesterRole === 'student' && 
          l.classId === t.classId && 
          l.status !== 'pending'
        );
        setDecided(decidedLeaves);
      }
    }
  }, []);

  const decide = (id: string, ok: boolean) => {
    if (!teacherId) return;
    
    // Find the leave request to get student name
    const leave = pending.find(l => l.id === id);
    const studentName = leave?.requesterName || 'Student';
    
    storeApi.decideLeave(id, ok, teacherId);
    const s = readStore();
    setPending(storeApi.getLeavesPendingForApprover({ approverRole: 'teacher', approverId: teacherId }));
    
    // Update decided leaves list
    const teacher = s.teachers.find(t => t.id === teacherId);
    if (teacher) {
      const decidedLeaves = (s.leaves || []).filter(l => 
        l.requesterRole === 'student' && 
        l.classId === teacher.classId && 
        l.status !== 'pending'
      );
      setDecided(decidedLeaves);
    }
    
    // Show appropriate toast
    if (ok) {
      success(`Leave approved for ${studentName}`);
    } else {
      error(`Leave rejected for ${studentName}`);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 sm:space-y-8">
      <Link href="/teacher" className="text-sky-700 hover:text-sky-800 text-sm font-medium">← Back to Dashboard</Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Approve Student Leaves</h1>

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

      <Card title="Students on Leave">
        {decided.length === 0 ? (
          <div className="text-sm text-gray-500">No students on leave.</div>
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


