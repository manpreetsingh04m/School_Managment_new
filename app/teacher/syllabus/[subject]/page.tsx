"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useParams } from "next/navigation";
import { readStore, storeApi } from "@/lib/store";
import type { Store, SyllabusChapter } from "@/lib/store";
import { getUser } from "@/lib/auth";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function SubjectSyllabusPage() {
  const params = useParams();
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [], syllabus: [] });
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; classId?: string; subjectAssignments?: { classId: string; subject: string }[] } | null>(null);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [topics, setTopics] = useState("");
  const [editingChapter, setEditingChapter] = useState<SyllabusChapter | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<string | null>(null);
  const { success, error, toasts, removeToast } = useToast();

  // More robust parameter handling
  const subjectName = params?.subject ? decodeURIComponent(params.subject as string) : '';

  useEffect(() => {
    setState(readStore());
    const user = getUser();
    if (user && user.role === "teacher") {
      setTeacherInfo(user);
    }
  }, []);

  const subjectData = state.subjects.find(s => s.name === subjectName);
  const classSyllabus = subjectData && teacherInfo?.classId ? 
    storeApi.getSubjectSyllabus(subjectData.id, teacherInfo.classId) : null;

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chapterName.trim() || !topics.trim() || !subjectData || !teacherInfo?.classId) {
      error("Please fill in all required fields");
      return;
    }

    const topicsArray = topics.split('\n').map(topic => topic.trim()).filter(topic => topic);
    
    if (topicsArray.length === 0) {
      error("Please add at least one topic");
      return;
    }

    try {
      storeApi.addChapterToSyllabus(subjectData.id, teacherInfo.classId, chapterName.trim(), topicsArray);
      setState(readStore());
      setChapterName("");
      setTopics("");
      setShowAddChapter(false);
      success(`Chapter "${chapterName.trim()}" added successfully!`);
    } catch (err) {
      console.error("Error adding chapter:", err);
      error("Failed to add chapter. Please try again.");
    }
  };

  const handleEditChapter = (chapter: SyllabusChapter) => {
    setEditingChapter(chapter);
    setChapterName(chapter.chapterName);
    setTopics(chapter.topics.join('\n'));
    setShowAddChapter(true);
  };

  const handleUpdateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chapterName.trim() || !topics.trim() || !subjectData || !teacherInfo?.classId || !editingChapter) {
      error("Please fill in all required fields");
      return;
    }

    const topicsArray = topics.split('\n').map(topic => topic.trim()).filter(topic => topic);
    
    if (topicsArray.length === 0) {
      error("Please add at least one topic");
      return;
    }

    try {
      const updateSuccess = storeApi.updateChapterInSyllabus(
        subjectData.id, 
        teacherInfo.classId, 
        editingChapter.id, 
        chapterName.trim(), 
        topicsArray
      );
      
      if (updateSuccess) {
        setState(readStore());
        setChapterName("");
        setTopics("");
        setShowAddChapter(false);
        setEditingChapter(null);
        success(`Chapter "${chapterName.trim()}" updated successfully!`);
      } else {
        error("Failed to update chapter. Please try again.");
      }
    } catch {
      error("Failed to update chapter. Please try again.");
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!subjectData || !teacherInfo?.classId) return;
    
    setDeletingChapter(chapterId);
  };

  const confirmDeleteChapter = () => {
    if (!subjectData || !teacherInfo?.classId || !deletingChapter) return;
    
    try {
      const deleteSuccess = storeApi.deleteChapterFromSyllabus(subjectData.id, teacherInfo.classId, deletingChapter);
      if (deleteSuccess) {
        setState(readStore());
        success("Chapter deleted successfully!");
        setDeletingChapter(null);
      } else {
        error("Failed to delete chapter. Please try again.");
        setDeletingChapter(null);
      }
    } catch {
      error("Failed to delete chapter. Please try again.");
      setDeletingChapter(null);
    }
  };

  const cancelDeleteChapter = () => {
    setDeletingChapter(null);
  };


  const cancelEdit = () => {
    setShowAddChapter(false);
    setChapterName("");
    setTopics("");
    setEditingChapter(null);
  };

  const getTotalTopics = () => {
    if (!classSyllabus) return 0;
    return classSyllabus.chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0);
  };

  // Add error handling for params
  if (!subjectName) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/teacher/syllabus" 
            className="flex items-center gap-2 text-sky-800 hover:text-sky-900 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Subjects
          </Link>
        </div>
        <Card title="Error">
          <div className="text-center py-8 text-gray-500">
            <p>Subject not found. Please go back and select a valid subject.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/teacher/syllabus" 
            className="flex items-center gap-2 text-sky-800 hover:text-sky-900 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Subjects
          </Link>
        </div>
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{subjectName} - Syllabus</h1>
          <p className="text-sm sm:text-base text-gray-500">Manage chapters and topics for {subjectName}.</p>
        </div>

        {/* Subject Overview */}
        <Card title="Subject Overview">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-sky-600">{classSyllabus?.chapters.length || 0}</div>
              <div className="text-sm text-gray-600">Total Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{getTotalTopics()}</div>
              <div className="text-sm text-gray-600">Total Topics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {classSyllabus ? new Date(classSyllabus.updatedAt).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Last Updated</div>
            </div>
          </div>
        </Card>

        {/* Chapter Management */}
        <Card 
          title={`${subjectName} - Chapters`}
          actions={
            <button
              onClick={() => setShowAddChapter(true)}
              className="bg-sky-800 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              + Add Chapter
            </button>
          }
        >
          {classSyllabus && classSyllabus.chapters.length > 0 ? (
            <div className="space-y-4">
              {classSyllabus.chapters.map((chapter, index) => (
                <div key={chapter.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-sky-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                          {chapter.chapterName}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500">
                        Added on {new Date(chapter.createdAt).toLocaleDateString()} • {chapter.topics.length} topics
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditChapter(chapter)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-600">Topics Covered:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {chapter.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0"></span>
                          <span className="text-xs text-gray-700">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Chapters Added Yet</h3>
              <p className="text-gray-600 mb-4">
                Start building your {subjectName} syllabus by adding chapters and topics.
              </p>
              <button
                onClick={() => setShowAddChapter(true)}
                className="bg-sky-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-sky-700 transition-colors"
              >
                Add Your First Chapter
              </button>
            </div>
          )}
        </Card>

        {/* Add/Edit Chapter Modal */}
        {showAddChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 text-lg">
                  {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                </h2>
                <button 
                  onClick={cancelEdit}
                  className="p-1 rounded hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={editingChapter ? handleUpdateChapter : handleAddChapter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Name *
                  </label>
                  <input
                    type="text"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="Enter chapter name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topics * (one per line)
                  </label>
                  <textarea
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="Enter topics, one per line:&#10;Topic 1&#10;Topic 2&#10;Topic 3"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm sm:text-base"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter each topic on a new line
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-800 text-white rounded-md text-sm font-medium hover:bg-sky-700 transition-colors"
                  >
                    {editingChapter ? 'Update Chapter' : 'Add Chapter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deletingChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Confirm Deletion</h2>
                <button 
                  aria-label="Close" 
                  onClick={cancelDeleteChapter} 
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-600 mb-4 sm:mb-6">
                <p>Are you sure you want to permanently delete this chapter? This action cannot be undone.</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button 
                  onClick={cancelDeleteChapter} 
                  className="px-4 py-2 rounded-md border text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteChapter} 
                  className="px-4 py-2 rounded-md text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
