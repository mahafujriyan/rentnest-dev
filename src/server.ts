import { app } from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`RentNest API listening on port ${env.PORT}`);
});

const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`Received ${signal}. Shutting down...`);
  server.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

