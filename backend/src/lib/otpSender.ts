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
  constructor(
    private readonly token: string,
    private readonly maxRetries = 1,
    private readonly retryDelayMs = 500
  ) {}

  async send({ to, otp }: SendOtpPayload): Promise<void> {
    const message = [
      `*Aventra Rental — Kode OTP Reset Password*`,
      `Kode verifikasi Anda: *${otp}*`,
      `Berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.`,
    ].join("\n");

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            Authorization: this.token,
          },
          body: new URLSearchParams({
            target: to,
            message,
          }),
          // Keep per-attempt timeout short so total retry time stays well within serverless limits.
          signal: AbortSignal.timeout(4000),
        });

        if (res.ok) return;

        lastError = new Error(`Fonnte API error: HTTP ${res.status}`);
        // Do not retry 4xx errors (invalid token/payload); only retry transient 5xx responses.
        if (res.status < 500) {
          throw lastError;
        }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("Fonnte API error: HTTP 4")) {
          throw err;
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }

      if (attempt < this.maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelayMs * (attempt + 1))
        );
      }
    }

    throw lastError ?? new Error("Fonnte API error: unknown failure");
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

