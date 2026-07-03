import { NextRequest } from "next/server";
import { requireSupabaseUser } from "@/lib/supabase/server";
import { hostReadinessRequestSchema, jsonError } from "@/lib/venuespace-production";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const parsed = hostReadinessRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid readiness request");
    }

    const { supabase, profile } = await requireSupabaseUser();
    if (profile.role !== "host") {
      return jsonError("Only hosts can score venue readiness", 403);
    }

    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("*")
      .eq("id", parsed.data.venueId)
      .single();

    if (venueError || !venue) {
      return jsonError("Venue not found", 404);
    }

    if (venue.host_id !== profile.id) {
      return jsonError("You do not own this venue", 403);
    }

    const { data: useCases, error: useCaseError } = await supabase
      .from("venue_use_cases")
      .select("use_case")
      .eq("venue_id", venue.id);

    if (useCaseError) {
      return jsonError(useCaseError.message, 500);
    }

    const checks = [
      {
        label: "Venue name",
        passed: venue.name.trim().length > 2,
        points: 10,
      },
      {
        label: "Detailed description",
        passed: venue.description.trim().length >= 80,
        points: 15,
      },
      {
        label: "Guest capacity",
        passed: venue.capacity >= 8,
        points: 10,
      },
      {
        label: "Hourly rate",
        passed: venue.hourly_rate >= 5000,
        points: 10,
      },
      {
        label: "At least three photos",
        passed: venue.images.length >= 3,
        points: 20,
      },
      {
        label: "At least two use cases",
        passed: (useCases ?? []).length >= 2,
        points: 15,
      },
      {
        label: "Operating hours",
        passed: Object.keys((venue.operating_hours ?? {}) as Record<string, unknown>).length > 0,
        points: 10,
      },
      {
        label: "Stripe connected",
        passed: Boolean(profile.stripe_account_id),
        points: 10,
      },
    ];

    const score = checks.reduce((total, check) => total + (check.passed ? check.points : 0), 0);
    const missing = checks.filter((check) => !check.passed).map((check) => check.label);

    return Response.json({
      score,
      canGoLive: score >= 85,
      missing,
      checks,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to score readiness", 500);
  }
}
