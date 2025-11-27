/**
 * MULTIPLE SELECTOR COMPONENT
 * 
 * This component provides a multi-select interface that allows users to select
 * multiple options from a list. It supports search functionality, custom option
 * creation, and displays selected items as removable tags.
 * 
 * PURPOSE:
 * - Provides multi-select functionality for forms and filters
 * - Supports search and filtering of available options
 * - Allows creation of custom options on-the-fly
 * - Displays selected items as removable tags
 * - Handles keyboard navigation and accessibility
 * 
 * FUNCTIONALITY:
 * - Search and filter available options
 * - Add/remove multiple selections
 * - Create custom options by typing and pressing Enter
 * - Remove selections using Backspace or click on tags
 * - Click outside to close dropdown
 * - Keyboard navigation support
 * 
 * DESIGN FEATURES:
 * - Tag-based display of selected items
 * - Search input with placeholder
 * - Dropdown with filtered results
 * - Hover states and visual feedback
 * - Responsive design for different screen sizes
 * - Clean, modern interface
 * 
 * USAGE:
 * Used in forms where multiple selections are needed, such as
 * selecting subjects for a class or teachers for assignments.
 */

"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Option type definition for multiple selector
 */
export type Option = { 
  label: string;    // Display text for the option
  value: string;    // Unique value for the option
  disable?: boolean; // Whether the option is disabled
};

/**
 * Props interface for MultipleSelector component
 */
type MultipleSelectorProps = {
  defaultOptions: Option[];              // Available options to choose from
  value?: Option[];                       // Currently selected options
  onChange?: (options: Option[]) => void; // Callback when selection changes
  placeholder?: string;                   // Placeholder text for input
  emptyIndicator?: React.ReactNode;       // Content to show when no results
  className?: string;                     // Additional CSS classes
};

/**
 * MultipleSelector Component
 * 
 * Provides a multi-select interface with search, filtering, and tag-based
 * display of selected items. Supports custom option creation and keyboard navigation.
 * 
 * @param props - MultipleSelectorProps object containing component configuration
 * @returns JSX element representing a multi-select interface
 */
export default function MultipleSelector({
  defaultOptions,
  value,
  onChange,
  placeholder = "Select...",
  emptyIndicator,
  className = "",
}: MultipleSelectorProps) {
  // Internal state management
  const [internal, setInternal] = useState<Option[]>(value || []);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use controlled value if provided, otherwise use internal state
  const selected = value ?? internal;

  // Create unique options list from default options
  const allOptions = useMemo(() => {
    // Remove duplicates by value
    const map = new Map<string, Option>();
    defaultOptions.forEach(o => { 
      if (!map.has(o.value)) map.set(o.value, o); 
    });
    return Array.from(map.values());
  }, [defaultOptions]);

  // Filter options based on search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOptions.filter(o => o.label.toLowerCase().includes(q));
  }, [allOptions, query]);

  // Check if an option is already selected
  const isAlreadySelected = (val: string) => selected.some(s => s.value === val);

  // Update selected options
  const setSelected = (next: Option[]) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  // Add an option to the selection
  const addOption = (opt: Option) => {
    if (opt.disable || isAlreadySelected(opt.value)) return;
    setSelected([...selected, opt]);
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  // Remove an option from the selection
  const removeOption = (val: string) => {
    setSelected(selected.filter(s => s.value !== val));
  };

  // Handle keyboard events
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const text = query.trim();
      if (!text) return;
      // Create custom option on the fly
      addOption({ label: text, value: text });
    } else if (e.key === "Backspace" && query === "" && selected.length) {
      // Remove last selected option when backspace is pressed on empty input
      removeOption(selected[selected.length - 1].value);
    }
  };

  // Handle click outside and escape key to close dropdown
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === "Escape") setOpen(false); 
    };
    
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative outline-none focus:outline-none focus-visible:outline-none ${className}`}>
      {/* Main input container with selected tags */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:outline-none focus-visible:outline-none">
        {/* Display selected options as removable tags */}
        {selected.map(opt => (
          <span 
            key={opt.value} 
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800 border border-gray-200"
          >
            {opt.label}
            <button 
              aria-label={`Remove ${opt.label}`} 
              onClick={() => removeOption(opt.value)} 
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </span>
        ))}
        
        {/* Search input */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={selected.length ? "" : placeholder}
          className="flex-1 min-w-[120px] outline-none focus:outline-none focus-visible:outline-none text-sm"
          aria-label="Search or add"
        />
      </div>

      {/* Dropdown with filtered options */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-md border border-gray-200 bg-white p-1 shadow-lg max-h-56 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-3 text-center text-sm text-gray-600">
              {emptyIndicator || "No results"}
            </div>
          ) : (
            filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disable || isAlreadySelected(opt.value)}
                onClick={() => addOption(opt)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                  isAlreadySelected(opt.value) ? "text-gray-400 cursor-not-allowed" : "text-gray-800"
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}


