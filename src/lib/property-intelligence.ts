export type PropertyStrategy = "buyer" | "investor" | "agent" | "seller";

export type PropertySearchInput = {
  address: string;
  strategy: PropertyStrategy;
  propertyType: string;
  bedrooms?: string;
  bathrooms?: string;
  squareFeet?: string;
  purchasePrice?: string;
  monthlyRent?: string;
  downPaymentPercent?: string;
  annualRate?: string;
  notes?: string;
};

export type DataSourceStatus = "verified" | "optional" | "modeled" | "unavailable";

export type DataSource = {
  name: string;
  status: DataSourceStatus;
  detail: string;
};

export type ComparableProperty = {
  label: string;
  distance: string;
  beds: number;
  baths: number;
  squareFeet: number;
  estimatedValue: number;
  pricePerSquareFoot: number;
  signal: "below" | "aligned" | "above";
};

export type RiskItem = {
  label: string;
  level: "Low" | "Medium" | "High";
  detail: string;
};

export type PropertyReport = {
  id: string;
  generatedAt: string;
  query: PropertySearchInput;
  confidence: number;
  location: {
    inputAddress: string;
    matchedAddress: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
    latitude?: number;
    longitude?: number;
    censusTract?: string;
    censusBlock?: string;
  };
  facts: {
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    lotSize?: number;
    yearBuilt?: number;
    lastSalePrice?: number;
    lastSaleDate?: string;
    assessedValue?: number;
    taxAmount?: number;
    hoaFee?: number;
  };
  valuation: {
    low: number;
    estimate: number;
    high: number;
    pricePerSquareFoot: number;
    positioning: string;
  };
  rental: {
    estimate: number;
    low: number;
    high: number;
    rentPerSquareFoot: number;
    positioning: string;
  };
  investment: {
    purchasePrice: number;
    downPayment: number;
    monthlyPayment: number;
    estimatedExpenses: number;
    projectedCashFlow: number;
    capRate: number;
    cashOnCash: number;
    dscr: number;
  };
  neighborhood: {
    profile: string;
    demandScore: number;
    liquidity: string;
    buyerPersona: string;
    marketSignals: string[];
  };
  risks: RiskItem[];
  comps: ComparableProperty[];
  dataSources: DataSource[];
  executiveSummary: string;
  nextSteps: string[];
};

type CensusMatch = {
  matchedAddress?: string;
  coordinates?: { x?: number; y?: number };
  addressComponents?: {
    city?: string;
    state?: string;
    zip?: string;
  };
  geographies?: Record<string, Array<Record<string, string>>>;
};

type FccArea = {
  results?: Array<{
    block_fips?: string;
    county_name?: string;
    county_fips?: string;
    state_code?: string;
  }>;
};

type RentCastRecord = {
  formattedAddress?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  hoa?: { fee?: number };
  hoaFee?: number;
  taxAssessments?: Record<string, { value?: number; total?: number }>;
  propertyTaxes?: Record<string, { total?: number }>;
};

type MarketProfile = {
  states: string[];
  pricePerSquareFoot: number;
  rentPerBedroom: number;
  rentPerSquareFoot: number;
  demandScore: number;
  liquidity: string;
  profile: string;
  buyerPersona: string;
};

const DEFAULT_MARKET: MarketProfile = {
  states: [],
  pricePerSquareFoot: 310,
  rentPerBedroom: 760,
  rentPerSquareFoot: 1.65,
  demandScore: 72,
  liquidity: "Balanced",
  profile: "Balanced residential market with demand driven by affordability, commute access, and local inventory.",
  buyerPersona: "Move-up buyers, relocating households, and long-term rental investors.",
};

