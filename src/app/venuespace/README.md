# VenueSpace

`/venuespace/` is a lean MVP prototype for an hourly event-space marketplace.

## Scope covered

- Intent-driven discovery by use case
- AI-style event concierge with ranked venue matches and explainable scoring
- Venue profile fields:
  - `hourly_rate`
  - `min_hours`
  - `allowed_use_cases`
  - `operating_hours`
- AI venue intelligence, guest policies, trust signals, and off-peak strategy notes
- Request-to-book widget with date, start time, end time, and use-case selection
- Operating-hours and minimum-duration validation
- Stripe-ready payment quote using subtotal plus platform fee
- Owner dashboard approve/decline controls
- Use-case-tagged reviews with review filters
- Yelp-style review insight summaries by use case
- Host onboarding/readiness scoring for supply growth
- Simple booking message thread

## Current architecture

VenueSpace now has two layers:

1. `/venuespace/` - interactive marketplace preview with typed seed data.
2. `/api/venuespace/*` - production runtime API routes for Supabase, Stripe Connect, Gemini, bookings, reviews, and messaging.

The production API layer requires a Node-capable Next.js host such as Vercel. The legacy static GitHub Pages export can still show the preview UI, but Supabase Auth, Stripe Connect, Gemini, and realtime messaging require server runtime environment variables.

## Supabase

Apply the migration:

```bash
supabase db push
```

Migration file:

- `supabase/migrations/20260703232000_venuespace_v1.sql`

Generated-style TypeScript contract:

- `src/lib/supabase/database.types.ts`

## API route map

- `POST /api/venuespace/venues` - host listing creation with use cases
- `POST /api/venuespace/stripe/connect/onboarding` - Stripe Express onboarding link
- `POST /api/venuespace/host/readiness` - server-side listing readiness score
- `POST /api/venuespace/concierge` - Gemini AI match scoring with local fallback
- `POST /api/venuespace/bookings/request` - manual-capture PaymentIntent authorization
- `POST /api/venuespace/bookings/[bookingId]/approve` - host capture + approve
- `POST /api/venuespace/bookings/[bookingId]/decline` - cancel authorization + decline
- `GET /api/venuespace/messages?bookingId=...` - booking message thread
- `POST /api/venuespace/messages` - send booking message
- `POST /api/venuespace/reviews` - renter review with inherited `use_case_tag`

## Required environment

Copy `.env.example` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Production notes

- Store money as integer cents in Supabase and Stripe.
- Keep Stripe capture/cancel server-side only.
- Use Supabase realtime subscriptions on `messages` and `bookings`.
- Keep venue status as `draft` until readiness score and Stripe onboarding pass.
