"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Check,
  Clipboard,
  Compass,
  Database,
  Download,
  FileText,
  Home,
  Loader2,
  MapPin,
  Radar,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createPropertyReport,
  formatCurrency,
  formatNumber,
  PropertyReport,
  PropertySearchInput,
  PropertyStrategy,
  reportToText,
} from "@/lib/property-intelligence";

const STORAGE_KEY = "jw-property-intelligence-reports";
const MAX_HISTORY = 4;

const starterForm: PropertySearchInput = {
  address: "1 Infinite Loop, Cupertino, CA 95014",
  strategy: "investor",
  propertyType: "Single Family",
  bedrooms: "3",
  bathrooms: "2",
  squareFeet: "1850",
  purchasePrice: "$1,850,000",
  monthlyRent: "",
  downPaymentPercent: "25",
  annualRate: "6.75",
  notes: "Check schools, insurance, permits, rental demand, and resale upside.",
};

const sampleProperties: PropertySearchInput[] = [
  starterForm,
  {
    address: "5500 Grand Lake Dr, San Antonio, TX 78244",
    strategy: "buyer",
    propertyType: "Single Family",
    bedrooms: "4",
    bathrooms: "2.5",
    squareFeet: "2400",
    purchasePrice: "$315,000",
    monthlyRent: "$2400",
    downPaymentPercent: "20",
    annualRate: "6.75",
    notes: "Relocation buyer comparing commute, value, and rental fallback.",
  },
  {
    address: "1600 Pennsylvania Ave NW, Washington, DC 20500",
    strategy: "agent",
    propertyType: "Luxury",
    bedrooms: "5",
    bathrooms: "4",
    squareFeet: "5000",
    purchasePrice: "$4,500,000",
    monthlyRent: "",
    downPaymentPercent: "30",
    annualRate: "6.5",
    notes: "Create a premium listing consultation style report.",
  },
];

const strategyLabels: Record<PropertyStrategy, string> = {
  buyer: "Buyer due diligence",
  investor: "Investor underwriting",
  agent: "Agent client report",
  seller: "Seller pricing strategy",
};