const MARKET_PROFILES: MarketProfile[] = [
  {
    states: ["CA"],
    pricePerSquareFoot: 715,
    rentPerBedroom: 1425,
    rentPerSquareFoot: 3.45,
    demandScore: 86,
    liquidity: "Fast moving",
    profile: "High-cost coastal market where location, schools, commute access, and inventory scarcity carry pricing power.",
    buyerPersona: "Tech professionals, equity-rich move-up buyers, and investors underwriting long-term appreciation.",
  },
  {
    states: ["WA", "OR"],
    pricePerSquareFoot: 465,
    rentPerBedroom: 1050,
    rentPerSquareFoot: 2.55,
    demandScore: 79,
    liquidity: "Competitive",
    profile: "Pacific Northwest market with strong lifestyle demand and sensitivity to commute and employment corridors.",
    buyerPersona: "Remote professionals, families seeking school quality, and cash-flow disciplined investors.",
  },
  {
    states: ["TX"],
    pricePerSquareFoot: 245,
    rentPerBedroom: 820,
    rentPerSquareFoot: 1.75,
    demandScore: 77,
    liquidity: "Active",
    profile: "Growth market with strong migration, job creation, and comparatively favorable cost per square foot.",
    buyerPersona: "Relocation buyers, first-time homeowners, and build-to-rent investors.",
  },
  {
    states: ["FL"],
    pricePerSquareFoot: 330,
    rentPerBedroom: 980,
    rentPerSquareFoot: 2.05,
    demandScore: 78,
    liquidity: "Active",
    profile: "Lifestyle and tax-driven market where insurance, flood exposure, and HOA economics matter materially.",
    buyerPersona: "Lifestyle movers, retirees, short-term rental operators, and second-home buyers.",
  },
  {
    states: ["NY", "NJ", "MA", "CT"],
    pricePerSquareFoot: 510,
    rentPerBedroom: 1225,
    rentPerSquareFoot: 3.1,
    demandScore: 80,
    liquidity: "Supply constrained",
    profile: "Northeast market with dense employment access, older housing stock, and wide neighborhood-level variance.",
    buyerPersona: "Commuter households, urban professionals, and value-add investors watching taxes closely.",
  },
  {
    states: ["AZ", "NV", "CO", "UT"],
    pricePerSquareFoot: 365,
    rentPerBedroom: 930,
    rentPerSquareFoot: 2.05,
    demandScore: 76,
    liquidity: "Cyclical growth",
    profile: "Sunbelt and mountain growth market with strong lifestyle demand and sensitivity to rates and insurance costs.",
    buyerPersona: "Relocation buyers, outdoors-focused households, and rental investors.",
  },
  {
    states: ["GA", "NC", "SC", "TN"],
    pricePerSquareFoot: 235,
    rentPerBedroom: 760,
    rentPerSquareFoot: 1.6,
    demandScore: 74,
    liquidity: "Steady",
    profile: "Southeast growth market supported by affordability, jobs, universities, and interstate migration.",
    buyerPersona: "First-time buyers, relocating families, and cash-flow focused landlords.",
  },
  {
    states: ["IL", "OH", "MI", "PA", "WI", "MN"],
    pricePerSquareFoot: 205,
    rentPerBedroom: 690,
    rentPerSquareFoot: 1.45,
    demandScore: 67,
    liquidity: "Price sensitive",
    profile: "Midwest market where taxes, condition, school district, and employment nodes dominate valuation.",
    buyerPersona: "Payment-sensitive owner occupants, local move-up buyers, and yield-focused investors.",
  },
];

const PROPERTY_TYPE_MULTIPLIER: Record<string, number> = {
  condo: 0.86,
  townhouse: 0.94,
  "single family": 1,
  multifamily: 0.9,
  "multi-family": 0.9,
  luxury: 1.32,
  land: 0.55,
};

const FALLBACK_ADDRESSES: Record<string, Partial<PropertyReport["location"]>> = {
  "1 infinite loop cupertino ca": {
    matchedAddress: "1 Infinite Loop, Cupertino, CA 95014",
    city: "Cupertino",
    state: "CA",
    zipCode: "95014",
    county: "Santa Clara County",
    latitude: 37.3317,
    longitude: -122.0301,
  },
  "1600 pennsylvania ave washington dc": {
    matchedAddress: "1600 Pennsylvania Ave NW, Washington, DC 20500",
    city: "Washington",
    state: "DC",
    zipCode: "20500",
    county: "District of Columbia",
    latitude: 38.8977,
    longitude: -77.0365,
  },
};

