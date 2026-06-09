"use client";

import { motion } from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import GeometricBackground from "@/components/ui/GeometricBackground";
import { heroContent, siteConfig } from "@/lib/site-data";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.12,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-16"
      aria-label="Introduction"
    >
      <GeometricBackground />

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/20 to-background"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 top-1/4 z-[1] h-[480px] w-[480px] rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-main relative z-10 px-6 md:px-8">
        <div className="mx-auto max-w-4xl text-center lg:text-left">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-elevated/60 px-3 py-1 text-xs font-medium text-foreground-muted backdrop-blur-sm">
              <MapPin className="h-3 w-3 text-accent" aria-hidden="true" />
              {siteConfig.location}
            </span>
            <span className="rounded-full border border-accent/20 bg-accent-muted px-3 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em] text-accent">
              {siteConfig.theme}
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-serif text-[2.75rem] leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {heroContent.headline}
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-5 font-display text-lg font-medium text-foreground-muted sm:text-xl md:text-2xl"
          >
            {heroContent.subheadline}
          </motion.p>

          <motion.p
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground-subtle lg:mx-0"
          >
            {heroContent.themeLine}
          </motion.p>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <a
              href={heroContent.cta.href}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-background shadow-[0_0_32px_rgba(14,165,233,0.35)] transition-all hover:bg-accent-hover hover:shadow-[0_0_48px_rgba(14,165,233,0.5)]"
            >
              {heroContent.cta.label}
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
            <a
              href="#experience"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background-elevated/50 px-8 py-3.5 text-sm font-medium text-foreground-muted backdrop-blur-sm transition-all hover:border-border-hover hover:text-accent"
            >
              Tesla Experience
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 md:block"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2 text-foreground-subtle">
          <span className="font-display text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-8 w-px bg-gradient-to-b from-accent/60 to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
}
