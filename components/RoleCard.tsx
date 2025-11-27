/**
 * ROLE CARD COMPONENT
 * 
 * This component displays a card for each user role (Admin, Student, Teacher)
 * on the home page, allowing users to select their role and navigate to the
 * appropriate login page.
 * 
 * PURPOSE:
 * - Provides visual role selection interface on the home page
 * - Displays role-specific information and descriptions
 * - Handles navigation to role-specific login pages
 * - Creates consistent visual design for role selection
 * 
 * FUNCTIONALITY:
 * - Displays role title and description
 * - Shows optional icon with accent color
 * - Provides clickable link to role-specific login
 * - Supports different accent colors for visual distinction
 * - Responsive design with hover effects
 * 
 * DESIGN FEATURES:
 * - Clean card layout with shadow and rounded corners
 * - Accent color system for different roles
 * - Icon placeholder with colored background
 * - Call-to-action button with hover states
 * - Consistent typography and spacing
 * 
 * USAGE:
 * Used on the home page to display role selection cards.
 * Each card represents a different user type with appropriate styling.
 */

import Link from "next/link";
import Image from "next/image";

/**
 * Props interface for RoleCard component
 */
type RoleCardProps = {
  title: string;                    // Role title (e.g., "Admin", "Student", "Teacher")
  description: string;              // Role description text
  href: string;                     // Link destination for the role
  accent?: "blue" | "green" | "purple" | "sky" | "cyan"; // Accent color theme
  iconSrc?: string;                // Optional icon image src (displayed in circle)
};

/**
 * RoleCard Component
 * 
 * Displays a card for role selection with title, description, and navigation link.
 * Each role has a distinct accent color for visual identification.
 * 
 * @param props - RoleCardProps object containing card configuration
 * @returns JSX element representing a role selection card
 */
export default function RoleCard({ title, description, href, iconSrc }: RoleCardProps) {
  // Define accent color styles for different roles
  // For landing page parity with provided design, use a single circle color
  const accentBg = "bg-blue-100 text-blue-700";

  // Use a single primary blue button to match the requested color
  const buttonBg = "bg-blue-800";

  return (
    <div className={`w-full h-full rounded-2xl bg-white p-9 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow`}> 
      {/* Icon container with accent color background */}
      <div className={`mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full ${accentBg} ring-4 ring-gray-100`}>
        {iconSrc ? (
          <Image src={iconSrc} alt={`${title} icon`} width={48} height={48} />
        ) : null}
      </div>
      
      {/* Role title */}
      <h3 className="text-center text-xl font-bold text-gray-800">{title}</h3>
      
      {/* Role description */}
      <p className="mt-3 text-center text-sm text-gray-600 leading-6">{description}</p>
      
      {/* Login button/link */}
      <Link
        href={href}
        className={`mt-6 block rounded-md px-5 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90 ${buttonBg}`}
      >
        Login as {title}
      </Link>
    </div>
  );
}



