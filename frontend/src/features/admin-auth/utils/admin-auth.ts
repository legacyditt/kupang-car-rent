export interface AdminSession {
  email: string;
  username: string;
  loggedInAt: string;
}

export const DEFAULT_ADMIN_CREDENTIALS = {
  email: "admin@aventrarental.id",
  username: "admin",
  password: "aventra-admin-2026",
} as const;

/** Validasi kredensial admin terdaftar tanpa alur registrasi publik. */
export function validateAdminLogin(
  identifier: string,
  password: string
): { ok: true; session: AdminSession } | { ok: false; error: string } {
  const normalizedId = identifier.trim().toLowerCase();

  if (!normalizedId) {
    return { ok: false, error: "Email atau username wajib diisi." };
  }
  if (!password) {
    return { ok: false, error: "Password wajib diisi." };
  }

  const matchesAccount =
    normalizedId === DEFAULT_ADMIN_CREDENTIALS.email ||
    normalizedId === DEFAULT_ADMIN_CREDENTIALS.username;

  if (!matchesAccount || password !== DEFAULT_ADMIN_CREDENTIALS.password) {
    return { ok: false, error: "Email/username atau password salah." };
  }

  return {
    ok: true,
    session: {
      email: DEFAULT_ADMIN_CREDENTIALS.email,
      username: DEFAULT_ADMIN_CREDENTIALS.username,
      loggedInAt: new Date().toISOString(),
    },
  };
}

