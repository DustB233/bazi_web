import { clerkMiddleware } from "@clerk/nextjs/server";

// Keep it simple: attach Clerk, but don't "protect" pages here.
// We do auth enforcement inside /api/analyze (so Generate page stays public).
export default clerkMiddleware();
