import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Matches Arabic script (incl. Arabic Supplement & Extended-A ranges). */
const ARABIC_PATTERN = /[؀-ۿݐ-ݿࢠ-ࣿ]/;

/** Whether the text contains Arabic characters, used to flip text to RTL. */
export function isArabic(text: string | null | undefined): boolean {
    return text !== null && text !== undefined && ARABIC_PATTERN.test(text);
}
