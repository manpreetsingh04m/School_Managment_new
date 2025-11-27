/**
 * AUTHENTICATION CARD COMPONENT
 * 
 * This component provides a reusable authentication form card that can be used
 * for login, signup, and other authentication-related forms across the application.
 * It creates a consistent authentication interface with proper form elements.
 * 
 * PURPOSE:
 * - Provides a standardized authentication form interface
 * - Creates consistent login/signup experience across roles
 * - Handles form layout and styling for authentication
 * - Includes common authentication elements (email, password, buttons)
 * 
 * FUNCTIONALITY:
 * - Displays authentication form with email and password fields
 * - Shows customizable title and subtitle
 * - Includes action button with customizable label
 * - Provides "Forgot Password" link
 * - Supports optional footer links for navigation
 * - Uses reusable Input and Button components
 * 
 * DESIGN FEATURES:
 * - Clean white card with shadow and rounded corners
 * - Lock icon for visual authentication context
 * - Consistent spacing and typography
 * - Responsive design for different screen sizes
 * - Professional appearance suitable for school system
 * 
 * USAGE:
 * Used on authentication pages (login, signup) for different user roles.
 * Provides a consistent interface for all authentication forms.
 */

import Input from "./Input";
import Button from "./Button";

/**
 * Props interface for AuthCard component
 */
type AuthCardProps = {
  title: string;                    // Main title for the auth form
  subtitle?: string;                // Optional subtitle text
  actionLabel?: string;             // Text for the submit button
  footerLink?: {                    // Optional footer link
    href: string;                   // Link destination
    label: string;                  // Link text
  };
};

/**
 * AuthCard Component
 * 
 * Creates a standardized authentication form card with email/password fields,
 * submit button, and optional footer links. Provides consistent styling
 * and layout for all authentication forms.
 * 
 * @param props - AuthCardProps object containing form configuration
 * @returns JSX element representing an authentication form card
 */
export default function AuthCard({ title, subtitle, actionLabel = "Login", footerLink }: AuthCardProps) {
  return (
    <div className="mx-auto w-[420px] rounded-xl bg-white p-6 shadow-xl">
      {/* Lock icon for visual context */}
      <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-600">
        <span className="text-sm">🔒</span>
      </div>
      
      {/* Form title */}
      <h1 className="text-center text-sm font-semibold text-gray-800">{title}</h1>
      
      {/* Optional subtitle */}
      {subtitle ? <p className="mt-1 text-center text-xs text-gray-500">{subtitle}</p> : null}

      {/* Authentication form */}
      <form className="mt-5 space-y-3">
        {/* Email input field */}
        <Input label="Email" type="email" placeholder="Enter your email" />
        
        {/* Password input field */}
        <Input label="Password" type="password" placeholder="Enter your password" />
        
        {/* Submit button */}
        <Button type="submit" fullWidth>
          {actionLabel}
        </Button>
      </form>

      {/* Forgot password link */}
      <div className="mt-3 text-center">
        <a href="#" className="text-xs text-indigo-600 hover:underline">
          Forgot Password?
        </a>
      </div>

      {/* Optional footer link */}
      {footerLink ? (
        <p className="mt-4 text-center text-xs text-gray-500">
          {footerLink.label}
        </p>
      ) : null}
    </div>
  );
}



