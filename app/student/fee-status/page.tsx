"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function FeeStatusPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [] });
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  // const [user] = useState(getUser());

  useEffect(() => {
    const store = readStore();
    setState(store);
    
    // Get current user and find their student record
    const user = getUser();
    if (user && user.email) {
      const student = store.students.find(s => s.email === user.email);
      if (student) {
        setStudentId(student.id);
        setClassId(student.classId);
        
        // Ensure student has fee configuration if class has fee config
        const classFeeConfig = storeApi.getClassFeeConfig(student.classId);
        if (classFeeConfig) {
          // Recompute installments for this student
          storeApi.recomputeStudentInstallments(student.id);
        }
        return; // Exit early if user found
      }
    }
    
    // Fallback to first student if no user found (for demo purposes)
    const first = store.students[0];
    if (first) { 
      setStudentId(first.id); 
      setClassId(first.classId); 
    } else { 
      setClassId("8A"); 
    }
  }, []);

  const cfg = classId ? storeApi.getClassFeeConfig(classId) : null;
  const feeState = studentId ? storeApi.getStudentFeeState(studentId) : null;
  const installments = feeState?.installments || [];
  const tuition = cfg?.baseFeeAmount || 0;
  const extras = feeState?.extraFees || {};
  const extrasTotal = Object.values(extras).reduce((s, n)=> s + Number(n||0), 0);
  const total = installments.reduce((s,i)=> s + i.amount, 0);
  const paid = installments.filter(i=>i.paid).reduce((s,i)=> s + i.amount, 0);
  const remaining = Math.max(0, Math.round((total - paid)*100)/100);
  const currentStudent = state.students.find(s => s.id === studentId);
  const currentClass = state.classes.find(c => c.id === classId);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/student" 
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Fee Status</h1>
        <p className="text-sm sm:text-base text-gray-500">
          {currentStudent ? (
            <>View tuition, extra fees and installment progress for <strong>{currentStudent.name}</strong> in <strong>{currentClass?.name || classId}</strong>.</>
          ) : (
            "View tuition, extra fees and installment progress."
          )}
        </p>
      </div>

      {!cfg ? (
        <Card title="Fee Configuration Not Found">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Fee Configuration</h3>
            <p className="text-gray-600 mb-4">
              No fee configuration has been set up for your class ({currentClass?.name || classId}) yet.
            </p>
            <p className="text-sm text-gray-500">
              Please contact the school administration to set up your fee structure.
            </p>
          </div>
        </Card>
      ) : (
        <Card title="Summary">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-lg border p-3 sm:p-4 bg-white">
              <div className="text-xs sm:text-sm text-gray-600">Tuition Fee</div>
              <div className="text-xl sm:text-2xl font-semibold text-gray-800">₹{tuition.toFixed(2)}</div>
            </div>
            <div className="rounded-lg border p-3 sm:p-4 bg-white">
              <div className="text-xs sm:text-sm text-gray-600">Extra Fees</div>
              <div className="text-xl sm:text-2xl font-semibold text-gray-800">₹{extrasTotal.toFixed(2)}</div>
              <div className="mt-2 flex flex-wrap gap-1 sm:gap-2 text-xs">
                {Object.entries(extras).length===0 && <span className="text-gray-500">No extra fees</span>}
                {Object.entries(extras).map(([k,v])=> (
                  <span key={k} className="px-2 py-1 rounded bg-gray-100 text-gray-700 border">{k.charAt(0).toUpperCase()+k.slice(1)} ₹{Number(v).toFixed(2)}</span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border p-3 sm:p-4 bg-white">
              <div className="text-xs sm:text-sm text-gray-600">Installments</div>
              <div className="text-xl sm:text-2xl font-semibold text-gray-800">{installments.length}</div>
              <div className="mt-2 text-xs sm:text-sm text-gray-700">
                <div>Paid: ₹{paid.toFixed(2)}</div>
                <div>Due: ₹{remaining.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {cfg && (
        <Card title="Installment Details">
          <div className="space-y-2">
            {installments.length===0 && (
              <div className="text-sm text-gray-500">No installments yet. Your school admin will configure your class fees.</div>
            )}
            {installments.map(inst => (
              <div key={inst.index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border rounded-md px-3 py-2 bg-gray-50">
                <div className="text-xs sm:text-sm">
                  <div className="font-medium text-gray-800">Installment #{inst.index}</div>
                  <div className="text-gray-600">₹{inst.amount.toFixed(2)} • Due {inst.dueDate || "-"}</div>
                </div>
                <span className={`px-3 py-1 rounded-md text-xs self-start sm:self-auto ${inst.paid?"bg-green-100 text-green-700 border border-green-200":"bg-amber-50 text-amber-700 border border-amber-200"}`}>{inst.paid?"Paid":"Unpaid"}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Notes">
        <div className="text-xs text-gray-600">
          This is a read-only view. For payments or corrections, please contact the school accounts office.
        </div>
      </Card>
    </div>
  );
}

