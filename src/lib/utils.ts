import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
  // Handle both HH:mm:ss and HH:mm formats
  const timeArray = time.split(':');
  const hours = timeArray[0].padStart(2, '0');
  const minutes = timeArray[1].padStart(2, '0');
  return `${hours}:${minutes}`;
}