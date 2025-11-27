/**
 * ESLINT CONFIGURATION FILE
 * 
 * This file configures ESLint for the school management system, providing
 * code quality rules, formatting standards, and TypeScript integration.
 * 
 * PURPOSE:
 * - Enforces code quality and consistency across the project
 * - Provides TypeScript-specific linting rules
 * - Integrates with Next.js best practices
 * - Ensures maintainable and readable code
 * 
 * CONFIGURATION DETAILS:
 * - Next.js core web vitals rules for performance
 * - TypeScript-specific linting rules
 * - File exclusions for build artifacts and dependencies
 * - Flat config format for modern ESLint compatibility
 * 
 * RULES INCLUDED:
 * - Next.js core web vitals: Performance and accessibility rules
 * - TypeScript rules: Type checking and best practices
 * - Code quality: Consistent formatting and style
 * - Performance: Optimizations for web applications
 * 
 * USAGE:
 * Run `npm run lint` to check code quality
 * Run `npm run lint -- --fix` to automatically fix issues
 * Integrated with IDE for real-time feedback
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Get current file directory for compatibility layer
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create compatibility layer for legacy ESLint configs
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// ESLint configuration array
const eslintConfig = [
  // Extend Next.js recommended rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Global configuration
  {
    ignores: [
      "node_modules/**",    // Ignore dependencies
      ".next/**",          // Ignore Next.js build output
      "out/**",            // Ignore static export output
      "build/**",          // Ignore build artifacts
      "next-env.d.ts",     // Ignore Next.js type definitions
    ],
  },
];

export default eslintConfig;
