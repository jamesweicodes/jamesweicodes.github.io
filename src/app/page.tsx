import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";

export default function HomePage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <Experience />
        <Projects />

        {/* Step 4 placeholders */}
        <section id="media" className="scroll-mt-20" aria-hidden="true" />
        <section id="contact" className="scroll-mt-20" aria-hidden="true" />
      </main>
    </>
  );
}
