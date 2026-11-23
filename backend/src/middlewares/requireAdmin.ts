import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import type { AuthInstance } from "../lib/auth.js";
import { AppError } from "../utils/AppError.js";

export interface AdminUserContext {
  id: string;
  email: string;
  name: string;
  username?: string | null;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUserContext;
    }
  }
}

/** Verifies Better Auth session cookie and ensures the user has ADMIN role. */
export function createRequireAdmin(auth: AuthInstance) {
  return async function requireAdmin(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      next(
        new AppError(
          401,
          "UNAUTHORIZED",
          "Sesi admin tidak valid atau sudah berakhir."
        )
      );
      return;
    }

    const role = (session.user as { role?: string }).role ?? "ADMIN";
    if (role !== "ADMIN") {
      next(
        new AppError(403, "FORBIDDEN", "Akun tidak memiliki akses admin.")
      );
      return;
    }

    req.adminUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      username: (session.user as { username?: string | null }).username ?? null,
      role,
    };
    next();
  };
}

