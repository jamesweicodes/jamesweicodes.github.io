# VenueSpace Production Checklist

VenueSpace is now structured as a production marketplace foundation plus an investor-ready demo surface.

## Runtime

- Deploy the production app to Vercel or another Node-capable Next.js host.
- Keep GitHub Pages only for static portfolio preview builds.
- Required environment variables live in `.env.example`.

## Supabase

- Apply `supabase/migrations/20260703232000_venuespace_v1.sql`.
- Confirm RLS is enabled for all marketplace tables.
- Enable realtime for `messages` and `bookings`.
- Create initial San Jose seed venues in staging before demos.

## Stripe

- Use Stripe test mode for investor demos.
- Complete host Express onboarding before venue activation.
- Confirm manual PaymentIntent capture on host approval.
- Add a webhook route before accepting real payments.

## Gemini

- Configure `GEMINI_API_KEY`.
- Keep local fallback enabled for demo resilience.
- Add rate limiting before public launch.

## Investor Demo Flow

1. Open `/venuespace/`.
2. Use AI Concierge to pick a use case, guest count, budget, and vibe.
3. Apply the top match.
4. Save two venues to the shortlist.
5. Use URL filters to show shareable discovery.
6. Select an availability slot and submit a request.
7. Approve or decline from the owner dashboard.
8. Send a booking message.

## Next Engineering Slices

- Wire the UI to live Supabase read APIs.
- Add Stripe Elements payment confirmation.
- Add authenticated renter/host dashboards.
- Add Supabase realtime subscriptions in the frontend.
- Split `src/app/venuespace/page.tsx` into focused components and hooks.
