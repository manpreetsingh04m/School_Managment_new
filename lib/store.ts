/**
 * DATA STORE AND STATE MANAGEMENT
 * 
 * This module provides centralized data management for the school management system.
 * It handles all CRUD operations for school entities like classes, teachers, students,
 * fees, notices, and timetables using localStorage for persistence.
 * 
 * PURPOSE:
 * - Centralized data storage and management for the entire application
 * - Provides CRUD operations for all school entities
 * - Handles data persistence using browser localStorage
 * - Manages relationships between different entities (classes, teachers, students)
 * - Provides data migration and validation for backward compatibility
 * 
 * FUNCTIONALITY:
 * - Type definitions for all school entities
 * - localStorage-based data persistence with migration support
 * - Comprehensive API for managing school data
 * - Relationship management between entities
 * - Data validation and error handling
 * 
 * ENTITIES MANAGED:
 * - ClassRoom: School classes with subjects
 * - Teacher: Teacher information and assignments
 * - Student: Student information and class assignments
 * - Fee: Fee structure and payment tracking
 * - Notice: School announcements and communications
 * - Timetable: Class schedules and time management
 * 
 * DATA RELATIONSHIPS:
 * - Teachers can be assigned to classes as class teachers
 * - Teachers can teach specific subjects to specific classes
 * - Students belong to classes and have roll numbers
 * - Fees are associated with classes and track student payments
 * - Notices can be class-specific or school-wide
 * - Timetables organize class schedules by day and period
 * 
 * USAGE:
 * Import storeApi to perform data operations:
 * - storeApi.addClass() - Create new class
 * - storeApi.addTeacher() - Add teacher
 * - storeApi.addStudent() - Add student
 * - storeApi.addNotice() - Create notice
 * - storeApi.addTimetable() - Create timetable
 */

/**
 * ===== TYPE DEFINITIONS =====
 * Define the structure of all entities in the school management system
 */

/**
 * ClassRoom entity representing a school class
 * Contains class information and associated subjects
 */
export type ClassRoom = { 
  id: string;           // Unique class identifier
  name: string;         // Class name (e.g., "Grade 8A")
  subjects?: string[];  // List of subjects taught in this class
};

/**
 * SubjectAssignment entity for teacher-subject-class relationships
 * Links teachers to specific subjects in specific classes
 */
export type SubjectAssignment = { 
  classId: string;      // Class where subject is taught
  subject: string;      // Subject name
};

/**
 * Teacher entity representing school teachers
 * Contains teacher information, assignments, and roles
 */
export type Teacher = { 
  id: string;                              // Unique teacher identifier
  name: string;                            // Teacher's full name
  email: string;                           // Teacher's email address
  phone: string;                           // Teacher's phone number
  password: string;                        // Teacher's login password
  gender?: string;                         // Teacher's gender
  dob?: string;                            // Teacher's date of birth
  classId?: string;                        // Class they are assigned as class teacher
  subject?: string;                        // Primary subject they teach
  isClassTeacher?: boolean;                // Whether they are a class teacher
  subjectAssignments?: SubjectAssignment[]; // Subjects they teach in different classes
};

/**
 * Attendance entity representing daily attendance records
 * Tracks student attendance for specific classes and subjects
 */
export type Attendance = {
  id: string;           // Unique attendance record identifier
  studentId: string;    // Student ID
  classId: string;      // Class ID
  subject: string;      // Subject name
  date: string;         // Date in YYYY-MM-DD format
  status: 'present' | 'absent'; // Attendance status
  markedBy: string;     // Teacher ID who marked attendance
  createdAt: string;    // When the record was created
};

/**
 * Attendance Summary for reporting
 */
export type AttendanceSummary = {
  studentId: string;
  studentName: string;
  rollNo: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
};

/**
 * Homework Assignment entity for teacher homework assignments
 */
export type HomeworkAssignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: string;
  teacherId: string;
  classId: string;
  createdAt: string;
  attachments?: string[];
};
export type Student = { 
  id: string;        // Unique student identifier
  name: string;       // Student's full name
  email: string;      // Student's email address
  phone: string;      // Student's phone number
  rollNo: string;    // Student's roll number
  classId: string;    // Class they belong to
  parentName: string; // Parent/guardian name
  password: string;   // Student's login password
  gender?: string;    // Student's gender
  dob?: string;      // Date of birth
  fatherName?: string; // Father's name
  motherName?: string; // Mother's name
  photo?: string;     // Student's photo URL/base64
  blocked?: boolean;  // Whether the student is blocked/inactive
};

/**
 * Fee entity representing class fees and payment tracking
 * Manages fee structure and tracks which students have paid
 */
export type Fee = { 
  classId: string;           // Class the fee applies to
  amount: number;            // Fee amount
  dueDate?: string;          // Optional due date
  paidStudentIds: string[]; // IDs of students who have paid
};

/**
 * Installment for a student's fee plan
 */
export type FeeInstallment = {
  index: number;           // 1-based installment index
  amount: number;          // amount for this installment
  dueDate: string;         // ISO date string
  paid: boolean;           // whether this installment is paid
  paidAt?: string;         // ISO timestamp when paid
};

/**
 * Class-level fee config
 */
export type ClassFeeConfig = {
  classId: string;           // class id
  baseFeeAmount: number;     // base fee applied to all students
  numInstallments: number;   // number of installments
  installmentDates: string[]; // array length == numInstallments, ISO dates
  createdAt: string;
  updatedAt: string;
};

/**
 * Per-student fee state including extra fees (e.g., transport, hostel, uniform)
 */
export type StudentFeeState = {
  studentId: string;              // student id
  classId: string;                // redundant but handy
  extraFees?: Record<string, number>; // dynamic extra fees (transport, hostel, uniform, etc.)
  installments: FeeInstallment[]; // computed schedule
};

/**
 * Grading section (e.g., Term 1, Unit 1, Midterm)
 */
export type GradingSection = {
  id: string;
  name: string;                   // e.g., "Term 1", "Unit 1", "Midterm"
  subjectIds: string[];           // array of subject IDs
  createdAt: string;
  updatedAt: string;
};

/**
 * Student marks for a specific section and subject
 */
