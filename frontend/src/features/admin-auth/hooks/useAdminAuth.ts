import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";

export function useAdminAuth() {
  const { data: sessionData, isPending } = authClient.useSession();

  const login = async (
    identifier: string,
    password: string
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return { ok: false, error: "Email atau username wajib diisi." };
    }
    if (!password) {
      return { ok: false, error: "Password wajib diisi." };
    }

    const res = trimmed.includes("@")
      ? await authClient.signIn.email({ email: trimmed, password })
      : await authClient.signIn.username({ username: trimmed, password });

    if (res.error) {
      return {
        ok: false,
        error: res.error.message || "Email/username atau password salah.",
      };
    }

    return { ok: true };
  };

  const requestOtpReset = async (
    email: string
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    const res = await authClient.emailOtp.requestPasswordReset({
      email: email.trim(),
    });
    if (res.error) {
      return {
        ok: false,
        error: res.error.message || "Gagal mengirim kode OTP.",
      };
    }
    return { ok: true };
  };

  const resetPasswordWithOtp = async (params: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const res = await authClient.emailOtp.resetPassword({
      email: params.email.trim(),
      otp: params.otp.trim(),
      password: params.newPassword,
    });
    if (res.error) {
      return {
        ok: false,
        error: res.error.message || "Kode OTP tidak valid atau sudah kedaluwarsa.",
      };
    }
    return { ok: true };
  };

  const logout = async () => {
    await authClient.signOut();
    queryClient.clear();
  };

  return {
    session: sessionData?.session ?? null,
    user: sessionData?.user ?? null,
    isPending,
    isAuthenticated: Boolean(sessionData?.user),
    login,
    requestOtpReset,
    resetPasswordWithOtp,
    logout,
  };
}
