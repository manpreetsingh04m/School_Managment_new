"use client";
import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { readStore, storeApi } from "@/lib/store";
import type { Store } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUser } from "@/lib/auth";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function TeacherHomeworkPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; classId?: string; email?: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const { success, error, toasts, removeToast } = useToast();
  
  // Form states
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const store = readStore();
    setState(store);
    
    // Get teacher info from authenticated user
    const user = getUser();
    if (user && user.role === "teacher") {
      setTeacherInfo(user);
    }
  }, []);

  // Get all subjects from all classes
  const allSubjects = state.classes.flatMap(cls => cls.subjects || []).filter((subject, index, self) => self.indexOf(subject) === index);
  
  // Get homework assignments for the current teacher
  const teacherAssignments = teacherInfo ? 
    state.homeworkAssignments.filter(hw => {
      // Find teacher by email to get their ID
      const teacher = state.teachers.find(t => t.email === teacherInfo.email);
      return teacher && hw.teacherId === teacher.id;
    }) : 
    state.homeworkAssignments;

  const handleCreateHomework = () => {
    if (!assignmentTitle || !description || !dueDate || !selectedSubject) {
      error("Please fill in all required fields");
      return;
    }

    if (!teacherInfo) {
      error("Teacher information not found. Please sign in again.");
      return;
    }

    // Find teacher by email to get their ID
    const teacher = state.teachers.find(t => t.email === teacherInfo.email);
    if (!teacher) {
      error("Teacher record not found. Please contact administrator.");
      return;
    }

    // Get teacher's assigned class ID
    const classId = teacherInfo.classId || teacher.classId;
    if (!classId) {
      error("You are not assigned to any class. Please contact administrator.");
      return;
    }

    // Add homework assignment to store
    storeApi.addHomeworkAssignment({
      title: assignmentTitle,
      description,
      dueDate,
      subject: selectedSubject,
      teacherId: teacher.id,
      classId: classId
    });

    // Reset form and close modal
    setAssignmentTitle("");
    setDescription("");
    setDueDate("");
    setSelectedSubject("");
    
    // Refresh state
    setState(readStore());
    setShowCreateModal(false);
    
    // Show success toast
    success("Homework assignment created successfully!");
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    storeApi.removeHomeworkAssignment(assignmentId);
    const updated = readStore();
    setState(updated);
    setMenuOpenId(null);
    setConfirmDelete(null);
    
    // Show success toast
    success("Homework assignment deleted successfully");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Homework Management</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Create and manage homework assignments for your class
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 bg-sky-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors text-sm sm:text-base"
        >
          Send Homework
        </button>
      </div>

      {/* Homework Assignments */}
      <Card title="Recent Homework Assignments">
        <div className="space-y-4">
          {teacherAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No homework assignments yet</p>
              <p className="text-xs text-gray-400 mt-1">Click &quot;Send Homework&quot; to create your first assignment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Header with title and options */}
                    <div className="flex items-start justify-between relative">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight flex-1 pr-2">
                        {assignment.title}
                      </h3>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMenuOpenId(menuOpenId === assignment.id ? null : assignment.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          aria-label="Open actions"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        {menuOpenId === assignment.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: assignment.id, title: assignment.title }); }}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Description (max 10 lines, scrollable) */}
                    <div className="text-xs text-gray-600 leading-relaxed max-h-40 overflow-y-auto pr-1">
                      {assignment.description}
                    </div>
                    
                    {/* Tags */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Due {formatDate(assignment.dueDate)}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {assignment.subject}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>


      {/* Create Homework Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-2xl font-bold uppercase">Send Homework</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                <input
                  type="text"
                  placeholder="e.g., Chapter 5 Practice Problems"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base normal-case"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Add assignment details and instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base normal-case"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Select due date"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {allSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Attachments</label>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Add files or resources
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button
                  onClick={handleCreateHomework}
                  className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2 sm:py-3 bg-sky-800 text-white rounded-lg hover:bg-sky-700 transition-colors text-xs sm:text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Homework
                </button>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 sm:px-8 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Confirm Deletion</h2>
              <button aria-label="Close" onClick={() => setConfirmDelete(null)} className="p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-4 sm:mb-6">
              <p>Are you sure you want to permanently delete the homework assignment <span className="font-semibold">&quot;{confirmDelete.title}&quot;</span>? This action cannot be undone.</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-md border text-sm sm:text-base">Cancel</button>
              <button onClick={() => handleDeleteAssignment(confirmDelete.id)} className="px-4 py-2 rounded-md text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white">
                Delete Assignment
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}