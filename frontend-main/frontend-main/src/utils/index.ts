import { useEffect, useState } from "react"

export const validatePassword = (pwd: string) => {
  if (!pwd.trim()) return "Password is required"
  if (pwd.length < 8) return "Password must be at least 8 characters"
  if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter"
  if (!/[0-9]/.test(pwd)) return "Password must contain at least one number"
  if (!/[!@#$%^&*]/.test(pwd)) return "Password must contain at least one special character"
  return null
}

export const validateEmail = (email: string) =>{
    if (!email.trim()) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address"
    return null
}

export function formatDateTimeLocal(isoString: string): string {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function toSnakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1_$2")      // handle camelCase → snake_case
    .replace(/[\s\-]+/g, "_")                 // spaces & hyphens → underscores
    .replace(/[^a-zA-Z0-9_]/g, "")            // remove invalid characters
    .toLowerCase();
}


export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}


export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}


export function normalizeText(text: string): string {
  if (!text) return "";
  // Remove all whitespace (spaces, tabs, newlines) and convert to lowercase
  return text.replace(/\s+/g, "").toLowerCase();
}