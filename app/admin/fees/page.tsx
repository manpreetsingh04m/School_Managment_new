/**
 * ADMIN FEES PAGE
 *
 * Why this file exists:
 * - Configure class-level fee amounts and due dates; mark student payments.
 *
 * What it does:
 * - Sets fee for a selected class (amount + optional due date)
 * - Lists students of the selected class with a Mark Paid action
 * - Updates and persists via `storeApi.setClassFee` and `storeApi.markFeePaid`
 *
 * Where key functionality is:
 * - Set fee form: class/amount/due + Save -> `setFee()`
 * - Mark paid: button per student -> `markPaid()`
 * - Data access: `readStore()` and `storeApi`
 */
"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Store, Student } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminFeesPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [classId, setClassId] = useState("");
  const [baseFee, setBaseFee] = useState<number>(0);
  const [numInstallments, setNumInstallments] = useState<number>(4);
  const [dates, setDates] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [filterClassId, setFilterClassId] = useState("");
  // const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editFor, setEditFor] = useState<Student | null>(null);
  const [extraFees, setExtraFees] = useState<Record<string, string>>({});
  const [newFeeType, setNewFeeType] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [payFor, setPayFor] = useState<Student | null>(null);
  const [stagedInstalls, setStagedInstalls] = useState<{ index: number; paid: boolean }[]>([]);
  const [receiptFor, setReceiptFor] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(()=> setState(readStore()), []);

  useEffect(()=>{
    if (!classId) return;
    const cfg = storeApi.getClassFeeConfig(classId);
    if (cfg) {
      setBaseFee(cfg.baseFeeAmount);
      setNumInstallments(cfg.numInstallments);
      setDates(cfg.installmentDates);
    } else {
      setBaseFee(0);
      setNumInstallments(4);
      setDates(Array.from({length:4},()=>""));
    }
  }, [classId]);

  useEffect(()=>{
    // ensure dates length follows numInstallments
    setDates(prev => {
      const next = prev.slice(0, numInstallments);
      while (next.length < numInstallments) next.push("");
      return next;
    });
  }, [numInstallments]);

  const saveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || baseFee <= 0 || dates.some(d=>!d)) return;
    storeApi.setClassFeeConfig(classId, baseFee, numInstallments);
    storeApi.setInstallmentDates(classId, dates);
    // recompute all students in class
    state.students.filter(s=>s.classId===classId).forEach(st => storeApi.recomputeStudentInstallments(st.id));
    setState(readStore());
    setShowConfig(false);
  };

  const classStudents = (filterClassId || classId) ? state.students.filter(s=>s.classId === (filterClassId || classId)) : [];
  const filteredStudents = searchQuery ? state.students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  ) : classStudents;
  const studentFeeStates = searchQuery ? 
    filteredStudents.map(stu => storeApi.getStudentFeeState(stu.id)).filter((s): s is NonNullable<typeof s> => s !== null) :
    (filterClassId || classId) ? storeApi.getClassStudentsFeeStates(filterClassId || classId) : [];

  // const toggleExpand = (studentId: string) => setExpanded(p => ({ ...p, [studentId]: !p[studentId] }));

  const saveExtraFees = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!editFor) return;
    
    const feesToSave: Record<string, number> = {};
    Object.entries(extraFees).forEach(([type, amount]) => {
      const numAmount = Number(amount || 0);
      if (!isNaN(numAmount) && numAmount > 0) {
        feesToSave[type] = numAmount;
      }
    });
    
    storeApi.upsertStudentExtraFees(editFor.id, editFor.classId, feesToSave);
    storeApi.recomputeStudentInstallments(editFor.id);
    setState(readStore());
    setEditFor(null);
    setExtraFees({});
    setNewFeeType("");
    setNewFeeAmount("");
  };

  const addNewFeeType = () => {
    if (newFeeType.trim() && newFeeAmount.trim()) {
      const amount = Number(newFeeAmount);
      if (!isNaN(amount) && amount > 0) {
        setExtraFees(prev => ({ ...prev, [newFeeType.trim()]: newFeeAmount }));
        setNewFeeType("");
        setNewFeeAmount("");
      }
    }
  };

  const removeFeeType = (type: string) => {
    setExtraFees(prev => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };


  const openPayModal = (stu: Student) => {
    setPayFor(stu);
    const fs = storeApi.getStudentFeeState(stu.id);
    setStagedInstalls((fs?.installments || []).map(i => ({ index: i.index, paid: i.paid })));
  };

  const toggleStage = (index: number) => {
    setStagedInstalls(prev => prev.map(i => i.index === index ? { ...i, paid: !i.paid } : i));
  };

  const savePayModal = () => {
    if (!payFor) return;
    stagedInstalls.forEach(i => storeApi.markInstallmentPaid(payFor.id, i.index, i.paid));
    setState(readStore());
    setPayFor(null);
    setStagedInstalls([]);
  };

  const openReceipt = (stu: Student) => {
    setReceiptFor(stu);
  };

  const sendPendingNotice = (stu: Student) => {
    const fs = storeApi.getStudentFeeState(stu.id);
    const total = (fs?.installments || []).reduce((sum,i)=>sum+i.amount,0);
    const paid = (fs?.installments || []).filter(i=>i.paid).reduce((sum,i)=>sum+i.amount,0);
    const remaining = Math.max(0, Math.round((total - paid) * 100)/100);
    const teacherId = storeApi.getTeacherByClass(stu.classId)?.id || "admin";
    const title = "Fees Pending Reminder";
    const message = remaining > 0
      ? `Dear ${stu.name}, your fees of ₹${remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })} is pending. Please clear your dues at the earliest.`
      : `Dear ${stu.name}, there are no pending dues at the moment.`;
    storeApi.addNotice(teacherId, title, message, stu.classId);
    setState(readStore());
  };

  const printReceipt = () => {
    window.print();
  };

  const closeReceipt = () => {
    setReceiptFor(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Fees Management</h1>
        {!showConfig && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-950 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button onClick={()=>setShowConfig(true)} className="bg-cyan-950 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-cyan-900 transition-colors flex items-center justify-center gap-1 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              <span className="hidden sm:inline">Add Fees</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        )}
      </div>

      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-lg">Configure Class Fees</h2>
                <button aria-label="Close" onClick={()=>setShowConfig(false)} className="p-1 rounded hover:bg-gray-100">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={saveConfig} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
                    <Select value={classId} onValueChange={setClassId}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select Class" /></SelectTrigger>
                      <SelectContent>
                        {state.classes.map(c=> (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Base Fee (₹)</label>
                    <input aria-label="Base Fee" type="number" min={0} placeholder="0" value={baseFee} onChange={e=>setBaseFee(Number(e.target.value))} className="px-3 py-2 border rounded-md w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Installments</label>
                    <select aria-label="Installments" value={numInstallments} onChange={e=>setNumInstallments(Number(e.target.value))} className="px-3 py-2 border rounded-md w-full">
                      {Array.from({length:11},(_,i)=>i+2).map(n=> (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Installment Due Dates</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {dates.map((d, idx)=> (
                      <div key={idx} className="flex items-center gap-2 border rounded-md px-3 py-2">
                        <span className="text-xs text-gray-500">#{idx+1}</span>
                        <input type="date" aria-label={`Installment ${idx+1} due date`} value={d} onChange={e=>{
                          const v = e.target.value; setDates(prev=> prev.map((x,i)=> i===idx? v : x));
                        }} className="flex-1 min-w-0 text-sm outline-none" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button type="button" onClick={()=>{setShowConfig(false)}} className="px-4 py-2 rounded-md border order-2 sm:order-1">Cancel</button>
                  <button className="bg-cyan-950 text-white px-4 py-2 rounded-md order-1 sm:order-2">Save Configuration</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

        <Card 
          title="Students & Installments"
          actions={(
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <span className="text-sm text-gray-600 hidden sm:inline">Filter</span>
              <Select value={filterClassId} onValueChange={setFilterClassId}>
                <SelectTrigger className="w-full sm:w-[200px] h-9">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {state.classes.map(c=> (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(stu => {
            const feeState = studentFeeStates.find(s=>s.studentId===stu.id);
            const total = (feeState?.installments || []).reduce((sum,i)=>sum+i.amount,0);
            const paid = (feeState?.installments || []).filter(i=>i.paid).reduce((sum,i)=>sum+i.amount,0);
            const remaining = Math.max(0, Math.round((total - paid) * 100)/100);
            return (
              <div key={stu.id} className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">{stu.name}</div>
                    <div className="text-xs text-gray-600">Roll {stu.rollNo}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">Total ₹{total.toFixed(2)}</span>
                      <span className="px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">Paid ₹{paid.toFixed(2)}</span>
                      <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">Due ₹{remaining.toFixed(2)}</span>
                      {feeState?.extraFees && Object.entries(feeState.extraFees).map(([type, amount]) => (
                        <span key={type} className="px-2 py-1 rounded bg-sky-50 text-sky-700 border border-sky-200">
                          {type.charAt(0).toUpperCase() + type.slice(1)} ₹{Number(amount).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button aria-label="View Receipt" onClick={()=>openReceipt(stu)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600" title="View Receipt">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button aria-label="Send Notification" onClick={()=>sendPendingNotice(stu)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600" title="Send Pending Fees Notification">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button onClick={()=>openPayModal(stu)} className="px-4 py-2 rounded-md text-sm bg-cyan-950 text-white hover:bg-cyan-900">Pay</button>
                  <button onClick={()=>{setEditFor(stu); setExtraFees(feeState?.extraFees ? Object.fromEntries(Object.entries(feeState.extraFees).map(([k,v]) => [k, String(v)])) : {});}} className="px-4 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200 text-gray-700">Add Fees</button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {editFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Edit Extra Fees</h2>
                <button aria-label="Close" onClick={()=>{setEditFor(null); setExtraFees({}); setNewFeeType(""); setNewFeeAmount("");}} className="p-1 rounded hover:bg-gray-100">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={saveExtraFees} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Student</label>
                  <div className="text-sm font-medium text-gray-800">{editFor.name}</div>
                </div>
                
                {/* Existing Extra Fees */}
                {Object.entries(extraFees).map(([type, amount]) => (
                  <div key={type} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{type} Fee (₹)</label>
                      <input 
                        aria-label={`${type} Fee`} 
                        placeholder="0.00" 
                        type="number" 
                        min={0} 
                        step="0.01" 
                        value={amount} 
                        onChange={e=>setExtraFees(prev => ({ ...prev, [type]: e.target.value }))} 
                        className="px-3 py-2 border rounded-md w-full" 
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFeeType(type)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md flex-shrink-0"
                      title="Remove fee type"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Add New Fee Type */}
                <div className="border-t pt-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fee Type</label>
                      <input 
                        placeholder="e.g., Hostel, Uniform, Library" 
                        value={newFeeType} 
                        onChange={e=>setNewFeeType(e.target.value)} 
                        className="px-3 py-2 border rounded-md w-full" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
                      <input 
                        placeholder="0.00" 
                        type="number" 
                        min={0} 
                        step="0.01" 
                        value={newFeeAmount} 
                        onChange={e=>setNewFeeAmount(e.target.value)} 
                        className="px-3 py-2 border rounded-md w-full" 
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={addNewFeeType}
                      className="p-2 bg-cyan-950 text-white rounded-md hover:bg-cyan-900 flex-shrink-0"
                      title="Add fee type"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button type="button" onClick={()=>{setEditFor(null); setExtraFees({}); setNewFeeType(""); setNewFeeAmount("");}} className="px-4 py-2 rounded-md border order-2 sm:order-1">Cancel</button>
                  <button className="bg-cyan-950 text-white px-4 py-2 rounded-md order-1 sm:order-2">Save</button>
                </div>
                <p className="text-xs text-gray-500">Saving will immediately recalculate this student&apos;s installment amounts.</p>
              </form>
            </div>
          </div>
        </div>
      )}

      {payFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-lg">Pay Installments</h2>
                <button aria-label="Close" onClick={()=>{setPayFor(null); setStagedInstalls([]);}} className="p-1 rounded hover:bg-gray-100">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {stagedInstalls.length === 0 && (
                  <div className="text-sm text-gray-500">No installments to display.</div>
                )}
                {stagedInstalls.map(inst => {
                  const fs = storeApi.getStudentFeeState(payFor!.id);
                  const full = fs?.installments.find(i => i.index === inst.index);
                  return (
                    <div key={inst.index} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 border rounded-md px-3 py-2 bg-gray-50">
                      <div className="text-sm min-w-0">
                        <div className="font-medium text-gray-800">Installment #{inst.index}</div>
                        <div className="text-gray-600 truncate">₹{(full?.amount ?? 0).toFixed(2)} • Due {full?.dueDate || "-"}</div>
                      </div>
                      <button onClick={()=>toggleStage(inst.index)} className={`px-3 py-1 rounded-md text-xs flex-shrink-0 ${inst.paid?"bg-green-100 text-green-700 hover:bg-green-200":"bg-cyan-950 text-white hover:bg-cyan-900"}`}>{inst.paid?"Paid":"Mark Paid"}</button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={()=>{setPayFor(null); setStagedInstalls([]);}} className="px-4 py-2 rounded-md border order-2 sm:order-1">Cancel</button>
                <button onClick={savePayModal} className="bg-cyan-950 text-white px-4 py-2 rounded-md order-1 sm:order-2">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {receiptFor && (() => {
        const fs = storeApi.getStudentFeeState(receiptFor.id);
        const cls = state.classes.find(c=>c.id===receiptFor.classId);
        const paidInst = (fs?.installments || []).filter(i=>i.paid);
        const totalPaid = paidInst.reduce((s,i)=> s + i.amount, 0);
        // const extraFeesTotal = Object.values(fs?.extraFees || {}).reduce((sum, fee) => sum + Number(fee), 0);
        const today = new Date();
        const receiptNo = `#${String(today.getTime()).slice(-6)}`;
        const transactionId = `CATXN${String(today.getTime()).slice(-13)}`;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] shadow-xl print:shadow-none rounded-lg overflow-hidden flex flex-col">
              {/* Header Section - Fixed */}
              <div className="bg-white p-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 border rounded flex items-center justify-center text-xs text-gray-500">
                      School Logo
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-800">LAKSHYA CENTRAL SCHOOL</h1>
                      <p className="text-xs text-gray-600">Affiliated to CBSE (123456 TO 789012)</p>
                      <p className="text-xs text-gray-600">123 Education Lane, Central Park, City 12345</p>
                      <p className="text-xs text-gray-600">Email: info@lakshyaschool.com | Phone: 9876543210</p>
                    </div>
                  </div>
                  <button aria-label="Close" onClick={closeReceipt} className="p-2 rounded hover:bg-gray-100 print:hidden">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                {/* Official Fee Receipt Title */}
                <div className="bg-blue-950 text-center py-2 ">
                  <h2 className="text-lg font-bold text-white">OFFICIAL FEE RECEIPT</h2>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Payment Details Section */}
                <div className="bg-blue-50 p-4 relative">
                  <div className="absolute top-2 right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className="text-base font-bold text-blue-950 mb-2">PAYMENT DETAILS</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Receipt No:</span>
                        <span>{receiptNo}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Academic Year:</span>
                        <span>2024-2025</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Student Name:</span>
                        <span>{receiptFor.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Father&apos;s Name:</span>
                        <span>N/A</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Payment Method:</span>
                        <span>Cash</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Date:</span>
                        <span>{today.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Collected By:</span>
                        <span>N/A</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Student ID:</span>
                        <span>S{receiptFor.id.slice(-12)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Class/Section:</span>
                        <span>{cls?.name || receiptFor.classId}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Transaction ID:</span>
                        <span>{transactionId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Breakdown Section */}
                <div className="bg-white p-4">
                  <div className="bg-blue-950 text-center py-2 mb-3">
                    <h3 className="text-base font-bold text-white">FEE BREAKDOWN</h3>
                  </div>

                  <div className="border border-gray-300">
                    <div className="grid grid-cols-2 bg-gray-100 px-3 py-2 font-bold text-xs">
                      <div>Description</div>
                      <div className="text-right">Amount (₹)</div>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {paidInst.map(i => (
                        <div key={i.index} className="grid grid-cols-2 px-3 py-2 text-xs">
                          <div>Installment #{i.index}</div>
                          <div className="text-right">{i.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 px-3 py-2 bg-gray-50 text-xs">
                      <div>Subtotal</div>
                      <div className="text-right">{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>

                    <div className="grid grid-cols-2 px-3 py-2 bg-gray-100 font-bold text-xs">
                      <div>TOTAL PAID</div>
                      <div className="text-right">₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                </div>

                {/* Payment Notes Section */}
                <div className="bg-white p-4">
                  <h4 className="font-bold text-xs mb-2">Payment Notes:</h4>
                  <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                    <li>This receipt is valid only with official school stamp.</li>
                    <li>Please preserve this receipt for future reference.</li>
                    <li>For any discrepancies, please contact accounts office within 7 days.</li>
                  </ol>
                </div>

                {/* Signatures Section */}
                <div className="bg-white p-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="border-b border-gray-400 mb-2 h-6"></div>
                      <div className="text-center text-xs">Student/Parent&apos;s Signature</div>
                    </div>
                    <div>
                      <div className="border-b border-gray-400 mb-2 h-6"></div>
                      <div className="text-center text-xs">Authorized Signature</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 border-t">
                  <p>This is a computer generated document and does not require signature</p>
                  <p>Generated on {today.toLocaleDateString()} {today.toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Action Buttons - Fixed */}
              <div className="bg-white p-3 flex justify-between items-center print:hidden flex-shrink-0 border-t">
                <button onClick={closeReceipt} className="px-3 py-2 rounded-md border text-gray-700 hover:bg-gray-50 text-sm">
                  Close
                </button>
                <div className="flex gap-2">
                  <button onClick={printReceipt} className="px-3 py-2 rounded-md border text-gray-700 hover:bg-gray-50 text-sm">
                    Print Receipt
                  </button>
                  <button onClick={printReceipt} className="px-3 py-2 rounded-md bg-cyan-950 text-white hover:bg-cyan-900 text-sm">
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
