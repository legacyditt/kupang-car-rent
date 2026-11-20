import { useEffect, useState } from "react";
import { validateAdminLogin, type AdminSession } from "../utils/admin-auth";
import {
  clearAdminSession,
  readAdminSession,
  subscribeAdminSession,
  writeAdminSession,
} from "../utils/admin-auth-storage";

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession | null>(readAdminSession);

  useEffect(() => {
    return subscribeAdminSession(() => {
      setSession(readAdminSession());
    });
  }, []);

  const login = (
    identifier: string,
    password: string
  ): { ok: true; session: AdminSession } | { ok: false; error: string } => {
    const result = validateAdminLogin(identifier, password);
    if (!result.ok) {
      return result;
    }
    setSession(result.session);
    writeAdminSession(result.session);
    return result;
  };

  const logout = () => {
    setSession(null);
    clearAdminSession();
  };

  return {
    session,
    isAuthenticated: Boolean(session),
    login,
    logout,
  };
}

