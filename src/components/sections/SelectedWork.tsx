"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { projectsContent } from "@/lib/site-data";

const filters = [
  { id: "all", label: "All Work" },
  { id: "pm", label: "Program Management" },
  { id: "ai", label: "AI & Engineering" },
  { id: "film", label: "Film & Content" },
] as const;

type FilterId = (typeof filters)[number]["id"];

const workItems = [
  {
    id: "tesla",
    filter: "pm" as const,
    title: "Tesla Financial Services",
    result: "AR reduction via behavioral analytics + systemized collections platform",
    metric: "Enterprise scale",
  },
  {
    id: "real-estate",
    filter: "ai" as const,
    title: "Real Estate Script Generator",
    result: "Live AI copy tool for listing + social post generation",
    metric: "Live demo",
    href: "/lab/script-generator/",
  },
  {
    id: "market-insights",
    filter: "ai" as const,
    title: "Market Insights Pipeline",
    result: "Automated news scrape → script generation for YouTube/TikTok",
    metric: "Pipeline",
  },
  {
    id: "wealth-engine",
    filter: "film" as const,
    title: "Wealth Engine Media",
    result: "Commercial cinematography on Sony a7 IV + DJI Osmo Pocket 3",
    metric: "Brand film",
  },
];

export default function SelectedWork() {
  const [active, setActive] = useState<FilterId>("all");

  const filtered =
    active === "all" ? workItems : workItems.filter((w) => w.filter === active);

  return (
    <section className="section-padding border-t border-border bg-background-elevated/20">
      <div className="container-main px-6 md:px-8">
        <p className="section-label">Selected Work</p>
        <h2 className="font-serif text-3xl text-foreground md:text-4xl">
          Proof of Execution
        </h2>

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActive(f.id)}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                active === f.id
                  ? "border-accent/40 bg-accent/15 text-accent shadow-[0_0_20px_rgba(14,165,233,0.15)]"
                  : "border-border text-foreground-subtle hover:border-border-hover hover:text-foreground-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <motion.div layout className="mt-8 grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    className="glass-panel group block rounded-2xl p-6 hover:border-accent/30"
                  >
                    <WorkCardContent item={item} />
                  </a>
                ) : (
                  <div className="glass-panel rounded-2xl p-6">
                    <WorkCardContent item={item} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <p className="mt-6 text-center text-xs text-foreground-subtle">
          {projectsContent.length} active builds · Filter by discipline
        </p>
      </div>
    </section>
  );
}

function WorkCardContent({
  item,
}: {
  item: (typeof workItems)[number];
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display font-semibold text-foreground group-hover:text-accent">
          {item.title}
        </h3>
        <Badge variant={item.filter === "pm" ? "tesla" : item.filter === "ai" ? "accent" : "default"}>
          {item.metric}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-foreground-muted">{item.result}</p>
    </>
  );
}
