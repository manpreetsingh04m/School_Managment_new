"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import { readStore, storeApi } from "@/lib/store";
import type { Store, Student } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUser } from "@/lib/auth";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function TeacherClassesPage() {
  const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
  const [classId, setClassId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [photo, setPhoto] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; classId?: string; subjectAssignments?: { classId: string; subject: string }[] } | null>(null);
  const { success, error, toasts, removeToast } = useToast();

  useEffect(() => {
    const store = readStore();
    setState(store);
    
    const user = getUser();
    if (user && user.email) {
      const teacher = store.teachers.find(t => t.email === user.email);
      if (teacher) {
        setTeacherInfo(teacher);
        // Set default class to teacher's assigned class
        if (teacher.classId) {
          setClassId(teacher.classId);
        }
      }
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherInfo?.classId) {
      error("You are not assigned to any class. Contact admin.");
      return;
    }
    
    // Force add student to teacher's assigned class
    const targetClassId = teacherInfo.classId;
    storeApi.addStudent({ 
      name, 
      email, 
      phone, 
      rollNo, 
      classId: targetClassId, 
      password: "student123",
      gender: gender || undefined,
      dob: dob || undefined,
      fatherName: fatherName || undefined,
      motherName: motherName || undefined,
      photo: photo || undefined,
      parentName: "N/A" // Default value since field is removed
    });
    clearForm();
    setState(readStore());
    
    // Show success toast
    success(`Student ${name} added successfully to your class`);
    setShowAddStudent(false);
  };

  const editStudent = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setRollNo(student.rollNo);
    setGender(student.gender || "");
    setDob(student.dob || "");
    setFatherName(student.fatherName || "");
    setMotherName(student.motherName || "");
    setPhoto(student.photo || "");
    setShowAddStudent(true);
  };

  const updateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    const updatedStudent = {
      ...editingStudent,
      name,
      email,
      phone,
      rollNo,
      password: "student123",
      gender: gender || undefined,
      dob: dob || undefined,
      fatherName: fatherName || undefined,
      motherName: motherName || undefined,
      photo: photo || undefined,
      parentName: editingStudent.parentName || "N/A" // Keep existing or default
    };
    
    // Since there's no updateStudent method, we'll delete and re-add
    storeApi.deleteStudent(editingStudent.id);
    storeApi.addStudent(updatedStudent);
    
    clearForm();
    setState(readStore());
    setShowAddStudent(false);
    setEditingStudent(null);
  };

  // Deleting students from teacher portal is disabled per requirements

  const clearForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRollNo("");
    setGender("");
    setDob("");
    setFatherName("");
    setMotherName("");
    setPhoto("");
  };

  // Get students from all classes where teacher is assigned (both class teacher and subject teacher)
  const getAssignedStudents = () => {
    if (!teacherInfo) return [];
    
    const assignedClassIds = new Set<string>();
    if (teacherInfo.classId) assignedClassIds.add(teacherInfo.classId);
    if (teacherInfo.subjectAssignments) {
      teacherInfo.subjectAssignments.forEach(assignment => {
        assignedClassIds.add(assignment.classId);
      });
    }
    
    return state.students.filter(s => assignedClassIds.has(s.classId));
  };
  
  const students = classId ? state.students.filter(s=>s.classId===classId) : getAssignedStudents();

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Classes</h1>

      <Card title={teacherInfo?.classId ? "My Class" : "Select Class"} actions={
        <div className="flex items-center gap-3">
          {teacherInfo?.classId ? (
            <div className="px-3 py-2 border rounded-md bg-gray-50 text-gray-700">
              {state.classes.find(c => c.id === teacherInfo.classId)?.name || 
               (teacherInfo.classId.includes('B') ? `Grade ${teacherInfo.classId}` : `Class ${teacherInfo.classId}`)}
            </div>
          ) : (
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose Class" />
              </SelectTrigger>
              <SelectContent>
                {state.classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {(classId || teacherInfo?.classId) && (
            <button 
              onClick={()=>setShowAddStudent(true)} 
              className="bg-sky-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Add Student
            </button>
          )}
        </div>
      }>
        <div className="text-gray-500 text-sm">
          {teacherInfo?.classId ? 
            `Your assigned class: ${state.classes.find(c => c.id === teacherInfo.classId)?.name || teacherInfo.classId}` : 
            classId ? `Selected: ${state.classes.find(c => c.id === classId)?.name}` : 
            "Please select a class to manage students"
          }
        </div>
      </Card>

      {(classId || teacherInfo?.classId) && (
        <>
          {/* Add/Edit Student Modal */}
          {showAddStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800 uppercase">
                    {editingStudent ? "Edit Student" : "Add Student"}
                  </h2>
                  <button 
                    onClick={() => {
                      setShowAddStudent(false);
                      setEditingStudent(null);
                      clearForm();
                    }} 
                    className="p-2 rounded hover:bg-gray-100 transition-colors"
                    aria-label="Close modal"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={editingStudent ? updateStudent : addStudent} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 uppercase">Full Name *</label>
                      <input 
                        placeholder="ENTER FULL NAME" 
                        value={name} 
                        onChange={e=>setName(e.target.value)} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md normal-case text-sm sm:text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 uppercase">Roll Number *</label>
                      <input 
                        placeholder="ENTER ROLL NUMBER" 
                        value={rollNo} 
                        onChange={e=>setRollNo(e.target.value)} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md normal-case text-sm sm:text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 uppercase">Email *</label>
                      <input 
                        placeholder="ENTER EMAIL" 
                        type="email" 
                        value={email} 
                        onChange={e=>setEmail(e.target.value)} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md normal-case text-sm sm:text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 uppercase">Phone *</label>
                      <input 
                        placeholder="ENTER PHONE NUMBER" 
                        value={phone} 
                        onChange={e=>setPhone(e.target.value)} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md normal-case text-sm sm:text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 uppercase">Gender</label>
                      <select 
                        value={gender} 
                        onChange={e=>setGender(e.target.value)} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        aria-label="Select gender"
                      >
                        <option value="">SELECT GENDER</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 uppercase">Date of Birth</label>
                      <input 
                        type="date" 
                        value={dob} 
                        onChange={e=>setDob(e.target.value)} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        aria-label="Select date of birth"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 uppercase">Father&apos;s Name</label>
                      <input 
                        placeholder="ENTER FATHER'S NAME" 
                        value={fatherName} 
                        onChange={e=>setFatherName(e.target.value)} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md normal-case text-sm sm:text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 uppercase">Mother&apos;s Name</label>
                      <input 
                        placeholder="ENTER MOTHER'S NAME" 
                        value={motherName} 
                        onChange={e=>setMotherName(e.target.value)} 
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md normal-case text-sm sm:text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" 
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3 uppercase">Student Photo</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-purple-200">
                          {photo ? (
                            <Image src={photo} alt="Student preview" width={96} height={96} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload Photo
                          </button>
                          <p className="text-xs text-gray-500 mt-1">JPG or PNG, max 2MB</p>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            aria-label="Upload student photo"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <button 
                      type="submit" 
                      className="bg-sky-800 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md hover:bg-sky-700 transition-colors font-semibold uppercase text-xs sm:text-sm"
                    >
                      {editingStudent ? "Update Student" : "Add Student"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowAddStudent(false);
                        setEditingStudent(null);
                        clearForm();
                      }} 
                      className="px-6 sm:px-8 py-2 sm:py-3 rounded-md border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold uppercase text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
            </form>
              </div>
            </div>
          )}

          <Card title="Students">
            <div className="space-y-3">
              {students.map(stu => (
                <div key={stu.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center overflow-hidden">
                      {stu.photo ? (
                        <Image src={stu.photo} alt={stu.name} width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                  <div>
                      <div className="font-semibold text-gray-800">{stu.name}</div>
                      <div className="text-sm text-gray-600">Roll No: {stu.rollNo}</div>
                      <div className="text-sm text-gray-500">{stu.email} • {stu.phone}</div>
                      {stu.gender && (
                        <div className="text-xs text-gray-500">Gender: {stu.gender}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => editStudent(stu)}
                      className="p-2 text-sky-600 hover:bg-sky-100 rounded-md transition-colors"
                      title="Edit Student"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* Delete disabled in teacher portal */}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
    </>
  );
}
