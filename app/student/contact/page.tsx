"use client";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { readStore } from "@/lib/store";
import { getUser } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function ContactTeacherPage() {
  const [studentClassId, setStudentClassId] = useState("");
  const [studentName, setStudentName] = useState("");
  
  useEffect(() => {
    const store = readStore();
    const user = getUser();
    
    if (user && user.email) {
      const student = store.students.find(s => s.email === user.email);
      if (student) {
        setStudentClassId(student.classId);
        setStudentName(student.name);
      }
    }
  }, []);
  
  const store = readStore();
  const teacher = store.teachers.find(t => t.classId === studentClassId);
  const wa = teacher ? `https://wa.me/${teacher.phone.replace(/[^\d]/g, "")}` : "#";

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link href="/student" className="text-blue-800 hover:text-blue-900 text-sm font-medium">← Back to Dashboard</Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Contact Teacher</h1>
      <Card>
        {teacher ? (
          <div className="space-y-4">
            <p className="text-gray-700 text-sm sm:text-base">Hello <span className="font-semibold">{studentName}</span>! Your class teacher is <span className="font-semibold">{teacher.name}</span>.</p>
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-gray-600">Class: <span className="font-medium">{studentClassId}</span></p>
              <p className="text-xs sm:text-sm text-gray-600">Phone: <span className="font-medium">{teacher.phone}</span></p>
            </div>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors text-sm sm:text-base">
              📱 Open WhatsApp
            </a>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-600 mb-2 text-sm sm:text-base">No class teacher assigned for your class ({studentClassId}) yet.</p>
            <p className="text-xs sm:text-sm text-gray-500">Please contact the school administration.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
