import { bootstrapApp } from "../backend/src/bootstrap.js";

/**
 * Root Vercel Serverless Function entry point (`/api/*`).
 * Vercel requires serverless functions inside the root `api/` directory.
 */
const { app } = bootstrapApp();

export default app;
