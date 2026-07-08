import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { globalLimiter } from "./middlewares/rateLimit";
import { routes } from "./routes";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

export const app = express();

app.use(helmet());
app.use(globalLimiter);
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK", data: { service: "rentnest-api" } });
});

app.use("/api", routes);

app.use(notFound);
app.use(globalErrorHandler);

