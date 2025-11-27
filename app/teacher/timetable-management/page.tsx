"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast, ToastContainer } from "@/components/ui/Toast";

const subjects = [
  { id: "1", name: "English" },
  { id: "2", name: "Gujarati" },
  { id: "3", name: "Maths" },
  { id: "4", name: "Science" },
  { id: "5", name: "History" },
  { id: "6", name: "Computer" },
  { id: "7", name: "Physical Education" },
  { id: "8", name: "Art" }
];

const classes = [
  { id: "1", name: "Grade 8A" },
  { id: "2", name: "Grade 8B" },
  { id: "3", name: "Grade 9A" },
  { id: "4", name: "Grade 9B" },
  { id: "5", name: "Grade 10A" },
  { id: "6", name: "Grade 10B" }
];

const periods = [
  { id: "1", time: "08:00 - 08:45", name: "Period 1" },
  { id: "2", time: "08:45 - 09:30", name: "Period 2" },
  { id: "3", time: "09:30 - 10:15", name: "Period 3" },
  { id: "4", time: "10:15 - 10:30", name: "Break" },
  { id: "5", time: "10:30 - 11:15", name: "Period 4" },
  { id: "6", time: "11:15 - 12:00", name: "Period 5" },
  { id: "7", time: "12:00 - 12:45", name: "Period 6" }
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherTimetableManagementPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [timetable, setTimetable] = useState<{[key: string]: string}>({});
  const { success, toasts, removeToast } = useToast();

  const handlePeriodChange = (periodId: string, subjectId: string) => {
    setTimetable(prev => ({
      ...prev,
      [`${selectedDay}-${periodId}`]: subjectId
    }));
  };

  const handleSaveTimetable = () => {
    // Save timetable logic here
    const className = classes.find(c => c.id === selectedClass)?.name;
    success(`Student timetable saved for ${className} on ${selectedDay}`);
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/teacher" 
          className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Student Timetable Management</h1>
        <p className="text-gray-500 mt-2">Create and manage student class schedules</p>
      </div>

      {/* Selection Form */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Day</label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a day" />
              </SelectTrigger>
              <SelectContent>
                {days.map(day => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveTimetable}
            disabled={!selectedClass}
            className="px-4 py-2 bg-sky-800 text-white rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            Save Timetable
          </button>
          <button
            onClick={() => setTimetable({})}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-300"
          >
            Clear All
          </button>
        </div>
      </Card>

      {/* Timetable Grid */}
      {selectedClass && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {classes.find(c => c.id === selectedClass)?.name} - {selectedDay}
          </h3>
          
          <div className="space-y-3">
            {periods.map(period => (
              <div key={period.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                <div className="w-20 text-sm font-medium text-gray-600">
                  {period.time}
                </div>
                <div className="w-24 text-sm font-medium text-gray-800">
                  {period.name}
                </div>
                <div className="flex-1">
                  <Select 
                    value={timetable[`${selectedDay}-${period.id}`] || ""} 
                    onValueChange={(value) => handlePeriodChange(period.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Assign subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Copy Timetable</h3>
          <p className="text-gray-600 mb-4">Copy timetable from one day to another</p>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="From day" />
              </SelectTrigger>
              <SelectContent>
                {days.map(day => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="To day" />
              </SelectTrigger>
              <SelectContent>
                {days.map(day => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button className="px-4 py-2 bg-sky-800 text-white rounded-md hover:bg-sky-700 transition-colors duration-300">
              Copy
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Timetable Templates</h3>
          <p className="text-gray-600 mb-4">Use pre-defined timetable templates</p>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-300 text-left">
              Standard Template (6 periods)
            </button>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-300 text-left">
              Extended Template (7 periods)
            </button>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-300 text-left">
              Custom Template
            </button>
          </div>
        </Card>
      </div>

      {/* Current Timetables Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Class Timetables</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-semibold text-gray-600">Class</th>
                <th className="text-left p-3 font-semibold text-gray-600">Students</th>
                <th className="text-left p-3 font-semibold text-gray-600">Subjects</th>
                <th className="text-left p-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(cls => (
                <tr key={cls.id} className="border-b border-gray-100">
                  <td className="p-3 font-medium text-gray-800">{cls.name}</td>
                  <td className="p-3 text-gray-600">32 students</td>
                  <td className="p-3 text-gray-600">6 subjects</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      Complete
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </>
  );
}
