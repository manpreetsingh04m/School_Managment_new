/**
 * PAGINATION COMPONENT
 * 
 * This component provides pagination controls for navigating through large datasets
 * in the school management system. It displays current page information and
 * provides previous/next navigation buttons.
 * 
 * PURPOSE:
 * - Provides navigation controls for paginated data
 * - Displays current page and total pages information
 * - Handles page navigation with proper bounds checking
 * - Improves user experience when browsing large datasets
 * 
 * FUNCTIONALITY:
 * - Calculates total pages based on total items and page size
 * - Provides previous and next navigation buttons
 * - Disables buttons when at first/last page
 * - Shows current page and total pages information
 * - Calls onChange callback when page changes
 * - Handles edge cases (empty data, single page)
 * 
 * DESIGN FEATURES:
 * - Clean button design with hover states
 * - Disabled state styling for unavailable actions
 * - Centered page information display
 * - Consistent spacing and typography
 * - Responsive design for different screen sizes
 * 
 * USAGE:
 * Used in admin pages and other areas where large datasets are displayed.
 * Typically placed below data tables or lists that require pagination.
 */

"use client";
import React from "react";

/**
 * Props interface for Pagination component
 */
type Props = {
  page: number;                    // Current page number (1-based)
  total: number;                   // Total number of items
  pageSize: number;                // Number of items per page
  onChange: (page: number) => void; // Callback when page changes
};

/**
 * Pagination Component
 * 
 * Provides pagination controls with previous/next buttons and page information.
 * Calculates total pages and handles navigation with proper bounds checking.
 * 
 * @param props - Props object containing pagination configuration
 * @returns JSX element representing pagination controls
 */
export default function Pagination({ page, total, pageSize, onChange }: Props) {
  // Calculate total number of pages
  const pages = Math.max(1, Math.ceil(total / pageSize));
  
  // Navigation functions with bounds checking
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(pages, page + 1));
  
  return (
    <div className="flex items-center justify-between mt-4">
      {/* Previous page button */}
      <button 
        onClick={prev} 
        disabled={page === 1} 
        className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
      >
        Prev
      </button>
      
      {/* Page information display */}
      <div className="text-sm text-gray-600">
        Page {page} of {pages}
      </div>
      
      {/* Next page button */}
      <button 
        onClick={next} 
        disabled={page === pages} 
        className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
