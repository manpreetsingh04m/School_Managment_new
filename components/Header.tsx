/**
 * HEADER COMPONENT
 *
 * This component displays the school name and branding at the top of pages,
 * providing consistent branding and visual identity throughout the application.
 *
 * PURPOSE:
 * - Displays the school name prominently on pages
 * - Provides consistent branding across the application
 * - Creates a professional header for the school management system
 * - Establishes visual hierarchy and school identity
 *
 * FUNCTIONALITY:
 * - Renders the school name "St. Joseph's Convent School"
 * - Uses white text for visibility against gradient background
 * - Centers the text for balanced visual presentation
 * - Provides appropriate spacing and typography
 *
 * DESIGN FEATURES:
 * - Large, bold white text for high visibility
 * - Centered alignment for professional appearance
 * - Appropriate padding and margins for spacing
 * - Font weight and size optimized for header display
 *
 * USAGE:
 * Used on the home page and other landing pages to display school branding.
 * Should be placed at the top of pages with gradient backgrounds.
 */

/**
 * Header Component
 *
 * Displays the school name and branding in a prominent header format.
 * Designed to work with gradient backgrounds and provide clear school identity.
 *
 * @returns JSX element representing the school header
 */
// import Image from "next/image";
type HeaderProps = { textColor?: "black" | "white" };
export default function Header({ textColor = "white" }: HeaderProps) {
  return (
    <header className="w-full py-6">
      {/* School name with prominent styling */}
      {/* <Image
        src="/school_name-removebg-preview.png"
        alt="School Logo"
        width={160}
        height={80}
        className="mx-auto"
      /> */}
      <h1 className={`mt-6 text-center ${textColor === "white" ? "text-white" : "text-blue-800"} text-4xl md:text-5xl lg:text-6xl font-black`}>
        XYZ SCHOOL
      </h1>
    </header>
  );
}
