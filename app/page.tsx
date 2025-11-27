/**
 * HOME PAGE COMPONENT
 * 
 * This is the main landing page of the school management system.
 * It serves as the entry point where users can choose their role and access the system.
 * 
 * PURPOSE:
 * - Provides a welcoming interface for the school management system
 * - Allows users to select their role (Admin, Student, Teacher)
 * - Redirects users to appropriate login pages based on their role
 * - Creates a professional first impression with gradient background
 * 
 * FUNCTIONALITY:
 * - Displays three role cards for different user types
 * - Each card shows relevant description and redirects to appropriate signin page
 * - Uses responsive design that adapts to different screen sizes
 * - Includes header component for navigation
 * - Wrapped in gradient background for visual appeal
 * 
 * USER ROLES:
 * - Admin: Access to full dashboard for managing school data
 * - Student: Access to course materials, assignments, and grades
 * - Teacher: Access to course creation, assignment management, and student tracking
 * 
 * USAGE:
 * This is the default page that loads when users visit the root URL (/)
 * Users click on their respective role card to proceed to the login page
 */

import RoleCard from "../components/RoleCard";
import GradientBackground from "../components/GradientBackground";
import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * Home Component
 * 
 * The main landing page that displays role selection cards.
 * Users can choose between Admin, Student, or Teacher roles to access the system.
 * 
 * @returns JSX element with role selection interface
 */
export default function Home() {
  return (
    <GradientBackground>
      {/* Header on white background so logo sits cleanly */}
      <Header textColor="black" />
      <section className="mx-auto mt-2 md:mt-3 lg:mt-4 max-w-5xl px-6 text-center">
        <h1 className="text-base md:text-lg lg:text-xl font-semibold tracking-tight text-gray-700">Choose Your Portal</h1>
        <p className="mt-1 text-xs md:text-sm text-gray-500">Sign in as Admin, Student, or Teacher to continue</p>
      </section>

      {/* Main content area with prominent role cards */}
      <main className="mx-auto mt-8 md:mt-10 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl px-6 items-stretch">
        
        {/* Admin Role Card (cyan to match admin shell) */}
        <RoleCard
          title="Admin"
          description="Login as an administrator to access the dashboard to manage app data."
          href="/signin/admin"
          accent="cyan"
          iconSrc="/admin.png"
        />
        
        {/* Student Role Card (blue to match student shell) */}
        <RoleCard
          title="Student"
          description="Login as a student to explore course materials and assignments."
          href="/signin/student"
          accent="blue"
          iconSrc="/student.png"
        />
        
        {/* Teacher Role Card (sky to match teacher shell) */}
        <RoleCard
          title="Teacher"
          description="Login as a teacher to create courses, assignments, and track student progress."
          href="/signin/teacher"
          accent="sky"
          iconSrc="/teacher.png"
        />
      </main>
      <Footer className="mt-12" />
    </GradientBackground>
  );
}
