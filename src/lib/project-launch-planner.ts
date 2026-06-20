export type ProjectMode = "portfolio" | "startup" | "automation" | "content";

export type ProjectDepth = "lean" | "standard" | "enterprise";

export type PlannerInput = {
  idea: string;
  audience: string;
  mode: ProjectMode;
  depth: ProjectDepth;
  successMetric: string;
  constraints: string;
};

export type PlanSection = {
  title: string;
  detail: string;
  items: string[];
};

export type ProjectPlan = {
  id: string;
  title: string;
  createdAt: string;
  summary: string;
  positioning: string;
  stack: string[];
  mvp: string[];
  milestones: PlanSection[];
  risks: PlanSection[];
  nextActions: string[];
  launchCopy: {
    headline: string;
    pitch: string;
    demoScript: string[];
  };
};

const modeConfig: Record<
  ProjectMode,
  {
    label: string;
    stack: string[];
    outcomes: string[];
    proof: string;
  }
> = {
  portfolio: {
    label: "Portfolio build",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Static Export", "Framer Motion"],
    outcomes: ["public demo", "case study", "before-and-after proof"],
    proof: "A polished demo and case study that explains the build decisions.",
  },
  startup: {
    label: "Startup MVP",
    stack: ["Next.js", "FastAPI", "PostgreSQL", "Stripe-ready UX", "Analytics"],
    outcomes: ["landing page", "waitlist funnel", "concierge workflow"],
    proof: "A narrow MVP that proves demand before heavy platform buildout.",
  },
  automation: {
    label: "Automation system",
    stack: ["Python", "FastAPI", "n8n", "Gemini API", "Structured Logs"],
    outcomes: ["repeatable workflow", "operator dashboard", "exception queue"],
    proof: "A measurable workflow that removes manual handoffs and exposes failures.",
  },
  content: {
    label: "Content engine",
    stack: ["Next.js", "Gemini API", "Prompt Templates", "Asset Library", "Publishing Checklist"],
    outcomes: ["content brief", "script pack", "distribution checklist"],
    proof: "A repeatable creative system with hooks, scripts, and publishing assets.",
  },
};

const depthConfig: Record<ProjectDepth, { label: string; mvpCount: number; actionCount: number }> = {
  lean: { label: "Lean", mvpCount: 4, actionCount: 4 },
  standard: { label: "Standard", mvpCount: 5, actionCount: 5 },
  enterprise: { label: "Enterprise", mvpCount: 6, actionCount: 6 },
};

const fallbackInput: PlannerInput = {
  idea: "AI client intake workspace for service operators",
  audience: "small business owners who manage leads manually",
  mode: "automation",
  depth: "standard",
  successMetric: "reduce intake follow-up time by 50%",
  constraints: "must work as a static demo first, no private customer data",
};

export const samplePlannerInputs: PlannerInput[] = [
  fallbackInput,
  {
    idea: "Investor-ready neighborhood report generator",
    audience: "real estate agents and buyers comparing local markets",
    mode: "portfolio",
    depth: "standard",
    successMetric: "produce a shareable report in under two minutes",
    constraints: "public data only, export-friendly, mobile-first",
  },
  {
    idea: "Creator pipeline that turns market news into short-form scripts",
    audience: "finance creators publishing daily YouTube Shorts and TikToks",
    mode: "content",
    depth: "lean",
    successMetric: "ship three publish-ready scripts per session",
    constraints: "avoid investment advice, include review checkpoints",
  },
];

export function createProjectPlan(rawInput: PlannerInput): ProjectPlan {
  const input = normalizeInput(rawInput);
  const config = modeConfig[input.mode];
  const depth = depthConfig[input.depth];
  const constraints = extractConstraints(input.constraints);
  const title = titleFromIdea(input.idea);
  const mvp = buildMvp(input, constraints).slice(0, depth.mvpCount);
  const stack = buildStack(input, constraints);
  const now = new Date();

  return {
    id: `plan-${now.getTime()}`,
    title,
    createdAt: now.toISOString(),
    summary: `${config.label} for ${input.audience}. The first release should prove ${input.successMetric} with a focused ${config.outcomes[0]} and a clear operator workflow.`,
    positioning: `${title} helps ${input.audience} move from idea to execution by turning ${input.idea.toLowerCase()} into a guided, measurable product experience.`,
    stack,
    mvp,
    milestones: buildMilestones(input, config.proof),
    risks: buildRisks(input, constraints),
    nextActions: buildNextActions(input, constraints).slice(0, depth.actionCount),
    launchCopy: {
      headline: `${title}: ${config.label} for ${shortAudience(input.audience)}`,
      pitch: `A focused build that turns ${input.idea.toLowerCase()} into a usable workflow for ${input.audience}, optimized around ${input.successMetric}.`,
      demoScript: [
        `Open with the pain: ${input.audience} need a faster way to act on this problem.`,
        `Show the input flow and explain why each field maps to ${input.successMetric}.`,
        "Generate the output, then point to the decision, automation, or creative artifact it unlocks.",
        "Close with the metric, next iteration, and the evidence needed to keep building.",
      ],
    },
  };
}

export function planToText(plan: ProjectPlan): string {
  const lines = [
    plan.title,
    "",
    plan.summary,
    "",
    "Positioning",
    plan.positioning,
    "",
    "Recommended stack",
    ...plan.stack.map((item) => `- ${item}`),
    "",
    "MVP scope",
    ...plan.mvp.map((item) => `- ${item}`),
    "",
    "Milestones",
    ...plan.milestones.flatMap((section) => [
      `${section.title}: ${section.detail}`,
      ...section.items.map((item) => `- ${item}`),
    ]),
    "",
    "Risks",
    ...plan.risks.flatMap((section) => [
      `${section.title}: ${section.detail}`,
      ...section.items.map((item) => `- ${item}`),
    ]),
    "",
    "Next actions",
    ...plan.nextActions.map((item) => `- ${item}`),
    "",
    "Launch copy",
    plan.launchCopy.headline,
    plan.launchCopy.pitch,
    ...plan.launchCopy.demoScript.map((item) => `- ${item}`),
  ];

  return lines.join("\n");
}