export type StudentMarks = {
  id: string;
  sectionId: string;
  subjectId: string;
  studentId: string;
  marks: number;
  maxMarks: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Exam schedule for a class/subject within a section/term
 */
export type ExamSchedule = {
  id: string;
  sectionId: string;    // e.g., Term 1 / Unit 1 (GradingSection id)
  classId: string;      // class id, e.g., 8A
  subjectId: string;    // subject id
  title: string;        // e.g., Mid Term, Unit Test 1
  date: string;         // YYYY-MM-DD
  startTime?: string;   // HH:mm
  endTime?: string;     // HH:mm
  room?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Notice entity representing school announcements
 * Can be class-specific or school-wide communications
 */
export type Notice = { 
  id: string;        // Unique notice identifier
  teacherId: string;  // Teacher who created the notice
  classId?: string;   // Optional: specific class (null for school-wide)
  title: string;      // Notice title
  message: string;    // Notice content
  createdAt: string; // Creation timestamp
};

/**
 * TimetablePeriod entity representing a single period in a timetable
 * Contains time slot, teacher, and subject information
 */
export type TimetablePeriod = { 
  id: string;      // Unique period identifier
  timeSlot: string; // Time slot (e.g., "9:00 AM - 10:00 AM")
  teacherId: string; // Teacher assigned to this period
  subject: string;   // Subject taught in this period
};

/**
 * Timetable entity representing a complete day's schedule for a class
 * Contains all periods for a specific class on a specific day
 */
export type Timetable = { 
  id: string;              // Unique timetable identifier
  classId: string;         // Class this timetable belongs to
  day: string;             // Day of the week
  periods: TimetablePeriod[]; // List of periods for this day
  createdAt: string;      // Creation timestamp
};

/**
 * Subject entity representing school subjects
 * Contains subject information for curriculum management
 */
export type Subject = {
  id: string;             // Unique subject identifier
  name: string;           // Subject name
};

/**
 * Leave request for students and teachers
 */
export type Leave = {
  id: string;                 // Unique leave id
  requesterRole: 'student' | 'teacher';
  requesterId: string;        // studentId or teacherId
  requesterName: string;      // cached for convenience
  classId?: string;           // student's classId (for student leaves)
  type: 'Casual' | 'Sick' | 'Annual' | 'Other';
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  startTime?: string;         // HH:mm
  endTime?: string;           // HH:mm
  reason: string;             // leave reason
  emergencyContact?: string;  // optional contact during leave
  substituteTeacherName?: string; // optional substitute teacher suggestion
  status: 'pending' | 'approved' | 'rejected';
  approverRole: 'teacher' | 'admin'; // who must approve
  approverId?: string;        // approver teacher/admin id once handled
  createdAt: string;
  decidedAt?: string;         // when approved/rejected
};

/**
 * SYLLABUS MANAGEMENT
 * Structure for managing subject syllabus with chapters and topics
 */
export type SyllabusChapter = {
  id: string;
  chapterName: string;
  topics: string[];
  createdAt: string;
};

export type SubjectSyllabus = {
  id: string;
  subjectId: string;
  classId: string;
  chapters: SyllabusChapter[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Store type representing the complete application state
 * Contains all entities and their relationships
 */
export type Store = {
  classes: ClassRoom[];     // All school classes
  teachers: Teacher[];      // All teachers
  students: Student[];      // All students
  fees: Fee[];              // All fee structures
  notices: Notice[];        // All notices/announcements
  timetables: Timetable[];  // All timetables
  feeConfigs?: ClassFeeConfig[]; // Class fee configurations
  studentFees?: StudentFeeState[]; // Per-student fee schedules
  attendance: Attendance[]; // All attendance records
  homeworkAssignments: HomeworkAssignment[]; // All homework assignments
  gradingSections: GradingSection[]; // All grading sections
  studentMarks: StudentMarks[]; // All student marks
  subjects: Subject[]; // All subjects
  examSchedules?: ExamSchedule[]; // Exam schedules
  leaves?: Leave[]; // Leave requests
  syllabus?: SubjectSyllabus[]; // Subject syllabus with chapters and topics
};

/**
 * ===== STORAGE CONFIGURATION =====
 */

// Storage key for persisting store data in localStorage
const KEY = "sms_store_v2_fresh";

/**
 * Generates a simple unique identifier
 * Used for creating IDs for new entities
 * 
 * @returns Random string ID
 */
function uuid() { 
  return Math.random().toString(36).slice(2, 10); 
}

/**
 * ===== TYPE SAFETY HELPERS =====
 */

// Raw types for data migration (less strict than final types)
type RawClass = { id?: string; name?: string; subjects?: unknown };
type RawStore = { 
  classes?: unknown; 
  teachers?: unknown; 
  students?: unknown; 
  fees?: unknown; 
  notices?: unknown; 
  timetables?: unknown,
  feeConfigs?: unknown,
  studentFees?: unknown,
  attendance?: unknown,
  homeworkAssignments?: unknown,
  gradingSections?: unknown,
  studentMarks?: unknown,
  subjects?: unknown,
  examSchedules?: unknown,
  leaves?: unknown,
  syllabus?: unknown
};

/**
 * Ensures a value is an array, returning empty array if not
 * Used for safe data migration and validation
 * 
 * @param value - Value to check
 * @returns Array of the specified type
 */
function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * ===== DATA MIGRATION =====
 */

/**
 * Migrates raw store data to proper types with validation
 * Handles backward compatibility and data corruption
 * 
 * @param raw - Raw data from localStorage
 * @returns Properly typed Store object
 */
function migrateStore(raw: unknown): Store {
  const s = (raw as RawStore) || {};
  
  const migrated: Store = {
    // Migrate classes with proper validation
    classes: ensureArray<RawClass>(s.classes).map((c) => ({
      id: String(c.id ?? ""),
      name: String(c.name ?? "Unnamed"),
      subjects: ensureArray<string>(c.subjects)
    })),
    
    // Migrate other entities (already properly typed)
    teachers: ensureArray<Teacher>(s.teachers),
    students: ensureArray<Student>(s.students),
    fees: ensureArray<Fee>(s.fees),
    notices: ensureArray<Notice>(s.notices),
    timetables: ensureArray<Timetable>(s.timetables),
    feeConfigs: ensureArray<ClassFeeConfig>(s.feeConfigs),
    studentFees: ensureArray<StudentFeeState>(s.studentFees),
    attendance: ensureArray<Attendance>(s.attendance),
    homeworkAssignments: ensureArray<HomeworkAssignment>(s.homeworkAssignments),
    gradingSections: ensureArray<GradingSection>(s.gradingSections),
    studentMarks: ensureArray<StudentMarks>(s.studentMarks),
    subjects: ensureArray<Subject>(s.subjects)
    ,examSchedules: ensureArray<ExamSchedule>(s.examSchedules)
    ,leaves: ensureArray<Leave>(s.leaves),
    syllabus: ensureArray<SubjectSyllabus>(s.syllabus)
  };
  
  return migrated;
}

/**
 * ===== CORE STORE FUNCTIONS =====
 */

/**
 * Reads the store from localStorage with migration support
 * Handles cases where localStorage is not available or contains corrupted data
 * 
 * @returns Store object with all application data
 */
export function readStore(): Store {
  // Return empty store during server-side rendering
  if (typeof window === "undefined") {
    return { classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [], syllabus: [] };
  }
  
  // Read data from localStorage
  const raw = localStorage.getItem(KEY);
  if (!raw) return initStore();
  
  try { 
    const migrated = migrateStore(JSON.parse(raw));
    
    // Check if teachers array is empty and reinitialize if needed
    if (!migrated.teachers || migrated.teachers.length === 0) {
      return initStore();
    }
    
    return migrated;
  } catch { 
    return initStore(); // Initialize if data is corrupted
  }
}

/**
 * Writes the store to localStorage
 * Only executes in browser environment
 * 
 * @param store - Store object to persist
 */
function writeStore(store: Store) { 
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(store)); 
  }
}

/**
 * Initializes the store with seed data
 * Creates default classes, teachers, and students for demo purposes
 * 
 * @returns Initialized Store object with seed data
 */
export function initStore(): Store {
  const seed: Store = {
    // Default classes with subjects
    classes: [
      { id: "8A", name: "Grade 8A", subjects: ["Mathematics", "Science", "English"] },
      { id: "8B", name: "Grade 8B", subjects: ["Mathematics", "Science"] },
      { id: "10B", name: "Grade 10B", subjects: ["Mathematics", "Science", "English"] }
    ],
    
    // Default teachers with assignments
    teachers: [
      {
        id: "teacher1",
        name: "Ms. Johnson",
        email: "teacher@school.com",
        phone: "1234567890",
        password: "teacher123",
        gender: "Female",
        classId: "8A",
        subject: "Mathematics",
        isClassTeacher: true,
        subjectAssignments: [
          { classId: "8A", subject: "Mathematics" },
          { classId: "8B", subject: "Mathematics" }
        ]
      },
      {
        id: "teacher2", 
        name: "Mr. Smith",
        email: "science.teacher@school.com",
        phone: "1234567891",
        password: "teacher123",
        gender: "Male",
        classId: "8A",
        subject: "Science",
        isClassTeacher: false,
        subjectAssignments: [
          { classId: "8A", subject: "Science" },
          { classId: "8B", subject: "Science" }
        ]
      }
    ],
    
    // Default students
    students: [],
    
    // Default fee structure
    fees: [],
    
    // Demo notices
    notices: [],
    
    // Demo timetables
    timetables: [],
    feeConfigs: [],
    studentFees: [],
    attendance: [],
    homeworkAssignments: [],
    gradingSections: [],
    studentMarks: [],
    subjects: [
      { id: "math", name: "Mathematics" },
      { id: "science", name: "Science" },
      { id: "english", name: "English" },
      { id: "social", name: "Social Studies" },
      { id: "history", name: "History" },
      { id: "geography", name: "Geography" },
      { id: "physics", name: "Physics" },
      { id: "chemistry", name: "Chemistry" },
      { id: "biology", name: "Biology" },
      { id: "computer", name: "Computer Science" },
      { id: "art", name: "Art" },
      { id: "music", name: "Music" },
      { id: "pe", name: "Physical Education" }
    ],
    examSchedules: [],
    leaves: [],
    syllabus: []
  };
  
  writeStore(seed);
  return seed;
}

/**
 * ===== STORE API =====
 * Comprehensive API for managing all school entities
 */

export const storeApi = {
  /** AUTHENTICATION */
  
  /**
   * Authenticates a user by email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @param role - Expected user role (student, teacher, admin)
   * @returns User object if authentication successful, null otherwise
   */
  authenticateUser(email: string, password: string, role: "student" | "teacher" | "admin") {
    const s = readStore();
    
    if (role === "admin") {
      // Admin authentication - check for admin@school.com
      if (email === "admin@school.com" && password === "admin123") {
        return {
          role: "admin" as const,
          name: "School Administrator",
          email: "admin@school.com"
        };
      }
    } else if (role === "teacher") {
      // Teacher authentication
      const teacher = s.teachers.find(t => t.email === email && t.password === password);
      if (teacher) {
        return {
          role: "teacher" as const,
          name: teacher.name,
          email: teacher.email,
          classId: teacher.classId,
          subjectAssignments: teacher.subjectAssignments
        };
      }
    } else if (role === "student") {
      // Student authentication
      const student = s.students.find(st => st.email === email && st.password === password);
      if (student) {
        return {
          role: "student" as const,
          name: student.name,
          email: student.email,
          grade: s.classes.find(c => c.id === student.classId)?.name
        };
      }
    }
    
    return null;
  },

  /** STUDENT MANAGEMENT (ADMIN) */
  blockStudent(studentId: string, blocked: boolean) {
    const s = readStore();
    const stu = s.students.find(st => st.id === studentId);
    if (stu) {
      stu.blocked = blocked;
      writeStore(s);
    }
    return stu || null;
  },

  deleteStudent(studentId: string) {
    const s = readStore();
    s.students = s.students.filter(st => st.id !== studentId);
    // Clean up related data lightly (optional advance cleanup omitted for demo)
    s.attendance = (s.attendance || []).filter(a => a.studentId !== studentId);
    s.studentFees = (s.studentFees || []).filter(f => f.studentId !== studentId);
    s.studentMarks = (s.studentMarks || []).filter(m => m.studentId !== studentId);
    writeStore(s);
  },
  /**
   * CLASS MANAGEMENT
   */
  
  /**
   * Adds a new class to the store
   * 
   * @param name - Class name
   * @returns Created ClassRoom object
   */
  addClass(name: string) {
    const s = readStore();
    const c: ClassRoom = { id: uuid(), name, subjects: [] };
    s.classes.push(c); 
    writeStore(s); 
    return c;
  },
  
  /**
   * Adds subjects to an existing class
   * 
   * @param classId - Class ID to add subjects to
   * @param subjects - Array of subject names
   */
  addSubjectsToClass(classId: string, subjects: string[]) {
    const s = readStore();
    const cls = s.classes.find(c => c.id === classId);
    if (!cls) return;
    
    // Use Set to avoid duplicates
    const existing = new Set((cls.subjects || []).map(x => x.trim()));
    subjects.map(x => x.trim()).filter(Boolean).forEach(x => existing.add(x));
    cls.subjects = Array.from(existing);
    writeStore(s);
  },
  
  /**
   * Removes a subject from a class
   * 
   * @param classId - Class ID
   * @param subject - Subject name to remove
   */
  removeSubjectFromClass(classId: string, subject: string) {
    const s = readStore();
    const cls = s.classes.find(c => c.id === classId);
    if (!cls || !cls.subjects) return;
    
    cls.subjects = cls.subjects.filter(sub => sub !== subject);
    writeStore(s);
  },
  
  /**
   * TEACHER MANAGEMENT
   */
  
  /**
   * Adds a new teacher to the store
   * 
   * @param t - Teacher data without ID
   * @returns Created Teacher object
   */
  addTeacher(t: Omit<Teacher, "id">) {
    const s = readStore(); 
    const item: Teacher = { ...t, id: uuid() };
    s.teachers.push(item); 
    writeStore(s); 
    return item;
  },

  /**
   * Deletes a teacher from the system
   * 
   * @param teacherId - ID of the teacher to delete
   * @returns true if deleted successfully, false if not found
   */
  deleteTeacher(teacherId: string) {
    const s = readStore();
    const teacherIndex = s.teachers.findIndex(t => t.id === teacherId);
    if (teacherIndex === -1) return false;
    
    s.teachers.splice(teacherIndex, 1);
    writeStore(s);
    return true;
  },
  
  /**
   * Assigns a teacher as class teacher for a specific class
   * 
   * @param teacherId - Teacher ID
   * @param classId - Class ID to assign
   */
  assignClassTeacher(teacherId: string, classId: string) {
    const s = readStore(); 
    s.teachers = s.teachers.map(t => 
      t.id === teacherId ? { ...t, classId, isClassTeacher: true } : t
    ); 
    writeStore(s);
  },
  
  /**
   * Sets the primary subject for a teacher
   * 
   * @param teacherId - Teacher ID
   * @param subject - Subject name
   */
  setTeacherSubject(teacherId: string, subject: string) {
    const s = readStore(); 
    s.teachers = s.teachers.map(t => 
      t.id === teacherId ? { ...t, subject } : t
    ); 
    writeStore(s);
  },
  
  /**
   * Sets whether a teacher is a class teacher
   * 
   * @param teacherId - Teacher ID
   * @param isClassTeacher - Whether teacher is a class teacher
   */
  setTeacherClassRole(teacherId: string, isClassTeacher: boolean) {
    const s = readStore(); 
    s.teachers = s.teachers.map(t => 
      t.id === teacherId ? { ...t, isClassTeacher } : t
    ); 
    writeStore(s);
  },
  
  /**
   * Removes class teacher assignment from a teacher
   * 
   * @param teacherId - Teacher ID
   */
  removeClassTeacher(teacherId: string) {
    const s = readStore();
    s.teachers = s.teachers.map(t => 
      t.id === teacherId ? { ...t, classId: undefined, isClassTeacher: false } : t
    );
    writeStore(s);
  },
  
  /**
   * Adds a subject assignment for a teacher to a specific class
   * 
   * @param teacherId - Teacher ID
   * @param classId - Class ID
   * @param subject - Subject name
   */
  addSubjectAssignment(teacherId: string, classId: string, subject: string) {
    const s = readStore();
    s.teachers = s.teachers.map(t => {
      if (t.id !== teacherId) return t;
      
      const list = (t.subjectAssignments || []).slice();
      const exists = list.find(a => 
        a.classId === classId && 
        a.subject.trim().toLowerCase() === subject.trim().toLowerCase()
      );
      
      if (!exists) list.push({ classId, subject: subject.trim() });
      return { ...t, subjectAssignments: list };
    });
    writeStore(s);
  },
  
  /**
   * Removes a subject assignment from a teacher
   * 
   * @param teacherId - Teacher ID
   * @param classId - Class ID
   * @param subject - Subject name
   */
  removeSubjectAssignment(teacherId: string, classId: string, subject: string) {
    const s = readStore();
    s.teachers = s.teachers.map(t => 
      t.id === teacherId ? { 
        ...t, 
        subjectAssignments: (t.subjectAssignments || []).filter(a => 
          !(a.classId === classId && a.subject === subject)
        ) 
      } : t
    );
    writeStore(s);
  },
  
  /**
   * STUDENT MANAGEMENT
   */
  
  /**
   * Adds a new student to the store
   * 
   * @param stu - Student data without ID
   * @returns Created Student object
   */
  addStudent(stu: Omit<Student, "id">) { 
    const s = readStore(); 
    const item: Student = { ...stu, id: uuid() }; 
    s.students.push(item); 
    writeStore(s); 
    return item; 
  },
  
  /**
   * Gets all students belonging to a specific class
   * 
   * @param classId - Class ID
   * @returns Array of Student objects
   */
  listStudentsByClass(classId: string) { 
    return readStore().students.filter(s => s.classId === classId); 
  },
  
  /**
   * FEE MANAGEMENT
   */
  
  /**
   * Sets fee structure for a class
   * 
   * @param classId - Class ID
   * @param amount - Fee amount
   * @param dueDate - Optional due date
   */
  setClassFee(classId: string, amount: number, dueDate?: string) {
    const s = readStore(); 
    const existing = s.fees.find(f => f.classId === classId);
    
    if (existing) { 
      existing.amount = amount; 
      existing.dueDate = dueDate; 
    } else {
      s.fees.push({ classId, amount, dueDate, paidStudentIds: [] });
    }
    writeStore(s);
  },
  
  /**
   * Marks a student's fee as paid
   * 
   * @param studentId - Student ID
   */
  markFeePaid(studentId: string) { 
    const s = readStore(); 
    s.fees.forEach(f => { 
      if (!f.paidStudentIds.includes(studentId)) {
        f.paidStudentIds.push(studentId); 
      }
    }); 
    writeStore(s); 
  },
  
  /**
   * Gets fee information for a specific class
   * 
   * @param classId - Class ID
   * @returns Fee object or null if not found
   */
  getClassFee(classId: string) { 
    return readStore().fees.find(f => f.classId === classId) || null; 
  },

  /**
   * ===== ADVANCED FEE MANAGEMENT (INSTALLMENTS) =====
   */
  setClassFeeConfig(classId: string, baseFeeAmount: number, numInstallments: number) {
    const s = readStore();
    if (!s.feeConfigs) s.feeConfigs = [];
    const now = new Date().toISOString();
    const existing = s.feeConfigs.find(f => f.classId === classId);
    if (existing) {
      existing.baseFeeAmount = baseFeeAmount;
      existing.numInstallments = numInstallments;
      // reset dates if count changed
      if (existing.installmentDates.length !== numInstallments) {
        existing.installmentDates = Array.from({ length: numInstallments }, () => "");
      }
      existing.updatedAt = now;
    } else {
      s.feeConfigs.push({
        classId,
        baseFeeAmount,
        numInstallments,
        installmentDates: Array.from({ length: numInstallments }, () => ""),
        createdAt: now,
        updatedAt: now
      });
    }
    writeStore(s);
  },

  setInstallmentDates(classId: string, dates: string[]) {
    const s = readStore();
    if (!s.feeConfigs) s.feeConfigs = [];
    const cfg = s.feeConfigs.find(f => f.classId === classId);
    if (!cfg) return;
    if (dates.length !== cfg.numInstallments) return;
    cfg.installmentDates = dates.map(d => String(d || ""));
    cfg.updatedAt = new Date().toISOString();
    writeStore(s);
  },

  upsertStudentExtraFees(studentId: string, classId: string, extra: Record<string, number>) {
    const s = readStore();
    if (!s.studentFees) s.studentFees = [];
    const sf = s.studentFees.find(x => x.studentId === studentId);
    if (sf) {
      sf.extraFees = { ...sf.extraFees, ...extra };
    } else {
      s.studentFees.push({ studentId, classId, extraFees: { ...extra }, installments: [] });
    }
    writeStore(s);
  },

  recomputeStudentInstallments(studentId: string) {
    const s = readStore();
    if (!s.studentFees) s.studentFees = [];
    const student = s.students.find(st => st.id === studentId);
    if (!student) return;
    const cfg = (s.feeConfigs || []).find(c => c.classId === student.classId);
    if (!cfg) return;

    const sf = s.studentFees.find(x => x.studentId === studentId) || { studentId, classId: student.classId, extraFees: {}, installments: [] as FeeInstallment[] };
    const extra = Object.values(sf.extraFees || {}).reduce((sum, fee) => sum + Number(fee), 0);
    const total = Math.max(0, Math.round((cfg.baseFeeAmount + extra) * 100) / 100);
    const n = Math.max(1, cfg.numInstallments);
    const base = Math.floor((total / n) * 100) / 100;
    const installments: FeeInstallment[] = Array.from({ length: n }, (_, i) => ({
      index: i + 1,
      amount: base,
      dueDate: cfg.installmentDates[i] || "",
      paid: sf.installments?.[i]?.paid || false,
      paidAt: sf.installments?.[i]?.paidAt
    }));
    // adjust last to fix rounding drift
    const allocated = installments.reduce((sum, it) => sum + it.amount, 0);
    const drift = Math.round((total - allocated) * 100) / 100;
    installments[installments.length - 1].amount = Math.round((installments[installments.length - 1].amount + drift) * 100) / 100;

    if (!s.studentFees.find(x => x.studentId === studentId)) {
      s.studentFees.push({ ...sf, installments });
    } else {
      sf.installments = installments;
    }
    writeStore(s);
  },

  markInstallmentPaid(studentId: string, index: number, paid: boolean) {
    const s = readStore();
    const sf = (s.studentFees || []).find(x => x.studentId === studentId);
    if (!sf) return;
    const inst = sf.installments.find(i => i.index === index);
    if (!inst) return;
    inst.paid = paid;
    inst.paidAt = paid ? new Date().toISOString() : undefined;
    writeStore(s);
  },

  getClassFeeConfig(classId: string) {
    return (readStore().feeConfigs || []).find(c => c.classId === classId) || null;
  },

  getStudentFeeState(studentId: string) {
    return (readStore().studentFees || []).find(s => s.studentId === studentId) || null;
  },

  /**
   * Returns computed fee states for all students in a class.
   * This is a read-only helper that derives installments from the current class fee config
   * and merges any persisted per-student extra fees and paid flags. It does not write to the store.
   */
  getClassStudentsFeeStates(classId: string) {
    const s = readStore();
    const cfg = (s.feeConfigs || []).find(c => c.classId === classId);
    const studentsInClass = s.students.filter(st => st.classId === classId);
    const results: StudentFeeState[] = studentsInClass.map(st => {
      const persisted = (s.studentFees || []).find(x => x.studentId === st.id);
      // compute installments transiently from cfg and persisted flags
      let installments: FeeInstallment[] = [];
      if (cfg) {
        const extraTotal = Object.values(persisted?.extraFees || {}).reduce((sum, fee) => sum + Number(fee), 0);
        const total = Math.max(0, Math.round((cfg.baseFeeAmount + extraTotal) * 100) / 100);
        const n = Math.max(1, cfg.numInstallments);
        const baseAmount = Math.floor((total / n) * 100) / 100;
        installments = Array.from({ length: n }, (_, i) => {
          const index = i + 1;
          const persistedInst = persisted?.installments?.find(pi => pi.index === index);
          return {
            index,
            amount: baseAmount,
            dueDate: cfg.installmentDates[i] || "",
            paid: Boolean(persistedInst?.paid),
            paidAt: persistedInst?.paidAt
          } as FeeInstallment;
        });
        const allocated = installments.reduce((sum, it) => sum + it.amount, 0);
        const drift = Math.round((total - allocated) * 100) / 100;
        installments[installments.length - 1].amount = Math.round((installments[installments.length - 1].amount + drift) * 100) / 100;
      }
      return {
        studentId: st.id,
        classId: st.classId,
        extraFees: persisted?.extraFees,
        installments
      } as StudentFeeState;
    });
    return results;
  },

  /**
   * ===== GRADING SYSTEM =====
   */

  /**
   * Creates a new grading section
   */
  createGradingSection(name: string, subjectIds: string[]) {
    const s = readStore();
    const section: GradingSection = {
      id: uuid(),
      name: name.trim(),
      subjectIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    s.gradingSections.push(section);
    writeStore(s);
    return section;
  },

  /**
   * Gets all grading sections
   */
  getGradingSections() {
    return readStore().gradingSections;
  },

  /**
   * Gets grading section by ID
   */
  getGradingSection(sectionId: string) {
    return readStore().gradingSections.find(s => s.id === sectionId) || null;
  },

  /**
   * Updates a grading section
   */
  updateGradingSection(sectionId: string, name: string, subjectIds: string[]) {
    const s = readStore();
    const section = s.gradingSections.find(sec => sec.id === sectionId);
    if (section) {
      section.name = name.trim();
      section.subjectIds = subjectIds;
      section.updatedAt = new Date().toISOString();
      writeStore(s);
    }
    return section;
  },

  /**
   * Deletes a grading section
   */
  deleteGradingSection(sectionId: string) {
    const s = readStore();
    s.gradingSections = s.gradingSections.filter(sec => sec.id !== sectionId);
    // Also delete all marks for this section
    s.studentMarks = s.studentMarks.filter(mark => mark.sectionId !== sectionId);
    writeStore(s);
  },

  /**
   * Saves or updates student marks
   */
  saveStudentMarks(sectionId: string, subjectId: string, studentId: string, marks: number, maxMarks: number) {
    const s = readStore();
    const existing = s.studentMarks.find(m => 
      m.sectionId === sectionId && m.subjectId === subjectId && m.studentId === studentId
    );
    
    if (existing) {
      existing.marks = marks;
      existing.maxMarks = maxMarks;
      existing.updatedAt = new Date().toISOString();
    } else {
      const newMark: StudentMarks = {
        id: uuid(),
        sectionId,
        subjectId,
        studentId,
        marks,
        maxMarks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      s.studentMarks.push(newMark);
    }
    writeStore(s);
  },

  /**
   * Gets student marks for a specific section and subject
   */
  getStudentMarks(sectionId: string, subjectId: string) {
    return readStore().studentMarks.filter(m => 
      m.sectionId === sectionId && m.subjectId === subjectId
    );
  },

  /**
   * Gets marks for a specific student
   */
  getStudentMarksForStudent(studentId: string) {
    return readStore().studentMarks.filter(m => m.studentId === studentId);
  },

  /**
   * Gets all subjects
   */
  getSubjects() {
    return readStore().subjects;
  },

  /**
   * Adds a new subject
   */
  addSubject(name: string) {
    const s = readStore();
    const subject = {
      id: uuid(),
      name: name.trim()
    };
    s.subjects.push(subject);
    writeStore(s);
    return subject;
  },

  /**
   * ===== TEACHER EXAM SCHEDULES =====
   */
  addExamSchedule(sectionId: string, classId: string, subjectId: string, data: { title: string; date: string; startTime?: string; endTime?: string; room?: string; instructions?: string; }) {
    const s = readStore();
    if (!s.examSchedules) s.examSchedules = [];
    const schedule: ExamSchedule = {
      id: uuid(),
      sectionId,
      classId,
      subjectId,
      title: data.title.trim(),
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room,
      instructions: data.instructions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    s.examSchedules.push(schedule);
    writeStore(s);
    return schedule;
  },

  updateExamSchedule(id: string, updates: Partial<Omit<ExamSchedule, 'id' | 'createdAt'>>) {
    const s = readStore();
    const found = (s.examSchedules || []).find(x => x.id === id);
    if (!found) return null;
    Object.assign(found, updates, { updatedAt: new Date().toISOString() });
    writeStore(s);
    return found;
  },

  removeExamSchedule(id: string) {
    const s = readStore();
    s.examSchedules = (s.examSchedules || []).filter(x => x.id !== id);
    writeStore(s);
  },

  getExamSchedulesForSection(sectionId: string) {
    return (readStore().examSchedules || []).filter(x => x.sectionId === sectionId);
  },

  getExamSchedulesForClass(classId: string) {
    return (readStore().examSchedules || []).filter(x => x.classId === classId);
  },

  /**
   * ATTENDANCE MANAGEMENT
   */
  
  /**
   * Marks attendance for a student
   * 
   * @param studentId - Student ID
   * @param classId - Class ID
   * @param subject - Subject name
   * @param date - Date in YYYY-MM-DD format
   * @param status - 'present' or 'absent'
   * @param markedBy - Teacher ID
   * @returns Created Attendance object
   */
  markAttendance(studentId: string, classId: string, subject: string, date: string, status: 'present' | 'absent', markedBy: string) {
    const s = readStore();
    
    // Remove existing attendance for same student, class, subject, and date
    s.attendance = s.attendance.filter(a => 
      !(a.studentId === studentId && a.classId === classId && a.subject === subject && a.date === date)
    );
    
    // Add new attendance record
    const attendance: Attendance = {
      id: uuid(),
      studentId,
      classId,
      subject,
      date,
      status,
      markedBy,
      createdAt: new Date().toISOString()
    };
    
    s.attendance.push(attendance);
    writeStore(s);
    return attendance;
  },
  
  /**
   * Gets attendance records for a specific class and date
   * 
   * @param classId - Class ID
   * @param date - Date in YYYY-MM-DD format
   * @param subject - Optional subject filter
   * @returns Array of Attendance objects
   */
  getAttendanceByClassAndDate(classId: string, date: string, subject?: string) {
    return readStore().attendance.filter(a => 
      a.classId === classId && 
      a.date === date && 
      (!subject || a.subject === subject)
    );
  },
  
  /**
   * Gets attendance summary for a student
   * 
   * @param studentId - Student ID
   * @param classId - Class ID
   * @param subject - Optional subject filter
   * @param startDate - Start date for summary
   * @param endDate - End date for summary
   * @returns AttendanceSummary object
   */
  getAttendanceSummary(studentId: string, classId: string, subject?: string, startDate?: string, endDate?: string) {
    const s = readStore();
    const student = s.students.find(st => st.id === studentId);
    if (!student) return null;
    
    let records = s.attendance.filter(a => 
      a.studentId === studentId && 
      a.classId === classId &&
      (!subject || a.subject === subject)
    );
    
    if (startDate) {
      records = records.filter(a => a.date >= startDate);
    }
    if (endDate) {
      records = records.filter(a => a.date <= endDate);
    }
    
    const totalDays = records.length;
    const presentDays = records.filter(a => a.status === 'present').length;
    const absentDays = totalDays - presentDays;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    return {
      studentId,
      studentName: student.name,
      rollNo: student.rollNo,
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage
    };
  },
  
  /**
   * Gets all attendance records
   * 
   * @returns Array of all Attendance objects
   */
  getAllAttendance() {
    return readStore().attendance;
  },
  
  /**
   * HOMEWORK ASSIGNMENT MANAGEMENT
   */
  
  /**
   * Adds a new homework assignment
   * @param assignment - The homework assignment to add
   * @returns The added assignment with generated ID
   */
  addHomeworkAssignment(assignment: Omit<HomeworkAssignment, 'id' | 'createdAt'>) {
    const store = readStore();
    const newAssignment: HomeworkAssignment = {
      ...assignment,
      id: `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedStore = {
      ...store,
      homeworkAssignments: [...store.homeworkAssignments, newAssignment]
    };
    
    writeStore(updatedStore);
    return newAssignment;
  },
  
  /**
   * Gets all homework assignments
   * @returns Array of all HomeworkAssignment objects
   */
  getAllHomeworkAssignments() {
    return readStore().homeworkAssignments;
  },
  
  /**
   * Gets homework assignments by teacher
   * @param teacherId - The teacher's ID
   * @returns Array of homework assignments created by the teacher
   */
  getHomeworkAssignmentsByTeacher(teacherId: string) {
    return readStore().homeworkAssignments.filter(hw => hw.teacherId === teacherId);
  },
  
  /**
   * Gets homework assignments by class
   * @param classId - The class ID
   * @returns Array of homework assignments for the class
   */
  getHomeworkAssignmentsByClass(classId: string) {
    return readStore().homeworkAssignments.filter(hw => hw.classId === classId);
  },
  
  /**
   * Removes a homework assignment
   * @param assignmentId - The assignment ID to remove
   */
  removeHomeworkAssignment(assignmentId: string) {
    const store = readStore();
    const updatedStore = {
      ...store,
      homeworkAssignments: store.homeworkAssignments.filter(hw => hw.id !== assignmentId)
    };
    
    writeStore(updatedStore);
  },
  
  /**
   * NOTICE MANAGEMENT
   */
  
  /**
   * Adds a new notice to the store
   * 
   * @param teacherId - Teacher who created the notice
   * @param title - Notice title
   * @param message - Notice content
   * @param classId - Optional class ID for class-specific notices
   * @returns Created Notice object
   */
  addNotice(teacherId: string, title: string, message: string, classId?: string) {
    const s = readStore(); 
    const item: Notice = { 
      id: uuid(), 
      teacherId, 
      classId, 
      title, 
      message, 
      createdAt: new Date().toISOString() 
    }; 
    s.notices.push(item); 
    writeStore(s); 
    return item;
  },
  
  /**
   * Gets the class teacher for a specific class
   * 
   * @param classId - Class ID
   * @returns Teacher object or null if not found
   */
  getTeacherByClass(classId: string) { 
    return readStore().teachers.find(t => t.classId === classId) || null; 
  },
  
  /**
   * TIMETABLE MANAGEMENT
   */
  
  /**
   * Adds a new timetable for a class on a specific day
   * Replaces any existing timetable for the same class-day combination
   * 
   * @param classId - Class ID
   * @param day - Day of the week
   * @param periods - Array of period data
   * @returns Created Timetable object
   */
  addTimetable(classId: string, day: string, periods: Omit<TimetablePeriod, "id">[]) {
    const s = readStore();
    
    // Remove existing timetable for this class-day combination
    s.timetables = s.timetables.filter(t => !(t.classId === classId && t.day === day));
    
    const timetable: Timetable = {
      id: uuid(),
      classId,
      day,
      periods: periods.map(p => ({ ...p, id: uuid() })),
      createdAt: new Date().toISOString()
    };
    s.timetables.push(timetable);
    writeStore(s);
    return timetable;
  },
  
  /**
   * Updates an existing timetable
   * 
   * @param timetableId - Timetable ID
   * @param day - New day
   * @param periods - New periods array
   * @returns Updated Timetable object or null if not found
   */
  updateTimetable(timetableId: string, day: string, periods: Omit<TimetablePeriod, "id">[]) {
    const s = readStore();
    const timetable = s.timetables.find(t => t.id === timetableId);
    if (timetable) {
      timetable.day = day;
      timetable.periods = periods.map(p => ({ ...p, id: uuid() }));
      writeStore(s);
    }
    return timetable;
  },
  
  /**
   * Deletes a timetable
   * 
   * @param timetableId - Timetable ID to delete
   */
  deleteTimetable(timetableId: string) {
    const s = readStore();
    s.timetables = s.timetables.filter(t => t.id !== timetableId);
    writeStore(s);
  },
  
  /**
   * Gets all timetables for a specific class
   * 
   * @param classId - Class ID
   * @returns Array of Timetable objects
   */
  getTimetableByClass(classId: string) {
    return readStore().timetables.filter(t => t.classId === classId);
  },
  
  /**
   * Gets timetable for a specific class and day
   * 
   * @param classId - Class ID
   * @param day - Day of the week
   * @returns Timetable object or null if not found
   */
  getTimetableByClassAndDay(classId: string, day: string) {
    return readStore().timetables.find(t => t.classId === classId && t.day === day) || null;
  },
  
  /**
   * Gets all timetables in the system
   * 
   * @returns Array of all Timetable objects
   */
  getAllTimetables() {
    return readStore().timetables;
  },

  /**
   * ===== LEAVE MANAGEMENT =====
   */
  /**
   * Create a leave request. For students, approver is class teacher; for teachers, approver is admin.
   */
  requestLeave(params: {
    requesterRole: 'student' | 'teacher';
    requesterId: string;
    type: 'Casual' | 'Sick' | 'Annual' | 'Other';
    startDate: string; endDate: string; startTime?: string; endTime?: string;
    reason: string; emergencyContact?: string; substituteTeacherName?: string;
  }) {
    const s = readStore();
    const id = uuid();
    let requesterName = '';
    let classId: string | undefined = undefined;
    let approverRole: 'teacher' | 'admin' = 'admin';

    if (params.requesterRole === 'student') {
      const st = s.students.find(x => x.id === params.requesterId);
      requesterName = st?.name || 'Student';
      classId = st?.classId;
      approverRole = 'teacher';
    } else {
      const t = s.teachers.find(x => x.id === params.requesterId);
      requesterName = t?.name || 'Teacher';
      approverRole = 'admin';
    }

    const leave: Leave = {
      id,
      requesterRole: params.requesterRole,
      requesterId: params.requesterId,
      requesterName,
      classId,
      type: params.type,
      startDate: params.startDate,
      endDate: params.endDate,
      startTime: params.startTime,
      endTime: params.endTime,
      reason: params.reason,
      emergencyContact: params.emergencyContact,
      substituteTeacherName: params.substituteTeacherName,
      status: 'pending',
      approverRole,
      createdAt: new Date().toISOString(),
    };

    const updated = readStore();
    if (!updated.leaves) updated.leaves = [];
    updated.leaves.push(leave);
    writeStore(updated);
    return leave;
  },

  /** List leaves for a requester */
  getLeavesForRequester(role: 'student' | 'teacher', requesterId: string) {
    const s = readStore();
    return (s.leaves || []).filter(l => l.requesterRole === role && l.requesterId === requesterId);
  },

  /**
   * Lists leaves pending for approval for a teacher (class teacher) or admin.
   * For teacher approver: only leaves from students of their class.
   */
  getLeavesPendingForApprover(params: { approverRole: 'teacher' | 'admin'; approverId?: string }) {
    const s = readStore();
    const leaves = (s.leaves || []).filter(l => l.status === 'pending' && l.approverRole === params.approverRole);
    if (params.approverRole === 'teacher' && params.approverId) {
      const teacher = s.teachers.find(t => t.id === params.approverId);
      const classId = teacher?.classId;
      if (!classId) return [] as Leave[];
      return leaves.filter(l => l.requesterRole === 'student' && l.classId === classId);
    }
    return leaves;
  },

  /** Approve or reject a leave */
  decideLeave(leaveId: string, approve: boolean, approverId: string) {
    const s = readStore();
    const found = (s.leaves || []).find(l => l.id === leaveId);
    if (!found) return null;
    found.status = approve ? 'approved' : 'rejected';
    found.approverId = approverId;
    found.decidedAt = new Date().toISOString();
    writeStore(s);
    return found;
  },

  /** SYLLABUS MANAGEMENT */

  /**
   * Get syllabus for a specific subject and class
   */
  getSubjectSyllabus(subjectId: string, classId: string): SubjectSyllabus | null {
    const s = readStore();
    return (s.syllabus || []).find(syl => syl.subjectId === subjectId && syl.classId === classId) || null;
  },

  /**
   * Get all syllabus for a specific class
   */
  getClassSyllabus(classId: string): SubjectSyllabus[] {
    const s = readStore();
    return (s.syllabus || []).filter(syl => syl.classId === classId);
  },

  /**
   * Add or update syllabus for a subject and class
   */
  addSubjectSyllabus(subjectId: string, classId: string, chapters: SyllabusChapter[]): SubjectSyllabus {
    const s = readStore();
    const existing = (s.syllabus || []).find(syl => syl.subjectId === subjectId && syl.classId === classId);
    
    if (existing) {
      existing.chapters = chapters;
      existing.updatedAt = new Date().toISOString();
      writeStore(s);
      return existing;
    } else {
      const newSyllabus: SubjectSyllabus = {
        id: `syl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        subjectId,
        classId,
        chapters,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (!s.syllabus) s.syllabus = [];
      s.syllabus.push(newSyllabus);
      writeStore(s);
      return newSyllabus;
    }
  },

  /**
   * Add a chapter to existing syllabus
   */
  addChapterToSyllabus(subjectId: string, classId: string, chapterName: string, topics: string[]): SyllabusChapter {
    const s = readStore();
    let syllabus = (s.syllabus || []).find(syl => syl.subjectId === subjectId && syl.classId === classId);
    
    if (!syllabus) {
      syllabus = this.addSubjectSyllabus(subjectId, classId, []);
    }
    
    const newChapter: SyllabusChapter = {
      id: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      chapterName,
      topics,
      createdAt: new Date().toISOString()
    };
    
    syllabus.chapters.push(newChapter);
    syllabus.updatedAt = new Date().toISOString();
    
    // Update the store's syllabus array
    if (!s.syllabus) {
      s.syllabus = [];
    }
    
    // Find and update the syllabus in the store's array
    const syllabusIndex = s.syllabus.findIndex(syl => syl.subjectId === subjectId && syl.classId === classId);
    if (syllabusIndex >= 0) {
      s.syllabus[syllabusIndex] = syllabus;
    } else {
      s.syllabus.push(syllabus);
    }
    
    writeStore(s);
    return newChapter;
  },

  /**
   * Update a chapter in syllabus
   */
  updateChapterInSyllabus(subjectId: string, classId: string, chapterId: string, chapterName: string, topics: string[]): boolean {
    const s = readStore();
    const syllabus = (s.syllabus || []).find(syl => syl.subjectId === subjectId && syl.classId === classId);
    
    if (!syllabus) return false;
    
    const chapter = syllabus.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return false;
    
    chapter.chapterName = chapterName;
    chapter.topics = topics;
    syllabus.updatedAt = new Date().toISOString();
    writeStore(s);
    return true;
  },

  /**
   * Delete a chapter from syllabus
   */
  deleteChapterFromSyllabus(subjectId: string, classId: string, chapterId: string): boolean {
    const s = readStore();
    const syllabus = (s.syllabus || []).find(syl => syl.subjectId === subjectId && syl.classId === classId);
    
    if (!syllabus) return false;
    
    const chapterIndex = syllabus.chapters.findIndex(ch => ch.id === chapterId);
    if (chapterIndex === -1) return false;
    
    syllabus.chapters.splice(chapterIndex, 1);
    syllabus.updatedAt = new Date().toISOString();
    writeStore(s);
    return true;
  }
};
