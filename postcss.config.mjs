/**
 * POSTCSS CONFIGURATION FILE
 * 
 * This file configures PostCSS for the school management system, handling
 * CSS processing and Tailwind CSS integration.
 * 
 * PURPOSE:
 * - Processes CSS files during build
 * - Integrates Tailwind CSS with PostCSS
 * - Handles CSS transformations and optimizations
 * - Enables Tailwind's utility-first CSS framework
 * 
 * CONFIGURATION DETAILS:
 * - Tailwind CSS PostCSS plugin for utility classes
 * - CSS processing pipeline for build optimization
 * - Integration with Next.js CSS handling
 * - Support for modern CSS features
 * 
 * PLUGINS INCLUDED:
 * - @tailwindcss/postcss: Processes Tailwind CSS directives
 * - Automatic CSS optimization and minification
 * - Vendor prefixing and browser compatibility
 * 
 * USAGE:
 * This file is automatically used by Next.js during CSS processing.
 * Tailwind directives (@tailwind, @apply) are processed here.
 * Changes require restarting the development server.
 */

const config = {
  plugins: [
    "@tailwindcss/postcss"  // Tailwind CSS PostCSS plugin for utility processing
  ],
};

export default config;
