import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Escape user-supplied text before interpolating it into HTML (e.g. emails). */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Neutralize spreadsheet formula injection (=, +, -, @, tab, CR) in CSV cells. */
export function sanitizeCsvCell(value: unknown): string {
  const cell = value === null || value === undefined ? "" : String(value)
  return /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell
}
