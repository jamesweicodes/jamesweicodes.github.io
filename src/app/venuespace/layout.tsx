import type { Metadata } from "next";
import { venues } from "@/lib/venuespace";

export const metadata: Metadata = {
  title: "VenueSpace | AI Event Space Marketplace for San Jose",
  description:
    "VenueSpace matches renters with cafes, restaurant backrooms, and studios by event intent. Discover hourly spaces for workshops, photo shoots, birthday parties, offsites, and pop-up dinners.",
  alternates: {
    canonical: "/venuespace/",
  },
  keywords: [
    "VenueSpace",
    "event space marketplace",
    "San Jose event venues",
    "hourly event space",
    "AI venue concierge",
    "Airbnb for event spaces",
    "Yelp for venues",
  ],
  openGraph: {
    title: "VenueSpace — The AI Marketplace for Hourly Event Spaces",
    description:
      "Intent-first discovery for San Jose cafes, studios, and restaurant backrooms. Request to book, review by use case, and match with AI.",
    url: "https://jameswei.me/venuespace/",
    siteName: "VenueSpace",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VenueSpace — AI Event Space Marketplace",
    description:
      "Find bookable cafes, studios, and restaurant backrooms by event intent instead of generic filters.",
  },
  robots: { index: true, follow: true },
};

const venueJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "VenueSpace",
  applicationCategory: "MarketplaceApplication",
  operatingSystem: "Web",
  url: "https://jameswei.me/venuespace/",
  description:
    "AI-powered hourly event space marketplace matching renters with San Jose venues by use case and intent.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: Math.min(...venues.map((venue) => venue.hourly_rate)),
    highPrice: Math.max(...venues.map((venue) => venue.hourly_rate)),
  },
  areaServed: {
    "@type": "City",
    name: "San Jose",
    addressRegion: "CA",
  },
  hasPart: venues.map((venue) => ({
    "@type": "LocalBusiness",
    name: venue.name,
    description: venue.description,
    address: venue.neighborhood,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: venue.rating,
      reviewCount: venue.reviewCount,
    },
    amenityFeature: venue.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
    priceRange: `$${venue.hourly_rate}/hr`,
  })),
};

export default function VenueSpaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(venueJsonLd) }}
      />
      {children}
    </>
  );
}
