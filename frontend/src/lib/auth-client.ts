import { emailOTPClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { AUTH_BASE_URL } from "./api";

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  plugins: [usernameClient(), emailOTPClient()],
});

