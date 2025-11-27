"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { getUser, updateUser } from "@/lib/auth";
import { readStore } from "@/lib/store";

export default function StudentProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const user = getUser();
    const store = readStore();
    
    if (user && user.email) {
      const student = store.students.find(s => s.email === user.email);
      if (student) {
        setName(student.name || "");
        setEmail(student.email || "");
        setGrade(student.classId || "");
      } else {
        // Fallback to user data
        setName(user.name || "");
        setEmail(user.email || "");
        setGrade(user.grade || "");
      }
    } else {
      // Fallback to first student for demo
      const firstStudent = store.students[0];
      if (firstStudent) {
        setName(firstStudent.name || "");
        setEmail(firstStudent.email || "");
        setGrade(firstStudent.classId || "");
      }
    }
  }, []);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, grade });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link href="/student" className="text-blue-800 hover:text-blue-900 text-sm font-medium">← Back to Dashboard</Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Update Profile</h1>

      <Card>
        <form onSubmit={onSave} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
            <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Enter your grade/class" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 text-sm sm:text-base">Save Changes</button>
            {saved && <span className="ml-0 sm:ml-3 text-sm text-green-600 self-start sm:self-auto">Saved!</span>}
          </div>
        </form>
      </Card>
    </div>
  );
}
