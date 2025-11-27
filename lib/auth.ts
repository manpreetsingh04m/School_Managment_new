/**
 * AUTHENTICATION UTILITIES
 * 
 * This module provides user authentication and session management functionality
 * for the school management system. It handles user login state, data persistence,
 * and user information management using browser localStorage.
 * 
 * PURPOSE:
 * - Manages user authentication state across the application
 * - Provides utilities for storing and retrieving user information
 * - Handles user login/logout functionality
 * - Maintains user session persistence across browser refreshes
 * - Provides type-safe user data structure
 * 
 * FUNCTIONALITY:
 * - User data type definition with role-based access
 * - localStorage-based session management
 * - User information CRUD operations
 * - Login state checking and validation
 * - Server-side rendering compatibility checks
 * 
 * USER ROLES:
 * - student: Access to student-specific features and data
 * - teacher: Access to teacher dashboard and class management
 * - admin: Full system access for administrative functions
 * 
 * SECURITY NOTES:
 * - Uses localStorage for client-side session storage
 * - Includes server-side rendering checks to prevent hydration issues
 * - Provides error handling for corrupted localStorage data
 * - Simple authentication suitable for demo/development purposes
 * 
 * USAGE:
 * Import these functions in components that need authentication:
 * - getUser() - Get current logged-in user
 * - setUser() - Set user after successful login
 * - clearUser() - Clear user data on logout
 * - isLoggedIn() - Check if user is authenticated
 */

/**
 * User type definition for the school management system
 * Defines the structure of user data with role-based access control
 */
export type User = {
  role: "student" | "teacher" | "admin";  // User role determining access level
  name: string;                           // User's full name
  email: string;                          // User's email address
  grade?: string;                         // Optional grade/class for students
  classId?: string;                       // Optional class ID for teachers
  subjectAssignments?: Array<{classId: string; subject: string}>; // Optional subject assignments for teachers
};

// Storage key for persisting user data in localStorage
const STORAGE_KEY = "sms_current_user";

/**
 * Retrieves the currently logged-in user from localStorage
 * 
 * This function safely retrieves user data from browser storage,
 * handling cases where localStorage is not available (SSR) or
 * contains corrupted data.
 * 
 * @returns User object if found and valid, null otherwise
 */
export function getUser(): User | null {
  // Check if we're in a browser environment (not server-side rendering)
  if (typeof window === "undefined") return null;
  
  // Retrieve user data from localStorage
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  
  try {
    // Parse JSON data and return as User type
    return JSON.parse(raw) as User;
  } catch {
    // Return null if JSON parsing fails (corrupted data)
    return null;
  }
}

/**
 * Stores user data in localStorage after successful authentication
 * 
 * This function persists user information to browser storage,
 * enabling session persistence across browser refreshes and tabs.
 * 
 * @param user - User object to store in localStorage
 */
export function setUser(user: User) {
  // Only execute in browser environment
  if (typeof window === "undefined") return;
  
  // Store user data as JSON string in localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/**
 * Removes user data from localStorage (logout functionality)
 * 
 * This function clears the stored user data, effectively logging
 * the user out of the system.
 */
export function clearUser() {
  // Only execute in browser environment
  if (typeof window === "undefined") return;
  
  // Remove user data from localStorage
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Updates specific fields of the current user's data
 * 
 * This function allows partial updates to user information
 * without replacing the entire user object.
 * 
 * @param partial - Partial user object with fields to update
 */
export function updateUser(partial: Partial<User>) {
  // Get existing user data
  const existing = getUser();
  if (!existing) return;
  
  // Merge existing data with partial updates
  setUser({ ...existing, ...partial });
}

/**
 * Checks if a user is currently logged in
 * 
 * This function provides a simple boolean check for authentication status,
 * useful for conditional rendering and route protection.
 * 
 * @returns true if user is logged in, false otherwise
 */
export function isLoggedIn(): boolean {
  return !!getUser();
}
