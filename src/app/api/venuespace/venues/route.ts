import { NextRequest } from "next/server";
import { requireSupabaseUser } from "@/lib/supabase/server";
import { jsonError, venueCreateSchema } from "@/lib/venuespace-production";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const parsed = venueCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid venue request");
    }

    const { supabase, profile } = await requireSupabaseUser();
    if (profile.role !== "host") {
      return jsonError("Only hosts can create venues", 403);
    }

    const payload = parsed.data;
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .insert({
        host_id: profile.id,
        name: payload.name,
        description: payload.description,
        category: payload.category,
        vibe: payload.vibe ?? null,
        capacity: payload.capacity,
        hourly_rate: payload.hourlyRate,
        images: payload.images,
        address: payload.address,
        operating_hours: payload.operatingHours,
        active_status: "draft",
      })
      .select("*")
      .single();

    if (venueError || !venue) {
      return jsonError(venueError?.message ?? "Unable to create venue", 500);
    }

    const { error: useCaseError } = await supabase.from("venue_use_cases").insert(
      payload.useCases.map((useCase) => ({
        venue_id: venue.id,
        use_case: useCase,
      }))
    );

    if (useCaseError) {
      await supabase.from("venues").delete().eq("id", venue.id);
      return jsonError(useCaseError.message, 500);
    }

    return Response.json({ venue }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create venue", 500);
  }
}
