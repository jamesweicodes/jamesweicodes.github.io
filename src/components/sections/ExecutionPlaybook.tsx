"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clipboard, Layers3, Sparkles, Zap } from "lucide-react";
import { executionPlaybookContent } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type Mission = (typeof executionPlaybookContent.missions)[number];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

function buildBriefing(mission: Mission) {
  return [
    `${mission.label}: ${mission.headline}`,
    `Signal: ${mission.signal}`,
    `Stack: ${mission.stack.join(", ")}`,
    `Execution: ${mission.phases.map((phase) => `${phase.name} - ${phase.detail}`).join(" ")}`,
    `Yield: ${mission.outcome}`,
  ].join("\n");
}

export default function ExecutionPlaybook() {
  const [activeMissionId, setActiveMissionId] = useState<Mission["id"]>(
    executionPlaybookContent.missions[0].id
  );
  const [copied, setCopied] = useState(false);

  const activeMission = useMemo(
    () =>
      executionPlaybookContent.missions.find((mission) => mission.id === activeMissionId) ??
      executionPlaybookContent.missions[0],
    [activeMissionId]
  );

  const briefing = useMemo(() => buildBriefing(activeMission), [activeMission]);

  const copyBriefing = async () => {
    try {
      await navigator.clipboard.writeText(briefing);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="playbook"
      className="section-padding scroll-mt-20 overflow-hidden border-t border-border bg-background/80"
      aria-labelledby="playbook-title"
    >
      <div className="container-main px-6 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-28"
          >
            <p className="section-label">{executionPlaybookContent.eyebrow}</p>
            <h2 id="playbook-title" className="font-serif text-3xl text-foreground md:text-5xl">
              {executionPlaybookContent.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground-muted">
              {executionPlaybookContent.description}
            </p>

            <div className="mt-8 grid gap-3">
              {executionPlaybookContent.missions.map((mission) => {
                const isActive = mission.id === activeMission.id;

                return (
                  <button
                    key={mission.id}
                    type="button"
                    onClick={() => {
                      setActiveMissionId(mission.id);
                      setCopied(false);
                    }}
                    aria-pressed={isActive}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all",
                      isActive
                        ? "border-accent/40 bg-accent-muted shadow-[0_0_36px_rgba(14,165,233,0.14)]"
                        : "border-border bg-background-muted/40 hover:border-border-hover hover:bg-background-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "mb-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                        isActive
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-border text-foreground-subtle"
                      )}
                    >
                      {mission.label}
                    </span>
                    <span className="block font-display text-lg font-semibold text-foreground">
                      {mission.headline}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-foreground-muted">
                      {mission.context}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="playbook-active-glow"
                        className="pointer-events-none absolute inset-y-0 right-0 w-1 bg-accent"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-5"
          >
            <motion.div
              variants={cardVariants}
              className="gradient-border relative overflow-hidden rounded-3xl p-6 md:p-8"
            >
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
              />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-muted px-3 py-1 text-xs font-medium text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                    Live mission builder
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="font-display text-sm uppercase tracking-[0.18em] text-foreground-subtle">
                        {activeMission.metric} operating mode
                      </p>
                      <h3 className="mt-2 font-serif text-3xl text-foreground md:text-4xl">
                        {activeMission.headline}
                      </h3>
                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground-muted">
                        {activeMission.signal}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={copyBriefing}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-all hover:border-accent/50 hover:bg-accent/15"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy brief"}
                </button>
              </div>

              <div className="relative mt-7 flex flex-wrap gap-2">
                {activeMission.stack.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-border bg-background-muted/70 px-3 py-1 text-xs text-foreground-muted"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-5 md:grid-cols-3">
              {activeMission.phases.map((phase, index) => (
                <motion.article
                  key={`${activeMission.id}-${phase.name}`}
                  variants={cardVariants}
                  layout
                  className="glass-panel rounded-2xl p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted text-accent">
                      {index + 1}
                    </span>
                    <Zap className="h-4 w-4 text-foreground-subtle" />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-foreground">{phase.name}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{phase.detail}</p>
                </motion.article>
              ))}
            </div>

            <motion.div
              variants={cardVariants}
              className="glass-panel rounded-3xl p-6 md:p-8"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    <Layers3 className="h-4 w-4" />
                    Yield
                  </div>
                  <p className="font-serif text-2xl leading-snug text-foreground">
                    {activeMission.outcome}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background-muted/60 p-4 md:w-56">
                  <p className="font-display text-3xl text-accent">3</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-foreground-subtle">
                    Phase loop
                  </p>
                  <p className="mt-3 text-sm text-foreground-muted">
                    Frame the work, systemize the execution, then prove the outcome.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
