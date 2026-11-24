export interface SendOtpPayload {
  to: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | string;
}

export interface OtpSender {
  send(payload: SendOtpPayload): Promise<void>;
}

/** Dev/test OTP sender that prints the 6-digit OTP to the server console. */
export class ConsoleOtpSender implements OtpSender {
  async send({ to, otp, type }: SendOtpPayload): Promise<void> {
    console.info(`[OTP:console] type=${type} to=${to} otp=${otp}`);
  }
}

/** Production OTP sender using Fonnte WhatsApp Gateway API (text-only free tier compatible). */
export class FonnteOtpSender implements OtpSender {
  constructor(private readonly token: string) {}

  async send({ to, otp }: SendOtpPayload): Promise<void> {
    const message = [
      `*Aventra Rental — Kode OTP Reset Password*`,
      `Kode verifikasi Anda: *${otp}*`,
      `Berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.`,
    ].join("\n");

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: this.token,
      },
      body: new URLSearchParams({
        target: to,
        message,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`Fonnte API error: HTTP ${res.status}`);
    }
  }
}

export function createOtpSender(options: {
  provider: "console" | "fonnte";
  fonnteToken?: string;
}): OtpSender {
  if (options.provider === "fonnte" && options.fonnteToken) {
    return new FonnteOtpSender(options.fonnteToken);
  }
  return new ConsoleOtpSender();
}

