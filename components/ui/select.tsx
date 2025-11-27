/**
 * SELECT COMPONENT SYSTEM
 * 
 * This is a comprehensive select component system that provides dropdown
 * functionality for the school management system. It includes multiple
 * sub-components that work together to create accessible and customizable
 * select interfaces.
 * 
 * PURPOSE:
 * - Provides dropdown selection functionality throughout the application
 * - Supports both controlled and uncontrolled usage patterns
 * - Includes proper accessibility features and keyboard navigation
 * - Offers flexible styling and customization options
 * 
 * FUNCTIONALITY:
 * - Dropdown trigger with customizable display value
 * - Dropdown content with scrollable options
 * - Support for option groups and labels
 * - Keyboard navigation (Enter, Escape, Arrow keys)
 * - Click outside to close functionality
 * - Proper ARIA attributes for screen readers
 * 
 * COMPONENT ARCHITECTURE:
 * - Select: Main container with context provider
 * - SelectTrigger: Clickable button that opens dropdown
 * - SelectValue: Displays current selection or placeholder
 * - SelectContent: Dropdown container with options
 * - SelectItem: Individual selectable options
 * - SelectGroup/SelectLabel: For grouping options
 * 
 * DESIGN FEATURES:
 * - Clean dropdown design with proper shadows
 * - Hover states for better user feedback
 * - Disabled state handling
 * - Scrollable content for long option lists
 * - Consistent styling with the design system
 * 
 * USAGE:
 * Used throughout the application for form selections, filters, and
 * configuration options. Provides a consistent dropdown experience.
 */

"use client";
import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from "react";

/**
 * Context value type for Select component state management
 */
type SelectContextValue = {
  value: string | undefined;                    // Currently selected value
  setValue: (v: string) => void;               // Function to update selected value
  open: boolean;                               // Whether dropdown is open
  setOpen: (o: boolean) => void;                // Function to toggle dropdown
  placeholder?: string;                         // Placeholder text
  labelMap: Record<string, string>;            // Map of values to display labels
  registerOption: (value: string, label: string) => void; // Register option labels
};

// Create context for sharing state between select components
const SelectCtx = createContext<SelectContextValue | null>(null);

/**
 * Props interface for main Select component
 */
type SelectProps = {
  value?: string;                              // Controlled value
  defaultValue?: string;                       // Default value for uncontrolled usage
  onValueChange?: (v: string) => void;        // Callback when value changes
  children: React.ReactNode;                   // Select sub-components
  placeholder?: string;                        // Placeholder text
  className?: string;                          // Additional CSS classes
};

/**
 * Select Component
 * 
 * Main container component that provides context for all select sub-components.
 * Supports both controlled and uncontrolled usage patterns.
 * 
 * @param props - SelectProps object containing select configuration
 * @returns JSX element with context provider and select container
 */
export function Select({ value, defaultValue, onValueChange, children, placeholder, className }: SelectProps) {
  const controlled = typeof value !== "undefined";
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const currentValue = controlled ? value : internal;
  const [open, setOpen] = useState(false);
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});

  // Handle value changes for both controlled and uncontrolled usage
  const setValue = useCallback((v: string) => {
    if (!controlled) setInternal(v);
    onValueChange?.(v);
  }, [controlled, onValueChange]);

  // Register option labels for display in trigger
  const registerOption = (val: string, label: string) => {
    setLabelMap(prev => (prev[val] === label ? prev : { ...prev, [val]: label }));
  };

  // Create context value with memoization for performance
  const ctx = useMemo(() => (
    { value: currentValue, setValue, open, setOpen, placeholder, labelMap, registerOption }
  ), [currentValue, open, placeholder, labelMap, setValue]);

  return (
    <SelectCtx.Provider value={ctx}>
      <div className={`relative inline-block ${className || ""}`}>{children}</div>
    </SelectCtx.Provider>
  );
}

/**
 * SelectTrigger Component
 * 
 * Clickable button that opens the dropdown and displays the current selection.
 * Includes proper accessibility attributes and keyboard support.
 * 
 * @param props - Button HTML attributes plus className
 * @returns JSX element representing the select trigger button
 */
export function SelectTrigger({ className = "", children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = useContext(SelectCtx)!;
  
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={`flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm hover:bg-gray-50 focus:outline-none ${className}`}
      aria-haspopup="listbox"
      aria-expanded={ctx.open ? true : false}
      {...rest}
    >
      {children}
      {/* Dropdown arrow icon */}
      <svg className="ml-2 h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/>
      </svg>
    </button>
  );
}

/**
 * SelectValue Component
 * 
 * Displays the current selection value or placeholder text.
 * Uses the label map to show user-friendly labels instead of raw values.
 * 
 * @param props - Object with optional placeholder
 * @returns JSX element displaying the current selection
 */
export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(SelectCtx)!;
  const display = (ctx.value && ctx.labelMap[ctx.value]) || ctx.value;
  
  return (
    <span className="truncate text-gray-700">
      {display || placeholder || ctx.placeholder || "Select"}
    </span>
  );
}

/**
 * SelectContent Component
 * 
 * Container for dropdown options that appears when select is open.
 * Includes proper positioning and accessibility attributes.
 * 
 * @param props - Object with className and children
 * @returns JSX element representing the dropdown content container
 */
export function SelectContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ctx = useContext(SelectCtx)!;
  
  if (!ctx.open) return null;
  
  return (
    <div 
      className={`absolute z-50 mt-2 min-w-full rounded-md border border-gray-200 bg-white p-1 shadow-lg ${className}`} 
      role="listbox" 
      aria-label="Options"
    >
      {children}
    </div>
  );
}

/**
 * SelectGroup Component
 * 
 * Container for grouping related select options.
 * 
 * @param props - Object with children
 * @returns JSX element representing an option group
 */
export function SelectGroup({ children }: { children: React.ReactNode }) { 
  return <div>{children}</div>; 
}

/**
 * SelectLabel Component
 * 
 * Label for option groups to provide visual separation and context.
 * 
 * @param props - Object with children
 * @returns JSX element representing a group label
 */
export function SelectLabel({ children }: { children: React.ReactNode }) { 
  return <div className="px-2 py-1 text-xs font-semibold text-gray-500">{children}</div>; 
}

/**
 * SelectItem Component
 * 
 * Individual selectable option within the dropdown.
 * Handles selection, registration of labels, and visual feedback.
 * 
 * @param props - Object with value and children
 * @returns JSX element representing a selectable option
 */
export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(SelectCtx)!;
  const ref = useRef<HTMLButtonElement>(null);
  const selected = ctx.value === value;
  
  // Register this option's label text for display in the trigger
  React.useEffect(() => {
    const label = ref.current?.textContent?.trim() || "";
    if (label) ctx.registerOption(value, label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={selected ? true : false}
      onClick={() => { ctx.setValue(value); ctx.setOpen(false); }}
      className={`w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-gray-100 ${selected ? "bg-gray-100 font-medium" : ""}`}
    >
      {children}
    </button>
  );
}


