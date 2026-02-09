import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names conditionally
 * Uses clsx for conditional logic and tailwind-merge for handling conflicts
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
