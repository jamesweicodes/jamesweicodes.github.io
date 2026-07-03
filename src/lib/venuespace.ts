export const venueUseCases = [
  "Workshop",
  "Photo Shoot",
  "Birthday Party",
  "Team Offsite",
  "Pop-Up Dinner",
  "Content Studio",
] as const;

export type VenueUseCase = (typeof venueUseCases)[number];

export type BookingStatus =
  | "pending_approval"
  | "approved"
  | "declined"
  | "completed"
  | "cancelled";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type DailyOperatingHours = {
  open: string;
  close: string;
  closed?: boolean;
};

export type OperatingHours = Record<DayKey, DailyOperatingHours>;

export type VenueVibe =
  | "Creative"
  | "Professional"
  | "Cozy"
  | "Premium"
  | "Nightlife"
  | "Food-First";

export type Venue = {
  id: string;
  name: string;
  neighborhood: string;
  category: "Cafe" | "Restaurant Backroom" | "Studio" | "Gallery";
  vibe: VenueVibe;
  capacity: number;
  hourly_rate: number;
  min_hours: number;
  allowed_use_cases: VenueUseCase[];
  operating_hours: OperatingHours;
  rating: number;
  reviewCount: number;
  imageTone: string;
  host: {
    name: string;
    responseTime: string;
    stripeConnected: boolean;
    verified: boolean;
  };
  amenities: string[];
  policies: string[];
  aiHighlights: string[];
  bestFor: string;
  offPeakNote: string;
  description: string;
};

export type Booking = {
  id: string;
  venueId: string;
  renterName: string;
  start_time: string;
  end_time: string;
  use_case: VenueUseCase;
  status: BookingStatus;
  stripe_payment_intent_id: string | null;
  subtotal: number;
  platformFee: number;
  total: number;
};

export type Review = {
  id: string;
  venueId: string;
  author: string;
  rating: number;
  use_case_tag: VenueUseCase;
  body: string;
  host_response: string | null;
};

export type ThreadMessage = {
  id: string;
  bookingId: string;
  sender: "renter" | "owner";
  body: string;
  sentAt: string;
};

export type BookingRequestInput = {
  date: string;
  startTime: string;
  endTime: string;
  useCase: VenueUseCase;
  renterName: string;
};

export type IntentSearchInput = {
  useCase: VenueUseCase;
  guests: number;
  budget: number;
  vibe: VenueVibe | "Any";
};

export type VenueMatch = {
  venue: Venue;
  score: number;
  reasons: string[];
  caution: string | null;
};

export type HostOnboardingInput = {
  businessName: string;
  category: Venue["category"];
  neighborhood: string;
  capacity: number;
  hourlyRate: number;
  useCases: VenueUseCase[];
};

export type ReviewInsight = {
  averageRating: number;
  count: number;
  topTags: VenueUseCase[];
  summary: string;
};

export type BookingValidationResult =
  | { valid: true; hours: number }
  | { valid: false; message: string };

export const dayLabels: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const weekdayToDayKey: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const sampleOperatingHours: OperatingHours = {
  mon: { open: "08:00", close: "20:00" },
  tue: { open: "08:00", close: "20:00" },
  wed: { open: "08:00", close: "20:00" },
  thu: { open: "08:00", close: "21:00" },
  fri: { open: "08:00", close: "22:00" },
  sat: { open: "09:00", close: "22:00" },
  sun: { open: "10:00", close: "18:00" },
};

