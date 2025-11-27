/**
 * TEACHER LAYOUT
 *
 * Why this file exists:
 * - Provides a shared shell for all teacher pages, including sidebar nav,
 *   header, and scrollable content tailored for teachers.
 *
 * What it does:
 * - Renders responsive teacher sidebar (desktop fixed, mobile slide-in)
 * - Highlights current route using pathname
 * - Provides header with notifications and profile menu
 * - Wraps teacher routes in a unified layout
 *
 * Where key functionality is:
 * - Sections: Dashboard, Class Management, Academic Management, Reports
 * - State: `isSidebarOpen` for mobile, `isProfileOpen` for profile menu
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

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-skin','teacher');
    }
  }, []);
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; subject?: string } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getUser();
    if (user && user.email) {
      const store = readStore();
      const teacher = store.teachers.find(t => t.email === user.email);
      if (teacher) {
        setTeacherInfo(teacher);
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
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-sky-800 lg:text-white">
        <div className="flex items-center justify-center py-6 px-4 border-b border-sky-700">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mr-4">
            <Icon name="school" className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Teacher Portal</h1>
            <p className="text-xs text-sky-200">
              {teacherInfo ? `${teacherInfo.name} - ${teacherInfo.subject || 'Teacher'}` : 'Teacher Portal'}
            </p>
          </div>
        </div>
        
        <nav className="mt-6 px-2 flex-1 overflow-y-auto">
          {/* Dashboard */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-sky-300 tracking-wider">DASHBOARD</h2>
            <ul>
              <li>
                <Link
                  href="/teacher"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
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

          {/* Class Management */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-sky-300 tracking-wider">CLASS MANAGEMENT</h2>
            <ul>
              <li>
                <Link
                  href="/teacher/classes"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/classes"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="user" className="w-5 h-5" />
                  </span>
                  My Classes
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/attendance"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/attendance"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="chart" className="w-5 h-5" />
                  </span>
                  Take Attendance
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/approvals"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/approvals"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="check" className="w-5 h-5" />
                  </span>
                  Approve Leaves
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Management */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-sky-300 tracking-wider">ACADEMIC MANAGEMENT</h2>
            <ul>
              <li>
                <Link
                  href="/teacher/homework"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/homework"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="book" className="w-5 h-5" />
                  </span>
                  Assign Homework
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/syllabus"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/syllabus"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Image src="/syllabus.png" alt="Syllabus" width={20} height={20} className="w-5 h-5" />
                  </span>
                  Syllabus Management
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/grading"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname.startsWith("/teacher/grading")
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="chart" className="w-5 h-5" />
                  </span>
                  Grade Marks
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/exams"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname.startsWith("/teacher/exams")
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="calendar" className="w-5 h-5" />
                  </span>
                  Exam Schedule
                </Link>
              </li>
              {/* Timetable Management removed */}
            </ul>
          </div>

          {/* Reports & Communication */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-sky-300 tracking-wider">REPORTS & COMMUNICATION</h2>
            <ul>
              {/* My Timetable removed */}
              <li>
                <Link
                  href="/teacher/leave"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/leave"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
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
                  href="/teacher/reports"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/reports"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="chart" className="w-5 h-5" />
                  </span>
                  Send Notices
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </nav>

      {/* Mobile Sidebar */}
      <nav className={`lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-sky-800 text-white transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="flex items-center justify-center py-6 px-4 border-b border-sky-700 flex-shrink-0">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mr-4">
            <Icon name="school" className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Teacher Portal</h1>
            <p className="text-xs text-sky-200">Ms. Johnson - Math Dept</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2">
          {/* Dashboard */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-sky-300 tracking-wider">DASHBOARD</h2>
            <ul>
              <li>
                <Link
                  href="/teacher"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
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

          {/* Class Management */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-sky-300 tracking-wider">CLASS MANAGEMENT</h2>
            <ul>
              <li>
                <Link
                  href="/teacher/classes"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/classes"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="user" className="w-5 h-5" />
                  </span>
                  My Classes
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/attendance"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/attendance"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="chart" className="w-5 h-5" />
                  </span>
                  Take Attendance
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/approvals"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/approvals"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="check" className="w-5 h-5" />
                  </span>
                  Approve Leaves
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Management */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-sky-300 tracking-wider">ACADEMIC MANAGEMENT</h2>
            <ul>
              <li>
                <Link
                  href="/teacher/homework"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/homework"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="book" className="w-5 h-5" />
                  </span>
                  Assign Homework
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/syllabus"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/syllabus"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Image src="/syllabus.png" alt="Syllabus" width={20} height={20} className="w-5 h-5" />
                  </span>
                  Syllabus Management
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/grading"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname.startsWith("/teacher/grading")
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="chart" className="w-5 h-5" />
                  </span>
                  Grade Marks
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/exams"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname.startsWith("/teacher/exams")
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="calendar" className="w-5 h-5" />
                  </span>
                  Exam Schedule
                </Link>
              </li>
              {/* Timetable Management removed */}
            </ul>
          </div>

          {/* Reports & Communication */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-sky-300 tracking-wider">REPORTS & COMMUNICATION</h2>
            <ul>
              {/* My Timetable removed */}
              <li>
                <Link
                  href="/teacher/reports"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/reports"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="chart" className="w-5 h-5" />
                  </span>
                  Send Notices
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/leave"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/teacher/leave"
                      ? "bg-white/20 text-white"
                      : "text-sky-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="calendar" className="w-5 h-5" />
                  </span>
                  Apply Leave
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
	      <h1 className="ml-4 text-lg font-semibold text-gray-800 lg:hidden">Teacher Portal</h1>
	    </div>

	    <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative" ref={profileRef}>
                <button 
                  className="flex items-center focus:outline-none hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors" 
                  onClick={() => setIsProfileOpen(!isProfileOpen)} 
                  aria-haspopup="menu" 
                  aria-expanded={isProfileOpen}
                >
		  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-100 rounded-full flex items-center justify-center">
		    <Icon name="user" className="w-4 h-4 sm:w-6 sm:h-6 text-sky-600" />
		  </div>
		  <div className="ml-2 sm:ml-3 text-left hidden sm:block">
		    <h3 className="text-sm font-semibold text-gray-700">
		      {teacherInfo ? teacherInfo.name : 'Teacher'}
		    </h3>
		    <p className="text-xs text-gray-500">
		      {teacherInfo ? `${teacherInfo.subject || 'Teacher'} Department` : 'Teacher Department'}
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
                        <p className="text-sm font-medium text-gray-900">{teacherInfo ? teacherInfo.name : 'Teacher'}</p>
                        <p className="text-xs text-gray-500">{teacherInfo ? `${teacherInfo.subject || 'Teacher'} Department` : 'Teacher Department'}</p>
                      </div>
                      <Link 
                        href="/teacher/profile" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Update Profile
                      </Link>
                      <form action="/signin/teacher" method="get">
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
              Powered by <span className="font-semibold text-sky-600" style={{fontFamily: 'Trajan Pro, serif'}}>Tadbhav</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}