/**
 * Central content model for jameswei.me
 * Step 2–4 components will consume this data.
 */
export const siteConfig = {
  name: "James Robert Wei",
  tagline: "Program Manager. AI Builder. Cinematographer.",
  theme: "The Era of Implementation",
  location: "San Jose, CA",
  email: "James.wei.cs@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/jamesweicodes/",
    github: "https://github.com/jamesweicodes",
    youtube: "https://youtube.com",
  },
} as const;

export const heroContent = {
  headline: "James Robert Wei",
  subheadline: "Program Manager. AI Builder. Cinematographer.",
  themeLine:
    "The Era of Implementation — a permanent shift from planning to ruthless execution.",
  cta: { label: "Explore My Work", href: "#projects" },
} as const;

export const navLinks = [
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Media", href: "#media" },
  { label: "Contact", href: "#contact" },
] as const;

export const experienceContent = {
  company: "Tesla, Inc.",
  division: "Financial Services",
  roles: [
    {
      title: "Program Manager – Financial Services Platforms",
      period: "2023 – Present",
      highlights: [
        "Streamlined Accounts Receivable processes and captive customer portfolio operations at scale.",
        "Built centralized reporting, compliance workflows, and customer-facing payment features.",
        "Led collections work management platform replacing spreadsheets with systemized execution.",
        "Partnered with data science on behavioral analytics driving measurable AR reduction.",
      ],
    },
    {
      title: "Associate Program Manager",
      period: "2022 – 2023",
      highlights: [
        "Managed cross-functional leasing and collections initiatives with full dependency tracking.",
        "Translated regulatory and analytical requirements into structured engineering plans.",
      ],
    },
    {
      title: "Business Analyst",
      period: "2021 – 2022",
      highlights: [
        "Scaled leasing/collections from minimal structure into a data-driven organization.",
        "Identified workflow gaps and partnered with engineering on automation.",
      ],
    },
  ],
} as const;

export const projectsContent = [
  {
    id: "event-space",
    title: "B2B Event Space Platform",
    description:
      "Commercial B2B application blueprint for event spaces — strategic pivots around zoning and business model design.",
    stack: ["Python", "Full-Stack Blueprint", "B2B Routing"],
    status: "blueprint" as const,
    href: null,
    github: null,
  },
  {
    id: "real-estate",
    title: "Real Estate Script Generator",
    description:
      "Web-based automation tool generating high-converting listing copy and social posts for real estate professionals.",
    stack: ["Python", "Gemini API", "n8n", "GitHub Copilot"],
    status: "live" as const,
    href: "/lab/script-generator/",
    github: null,
  },
  {
    id: "market-insights",
    title: "Market Insights Pipeline",
    description:
      "Automated news scraping and script generation for finance-focused YouTube and TikTok content channels.",
    stack: ["Python", "Google AI Studio", "Gemini API", "n8n"],
    status: "pipeline" as const,
    href: null,
    github: null,
  },
] as const;

export const mediaContent = {
  ventures: [
    {
      id: "wealth-engine",
      title: "Wealth Engine Media",
      description: "Professional cinematography and brand storytelling.",
      platforms: ["Commercial", "Brand Film", "Documentary"],
    },
    {
      id: "market-insights-media",
      title: "Market Insights",
      description: "Finance-focused content for YouTube and TikTok.",
      platforms: ["YouTube", "TikTok"],
    },
  ],
  gear: ["Sony a7 IV", "DJI Osmo Pocket 3"],
  /** Placeholder reels — replace with actual video/thumbnail URLs in Step 4 */
  gallery: [
    { id: "1", title: "Brand Film — Wealth Engine", type: "video" as const, aspect: "16/9" as const },
    { id: "2", title: "Market Insights — Market Open", type: "video" as const, aspect: "9/16" as const },
    { id: "3", title: "Tesla Campus B-Roll", type: "photo" as const, aspect: "16/9" as const },
    { id: "4", title: "Product Launch Teaser", type: "video" as const, aspect: "16/9" as const },
    { id: "5", title: "Creator Setup — a7 IV", type: "photo" as const, aspect: "4/5" as const },
    { id: "6", title: "Finance Short — TikTok", type: "video" as const, aspect: "9/16" as const },
  ],
} as const;

export const techStack = [
  "Python",
  "n8n",
  "Google AI Studio",
  "Gemini API",
  "GitHub Copilot",
  "SQL & Dashboards",
  "Program Execution",
] as const;
