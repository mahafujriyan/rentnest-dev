import type { IncomingMessage, ServerResponse } from "http";

// Load the Express app lazily so that any startup error (e.g. missing env
// vars) is caught and returned as a readable response instead of crashing
// the serverless function with an opaque FUNCTION_INVOCATION_FAILED.
let appPromise: Promise<any> | null = null;

async function loadApp() {
  if (!appPromise) {
    appPromise = import("../src/app").then((m) => m.app);
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await loadApp();
    return app(req, res);
  } catch (err) {
    // Reset so a later request can retry after env is fixed
    appPromise = null;
    const message = err instanceof Error ? err.message : String(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        message: "Server failed to start.",
        error: message
      })
    );
  }
}