export default function PropertyIntelligencePage() {
  const [form, setForm] = useState<PropertySearchInput>(starterForm);
  const [report, setReport] = useState<PropertyReport | null>(null);
  const [history, setHistory] = useState<PropertyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PropertyReport[];
        setHistory(parsed.slice(0, MAX_HISTORY));
        setReport(parsed[0] ?? null);
      }
    } catch {
      setHistory([]);
    }
  }, []);

  const activeSources = useMemo(
    () => report?.dataSources.filter((source) => source.status !== "unavailable").length ?? 0,
    [report]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.address.trim().length < 8) {
      setError("Enter a complete property address with city and state.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextReport = await createPropertyReport({ ...form, address: form.address.trim() });
      const nextHistory = [nextReport, ...history.filter((item) => item.id !== nextReport.id)].slice(
        0,
        MAX_HISTORY
      );

      setReport(nextReport);
      setHistory(nextHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    } catch {
      setError("The property intelligence engine could not complete this search. Try another address.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<K extends keyof PropertySearchInput>(key: K, value: PropertySearchInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function copyReport() {
    if (!report) return;

    await navigator.clipboard.writeText(reportToText(report));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function downloadReport() {
    if (!report) return;

    const blob = new Blob([reportToText(report)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `property-report-${report.location.zipCode || "search"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <div className="film-grain pointer-events-none fixed inset-0 z-50 opacity-25" aria-hidden="true" />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.22),transparent_34%),radial-gradient(circle_at_78%_0%,rgba(227,25,55,0.12),transparent_28%)]"
        aria-hidden="true"
      />

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
            Back to projects
          </Link>
        </div>
      </header>

      <main className="container-main px-6 py-10 md:py-14">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="accent" className="mb-4">
              AI Lab - Property Intelligence
            </Badge>
            <h1 className="max-w-4xl font-serif text-4xl leading-[0.95] text-foreground md:text-6xl">
              Search any property. Get an investor-grade intelligence report.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-foreground-muted md:text-lg">
              A real estate research cockpit for buyers, agents, and investors. It combines live
              public geography lookups, optional property-record enrichment, and deterministic
              underwriting models into a clear decision report.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Signal icon={Database} label="Live public data" value="Census + FCC" />
              <Signal icon={TrendingUp} label="Underwriting" value="Value, rent, DSCR" />
              <Signal icon={ShieldAlert} label="Risk lens" value="Insurance, taxes, docs" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass-panel rounded-3xl p-5"
          >
            <div className="rounded-2xl border border-border bg-background-muted/70 p-5">
              <p className="font-display text-sm uppercase tracking-[0.22em] text-accent">
                Decision output
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <HeroMetric label="Confidence" value={report ? `${report.confidence}%` : "Ready"} />
                <HeroMetric label="Sources" value={report ? String(activeSources) : "4"} />
                <HeroMetric
                  label="Cash flow"
                  value={report ? formatCurrency(report.investment.projectedCashFlow) : "Modeled"}
                />
              </div>
              <p className="mt-5 text-sm leading-6 text-foreground-muted">
                The report separates verified public data from modeled assumptions so users know
                what is factual, inferred, and ready for MLS or disclosure validation.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[400px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-accent" />
                Property search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Full address" required>
                  <input
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    placeholder="Street, city, state, ZIP"
                    className="input-shell"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Use case">
                    <select
                      value={form.strategy}
                      onChange={(event) =>
                        updateField("strategy", event.target.value as PropertyStrategy)
                      }
                      className="input-shell"
                    >
                      {Object.entries(strategyLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Property type">
                    <select
                      value={form.propertyType}
                      onChange={(event) => updateField("propertyType", event.target.value)}
                      className="input-shell"
                    >
                      {["Single Family", "Condo", "Townhouse", "Multi-Family", "Luxury"].map(
                        (option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Beds">
                    <input
                      value={form.bedrooms ?? ""}
                      onChange={(event) => updateField("bedrooms", event.target.value)}
                      className="input-shell"
                      inputMode="decimal"
                    />
                  </Field>
                  <Field label="Baths">
                    <input
                      value={form.bathrooms ?? ""}
                      onChange={(event) => updateField("bathrooms", event.target.value)}
                      className="input-shell"
                      inputMode="decimal"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Square feet">
                    <input
                      value={form.squareFeet ?? ""}
                      onChange={(event) => updateField("squareFeet", event.target.value)}
                      placeholder="1850"
                      className="input-shell"
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="Purchase/list price">
                    <input
                      value={form.purchasePrice ?? ""}
                      onChange={(event) => updateField("purchasePrice", event.target.value)}
                      placeholder="$850,000"
                      className="input-shell"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Field label="Rent">
                    <input
                      value={form.monthlyRent ?? ""}
                      onChange={(event) => updateField("monthlyRent", event.target.value)}
                      placeholder="$3200"
                      className="input-shell"
                    />
                  </Field>
                  <Field label="Down">
                    <input
                      value={form.downPaymentPercent ?? ""}
                      onChange={(event) => updateField("downPaymentPercent", event.target.value)}
                      placeholder="25"
                      className="input-shell"
                      inputMode="decimal"
                    />
                  </Field>
                  <Field label="Rate">
                    <input
                      value={form.annualRate ?? ""}
                      onChange={(event) => updateField("annualRate", event.target.value)}
                      placeholder="6.75"
                      className="input-shell"
                      inputMode="decimal"
                    />
                  </Field>
                </div>

                <Field label="Research priorities">
                  <textarea
                    value={form.notes ?? ""}
                    onChange={(event) => updateField("notes", event.target.value)}
                    rows={3}
                    placeholder="Permits, HOA, schools, rental demand..."
                    className="input-shell resize-none"
                  />
                </Field>

                {error && (
                  <div className="rounded-xl border border-tesla/30 bg-tesla-muted px-4 py-3 text-sm text-tesla">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isLoading ? "Building report..." : "Generate intelligence report"}
                </Button>
              </form>

              <div className="mt-5 border-t border-border pt-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                  Try a sample
                </p>
                <div className="space-y-2">
                  {sampleProperties.map((sample) => (
                    <button
                      key={sample.address}
                      type="button"
                      onClick={() => setForm(sample)}
                      className="block w-full rounded-xl border border-border bg-background-muted/50 px-3 py-2 text-left text-xs text-foreground-muted transition hover:border-accent/40 hover:text-accent"
                    >
                      {sample.address}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {isLoading && <LoadingReport />}
            {!isLoading && report && (
              <>
                <ReportHeader report={report} onCopy={copyReport} onDownload={downloadReport} copied={copied} />
                <MetricGrid report={report} />
                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <SummaryCard report={report} />
                  <RiskCard report={report} />
                </div>
                <CompsCard report={report} />
                <DataSourcesCard report={report} />
              </>
            )}
            {!isLoading && !report && <EmptyState />}
            {history.length > 0 && <History reports={history} onSelect={setReport} />}
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-foreground-muted">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function Signal({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <Icon className="h-5 w-5 text-accent" />
      <p className="mt-3 text-xs uppercase tracking-wider text-foreground-subtle">{label}</p>
      <p className="mt-1 font-display text-sm text-foreground">{value}</p>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-4">
      <p className="text-[10px] uppercase tracking-wider text-foreground-subtle">{label}</p>
      <p className="mt-1 truncate font-display text-lg text-foreground">{value}</p>
    </div>
  );
}

function LoadingReport() {
  const steps = [
    "Resolving address and coordinates",
    "Checking public geography",
    "Modeling value and rent band",
    "Building risk and investment summary",
  ];

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-muted text-accent">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground">Researching the property</h2>
            <p className="text-sm text-foreground-muted">
              Pulling live data where available and marking modeled assumptions clearly.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {steps.map((step) => (
            <div key={step} className="rounded-xl border border-border bg-background-muted/50 p-3 text-sm text-foreground-muted">
              {step}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex min-h-[520px] flex-col items-center justify-center p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent-muted text-accent">
          <Radar className="h-8 w-8" />
        </div>
        <h2 className="mt-5 font-serif text-3xl text-foreground">Ready for property research</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-foreground-muted">
          Enter a full address, add known deal assumptions, and the app will generate a practical
          report for pricing, risk, rent, and next-step diligence.
        </p>
      </CardContent>
    </Card>
  );
}

function ReportHeader({
  report,
  onCopy,
  onDownload,
  copied,
}: {
  report: PropertyReport;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-gradient-to-r from-accent-muted via-background-muted/60 to-transparent p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="live">{strategyLabels[report.query.strategy]}</Badge>
              <Badge variant="accent">{report.confidence}% confidence</Badge>
            </div>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground">
              {report.location.matchedAddress}
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground-muted">
              <MapPin className="h-4 w-4 text-accent" />
              {report.location.county}
              {report.location.censusTract ? ` - Census tract ${report.location.censusTract}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
              <FileText className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <p className="text-sm leading-7 text-foreground-muted">{report.executiveSummary}</p>
      </CardContent>
    </Card>
  );
}

function MetricGrid({ report }: { report: PropertyReport }) {
  const metrics = [
    {
      label: "Value midpoint",
      value: formatCurrency(report.valuation.estimate),
      sub: `${formatCurrency(report.valuation.low)} - ${formatCurrency(report.valuation.high)}`,
      icon: Home,
    },
    {
      label: "Estimated rent",
      value: `${formatCurrency(report.rental.estimate)}/mo`,
      sub: `${formatCurrency(report.rental.low)} - ${formatCurrency(report.rental.high)}`,
      icon: Building2,
    },
    {
      label: "Cap rate",
      value: `${report.investment.capRate.toFixed(2)}%`,
      sub: `${report.investment.dscr.toFixed(2)}x DSCR`,
      icon: BarChart3,
    },
    {
      label: "Cash flow",
      value: `${formatCurrency(report.investment.projectedCashFlow)}/mo`,
      sub: `${formatCurrency(report.investment.monthlyPayment)} debt service`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card key={metric.label}>
            <CardContent className="p-5">
              <Icon className="h-5 w-5 text-accent" />
              <p className="mt-4 text-xs uppercase tracking-wider text-foreground-subtle">
                {metric.label}
              </p>
              <p className="mt-1 font-display text-2xl text-foreground">{metric.value}</p>
              <p className="mt-1 text-xs text-foreground-muted">{metric.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SummaryCard({ report }: { report: PropertyReport }) {
  const facts = [
    ["Type", report.facts.propertyType],
    ["Beds / baths", `${report.facts.bedrooms} / ${report.facts.bathrooms}`],
    ["Interior", `${formatNumber(report.facts.squareFeet)} sq ft`],
    ["Lot", report.facts.lotSize ? `${formatNumber(report.facts.lotSize)} sq ft` : "Needs record check"],
    ["Year built", report.facts.yearBuilt ? String(report.facts.yearBuilt) : "Needs record check"],
    ["Last sale", report.facts.lastSalePrice ? formatCurrency(report.facts.lastSalePrice) : "Needs record check"],
    ["Tax amount", report.facts.taxAmount ? formatCurrency(report.facts.taxAmount) : "Modeled in expenses"],
    ["HOA", report.facts.hoaFee ? `${formatCurrency(report.facts.hoaFee)}/mo` : "Not detected"],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-accent" />
          Property and market read
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-background-muted/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-foreground-subtle">{label}</p>
              <p className="mt-1 text-sm text-foreground">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-border bg-background-muted/40 p-4">
          <p className="font-display text-sm text-foreground">Neighborhood thesis</p>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">{report.neighborhood.profile}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="accent">Demand {report.neighborhood.demandScore}/100</Badge>
            <Badge>{report.neighborhood.liquidity}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskCard({ report }: { report: PropertyReport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-accent" />
          Risk and next action
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {report.risks.map((risk) => (
          <div key={risk.label} className="rounded-xl border border-border bg-background-muted/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-sm text-foreground">{risk.label}</p>
              <RiskBadge level={risk.level} />
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground-muted">{risk.detail}</p>
          </div>
        ))}

        <div className="rounded-2xl border border-accent/20 bg-accent-muted/40 p-4">
          <p className="font-display text-sm text-accent">Recommended next steps</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground-muted">
            {report.nextSteps.slice(0, 4).map((step) => (
              <li key={step} className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const classes = {
    Low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    High: "border-tesla/30 bg-tesla-muted text-tesla",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${classes[level]}`}>
      {level}
    </span>
  );
}

function CompsCard({ report }: { report: PropertyReport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          Comparable value model
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-5 gap-3 border-b border-border bg-background-muted px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle">
            <span>Comparable</span>
            <span>Specs</span>
            <span>Value</span>
            <span>$/sq ft</span>
            <span>Signal</span>
          </div>
          {report.comps.map((comp) => (
            <div
              key={comp.label}
              className="grid grid-cols-5 gap-3 border-b border-border px-4 py-4 text-sm last:border-b-0"
            >
              <span className="text-foreground">
                {comp.label}
                <span className="block text-xs text-foreground-subtle">{comp.distance}</span>
              </span>
              <span className="text-foreground-muted">
                {comp.beds} bd / {comp.baths} ba
                <span className="block text-xs">{formatNumber(comp.squareFeet)} sq ft</span>
              </span>
              <span className="font-display text-foreground">{formatCurrency(comp.estimatedValue)}</span>
              <span className="text-foreground-muted">{formatCurrency(comp.pricePerSquareFoot)}</span>
              <span className="text-foreground-muted capitalize">{comp.signal}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-foreground-subtle">
          These are modeled comp bands when MLS or property-record comparables are not connected.
          Replace with verified MLS sold comps before making an offer or listing recommendation.
        </p>
      </CardContent>
    </Card>
  );
}

function DataSourcesCard({ report }: { report: PropertyReport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-accent" />
          Data source transparency
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {report.dataSources.map((source) => (
          <div key={source.name} className="rounded-xl border border-border bg-background-muted/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-sm text-foreground">{source.name}</p>
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground-subtle">
                {source.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground-muted">{source.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function History({
  reports,
  onSelect,
}: {
  reports: PropertyReport[];
  onSelect: (report: PropertyReport) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent reports</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {reports.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className="rounded-xl border border-border bg-background-muted/40 px-4 py-3 text-left transition hover:border-accent/40"
          >
            <p className="truncate text-sm text-foreground">{item.location.matchedAddress}</p>
            <p className="mt-1 text-xs text-foreground-subtle">
              {formatCurrency(item.valuation.estimate)} value midpoint
            </p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
