import type { AdminSession } from "../utils/admin-auth";

export const ADMIN_SESSION_STORAGE_KEY = "aventra-admin-session";
export const ADMIN_SESSION_UPDATED_EVENT = "aventra:admin-session-updated";

export function readAdminSession(): AdminSession | null {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    return parsed?.email ? (parsed as AdminSession) : null;
  } catch {
    return null;
  }
}

export function writeAdminSession(session: AdminSession): void {
  try {
    window.localStorage.setItem(
      ADMIN_SESSION_STORAGE_KEY,
      JSON.stringify(session)
    );
    window.dispatchEvent(new CustomEvent(ADMIN_SESSION_UPDATED_EVENT));
  } catch {
    // Ignore storage write failure in restricted contexts
  }
}

export function clearAdminSession(): void {
  try {
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(ADMIN_SESSION_UPDATED_EVENT));
  } catch {
    // Ignore storage removal failure in restricted contexts
  }
}

export function subscribeAdminSession(onChange: () => void): () => void {
  const handleCustom = () => onChange();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === ADMIN_SESSION_STORAGE_KEY) onChange();
  };

  window.addEventListener(ADMIN_SESSION_UPDATED_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(ADMIN_SESSION_UPDATED_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

