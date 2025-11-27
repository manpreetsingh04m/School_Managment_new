/**
 * ADMIN LAYOUT
 *
 * Why this file exists:
 * - Provides the shared shell for all admin pages: persistent sidebar, header,
 *   and a scrollable content area. Ensures a consistent admin UX across routes.
 *
 * What it does:
 * - Renders a responsive sidebar (desktop fixed, mobile slide-in)
 * - Highlights the active nav item using the current pathname
 * - Includes top header with notification button and profile menu
 * - Wraps child routes in a constrained, scrollable main area
 *
 * Where key functionality lives:
 * - Navigation links: inside the sidebar sections (Dashboard, User/Academic/Financial/System)
 * - Mobile sidebar state: `isSidebarOpen`
 * - Profile dropdown state: `isProfileOpen`
 * - Active route detection: `usePathname()`
 */
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-skin','admin');
    }
  }, []);
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

      {/* Desktop Sidebar (persistent on lg+) */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-cyan-950 lg:text-white">
        <div className="flex items-center justify-center py-6 px-4 border-b border-cyan-800">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mr-4">
            <Icon name="school" className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin Portal</h1>
            <p className="text-xs text-cyan-200">Administrator</p>
          </div>
        </div>

        <nav className="mt-6 px-2 flex-1 overflow-y-auto">
          {/* Dashboard */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-neutral-300 tracking-wider">
              DASHBOARD
            </h2>
            <ul>
              <li>
                <Link
                  href="/admin"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
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

          {/* User Management (students/teachers) */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-cyan-300 tracking-wider">
              USER MANAGEMENT
            </h2>
            <ul>
              <li>
                <Link
                  href="/admin/students"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/students"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="user" className="w-5 h-5" />
                  </span>
                  Student Records
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/teachers"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/teachers"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="teacher" className="w-5 h-5" />
                  </span>
                  Teacher Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Management (classes/timetable) */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-cyan-300 tracking-wider">
              ACADEMIC MANAGEMENT
            </h2>
            <ul>
              <li>
                <Link
                  href="/admin/subjects"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/subjects"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="book" className="w-5 h-5" />
                  </span>
                  Classes
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/timetable"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/timetable"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Image src="/timetableManagment.png" alt="Timetable" width={20} height={20} className="w-5 h-5" />
                  </span>
                  Timetable Management
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/exams"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/exams"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="calendar" className="w-5 h-5" />
                  </span>
                  Exam Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Financial Management (fees) */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-cyan-300 tracking-wider">
              FINANCIAL MANAGEMENT
            </h2>
            <ul>
              <li>
                <Link
                  href="/admin/fees"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/fees"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="money" className="w-5 h-5" />
                  </span>
                  Fee Management
                </Link>
              </li>
              {/* Reports removed */}
            </ul>
          </div>

          {/* System Administration (notices, settings) */}
          <div className="mb-8">
            <h2 className="px-4 mb-4 text-xs font-semibold text-cyan-300 tracking-wider">
              SYSTEM ADMIN
            </h2>
            <ul>
              <li>
                <Link
                  href="/admin/notices"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/notices"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="bell" className="w-5 h-5" />
                  </span>
                  School Notices
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/leaves"
                  className={`flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/leaves"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 w-5">
                    <Icon name="check" className="w-5 h-5" />
                  </span>
                  Approve Leaves
                </Link>
              </li>
              {/* Settings removed */}
            </ul>
          </div>
        </nav>
      </nav>

      {/* Mobile Sidebar (slide-in on small screens) */}
      <nav className={`lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-cyan-950 text-white transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="flex items-center justify-center py-4 px-3 border-b border-cyan-800 flex-shrink-0">
          <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mr-3">
            <Icon name="school" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold">Admin Portal</h1>
            <p className="text-xs text-cyan-200">Administrator</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2">
          {/* Dashboard (mobile) */}
          <div className="mb-6">
            <h2 className="px-3 mb-3 text-xs font-semibold text-cyan-300 tracking-wider">
              DASHBOARD
            </h2>
            <ul>
              <li>
                <Link
                  href="/admin"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2 w-4">
                    <Icon name="home" className="w-4 h-4" />
                  </span>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* User Management (mobile) */}
          <div className="mb-6">
            <h2 className="px-3 mb-3 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              USER MANAGEMENT
            </h2>
            <ul>
              <li>
                <Link
                  href="/admin/students"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/students"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2 w-4">
                    <Icon name="user" className="w-4 h-4" />
                  </span>
                  Student Records
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/teachers"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/teachers"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2 w-4">
                    <Icon name="teacher" className="w-4 h-4" />
                  </span>
                  Teacher Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Management (mobile) */}
          <div className="mb-6">
            <h2 className="px-3 mb-3 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              ACADEMIC MANAGEMENT
            </h2>
            <ul>
              <li>
                <Link
                  href="/admin/subjects"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/subjects"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2 w-4">
                    <Icon name="book" className="w-4 h-4" />
                  </span>
                  Classes
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/timetable"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/timetable"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2 w-4">
                    <Image src="/timetableManagment.png" alt="Timetable" width={16} height={16} className="w-4 h-4" />
                  </span>
                  Timetable Management
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/exams"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/exams"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2 w-4">
                    <Icon name="calendar" className="w-4 h-4" />
                  </span>
                  Exam Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Financial Management (mobile) */}
          <div className="mb-6">
            <h2 className="px-3 mb-3 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              FINANCIAL MANAGEMENT
            </h2>
            <ul>
              <li>
                <Link
                  href="/admin/fees"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/fees"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2 w-4">
                    <Icon name="dollar" className="w-4 h-4" />
                  </span>
                  Fee Management
                </Link>
              </li>
            </ul>
          </div>

          {/* System Administration (mobile) */}
          <div className="mb-6">
            <h2 className="px-3 mb-3 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              SYSTEM ADMIN
            </h2>
            <ul>
              <li>
                <Link
                  href="/admin/notices"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/notices"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2 w-4">
                    <Icon name="bell" className="w-4 h-4" />
                  </span>
                  School Notices
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/leaves"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === "/admin/leaves"
                      ? "bg-white/20 text-white"
                      : "text-cyan-100 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2 w-4">
                    <Icon name="check" className="w-4 h-4" />
                  </span>
                  Approve Leaves
                </Link>
              </li>
            </ul>
          </div>
          </nav>
        </div>
      </nav>

      {/* Main Content (header + routed children) */}
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
                Admin Portal
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative" ref={profileRef}>
                <button 
                  className="flex items-center focus:outline-none hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors" 
                  onClick={() => setIsProfileOpen(!isProfileOpen)} 
                  aria-haspopup="menu" 
                  aria-expanded={isProfileOpen ? true : false}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Icon
                      name="user"
                      className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-600"
                    />
                  </div>
                  <div className="ml-2 sm:ml-3 text-left hidden sm:block">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Administrator
                    </h3>
                    <p className="text-xs text-gray-500">System Admin</p>
                  </div>
                  <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Administrator</p>
                        <p className="text-xs text-gray-500">System Admin</p>
                      </div>
                      <Link
                        href="/admin/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Update Profile
                      </Link>
                      <form action="/signin/admin" method="get">
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
              Powered by <span className="font-semibold text-cyan-600" style={{fontFamily: 'Trajan Pro, serif'}}>Tadbhav</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
