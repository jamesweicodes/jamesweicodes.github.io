import { NextRequest } from "next/server";
import { requireSupabaseUser } from "@/lib/supabase/server";
import { calculatePlatformFee, getStripe } from "@/lib/stripe/server";
import {
  bookingRequestSchema,
  calculateBookingPrice,
  getHoursBetween,
  jsonError,
  type VenueRow,
} from "@/lib/venuespace-production";

export const runtime = "nodejs";

type DailyHours = {
  open: string;
  close: string;
  closed?: boolean;
};

type OperatingHours = Record<string, DailyHours>;

const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function getIsoTime(value: string) {
  return new Date(value).toISOString().slice(11, 16);
}

function validateOperatingHours(venue: VenueRow, startTime: string, endTime: string) {
  const hours = venue.operating_hours as OperatingHours;
  const start = new Date(startTime);
  const dayWindow = hours[dayKeys[start.getUTCDay()]];

  if (!dayWindow || dayWindow.closed) {
    return "Venue is closed for the selected day.";
  }

  const requestedStart = timeToMinutes(getIsoTime(startTime));
  const requestedEnd = timeToMinutes(getIsoTime(endTime));

  if (requestedEnd <= requestedStart) {
    return "End time must be after start time.";
  }

  if (requestedStart < timeToMinutes(dayWindow.open) || requestedEnd > timeToMinutes(dayWindow.close)) {
    return `Request must fit within ${dayWindow.open} - ${dayWindow.close}.`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const parsed = bookingRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid booking request");
    }

    const { supabase, profile } = await requireSupabaseUser();
    if (profile.role !== "renter") {
      return jsonError("Only renters can request bookings", 403);
    }

    const { venueId, startTime, endTime, guestCount, useCase } = parsed.data;
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("*")
      .eq("id", venueId)
      .eq("active_status", "active")
      .single();

    if (venueError || !venue) {
      return jsonError("Venue not found or inactive", 404);
    }

    if (venue.capacity < guestCount) {
      return jsonError("Guest count exceeds venue capacity");
    }

    const { data: useCases, error: useCaseError } = await supabase
      .from("venue_use_cases")
      .select("use_case")
      .eq("venue_id", venue.id);

    if (useCaseError) {
      return jsonError(useCaseError.message, 500);
    }

    if (!(useCases ?? []).some((row) => row.use_case === useCase)) {
      return jsonError("Venue does not support that use case");
    }

    const operatingHoursError = validateOperatingHours(venue, startTime, endTime);
    if (operatingHoursError) {
      return jsonError(operatingHoursError);
    }

    const hours = getHoursBetween(startTime, endTime);
    const { data: host, error: hostError } = await supabase
      .from("users")
      .select("stripe_account_id")
      .eq("id", venue.host_id)
      .single();

    if (hostError || !host?.stripe_account_id) {
      return jsonError("Host has not completed Stripe Connect onboarding", 409);
    }

    const price = calculateBookingPrice(venue.hourly_rate, hours);
    const stripe = getStripe();
    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.name,
        metadata: { venueSpaceUserId: profile.id },
      });
      stripeCustomerId = customer.id;
      await supabase.from("users").update({ stripe_customer_id: stripeCustomerId }).eq("id", profile.id);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.total,
      currency: "usd",
      customer: stripeCustomerId,
      capture_method: "manual",
      automatic_payment_methods: { enabled: true },
      application_fee_amount: calculatePlatformFee(price.subtotal),
      transfer_data: {
        destination: host.stripe_account_id,
      },
      metadata: {
        venueId: venue.id,
        renterId: profile.id,
        useCase,
      },
    });

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        venue_id: venue.id,
        renter_id: profile.id,
        start_time: startTime,
        end_time: endTime,
        guest_count: guestCount,
        use_case: useCase,
        total_price: price.total,
        platform_fee: price.platformFee,
        stripe_payment_intent_id: paymentIntent.id,
        status: "pending",
      })
      .select("*")
      .single();

    if (bookingError) {
      await stripe.paymentIntents.cancel(paymentIntent.id);
      return jsonError(bookingError.message, 500);
    }

    return Response.json({
      booking,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create booking", 500);
  }
}
