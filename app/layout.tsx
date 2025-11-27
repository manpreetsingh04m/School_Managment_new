/**
 * ROOT LAYOUT COMPONENT
 * 
 * This is the main layout component that wraps the entire application.
 * It sets up the HTML structure, fonts, and global styles for all pages.
 * 
 * PURPOSE:
 * - Defines the root HTML structure for the entire school management system
 * - Configures Google Fonts (Geist Sans and Geist Mono) for consistent typography
 * - Sets up responsive viewport meta tag for mobile compatibility
 * - Provides the base layout that all pages inherit from
 * 
 * FUNCTIONALITY:
 * - Imports and configures Geist fonts from Google Fonts
 * - Sets up CSS custom properties for font variables
 * - Defines metadata for SEO and browser display
 * - Renders children components (all pages) within the HTML structure
 * - Ensures full height layout with proper CSS classes
 * 
 * USAGE:
 * This component is automatically used by Next.js as the root layout.
 * All pages in the app directory will be rendered as children of this layout.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configure Geist Sans font with CSS custom property
// This font is used for body text and general UI elements
const geistSans = Geist({
  variable: "--font-geist-sans", // CSS custom property name
  subsets: ["latin"], // Character subset to load
});

// Configure Geist Mono font with CSS custom property
// This font is used for code blocks and monospace text
const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // CSS custom property name
  subsets: ["latin"], // Character subset to load
});

// Application metadata for SEO and browser display
export const metadata: Metadata = {
  title: "School Management System", // Browser tab title
  description: "A comprehensive school management system for administrators, teachers, and students", // Meta description
};

/**
 * RootLayout Component
 * 
 * The main layout wrapper that provides the HTML structure for all pages.
 * This component is required by Next.js and wraps all page components.
 * 
 * @param children - React components that represent the current page
 * @returns JSX element with HTML structure and font configuration
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Responsive viewport configuration for mobile devices */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        {/* Render the current page component */}
        {children}
      </body>
    </html>
  );
}
