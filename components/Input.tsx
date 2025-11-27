/**
 * INPUT COMPONENT
 * 
 * This is a reusable input component that provides consistent styling and behavior
 * for form inputs throughout the school management system. It includes label support
 * and proper accessibility features.
 * 
 * PURPOSE:
 * - Provides consistent input styling across all forms
 * - Supports optional labels with proper accessibility
 * - Handles focus states and visual feedback
 * - Offers flexible customization through props
 * 
 * FUNCTIONALITY:
 * - Renders HTML input element with custom styling
 * - Supports optional label with proper htmlFor association
 * - Generates unique IDs for accessibility when label is provided
 * - Includes focus states with indigo ring
 * - Accepts all standard HTML input attributes
 * - Handles different input types (email, password, text, etc.)
 * 
 * DESIGN FEATURES:
 * - Clean border with rounded corners
 * - Focus ring in indigo color for brand consistency
 * - Consistent padding and height
 * - Gray border with focus state enhancement
 * - Proper spacing between label and input
 * - Responsive design for different screen sizes
 * 
 * USAGE:
 * Used throughout the application for all form inputs.
 * Supports text inputs, email fields, password fields, and more.
 */

import React from "react";

/**
 * Props interface for Input component
 * Extends standard HTML input attributes with custom properties
 */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;  // Optional label text for the input
};

/**
 * Input Component
 * 
 * A reusable input component with consistent styling and optional label support.
 * Provides proper accessibility features and focus states for better user experience.
 * 
 * @param props - InputProps object containing input configuration
 * @returns JSX element representing a styled input with optional label
 */
export default function Input({ label, id, className = "", ...props }: InputProps) {
  // Generate unique ID for accessibility if label is provided
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  
  return (
    <div className="space-y-1">
      {/* Optional label with proper accessibility */}
      {label ? (
        <label htmlFor={inputId} className="text-xs text-gray-600">
          {label}
        </label>
      ) : null}
      
      {/* Input field with consistent styling */}
      <input
        id={inputId}
        className={`h-10 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 ${className}`}
        {...props}
      />
    </div>
  );
}



