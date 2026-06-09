"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ChevronDown, ShieldCheck, BarChart3, Wallet } from "lucide-react";
import Counter from "@/components/cinematic/counter";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, item as itemVariant } from "@/lib/animations";
import { experienceContent } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const bentoItems = [
  {
    id: "ar",
    icon: Wallet,
    title: "Accounts Receivable",
    description:
      "Streamlined AR processes and captive customer portfolio operations — replacing manual workflows with systemized execution at scale.",
    accent: "tesla" as const,
    tags: ["AR Optimization", "Captive Portfolios"],
  },
  {
    id: "reporting",
    icon: BarChart3,
    title: "Reporting & Analytics",
    description:
      "Built centralized operational reporting and partnered with data science on behavioral analytics driving measurable outcomes.",
    accent: "accent" as const,
    tags: ["Reporting", "Data Science"],
  },
  {
    id: "compliance",
    icon: ShieldCheck,
    title: "Compliance",
    description:
      "Translated regulatory requirements into structured execution plans across leasing, collections, and financial platforms.",
    accent: "accent" as const,
    tags: ["Compliance", "Regulatory"],
  },
  {
    id: "platform",
    icon: Building2,
    title: "Platform Delivery",
    description:
      "Led collections work management platform and customer-facing payment features across Software, Data, and Operations.",
    accent: "tesla" as const,
    tags: ["Platform", "Payments"],
  },
];

const categoryFilters = ["All", "AR Optimization", "Compliance", "Reporting", "Platform"];

const metrics = [
  { value: 4, suffix: "+", label: "Years at Tesla" },
  { value: 3, suffix: "", label: "Role Progressions" },
  { value: 35, suffix: "%", label: "AR Impact Target", prefix: "~" },
  { value: 100, suffix: "+", label: "Programs Shipped", prefix: "" },
];

export default function Experience() {
  const [filter, setFilter] = useState("All");
  const [expandedRole, setExpandedRole] = useState<number | null>(0);

  const filteredBento =
    filter === "All"
      ? bentoItems
      : bentoItems.filter((b) => b.tags.some((t) => t.includes(filter.split(" ")[0])));

  return (
    <section
      id="experience"
      className="section-padding scroll-mt-24 border-t border-border"
      aria-label="Professional Experience"
    >
      <div className="container-main px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12 max-w-2xl"
        >
          <p className="section-label">Professional Experience</p>
          <h2 className="font-serif text-3xl text-foreground md:text-5xl">
            Corporate Scale at{" "}
            <span className="text-tesla">{experienceContent.company}</span>
          </h2>
          <p className="mt-4 text-foreground-muted">
            {experienceContent.division} — program delivery across platform, data,
            compliance, and captive portfolio operations.
          </p>
        </motion.div>

        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((m) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel rounded-2xl p-5 text-center"
            >
              <p className="font-display text-3xl font-bold text-accent md:text-4xl">
                <Counter value={m.value} suffix={m.suffix} prefix={m.prefix ?? ""} />
              </p>
              <p className="mt-1 text-xs text-foreground-subtle">{m.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                filter === cat
                  ? "border-tesla/40 bg-tesla-muted text-tesla"
                  : "border-border text-foreground-subtle hover:border-border-hover"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <AnimatePresence mode="popLayout">
            {filteredBento.map((box) => {
              const Icon = box.icon;
              const isTesla = box.accent === "tesla";
              return (
                <motion.div
                  key={box.id}
                  layout
                  variants={itemVariant}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={cn(
                    "glass-panel group rounded-2xl p-6",
                    isTesla ? "hover:border-tesla/30 hover:shadow-[0_0_30px_rgba(227,25,55,0.08)]" : "hover:border-accent/30"
                  )}
                >
                  <div
                    className={cn(
                      "mb-4 inline-flex rounded-xl p-2.5",
                      isTesla ? "bg-tesla-muted text-tesla" : "bg-accent-muted text-accent"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{box.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-subtle">{box.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {box.tags.map((t) => (
                      <Badge key={t} variant={isTesla ? "tesla" : "accent"}>
                        {t}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <div className="timeline">
          {experienceContent.roles.map((role, index) => {
            const isOpen = expandedRole === index;
            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="timeline-item"
              >
                <div className="glass-panel ml-2 overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setExpandedRole(isOpen ? null : index)}
                    className="flex w-full items-start justify-between gap-4 p-6 text-left md:p-8"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-foreground md:text-xl">{role.title}</h3>
                      <p className="mt-1 text-sm font-medium text-tesla">{experienceContent.company}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 rounded-full border border-border bg-background-muted px-3 py-1 font-mono text-xs text-foreground-subtle">
                        {role.period}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-foreground-subtle transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <ul className="space-y-2.5 border-t border-border px-6 pb-6 pt-4 md:px-8 md:pb-8">
                          {role.highlights.map((highlight) => (
                            <li
                              key={highlight}
                              className="flex gap-3 text-sm leading-relaxed text-foreground-muted"
                            >
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
