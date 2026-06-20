# VenueSpace

`/venuespace/` is a lean MVP prototype for an hourly event-space marketplace.

## Scope covered

- Intent-driven discovery by use case
- Venue profile fields:
  - `hourly_rate`
  - `min_hours`
  - `allowed_use_cases`
  - `operating_hours`
- Request-to-book widget with date, start time, end time, and use-case selection
- Operating-hours and minimum-duration validation
- Stripe-ready payment quote using subtotal plus platform fee
- Owner dashboard approve/decline controls
- Use-case-tagged reviews with review filters
- Simple booking message thread

## Current architecture

This repository is still a static Next.js export, so VenueSpace uses typed in-memory seed data in `src/lib/venuespace.ts`.

Before production launch, connect:

1. Supabase/Postgres tables and generated database types.
2. Auth and row-level security for renters and venue owners.
3. Stripe Connect PaymentIntent creation/capture/release on a server runtime.
4. Persistent messaging and booking status updates.
