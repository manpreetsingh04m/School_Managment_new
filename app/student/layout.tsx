/**
 * STUDENT LAYOUT
 *
 * Why this file exists:
 * - Provides the shared shell for all student pages with a sidebar, header,
 *   and scrollable content area tailored to student navigation.
 *
 * What it does:
 * - Renders a responsive student sidebar (desktop fixed, mobile slide-in)
 * - Highlights active menu based on pathname
 * - Provides a header with notification button and profile menu
 * - Wraps all student routes in a unified layout
 *
 * Where key functionality is:
 * - Nav sections: Dashboard, Academics, Schedule, Finance & Communication
 * - State: `isSidebarOpen` for mobile menu, `isProfileOpen` for profile dropdown
 * - Active route: `usePathname()`
 */
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { getUser } from "@/lib/auth";
import { readStore } from "@/lib/store";
import { StudentChatBot } from "@/components/StudentChatBot";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-skin','student');
    }
  }, []);
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ name: string; classId: string } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getUser();
    if (user && user.email) {
      const store = readStore();
      const student = store.students.find(s => s.email === user.email);
      if (student) {
        setStudentInfo(student);
      }
    }
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <div className="flex h-[100svh] min-h-screen lg:h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-blue-950 lg:text-white">
        <div className="flex items-center justify-center py-6 px-4 border-b border-blue-800">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mr-4">
            <Icon name="school" className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Student Portal</h1>
            <p className="text-xs text-blue-200">
              {studentInfo ? `${studentInfo.name} - ${studentInfo.classId}` : "Student - Loading..."}
            </p>
          </div>
        </div>

        <nav className="mt-6 px-2 flex-1 overflow-y-auto">
          {/* Dashboard */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-blue-300 tracking-wider">
              DASHBOARD
            </h2>
            <ul>
              <li>
                <Link
                  href="/student"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="home" className="w-5 h-5" />
                  </span>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Academics */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-blue-300 tracking-wider">
              ACADEMICS
            </h2>
            <ul>
              <li>
                <Link
                  href="/student/attendance"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/attendance"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="user" className="w-5 h-5" />
                  </span>
                  Attendance
                </Link>
              </li>
              <li>
                <Link
                  href="/student/marks"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/marks"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="chart" className="w-5 h-5" />
                  </span>
                  Marks
                </Link>
              </li>
              <li>
                <Link
                  href="/student/homework"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/homework"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="book" className="w-5 h-5" />
                  </span>
                  Homework
                </Link>
              </li>
              <li>
                <Link
                  href="/student/syllabus"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/syllabus"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Image src="/syllabus.png" alt="Syllabus" width={20} height={20} className="w-5 h-5" />
                  </span>
                  Syllabus
                </Link>
              </li>
              <li>
                <Link
                  href="/student/study-resources"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname.startsWith("/student/study-resources")
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="book" className="w-5 h-5" />
                  </span>
                  Study Resources
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Schedule */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-blue-300 tracking-wider">
              SCHEDULE
            </h2>
            <ul>
              <li>
                <Link
                  href="/student/exam-schedule"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/exam-schedule"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="calendar" className="w-5 h-5" />
                  </span>
                  Exam Schedule
                </Link>
              </li>
              <li>
                <Link
                  href="/student/timetable"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/timetable"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Image src="/timetableManagment.png" alt="Timetable" width={20} height={20} className="w-5 h-5" />
                  </span>
                  Timetable
                </Link>
              </li>
            </ul>
          </div>

          {/* Finance & Communication */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-blue-300 tracking-wider">
              FINANCE & COMMUNICATION
            </h2>
            <ul>
              <li>
                <Link
                  href="/student/fee-status"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/fee-status"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="money" className="w-5 h-5" />
                  </span>
                  Fee Status
                </Link>
              </li>
              <li>
                <Link
                  href="/student/leave"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/leave"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="calendar" className="w-5 h-5" />
                  </span>
                  Apply Leave
                </Link>
              </li>
              <li>
                <Link
                  href="/student/notices"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/notices"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="bell" className="w-5 h-5" />
                  </span>
                  Notices
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </nav>

      {/* Mobile Sidebar */}
      <nav
        className={`lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-blue-950 text-white transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="flex items-center justify-center py-6 px-4 border-b border-blue-800 flex-shrink-0">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mr-4">
            <Icon name="school" className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Student Portal</h1>
            <p className="text-xs text-blue-200">
              {studentInfo ? `${studentInfo.name} - ${studentInfo.classId}` : "Student - Loading..."}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2">
          {/* Dashboard */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-blue-300 tracking-wider">
              DASHBOARD
            </h2>
            <ul>
              <li>
                <Link
                  href="/student"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="home" className="w-5 h-5" />
                  </span>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Academics */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-blue-300 uppercase tracking-wider">
              ACADEMICS
            </h2>
            <ul>
              <li>
                <Link
                  href="/student/attendance"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/attendance"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="user" className="w-5 h-5" />
                  </span>
                  Attendance
                </Link>
              </li>
              <li>
                <Link
                  href="/student/marks"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/marks"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="chart" className="w-5 h-5" />
                  </span>
                  Marks
                </Link>
              </li>
              <li>
                <Link
                  href="/student/homework"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/homework"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="book" className="w-5 h-5" />
                  </span>
                  Homework
                </Link>
              </li>
              <li>
                <Link
                  href="/student/syllabus"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/syllabus"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Image src="/syllabus.png" alt="Syllabus" width={20} height={20} className="w-5 h-5" />
                  </span>
                  Syllabus
                </Link>
              </li>
              <li>
                <Link
                  href="/student/study-resources"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname.startsWith("/student/study-resources")
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="book" className="w-5 h-5" />
                  </span>
                  Study Resources
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Schedule */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-blue-300 uppercase tracking-wider">
              SCHEDULE
            </h2>
            <ul>
              <li>
                <Link
                  href="/student/exam-schedule"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/exam-schedule"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="calendar" className="w-5 h-5" />
                  </span>
                  Exam Schedule
                </Link>
              </li>
              <li>
                <Link
                  href="/student/timetable"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/timetable"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Image src="/timetableManagment.png" alt="Timetable" width={20} height={20} className="w-5 h-5" />
                  </span>
                  Timetable
                </Link>
              </li>
            </ul>
          </div>

          {/* Finance & Communication */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-blue-300 tracking-wider">
              FINANCE & COMMUNICATION
            </h2>
            <ul>
              <li>
                <Link
                  href="/student/fee-status"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/fee-status"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="money" className="w-5 h-5" />
                  </span>
                  Fee Status
                </Link>
              </li>
              <li>
                <Link
                  href="/student/leave"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/leave"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="calendar" className="w-5 h-5" />
                  </span>
                  Apply Leave
                </Link>
              </li>
              <li>
                <Link
                  href="/student/notices"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/student/notices"
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="bell" className="w-5 h-5" />
                  </span>
                  Notices
                </Link>
              </li>
            </ul>
          </div>
          </nav>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-0">
        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-500 focus:outline-none lg:hidden"
                title="Toggle menu"
              >
                <Icon name="menu" className="w-6 h-6" />
              </button>
              <h1 className="ml-4 text-lg font-semibold text-gray-800 lg:hidden">
                Student Portal
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center focus:outline-none hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon
                      name="user"
                      className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600"
                    />
                  </div>
                  <div className="ml-2 sm:ml-3 text-left hidden sm:block">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {studentInfo ? studentInfo.name : "Student"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {studentInfo ? studentInfo.classId : "Loading..."}
                    </p>
                  </div>
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{studentInfo ? studentInfo.name : "Student"}</p>
                        <p className="text-xs text-gray-500">{studentInfo ? studentInfo.classId : "Loading..."}</p>
                      </div>
                      <Link
                        href="/student/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Update Profile
                      </Link>
                      <form action="/signin/student" method="get">
                        <button
                          type="submit"
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 bg-gray-100 p-3 sm:p-4 md:p-6 lg:p-8 pb-16 overflow-y-auto">
          <div className="mx-auto max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-7xl">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 lg:ml-64 z-10">
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">
              Powered by <span className="font-semibold text-blue-600 font-serif">Tadbhav</span>
            </p>
          </div>
        </footer>
      </div>
      
      {/* Student Chat Bot */}
      <StudentChatBot />
    </div>
  );
}
