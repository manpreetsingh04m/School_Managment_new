/**
 * ADMIN STUDENTS PAGE
 *
 * Why this file exists:
 * - Enables administrators to view student records per class with pagination.
 *
 * What it does:
 * - Loads classes and students from the local store
 * - Lets admin choose a class and see its students in a table
 * - Paginates results with a simple pager
 *
 * Where key functionality is:
 * - Class filter: `Select` control in Card actions
 * - Pagination: local state `page` and `Pagination` component
 * - Data access: `readStore()` from `lib/store`
 */
"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Pagination from "@/components/Pagination";

export default function AdminStudentsPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [classId, setClassId] = useState("");
  useEffect(()=> setState(readStore()), []);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const studentsAll = useMemo(() => 
    classId ? state.students.filter(s=>s.classId===classId) : [], 
    [classId, state.students]
  );
  const students = useMemo(()=> {
    const start = (page-1)*pageSize;
    return studentsAll.slice(start, start+pageSize);
  }, [studentsAll, page]);

  const [confirm, setConfirm] = useState<{ id: string; name: string; type: 'block'|'unblock'|'delete' }|null>(null);

  const doAction = () => {
    if (!confirm) return;
    const { id, type } = confirm;
    if (type === 'delete') {
      storeApi.deleteStudent(id);
    } else if (type === 'block') {
      storeApi.blockStudent(id, true);
    } else if (type === 'unblock') {
      storeApi.blockStudent(id, false);
    }
    setConfirm(null);
    setState(readStore());
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Student Management</h1>
          <p className="text-gray-500">Manage all student records and information.</p>
        </div>
      </div>

      <Card title="All Students" actions={
        <div className="flex items-center gap-2">
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              {state.classes.map(c=> (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }>
        {classId === "" && <p className="text-gray-600 text-sm">Select a class to view students.</p>}
        {classId !== "" && (
          <div className="space-y-3">
            {students.map(stu => (
              <div key={stu.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden ${stu.blocked? 'ring-2 ring-red-300' : ''} bg-indigo-100 flex-shrink-0`}>
                    {stu.photo ? (
                      <Image src={stu.photo} alt={stu.name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                      <span className="truncate">{stu.name}</span>
                      {stu.blocked && <span className="px-2 py-0.5 text-[10px] rounded bg-red-100 text-red-700 border border-red-200 flex-shrink-0">Blocked</span>}
                    </div>
                    <div className="text-sm text-gray-600">Roll No: {stu.rollNo}</div>
                    <div className="text-sm text-gray-500 truncate">{stu.email}</div>
                    <div className="text-sm text-gray-500 truncate">{stu.phone}</div>
                    <div className="text-xs text-gray-500 truncate">Parent: {stu.parentName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={()=> setConfirm({ id: stu.id, name: stu.name, type: (stu.blocked ? 'unblock' : 'block') })}
                    className={`px-3 py-1 rounded-md text-xs ${stu.blocked? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                  >
                    {stu.blocked ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    onClick={()=> setConfirm({ id: stu.id, name: stu.name, type: 'delete' })}
                    className="px-3 py-1 rounded-md text-xs bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {classId !== "" && (
          <Pagination page={page} total={studentsAll.length} pageSize={pageSize} onChange={setPage} />
        )}
      </Card>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Confirm {confirm.type === 'delete' ? 'Deletion' : confirm.type === 'block' ? 'Block' : 'Unblock'}</h2>
              <button aria-label="Close" onClick={()=>setConfirm(null)} className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-4 sm:mb-6">
              {confirm.type === 'delete' && (
                <p>Are you sure you want to permanently delete <span className="font-semibold">{confirm.name}</span>? This action cannot be undone.</p>
              )}
              {confirm.type !== 'delete' && (
                <p>Are you sure you want to {confirm.type} <span className="font-semibold">{confirm.name}</span>?</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button onClick={()=>setConfirm(null)} className="px-4 py-2 rounded-md border text-sm sm:text-base">Cancel</button>
              <button onClick={doAction} className={`px-4 py-2 rounded-md text-sm sm:text-base ${confirm.type==='delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-950 hover:bg-cyan-900'} text-white`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
