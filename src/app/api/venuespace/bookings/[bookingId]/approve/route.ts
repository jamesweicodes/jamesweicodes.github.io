import { requireSupabaseUser } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { jsonError } from "@/lib/venuespace-production";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await context.params;
    const { supabase, profile } = await requireSupabaseUser();

    if (profile.role !== "host") {
      return jsonError("Only hosts can approve bookings", 403);
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return jsonError("Booking not found", 404);
    }

    if (booking.status !== "pending") {
      return jsonError("Only pending bookings can be approved", 409);
    }

    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("host_id")
      .eq("id", booking.venue_id)
      .single();

    if (venueError || venue?.host_id !== profile.id) {
      return jsonError("You do not own this booking venue", 403);
    }

    if (!booking.stripe_payment_intent_id) {
      return jsonError("Booking is missing a Stripe PaymentIntent", 409);
    }

    const stripe = getStripe();
    await stripe.paymentIntents.capture(booking.stripe_payment_intent_id);

    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({ status: "approved" })
      .eq("id", booking.id)
      .select("*")
      .single();

    if (updateError) {
      return jsonError(updateError.message, 500);
    }

    return Response.json({ booking: updatedBooking });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to approve booking", 500);
  }
}
