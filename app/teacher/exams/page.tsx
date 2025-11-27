"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { readStore } from "@/lib/store";
import type { Store, ClassRoom } from "@/lib/store";
import { getUser } from "@/lib/auth";

export default function TeacherExamsPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [] });
  const [teacherInfo, setTeacherInfo] = useState<{ classId?: string; subjectAssignments?: { classId: string; subject: string }[] } | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    const store = readStore();
    setState(store);
    
    // Get teacher info from authenticated user
    const user = getUser();
    if (user && user.role === "teacher") {
      setTeacherInfo(user);
    }
  }, []);

  // Get available classes for this teacher
  const availableClasses = (() => {
    if (!teacherInfo) return [];
    
    const classes: ClassRoom[] = [];
    
    // Add teacher's assigned class if they are a class teacher
    if (teacherInfo.classId) {
      const assignedClass = state.classes.find(c => c.id === teacherInfo.classId);
      if (assignedClass) classes.push(assignedClass);
    }
    
    // Add classes where teacher teaches subjects
    if (teacherInfo.subjectAssignments) {
      teacherInfo.subjectAssignments.forEach((assignment: { classId: string; subject: string }) => {
        const classExists = classes.find(c => c.id === assignment.classId);
        if (!classExists) {
          const classRoom = state.classes.find(c => c.id === assignment.classId);
          if (classRoom) classes.push(classRoom);
        }
      });
    }
    
    return classes;
  })();

  // Get exam schedules filtered by selected class
  const schedules = (state.examSchedules || [])
    .filter(s => {
      if (!selectedClassId) {
        // If no class selected, show all schedules for teacher's classes
        if (teacherInfo?.classId && s.classId === teacherInfo.classId) {
          return true;
        }
        if (teacherInfo?.subjectAssignments) {
          return teacherInfo.subjectAssignments.some((assignment: { classId: string; subject: string }) => 
            assignment.classId === s.classId
          );
        }
        return false;
      } else {
        // Show schedules for selected class only
        return s.classId === selectedClassId;
      }
    })
    .slice().reverse();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Exam Schedule</h1>
        <p className="text-sm text-gray-500">View exam schedules for your assigned classes</p>
      </div>

      <Card 
        title="Upcoming Exams"
        actions={
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="w-full sm:w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Classes</option>
            {availableClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map(s => {
            const cls = state.classes.find(c=>c.id===s.classId);
            const subj = state.subjects.find(x=>x.id===s.subjectId);
            return (
              <div key={s.id} className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800">{s.title}</div>
                  <div className="text-xs text-gray-500">{s.date}</div>
                </div>
                <div className="mt-1 text-sm text-gray-700">{subj?.name} • {cls?.name}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  {s.startTime && <span className="px-2 py-1 rounded bg-gray-100 border">Start {s.startTime}</span>}
                  {s.endTime && <span className="px-2 py-1 rounded bg-gray-100 border">End {s.endTime}</span>}
                  {s.room && <span className="px-2 py-1 rounded bg-gray-100 border">Room {s.room}</span>}
                </div>
                {s.instructions && <div className="mt-2 text-xs text-gray-500">{s.instructions}</div>}
              </div>
            );
          })}
          {schedules.length===0 && <div className="text-sm text-gray-500">No exams scheduled yet.</div>}
        </div>
      </Card>
    </div>
  );
}