export const venues: Venue[] = [
  {
    id: "willow-cafe",
    name: "Willow Glen Cafe Lounge",
    neighborhood: "Willow Glen, San Jose",
    category: "Cafe",
    vibe: "Cozy",
    capacity: 32,
    hourly_rate: 95,
    min_hours: 2,
    allowed_use_cases: ["Workshop", "Birthday Party", "Team Offsite", "Content Studio"],
    operating_hours: sampleOperatingHours,
    rating: 4.8,
    reviewCount: 42,
    imageTone: "from-amber-500/25 via-orange-500/10 to-sky-500/20",
    host: {
      name: "Maya Chen",
      responseTime: "Usually replies in 45 minutes",
      stripeConnected: true,
      verified: true,
    },
    amenities: ["Espresso bar", "Projector", "Street parking", "Flexible seating"],
    policies: ["Outside dessert allowed", "No amplified music after 9 PM", "Setup time included"],
    aiHighlights: [
      "Strong value for workshops under 30 guests",
      "Review language points to helpful staff and flexible table layouts",
      "Best off-peak slot is weekday late afternoon",
    ],
    bestFor: "Small team workshops, founder meetups, and casual celebrations that need warmth over polish.",
    offPeakNote: "Weekday evenings are underutilized and priced below studio alternatives.",
    description:
      "Warm cafe lounge with reliable Wi-Fi, after-hours availability, and a private rear seating area for small teams and creator events.",
  },
  {
    id: "sofa-market-studio",
    name: "SoFA Market Daylight Studio",
    neighborhood: "SoFA District, San Jose",
    category: "Studio",
    vibe: "Creative",
    capacity: 18,
    hourly_rate: 140,
    min_hours: 3,
    allowed_use_cases: ["Photo Shoot", "Content Studio", "Workshop"],
    operating_hours: {
      ...sampleOperatingHours,
      sun: { open: "10:00", close: "16:00" },
    },
    rating: 4.9,
    reviewCount: 31,
    imageTone: "from-cyan-500/25 via-fuchsia-500/10 to-emerald-500/20",
    host: {
      name: "Jordan Lee",
      responseTime: "Usually replies in 20 minutes",
      stripeConnected: true,
      verified: true,
    },
    amenities: ["Natural light", "Backdrop wall", "Loading zone", "Bluetooth audio"],
    policies: ["Certificate of insurance optional", "No glitter or confetti", "Load-in window available"],
    aiHighlights: [
      "Highest match for production use cases",
      "Natural light and loading zone reduce shoot friction",
      "Smaller capacity keeps the experience premium and controlled",
    ],
    bestFor: "Photo shoots, short-form content days, and premium creator sessions with a small crew.",
    offPeakNote: "Sunday mornings create strong availability for creator content blocks.",
    description:
      "Compact production studio designed for photo shoots, founder content days, and small-format workshops near downtown transit.",
  },
  {
    id: "santana-row-backroom",
    name: "Santana Row Backroom",
    neighborhood: "West San Jose",
    category: "Restaurant Backroom",
    vibe: "Food-First",
    capacity: 48,
    hourly_rate: 185,
    min_hours: 2,
    allowed_use_cases: ["Birthday Party", "Pop-Up Dinner", "Team Offsite"],
    operating_hours: {
      mon: { open: "12:00", close: "22:00" },
      tue: { open: "12:00", close: "22:00" },
      wed: { open: "12:00", close: "22:00" },
      thu: { open: "12:00", close: "23:00" },
      fri: { open: "12:00", close: "23:30" },
      sat: { open: "11:00", close: "23:30" },
      sun: { open: "11:00", close: "21:00" },
    },
    rating: 4.7,
    reviewCount: 58,
    imageTone: "from-rose-500/25 via-red-500/10 to-yellow-500/20",
    host: {
      name: "Elena Ramirez",
      responseTime: "Usually replies in 1 hour",
      stripeConnected: true,
      verified: true,
    },
    amenities: ["Catering available", "Private bar", "AV screen", "Validated parking"],
    policies: ["Food minimum may apply", "No outside alcohol", "Late-night security fee after 10 PM"],
    aiHighlights: [
      "Best fit when food and beverage are part of the event",
      "Large capacity and parking improve guest logistics",
      "Team offsite reviews mention AV strength",
    ],
    bestFor: "Team dinners, birthday parties, and pop-up dinners where hospitality matters as much as space.",
    offPeakNote: "Early weekday dinner blocks monetize space before the prime dinner rush.",
    description:
      "Private restaurant backroom for off-peak gatherings, team dinners, and milestone celebrations with optional food and beverage packages.",
  },
];

export const initialBookings: Booking[] = [
  {
    id: "booking-1001",
    venueId: "willow-cafe",
    renterName: "Alex Morgan",
    start_time: "2026-06-24T17:00:00.000Z",
    end_time: "2026-06-24T20:00:00.000Z",
    use_case: "Workshop",
    status: "pending_approval",
    stripe_payment_intent_id: "pi_mock_willow_1001",
    subtotal: 285,
    platformFee: 28.5,
    total: 313.5,
  },
  {
    id: "booking-1002",
    venueId: "sofa-market-studio",
    renterName: "Priya Shah",
    start_time: "2026-06-25T16:00:00.000Z",
    end_time: "2026-06-25T19:00:00.000Z",
    use_case: "Photo Shoot",
    status: "approved",
    stripe_payment_intent_id: "pi_mock_sofa_1002",
    subtotal: 420,
    platformFee: 42,
    total: 462,
  },
];

