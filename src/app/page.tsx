import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import MediaGallery from "@/components/sections/MediaGallery";
import Contact from "@/components/sections/Contact";
import NexusCopilot from "@/components/nexus/NexusCopilot";

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
        <MediaGallery />
        <Contact />
      </main>

      <NexusCopilot />
    </>
  );
}
