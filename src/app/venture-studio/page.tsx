"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Code2,
  Gauge,
  Layers3,
  LineChart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildModules,
  calculateReadinessScore,
  launchMilestones,
  starterBrief,
  ventureTracks,
  type VentureBrief,
  type VentureTrackId,
} from "@/lib/venture-studio";
import { cn } from "@/lib/utils";

const briefFields: Array<{
  key: keyof VentureBrief;
  label: string;
  helper: string;
  placeholder: string;
}> = [
  {
    key: "audience",
    label: "Target user",
    helper: "Who needs this badly enough to try a rough first version?",
    placeholder: "Example: Independent real estate operators managing lead follow-up manually.",
  },
  {
    key: "problem",
    label: "Painful workflow",
    helper: "Name the repeated job, bottleneck, or expensive mistake.",
    placeholder: "Example: They lose deals because context is scattered across texts, notes, and spreadsheets.",
  },
  {
    key: "promise",
    label: "Product promise",
    helper: "Describe the outcome the app will produce.",
    placeholder: "Example: Turn every lead into a ranked next-best-action plan in under 60 seconds.",
  },
  {
    key: "advantage",
    label: "Unfair edge",
    helper: "Why should this app exist from this builder?",
    placeholder: "Example: Deep operational workflow experience plus fast AI-native prototyping.",
  },
  {
    key: "channel",
    label: "First distribution loop",
    helper: "Where the first users will come from.",
    placeholder: "Example: LinkedIn build-in-public updates and direct outreach to 20 operators.",
  },
];

const metricCards = [
  { label: "Project shell", value: "Live", icon: Rocket },
  { label: "Core modules", value: buildModules.length.toString(), icon: Layers3 },
  { label: "Launch phases", value: launchMilestones.length.toString(), icon: Target },
] satisfies Array<{ label: string; value: string; icon: LucideIcon }>;

function getReadinessLabel(score: number) {
  if (score >= 85) return "Ready for MVP scoping";
  if (score >= 65) return "Strong enough to prototype";
  if (score >= 40) return "Needs sharper positioning";
  return "Start with validation";
}

function getNextActions(trackId: VentureTrackId, score: number) {
  const shared = [
    "Pick one user journey that can be completed without support.",
    "Define the activation event that proves the app delivered value.",
  ];

  if (trackId === "validate") {
    return [
      "Interview five target users with the brief as the script.",
      "Rewrite the promise using the exact words users repeat.",
      ...shared,
    ];
  }

  if (trackId === "build") {
    return [
      "Create the data model for intake, output, and feedback.",
      "Build the smallest route that demonstrates the core transformation.",
      ...shared,
    ];
  }

  return [
    "Write the landing page headline from the product promise.",
    score >= 70
      ? "Publish the demo with a focused early-user ask."
      : "Collect three proof points before announcing broadly.",
    ...shared,
  ];
}