export async function createPropertyReport(input: PropertySearchInput): Promise<PropertyReport> {
  const backendReport = await fetchBackendReport(input);

  if (backendReport) {
    return backendReport;
  }

  const census = await lookupCensusAddress(input.address);
  const coordinates = getCoordinates(census);
  const [fcc, rentCast] = await Promise.all([
    coordinates ? lookupFccArea(coordinates.latitude, coordinates.longitude) : Promise.resolve(null),
    lookupRentCastProperty(input.address),
  ]);

  return buildReport(input, census, fcc, rentCast);
}

export function reportToText(report: PropertyReport) {
  const money = (value: number) => formatCurrency(value);

  return [
    `Property Intelligence Report: ${report.location.matchedAddress}`,
    `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
    "",
    report.executiveSummary,
    "",
    "Valuation",
    `- Estimated value: ${money(report.valuation.estimate)} (${money(report.valuation.low)} - ${money(report.valuation.high)})`,
    `- Estimated rent: ${money(report.rental.estimate)}/mo (${money(report.rental.low)} - ${money(report.rental.high)})`,
    `- Price per square foot: ${money(report.valuation.pricePerSquareFoot)}`,
    "",
    "Investment",
    `- Projected cash flow: ${money(report.investment.projectedCashFlow)}/mo`,
    `- Cap rate: ${report.investment.capRate.toFixed(2)}%`,
    `- Cash-on-cash: ${report.investment.cashOnCash.toFixed(2)}%`,
    `- DSCR: ${report.investment.dscr.toFixed(2)}x`,
    "",
    "Top risks",
    ...report.risks.map((risk) => `- ${risk.label}: ${risk.level} - ${risk.detail}`),
    "",
    "Recommended next steps",
    ...report.nextSteps.map((step) => `- ${step}`),
  ].join("\n");
}

export function formatCurrency(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

async function fetchBackendReport(input: PropertySearchInput) {
  const baseUrl = process.env.NEXT_PUBLIC_PROPERTY_API_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    return null;
  }

  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/property/intelligence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PropertyReport;
  } catch {
    return null;
  }
}

async function lookupCensusAddress(address: string) {
  const params = new URLSearchParams({
    address,
    benchmark: "Public_AR_Current",
    vintage: "Current_Current",
    layers: "all",
    format: "json",
  });

  try {
    const response = await fetchWithTimeout(
      `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?${params.toString()}`
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return (payload?.result?.addressMatches?.[0] ?? null) as CensusMatch | null;
  } catch {
    return null;
  }
}

async function lookupFccArea(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "json",
  });

  try {
    const response = await fetchWithTimeout(
      `https://geo.fcc.gov/api/census/area?${params.toString()}`
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as FccArea;
  } catch {
    return null;
  }
}

