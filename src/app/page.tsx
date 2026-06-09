import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";

export default function HomePage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />

        {/* Placeholder anchors for nav + CTA — filled in Steps 3 & 4 */}
        <section
          id="experience"
          className="section-padding border-t border-border scroll-mt-20"
          aria-hidden="true"
        />
        <section
          id="projects"
          className="min-h-[40vh] border-t border-border scroll-mt-20"
          aria-label="Projects"
        >
          <div className="container-main px-6 py-24 text-center md:px-8">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Step 3 — Coming Next
            </p>
            <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
              Engineering &amp; AI Projects
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-foreground-subtle">
              Interactive project cards with stack pills and live demo links — built in Step 3.
            </p>
          </div>
        </section>
        <section id="media" className="scroll-mt-20" aria-hidden="true" />
        <section id="contact" className="scroll-mt-20" aria-hidden="true" />
      </main>
    </>
  );
}
