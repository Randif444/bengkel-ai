import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes dynamically.
 * Combines clsx (for conditional classes) and tailwind-merge (to resolve conflicts).
 * Essential for creating reusable UI components with override capabilities.
 *
 * @param  {...any} inputs - Class names, arrays, or conditional objects supported by clsx.
 * @returns {string} - The merged and conflict-free Tailwind class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