async function lookupRentCastProperty(address: string) {
  const apiKey = process.env.NEXT_PUBLIC_RENTCAST_API_KEY;

  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({ address });

  try {
    const response = await fetchWithTimeout(`https://api.rentcast.io/v1/properties?${params}`, {
      headers: {
        Accept: "application/json",
        "X-Api-Key": apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return (Array.isArray(payload) ? payload[0] : payload) as RentCastRecord | null;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    window.clearTimeout(timeout);
  }
}

function buildReport(
  input: PropertySearchInput,
  census: CensusMatch | null,
  fcc: FccArea | null,
  rentCast: RentCastRecord | null
): PropertyReport {
  const fallback = getFallbackLocation(input.address);
  const addressParts = parseAddress(input.address);
  const coordinates = getCoordinates(census);
  const fccResult = fcc?.results?.[0];
  const state =
    rentCast?.state ??
    fccResult?.state_code ??
    census?.addressComponents?.state ??
    fallback.state ??
    addressParts.state ??
    "";
  const profile = getMarketProfile(state);
  const bedrooms = positiveNumber(rentCast?.bedrooms, input.bedrooms, defaultBedrooms(input.propertyType));
  const bathrooms = positiveNumber(rentCast?.bathrooms, input.bathrooms, bedrooms >= 4 ? 3 : 2);
  const squareFeet = positiveNumber(
    rentCast?.squareFootage,
    input.squareFeet,
    estimateSquareFeet(input.propertyType, bedrooms, bathrooms)
  );
  const typeMultiplier = getPropertyTypeMultiplier(rentCast?.propertyType ?? input.propertyType);
  const yearBuilt = positiveOptional(rentCast?.yearBuilt);
  const assessedValue = getLatestTotal(rentCast?.taxAssessments);
  const taxAmount = getLatestTotal(rentCast?.propertyTaxes);
  const lastSalePrice = positiveOptional(rentCast?.lastSalePrice);
  const purchasePrice =
    parseMoney(input.purchasePrice) || lastSalePrice || assessedValue || squareFeet * profile.pricePerSquareFoot * typeMultiplier;
  const userRent = parseMoney(input.monthlyRent);
  const rentEstimate =
    userRent ||
    Math.max(
      bedrooms * profile.rentPerBedroom,
      squareFeet * profile.rentPerSquareFoot * (input.propertyType.toLowerCase().includes("luxury") ? 1.15 : 1)
    );
  const ageAdjustment = yearBuilt ? clamp(1 + (yearBuilt - 1985) / 1000, 0.88, 1.12) : 1;
  const valueAnchor = rentCast ? lastSalePrice || assessedValue || purchasePrice : purchasePrice;
  const estimatedPpsf = clamp(
    (valueAnchor / squareFeet) * 0.55 + profile.pricePerSquareFoot * typeMultiplier * ageAdjustment * 0.45,
    profile.pricePerSquareFoot * 0.55,
    profile.pricePerSquareFoot * 1.75
  );
  const valuationEstimate = Math.round(squareFeet * estimatedPpsf);
  const low = Math.round(valuationEstimate * 0.92);
  const high = Math.round(valuationEstimate * 1.08);
  const rentLow = Math.round(rentEstimate * 0.9);
  const rentHigh = Math.round(rentEstimate * 1.1);
  const downPaymentRate = clamp(parsePercentage(input.downPaymentPercent) || 0.25, 0.03, 0.8);
  const annualRate = clamp(parsePercentage(input.annualRate) || 0.0675, 0.01, 0.18);
  const downPayment = purchasePrice * downPaymentRate;
  const monthlyPayment = mortgagePayment(purchasePrice - downPayment, annualRate, 30);
  const estimatedExpenses = Math.round(rentEstimate * 0.34 + (taxAmount ? taxAmount / 12 : purchasePrice * 0.0105 / 12));
  const projectedCashFlow = Math.round(rentEstimate - monthlyPayment - estimatedExpenses);
  const annualNoi = (rentEstimate - estimatedExpenses) * 12;
  const capRate = (annualNoi / purchasePrice) * 100;
  const cashOnCash = ((projectedCashFlow * 12) / Math.max(downPayment, 1)) * 100;
  const dscr = annualNoi / Math.max(monthlyPayment * 12, 1);
  const matchedAddress =
    rentCast?.formattedAddress ??
    census?.matchedAddress ??
    fallback.matchedAddress ??
    input.address.trim();
  const city =
    rentCast?.city ?? census?.addressComponents?.city ?? fallback.city ?? addressParts.city ?? "Unknown city";
  const zipCode = rentCast?.zipCode ?? census?.addressComponents?.zip ?? fallback.zipCode ?? addressParts.zipCode ?? "";
  const county =
    rentCast?.county ??
    fccResult?.county_name ??
    getGeographyName(census, "Counties") ??
    fallback.county ??
    "County unavailable";
  const censusBlock = fccResult?.block_fips ?? getGeographyName(census, "Census Blocks");
  const confidence = calculateConfidence({ census, fcc, rentCast, input });
  const risks = buildRisks(state, input, purchasePrice, valuationEstimate, rentEstimate, taxAmount, rentCast);
  const comps = buildComps(bedrooms, bathrooms, squareFeet, estimatedPpsf, state);
  const valuationPositioning = getValuationPositioning(purchasePrice, low, high);
  const rentalPositioning = getRentalPositioning(rentEstimate, monthlyPayment + estimatedExpenses);

  const report: PropertyReport = {
    id: `${Date.now()}-${Math.round(Math.random() * 100000)}`,
    generatedAt: new Date().toISOString(),
    query: input,
    confidence,
    location: {
      inputAddress: input.address,
      matchedAddress,
      city,
      state,
      zipCode,
      county,
      latitude: rentCast?.latitude ?? coordinates?.latitude ?? fallback.latitude,
      longitude: rentCast?.longitude ?? coordinates?.longitude ?? fallback.longitude,
      censusTract: getGeographyName(census, "Census Tracts"),
      censusBlock,
    },
    facts: {
      propertyType: rentCast?.propertyType ?? input.propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      lotSize: positiveOptional(rentCast?.lotSize),
      yearBuilt,
      lastSalePrice,
      lastSaleDate: rentCast?.lastSaleDate,
      assessedValue,
      taxAmount,
      hoaFee: positiveOptional(rentCast?.hoa?.fee ?? rentCast?.hoaFee),
    },
    valuation: {
      low,
      estimate: valuationEstimate,
      high,
      pricePerSquareFoot: Math.round(estimatedPpsf),
      positioning: valuationPositioning,
    },
    rental: {
      estimate: Math.round(rentEstimate),
      low: rentLow,
      high: rentHigh,
      rentPerSquareFoot: Number((rentEstimate / squareFeet).toFixed(2)),
      positioning: rentalPositioning,
    },
    investment: {
      purchasePrice: Math.round(purchasePrice),
      downPayment: Math.round(downPayment),
      monthlyPayment: Math.round(monthlyPayment),
      estimatedExpenses,
      projectedCashFlow,
      capRate,
      cashOnCash,
      dscr,
    },
    neighborhood: {
      profile: profile.profile,
      demandScore: profile.demandScore,
      liquidity: profile.liquidity,
      buyerPersona: profile.buyerPersona,
      marketSignals: buildMarketSignals(profile, state, zipCode, rentCast),
    },
    risks,
    comps,
    dataSources: buildDataSources(census, fcc, rentCast),
    executiveSummary: "",
    nextSteps: buildNextSteps(input.strategy, rentCast),
  };

  report.executiveSummary = buildExecutiveSummary(report);
  return report;
}

function getCoordinates(census: CensusMatch | null) {
  const latitude = census?.coordinates?.y;
  const longitude = census?.coordinates?.x;

  if (typeof latitude === "number" && typeof longitude === "number") {
    return { latitude, longitude };
  }

  return null;
}

function getGeographyName(census: CensusMatch | null, key: string) {
  return census?.geographies?.[key]?.[0]?.NAME;
}

function getMarketProfile(state: string) {
  return MARKET_PROFILES.find((profile) => profile.states.includes(state.toUpperCase())) ?? DEFAULT_MARKET;
}

function getPropertyTypeMultiplier(propertyType: string) {
  const normalized = propertyType.toLowerCase();
  const match = Object.entries(PROPERTY_TYPE_MULTIPLIER).find(([key]) => normalized.includes(key));
  return match?.[1] ?? 1;
}

function positiveNumber(primary: unknown, secondary: unknown, fallback: number) {
  return positiveOptional(primary) ?? positiveOptional(secondary) ?? fallback;
}

function positiveOptional(value: unknown) {
  if (typeof value === "number" && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.]/g, ""));
    return parsed > 0 ? parsed : undefined;
  }

  return undefined;
}

