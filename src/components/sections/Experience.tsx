"use client";

import { motion } from "framer-motion";
import { Building2, ShieldCheck, BarChart3, Wallet } from "lucide-react";
import { experienceContent } from "@/lib/site-data";

const bentoItems = [
  {
    icon: Wallet,
    title: "Accounts Receivable",
    description:
      "Streamlined AR processes and captive customer portfolio operations — replacing manual workflows with systemized execution at scale.",
    accent: "tesla" as const,
  },
  {
    icon: BarChart3,
    title: "Reporting & Analytics",
    description:
      "Built centralized operational reporting and partnered with data science on behavioral analytics driving measurable outcomes.",
    accent: "accent" as const,
  },
  {
    icon: ShieldCheck,
    title: "Compliance",
    description:
      "Translated regulatory requirements into structured execution plans across leasing, collections, and financial platforms.",
    accent: "accent" as const,
  },
  {
    icon: Building2,
    title: "Platform Delivery",
    description:
      "Led collections work management platform and customer-facing payment features across Software, Data, and Operations.",
    accent: "tesla" as const,
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function Experience() {
  return (
    <section
      id="experience"
      className="section-padding scroll-mt-20 border-t border-border"
      aria-label="Professional Experience"
    >
      <div className="container-main px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
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

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {bentoItems.map((box) => {
            const Icon = box.icon;
            const isTesla = box.accent === "tesla";
            return (
              <motion.div
                key={box.title}
                variants={item}
                className={`glass-panel group rounded-2xl p-6 transition-colors ${
                  isTesla
                    ? "hover:border-tesla/30 hover:bg-tesla-muted/30"
                    : "hover:border-border-hover"
                } ${box.title === "Accounts Receivable" ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div
                  className={`mb-4 inline-flex rounded-xl p-2.5 ${
                    isTesla ? "bg-tesla-muted text-tesla" : "bg-accent-muted text-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {box.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-subtle">
                  {box.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="timeline"
        >
          {experienceContent.roles.map((role, index) => (
            <motion.div key={role.title} variants={item} className="timeline-item">
              <div className="glass-panel ml-2 rounded-2xl p-6 md:p-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground md:text-xl">
                      {role.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-tesla">
                      {experienceContent.company}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-border bg-background-muted px-3 py-1 font-mono text-xs text-foreground-subtle">
                    {role.period}
                  </span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {role.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-3 text-sm leading-relaxed text-foreground-muted"
                    >
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                        aria-hidden="true"
                      />
                      {highlight}
                    </li>
                  ))}
                </ul>
                {index === 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["AR Optimization", "Compliance", "Captive Portfolios", "Reporting"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-tesla/20 bg-tesla-muted px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-tesla"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
