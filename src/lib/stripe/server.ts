import Stripe from "stripe";
import { getRequiredEnv } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe() {
  if (!stripe) {
    stripe = new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
      typescript: true,
    });
  }

  return stripe;
}

export function getPlatformFeeRate() {
  const configuredRate = Number(process.env.VENUESPACE_PLATFORM_FEE_RATE ?? "0.1");
  return Number.isFinite(configuredRate) && configuredRate >= 0 ? configuredRate : 0.1;
}

export function calculatePlatformFee(amount: number) {
  return Math.round(amount * getPlatformFeeRate());
}
