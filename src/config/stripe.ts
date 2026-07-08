import Stripe from "stripe";
import { env } from "./env";
import { AppError } from "../errors/AppError";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new AppError(500, "Stripe is not configured. Set STRIPE_SECRET_KEY in .env");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export function isStripeConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY);
}
