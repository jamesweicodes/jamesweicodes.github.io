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
  { label: "Playbook", href: "#playbook" },
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
    id: "venuespace",
    title: "VenueSpace",
    description:
      "Hourly event-space marketplace MVP with intent-driven discovery, request-to-book validation, owner approvals, use-case reviews, and messaging.",
    stack: ["Next.js", "Marketplace UX", "Booking Flow", "Stripe-Ready"],
    status: "live" as const,
    href: "/venuespace/",
    github: null,
  },
  {
    id: "venture-studio",
    title: "Venture Studio",
    description:
      "New web application starter for turning raw product ideas into validation briefs, MVP scope, AI-assisted workflows, and launch plans.",
    stack: ["Next.js", "Product Ops", "AI Workflow", "Launch System"],
    status: "live" as const,
    href: "/venture-studio/",
    github: null,
  },
  {
    id: "property-intelligence",
    title: "AI Property Intelligence",
    description:
      "Full-stack real estate research app that turns an address into valuation, rent, risk, geography, and investor underwriting reports.",
    stack: ["Next.js", "FastAPI", "Public Data APIs", "AI Underwriting"],
    status: "live" as const,
    href: "/property-intelligence/",
    github: null,
  },
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
    id: "blackjack",
    title: "Blackjack Table",
    description:
      "Interactive browser blackjack with shuffled decks, soft ace scoring, dealer logic, and session stats.",
    stack: ["Next.js", "React", "Game Logic"],
    status: "playable" as const,
    href: "/blackjack",
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

export const executionPlaybookContent = {
  eyebrow: "Execution Playbook",
  title: "Turn ambiguous missions into shippable systems.",
  description:
    "Pick a mission profile to see how James converts raw constraints into the operating rhythm, automation layer, and proof points needed to move work from idea to implementation.",
  missions: [
    {
      id: "ops",
      label: "Enterprise Ops",
      headline: "Stabilize a messy workflow",
      context: "Collections, compliance, reporting, and stakeholder alignment at scale.",
      signal: "Manual handoffs, fragmented data, unclear ownership",
      stack: ["Process Mapping", "SQL & Dashboards", "Dependency Tracking", "Control Design"],
      phases: [
        {
          name: "Frame",
          detail: "Map the current-state workflow, failure modes, data sources, and decision owners.",
        },
        {
          name: "Systemize",
          detail: "Replace repeated manual work with workflow rules, reporting checkpoints, and clear SLAs.",
        },
        {
          name: "Prove",
          detail: "Track adoption, exception volume, compliance coverage, and measurable operational lift.",
        },
      ],
      outcome: "A durable operating system teams can run without spreadsheet heroics.",
      metric: "Enterprise-ready",
    },
    {
      id: "ai",
      label: "AI Build",
      headline: "Ship an AI-native tool",
      context: "Automation products that turn domain prompts into useful outputs.",
      signal: "Repeatable creative or analytical work waiting for a better interface",
      stack: ["Gemini API", "Prompt Systems", "FastAPI", "Next.js"],
      phases: [
        {
          name: "Capture",
          detail: "Define the user's job, input schema, success criteria, and guardrails before coding.",
        },
        {
          name: "Compose",
          detail: "Wire the prompt, validation, model settings, and frontend flow into a tight feedback loop.",
        },
        {
          name: "Harden",
          detail: "Add fallbacks, safety rules, telemetry cues, and copy-ready output formatting.",
        },
      ],
      outcome: "A focused tool that compresses a repeatable task from minutes into seconds.",
      metric: "AI-native",
    },
    {
      id: "media",
      label: "Content Engine",
      headline: "Build a cinematic publishing loop",
      context: "Finance, brand, and social content produced with a creator-operator mindset.",
      signal: "Good ideas need story, cadence, gear discipline, and distribution shape",
      stack: ["Sony a7 IV", "DJI Osmo", "Script Pipeline", "Short-Form Editing"],
      phases: [
        {
          name: "Package",
          detail: "Turn the core message into hooks, beats, visual requirements, and platform-specific cuts.",
        },
        {
          name: "Capture",
          detail: "Shoot with intentional framing, light, movement, and b-roll that supports the business goal.",
        },
        {
          name: "Distribute",
          detail: "Publish variants, learn from retention signals, and feed winning patterns back into scripts.",
        },
      ],
      outcome: "A repeatable media system where every asset has a clear strategic job.",
      metric: "Cinematic",
    },
  ],
} as const;

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

export const contactContent = {
  education: "B.S. Computer Science & Engineering — UC Merced",
  certifications: "Google PM & LSU Project Management Certified",
  offScreen:
    "Off-Screen: Value-targeted crypto strategy, dialing in home espresso, multi-day trekking (Yosemite/Lassen), & NFL.",
} as const;
