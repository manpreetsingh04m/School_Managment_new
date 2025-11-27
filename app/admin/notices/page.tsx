/**
 * ADMIN NOTICES PAGE
 *
 * Why this file exists:
 * - Allows admins to send announcements to all classes or a specific class.
 *
 * What it does:
 * - Filters existing notices by class
 * - Sends a new notice (title/message) optionally scoped to a class
 * - Persists via `storeApi.addNotice` and lists recent notices
 *
 * Where key functionality is:
 * - Filter select: updates `filterClassId`
 * - Send modal: `showSend` + form -> `send()`
 * - Data access: `readStore()` and `storeApi`
 */
"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function AdminNoticesPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [showSend, setShowSend] = useState(false);
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const { success, error, toasts, removeToast } = useToast();

  useEffect(()=> setState(readStore()), []);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error("Please enter a notice title");
      return;
    }
    const teacherId = "ADMIN"; // system sender
    storeApi.addNotice(teacherId, title.trim(), message.trim(), classId || undefined);
    setTitle(""); setMessage(""); setClassId("");
    setShowSend(false);
    setState(readStore());
    
    success("Notice sent successfully!");
  };

  const notices = state.notices.filter(n => !filterClassId || n.classId === filterClassId);

  const getPriorityColor = (index: number) => {
    if (index === 0) return "bg-red-100 text-red-800";
    if (index < 3) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getTypeColor = (notice: { title: string }) => {
    const t = notice.title.toLowerCase();
    if (t.includes("test") || t.includes("exam")) return "bg-purple-100 text-purple-800";
    if (t.includes("holiday") || t.includes("closed")) return "bg-green-100 text-green-800";
    if (t.includes("assignment") || t.includes("homework")) return "bg-blue-100 text-blue-800";
    if (t.includes("sports") || t.includes("event")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (notice: { title: string }) => {
    const t = notice.title.toLowerCase();
    if (t.includes("test") || t.includes("exam")) return "Academic";
    if (t.includes("holiday") || t.includes("closed")) return "Holiday";
    if (t.includes("assignment") || t.includes("homework")) return "Assignment";
    if (t.includes("sports") || t.includes("event")) return "Event";
    return "General";
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">School Notices</h1>
        <button onClick={()=>setShowSend(true)} className="bg-cyan-950 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-cyan-900 transition-colors">
          <span className="hidden sm:inline">Send Notice</span>
          <span className="sm:hidden">Send</span>
        </button>
      </div>

      {/* Filter */}
      <Card title="Filter by Class">
        <div className="flex gap-3 items-center justify-end">
          <Select value={filterClassId} onValueChange={setFilterClassId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {state.classes.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card title="Recent Notices">
        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No notices yet.</div>
          ) : (
            notices.slice().reverse().map((n, index) => (
              <div key={n.id} className="p-3 sm:p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-lg">{n.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(n)} self-start sm:self-auto`}>
                        {getTypeLabel(n)}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(index)} self-start sm:self-auto`}>
                      {index === 0 ? 'HIGH' : index < 3 ? 'MEDIUM' : 'LOW'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{n.message}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs text-gray-500">
                    <span>Posted on: {new Date(n.createdAt).toLocaleDateString()}</span>
                    <span>{n.classId ? (state.classes.find(c=>c.id===n.classId)?.name || n.classId) : "All"} • Notice #{n.id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[92%] max-w-md p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Send Notice</h2>
              <button aria-label="Close" onClick={()=>setShowSend(false)} className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={send} className="grid grid-cols-1 gap-3">
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {state.classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="px-3 py-2 border rounded-md normal-case" />
              <textarea placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} className="px-3 py-2 border rounded-md min-h-[120px] normal-case" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setShowSend(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                <button className="px-4 py-2 rounded-md bg-cyan-950 text-white">Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}