export default function VentureStudioPage() {
  const [activeTrackId, setActiveTrackId] = useState<VentureTrackId>("build");
  const [brief, setBrief] = useState<VentureBrief>(starterBrief);

  const activeTrack = ventureTracks.find((track) => track.id === activeTrackId) ?? ventureTracks[0];
  const readinessScore = useMemo(() => calculateReadinessScore(brief), [brief]);
  const readinessLabel = getReadinessLabel(readinessScore);
  const nextActions = useMemo(
    () => getNextActions(activeTrackId, readinessScore),
    [activeTrackId, readinessScore]
  );

  function updateBrief(key: keyof VentureBrief, value: string) {
    setBrief((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b border-border">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.26),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(227,25,55,0.16),transparent_28%)]"
          aria-hidden="true"
        />
        <div className="container-main relative px-6 py-10 md:px-8 md:py-16">
          <Button asChild variant="ghost" size="sm" className="mb-10 w-fit">
            <Link href="/#projects">
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
          </Button>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Badge variant="accent" className="mb-5">
                New project scaffold
              </Badge>
              <h1 className="max-w-4xl font-serif text-5xl leading-tight text-foreground md:text-7xl">
                Venture Studio
                <span className="block text-gradient-accent">web app starter</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground-muted">
                A ready-to-extend product workspace for turning a raw app idea into validation
                notes, MVP scope, AI-assisted workflows, and a launch checklist.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href="#brief">
                    Start the brief
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#roadmap">View roadmap</a>
                </Button>
              </div>
            </div>

            <Card className="gradient-border relative overflow-hidden">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent-muted text-accent">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <CardTitle className="font-serif text-3xl">Build command center</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {metricCards.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-border bg-background-muted/60 p-4">
                      <metric.icon className="mb-4 h-5 w-5 text-accent" />
                      <p className="font-display text-2xl font-semibold text-foreground">{metric.value}</p>
                      <p className="mt-1 text-xs uppercase tracking-wider text-foreground-subtle">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-border bg-background/60 p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-accent">
                    <Sparkles className="h-4 w-4" />
                    Starter purpose
                  </div>
                  <p className="text-sm leading-6 text-foreground-muted">
                    Use this route as the new application home. Replace the starter brief and modules
                    as the product direction hardens, while keeping the deployable app shell intact.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="brief" className="section-padding scroll-mt-20">
        <div className="container-main px-6 md:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="section-label">Product Brief</p>
            <h2 className="font-serif text-3xl text-foreground md:text-5xl">
              Decide what this web app is before the backlog takes over.
            </h2>
            <p className="mt-4 text-foreground-muted">
              Edit the fields below to reshape the starter app around the actual product as the
              idea becomes clearer.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <Card>
              <CardContent className="space-y-5 pt-6">
                {briefFields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                      <span className="font-display text-sm font-semibold text-foreground">{field.label}</span>
                      <span className="text-xs text-foreground-subtle">{field.helper}</span>
                    </span>
                    <textarea
                      value={brief[field.key]}
                      onChange={(event) => updateBrief(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="mt-2 w-full resize-none rounded-2xl border border-border bg-background-muted/70 px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-foreground-subtle focus:border-accent"
                    />
                  </label>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle>Readiness</CardTitle>
                    <Gauge className="h-5 w-5 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <span className="font-display text-6xl font-semibold text-foreground">
                      {readinessScore}
                    </span>
                    <span className="pb-2 text-sm text-foreground-subtle">/ 100</span>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-background-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${readinessScore}%` }}
                    />
                  </div>
                  <p className="mt-4 text-sm font-medium text-accent">{readinessLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-foreground-muted">
                    The score rises as each section becomes specific enough to guide design and
                    engineering choices.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {nextActions.map((action) => (
                      <li key={action} className="flex gap-3 text-sm leading-6 text-foreground-muted">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background-elevated/40 py-20">
        <div className="container-main px-6 md:px-8">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-label">Build Track</p>
              <h2 className="font-serif text-3xl text-foreground md:text-5xl">
                Move from idea to shipped loop.
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {ventureTracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setActiveTrackId(track.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    activeTrackId === track.id
                      ? "border-accent bg-accent text-background"
                      : "border-border bg-background-muted text-foreground-muted hover:border-accent/50 hover:text-accent"
                  )}
                >
                  {track.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="gradient-border">
              <CardHeader>
                <Badge variant="accent" className="w-fit">
                  {activeTrack.label}
                </Badge>
                <CardTitle className="pt-4 font-serif text-3xl leading-tight">
                  {activeTrack.headline}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-foreground-muted">{activeTrack.description}</p>
                <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-wider text-foreground-subtle">Success signal</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-foreground">{activeTrack.signal}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {activeTrack.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-accent/20 bg-accent-muted px-3 py-1 text-xs font-medium text-accent"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {buildModules.map((module, index) => {
                const icons = [ClipboardList, Code2, Bot, LineChart] satisfies LucideIcon[];
                const ModuleIcon = icons[index] ?? ShieldCheck;

                return (
                  <Card key={module.title} className="bg-background-muted/35">
                    <CardHeader>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background">
                        <ModuleIcon className="h-5 w-5 text-accent" />
                      </div>
                      <CardTitle>{module.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-6 text-foreground-muted">{module.description}</p>
                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs">
                        <span className="text-foreground-subtle">{module.owner}</span>
                        <span className="font-medium text-accent">{module.outcome}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="roadmap" className="section-padding scroll-mt-20">
        <div className="container-main px-6 md:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="section-label">Launch Roadmap</p>
            <h2 className="font-serif text-3xl text-foreground md:text-5xl">
              Keep the first release narrow, visible, and measurable.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {launchMilestones.map((milestone) => (
              <Card key={milestone.phase} className="relative overflow-hidden">
                <CardHeader>
                  <span className="font-display text-5xl font-semibold text-accent/25">
                    {milestone.phase}
                  </span>
                  <CardTitle>{milestone.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-foreground-muted">{milestone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 bg-accent-muted/40">
            <CardContent className="flex flex-col gap-5 pt-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-foreground">Ready for the next build pass?</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                  The folder is intentionally scoped as a starter application. The next iteration can
                  replace this operating shell with the chosen product domain, API integrations, and persistence.
                </p>
              </div>
              <Button asChild variant="magnetic">
                <Link href="/#contact">
                  Discuss the app
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
