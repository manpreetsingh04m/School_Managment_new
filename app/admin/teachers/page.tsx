/**
 * ADMIN TEACHERS PAGE
 *
 * Why this file exists:
 * - Manage teacher directory and assign roles (class teacher, subject teacher).
 *
 * What it does:
 * - Lists teachers with contact info
 * - Creates new teachers (with optional initial assignments)
 * - Assigns/removes class teacher role and subject assignments via modals
 * - Paginates teacher list
 *
 * Where key functionality is:
 * - Create teacher: bottom modal + `storeApi.addTeacher`
 * - Assign class teacher: `ctModalFor` + `assignClassTeacher`/`setTeacherSubject`
 * - Assign subject teacher: `stModalFor` + `addSubjectAssignment`
 * - Data access: `readStore()` and `storeApi` in `lib/store`
 */
"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import Pagination from "@/components/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function AdminTeachersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  // per-teacher assignment happens inline in each card now
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [editOpen, setEditOpen] = useState<Record<string, boolean>>({});
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => setState(readStore()), []);

  const [page, setPage] = useState(1); const pageSize = 10;
  const [ctModalFor, setCtModalFor] = useState<string|null>(null);
  const [stModalFor, setStModalFor] = useState<string|null>(null);
  const [ctClassId, setCtClassId] = useState("");
  const [ctSubject, setCtSubject] = useState("");
  const [stClassId, setStClassId] = useState("");
  const [stSubject, setStSubject] = useState("");
  const [deleteModalFor, setDeleteModalFor] = useState<string|null>(null);
  useEffect(()=>{ setCtSubject(""); }, [ctClassId]);
  useEffect(()=>{ setStSubject(""); }, [stClassId]);

  // Add Teacher modal state for assignments
  const [addCtClassId, setAddCtClassId] = useState("");
  const [addCtSubject, setAddCtSubject] = useState("");
  const [addStClassId, setAddStClassId] = useState("");
  const [addStSubject, setAddStSubject] = useState("");
  const [addAssignments, setAddAssignments] = useState<{classId:string; subject:string}[]>([]);

  const addTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = storeApi.addTeacher({ name, email, phone, password: "teacher123", gender });
    if (addCtClassId && addCtSubject) {
      storeApi.assignClassTeacher(teacher.id, addCtClassId);
      storeApi.setTeacherSubject(teacher.id, addCtSubject);
    }
    addAssignments.forEach(a => storeApi.addSubjectAssignment(teacher.id, a.classId, a.subject));
    setName(""); setEmail(""); setPhone(""); setGender("");
    setAddCtClassId(""); setAddCtSubject(""); setAddStClassId(""); setAddStSubject(""); setAddAssignments([]);
    setShowAddTeacher(false);
    setState(readStore());
    success(`${name} has been added as a teacher successfully`);
  };

  // assignment handlers moved inline per card

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Manage Teachers</h1>
        <button onClick={()=>setShowAddTeacher(true)} className="bg-cyan-950 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-cyan-900 transition-colors flex items-center gap-1 sm:gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          <span className="hidden sm:inline">Add Teacher</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <Card title="Assign Teacher Roles">
        <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.teachers.slice((page-1)*pageSize, (page-1)*pageSize+pageSize).map(t => (
            <div key={t.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.email}</div>
                  <div className="text-sm text-gray-600">{t.phone}</div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={()=>{
                    const key = `edit-${t.id}`;
                    setEditOpen(prev => {
                      const current = prev || {};
                      return { ...current, [key]: !current[key] };
                    });
                  }} className="p-2 rounded hover:bg-gray-100" aria-label="Edit">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.232-6.232a2 2 0 112.828 2.828L11.828 13.828a4 4 0 01-1.414.94L7 16l1.232-3.414a4 4 0 01.94-1.414z" /></svg>
                  </button>
                  <button 
                    onClick={() => {
                      setDeleteModalFor(t.id);
                    }} 
                    className="p-2 rounded hover:bg-red-100" 
                    aria-label="Delete"
                    title="Delete Teacher"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4">
                {/* Visible summary: class teacher and subject tags */}
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">CLASS TEACHER</div>
                  <div className="flex flex-wrap gap-2">
                    {t.classId ? (
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                        {(state.classes.find(c=>c.id===t.classId)?.name || t.classId).replace(/^Grade\s+/i, "")}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not assigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">SUBJECTS</div>
                  <div className="flex flex-wrap gap-2">
                    {(t.subjectAssignments || []).length === 0 && <span className="text-xs text-gray-400">No subject assignments</span>}
                    {(t.subjectAssignments || []).map((a, idx) => {
                      const color = [
                        { bg: "bg-green-100", text: "text-green-700", hover: "hover:bg-green-200" },
                        { bg: "bg-cyan-100", text: "text-cyan-700", hover: "hover:bg-cyan-200" },
                        { bg: "bg-indigo-100", text: "text-indigo-700", hover: "hover:bg-indigo-200" },
                        { bg: "bg-orange-100", text: "text-orange-700", hover: "hover:bg-orange-200" }
                      ][idx % 4];
                      const cls = state.classes.find(c=>c.id===a.classId);
                      return (
                        <span key={`${a.classId}-${a.subject}-${idx}`} className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${color.bg} ${color.text}`}>
                          {a.subject} - {cls?.name || a.classId}
                          {editOpen?.[`edit-${t.id}`] && (
                            <button onClick={()=>{ storeApi.removeSubjectAssignment(t.id, a.classId, a.subject); setState(readStore()); }} className={`ml-1 rounded-full px-1 ${color.hover}`} aria-label="Remove assignment">×</button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {(editOpen?.[`edit-${t.id}`]) && (
                  <div className="flex flex-wrap gap-3 mt-1 items-center">
                    <button onClick={()=>{ setCtModalFor(t.id); setCtClassId(t.classId || ""); setCtSubject(t.subject || ""); }} className="px-3 py-1.5 rounded-md text-xs bg-indigo-600 text-white hover:bg-indigo-700">Assign Class Teacher</button>
                    <button onClick={()=>{ setStModalFor(t.id); setStClassId(""); setStSubject(""); }} className="px-3 py-1.5 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700">Assign Subject Teacher</button>
                    {t.classId && (
                      <button onClick={()=>{ storeApi.removeClassTeacher(t.id); setState(readStore()); }} className="px-2.5 py-1 rounded-md text-xs border text-gray-700 hover:bg-gray-50">Clear Class Teacher</button>
                    )}
                  </div>
                )}

                {/* (removed duplicate subjects list rendering) */}
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} total={state.teachers.length} pageSize={pageSize} onChange={setPage} />
      </Card>

      {/* Class Teacher Modal */}
      {ctModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[92%] max-w-md p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Assign Class Teacher</h2>
              <button aria-label="Close" onClick={()=>setCtModalFor(null)} className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mr-19">Class</label>
                <Select value={ctClassId} onValueChange={setCtClassId}>
                  <SelectTrigger className="ml-2 w-100 h-9 text-sm sm:text-base"><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>
                    {state.classes.map(c=> (
                      <SelectItem key={c.id} value={c.id}>{c.name.replace(/^Grade\s+/i, "")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mr-15">Subject</label>
                <Select value={ctSubject} onValueChange={setCtSubject}>
                  <SelectTrigger disabled={!ctClassId} className="ml-2 w-full h-9 text-sm sm:text-base"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const all = state.classes.find(c=>c.id===ctClassId)?.subjects || [];
                      const assigned = (state.teachers.find(t=>t.id===ctModalFor)?.subjectAssignments || [])
                        .filter(a=>a.classId===ctClassId).map(a=>a.subject);
                      return all.filter(s=> !assigned.includes(s));
                    })().map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={()=>setCtModalFor(null)} className="px-4 py-2 rounded-md border">Cancel</button>
                <button onClick={()=>{ if (!ctModalFor || !ctClassId || !ctSubject) return; storeApi.assignClassTeacher(ctModalFor, ctClassId); storeApi.setTeacherSubject(ctModalFor, ctSubject); setState(readStore()); setCtModalFor(null); }} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject Teacher Modal */}
      {stModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[92%] max-w-md p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Assign Subject Teacher</h2>
              <button aria-label="Close" onClick={()=>setStModalFor(null)} className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mr-24">Class</label>
                <Select value={stClassId} onValueChange={setStClassId}>
                  <SelectTrigger className="ml-2 w-full h-9 text-sm sm:text-base"><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>
                    {state.classes.map(c=> (
                      <SelectItem key={c.id} value={c.id}>{c.name.replace(/^Grade\s+/i, "")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mr-20">Subject</label>
                <Select value={stSubject} onValueChange={setStSubject}>
                  <SelectTrigger disabled={!stClassId} className="ml-2 w-full h-9 text-sm sm:text-base"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const all = state.classes.find(c=>c.id===stClassId)?.subjects || [];
                      const assigned = (state.teachers.find(t=>t.id===stModalFor)?.subjectAssignments || [])
                        .filter(a=>a.classId===stClassId).map(a=>a.subject);
                      return all.filter(s=> !assigned.includes(s));
                    })().map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={()=>setStModalFor(null)} className="px-4 py-2 rounded-md border">Close</button>
                <button onClick={()=>{ if (!stModalFor || !stClassId || !stSubject) return; storeApi.addSubjectAssignment(stModalFor, stClassId, stSubject); setState(readStore()); setStSubject(""); setStClassId(""); }} className="px-4 py-2 rounded-md bg-emerald-600 text-white">Add</button>
              </div>
              {/* No preview chips inside the modal per request */}
            </div>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[96%] max-w-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Add Teacher</h2>
              <button aria-label="Close" onClick={()=>setShowAddTeacher(false)} className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={addTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="px-3 py-2 border rounded-md normal-case" required />
              <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} className="px-3 py-2 border rounded-md normal-case" required />
              <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} className="px-3 py-2 border rounded-md normal-case" required />
              <div>
                <label className="text-xs font-medium text-gray-700">Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="ml-2 w-full h-10"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 gap-3 mt-2">
                <div className="text-sm font-semibold text-gray-700">Class Teacher Assignment</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Class</label>
                    <Select value={addCtClassId} onValueChange={setAddCtClassId}>
                      <SelectTrigger className="ml-2 w-full h-10"><SelectValue placeholder="Select Class" /></SelectTrigger>
                      <SelectContent>
                        {state.classes.map(c=> (
                          <SelectItem key={c.id} value={c.id}>{c.name.replace(/^Grade\s+/i, "")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Subject</label>
                    <Select value={addCtSubject} onValueChange={setAddCtSubject}>
                      <SelectTrigger disabled={!addCtClassId} className="ml-2 w-full h-10"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const all = state.classes.find(c=>c.id===addCtClassId)?.subjects || [];
                          const already = addAssignments.filter(a=>a.classId===addCtClassId).map(a=>a.subject);
                          return all.filter(s => !already.includes(s));
                        })().map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-sm font-semibold text-gray-700 mt-4">Subject Teacher Assignment</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Class</label>
                    <Select value={addStClassId} onValueChange={setAddStClassId}>
                      <SelectTrigger className="ml-2 w-full h-10"><SelectValue placeholder="Select Class" /></SelectTrigger>
                      <SelectContent>
                        {state.classes.map(c=> (
                          <SelectItem key={c.id} value={c.id}>{c.name.replace(/^Grade\s+/i, "")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Subject</label>
                    <Select value={addStSubject} onValueChange={setAddStSubject}>
                      <SelectTrigger disabled={!addStClassId} className="ml-2 w-full h-10"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const all = state.classes.find(c=>c.id===addStClassId)?.subjects || [];
                          const already = addAssignments.filter(a=>a.classId===addStClassId).map(a=>a.subject);
                          const ctTaken = addCtClassId === addStClassId ? [addCtSubject] : [];
                          return all.filter(s => !already.includes(s) && !ctTaken.includes(s));
                        })().map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <button type="button" onClick={()=>{ if (!addStClassId || !addStSubject) return; if (!addAssignments.find(a=>a.classId===addStClassId && a.subject===addStSubject)) setAddAssignments([...addAssignments, { classId: addStClassId, subject: addStSubject }]); setAddStSubject(""); }} className="px-4 py-2 rounded-md bg-emerald-600 text-white">Add</button>
                </div>

                {addAssignments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {addAssignments.map((a, idx) => {
                      const color = [
                        { bg: "bg-green-100", text: "text-green-700" },
                        { bg: "bg-cyan-100", text: "text-cyan-700" },
                        { bg: "bg-indigo-100", text: "text-indigo-700" },
                        { bg: "bg-orange-100", text: "text-orange-700" }
                      ][idx % 4];
                      const cls = state.classes.find(c=>c.id===a.classId);
                      return (
                        <span key={`${a.classId}-${a.subject}-${idx}`} className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${color.bg} ${color.text}`}>
                          {a.subject} - {cls?.name || a.classId}
                          <button type="button" onClick={()=> setAddAssignments(addAssignments.filter(x=> !(x.classId===a.classId && x.subject===a.subject))) } className="ml-1">×</button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={()=>{ setShowAddTeacher(false); }} className="px-4 py-2 rounded-md border">Cancel</button>
                <button className="px-4 py-2 rounded-md bg-cyan-950 text-white">Create Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Teacher Confirmation Modal */}
      {deleteModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[92%] max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Teacher</h2>
              </div>
              <button 
                aria-label="Close" 
                onClick={() => setDeleteModalFor(null)} 
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <strong>{state.teachers.find(t => t.id === deleteModalFor)?.name}</strong>?
              </p>
              <p className="text-sm text-red-600 font-medium">
                This action cannot be undone and will permanently remove the teacher from the system.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteModalFor(null)} 
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const teacherName = state.teachers.find(t => t.id === deleteModalFor)?.name || 'Teacher';
                  const deleteSuccess = storeApi.deleteTeacher(deleteModalFor);
                  if (deleteSuccess) {
                    setState(readStore());
                    setDeleteModalFor(null);
                    success(`${teacherName} has been deleted successfully`);
                  } else {
                    error('Failed to delete teacher. Please try again.');
                  }
                }} 
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
