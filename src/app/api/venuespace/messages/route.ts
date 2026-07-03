import { NextRequest } from "next/server";
import { requireSupabaseUser } from "@/lib/supabase/server";
import { jsonError, messageRequestSchema } from "@/lib/venuespace-production";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const bookingId = request.nextUrl.searchParams.get("bookingId");
    if (!bookingId) {
      return jsonError("bookingId is required");
    }

    const { supabase } = await requireSupabaseUser();
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });

    if (error) {
      return jsonError(error.message, 500);
    }

    return Response.json({ messages });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to load messages", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = messageRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid message request");
    }

    const { supabase, profile } = await requireSupabaseUser();
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        booking_id: parsed.data.bookingId,
        sender_id: profile.id,
        content: parsed.data.content,
      })
      .select("*")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return Response.json({ message });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to send message", 500);
  }
}
