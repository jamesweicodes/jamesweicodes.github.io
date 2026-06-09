import Link from "next/link";
import { Github, Linkedin, Mail, Youtube } from "lucide-react";
import { contactContent, siteConfig } from "@/lib/site-data";

const socialLinks = [
  {
    label: "LinkedIn",
    href: siteConfig.links.linkedin,
    icon: Linkedin,
  },
  {
    label: "GitHub",
    href: siteConfig.links.github,
    icon: Github,
  },
  {
    label: "YouTube",
    href: siteConfig.links.youtube,
    icon: Youtube,
  },
  {
    label: "Email",
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
] as const;

export default function Contact() {
  return (
    <footer
      id="contact"
      className="scroll-mt-20 border-t border-border bg-black"
      aria-label="Contact"
    >
      <div className="container-main section-padding px-6 md:px-8 !py-20">
        <div className="gradient-border relative rounded-2xl p-8 md:p-12">
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-md">
              <p className="section-label">Contact</p>
              <h2 className="font-serif text-3xl text-foreground md:text-4xl">
                Let&apos;s build something durable.
              </h2>
              <p className="mt-4 text-foreground-muted">
                Open to program management, AI integration, and full-stack
                collaboration — {siteConfig.location}.
              </p>
              <div className="mt-6 space-y-1 text-sm text-foreground-subtle">
                <p>{contactContent.education}</p>
                <p>{contactContent.certifications}</p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-display text-xl text-accent transition-colors hover:text-accent-hover md:text-2xl"
              >
                {siteConfig.email}
              </a>

              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background-muted px-4 py-3 text-sm text-foreground-muted transition-all hover:border-border-hover hover:text-accent"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center md:flex-row md:text-left">
          <p className="font-display text-sm font-semibold tracking-tight text-foreground">
            {siteConfig.name}
            <span className="text-foreground-subtle"> — {siteConfig.tagline}</span>
          </p>
          <p className="text-xs text-foreground-subtle">{contactContent.offScreen}</p>
        </div>

        <p className="mt-6 text-center text-xs text-foreground-subtle/60">
          © {new Date().getFullYear()} James Wei ·{" "}
          <Link href="/" className="hover:text-accent">
            jameswei.me
          </Link>
        </p>
      </div>
    </footer>
  );
}
