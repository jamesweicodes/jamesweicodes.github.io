export type VentureTrackId = "validate" | "build" | "launch";

export type VentureTrack = {
  id: VentureTrackId;
  label: string;
  headline: string;
  description: string;
  signal: string;
  stack: string[];
};

export type VentureBrief = {
  audience: string;
  problem: string;
  promise: string;
  advantage: string;
  channel: string;
};

export type BuildModule = {
  title: string;
  description: string;
  owner: string;
  outcome: string;
};

export type LaunchMilestone = {
  phase: string;
  title: string;
  description: string;
};

export const starterBrief: VentureBrief = {
  audience: "Operators, founders, and creators who need to move from idea to shipped app quickly.",
  problem: "New projects lose momentum when positioning, feature scope, and launch work live in separate docs.",
  promise: "Turn a raw web-app idea into a prioritized build plan, product surface, and launch checklist.",
  advantage: "Combine James' program execution background with AI-assisted prototyping and portfolio-grade UX.",
  channel: "Portfolio demos, LinkedIn build-in-public posts, warm founder/operator conversations.",
};

export const ventureTracks: VentureTrack[] = [
  {
    id: "validate",
    label: "Validate",
    headline: "Pressure-test the idea before code gets expensive.",
    description:
      "Capture the target user, pain, offer, proof points, and first distribution loop in one operating brief.",
    signal: "Clear user pull and a repeatable problem worth solving.",
    stack: ["Research", "Positioning", "ICP", "Offer Design"],
  },
  {
    id: "build",
    label: "Build",
    headline: "Translate the brief into a focused MVP surface.",
    description:
      "Prioritize core workflow, data model, interaction states, and telemetry before adding nice-to-haves.",
    signal: "A demo users can complete in one sitting with obvious next steps.",
    stack: ["Next.js", "TypeScript", "AI Workflow", "Analytics"],
  },
  {
    id: "launch",
    label: "Launch",
    headline: "Package the product so early users know what to do.",
    description:
      "Create the landing narrative, onboarding path, feedback loop, and public progress cadence.",
    signal: "A live link, clear promise, and measurable activation event.",
    stack: ["Landing Page", "Onboarding", "Feedback", "Distribution"],
  },
];

export const buildModules: BuildModule[] = [
  {
    title: "Idea Intake",
    description:
      "Structured brief fields capture who the app serves, why it matters, and what makes the product defensible.",
    owner: "Product",
    outcome: "One-page app thesis",
  },
  {
    title: "MVP Map",
    description:
      "Converts the thesis into feature slices, page inventory, required data, and success criteria.",
    owner: "Engineering",
    outcome: "Buildable scope",
  },
  {
    title: "AI Assist Layer",
    description:
      "Provides prompts for research, copy, workflow generation, and quality checks without locking in a vendor.",
    owner: "AI",
    outcome: "Reusable prompt system",
  },
  {
    title: "Launch Console",
    description:
      "Tracks release steps, activation metrics, user notes, and the next public shipping update.",
    owner: "Growth",
    outcome: "Launch-ready checklist",
  },
];

export const launchMilestones: LaunchMilestone[] = [
  {
    phase: "01",
    title: "Define the wedge",
    description: "Pick the narrow user, painful workflow, and one result the first version must deliver.",
  },
  {
    phase: "02",
    title: "Ship the core loop",
    description: "Build only the screens needed for intake, transformation, output, and feedback.",
  },
  {
    phase: "03",
    title: "Instrument the demo",
    description: "Track completion, copied/exported outputs, and qualitative feedback from every test user.",
  },
  {
    phase: "04",
    title: "Launch publicly",
    description: "Publish the story, demo link, screenshots, changelog, and a clear ask for early users.",
  },
];

export function calculateReadinessScore(brief: VentureBrief) {
  const fields = Object.values(brief);
  const filledFields = fields.filter((value) => value.trim().length >= 24).length;
  const depthScore = Math.min(
    25,
    Math.round(fields.reduce((total, value) => total + Math.min(value.trim().length, 160), 0) / 32)
  );

  return Math.min(100, filledFields * 15 + depthScore);
}
