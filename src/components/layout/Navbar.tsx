"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { navLinks, siteConfig } from "@/lib/site-data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = navLinks.map((l) => l.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = () => setMobileOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-[2px] z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/80 bg-background/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        className="container-main flex h-16 items-center justify-between px-6 md:h-[4.5rem] md:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-foreground transition-colors hover:text-accent"
        >
          JRW<span className="text-accent">.</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-accent"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-accent/10 border border-accent/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-background-muted hover:text-accent"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a
            href="#contact"
            className="ml-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-all hover:border-accent/50 hover:bg-accent/15 hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]"
          >
            Contact
          </a>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-foreground-muted transition-colors hover:text-accent md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-b border-border bg-background/95 backdrop-blur-2xl md:hidden"
          >
            <ul className="container-main flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={handleNavClick}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-foreground-muted hover:bg-background-muted hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => { toggle(); handleNavClick(); }}
                  className="w-full rounded-lg px-3 py-3 text-left text-base text-foreground-muted hover:bg-background-muted"
                >
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={handleNavClick}
                  className="mt-2 block rounded-lg border border-accent/30 bg-accent/10 px-3 py-3 text-center font-medium text-accent"
                >
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only">{siteConfig.location}</span>
    </header>
  );
}
