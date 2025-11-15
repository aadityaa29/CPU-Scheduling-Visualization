import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Required for all shadcn/ui components
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Your existing exports
export const clone = <T,>(obj: T): T => structuredClone(obj);

export const getPidNumber = (pid: string) =>
  Number(pid.replace(/\D/g, "")) || 0;
