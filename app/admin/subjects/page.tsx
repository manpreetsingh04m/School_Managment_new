/**
 * ADMIN CLASSES/SUBJECTS PAGE
 *
 * Why this file exists:
 * - Lets administrators create classes and manage their subject lists.
 *
 * What it does:
 * - Displays all classes with student counts and subject chips
 * - Adds classes via modal; adds subjects via multi-selector dialog
 * - Removes individual subjects from a class
 *
 * Where key functionality is:
 * - Add class: `showAddClass` modal + `storeApi.addClass`
 * - Add subjects: `subjectModalFor` + `storeApi.addSubjectsToClass`
 * - Remove subject: inline chip button -> `storeApi.removeSubjectFromClass`
 * - Data access: `readStore()` and `storeApi`
 */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";

export default function AdminClassesPage() {
  const [name, setName] = useState("");
  const [showForm] = useState(false);
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [subjectModalFor, setSubjectModalFor] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState<Record<string, boolean>>({});
  const [showAddClass, setShowAddClass] = useState(false);
  const [addClassName, setAddClassName] = useState("");
  const [addClassSubjects, setAddClassSubjects] = useState<string[]>([]);
  useEffect(()=> setState(readStore()), []);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    storeApi.addClass(name.trim()); setName(""); setState(readStore());
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Manage Classes</h1>
        <button onClick={()=>setShowAddClass(true)} className="bg-cyan-950 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-cyan-900 transition-colors flex items-center gap-1 sm:gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          <span className="hidden sm:inline">Add Class</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
      {showForm && (
        <Card title="Add Class">
          <form onSubmit={add} className="grid grid-cols-1 gap-3 max-w-xl">
            <label className="text-sm font-medium text-gray-700">
              Class Name
              <input
                value={name}
                onChange={e=>setName(e.target.value)}
                placeholder="e.g., Grade 8C"
                className="mt-1 w-full px-3 py-2 border rounded-md"
                aria-label="Class Name"
              />
            </label>
            <p className="text-xs text-gray-500">Use a clear name like “Grade 8C” or “Nursery B”.</p>
            <div className="flex gap-2 sm:gap-3">
              <button className="bg-cyan-950 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base">Add Class</button>
              <button type="button" onClick={()=>setName("")} className="px-3 py-2 sm:px-4 sm:py-2 rounded-md border text-sm sm:text-base">Clear</button>
            </div>
          </form>
        </Card>
      )}
      <Card title="All Classes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.classes.map(c=> {
            const studentCount = state.students.filter(s=>s.classId===c.id).length;
            const subjects = c.subjects || [];
            return (
              <div key={c.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <Image src="/classes.png" alt="Class" width={20} height={20} className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{c.name}</div>
                    <div className="text-xs text-gray-500">{studentCount} students</div>
                  </div>
                  <button onClick={()=> setEditOpen(prev=> ({ ...prev, [c.id]: !prev[c.id] }))} className="ml-auto p-2 rounded hover:bg-gray-100" aria-label="Edit">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.232-6.232a2 2 0 112.828 2.828L11.828 13.828a4 4 0 01-1.414.94L7 16l1.232-3.414a4 4 0 01.94-1.414z" /></svg>
                  </button>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2">SUBJECTS</div>
                  <div className="flex flex-wrap gap-2">
                    {subjects.length === 0 && <span className="text-xs text-gray-400">No subjects yet</span>}
                    {subjects.map((sub, idx) => {
                      const color = [
                        { bg: "bg-indigo-100", text: "text-indigo-700", hover: "hover:bg-indigo-200" },
                        { bg: "bg-green-100", text: "text-green-700", hover: "hover:bg-green-200" },
                        { bg: "bg-emerald-100", text: "text-emerald-700", hover: "hover:bg-emerald-200" },
                        { bg: "bg-orange-100", text: "text-orange-700", hover: "hover:bg-orange-200" },
                        { bg: "bg-cyan-100", text: "text-cyan-700", hover: "hover:bg-cyan-200" },
                        { bg: "bg-pink-100", text: "text-pink-700", hover: "hover:bg-pink-200" }
                      ][idx % 6];
                      return (
                        <span key={sub} className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${color.bg} ${color.text}`}>
                          {sub}
                          {editOpen[c.id] && (
                            <button
                              aria-label={`Remove ${sub}`}
                              onClick={()=>{ storeApi.removeSubjectFromClass(c.id, sub); setState(readStore()); }}
                              className={`ml-1 rounded-full px-1 ${color.hover}`}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {editOpen[c.id] && (
                  <button
                    onClick={()=>{ setSubjectModalFor(c.id); setSelectedSubjects([]); }}
                    className="mt-4 w-full border rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    + Add Subject
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {subjectModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[92%] max-w-md p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Add Subject</h2>
              <button aria-label="Close" onClick={()=>setSubjectModalFor(null)} className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mb-4">
              <MultipleSelector
                defaultOptions={(Array.from(new Set((state.classes.flatMap(c=>c.subjects||[])).concat([
                  "Mathematics","Science","English","History","Geography","Physics","Chemistry","Biology","Computer Science","Art","Music"
                ]))) as string[]).map(s=> ({ label: s, value: s })) as Option[]}
                onChange={(vals)=> setSelectedSubjects(vals.map(v=>v.value))}
                placeholder="Search or type to add subjects..."
                emptyIndicator={<p className="text-center text-sm py-2 text-gray-600">no results found.</p>}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={()=>setSubjectModalFor(null)} className="px-4 py-2 rounded-md border">Cancel</button>
              <button onClick={()=>{
                const subjects = [...selectedSubjects].filter(Boolean);
                if (subjects.length>0 && subjectModalFor) {
                  storeApi.addSubjectsToClass(subjectModalFor, subjects);
                  setState(readStore());
                }
                setSubjectModalFor(null);
              }} className="px-4 py-2 rounded-md bg-cyan-950 text-white">Add Selected</button>
            </div>
          </div>
        </div>
      )}

      {showAddClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[92%] max-w-md p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Add Class</h2>
              <button aria-label="Close" onClick={()=>setShowAddClass(false)} className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm font-medium text-gray-700">
                Class Name
                <input value={addClassName} onChange={e=>setAddClassName(e.target.value)} placeholder="e.g., Grade 10A" className="mt-1 w-full px-3 py-2 border rounded-md normal-case" />
              </label>
              <MultipleSelector
                defaultOptions={(Array.from(new Set((state.classes.flatMap(c=>c.subjects||[])).concat([
                  "Mathematics","Science","English","History","Geography","Physics","Chemistry","Biology","Computer Science","Art","Music"
                ]))) as string[]).map(s=> ({ label: s, value: s })) as Option[]}
                onChange={(vals)=> setAddClassSubjects(vals.map(v=>v.value))}
                placeholder="Search or type to add subjects..."
                emptyIndicator={<p className="text-center text-sm py-2 text-gray-600">no results found.</p>}
              />
              <div className="flex justify-end gap-2">
                <button onClick={()=>setShowAddClass(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                <button onClick={()=>{
                  const nm = addClassName.trim(); if (!nm) return;
                  const c = storeApi.addClass(nm);
                  if (addClassSubjects.length>0) storeApi.addSubjectsToClass(c.id, addClassSubjects);
                  setAddClassName(""); setAddClassSubjects([]); setShowAddClass(false); setState(readStore());
                }} className="px-4 py-2 rounded-md bg-cyan-950 text-white">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
