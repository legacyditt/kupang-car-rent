import type { IncomingMessage, ServerResponse } from "node:http";

type RequestHandler = (req: IncomingMessage, res: ServerResponse) => unknown;

let cachedApp: RequestHandler | null = null;

/**
 * Root Vercel Serverless Function entry point (`/api/*`).
 * Uses dynamic ESM import so Vercel's root CommonJS/TS wrapper can load `backend/` (`"type": "module"`) cleanly.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (!cachedApp) {
    const { bootstrapApp } = await import("../backend/src/bootstrap.js");
    cachedApp = bootstrapApp().app as unknown as RequestHandler;
  }
  return cachedApp(req, res);
}
