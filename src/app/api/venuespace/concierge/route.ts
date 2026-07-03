import { NextRequest } from "next/server";
import { getOptionalEnv } from "@/lib/env";
import { getGeminiModel } from "@/lib/gemini/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  conciergeRequestSchema,
  formatVenueForAi,
  jsonError,
  type ConciergeRequestPayload,
  type VenueRow,
} from "@/lib/venuespace-production";

export const runtime = "nodejs";

type VenueUseCaseRow = {
  venue_id: string;
  use_case: string;
};

type ReviewRow = {
  venue_id: string;
  rating: number;
  use_case_tag: string;
};

function localScoreVenue(venue: VenueRow, useCases: string[], input: ConciergeRequestPayload) {
  let score = 40;
  const reasons: string[] = [];

  if (useCases.includes(input.useCase)) {
    score += 24;
    reasons.push(`supports ${input.useCase}`);
  }

  if (venue.capacity >= input.guestCount) {
    score += 16;
    reasons.push(`fits ${input.guestCount} guests`);
  } else {
    score -= 25;
  }

  if (venue.hourly_rate <= input.budgetPerHour) {
    score += 14;
    reasons.push("within hourly budget");
  } else {
    score -= Math.min(20, Math.ceil((venue.hourly_rate - input.budgetPerHour) / 10));
  }

  if (input.vibe === "Any" || venue.vibe === input.vibe) {
    score += 8;
    reasons.push("vibe match");
  }

  return {
    venue_id: venue.id,
    venue_name: venue.name,
    match_score: Math.max(0, Math.min(100, score)),
    explanation: `${venue.name} is a strong fit because it ${reasons.join(", ")}.`,
  };
}

export async function POST(request: NextRequest) {
  const parsed = conciergeRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid concierge request");
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { data: venues, error: venuesError } = await supabase
    .from("venues")
    .select("*")
    .eq("active_status", "active");

  if (venuesError) {
    return jsonError(venuesError.message, 500);
  }

  const venueIds = (venues ?? []).map((venue) => venue.id);
  if (venueIds.length === 0) {
    return Response.json({ matches: [] });
  }

  const [{ data: useCases }, { data: reviewRows }] = await Promise.all([
    supabase.from("venue_use_cases").select("venue_id,use_case").in("venue_id", venueIds),
    supabase.from("reviews").select("venue_id,rating,use_case_tag").in("venue_id", venueIds),
  ]);

  const useCaseMap = ((useCases ?? []) as VenueUseCaseRow[]).reduce<Record<string, string[]>>(
    (map, row) => {
      map[row.venue_id] = [...(map[row.venue_id] ?? []), row.use_case];
      return map;
    },
    {}
  );
  const reviewMap = ((reviewRows ?? []) as ReviewRow[]).reduce<Record<string, ReviewRow[]>>(
    (map, row) => {
      map[row.venue_id] = [...(map[row.venue_id] ?? []), row];
      return map;
    },
    {}
  );

  const aiVenues = venues.map((venue) => {
    const venueReviews = reviewMap[venue.id] ?? [];
    const avg =
      venueReviews.length > 0
        ? venueReviews.reduce((total, review) => total + review.rating, 0) / venueReviews.length
        : null;

    return formatVenueForAi(
      venue,
      useCaseMap[venue.id] ?? [],
      avg ? `${venueReviews.length} reviews averaging ${avg.toFixed(1)}/5` : "No reviews yet"
    );
  });

  if (!getOptionalEnv("GEMINI_API_KEY")) {
    return Response.json({
      matches: venues
        .map((venue) => localScoreVenue(venue, useCaseMap[venue.id] ?? [], input))
        .sort((left, right) => right.match_score - left.match_score),
      source: "local-fallback",
    });
  }

  const model = getGeminiModel();
  const prompt = `You are VenueSpace AI Concierge, matching renters to event venues.

Return strict JSON:
{
  "matches": [
    {
      "venue_id": "uuid",
      "venue_name": "string",
      "match_score": 0-100,
      "explanation": "1-2 sentences specific to the event intent"
    }
  ]
}

Renter brief:
${JSON.stringify(input, null, 2)}

Available venues:
${JSON.stringify(aiVenues, null, 2)}

Hard constraints:
- Penalize venues below guest count capacity.
- Penalize venues above budget per hour.
- Penalize venues that do not support the use case.

Soft constraints:
- Reward vibe alignment and review signal for the use case.
- Keep explanations direct and renter-facing.`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  try {
    const parsedResponse = JSON.parse(raw) as unknown;
    return Response.json({ ...parsedResponse, source: "gemini" });
  } catch {
    return jsonError("Gemini returned invalid JSON", 502);
  }
}
