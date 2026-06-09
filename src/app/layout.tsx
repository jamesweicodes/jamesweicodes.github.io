import type { Metadata } from "next";
import { Inter, Instrument_Serif, Space_Grotesk } from "next/font/google";
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
    "The Era of Implementation — Program Manager at Tesla, AI web application developer, and professional cinematographer based in San Jose, CA.",
  metadataBase: new URL("https://jameswei.me"),
  openGraph: {
    title: "James Robert Wei",
    description: "Program Manager. AI Builder. Cinematographer.",
    url: "https://jameswei.me",
    siteName: "James Wei",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "James Robert Wei",
    description: "Program Manager. AI Builder. Cinematographer.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable} scroll-smooth`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
