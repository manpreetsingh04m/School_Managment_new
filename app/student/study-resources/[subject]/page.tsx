/**
 * STUDENT SUBJECT STUDY RESOURCES PAGE
 *
 * This page provides detailed study resources for a specific subject with three main sections:
 * 1. Video section with thumbnails and "See All Videos" button
 * 2. Notes section with thumbnails and "See All Notes" button  
 * 3. Textbook section with thumbnails and "See All Textbooks" button
 *
 * PURPOSE:
 * - Display subject-specific study materials
 * - Provide scrollable sections with search functionality
 * - Show proper thumbnails for each resource type
 * - Allow navigation to detailed resource pages
 *
 * FUNCTIONALITY:
 * - Three main sections: Videos, Notes, Textbooks
 * - Scrollable horizontal sections for each resource type
 * - Search functionality within each section
 * - Thumbnail display with proper styling
 * - "See All" buttons for expanded views
 *
 * DESIGN FEATURES:
 * - Modern card-based layout
 * - Horizontal scrolling sections
 * - Search bars for each section
 * - Responsive design
 * - Consistent color scheme
 */

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { readStore } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

// Mock data for resources - in a real app, this would come from the store
const generateMockResources = (subject: string, type: 'video' | 'note' | 'textbook') => {
  const baseCount = type === 'video' ? 8 : type === 'note' ? 12 : 4;
  const resources = [];
  
  for (let i = 1; i <= baseCount; i++) {
    resources.push({
      id: `${type}-${i}`,
      title: `${subject} ${type === 'video' ? 'Video' : type === 'note' ? 'Notes' : 'Textbook'} ${i}`,
      description: `${type === 'video' ? 'Educational video covering key concepts' : type === 'note' ? 'Comprehensive study notes' : 'Reference textbook'}`,
      thumbnail: `/api/placeholder/200/150`,
      duration: type === 'video' ? `${Math.floor(Math.random() * 30) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
      pages: type === 'textbook' ? Math.floor(Math.random() * 200) + 100 : null,
      author: type === 'textbook' ? `Author ${i}` : null,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    });
  }
  
  return resources;
};

export default function SubjectStudyResourcesPage() {
  const params = useParams();
  const subject = decodeURIComponent(params.subject as string);
  
  const [, setState] = useState<Store>({ 
    classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], 
    feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], 
    gradingSections: [], studentMarks: [], subjects: [] 
  });
  const [studentInfo, setStudentInfo] = useState<{ name: string; classId: string } | null>(null);
  
  // Search states for each section
  const [videoSearch, setVideoSearch] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [textbookSearch, setTextbookSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'video'|'note'|'textbook'>("video");

  useEffect(() => {
    const store = readStore();
    setState(store);
    
    const user = getUser();
    if (user && user.email) {
      const student = store.students.find(s => s.email === user.email);
      if (student) {
        setStudentInfo(student);
      }
    }
  }, []);

  // Generate mock resources
  const videos = generateMockResources(subject, 'video');
  const notes = generateMockResources(subject, 'note');
  const textbooks = generateMockResources(subject, 'textbook');

  // Filter resources based on search
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
    video.description.toLowerCase().includes(videoSearch.toLowerCase())
  );
  
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
    note.description.toLowerCase().includes(noteSearch.toLowerCase())
  );
  
  const filteredTextbooks = textbooks.filter(textbook => 
    textbook.title.toLowerCase().includes(textbookSearch.toLowerCase()) ||
    textbook.description.toLowerCase().includes(textbookSearch.toLowerCase())
  );

  interface Resource {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration?: string | null;
    pages?: number | null;
    author?: string | null;
    date: string;
  }

  const ResourceCard = ({ resource, type }: { resource: Resource; type: 'video' | 'note' | 'textbook' }) => {
    const getTypeIcon = () => {
      switch (type) {
        case 'video': return '📹';
        case 'note': return '📝';
        case 'textbook': return '📚';
        default: return '📄';
      }
    };

    const getTypeColor = () => {
      switch (type) {
        case 'video': return 'bg-red-100 text-red-600';
        case 'note': return 'bg-blue-100 text-blue-600';
        case 'textbook': return 'bg-green-100 text-green-600';
        default: return 'bg-gray-100 text-gray-600';
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="relative mb-2">
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mx-auto mb-2 ${getTypeColor()}`}>
                {getTypeIcon()}
              </div>
              <p className="text-xs text-gray-500">Thumbnail</p>
            </div>
          </div>
          {type === 'video' && resource.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {resource.duration}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {resource.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{resource.date}</span>
            {type === 'textbook' && resource.pages && (
              <span>{resource.pages} pages</span>
            )}
            {type === 'textbook' && resource.author && (
              <span className="truncate ml-2">{resource.author}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ScrollableSection = ({ 
    title, 
    resources, 
    searchValue, 
    onSearchChange, 
    type, 
    seeAllHref 
  }: { 
    title: string; 
    resources: Resource[]; 
    searchValue: string; 
    onSearchChange: (value: string) => void; 
    type: 'video' | 'note' | 'textbook';
    seeAllHref: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <Link
          href={seeAllHref}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          See All {title}
        </Link>
      </div>
      
      <div className="relative">
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-2.5">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-8 text-gray-500">
              <p>No {title.toLowerCase()} found matching your search.</p>
            </div>
          ) : (
            resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} type={type} />
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link 
          href="/student/study-resources" 
          className="flex items-center gap-2 text-blue-800 hover:text-blue-900 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Study Resources
        </Link>
      </div>
      
      <div>
        <h1 className="text-xl font-bold text-gray-800">{subject} Study Resources</h1>
        <p className="text-xs text-gray-500">
          Access videos, notes, and textbooks for {subject}
        </p>
      </div>

      {!studentInfo ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Student information not found. Please sign in again.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Top toggle similar to timetable */}
          <div className="flex items-center gap-2 bg-white border rounded-lg p-1 w-full max-w-md">
            <button
              onClick={() => setActiveTab('video')}
              aria-pressed={activeTab==='video'}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab==='video' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('note')}
              aria-pressed={activeTab==='note'}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab==='note' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('textbook')}
              aria-pressed={activeTab==='textbook'}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab==='textbook' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Textbooks
            </button>
          </div>

          {activeTab === 'video' && (
            <ScrollableSection
              title="Videos"
              resources={filteredVideos}
              searchValue={videoSearch}
              onSearchChange={setVideoSearch}
              type="video"
              seeAllHref={`/student/study-resources/${encodeURIComponent(subject)}/videos`}
            />
          )}

          {activeTab === 'note' && (
            <ScrollableSection
              title="Notes"
              resources={filteredNotes}
              searchValue={noteSearch}
              onSearchChange={setNoteSearch}
              type="note"
              seeAllHref={`/student/study-resources/${encodeURIComponent(subject)}/notes`}
            />
          )}

          {activeTab === 'textbook' && (
            <ScrollableSection
              title="Textbooks"
              resources={filteredTextbooks}
              searchValue={textbookSearch}
              onSearchChange={setTextbookSearch}
              type="textbook"
              seeAllHref={`/student/study-resources/${encodeURIComponent(subject)}/textbooks`}
            />
          )}
        </div>
      )}
    </div>
  );
}
