import { siteConfig, heroContent } from "@/lib/site-data";

export default function HomePage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <main id="main" className="relative min-h-screen">
        {/* Step 1 scaffold preview — design system smoke test */}
        <section className="section-padding flex min-h-screen flex-col items-center justify-center text-center">
          <div className="container-main">
            <p className="mb-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {siteConfig.theme}
            </p>
            <h1 className="font-serif text-5xl tracking-tight text-foreground md:text-7xl">
              {heroContent.headline}
            </h1>
            <p className="mt-4 text-lg text-foreground-muted md:text-xl">
              {heroContent.subheadline}
            </p>
            <p className="mx-auto mt-6 max-w-xl text-sm text-foreground-subtle">
              Step 1 complete — project scaffold, design tokens, and content model
              are ready. Awaiting approval to build Hero &amp; Navigation (Step 2).
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {["#050508", "#0ea5e9", "#e31937", "#f8fafc"].map((color) => (
                <div
                  key={color}
                  className="glass-panel flex h-16 w-16 items-center justify-center rounded-xl text-[10px] text-foreground-subtle"
                  style={{ borderColor: color === "#050508" ? undefined : color }}
                >
                  <div
                    className="h-8 w-8 rounded-lg"
                    style={{ backgroundColor: color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
