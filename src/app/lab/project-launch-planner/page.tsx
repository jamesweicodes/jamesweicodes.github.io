"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Clipboard,
  Download,
  Layers3,
  ListChecks,
  Rocket,
  ShieldAlert,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createProjectPlan,
  planToText,
  ProjectPlan,
  PlannerInput,
  samplePlannerInputs,
} from "@/lib/project-launch-planner";

const STORAGE_KEY = "jw-project-launch-plans";
const MAX_HISTORY = 4;

const modeLabels: Record<PlannerInput["mode"], string> = {
  portfolio: "Portfolio build",
  startup: "Startup MVP",
  automation: "Automation system",
  content: "Content engine",
};

const depthLabels: Record<PlannerInput["depth"], string> = {
  lean: "Lean",
  standard: "Standard",
  enterprise: "Enterprise",
};

export default function ProjectLaunchPlannerPage() {
  const [form, setForm] = useState<PlannerInput>(samplePlannerInputs[0]);
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [history, setHistory] = useState<ProjectPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProjectPlan[];
        setHistory(parsed.slice(0, MAX_HISTORY));
        setPlan(parsed[0] ?? null);
      }
    } catch {
      setHistory([]);
    }
  }, []);

  function updateField<K extends keyof PlannerInput>(key: K, value: PlannerInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applySample(sample: PlannerInput) {
    setForm(sample);
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.idea.trim().length < 8) {
      setError("Describe the project idea in a little more detail.");
      return;
    }

    if (form.audience.trim().length < 4) {
      setError("Add the target audience so the plan has a clear user.");
      return;
    }

    const nextPlan = createProjectPlan(form);
    const nextHistory = [nextPlan, ...history.filter((item) => item.id !== nextPlan.id)].slice(
      0,
      MAX_HISTORY
    );

    setPlan(nextPlan);
    setHistory(nextHistory);
    setError(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  }

  async function copyPlan() {
    if (!plan) return;

    await navigator.clipboard.writeText(planToText(plan));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function downloadPlan() {
    if (!plan) return;

    const blob = new Blob([planToText(plan)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${plan.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-plan.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <div className="film-grain pointer-events-none fixed inset-0 z-50 opacity-25" aria-hidden="true" />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[540px] bg-[radial-gradient(circle_at_24%_18%,rgba(14,165,233,0.24),transparent_34%),radial-gradient(circle_at_84%_8%,rgba(227,25,55,0.14),transparent_30%)]"
        aria-hidden="true"
      />

      <header className="border-b border-border bg-background-elevated/80 backdrop-blur-xl">
        <div className="container-main flex h-16 items-center justify-between px-6">
          <Link href="/" className="font-display font-bold tracking-tight hover:text-accent">
            JRW<span className="text-accent">.</span>
          </Link>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </div>
      </header>

      <main className="container-main px-6 py-10 md:py-14">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="accent" className="mb-4">
              AI Lab - Project Launch Planner
            </Badge>
            <h1 className="max-w-4xl font-serif text-4xl leading-[0.95] text-foreground md:text-6xl">
              Turn a rough idea into an execution-ready project plan.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-foreground-muted md:text-lg">
              A lightweight planning cockpit for portfolio builds, startup MVPs, automation systems,
              and content engines. Enter a project concept and generate scope, stack, milestones,
              risks, next actions, and launch copy.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Signal icon={Target} label="Positioning" value="Audience + metric" />
              <Signal icon={Layers3} label="Scope" value="MVP + stack" />
              <Signal icon={Rocket} label="Launch" value="Demo script" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass-panel rounded-3xl p-5"
          >
            <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
              Planning Loop
            </p>
            <div className="mt-5 grid gap-3">
              {[
                ["Input", "Define the idea, audience, constraints, and success metric."],
                ["Structure", "Generate a build path that protects the first release."],
                ["Ship", "Copy or download the plan and use it as the execution brief."],
              ].map(([label, detail], index) => (
                <div key={label} className="rounded-2xl border border-border bg-background-muted/60 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-muted text-xs font-bold text-accent">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-display text-sm text-foreground">{label}</p>
                      <p className="mt-1 text-xs leading-5 text-foreground-muted">{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            onSubmit={handleSubmit}
            className="glass-panel h-fit space-y-5 rounded-3xl p-6 md:p-8"
          >
            <div>
              <p className="font-display text-xs uppercase tracking-[0.18em] text-accent">
                Project Intake
              </p>
              <h2 className="mt-2 font-serif text-3xl text-foreground">Build Brief</h2>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-foreground-muted">
                Project idea
              </label>
              <textarea
                value={form.idea}
                onChange={(event) => updateField("idea", event.target.value)}
                rows={3}
                placeholder="AI workflow for..."
                className="w-full resize-none rounded-xl border border-border bg-background-muted px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-foreground-muted">
                Target audience
              </label>
              <input
                value={form.audience}
                onChange={(event) => updateField("audience", event.target.value)}
                placeholder="Who needs this?"
                className="w-full rounded-xl border border-border bg-background-muted px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent/50 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground-muted">
                  Project type
                </label>
                <select
                  value={form.mode}
                  onChange={(event) =>
                    updateField("mode", event.target.value as PlannerInput["mode"])
                  }
                  className="w-full rounded-xl border border-border bg-background-muted px-4 py-3 text-sm text-foreground focus:border-accent/50 focus:outline-none"
                >
                  {Object.entries(modeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground-muted">
                  Planning depth
                </label>
                <select
                  value={form.depth}
                  onChange={(event) =>
                    updateField("depth", event.target.value as PlannerInput["depth"])
                  }
                  className="w-full rounded-xl border border-border bg-background-muted px-4 py-3 text-sm text-foreground focus:border-accent/50 focus:outline-none"
                >
                  {Object.entries(depthLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-foreground-muted">
                Success metric
              </label>
              <input
                value={form.successMetric}
                onChange={(event) => updateField("successMetric", event.target.value)}
                placeholder="What proves this worked?"
                className="w-full rounded-xl border border-border bg-background-muted px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-foreground-muted">
                Constraints
              </label>
              <textarea
                value={form.constraints}
                onChange={(event) => updateField("constraints", event.target.value)}
                rows={3}
                placeholder="Static export, no private data, mobile-first..."
                className="w-full resize-none rounded-xl border border-border bg-background-muted px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent/50 focus:outline-none"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-tesla/30 bg-tesla-muted px-4 py-3 text-sm text-tesla">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg">
                <Sparkles className="h-4 w-4" />
                Generate Plan
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => applySample(samplePlannerInputs[1])}>
                Load Sample
              </Button>
            </div>

            <div className="border-t border-border pt-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-foreground-subtle">
                Quick starts
              </p>
              <div className="grid gap-2">
                {samplePlannerInputs.map((sample) => (
                  <button
                    key={sample.idea}
                    type="button"
                    onClick={() => applySample(sample)}
                    className="rounded-xl border border-border bg-background-muted/60 px-4 py-3 text-left text-xs text-foreground-muted transition-colors hover:border-border-hover hover:text-foreground"
                  >
                    {sample.idea}
                  </button>
                ))}
              </div>
            </div>
          </motion.form>

          <div className="space-y-6">
            {plan ? (
              <PlanResult
                plan={plan}
                copied={copied}
                onCopy={copyPlan}
                onDownload={downloadPlan}
              />
            ) : (
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="font-serif text-3xl">No plan generated yet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-foreground-muted">
                    Fill out the intake or load a quick-start sample to generate an execution brief.
                    The planner runs locally in the browser and keeps recent plans on this device.
                  </p>
                </CardContent>
              </Card>
            )}

            {history.length > 0 && (
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Recent Plans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPlan(item)}
                      className="w-full rounded-2xl border border-border bg-background-muted/50 p-4 text-left transition-colors hover:border-border-hover"
                    >
                      <p className="font-display text-sm text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs text-foreground-subtle">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function PlanResult({
  plan,
  copied,
  onCopy,
  onDownload,
}: {
  plan: ProjectPlan;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="overflow-hidden rounded-3xl">
        <div className="border-b border-border bg-background-muted/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="live" className="mb-3">
                Execution Brief
              </Badge>
              <h2 className="font-serif text-3xl text-foreground md:text-4xl">{plan.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-muted">
                {plan.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <p className="text-sm leading-6 text-foreground-muted">{plan.positioning}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard icon={Layers3} title="Recommended Stack" items={plan.stack} />
        <SectionCard icon={ListChecks} title="MVP Scope" items={plan.mvp} />
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-accent" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.milestones.map((section) => (
            <div key={section.title} className="rounded-2xl border border-border bg-background-muted/45 p-4">
              <h3 className="font-display text-sm text-foreground">{section.title}</h3>
              <p className="mt-1 text-sm leading-6 text-foreground-muted">{section.detail}</p>
              <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-tesla" />
              Risk Register
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.risks.map((risk) => (
              <div key={risk.title}>
                <h3 className="font-display text-sm text-foreground">{risk.title}</h3>
                <p className="mt-1 text-sm leading-6 text-foreground-muted">{risk.detail}</p>
                <ul className="mt-2 space-y-1 text-xs text-foreground-subtle">
                  {risk.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Launch Copy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-foreground-subtle">
                Headline
              </p>
              <p className="mt-2 font-display text-lg text-foreground">{plan.launchCopy.headline}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-foreground-subtle">Pitch</p>
              <p className="mt-2 text-sm leading-6 text-foreground-muted">{plan.launchCopy.pitch}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-foreground-subtle">
                Demo Script
              </p>
              <ol className="mt-3 space-y-2 text-sm text-foreground-muted">
                {plan.launchCopy.demoScript.map((line, index) => (
                  <li key={line} className="flex gap-3">
                    <span className="font-display text-accent">{index + 1}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionCard icon={Target} title="Next Actions" items={plan.nextActions} />
    </motion.div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  items,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
}) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm text-foreground-muted">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function Signal({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background-muted/50 p-4">
      <Icon className="mb-3 h-5 w-5 text-accent" />
      <p className="font-display text-sm text-foreground">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-foreground-subtle">{label}</p>
    </div>
  );
}
