import { NextRequest } from "next/server";
import { getRequiredEnv } from "@/lib/env";
import { requireSupabaseUser } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { jsonError } from "@/lib/venuespace-production";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { supabase, profile } = await requireSupabaseUser();
    if (profile.role !== "host") {
      return jsonError("Only hosts can start Stripe onboarding", 403);
    }

    const stripe = getStripe();
    let accountId = profile.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: profile.email,
        business_type: "company",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          venueSpaceUserId: profile.id,
        },
      });

      accountId = account.id;
      const { error } = await supabase
        .from("users")
        .update({ stripe_account_id: accountId })
        .eq("id", profile.id);

      if (error) {
        return jsonError(error.message, 500);
      }
    }

    const origin = request.headers.get("origin") ?? getRequiredEnv("NEXT_PUBLIC_APP_URL");
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/venuespace/?stripe=refresh`,
      return_url: `${origin}/venuespace/?stripe=complete`,
      type: "account_onboarding",
    });

    return Response.json({ accountId, url: accountLink.url });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to start onboarding", 500);
  }
}
