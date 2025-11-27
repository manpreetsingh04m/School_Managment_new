"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import Image from "next/image";

export default function TeacherAttendancePage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherClass, setTeacherClass] = useState<string | null>(null);
  const [showingOptions, setShowingOptions] = useState<{[key: string]: boolean}>({});
  const [selectedStatus, setSelectedStatus] = useState<{[key: string]: 'present' | 'absent' | null}>({});
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; classId?: string } | null>(null);
  const router = useRouter();
  const { success, toasts, removeToast } = useToast();

  useEffect(() => {
    const storeData = readStore();
    setState(storeData);
    
    // Get teacher info from authenticated user
    const user = getUser();
    if (user && user.role === "teacher") {
      setTeacherInfo(user);
      
      // Only class teachers can take attendance
      if (user.classId) {
        setTeacherClass(user.classId);
      }
    }
  }, []);

  // Get existing attendance for today
  const getExistingAttendance = (studentId: string) => {
    if (!teacherClass) return null;
    const existingAttendance = storeApi.getAttendanceByClassAndDate(teacherClass, currentDate);
    const record = existingAttendance.find(a => a.studentId === studentId);
    return record ? record.status : null;
  };

  // Get students for teacher's assigned classes
  // const getAssignedStudents = () => {
  //   const user = getUser();
  //   if (!user?.email) return [];
  //   
  //   const teacher = state.teachers.find(t => t.email === user.email);
  //   if (!teacher) return [];
  //   
  //   // Get all class IDs where teacher teaches (both class teacher and subject teacher)
  //   const assignedClassIds = new Set<string>();
  //   if (teacher.classId) assignedClassIds.add(teacher.classId);
  //   if (teacher.subjectAssignments) {
  //     teacher.subjectAssignments.forEach(assignment => {
  //       assignedClassIds.add(assignment.classId);
  //     });
  //   }
  //   
  //   return state.students.filter(s => assignedClassIds.has(s.classId));
  // };
  
  // Check if teacher is a class teacher
  const isClassTeacher = teacherInfo && teacherInfo.classId;

  const students = teacherClass ? state.students.filter(s => s.classId === teacherClass) : [];
  
  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If not a class teacher, show access denied
  if (teacherInfo && !isClassTeacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You are not authorized to take attendance. 
            Only class teachers can take attendance for their assigned class.
            Subject teachers are not allowed to take attendance.
          </p>
          <button
            onClick={() => router.push("/teacher")}
            className="bg-cyan-950 text-white px-6 py-2 rounded-lg hover:bg-cyan-900 transition-colors"
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }



  const showAttendanceOptions = (studentId: string) => {
    setShowingOptions(prev => ({
      ...prev,
      [studentId]: true
    }));
  };

  const selectAttendanceStatus = (studentId: string, status: 'present' | 'absent') => {
    setSelectedStatus(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = (studentId: string) => {
    const status = selectedStatus[studentId];
    if (!status || !teacherClass) return;

    // Mark attendance in store (using "Morning Attendance" as subject)
    storeApi.markAttendance(studentId, teacherClass, "Morning Attendance", currentDate, status, "teacher-1");
    
    // Update local state
    setState(readStore());
    
    // Hide options after saving
    setShowingOptions(prev => ({
      ...prev,
      [studentId]: false
    }));
    
    // Clear selected status
    setSelectedStatus(prev => ({
      ...prev,
      [studentId]: null
    }));
    
    // Show success toast
    const studentName = students.find(s => s.id === studentId)?.name;
    success(`Attendance marked as ${status} for ${studentName}`);
  };

  const stats = { total: filteredStudents.length };

  // Get class name for display
  const className = teacherClass ? state.classes.find(c => c.id === teacherClass)?.name : "";

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            Today&apos;s Attendance - {className || 'Loading...'}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
      </div>
      
        {/* Search Bar */}
        <div className="mt-4 sm:mt-0 w-full sm:w-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent w-full sm:w-64 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Class Selection */}

      {/* Attendance Cards */}
      {teacherClass ? (
        <Card title={`Students (${stats.total})`}>
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {student.photo ? (
                      <Image src={student.photo} alt={student.name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">{student.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Roll No. {student.rollNo}</div>
                </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {showingOptions[student.id] ? (
                    /* Show Present/Absent Options with Save Button */
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => selectAttendanceStatus(student.id, 'present')}
                        className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          selectedStatus[student.id] === 'present'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                        }`}
                      >
                        Present
                      </button>
              <button
                        onClick={() => selectAttendanceStatus(student.id, 'absent')}
                        className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          selectedStatus[student.id] === 'absent'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => saveAttendance(student.id)}
                        disabled={!selectedStatus[student.id]}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-800 text-white rounded-md hover:bg-sky-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save
                      </button>
                    </div>
                  ) : (
                    /* Show Mark Attendance Button */
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      {/* Status Tag */}
                      <div className="flex-shrink-0 self-center sm:self-auto">
                        {(() => {
                          const existingStatus = getExistingAttendance(student.id);
                          const currentStatus = selectedStatus[student.id] || existingStatus;
                          if (currentStatus === 'present') {
                            return (
                              <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs sm:text-sm font-medium border border-green-200">
                                Present
                              </div>
                            );
                          } else if (currentStatus === 'absent') {
                            return (
                              <div className="px-2 sm:px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs sm:text-sm font-medium border border-red-200">
                                Absent
                              </div>
                            );
                          } else {
                            return (
                              <div className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs sm:text-sm font-medium border border-gray-200">
                                No Record
                              </div>
                            );
                          }
                        })()}
                      </div>
                      
                      <button
                        onClick={() => showAttendanceOptions(student.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-800 text-white rounded-md hover:bg-sky-700 transition-colors text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="hidden sm:inline">Mark attendance</span>
                        <span className="sm:hidden">Mark</span>
              </button>
                    </div>
                  )}
                  
                  {/* View Button */}
                  <Link
                    href={`/teacher/attendance/student/${student.id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </Link>
                </div>
            </div>
          ))}
        </div>

          {/* Summary */}
          <div className="mt-6 text-sm text-gray-600">
            Total Students: {stats.total}
          </div>
        </Card>
      ) : (
        <Card title="No Classes Available">
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Classes Found</h3>
            <p className="text-gray-600">Please add some classes first to test attendance functionality.</p>
        </div>
      </Card>
      )}
      </div>
    </>
  );
}
