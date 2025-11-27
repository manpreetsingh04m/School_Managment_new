"use client";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readStore } from "@/lib/store";
import type { Store } from "@/lib/store";
import { getUser } from "@/lib/auth";

const GradeTag = ({grade}: {grade: string}) => {
    const color = {
        'A+': 'bg-green-100 text-green-800',
        'A': 'bg-green-100 text-green-800',
        'B': 'bg-blue-100 text-blue-800',
    }[grade] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>{grade}</span>;
}

const getGrade = (marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 95) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 75) return 'B';
    if (percentage >= 65) return 'C';
    return 'D';
};

export default function ViewMarksPage() {
    const [state, setState] = useState<Store>({ classes: [], teachers: [], students: [], fees: [], notices: [], timetables: [], feeConfigs: [], studentFees: [], attendance: [], homeworkAssignments: [], gradingSections: [], studentMarks: [], subjects: [], examSchedules: [], leaves: [] });
    const [user] = useState(getUser());

    useEffect(() => {
        setState(readStore());
    }, []);

    // Get marks for the current student
    const student = user?.email ? state.students.find(s => s.email === user.email) : null;
    const studentMarks = student ? state.studentMarks.filter(m => m.studentId === student.id) : [];
    
    // Group marks by grading section
    const marksBySection = state.gradingSections.map(section => {
        const sectionMarks = studentMarks.filter(mark => mark.sectionId === section.id);
        const items = sectionMarks.map(mark => {
            const subject = state.subjects.find(s => s.id === mark.subjectId);
            return {
                subject: subject?.name || 'Unknown',
                marks: `${mark.marks}/${mark.maxMarks}`,
                grade: getGrade(mark.marks, mark.maxMarks)
            };
        });
        return {
            name: section.name,
            items
        };
    }).filter(section => section.items.length > 0);

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-4">
                <Link 
                  href="/student" 
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </Link>
              </div>
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Marks Center</h1>
                <p className="text-sm sm:text-base text-gray-500">View your marks for all assessments.</p>
            </div>

            {marksBySection.length === 0 ? (
              <Card title="No Marks Available">
                <div className="text-center py-8 text-gray-500">
                  <p>No marks have been recorded yet.</p>
                </div>
              </Card>
            ) : (
              marksBySection.map(section => (
                <Card key={section.name} title={section.name}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px] text-xs sm:text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3">Subject</th>
                          <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3">Marks</th>
                          <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item, index) => (
                          <tr key={index} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4">
                              <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-md">{item.subject}</span>
                            </td>
                            <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 font-semibold">{item.marks}</td>
                            <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4"><GradeTag grade={item.grade} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ))
            )}
        </div>
    );
}

