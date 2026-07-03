import { NextRequest } from "next/server";
import { requireSupabaseUser } from "@/lib/supabase/server";
import { jsonError, reviewRequestSchema } from "@/lib/venuespace-production";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const parsed = reviewRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid review request");
    }

    const { supabase, profile } = await requireSupabaseUser();
    if (profile.role !== "renter") {
      return jsonError("Only renters can submit reviews", 403);
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", parsed.data.bookingId)
      .single();

    if (bookingError || !booking) {
      return jsonError("Booking not found", 404);
    }

    if (booking.renter_id !== profile.id) {
      return jsonError("You can only review your own bookings", 403);
    }

    if (booking.status !== "captured" && booking.status !== "approved") {
      return jsonError("Booking must be approved or captured before review", 409);
    }

    if (new Date(booking.end_time).getTime() > Date.now()) {
      return jsonError("Reviews open after the booking end time", 409);
    }

    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        booking_id: booking.id,
        venue_id: booking.venue_id,
        renter_id: profile.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        use_case_tag: booking.use_case,
      })
      .select("*")
      .single();

    if (reviewError) {
      return jsonError(reviewError.message, 500);
    }

    return Response.json({ review });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to submit review", 500);
  }
}
