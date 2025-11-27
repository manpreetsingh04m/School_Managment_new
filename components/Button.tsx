/**
 * BUTTON COMPONENT
 * 
 * This is a reusable button component that provides consistent styling and behavior
 * across the school management system. It supports different variants and
 * customizable properties for various use cases.
 * 
 * PURPOSE:
 * - Provides consistent button styling throughout the application
 * - Supports multiple visual variants (primary, ghost)
 * - Handles accessibility features and disabled states
 * - Offers flexible sizing and layout options
 * 
 * FUNCTIONALITY:
 * - Renders HTML button element with custom styling
 * - Supports primary and ghost variants
 * - Handles disabled state with appropriate visual feedback
 * - Supports full-width layout option
 * - Includes hover and focus states for better UX
 * - Accepts all standard HTML button attributes
 * 
 * DESIGN FEATURES:
 * - Primary variant: Indigo background with white text
 * - Ghost variant: Transparent background with white text
 * - Smooth color transitions on hover
 * - Disabled state with reduced opacity
 * - Consistent padding and border radius
 * - Focus states for keyboard navigation
 * 
 * USAGE:
 * Used throughout the application for all button interactions.
 * Supports form submissions, navigation, and action buttons.
 */

import React from "react";

/**
 * Props interface for Button component
 * Extends standard HTML button attributes with custom properties
 */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";  // Visual style variant
  fullWidth?: boolean;            // Whether button should take full width
};

/**
 * Button Component
 * 
 * A reusable button component with consistent styling and multiple variants.
 * Supports primary and ghost styles with full-width option and proper
 * accessibility features.
 * 
 * @param props - ButtonProps object containing button configuration
 * @returns JSX element representing a styled button
 */
export default function Button({ variant = "primary", fullWidth, className = "", ...props }: ButtonProps) {
  // Base styles applied to all button variants
  const base = "btn rounded-md text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
  
  // Variant-specific styles
  const variants = {
    primary: "btn-primary text-white",   // Color comes from portal skin via CSS
    ghost: "btn-ghost bg-transparent hover:bg-white/10 text-white",
  } as const;

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} h-10 px-4 ${className}`}
      {...props}
    />
  );
}



