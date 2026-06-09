"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, Github } from "lucide-react";
import { projectsContent, techStack } from "@/lib/site-data";

const statusConfig = {
  live: {
    label: "Live Demo",
    className: "border-accent/30 bg-accent-muted text-accent",
  },
  blueprint: {
    label: "Blueprint",
    className: "border-border bg-background-muted text-foreground-subtle",
  },
  pipeline: {
    label: "Pipeline",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
} as const;

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const card = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function Projects() {
  return (
    <section
      id="projects"
      className="section-padding scroll-mt-20 border-t border-border bg-background-elevated/30"
      aria-label="Engineering and AI Projects"
    >
      <div className="container-main px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <p className="section-label">Engineering &amp; AI</p>
            <h2 className="font-serif text-3xl text-foreground md:text-5xl">
              Full-Stack Blueprints &amp;{" "}
              <span className="text-gradient-accent">Vibe Coding</span>
            </h2>
            <p className="mt-4 text-foreground-muted">
              Application architectures, automation pipelines, and AI-integrated tools
              — built with a CS foundation and modern AI-native workflows.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
            {techStack.slice(0, 5).map((tool) => (
              <span
                key={tool}
                className="rounded-full border border-border bg-background-muted px-3 py-1 text-xs text-foreground-subtle"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 lg:grid-cols-3"
        >
          {projectsContent.map((project) => {
            const status = statusConfig[project.status];
            const isFeatured = project.status === "live";

            return (
              <motion.article
                key={project.id}
                variants={card}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`glass-panel group relative flex flex-col overflow-hidden rounded-2xl ${
                  isFeatured ? "lg:col-span-2 lg:flex-row" : ""
                }`}
              >
                {isFeatured && (
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent"
                    aria-hidden="true"
                  />
                )}

                <div className={`relative flex flex-1 flex-col p-6 md:p-8 ${isFeatured ? "lg:max-w-[60%]" : ""}`}>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${status.className}`}
                    >
                      {status.label}
                    </span>
                    {project.href && (
                      <a
                        href={project.href}
                        className="rounded-lg p-1.5 text-foreground-subtle transition-colors hover:bg-accent-muted hover:text-accent"
                        aria-label={`Open ${project.title} demo`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <h3 className="font-display text-xl font-semibold text-foreground md:text-2xl">
                    {project.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground-muted">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-accent/15 bg-accent-muted/50 px-2.5 py-1 text-[11px] font-medium text-accent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
                    {project.href ? (
                      <a
                        href={project.href}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                      >
                        Live Demo
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    ) : (
                      <span className="text-sm text-foreground-subtle">
                        {project.status === "blueprint" ? "Architecture phase" : "In development"}
                      </span>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-foreground-subtle transition-colors hover:text-foreground"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>

                {isFeatured && (
                  <div className="relative hidden min-h-[200px] flex-1 items-center justify-center border-t border-border bg-background-muted/50 p-8 lg:flex lg:border-l lg:border-t-0">
                    <div className="text-center">
                      <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
                        Try It Now
                      </p>
                      <p className="mt-2 font-serif text-2xl text-foreground">
                        Generate listing copy in seconds
                      </p>
                      <a
                        href={project.href!}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
                      >
                        Launch Generator
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
