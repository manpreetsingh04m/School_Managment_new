/**
 * ICON COMPONENT
 * 
 * This component provides a centralized icon system using emoji-based icons
 * for the school management system. It maps icon names to emoji characters
 * for consistent visual representation throughout the application.
 * 
 * PURPOSE:
 * - Provides consistent icon system across the application
 * - Maps semantic icon names to visual representations
 * - Supports accessibility with proper ARIA labels
 * - Offers flexible sizing and styling options
 * 
 * FUNCTIONALITY:
 * - Maps icon names to emoji characters
 * - Supports customizable size through className
 * - Includes proper accessibility attributes
 * - Provides fallback icon for unknown names
 * - Uses semantic icon names for better maintainability
 * 
 * ICON MAPPINGS:
 * - Navigation: home, menu, logout
 * - School entities: school, class, teacher, student
 * - Academic: book, exam, marks, attendance
 * - Administrative: calendar, settings, notification, bell
 * - Financial: money, fees, payment
 * - Actions: add, submit, upload
 * - Data: chart, performance, document
 * 
 * DESIGN FEATURES:
 * - Emoji-based icons for universal compatibility
 * - Consistent sizing through className prop
 * - Proper accessibility with role and aria-label
 * - Fallback handling for unknown icon names
 * 
 * USAGE:
 * Used throughout the application for navigation, buttons, and visual indicators.
 * Provides semantic icon names that map to appropriate emoji representations.
 */

import React from "react";

/**
 * Props interface for Icon component
 */
type IconProps = {
  name: string;      // Icon name to display
  className?: string; // CSS classes for sizing and styling
};

/**
 * Icon Component
 * 
 * Renders an emoji-based icon based on the provided name.
 * Maps semantic icon names to emoji characters for consistent visual representation.
 * 
 * @param props - IconProps object containing icon configuration
 * @returns JSX element representing an emoji icon
 */
export function Icon({ name, className = "w-5 h-5" }: IconProps) {
  // Icon mapping from semantic names to emoji characters
  const iconMap: Record<string, string> = {
    // Navigation and general
    calendar: "📅",
    upload: "⬆️",
    home: "🏠",
    user: "👤",
    book: "📚",
    chart: "📊",
    clock: "🕐",
    money: "💰",
    bell: "🔔",
    settings: "⚙️",
    logout: "🚪",
    school: "🏫",
    menu: "☰",
    notification: "🔔",
    
    // Academic
    marks: "📝",
    attendance: "✅",
    performance: "📈",
    exam: "📋",
    
    // Financial
    fees: "💳",
    payment: "💸",
    
    // Documents and actions
    document: "📄",
    submit: "📤",
    
    // School entities
    class: "👥",
    teacher: "👩‍🏫",
    student: "👨‍🎓",
    add: "➕",
  };

  return (
    <span className={className} role="img" aria-label={name}>
      {iconMap[name] || "📄"}
    </span>
  );
}
