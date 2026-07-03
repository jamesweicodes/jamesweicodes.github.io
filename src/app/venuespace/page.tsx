"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BrainCircuit,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Filter,
  Gauge,
  Lightbulb,
  MapPin,
  MessageSquare,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateHostReadiness,
  calculateMarketplaceHealth,
  calculateQuote,
  createMockPaymentIntentId,
  dayLabels,
  formatCurrency,
  formatTimeLabel,
  getDayKey,
  getOperatingWindow,
  initialBookings,
  initialMessages,
  rankVenuesByIntent,
  reviews,
  summarizeReviewInsights,
  validateBookingRequest,
  venues,
  venueUseCases,
  type Booking,
  type BookingRequestInput,
  type BookingStatus,
  type HostOnboardingInput,
  type IntentSearchInput,
  type ThreadMessage,
  type Venue,
  type VenueUseCase,
  type VenueVibe,
} from "@/lib/venuespace";
import { cn } from "@/lib/utils";

const statusLabels: Record<BookingStatus, string> = {
  pending_approval: "Pending approval",
  approved: "Approved",
  declined: "Declined",
  completed: "Completed",
  cancelled: "Cancelled",
};

const today = "2026-06-24";

const starterRequest: BookingRequestInput = {
  date: today,
  startTime: "17:00",
  endTime: "20:00",
  useCase: "Workshop",
  renterName: "James Wei",
};

const vibeOptions: Array<VenueVibe | "Any"> = [
  "Any",
  "Creative",
  "Professional",
  "Cozy",
  "Premium",
  "Nightlife",
  "Food-First",
];

const starterIntent: IntentSearchInput = {
  useCase: "Workshop",
  guests: 24,
  budget: 150,
  vibe: "Any",
};

const starterHostOnboarding: HostOnboardingInput = {
  businessName: "Downtown Community Studio",
  category: "Gallery",
  neighborhood: "Downtown San Jose",
  capacity: 36,
  hourlyRate: 125,
  useCases: ["Workshop", "Photo Shoot"],
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

function IntelligenceSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-background/45 p-4" aria-label="Loading state preview">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="h-3 w-28 rounded-full skeleton-shimmer" />
        <div className="h-7 w-7 rounded-full skeleton-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-full rounded-full skeleton-shimmer" />
        <div className="h-2.5 w-10/12 rounded-full skeleton-shimmer" />
        <div className="h-2.5 w-7/12 rounded-full skeleton-shimmer" />
      </div>
    </div>
  );
}

function getBookingDateLabel(booking: Booking) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(booking.start_time));
}

function getBookingEndLabel(booking: Booking) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(booking.end_time));
}

function formatOperatingHours(venue: Venue) {
  return Object.entries(venue.operating_hours).map(([day, hours]) => ({
    day: dayLabels[day as keyof typeof dayLabels],
    label: hours.closed
      ? "Closed"
      : `${formatTimeLabel(hours.open)} - ${formatTimeLabel(hours.close)}`,
  }));
}