export const reviews: Review[] = [
  {
    id: "review-1",
    venueId: "willow-cafe",
    author: "Tina V.",
    rating: 5,
    use_case_tag: "Workshop",
    body: "The cafe layout made our design sprint feel polished without feeling corporate. Great projector setup.",
    host_response: "Loved hosting your team. We added a second whiteboard after your feedback.",
  },
  {
    id: "review-2",
    venueId: "willow-cafe",
    author: "Marco G.",
    rating: 5,
    use_case_tag: "Birthday Party",
    body: "Perfect for a low-key birthday. Staff helped us rearrange tables and the espresso bar was a hit.",
    host_response: null,
  },
  {
    id: "review-3",
    venueId: "sofa-market-studio",
    author: "Kayla R.",
    rating: 5,
    use_case_tag: "Photo Shoot",
    body: "Clean light, easy loading, and enough room for a small crew. We booked another shoot immediately.",
    host_response: "Thank you for leaving the studio spotless.",
  },
  {
    id: "review-4",
    venueId: "santana-row-backroom",
    author: "Ben L.",
    rating: 4,
    use_case_tag: "Team Offsite",
    body: "Strong food package and AV. Best fit for teams that want dinner and planning in one place.",
    host_response: null,
  },
];

export const initialMessages: ThreadMessage[] = [
  {
    id: "message-1",
    bookingId: "booking-1001",
    sender: "renter",
    body: "Can we arrive 20 minutes early to set up a registration table?",
    sentAt: "2026-06-20T10:00:00.000Z",
  },
  {
    id: "message-2",
    bookingId: "booking-1001",
    sender: "owner",
    body: "Yes, early setup is fine. I can reserve the corner table near the entrance.",
    sentAt: "2026-06-20T10:18:00.000Z",
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatTimeLabel(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getDayKey(dateValue: string): DayKey {
  const date = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();
  return weekdayToDayKey[date.getDay()];
}

export function getOperatingWindow(venue: Venue, dateValue: string) {
  const dayKey = getDayKey(dateValue);
  return venue.operating_hours[dayKey];
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function calculateHours(startTime: string, endTime: string) {
  return (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60;
}

export function calculateQuote(hourlyRate: number, hours: number) {
  const subtotal = Math.max(0, hourlyRate * hours);
  const platformFee = Number((subtotal * 0.1).toFixed(2));
  return {
    subtotal,
    platformFee,
    total: Number((subtotal + platformFee).toFixed(2)),
  };
}

export function validateBookingRequest(
  venue: Venue,
  input: BookingRequestInput
): BookingValidationResult {
  if (!input.date || !input.startTime || !input.endTime) {
    return { valid: false, message: "Choose a date, start time, and end time." };
  }

  if (!venue.allowed_use_cases.includes(input.useCase)) {
    return { valid: false, message: "This venue does not allow that use case." };
  }

  const window = getOperatingWindow(venue, input.date);
  if (window.closed) {
    return { valid: false, message: "This venue is closed on the selected day." };
  }

  const requestedStart = timeToMinutes(input.startTime);
  const requestedEnd = timeToMinutes(input.endTime);
  const open = timeToMinutes(window.open);
  const close = timeToMinutes(window.close);

  if (requestedEnd <= requestedStart) {
    return { valid: false, message: "End time must be after start time." };
  }

  if (requestedStart < open || requestedEnd > close) {
    return {
      valid: false,
      message: `Request must fit within ${formatTimeLabel(window.open)} - ${formatTimeLabel(window.close)}.`,
    };
  }

  const hours = calculateHours(input.startTime, input.endTime);
  if (hours < venue.min_hours) {
    return { valid: false, message: `Minimum booking is ${venue.min_hours} hours.` };
  }

  return { valid: true, hours };
}

export function createMockPaymentIntentId(venueId: string) {
  return `pi_mock_${venueId}_${Date.now().toString(36)}`;
}

export function scoreVenueForIntent(venue: Venue, input: IntentSearchInput): VenueMatch {
  const reasons: string[] = [];
  let score = 40;

  if (venue.allowed_use_cases.includes(input.useCase)) {
    score += 24;
    reasons.push(`Allows ${input.useCase.toLowerCase()} bookings`);
  } else {
    score -= 30;
  }

  if (venue.capacity >= input.guests) {
    score += 14;
    reasons.push(`Fits ${input.guests} guests within ${venue.capacity}-guest capacity`);
  } else {
    score -= 24;
  }

  if (venue.hourly_rate <= input.budget) {
    score += 12;
    reasons.push(`${formatCurrency(venue.hourly_rate)}/hr is inside the target budget`);
  } else {
    score -= Math.min(18, Math.ceil((venue.hourly_rate - input.budget) / 10));
  }

  if (input.vibe === "Any" || venue.vibe === input.vibe) {
    score += 8;
    reasons.push(input.vibe === "Any" ? `Vibe-flexible match` : `${venue.vibe} vibe match`);
  }

  if (venue.rating >= 4.8) {
    score += 6;
    reasons.push(`${venue.rating} average rating signals strong guest satisfaction`);
  }

  if (venue.host.verified && venue.host.stripeConnected) {
    score += 6;
    reasons.push("Verified host with Stripe Connect ready");
  }

  const caution =
    venue.capacity < input.guests
      ? `Capacity short by ${input.guests - venue.capacity} guests`
      : venue.hourly_rate > input.budget
        ? `${formatCurrency(venue.hourly_rate - input.budget)}/hr over target budget`
        : null;

  return {
    venue,
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons.slice(0, 4),
    caution,
  };
}

export function rankVenuesByIntent(sourceVenues: Venue[], input: IntentSearchInput) {
  return sourceVenues
    .map((venue) => scoreVenueForIntent(venue, input))
    .sort((left, right) => right.score - left.score);
}

export function summarizeReviewInsights(venueId: string, useCase: VenueUseCase | "All"): ReviewInsight {
  const venueReviews = reviews.filter(
    (review) => review.venueId === venueId && (useCase === "All" || review.use_case_tag === useCase)
  );

  if (venueReviews.length === 0) {
    return {
      averageRating: 0,
      count: 0,
      topTags: [],
      summary: "No review signal yet. Prioritize the first completed booking and post-event review.",
    };
  }

  const averageRating =
    Math.round((venueReviews.reduce((total, review) => total + review.rating, 0) / venueReviews.length) * 10) / 10;
  const tagCounts = venueReviews.reduce<Record<VenueUseCase, number>>((counts, review) => {
    counts[review.use_case_tag] = (counts[review.use_case_tag] ?? 0) + 1;
    return counts;
  }, {} as Record<VenueUseCase, number>);
  const topTags = Object.entries(tagCounts)
    .sort(([, left], [, right]) => right - left)
    .map(([tag]) => tag as VenueUseCase)
    .slice(0, 3);

  return {
    averageRating,
    count: venueReviews.length,
    topTags,
    summary: `${venueReviews.length} tagged review${venueReviews.length === 1 ? "" : "s"} point to ${topTags.join(", ")} fit with ${averageRating}/5 satisfaction.`,
  };
}

export function calculateMarketplaceHealth(sourceVenues: Venue[], sourceBookings: Booking[]) {
  const pendingRequests = sourceBookings.filter((booking) => booking.status === "pending_approval").length;
  const approvedRequests = sourceBookings.filter((booking) => booking.status === "approved").length;
  const averageHourlyRate =
    sourceVenues.reduce((total, venue) => total + venue.hourly_rate, 0) / Math.max(1, sourceVenues.length);
  const verifiedHosts = sourceVenues.filter((venue) => venue.host.verified && venue.host.stripeConnected).length;

  return {
    supply: sourceVenues.length,
    pendingRequests,
    approvedRequests,
    averageHourlyRate,
    verifiedHosts,
    useCaseCoverage: new Set(sourceVenues.flatMap((venue) => venue.allowed_use_cases)).size,
  };
}

export function calculateHostReadiness(input: HostOnboardingInput) {
  const checks = [
    input.businessName.trim().length > 2,
    input.neighborhood.trim().length > 2,
    input.capacity >= 8,
    input.hourlyRate >= 50,
    input.useCases.length >= 2,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
