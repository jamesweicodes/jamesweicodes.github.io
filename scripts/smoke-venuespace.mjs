import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const checks = [
  {
    file: "out/venuespace/index.html",
    optional: true,
    terms: [
      "VenueSpace MVP",
      "AI Concierge",
      "Request-to-book V1",
      "San Jose spaces ready for off-peak use",
      "Match spaces by event intent",
      "Request to book",
      "AI venue intelligence",
      "Use-case reviews",
      "Host Supply Engine",
      "Owner Dashboard",
      "Approve",
      "Decline",
      "Booking messages",
      "Test discovery",
      "Supabase RLS",
      "Stripe Connect",
      "Gemini Concierge",
    ],
  },
  {
    file: "out/index.html",
    optional: true,
    terms: ["/venuespace/", "VenueSpace", "Hourly event-space marketplace MVP"],
  },
  {
    file: "src/lib/venuespace.ts",
    terms: [
      "hourly_rate",
      "min_hours",
      "allowed_use_cases",
      "operating_hours",
      "start_time",
      "end_time",
      "use_case",
      "status",
      "stripe_payment_intent_id",
      "use_case_tag",
      "host_response",
      "validateBookingRequest",
      "calculateQuote",
      "rankVenuesByIntent",
      "calculateMarketplaceHealth",
      "calculateHostReadiness",
      "summarizeReviewInsights",
    ],
  },
  {
    file: "supabase/migrations/20260703232000_venuespace_v1.sql",
    terms: [
      "create table public.users",
      "create table public.venues",
      "create table public.bookings",
      "create table public.reviews",
      "create table public.messages",
      "enable row level security",
      "supabase_realtime",
      "venue-images",
    ],
  },
  {
    file: "src/app/api/venuespace/bookings/request/route.ts",
    terms: [
      "capture_method: \"manual\"",
      "application_fee_amount",
      "transfer_data",
      "stripe_payment_intent_id",
    ],
  },
  {
    file: "src/app/api/venuespace/concierge/route.ts",
    terms: ["getGeminiModel", "match_score", "local-fallback"],
  },
  {
    file: "src/app/api/venuespace/stripe/connect/onboarding/route.ts",
    terms: ["accountLinks.create", "account_onboarding"],
  },
  {
    file: "src/app/venuespace/page.tsx",
    terms: [
      "href=\"#ai-concierge\"",
      "href=\"#discover\"",
      "href=\"#host-onboarding\"",
      "href=\"#owner-dashboard\"",
      "href=\"/#projects\"",
      "Apply top match",
      "Send request",
      "onClick={() => updateBookingStatus(booking.id, \"approved\")}",
      "onClick={() => updateBookingStatus(booking.id, \"declined\")}",
      "setReviewFilter",
      "setUseCaseFilter",
      "toggleHostUseCase",
      "submitMessage",
    ],
  },
];

const failures = [];

for (const check of checks) {
  if (check.optional && process.env.CHECK_STATIC_EXPORT !== "1") {
    continue;
  }

  const absolutePath = join(root, check.file);
  if (!existsSync(absolutePath)) {
    if (!check.optional) {
      failures.push(`${check.file} does not exist`);
    }
    continue;
  }

  const content = readFileSync(absolutePath, "utf8");
  for (const term of check.terms) {
    if (!content.includes(term)) {
      failures.push(`${check.file} is missing: ${term}`);
    }
  }
}

if (failures.length > 0) {
  console.error("VenueSpace smoke checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("VenueSpace smoke checks passed.");
