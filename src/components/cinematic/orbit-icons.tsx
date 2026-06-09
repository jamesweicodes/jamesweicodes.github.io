"use client";

import { motion } from "framer-motion";
import { Camera, Clapperboard, Code2, Cpu, Film, Zap } from "lucide-react";

const icons = [
  { Icon: Cpu, label: "AI" },
  { Icon: Code2, label: "Code" },
  { Icon: Zap, label: "Automation" },
  { Icon: Film, label: "Film" },
  { Icon: Camera, label: "Camera" },
  { Icon: Clapperboard, label: "Reel" },
];

export default function OrbitIcons() {
  return (
    <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[320px] w-[320px] -translate-y-1/2 lg:block" aria-hidden="true">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="relative h-full w-full"
      >
        {icons.map(({ Icon, label }, i) => {
          const angle = (i / icons.length) * Math.PI * 2;
          const radius = 140;
          const x = Math.cos(angle) * radius + 160;
          const y = Math.sin(angle) * radius + 160;
          return (
            <motion.div
              key={label}
              className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-accent/20 bg-background-elevated/80 text-accent shadow-[0_0_20px_rgba(14,165,233,0.15)] backdrop-blur-md"
              style={{ left: x, top: y }}
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <Icon className="h-4 w-4" />
            </motion.div>
          );
        })}
      </motion.div>
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30 bg-accent/10 shadow-[0_0_40px_rgba(14,165,233,0.3)]" />
    </div>
  );
}
