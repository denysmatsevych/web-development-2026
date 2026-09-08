import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind-aware conflict resolution.
 *
 * `clsx` flattens conditionals / arrays / objects; `tailwind-merge` then drops
 * conflicting utilities so the last one wins (`cn('p-2', cond && 'p-4')`).
 * Copied verbatim from the institute design system
 * (`../../website/website_ao/src/lib/utils.ts`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
