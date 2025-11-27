/**
 * TEACHER SIGN-IN PAGE
 *
 * Why this file exists:
 * - Authenticates teachers and redirects them to their dashboard.
 *
 * What it does:
 * - Collects email/password and simulates authentication (demo)
 * - On success, routes to `/teacher`
 * - Shows loading state for better UX
 */
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { storeApi } from "@/lib/store";
import { setUser } from "@/lib/auth";
import Footer from "@/components/Footer";

export default function TeacherSignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Authenticate user
    const user = storeApi.authenticateUser(email, password, "teacher");
    
    if (user) {
      setUser(user);
      router.push("/teacher");
    } else {
      setError("Invalid email or password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Portal</h1>
          <p className="text-gray-600">Sign in to access your teacher dashboard</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Teacher Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="teacher@school.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-800 text-white py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sky-600 hover:text-sky-700 text-sm font-medium"
            >
              ← Back to Role Selection
            </Link>
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Teacher Login:</p>
          <p className="text-xs mt-2">Use email and password provided by admin</p>
          <p className="text-xs mt-1">Teachers can add students to their classes</p>
        </div>
        <Footer className="mt-10" />
      </div>
    </div>
  );
}