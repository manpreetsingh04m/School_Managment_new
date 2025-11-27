/**
 * CARD COMPONENT
 * 
 * This is a reusable card component that provides consistent styling and layout
 * for content sections throughout the school management system. It supports
 * optional titles, actions, and flexible content.
 * 
 * PURPOSE:
 * - Provides consistent card styling across the application
 * - Creates structured layouts for content sections
 * - Supports optional headers with titles and actions
 * - Offers flexible content areas for various use cases
 * 
 * FUNCTIONALITY:
 * - Renders a white card with shadow and rounded corners
 * - Supports optional title in the header section
 * - Supports optional actions (buttons, links) in the header
 * - Provides flexible content area for any React components
 * - Includes proper spacing and visual hierarchy
 * 
 * DESIGN FEATURES:
 * - Clean white background with subtle shadow
 * - Rounded corners for modern appearance
 * - Optional header section with border separator
 * - Consistent padding and spacing
 * - Flexible layout that adapts to content
 * 
 * USAGE:
 * Used throughout the application for content sections, forms, and data displays.
 * Provides a consistent container for related information and actions.
 */

import React from "react";

/**
 * Props interface for Card component
 */
type CardProps = {
  children: React.ReactNode;  // Content to display in the card
  title?: string;             // Optional title for the card header
  className?: string;         // Additional CSS classes
  actions?: React.ReactNode; // Optional actions (buttons, links) for the header
};

/**
 * Card Component
 * 
 * Creates a consistent card layout with optional header section containing
 * title and actions, plus a flexible content area.
 * 
 * @param props - CardProps object containing card configuration
 * @returns JSX element representing a styled card container
 */
export default function Card({ children, title, className = "", actions }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {/* Optional header section with title and actions */}
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          {/* Card title */}
          {title && <h2 className="text-lg font-semibold text-gray-800">{title}</h2>}
          
          {/* Action buttons/links */}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      
      {/* Card content */}
      {children}
    </div>
  );
}
