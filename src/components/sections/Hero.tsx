"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download, MapPin, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrbitIcons from "@/components/cinematic/orbit-icons";
import Typewriter from "@/components/cinematic/typewriter";
import { fadeUp } from "@/lib/animations";
import { heroContent, siteConfig } from "@/lib/site-data";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-16"
      aria-label="Introduction"
    >
      {/* Cinematic video / motion background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="hero-mesh absolute inset-0" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23050508' width='1920' height='1080'/%3E%3C/svg%3E"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-digital-lines-moving-background-4761/1080p.mp4"
            type="video/mp4"
          />
        </video>
        <div className="film-grain absolute inset-0" />
        <div className="lens-flare absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>

      <OrbitIcons />

      <div className="container-main relative z-10 px-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 flex flex-wrap items-center gap-3"
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
            className="font-serif text-[2.75rem] leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            {heroContent.headline}
          </motion.h1>

          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-5 font-display text-xl font-medium text-accent sm:text-2xl md:text-3xl"
          >
            <Typewriter
              phrases={[
                "The Era of Implementation",
                "Program Manager. AI Builder. Cinematographer.",
                "Problem → Execution → Yield",
              ]}
            />
          </motion.div>

          <motion.p
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-6 max-w-2xl text-base leading-relaxed text-foreground-subtle md:text-lg"
          >
            {heroContent.themeLine}
          </motion.p>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild size="lg">
              <a href={heroContent.cta.href}>
                {heroContent.cta.label}
                <ArrowDown className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#media">
                <Play className="h-4 w-4" />
                View Reel
              </a>
            </Button>
            <Button variant="magnetic" size="lg" asChild>
              <a
                href="https://www.linkedin.com/in/jamesweicodes/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
                Connect on LinkedIn
              </a>
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2 text-foreground-subtle">
          <span className="font-display text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-10 w-px bg-gradient-to-b from-accent via-accent/50 to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
}
