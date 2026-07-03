import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";

export const useCaseSchema = z.enum([
  "Workshop",
  "Photo Shoot",
  "Birthday Party",
  "Team Offsite",
  "Pop-Up Dinner",
  "Content Studio",
]);

export const vibeSchema = z.enum([
  "Any",
  "Creative",
  "Professional",
  "Cozy",
  "Premium",
  "Nightlife",
  "Food-First",
]);

export const bookingRequestSchema = z.object({
  venueId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  guestCount: z.number().int().positive(),
  useCase: useCaseSchema,
});

export const conciergeRequestSchema = z.object({
  useCase: useCaseSchema,
  guestCount: z.number().int().positive(),
  budgetPerHour: z.number().int().positive(),
  vibe: vibeSchema,
  notes: z.string().max(1000).optional(),
});

export const hostReadinessRequestSchema = z.object({
  venueId: z.string().uuid(),
});

export const messageRequestSchema = z.object({
  bookingId: z.string().uuid(),
  content: z.string().trim().min(1).max(2000),
});

export const reviewRequestSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(4000),
});

export const venueCreateSchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(40).max(4000),
  category: z.string().trim().min(2).max(80),
  vibe: vibeSchema.exclude(["Any"]).optional(),
  capacity: z.number().int().positive(),
  hourlyRate: z.number().int().positive(),
  images: z.array(z.string().url()).default([]),
  address: z.string().trim().min(5).max(500),
  operatingHours: z.record(
    z.string(),
    z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean().optional(),
    })
  ),
  useCases: z.array(useCaseSchema).min(1),
});

export type BookingRequestPayload = z.infer<typeof bookingRequestSchema>;
export type ConciergeRequestPayload = z.infer<typeof conciergeRequestSchema>;

export type VenueRow = Database["public"]["Tables"]["venues"]["Row"];
export type UserRow = Database["public"]["Tables"]["users"]["Row"];

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function getHoursBetween(startTime: string, endTime: string) {
  return (new Date(endTime).getTime() - new Date(startTime).getTime()) / 3_600_000;
}

export function calculateBookingPrice(hourlyRate: number, hours: number, platformFeeRate = 0.1) {
  const subtotal = Math.round(hourlyRate * hours);
  const platformFee = Math.round(subtotal * platformFeeRate);

  return {
    subtotal,
    platformFee,
    total: subtotal + platformFee,
  };
}

export function formatVenueForAi(venue: VenueRow, useCases: string[], reviewSignal: string) {
  return {
    id: venue.id,
    name: venue.name,
    description: venue.description,
    category: venue.category,
    vibe: venue.vibe,
    capacity: venue.capacity,
    hourly_rate: venue.hourly_rate,
    address: venue.address,
    allowed_use_cases: useCases,
    review_signal: reviewSignal,
  };
}
