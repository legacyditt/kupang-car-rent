export interface AdminSession {
  email: string;
  username: string;
  loggedInAt: string;
}

export interface AdminAccount {
  email: string;
  username: string;
  password: string;
}

export const DEFAULT_ADMIN_CREDENTIALS: AdminAccount = {
  email: "admin@aventrarental.id",
  username: "admin",
  password: "aventra-admin-2026",
};

/** Validasi login terhadap daftar akun admin terdaftar. */
export function validateAdminLogin(
  identifier: string,
  password: string,
  accounts: AdminAccount[] = [DEFAULT_ADMIN_CREDENTIALS]
): { ok: true; session: AdminSession } | { ok: false; error: string } {
  const normalizedId = identifier.trim().toLowerCase();

  if (!normalizedId) {
    return { ok: false, error: "Email atau username wajib diisi." };
  }
  if (!password) {
    return { ok: false, error: "Password wajib diisi." };
  }

  const matched = accounts.find(
    (acc) =>
      (acc.email.toLowerCase() === normalizedId ||
        acc.username.toLowerCase() === normalizedId) &&
      acc.password === password
  );

  if (!matched) {
    return { ok: false, error: "Email/username atau password salah." };
  }

  return {
    ok: true,
    session: {
      email: matched.email,
      username: matched.username,
      loggedInAt: new Date().toISOString(),
    },
  };
}

/** Daftarkan akun/password admin baru atau perbarui password untuk akun yang sudah ada. */
export function validateAdminRegister(
  identifier: string,
  password: string,
  confirmPassword: string,
  accounts: AdminAccount[] = [DEFAULT_ADMIN_CREDENTIALS]
):
  | { ok: true; account: AdminAccount; accounts: AdminAccount[] }
  | { ok: false; error: string } {
  const normalizedId = identifier.trim().toLowerCase();

  if (!normalizedId || normalizedId.length < 3) {
    return { ok: false, error: "Email atau username minimal 3 karakter." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password minimal 6 karakter." };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: "Konfirmasi password tidak cocok." };
  }

  const isEmail = normalizedId.includes("@");
  const newAccount: AdminAccount = {
    email: normalizedId,
    username: isEmail ? normalizedId.split("@")[0] : normalizedId,
    password,
  };

  const existingIdx = accounts.findIndex(
    (acc) =>
      acc.email.toLowerCase() === normalizedId ||
      acc.username.toLowerCase() === normalizedId
  );

  const nextAccounts =
    existingIdx >= 0
      ? accounts.map((acc, idx) => (idx === existingIdx ? newAccount : acc))
      : [...accounts, newAccount];

  return {
    ok: true,
    account: newAccount,
    accounts: nextAccounts,
  };
}