function normalizeInput(input: PlannerInput): PlannerInput {
  return {
    idea: clean(input.idea) || fallbackInput.idea,
    audience: clean(input.audience) || fallbackInput.audience,
    mode: input.mode,
    depth: input.depth,
    successMetric: clean(input.successMetric) || fallbackInput.successMetric,
    constraints: clean(input.constraints) || fallbackInput.constraints,
  };
}

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractConstraints(value: string): string[] {
  return value
    .split(/[,;\n]+/)
    .map((item) => clean(item))
    .filter(Boolean);
}

function titleFromIdea(idea: string): string {
  const words = idea
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 7);

  if (!words.length) return "Project Launch Planner";

  return words
    .map((word) => {
      const lower = word.toLowerCase();
      if (["ai", "api", "crm", "mvp", "seo"].includes(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function buildStack(input: PlannerInput, constraints: string[]): string[] {
  const base = modeConfig[input.mode].stack;
  const additions = [
    input.depth === "enterprise" ? "Role-based Workflows" : null,
    constraints.some((item) => item.toLowerCase().includes("static")) ? "Next.js Static Export" : null,
    constraints.some((item) => item.toLowerCase().includes("data")) ? "Data Validation Layer" : null,
    constraints.some((item) => item.toLowerCase().includes("mobile")) ? "Responsive UX" : null,
  ].filter(Boolean) as string[];

  return unique([...base, ...additions]).slice(0, 7);
}

function buildMvp(input: PlannerInput, constraints: string[]): string[] {
  const common = [
    `Guided intake for the core ${input.idea.toLowerCase()} use case.`,
    `Output screen that makes progress toward ${input.successMetric} obvious.`,
    "Copy/share/export action so the result can leave the app.",
    "Saved local history for quick iteration during demos.",
  ];

  const modeSpecific: Record<ProjectMode, string[]> = {
    portfolio: [
      "Case-study panel that explains the problem, constraints, and implementation choices.",
      "Demo-ready visual polish using the existing cinematic design system.",
    ],
    startup: [
      "Waitlist or contact capture surface with clear qualification fields.",
      "Manual fulfillment path behind the MVP before deeper automation.",
    ],
    automation: [
      "Exception queue for inputs that need human review.",
      "Operator checklist that turns generated output into completed work.",
    ],
    content: [
      "Hook, outline, and publishing checklist generated from the same brief.",
      "Tone controls for platform-specific variants.",
    ],
  };

  const constraintItems = constraints.length
    ? [`Constraint tracker covering ${constraints.slice(0, 3).join(", ")}.`]
    : [];

  return [...common, ...modeSpecific[input.mode], ...constraintItems];
}

function buildMilestones(input: PlannerInput, proof: string): PlanSection[] {
  return [
    {
      title: "01 - Define the narrow promise",
      detail: `Lock the first user, first workflow, and first measurable outcome around ${input.successMetric}.`,
      items: [
        `Write the one-sentence promise for ${input.audience}.`,
        "List the minimum inputs needed to produce a useful result.",
        "Document what will be intentionally excluded from the first release.",
      ],
    },
    {
      title: "02 - Build the proof path",
      detail: proof,
      items: [
        "Create the intake, generation, and results surfaces.",
        "Add sample data that demonstrates the strongest use case immediately.",
        "Make the output copyable or downloadable for real workflow testing.",
      ],
    },
    {
      title: "03 - Validate and harden",
      detail: "Use repeated demo runs to tighten the product surface before expanding scope.",
      items: [
        "Run through the happy path, empty state, and malformed input path.",
        "Capture questions from reviewers as backlog items.",
        "Promote the best demo result into a homepage project card or case study.",
      ],
    },
  ];
}

function buildRisks(input: PlannerInput, constraints: string[]): PlanSection[] {
  const risks: PlanSection[] = [
    {
      title: "Scope drift",
      detail: "The idea can become too broad if every adjacent workflow is pulled into the MVP.",
      items: [
        `Keep the first release anchored to ${input.successMetric}.`,
        "Convert nice-to-have requests into a later backlog instead of the initial build.",
      ],
    },
    {
      title: "Weak proof",
      detail: "A polished interface still needs evidence that the output changes user behavior.",
      items: [
        "Define one demo scenario that mirrors a real user decision.",
        "Compare the generated output against the current manual process.",
      ],
    },
  ];

  if (constraints.length) {
    risks.push({
      title: "Constraint handling",
      detail: "Known constraints should become visible product requirements, not hidden assumptions.",
      items: constraints.slice(0, 3).map((item) => `Add an explicit acceptance check for: ${item}.`),
    });
  }

  return risks;
}

function buildNextActions(input: PlannerInput, constraints: string[]): string[] {
  return [
    `Write the exact user story for ${shortAudience(input.audience)}.`,
    `Create one golden-path sample for "${input.idea}".`,
    "Sketch the intake fields, result sections, and export action.",
    `Choose the smallest implementation that can prove ${input.successMetric}.`,
    constraints[0] ? `Turn "${constraints[0]}" into a visible acceptance criterion.` : "Define one non-goal to protect MVP scope.",
    "Run a demo and record the first three friction points.",
  ];
}

function shortAudience(audience: string): string {
  return audience.length > 48 ? `${audience.slice(0, 45).trim()}...` : audience;
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}