function parseMoney(value?: string) {
  if (!value) {
    return 0;
  }

  const normalized = value.trim().toLowerCase();
  const multiplier = normalized.endsWith("m") ? 1000000 : normalized.endsWith("k") ? 1000 : 1;
  const parsed = Number(normalized.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed * multiplier : 0;
}

function parsePercentage(value?: string) {
  if (!value) {
    return 0;
  }

  const parsed = Number(value.replace(/[^0-9.]/g, ""));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed > 1 ? parsed / 100 : parsed;
}

function defaultBedrooms(propertyType: string) {
  const normalized = propertyType.toLowerCase();

  if (normalized.includes("condo")) {
    return 2;
  }

  if (normalized.includes("multi")) {
    return 6;
  }

  if (normalized.includes("luxury")) {
    return 5;
  }

  return 3;
}

function estimateSquareFeet(propertyType: string, bedrooms: number, bathrooms: number) {
  const normalized = propertyType.toLowerCase();
  const base = bedrooms * 520 + bathrooms * 180 + 450;

  if (normalized.includes("condo")) {
    return Math.round(base * 0.72);
  }

  if (normalized.includes("luxury")) {
    return Math.round(base * 1.45);
  }

  if (normalized.includes("multi")) {
    return Math.round(base * 1.85);
  }

  return Math.round(base);
}

function mortgagePayment(principal: number, annualRate: number, years: number) {
  const monthlyRate = annualRate / 12;
  const payments = years * 12;

  if (monthlyRate === 0) {
    return principal / payments;
  }

  return (principal * monthlyRate * (1 + monthlyRate) ** payments) / ((1 + monthlyRate) ** payments - 1);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getLatestTotal(history?: Record<string, { value?: number; total?: number }>) {
  if (!history) {
    return undefined;
  }

  const latestKey = Object.keys(history)
    .filter((key) => /^\d{4}$/.test(key))
    .sort()
    .pop();

  if (!latestKey) {
    return undefined;
  }

  return positiveOptional(history[latestKey].value ?? history[latestKey].total);
}

function buildRisks(
  state: string,
  input: PropertySearchInput,
  purchasePrice: number,
  valuationEstimate: number,
  rentEstimate: number,
  taxAmount?: number,
  rentCast?: RentCastRecord | null
) {
  const normalizedNotes = input.notes?.toLowerCase() ?? "";
  const insuranceStates = ["FL", "CA", "TX", "LA"];
  const priceGap = (purchasePrice - valuationEstimate) / valuationEstimate;
  const risks: RiskItem[] = [
    {
      label: "Pricing discipline",
      level: priceGap > 0.08 ? "High" : priceGap > 0.02 ? "Medium" : "Low",
      detail:
        priceGap > 0.08
          ? "Purchase price is materially above the modeled fair-value band."
          : priceGap > 0.02
            ? "Purchase price is slightly above the modeled midpoint; validate with real sold comps."
            : "Price is inside or below the modeled fair-value band.",
    },
    {
      label: "Insurance and hazard exposure",
      level: insuranceStates.includes(state.toUpperCase()) ? "Medium" : "Low",
      detail: insuranceStates.includes(state.toUpperCase())
        ? "State-level insurance volatility makes flood, fire, wind, and carrier availability checks important."
        : "No elevated state-level insurance flag from this model; still verify parcel-level hazards.",
    },
    {
      label: "Cash-flow sensitivity",
      level: rentEstimate / purchasePrice < 0.006 ? "High" : rentEstimate / purchasePrice < 0.008 ? "Medium" : "Low",
      detail: "Modeled rent-to-price ratio should be stress-tested against vacancy, repairs, taxes, and financing.",
    },
    {
      label: "Public-record completeness",
      level: rentCast ? "Low" : "Medium",
      detail: rentCast
        ? "Optional property-record enrichment returned structured property details."
        : "No property-record API key was available, so some facts are modeled from user input and public geography.",
    },
  ];

  if (taxAmount && taxAmount / purchasePrice > 0.018) {
    risks.push({
      label: "Property tax drag",
      level: "Medium",
      detail: "Taxes appear high relative to value and may materially reduce investor yield.",
    });
  }

  if (normalizedNotes.includes("hoa")) {
    risks.push({
      label: "HOA review",
      level: "Medium",
      detail: "Notes mention HOA; review reserves, litigation, rental restrictions, and upcoming assessments.",
    });
  }

  return risks;
}

function buildComps(
  bedrooms: number,
  bathrooms: number,
  squareFeet: number,
  pricePerSquareFoot: number,
  state: string
) {
  const deltas = [
    { label: "Nearby similar size", distance: "0.3 mi", size: 0.96, ppsf: 0.98 },
    { label: "Renovated benchmark", distance: "0.6 mi", size: 1.04, ppsf: 1.08 },
    { label: "Value floor", distance: "0.9 mi", size: 0.9, ppsf: 0.89 },
    { label: "Premium signal", distance: "1.2 mi", size: 1.12, ppsf: 1.15 },
  ];

  const marketSkew = ["CA", "WA", "NY", "MA"].includes(state.toUpperCase()) ? 1.03 : 1;

  return deltas.map((comp) => {
    const compSqft = Math.round(squareFeet * comp.size);
    const compPpsf = Math.round(pricePerSquareFoot * comp.ppsf * marketSkew);

    return {
      label: comp.label,
      distance: comp.distance,
      beds: Math.max(1, Math.round(bedrooms + (comp.size > 1.05 ? 1 : 0))),
      baths: Math.max(1, Math.round(bathrooms)),
      squareFeet: compSqft,
      estimatedValue: compSqft * compPpsf,
      pricePerSquareFoot: compPpsf,
      signal: comp.ppsf < 0.95 ? "below" : comp.ppsf > 1.08 ? "above" : "aligned",
    } satisfies ComparableProperty;
  });
}

function buildMarketSignals(profile: MarketProfile, state: string, zipCode: string, rentCast: RentCastRecord | null) {
  return [
    `${profile.liquidity} liquidity profile with a demand score of ${profile.demandScore}/100.`,
    state ? `${state} market assumptions applied${zipCode ? ` for ZIP ${zipCode}` : ""}.` : "National baseline assumptions applied.",
    rentCast
      ? "Property-record enrichment is active for physical characteristics."
      : "Use MLS sold comps or a property-record API for final pricing validation.",
    "School boundaries, parcel hazards, HOA docs, and permits should be verified before offer or listing strategy.",
  ];
}

function buildDataSources(census: CensusMatch | null, fcc: FccArea | null, rentCast: RentCastRecord | null) {
  return [
    {
      name: "US Census Geocoder",
      status: census ? "verified" : "unavailable",
      detail: census
        ? "Matched address, coordinates, and census geography from public Census services."
        : "No public Census match returned; report uses user input and deterministic fallback logic.",
    },
    {
      name: "FCC Census Area API",
      status: fcc?.results?.length ? "verified" : "unavailable",
      detail: fcc?.results?.length
        ? "Resolved state, county, and census block from latitude and longitude."
        : "Coordinate-based county and block enrichment was not available.",
    },
    {
      name: "RentCast property records",
      status: rentCast ? "optional" : "unavailable",
      detail: rentCast
        ? "Optional property record enrichment returned parcel-level facts."
        : "Set NEXT_PUBLIC_RENTCAST_API_KEY for property facts such as beds, baths, lot size, tax, and sale history.",
    },
    {
      name: "Nexus property model",
      status: "modeled",
      detail: "Valuation, rent, risk, and investment metrics are modeled from public geography, market priors, and user assumptions.",
    },
  ] satisfies DataSource[];
}

function buildNextSteps(strategy: PropertyStrategy, rentCast: RentCastRecord | null) {
  const shared = [
    "Pull MLS sold comps within the same school boundary and condition band.",
    "Verify parcel-level flood, fire, insurance, HOA, permit, and title conditions.",
    "Confirm property taxes after transfer and stress-test financing at multiple rates.",
  ];

  if (strategy === "investor") {
    return [
      "Request rent comps from active listings and recently signed leases.",
      "Run a repair walk-through with line-item capex assumptions.",
      ...shared,
    ];
  }

  if (strategy === "agent") {
    return [
      "Package this into a buyer or seller consultation report with three real MLS comps.",
      "Use the risk section as a pre-disclosure and due-diligence checklist.",
      ...shared,
    ];
  }

  if (strategy === "seller") {
    return [
      "Validate the price band against active competition and pending listings.",
      "Identify three repairs or staging moves that can shift the property into the premium comp set.",
      ...shared,
    ];
  }

  return [
    rentCast
      ? "Compare API property facts with disclosures and inspection findings."
      : "Add property-record enrichment or disclosure facts for higher confidence.",
    "Tour the immediate block at commute and evening hours.",
    ...shared,
  ];
}

function buildExecutiveSummary(report: PropertyReport) {
  const priceRead =
    report.investment.purchasePrice > report.valuation.high
      ? "above the current modeled value band"
      : report.investment.purchasePrice < report.valuation.low
        ? "below the current modeled value band"
        : "inside the current modeled value band";
  const cashFlowRead =
    report.investment.projectedCashFlow >= 0
      ? `positive modeled monthly cash flow of ${formatCurrency(report.investment.projectedCashFlow)}`
      : `negative modeled monthly cash flow of ${formatCurrency(Math.abs(report.investment.projectedCashFlow))}`;

  return `${report.location.matchedAddress} profiles as a ${report.neighborhood.liquidity.toLowerCase()} ${report.facts.propertyType.toLowerCase()} opportunity in ${report.location.county}. The modeled fair-value midpoint is ${formatCurrency(report.valuation.estimate)}, placing the assumed purchase price ${priceRead}. Rental underwriting indicates ${cashFlowRead} at the current assumptions, with a ${report.investment.capRate.toFixed(2)}% cap rate and ${report.investment.dscr.toFixed(2)}x DSCR.`;
}

function getValuationPositioning(purchasePrice: number, low: number, high: number) {
  if (purchasePrice < low) {
    return "Potentially underpriced versus the modeled value band.";
  }

  if (purchasePrice > high) {
    return "Premium-priced versus the modeled value band; require strong comp support.";
  }

  return "Priced inside the modeled fair-value band.";
}

function getRentalPositioning(rentEstimate: number, monthlyCost: number) {
  if (rentEstimate > monthlyCost * 1.12) {
    return "Rent estimate clears modeled debt and expense load with margin.";
  }

  if (rentEstimate > monthlyCost) {
    return "Rent estimate is close to break-even before reserves and vacancy.";
  }

  return "Rent estimate does not cover modeled ownership costs without appreciation or a lower basis.";
}

function calculateConfidence({
  census,
  fcc,
  rentCast,
  input,
}: {
  census: CensusMatch | null;
  fcc: FccArea | null;
  rentCast: RentCastRecord | null;
  input: PropertySearchInput;
}) {
  let score = 42;

  if (census) score += 18;
  if (fcc?.results?.length) score += 12;
  if (rentCast) score += 22;
  if (input.squareFeet) score += 3;
  if (input.purchasePrice) score += 3;

  return Math.min(score, 95);
}

function parseAddress(address: string) {
  const stateZip = address.match(/\b([A-Z]{2})\s+(\d{5})(?:-\d{4})?\b/i);
  const cityState = address.match(/,\s*([^,]+),\s*([A-Z]{2})(?:\s+\d{5})?/i);

  return {
    city: cityState?.[1]?.trim(),
    state: stateZip?.[1]?.toUpperCase() ?? cityState?.[2]?.toUpperCase(),
    zipCode: stateZip?.[2],
  };
}

function getFallbackLocation(address: string) {
  const normalized = address
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return Object.entries(FALLBACK_ADDRESSES).find(([key]) => normalized.includes(key))?.[1] ?? {};
}
