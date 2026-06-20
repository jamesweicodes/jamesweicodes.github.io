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

export type Venue = {
  id: string;
  name: string;
  neighborhood: string;
  category: "Cafe" | "Restaurant Backroom" | "Studio" | "Gallery";
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
  };
  amenities: string[];
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
    },
    amenities: ["Espresso bar", "Projector", "Street parking", "Flexible seating"],
    description:
      "Warm cafe lounge with reliable Wi-Fi, after-hours availability, and a private rear seating area for small teams and creator events.",
  },
  {
    id: "sofa-market-studio",
    name: "SoFA Market Daylight Studio",
    neighborhood: "SoFA District, San Jose",
    category: "Studio",
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
    },
    amenities: ["Natural light", "Backdrop wall", "Loading zone", "Bluetooth audio"],
    description:
      "Compact production studio designed for photo shoots, founder content days, and small-format workshops near downtown transit.",
  },
  {
    id: "santana-row-backroom",
    name: "Santana Row Backroom",
    neighborhood: "West San Jose",
    category: "Restaurant Backroom",
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
    },
    amenities: ["Catering available", "Private bar", "AV screen", "Validated parking"],
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
