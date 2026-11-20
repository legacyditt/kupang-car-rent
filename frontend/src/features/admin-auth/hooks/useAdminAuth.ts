import { useEffect, useState } from "react";
import {
  validateAdminLogin,
  validateAdminRegister,
  type AdminSession,
} from "../utils/admin-auth";
import {
  clearAdminSession,
  readAdminAccounts,
  readAdminSession,
  subscribeAdminSession,
  writeAdminAccounts,
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
    const result = validateAdminLogin(
      identifier,
      password,
      readAdminAccounts()
    );
    if (!result.ok) {
      return result;
    }
    setSession(result.session);
    writeAdminSession(result.session);
    return result;
  };

  const register = (
    identifier: string,
    password: string,
    confirmPassword: string
  ): { ok: true; session: AdminSession } | { ok: false; error: string } => {
    const result = validateAdminRegister(
      identifier,
      password,
      confirmPassword,
      readAdminAccounts()
    );
    if (!result.ok) {
      return result;
    }
    writeAdminAccounts(result.accounts);
    const nextSession: AdminSession = {
      email: result.account.email,
      username: result.account.username,
      loggedInAt: new Date().toISOString(),
    };
    setSession(nextSession);
    writeAdminSession(nextSession);
    return { ok: true, session: nextSession };
  };

  const logout = () => {
    setSession(null);
    clearAdminSession();
  };

  return {
    session,
    isAuthenticated: Boolean(session),
    login,
    register,
    logout,
  };
}

