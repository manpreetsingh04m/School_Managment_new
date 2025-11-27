/**
 * NEXT.JS CONFIGURATION FILE (JavaScript)
 * 
 * This file configures Next.js build and runtime settings for the school
 * management system. It handles experimental features and build optimizations.
 * 
 * PURPOSE:
 * - Configures Next.js build settings and experimental features
 * - Handles file tracing for proper deployment
 * - Sets up workspace-relative paths for monorepo compatibility
 * - Enables experimental features needed for the application
 * 
 * CONFIGURATION DETAILS:
 * - outputFileTracingRoot: Ensures proper file tracing in monorepo setup
 * - Experimental features: Enables cutting-edge Next.js capabilities
 * - Path resolution: Handles workspace-relative file paths
 * 
 * USAGE:
 * This file is automatically loaded by Next.js during build and development.
 * Changes require restarting the development server to take effect.
 * 
 * NOTE:
 * This is the JavaScript version of Next.js config. There's also a TypeScript
 * version (next.config.ts) that may be used instead depending on setup.
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next traces files relative to the actual project workspace
  // This is important for monorepo setups where the project is in a subdirectory
  outputFileTracingRoot: path.join(__dirname, '..'),
};

export default nextConfig;