export default function VenueSpacePage() {
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0].id);
  const [useCaseFilter, setUseCaseFilter] = useState<VenueUseCase | "All">("All");
  const [maxRate, setMaxRate] = useState(200);
  const [reviewFilter, setReviewFilter] = useState<VenueUseCase | "All">("All");
  const [bookingRequest, setBookingRequest] = useState<BookingRequestInput>(starterRequest);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
  const [messageDraft, setMessageDraft] = useState("");
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [intentSearch, setIntentSearch] = useState<IntentSearchInput>(starterIntent);
  const [hostOnboarding, setHostOnboarding] = useState<HostOnboardingInput>(starterHostOnboarding);

  const filteredVenues = useMemo(
    () =>
      venues.filter((venue) => {
        const matchesUseCase =
          useCaseFilter === "All" || venue.allowed_use_cases.includes(useCaseFilter);
        const matchesRate = venue.hourly_rate <= maxRate;
        return matchesUseCase && matchesRate;
      }),
    [maxRate, useCaseFilter]
  );

  const selectedVenue =
    filteredVenues.find((venue) => venue.id === selectedVenueId) ??
    venues.find((venue) => venue.id === selectedVenueId) ??
    venues[0];
  const aiMatches = useMemo(() => rankVenuesByIntent(venues, intentSearch), [intentSearch]);
  const topMatch = aiMatches[0];

  const visibleReviews = reviews.filter(
    (review) =>
      review.venueId === selectedVenue.id &&
      (reviewFilter === "All" || review.use_case_tag === reviewFilter)
  );

  const activeBooking = bookings.find((booking) => booking.venueId === selectedVenue.id);
  const activeMessages = activeBooking
    ? messages.filter((message) => message.bookingId === activeBooking.id)
    : [];
  const validation = validateBookingRequest(selectedVenue, bookingRequest);
  const quote = validation.valid
    ? calculateQuote(selectedVenue.hourly_rate, validation.hours)
    : calculateQuote(selectedVenue.hourly_rate, selectedVenue.min_hours);
  const operatingWindow = getOperatingWindow(selectedVenue, bookingRequest.date);
  const selectedDay = dayLabels[getDayKey(bookingRequest.date)];
  const reviewInsight = summarizeReviewInsights(selectedVenue.id, reviewFilter);
  const marketplaceHealth = calculateMarketplaceHealth(venues, bookings);
  const hostReadiness = calculateHostReadiness(hostOnboarding);

  function updateBookingRequest<Key extends keyof BookingRequestInput>(
    key: Key,
    value: BookingRequestInput[Key]
  ) {
    setBookingRequest((current) => ({ ...current, [key]: value }));
    setBookingNotice(null);
  }

  function updateIntentSearch<Key extends keyof IntentSearchInput>(
    key: Key,
    value: IntentSearchInput[Key]
  ) {
    setIntentSearch((current) => ({ ...current, [key]: value }));
  }

  function updateHostOnboarding<Key extends keyof HostOnboardingInput>(
    key: Key,
    value: HostOnboardingInput[Key]
  ) {
    setHostOnboarding((current) => ({ ...current, [key]: value }));
  }

  function toggleHostUseCase(useCase: VenueUseCase) {
    setHostOnboarding((current) => ({
      ...current,
      useCases: current.useCases.includes(useCase)
        ? current.useCases.filter((item) => item !== useCase)
        : [...current.useCases, useCase],
    }));
  }

  function selectVenue(venueId: string) {
    const venue = venues.find((item) => item.id === venueId);
    if (!venue) return;

    setSelectedVenueId(venueId);
    setReviewFilter("All");
    setBookingRequest((current) => ({
      ...current,
      useCase: venue.allowed_use_cases[0],
      startTime: "17:00",
      endTime: "20:00",
    }));
    setBookingNotice(null);
  }

  function selectTopMatch() {
    if (!topMatch) return;
    selectVenue(topMatch.venue.id);
    setUseCaseFilter(intentSearch.useCase);
    setReviewFilter("All");
  }

  function submitBookingRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateBookingRequest(selectedVenue, bookingRequest);
    if (!result.valid) {
      setBookingNotice(result.message);
      return;
    }

    const nextQuote = calculateQuote(selectedVenue.hourly_rate, result.hours);
    const nextBooking: Booking = {
      id: `booking-${Date.now().toString(36)}`,
      venueId: selectedVenue.id,
      renterName: bookingRequest.renterName.trim() || "Guest renter",
      start_time: `${bookingRequest.date}T${bookingRequest.startTime}:00.000Z`,
      end_time: `${bookingRequest.date}T${bookingRequest.endTime}:00.000Z`,
      use_case: bookingRequest.useCase,
      status: "pending_approval",
      stripe_payment_intent_id: createMockPaymentIntentId(selectedVenue.id),
      ...nextQuote,
    };

    setBookings((current) => [nextBooking, ...current]);
    setMessages((current) => [
      {
        id: `message-${Date.now().toString(36)}`,
        bookingId: nextBooking.id,
        sender: "renter",
        body: `Request submitted for ${bookingRequest.useCase}. Payment authorization is ready for Stripe Connect capture on approval.`,
        sentAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setBookingNotice("Request sent. The host can approve to capture funds or decline to release the hold.");
  }

  function updateBookingStatus(bookingId: string, status: BookingStatus) {
    setBookings((current) =>
      current.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking))
    );
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeBooking || !messageDraft.trim()) return;

    setMessages((current) => [
      ...current,
      {
        id: `message-${Date.now().toString(36)}`,
        bookingId: activeBooking.id,
        sender: "renter",
        body: messageDraft.trim(),
        sentAt: new Date().toISOString(),
      },
    ]);
    setMessageDraft("");
  }

  return (
    <main className="venuespace-shell min-h-screen text-foreground">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.24),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="venuespace-orb left-[-8rem] top-20" aria-hidden="true" />
        <div className="venuespace-orb right-[-10rem] top-[-8rem] [animation-delay:1.8s]" aria-hidden="true" />
        <div className="container-main relative px-6 py-10 md:px-8 md:py-16">
          <Button asChild variant="ghost" size="sm" className="mb-10 w-fit">
            <Link href="/#projects">
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
          </Button>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid gap-10 lg:grid-cols-[1fr_440px] lg:items-center"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="accent" className="mb-5">
                VenueSpace V1 - Investor demo
              </Badge>
              <h1 className="max-w-4xl font-serif text-5xl leading-tight md:text-7xl">
                Hourly event spaces,
                <span className="block text-gradient-venue">matched by intent.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground-muted">
                Discover San Jose cafes, restaurant backrooms, and studios by what you are
                actually trying to host. Request to book first; instant booking comes later.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href="#ai-concierge">
                    Ask AI concierge
                    <Sparkles className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#discover">
                    Find a space
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <a href="#host-onboarding">List your space</a>
                </Button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
            <Card className="gradient-border premium-surface">
              <CardHeader>
                <CardTitle className="font-serif text-3xl">Request-to-book V1</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  ["Intent-first search", "Filter every venue and review by use case."],
                  ["Approval workflow", "Hosts approve or decline before funds are captured."],
                  ["Stripe-ready quote", "Calculates hourly subtotal plus platform fee."],
                ].map(([title, description]) => (
                  <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-background-muted/50 p-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <p className="font-display text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-foreground-muted">{description}</p>
                    </div>
                  </div>
                ))}
                <IntelligenceSkeleton />
              </CardContent>
            </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="ai-concierge" className="scroll-mt-20 border-b border-white/10 bg-background-elevated/45 py-20">
        <div className="container-main px-6 md:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end"
          >
            <motion.div variants={fadeUp}>
              <p className="section-label">AI Concierge</p>
              <h2 className="font-serif text-3xl md:text-5xl">
                Match spaces by event intent, not just filters.
              </h2>
              <p className="mt-4 text-foreground-muted">
                A deterministic AI-style matching layer scores every venue on use case, budget,
                guest count, vibe, trust, and review signal.
              </p>
            </motion.div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Supply", marketplaceHealth.supply.toString(), "active venues"],
                ["Use cases", marketplaceHealth.useCaseCoverage.toString(), "covered intents"],
                ["Verified", marketplaceHealth.verifiedHosts.toString(), "payment-ready hosts"],
              ].map(([label, value, detail]) => (
                <motion.div key={label} variants={fadeUp} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
                <Card className="premium-surface bg-background-muted/45">
                  <CardContent className="pt-6">
                    <p className="text-xs uppercase tracking-wider text-foreground-subtle">{label}</p>
                    <p className="mt-2 font-display text-3xl font-semibold text-foreground">{value}</p>
                    <p className="mt-1 text-xs text-accent">{detail}</p>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card className="gradient-border premium-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-accent" />
                  Event brief
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Use case</span>
                  <select
                    value={intentSearch.useCase}
                    onChange={(event) =>
                      updateIntentSearch("useCase", event.target.value as VenueUseCase)
                    }
                    className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                  >
                    {venueUseCases.map((useCase) => (
                      <option key={useCase}>{useCase}</option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Guests</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={intentSearch.guests}
                      onChange={(event) => updateIntentSearch("guests", Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Budget/hr</span>
                    <input
                      type="number"
                      min={50}
                      max={500}
                      step={5}
                      value={intentSearch.budget}
                      onChange={(event) => updateIntentSearch("budget", Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Preferred vibe</span>
                  <select
                    value={intentSearch.vibe}
                    onChange={(event) =>
                      updateIntentSearch("vibe", event.target.value as IntentSearchInput["vibe"])
                    }
                    className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                  >
                    {vibeOptions.map((vibe) => (
                      <option key={vibe}>{vibe}</option>
                    ))}
                  </select>
                </label>
                <Button type="button" onClick={selectTopMatch} className="w-full">
                  Apply top match
                  <Sparkles className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
              <Card className="premium-surface overflow-hidden">
                <CardHeader>
                  <Badge variant="accent" className="w-fit">
                    Best match
                  </Badge>
                  <CardTitle className="font-serif text-3xl">
                    {topMatch?.venue.name ?? "No match yet"}
                  </CardTitle>
                </CardHeader>
                {topMatch && (
                  <CardContent>
                    <div className="mb-6 flex items-center justify-between gap-5">
                      <div
                        className="match-score-ring"
                        style={{
                          background: `conic-gradient(rgba(14,165,233,0.95) ${topMatch.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                        }}
                        aria-label={`${topMatch.score} out of 100 AI match score`}
                      >
                        <span>
                          <strong className="font-display text-4xl text-foreground">{topMatch.score}</strong>
                          <em className="mt-1 text-[10px] not-italic uppercase tracking-wider text-foreground-subtle">
                            Match
                          </em>
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-accent">
                          {formatCurrency(topMatch.venue.hourly_rate)}/hr
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {topMatch.venue.vibe} - {topMatch.venue.capacity} guests
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {topMatch.reasons.map((reason) => (
                        <p key={reason} className="flex gap-2 text-sm leading-6 text-foreground-muted">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-accent" />
                          {reason}
                        </p>
                      ))}
                    </div>
                    {topMatch.caution && (
                      <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
                        {topMatch.caution}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>

              <Card className="premium-surface">
                <CardHeader>
                  <CardTitle>Ranked alternatives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiMatches.slice(0, 3).map((match) => (
                    <motion.button
                      key={match.venue.id}
                      type="button"
                      onClick={() => selectVenue(match.venue.id)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full rounded-2xl border border-white/10 bg-background-muted/45 p-4 text-left transition-colors hover:border-accent/50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{match.venue.name}</p>
                          <p className="mt-1 text-xs text-foreground-subtle">{match.venue.bestFor}</p>
                        </div>
                        <span className="rounded-full border border-accent/20 bg-accent-muted px-2.5 py-1 text-xs font-semibold text-accent">
                          {match.score}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="section-padding scroll-mt-20">
        <div className="container-main px-6 md:px-8">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-label">Discovery</p>
              <h2 className="font-serif text-3xl md:text-5xl">San Jose spaces ready for off-peak use.</h2>
            </div>
            <div className="premium-surface rounded-2xl border border-white/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4 text-accent" />
                Use-case filters
              </div>
              <div className="flex flex-wrap gap-2">
                {(["All", ...venueUseCases] as Array<VenueUseCase | "All">).map((useCase) => (
                  <button
                    key={useCase}
                    type="button"
                    aria-pressed={useCaseFilter === useCase}
                    onClick={() => setUseCaseFilter(useCase)}
                    className={cn(
                      "venue-filter-chip rounded-full border px-3 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-accent",
                      useCaseFilter === useCase
                        ? "border-accent bg-accent text-background shadow-[0_0_24px_rgba(14,165,233,0.22)]"
                        : "border-white/10 bg-background/70 text-foreground-muted hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent"
                    )}
                  >
                    {useCase}
                  </button>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="flex items-center justify-between text-xs text-foreground-subtle">
                  <span>Max hourly rate</span>
                  <span>{formatCurrency(maxRate)}</span>
                </span>
                <input
                  type="range"
                  min={75}
                  max={225}
                  step={5}
                  value={maxRate}
                  onChange={(event) => setMaxRate(Number(event.target.value))}
                  className="mt-2 w-full accent-sky-400"
                />
              </label>
            </div>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-4 lg:grid-cols-3"
          >
            {filteredVenues.map((venue) => (
              <motion.button
                key={venue.id}
                type="button"
                onClick={() => selectVenue(venue.id)}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "premium-surface group overflow-hidden rounded-3xl border text-left transition-all",
                  selectedVenue.id === venue.id
                    ? "border-accent bg-accent-muted shadow-[0_22px_80px_rgba(14,165,233,0.18)]"
                    : "border-white/10 bg-background-elevated/60 hover:border-accent/40"
                )}
              >
                <div className={cn("relative h-40 bg-gradient-to-br", venue.imageTone)}>
                  <div className="venue-image-sheen" aria-hidden="true" />
                  <div className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-background/55 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md">
                    {venue.vibe}
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">{venue.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-foreground-muted">
                        <MapPin className="h-3.5 w-3.5" />
                        {venue.neighborhood}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-background/80 px-2 py-1 text-xs text-foreground-muted">
                      {venue.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-accent">{formatCurrency(venue.hourly_rate)}/hr</span>
                    <span className="flex items-center gap-1 text-foreground-muted">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      {venue.rating} ({venue.reviewCount})
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {venue.allowed_use_cases.slice(0, 3).map((useCase) => (
                      <span
                        key={useCase}
                        className="rounded-full border border-white/10 bg-background-muted px-2.5 py-1 text-[11px] text-foreground-muted"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-background-elevated/35 py-20">
        <div className="container-main grid gap-6 px-6 md:px-8 lg:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            <Card className="premium-surface overflow-hidden rounded-3xl">
              <div className={cn("relative h-64 bg-gradient-to-br", selectedVenue.imageTone)}>
                <div className="venue-image-sheen" aria-hidden="true" />
                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
                  <div className="rounded-2xl border border-white/15 bg-background/50 px-4 py-3 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-wider text-foreground-subtle">Featured San Jose space</p>
                    <p className="mt-1 font-display text-lg font-semibold text-foreground">{selectedVenue.vibe} venue</p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-background/50 px-3 py-1 text-sm font-semibold text-accent backdrop-blur-md">
                    {selectedVenue.rating} ★
                  </div>
                </div>
              </div>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge variant="live" className="mb-3">
                      Request to book
                    </Badge>
                    <CardTitle className="font-serif text-4xl">{selectedVenue.name}</CardTitle>
                    <p className="mt-2 flex items-center gap-2 text-foreground-muted">
                      <MapPin className="h-4 w-4" />
                      {selectedVenue.neighborhood}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background-muted/60 p-4 text-right">
                    <p className="font-display text-3xl font-semibold text-foreground">
                      {formatCurrency(selectedVenue.hourly_rate)}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-foreground-subtle">
                      per hour / {selectedVenue.min_hours} hr min
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-foreground-muted">{selectedVenue.description}</p>
                <div className="premium-surface mt-6 rounded-2xl border border-accent/20 bg-accent-muted/45 p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-accent">
                    <Lightbulb className="h-4 w-4" />
                    AI venue intelligence
                  </div>
                  <p className="text-sm leading-6 text-foreground-muted">{selectedVenue.bestFor}</p>
                  <ul className="mt-4 space-y-2">
                    {selectedVenue.aiHighlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2 text-sm text-foreground-muted">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="premium-surface rounded-2xl border border-white/10 bg-background-muted/50 p-4">
                    <Users className="mb-3 h-5 w-5 text-accent" />
                    <p className="text-sm font-semibold">{selectedVenue.capacity} guests</p>
                    <p className="text-xs text-foreground-subtle">Comfortable max</p>
                  </div>
                  <div className="premium-surface rounded-2xl border border-white/10 bg-background-muted/50 p-4">
                    <Clock className="mb-3 h-5 w-5 text-accent" />
                    <p className="text-sm font-semibold">
                      {formatTimeLabel(operatingWindow.open)} - {formatTimeLabel(operatingWindow.close)}
                    </p>
                    <p className="text-xs text-foreground-subtle">{selectedDay} hours</p>
                  </div>
                  <div className="premium-surface rounded-2xl border border-white/10 bg-background-muted/50 p-4">
                    <CreditCard className="mb-3 h-5 w-5 text-accent" />
                    <p className="text-sm font-semibold">
                      {selectedVenue.host.stripeConnected ? "Stripe connected" : "Payment pending"}
                    </p>
                    <p className="text-xs text-foreground-subtle">Capture on approval</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="premium-surface rounded-2xl border border-white/10 bg-background-muted/45 p-4">
                    <p className="mb-3 font-display text-sm font-semibold">Guest policies</p>
                    <ul className="space-y-2">
                      {selectedVenue.policies.map((policy) => (
                        <li key={policy} className="flex gap-2 text-sm text-foreground-muted">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {policy}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="premium-surface rounded-2xl border border-white/10 bg-background-muted/45 p-4">
                    <p className="mb-3 font-display text-sm font-semibold">Off-peak strategy</p>
                    <p className="text-sm leading-6 text-foreground-muted">{selectedVenue.offPeakNote}</p>
                    <p className="mt-3 text-xs text-accent">
                      Host: {selectedVenue.host.name} - {selectedVenue.host.responseTime}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-3 font-display text-sm font-semibold">Allowed use cases</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedVenue.allowed_use_cases.map((useCase) => (
                      <span
                        key={useCase}
                        className="rounded-full border border-accent/20 bg-accent-muted px-3 py-1 text-xs font-medium text-accent"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-3 font-display text-sm font-semibold">Operating hours</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {formatOperatingHours(selectedVenue).map((item) => (
                      <div key={item.day} className="rounded-xl border border-border bg-background-muted/45 p-3">
                        <p className="text-xs uppercase tracking-wider text-foreground-subtle">{item.day}</p>
                        <p className="mt-1 text-sm text-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="premium-surface">
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Use-case reviews</CardTitle>
                    <p className="mt-2 text-sm text-foreground-muted">
                      Reviews inherit the use case from completed bookings.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["All", ...selectedVenue.allowed_use_cases] as Array<VenueUseCase | "All">).map((useCase) => (
                      <button
                        key={useCase}
                        type="button"
                        onClick={() => setReviewFilter(useCase)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                          reviewFilter === useCase
                            ? "border-accent bg-accent text-background"
                            : "border-border bg-background-muted text-foreground-muted hover:border-accent/50 hover:text-accent"
                        )}
                      >
                        {useCase}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="premium-surface grid gap-3 rounded-2xl border border-white/10 bg-background-muted/40 p-4 md:grid-cols-[160px_1fr]">
                  <div>
                    <p className="font-display text-4xl font-semibold text-foreground">
                      {reviewInsight.count > 0 ? reviewInsight.averageRating.toFixed(1) : "-"}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-foreground-subtle">
                      {reviewInsight.count} tagged reviews
                    </p>
                  </div>
                  <div>
                    <p className="text-sm leading-6 text-foreground-muted">{reviewInsight.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {reviewInsight.topTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-accent/20 bg-accent-muted px-2.5 py-1 text-xs text-accent"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {visibleReviews.length > 0 ? (
                  visibleReviews.map((review) => (
                    <article key={review.id} className="premium-surface rounded-2xl border border-white/10 bg-background-muted/40 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{review.author}</p>
                          <p className="mt-1 text-xs text-accent">{review.use_case_tag}</p>
                        </div>
                        <span className="flex items-center gap-1 text-sm text-foreground-muted">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          {review.rating}.0
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-foreground-muted">{review.body}</p>
                      {review.host_response && (
                        <div className="mt-3 rounded-xl border border-border bg-background/60 p-3 text-sm text-foreground-muted">
                          <span className="font-semibold text-foreground">Host response:</span>{" "}
                          {review.host_response}
                        </div>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="rounded-2xl border border-border bg-background-muted/40 p-4 text-sm text-foreground-muted">
                    No reviews yet for this use case.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="premium-surface sticky top-6 rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-accent" />
                  Request to book
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitBookingRequest} className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Renter name</span>
                    <input
                      value={bookingRequest.renterName}
                      onChange={(event) => updateBookingRequest("renterName", event.target.value)}
                      className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Date</span>
                    <input
                      type="date"
                      value={bookingRequest.date}
                      onChange={(event) => updateBookingRequest("date", event.target.value)}
                      className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Start</span>
                      <input
                        type="time"
                        value={bookingRequest.startTime}
                        onChange={(event) => updateBookingRequest("startTime", event.target.value)}
                        className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">End</span>
                      <input
                        type="time"
                        value={bookingRequest.endTime}
                        onChange={(event) => updateBookingRequest("endTime", event.target.value)}
                        className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Use case</span>
                    <select
                      value={bookingRequest.useCase}
                      onChange={(event) =>
                        updateBookingRequest("useCase", event.target.value as VenueUseCase)
                      }
                      className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                    >
                      {selectedVenue.allowed_use_cases.map((useCase) => (
                        <option key={useCase}>{useCase}</option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-2xl border border-border bg-background-muted/50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-muted">Subtotal</span>
                      <span>{formatCurrency(quote.subtotal)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-foreground-muted">Platform fee</span>
                      <span>{formatCurrency(quote.platformFee)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3 font-semibold">
                      <span>Total authorization</span>
                      <span className="text-accent">{formatCurrency(quote.total)}</span>
                    </div>
                  </div>

                  {bookingNotice && (
                    <p
                      className={cn(
                        "rounded-xl border px-3 py-2 text-sm",
                        validation.valid
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                      )}
                    >
                      {bookingNotice}
                    </p>
                  )}

                  <Button type="submit" className="w-full">
                    Send request
                    <Send className="h-4 w-4" />
                  </Button>
                  <p className="text-xs leading-5 text-foreground-subtle">
                    Stripe Connect is represented as a typed mock payment intent in this static MVP.
                    A production backend would create and capture the real PaymentIntent.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="host-onboarding" className="section-padding scroll-mt-20">
        <div className="container-main px-6 md:px-8">
          <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="section-label">Host Supply Engine</p>
              <h2 className="font-serif text-3xl md:text-5xl">
                Turn local businesses into bookable inventory.
              </h2>
              <p className="mt-4 text-foreground-muted">
                The host side needs fast qualification, readiness scoring, and clear next steps so
                every cafe, studio, and restaurant backroom can become trusted marketplace supply.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Avg rate", formatCurrency(marketplaceHealth.averageHourlyRate), "market baseline"],
                ["Pending", marketplaceHealth.pendingRequests.toString(), "approval queue"],
                ["Approved", marketplaceHealth.approvedRequests.toString(), "captured demand"],
              ].map(([label, value, detail]) => (
                <Card key={label} className="bg-background-muted/45">
                  <CardContent className="pt-6">
                    <p className="text-xs uppercase tracking-wider text-foreground-subtle">{label}</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-foreground">{value}</p>
                    <p className="mt-1 text-xs text-accent">{detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <Card className="premium-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-accent" />
                  Host intake
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Business name</span>
                  <input
                    value={hostOnboarding.businessName}
                    onChange={(event) => updateHostOnboarding("businessName", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Category</span>
                  <select
                    value={hostOnboarding.category}
                    onChange={(event) =>
                      updateHostOnboarding("category", event.target.value as HostOnboardingInput["category"])
                    }
                    className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                  >
                    {["Cafe", "Restaurant Backroom", "Studio", "Gallery"].map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Neighborhood</span>
                  <input
                    value={hostOnboarding.neighborhood}
                    onChange={(event) => updateHostOnboarding("neighborhood", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Capacity</span>
                    <input
                      type="number"
                      min={1}
                      value={hostOnboarding.capacity}
                      onChange={(event) => updateHostOnboarding("capacity", Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Hourly rate</span>
                    <input
                      type="number"
                      min={50}
                      step={5}
                      value={hostOnboarding.hourlyRate}
                      onChange={(event) => updateHostOnboarding("hourlyRate", Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </label>
                </div>
                <div className="md:col-span-2">
                  <p className="mb-3 text-sm font-medium text-foreground">Allowed use cases</p>
                  <div className="flex flex-wrap gap-2">
                    {venueUseCases.map((useCase) => (
                      <button
                        key={useCase}
                        type="button"
                        onClick={() => toggleHostUseCase(useCase)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                          hostOnboarding.useCases.includes(useCase)
                            ? "border-accent bg-accent text-background"
                            : "border-border bg-background-muted text-foreground-muted hover:border-accent/50 hover:text-accent"
                        )}
                      >
                        {useCase}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="gradient-border premium-surface">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-accent" />
                    Host readiness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <span className="font-display text-6xl font-semibold text-foreground">
                      {hostReadiness}
                    </span>
                    <span className="pb-2 text-sm text-foreground-subtle">/ 100</span>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-background-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${hostReadiness}%` }}
                    />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-foreground-muted">
                    Readiness combines business identity, neighborhood, capacity, price, and use-case
                    breadth before a listing goes live.
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-surface">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    AI supply recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-foreground-muted">
                    {hostOnboarding.businessName || "This host"} should launch at{" "}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(hostOnboarding.hourlyRate)}
                    </span>{" "}
                    with {hostOnboarding.useCases.join(", ") || "at least two use cases"} and a
                    weekday off-peak offer to seed first bookings.
                  </p>
                  <Button asChild variant="magnetic" className="mt-5 w-full">
                    <a href="#owner-dashboard">
                      Review owner workflow
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="owner-dashboard" className="section-padding scroll-mt-20">
        <div className="container-main px-6 md:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-label">Owner Dashboard</p>
              <h2 className="font-serif text-3xl md:text-5xl">Approve requests before money moves.</h2>
            </div>
            <Badge variant="accent" className="w-fit">
              {bookings.filter((booking) => booking.status === "pending_approval").length} pending
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="space-y-4"
            >
              {bookings.map((booking) => {
                const venue = venues.find((item) => item.id === booking.venueId) ?? venues[0];
                return (
                  <motion.div key={booking.id} variants={fadeUp} whileHover={{ y: -3 }}>
                  <Card className="premium-surface">
                    <CardContent className="flex flex-col gap-5 pt-6 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge>{statusLabels[booking.status]}</Badge>
                          <span className="text-xs text-foreground-subtle">{booking.use_case}</span>
                        </div>
                        <p className="font-display text-lg font-semibold">{venue.name}</p>
                        <p className="mt-1 text-sm text-foreground-muted">
                          {booking.renterName} - {getBookingDateLabel(booking)} to {getBookingEndLabel(booking)}
                        </p>
                        <p className="mt-2 text-sm text-accent">
                          {formatCurrency(booking.total)} authorization - {booking.stripe_payment_intent_id}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, "approved")}
                          disabled={booking.status !== "pending_approval"}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, "declined")}
                          disabled={booking.status !== "pending_approval"}
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            <Card className="premium-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-accent" />
                  Booking messages
                </CardTitle>
                <p className="text-sm text-foreground-muted">
                  Simple threaded view for renter and owner coordination after a request exists.
                </p>
              </CardHeader>
              <CardContent>
                {activeBooking ? (
                  <>
                    <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                      {activeMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "rounded-2xl border p-3 text-sm",
                            message.sender === "renter"
                              ? "ml-6 border-accent/20 bg-accent-muted text-foreground"
                              : "mr-6 border-border bg-background-muted text-foreground-muted"
                          )}
                        >
                          <p className="mb-1 text-xs uppercase tracking-wider text-foreground-subtle">
                            {message.sender}
                          </p>
                          {message.body}
                        </div>
                      ))}
                    </div>
                    <form onSubmit={submitMessage} className="mt-4 flex gap-2">
                      <input
                        value={messageDraft}
                        onChange={(event) => setMessageDraft(event.target.value)}
                        placeholder="Send a message..."
                        className="min-w-0 flex-1 rounded-xl border border-border bg-background-muted px-3 py-2.5 text-sm outline-none focus:border-accent"
                      />
                      <Button type="submit" size="icon" aria-label="Send message">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </>
                ) : (
                  <p className="text-sm text-foreground-muted">Select a venue with a booking to start messaging.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background-elevated/40 py-14">
        <div className="container-main px-6 md:px-8">
          <Card className="premium-surface bg-accent-muted/35">
            <CardContent className="flex flex-col gap-5 pt-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 font-display text-lg font-semibold">
                  <SlidersHorizontal className="h-5 w-5 text-accent" />
                  MVP accuracy checkpoint
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground-muted">
                  This build now pairs the interactive marketplace preview with production API routes
                  for Supabase Auth/Postgres, Stripe Connect manual capture, Gemini Concierge scoring,
                  realtime-ready messages, use-case reviews, and host readiness checks.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "Supabase RLS",
                    "Stripe Connect",
                    "Gemini Concierge",
                    "Realtime messages",
                    "Use-case reviews",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-accent/20 bg-background px-2.5 py-1 text-xs text-accent"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <Button asChild variant="magnetic">
                <a href="#discover">
                  Test discovery
                  <Sparkles className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
