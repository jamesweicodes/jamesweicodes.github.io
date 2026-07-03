import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const checks = [
  {
    file: "out/venuespace/index.html",
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
    ],
  },
  {
    file: "out/index.html",
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
  const absolutePath = join(root, check.file);
  if (!existsSync(absolutePath)) {
    failures.push(`${check.file} does not exist`);
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
