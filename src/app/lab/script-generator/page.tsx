"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  propertyType: z.string(),
  location: z.string().min(2, "Location required"),
  beds: z.string().optional(),
  price: z.string().optional(),
  tone: z.enum(["professional", "casual", "luxury"]),
  highlights: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STORAGE_KEY = "jw-script-generator-v2";
const MAX_HISTORY = 5;

const toneOpeners = {
  professional: ["Presenting", "Now available", "An exceptional opportunity:"],
  casual: ["You're going to love", "Check out this gem", "Just listed:"],
  luxury: ["An exquisite", "Discover unparalleled elegance in", "Experience refined living:"],
};

const toneClosers = {
  professional: "Schedule a private showing to experience this property firsthand.",
  casual: "DM me for a tour — this one won't last long!",
  luxury: "Exclusive showings available by appointment for discerning buyers.",
};

function generateCopy(data: FormData) {
  const opener = toneOpeners[data.tone][Math.floor(Math.random() * 3)];
  const closer = toneClosers[data.tone];
  const highlights = data.highlights
    ?.split(/[,;\n]+/)
    .map((h) => h.trim())
    .filter(Boolean) ?? [];
  const details = [data.beds, data.price ? `Listed at ${data.price}` : null].filter(Boolean).join(" · ");
  const highlightText = highlights.length
    ? "\n\nHighlights: " + highlights.join(", ") + "."
    : "";

  const listing = `${opener} this ${data.propertyType.toLowerCase()} in ${data.location}.${details ? " " + details + "." : ""}${highlightText}\n\n${closer}`;

  const hashtags = ["#RealEstate", "#JustListed", "#HomeForSale"];
  const social = `🏡 JUST LISTED in ${data.location}!\n\n${data.propertyType}${data.beds ? " · " + data.beds : ""}${data.price ? " · " + data.price : ""}\n\n${highlights.slice(0, 3).join(" ✓ ") || "Move-in ready."}\n\n${closer}\n\n${hashtags.join(" ")}`;

  const hook = data.price
    ? `${data.price} in ${data.location}? Here's why buyers are calling. 👀`
    : `New listing: ${data.propertyType} in ${data.location}. Tap for details.`;

  return { listing, social, hook };
}

type Outputs = ReturnType<typeof generateCopy>;

export default function ScriptGeneratorPage() {
  const [outputs, setOutputs] = useState<Outputs | null>(null);
  const [history, setHistory] = useState<Array<FormData & { outputs: Outputs; ts: number }>>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { propertyType: "Single-Family Home", tone: "professional" },
  });

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  const onSubmit = (data: FormData) => {
    const result = generateCopy(data);
    setOutputs(result);
    const entry = { ...data, outputs: result, ts: Date.now() };
    const next = [entry, ...history].slice(0, MAX_HISTORY);
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="film-grain pointer-events-none fixed inset-0 z-50 opacity-30" aria-hidden="true" />
      <header className="border-b border-border bg-background-elevated/80 backdrop-blur-xl">
        <div className="container-main flex h-16 items-center justify-between px-6">
          <Link href="/" className="font-display font-bold tracking-tight hover:text-accent">
            JRW<span className="text-accent">.</span>
          </Link>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lab
          </Link>
        </div>
      </header>

      <main className="container-main px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Badge variant="accent" className="mb-3">
            AI Lab · Live
          </Badge>
          <h1 className="font-serif text-4xl text-foreground md:text-5xl">
            Real Estate Script Generator
          </h1>
          <p className="mt-3 max-w-2xl text-foreground-muted">
            Premium copy engine for listing descriptions, social posts, and short hooks.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="glass-panel space-y-5 rounded-2xl p-6 md:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground-muted">
                  Property Type
                </label>
                <select
                  {...register("propertyType")}
                  className="w-full rounded-xl border border-border bg-background-muted px-4 py-3 text-sm text-foreground focus:border-accent/50 focus:outline-none"
                >
                  {["Single-Family Home", "Condo", "Townhouse", "Luxury Estate", "Multi-Family"].map(
                    (o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground-muted">
                  Location
                </label>
                <input
                  {...register("location")}
                  placeholder="San Jose, CA"
                  className="w-full rounded-xl border border-border bg-background-muted px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent/50 focus:outline-none"
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-tesla">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground-muted">
                  Beds / Baths
                </label>
                <input
                  {...register("beds")}
                  placeholder="4 bed / 3 bath"
                  className="w-full rounded-xl border border-border bg-background-muted px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-foreground-muted">
                  Price
                </label>
                <input
                  {...register("price")}
                  placeholder="$1.2M"
                  className="w-full rounded-xl border border-border bg-background-muted px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-foreground-muted">Tone</label>
              <select
                {...register("tone")}
                className="w-full rounded-xl border border-border bg-background-muted px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual & Friendly</option>
                <option value="luxury">Luxury & Aspirational</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-foreground-muted">
                Key Selling Points
              </label>
              <textarea
                {...register("highlights")}
                rows={3}
                placeholder="Updated kitchen, schools, Caltrain access..."
                className="w-full resize-none rounded-xl border border-border bg-background-muted px-4 py-3 text-sm focus:border-accent/50 focus:outline-none"
              />
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Sparkles className="h-4 w-4" />
              Generate Copy
            </Button>
          </form>

          <div className="space-y-4">
            {outputs ? (
              (["listing", "social", "hook"] as const).map((key) => (
                <OutputBlock
                  key={key}
                  title={
                    key === "listing"
                      ? "Listing Description"
                      : key === "social"
                        ? "Social Post"
                        : "Short Hook"
                  }
                  text={outputs[key]}
                  copied={copied === key}
                  onCopy={() => copy(key, outputs[key])}
                />
              ))
            ) : (
              <div className="glass-panel flex min-h-[300px] items-center justify-center rounded-2xl p-8 text-center text-foreground-subtle">
                Generated copy appears here — structured for listings, social, and reels.
              </div>
            )}

            {history.length > 0 && (
              <div className="glass-panel rounded-2xl p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                  Recent
                </p>
                <div className="space-y-2">
                  {history.map((h) => (
                    <button
                      key={h.ts}
                      type="button"
                      onClick={() => setOutputs(h.outputs)}
                      className="block w-full rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground-muted hover:border-accent/30 hover:text-accent"
                    >
                      {h.propertyType} — {h.location}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function OutputBlock({
  title,
  text,
  copied,
  onCopy,
}: {
  title: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-foreground">{title}</h2>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-accent hover:border-accent/40"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground-muted">{text}</p>
    </div>
  );
}
