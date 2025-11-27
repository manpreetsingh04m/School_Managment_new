"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { getUser, updateUser } from "@/lib/auth";

export default function AdminProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    } else {
      setName("Admin User");
      setEmail("admin@school.com");
    }
  }, []);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link href="/admin" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">← Back to Dashboard</Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Update Profile</h1>

      <Card>
        <form onSubmit={onSave} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none" 
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none" 
              placeholder="Enter your email address"
            />
          </div>
          <button type="submit" className="bg-cyan-950 text-white px-4 py-2 rounded-md font-medium hover:bg-cyan-800">Save Changes</button>
          {saved && <span className="ml-3 text-sm text-green-600">Saved!</span>}
        </form>
      </Card>
    </div>
  );
}
