"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
import { readStore, storeApi } from "@/lib/store";
import type { Store, AttendanceSummary } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TeacherAttendanceHistoryPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [selectedStudent, setSelectedStudent] = useState("");
  const [dateRange, setDateRange] = useState("month"); // week, month, semester
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceSummary[]>([]);
  const [teacherClass, setTeacherClass] = useState<string | null>(null);

  useEffect(() => {
    const storeData = readStore();
    setState(storeData);
    // For testing purposes, allow any teacher to access attendance history
    // Find the first available class
    if (storeData.classes.length > 0) {
      setTeacherClass(storeData.classes[0].id);
    }
  }, []); // Empty dependency array to run only once on mount

  // Get students for teacher's assigned class
  const students = useMemo(() => 
    teacherClass ? state.students.filter(s => s.classId === teacherClass) : [],
    [teacherClass, state.students]
  );

  // Calculate date range
  const getDateRange = useCallback(() => {
    const now = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'semester':
        startDate.setMonth(now.getMonth() - 6);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  }, [dateRange]);

  // Load attendance history
  useEffect(() => {
    if (teacherClass) {
      const { start, end } = getDateRange();
      const summaries: AttendanceSummary[] = [];
      
      students.forEach(student => {
        const summary = storeApi.getAttendanceSummary(
          student.id, 
          teacherClass, 
          "Morning Attendance", // Fixed subject for morning attendance
          start, 
          end
        );
        if (summary) {
          summaries.push(summary);
        }
      });
      
      setAttendanceHistory(summaries);
    }
  }, [teacherClass, dateRange, students, getDateRange]);

  // Get individual student attendance details
  const getStudentAttendanceDetails = (studentId: string) => {
    if (!teacherClass) return [];
    
    const { start, end } = getDateRange();
    const allAttendance = storeApi.getAllAttendance();
    
    return allAttendance.filter(a => 
      a.studentId === studentId &&
      a.classId === teacherClass &&
      a.subject === "Morning Attendance" &&
      a.date >= start &&
      a.date <= end
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getOverallStats = () => {
    if (attendanceHistory.length === 0) return { totalStudents: 0, avgAttendance: 0 };
    
    const totalStudents = attendanceHistory.length;
    const totalAttendance = attendanceHistory.reduce((sum, student) => sum + student.attendancePercentage, 0);
    const avgAttendance = Math.round(totalAttendance / totalStudents);
    
    return { totalStudents, avgAttendance };
  };

  const stats = getOverallStats();

  // Get class name for display
  const className = teacherClass ? state.classes.find(c => c.id === teacherClass)?.name : "";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Attendance History</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            {className ? `${className} - Morning Attendance Records` : 'Loading...'}
          </p>
        </div>
        
        <Link
          href="/teacher/attendance"
          className="mt-4 sm:mt-0 flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Attendance
        </Link>
      </div>

      {/* Filters */}
      {teacherClass ? (
        <Card title="Filter Options">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Students</SelectItem>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.rollNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="semester">Last 6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                {className}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="No Classes Available">
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Classes Found</h3>
            <p className="text-gray-600">Please add some classes first to test attendance history functionality.</p>
          </div>
        </Card>
      )}

      {/* Overall Statistics */}
      {teacherClass && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-sky-600">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.avgAttendance}%</div>
            <div className="text-sm text-gray-600">Average Attendance</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{dateRange}</div>
            <div className="text-sm text-gray-600">Period</div>
          </Card>
        </div>
      )}

      {/* Individual Student Details */}
      {selectedStudent ? (
        <Card title={`Attendance Details - ${students.find(s => s.id === selectedStudent)?.name}`}>
          <div className="space-y-4">
            {getStudentAttendanceDetails(selectedStudent).map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-600">Morning Attendance</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  record.status === 'present' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* Class Summary */
        teacherClass && (
          <Card title="Class Attendance Summary">
            <div className="space-y-3">
              {attendanceHistory.map((student) => (
                <div key={student.studentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{student.studentName}</div>
                      <div className="text-sm text-gray-600">Roll No. {student.rollNo}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{student.presentDays}</div>
                      <div className="text-xs text-gray-600">Present</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{student.absentDays}</div>
                      <div className="text-xs text-gray-600">Absent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{student.totalDays}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        student.attendancePercentage >= 80 ? 'text-green-600' :
                        student.attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {student.attendancePercentage}%
                      </div>
                      <div className="text-xs text-gray-600">Attendance</div>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(student.studentId)}
                      className="px-3 py-1 text-sm bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      )}
    </div>
  );
}
