"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Clapperboard, Play, Video, X } from "lucide-react";
import { mediaContent } from "@/lib/site-data";

const aspectClasses: Record<string, string> = {
  "16/9": "aspect-video",
  "9/16": "aspect-[9/16]",
  "4/5": "aspect-[4/5]",
};

const gradients = [
  "from-slate-800 via-slate-900 to-black",
  "from-sky-950 via-slate-900 to-black",
  "from-red-950/40 via-slate-900 to-black",
  "from-indigo-950 via-slate-900 to-black",
  "from-zinc-800 via-slate-900 to-black",
  "from-cyan-950/50 via-slate-900 to-black",
];

export default function MediaGallery() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeItem = mediaContent.gallery.find((g) => g.id === activeId);

  return (
    <section
      id="media"
      className="section-padding scroll-mt-20 border-t border-border"
      aria-label="Videography and Content Creation"
    >
      <div className="container-main px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="section-label">Videography &amp; Content</p>
            <h2 className="font-serif text-3xl text-foreground md:text-5xl">
              Premium Visual Storytelling
            </h2>
            <p className="mt-4 text-foreground-muted">
              Professional cinematography for Wealth Engine and finance-focused
              content for Market Insights — shot to feel like a creative agency reel.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {mediaContent.gear.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-muted px-3 py-1.5 text-xs text-foreground-muted"
              >
                <Camera className="h-3 w-3 text-accent" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {mediaContent.ventures.map((venture) => (
            <motion.div
              key={venture.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="mb-3 inline-flex rounded-xl bg-accent-muted p-2 text-accent">
                {venture.id === "wealth-engine" ? (
                  <Clapperboard className="h-5 w-5" />
                ) : (
                  <Video className="h-5 w-5" />
                )}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {venture.title}
              </h3>
              <p className="mt-1 text-sm text-foreground-subtle">{venture.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {venture.platforms.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-foreground-muted"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          className="masonry-grid"
        >
          {mediaContent.gallery.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveId(item.id)}
              className={`masonry-item group relative overflow-hidden rounded-2xl border border-border text-left ${aspectClasses[item.aspect] ?? "aspect-video"}`}
              aria-label={`Preview ${item.title}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]}`}
              />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
              <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-5">
                <span className="self-start rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                  {item.type}
                </span>
                <div>
                  <p className="font-display text-sm font-medium text-white md:text-base">
                    {item.title}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                      <Play className="h-3.5 w-3.5 fill-white text-white" />
                    </span>
                    View reel
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setActiveId(null)}
            role="dialog"
            aria-modal="true"
            aria-label={activeItem.title}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-background-elevated"
            >
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="absolute right-4 top-4 z-10 rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-black flex items-center justify-center">
                <div className="text-center px-6">
                  <Play className="mx-auto h-12 w-12 text-accent opacity-80" />
                  <p className="mt-4 font-display text-lg text-foreground">{activeItem.title}</p>
                  <p className="mt-2 text-sm text-foreground-subtle">
                    Reel placeholder — replace with embedded video URL in production.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
