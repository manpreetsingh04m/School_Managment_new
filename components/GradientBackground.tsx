/**
 * GRADIENT BACKGROUND COMPONENT
 * 
 * This component provides a beautiful gradient background wrapper for pages,
 * creating a professional and visually appealing foundation for the school
 * management system interface.
 * 
 * PURPOSE:
 * - Provides consistent visual branding across the application
 * - Creates an attractive gradient background for pages
 * - Wraps page content with full-screen gradient
 * - Establishes the visual theme for the school management system
 * 
 * FUNCTIONALITY:
 * - Renders a full-screen gradient background
 * - Wraps children components within the gradient
 * - Uses CSS gradient from dark blue to lighter blue
 * - Ensures minimum height covers entire viewport
 * 
 * DESIGN FEATURES:
 * - Blue gradient theme (from blue-950 to blue-500)
 * - Full viewport coverage (min-h-screen)
 * - Professional color scheme suitable for educational institution
 * - Smooth gradient transition for visual appeal
 * 
 * USAGE:
 * Used as a wrapper component for pages that need the gradient background.
 * Typically wraps the main content of landing pages and authentication pages.
 */

import React from "react";

/**
 * Props interface for GradientBackground component
 */
type GradientBackgroundProps = {
  children: React.ReactNode; // Child components to render within the gradient
};

/**
 * GradientBackground Component
 * 
 * Provides a full-screen gradient background wrapper for page content.
 * Creates a professional blue gradient that covers the entire viewport.
 * 
 * @param props - GradientBackgroundProps object containing children
 * @returns JSX element with gradient background and wrapped children
 */
export default function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <div className="min-h-screen w-full bg-white">
      {children}
    </div>
  );
}



