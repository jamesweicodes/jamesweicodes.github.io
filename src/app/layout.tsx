import type { Metadata } from "next";
import { Inter, Instrument_Serif, Space_Grotesk } from "next/font/google";
import LenisProvider from "@/components/providers/lenis-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import ScrollProgress from "@/components/cinematic/scroll-progress";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "James Robert Wei | Program Manager · AI Builder · Cinematographer",
  description:
    "The Era of Implementation — Program Manager at Tesla, AI web application developer, and professional cinematographer. Cinematic execution at enterprise scale.",
  metadataBase: new URL("https://jameswei.me"),
  keywords: [
    "James Wei",
    "Program Manager",
    "Tesla",
    "AI Builder",
    "Cinematographer",
    "Portfolio",
  ],
  openGraph: {
    title: "James Robert Wei — The Era of Implementation",
    description: "Program Manager. AI Builder. Cinematographer.",
    url: "https://jameswei.me",
    siteName: "James Wei",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "James Robert Wei",
    description: "Program Manager. AI Builder. Cinematographer.",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "James Robert Wei",
  jobTitle: "Program Manager & AI Integrator",
  url: "https://jameswei.me",
  email: "James.wei.cs@gmail.com",
  address: { "@type": "PostalAddress", addressLocality: "San Jose", addressRegion: "CA" },
  sameAs: [
    "https://www.linkedin.com/in/jamesweicodes/",
    "https://github.com/jamesweicodes",
  ],
  knowsAbout: [
    "Program Management",
    "Artificial Intelligence",
    "Financial Services",
    "Cinematography",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <LenisProvider>
            <ScrollProgress />
            {children}
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
