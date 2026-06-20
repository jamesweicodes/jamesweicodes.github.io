import re
import time
import urllib.parse
import urllib.request
from typing import Any, Literal

from pydantic import BaseModel, Field


class PropertySearchRequest(BaseModel):
    address: str = Field(..., min_length=8, max_length=240)
    strategy: Literal["buyer", "investor", "agent", "seller"] = "investor"
    propertyType: str = Field("Single Family", max_length=80)
    bedrooms: str | None = None
    bathrooms: str | None = None
    squareFeet: str | None = None
    purchasePrice: str | None = None
    monthlyRent: str | None = None
    downPaymentPercent: str | None = None
    annualRate: str | None = None
    notes: str | None = Field(None, max_length=1200)


MARKETS = {
    "CA": {
        "ppsf": 715,
        "rent_bed": 1425,
        "rent_psf": 3.45,
        "demand": 86,
        "liquidity": "Fast moving",
        "profile": "High-cost coastal market where location, schools, commute access, and inventory scarcity carry pricing power.",
        "persona": "Tech professionals, equity-rich move-up buyers, and investors underwriting long-term appreciation.",
    },
    "TX": {
        "ppsf": 245,
        "rent_bed": 820,
        "rent_psf": 1.75,
        "demand": 77,
        "liquidity": "Active",
        "profile": "Growth market with strong migration, job creation, and comparatively favorable cost per square foot.",
        "persona": "Relocation buyers, first-time homeowners, and build-to-rent investors.",
    },
    "FL": {
        "ppsf": 330,
        "rent_bed": 980,
        "rent_psf": 2.05,
        "demand": 78,
        "liquidity": "Active",
        "profile": "Lifestyle and tax-driven market where insurance, flood exposure, and HOA economics matter materially.",
        "persona": "Lifestyle movers, retirees, short-term rental operators, and second-home buyers.",
    },
}

DEFAULT_MARKET = {
    "ppsf": 310,
    "rent_bed": 760,
    "rent_psf": 1.65,
    "demand": 72,
    "liquidity": "Balanced",
    "profile": "Balanced residential market with demand driven by affordability, commute access, and local inventory.",
    "persona": "Move-up buyers, relocating households, and long-term rental investors.",
}


def build_property_report(body: PropertySearchRequest) -> dict[str, Any]:
    census = lookup_census(body.address)
    lat = census.get("coordinates", {}).get("y") if census else None
    lon = census.get("coordinates", {}).get("x") if census else None
    fcc = lookup_fcc(lat, lon) if lat and lon else None
    parts = parse_address(body.address)
    fcc_result = first((fcc or {}).get("results"))
    state = (
        (fcc_result or {}).get("state_code")
        or (census or {}).get("addressComponents", {}).get("state")
        or parts.get("state")
        or ""
    ).upper()
    market = market_for_state(state)
    bedrooms = positive(body.bedrooms, 3)
    bathrooms = positive(body.bathrooms, 2)
    square_feet = positive(body.squareFeet, estimate_square_feet(body.propertyType, bedrooms, bathrooms))
    purchase_price = parse_money(body.purchasePrice) or square_feet * market["ppsf"]
    rent_estimate = parse_money(body.monthlyRent) or max(
        bedrooms * market["rent_bed"], square_feet * market["rent_psf"]
    )
    ppsf = blend_ppsf(purchase_price / square_feet, market["ppsf"], body.propertyType)
    value = round(square_feet * ppsf)
    low = round(value * 0.92)
    high = round(value * 1.08)
    down_rate = clamp(parse_percent(body.downPaymentPercent) or 0.25, 0.03, 0.8)
    note_rate = clamp(parse_percent(body.annualRate) or 0.0675, 0.01, 0.18)
    down_payment = purchase_price * down_rate
    payment = mortgage_payment(purchase_price - down_payment, note_rate, 30)
    expenses = round(rent_estimate * 0.34 + purchase_price * 0.0105 / 12)
    cash_flow = round(rent_estimate - payment - expenses)
    noi = (rent_estimate - expenses) * 12
    cap_rate = noi / purchase_price * 100
    dscr = noi / max(payment * 12, 1)
    county = (
        (fcc_result or {}).get("county_name")
        or geography_name(census, "Counties")
        or "County unavailable"
    )
    matched = (census or {}).get("matchedAddress") or body.address.strip()
    city = (census or {}).get("addressComponents", {}).get("city") or parts.get("city") or "Unknown city"
    zip_code = (census or {}).get("addressComponents", {}).get("zip") or parts.get("zipCode") or ""
    confidence = min(95, 42 + (18 if census else 0) + (12 if fcc_result else 0) + (3 if body.squareFeet else 0))
    risks = build_risks(state, purchase_price, value, rent_estimate, bool(census))
    comps = build_comps(bedrooms, bathrooms, square_feet, ppsf)

    report = {
        "id": f"{int(time.time() * 1000)}",
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "query": body.model_dump(),
        "confidence": confidence,
        "location": {
            "inputAddress": body.address,
            "matchedAddress": matched,
            "city": city,
            "state": state,
            "zipCode": zip_code,
            "county": county,
            "latitude": lat,
            "longitude": lon,
            "censusTract": geography_name(census, "Census Tracts"),
            "censusBlock": (fcc_result or {}).get("block_fips") or geography_name(census, "Census Blocks"),
        },
        "facts": {
            "propertyType": body.propertyType,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "squareFeet": square_feet,
        },
        "valuation": {
            "low": low,
            "estimate": value,
            "high": high,
            "pricePerSquareFoot": round(ppsf),
            "positioning": positioning(purchase_price, low, high),
        },
        "rental": {
            "estimate": round(rent_estimate),
            "low": round(rent_estimate * 0.9),
            "high": round(rent_estimate * 1.1),
            "rentPerSquareFoot": round(rent_estimate / square_feet, 2),
            "positioning": "Rent estimate covers modeled costs." if rent_estimate > payment + expenses else "Rent estimate needs stress testing against costs.",
        },
        "investment": {
            "purchasePrice": round(purchase_price),
            "downPayment": round(down_payment),
            "monthlyPayment": round(payment),
            "estimatedExpenses": expenses,
            "projectedCashFlow": cash_flow,
            "capRate": cap_rate,
            "cashOnCash": cash_flow * 12 / max(down_payment, 1) * 100,
            "dscr": dscr,
        },
        "neighborhood": {
            "profile": market["profile"],
            "demandScore": market["demand"],
            "liquidity": market["liquidity"],
            "buyerPersona": market["persona"],
            "marketSignals": [
                f"{market['liquidity']} liquidity profile with a demand score of {market['demand']}/100.",
                f"{state or 'National'} market assumptions applied.",
                "School boundaries, hazards, HOA docs, and permits should be verified before decisions.",
            ],
        },
        "risks": risks,
        "comps": comps,
        "dataSources": [
            source("US Census Geocoder", bool(census), "Matched address and geography from public Census services."),
            source("FCC Census Area API", bool(fcc_result), "Resolved county, state, and census block from coordinates."),
            {
                "name": "RentCast property records",
                "status": "unavailable",
                "detail": "Use the browser app with NEXT_PUBLIC_RENTCAST_API_KEY or add a server key for parcel-level records.",
            },
            {
                "name": "Nexus property model",
                "status": "modeled",
                "detail": "Valuation, rent, risk, and investment metrics are modeled from public geography and user assumptions.",
            },
        ],
        "executiveSummary": "",
        "nextSteps": next_steps(body.strategy),
    }
    report["executiveSummary"] = executive_summary(report)
    return report


def lookup_census(address: str) -> dict[str, Any] | None:
    params = urllib.parse.urlencode(
        {
            "address": address,
            "benchmark": "Public_AR_Current",
            "vintage": "Current_Current",
            "layers": "all",
            "format": "json",
        }
    )
    payload = fetch_json(f"https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?{params}")
    return first(((payload or {}).get("result") or {}).get("addressMatches"))


def lookup_fcc(lat: float, lon: float) -> dict[str, Any] | None:
    params = urllib.parse.urlencode({"lat": str(lat), "lon": str(lon), "format": "json"})
    return fetch_json(f"https://geo.fcc.gov/api/census/area?{params}")


def fetch_json(url: str) -> dict[str, Any] | None:
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "jameswei-property-intelligence/1.0"})
        with urllib.request.urlopen(request, timeout=8) as response:
            import json

            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None


def first(items: Any) -> Any:
    return items[0] if isinstance(items, list) and items else None


def parse_address(address: str) -> dict[str, str]:
    state_zip = re.search(r"\b([A-Z]{2})\s+(\d{5})(?:-\d{4})?\b", address, re.I)
    city_state = re.search(r",\s*([^,]+),\s*([A-Z]{2})(?:\s+\d{5})?", address, re.I)
    return {
        "city": city_state.group(1).strip() if city_state else "",
        "state": (state_zip.group(1) if state_zip else city_state.group(2) if city_state else "").upper(),
        "zipCode": state_zip.group(2) if state_zip else "",
    }


def geography_name(census: dict[str, Any] | None, key: str) -> str | None:
    if not census:
        return None
    item = first((census.get("geographies") or {}).get(key) or [])
    return item.get("NAME") if isinstance(item, dict) else None


def market_for_state(state: str) -> dict[str, Any]:
    if state in MARKETS:
        return MARKETS[state]
    if state in {"WA", "OR"}:
        return {**DEFAULT_MARKET, "ppsf": 465, "rent_bed": 1050, "rent_psf": 2.55, "demand": 79, "liquidity": "Competitive"}
    if state in {"NY", "NJ", "MA", "CT"}:
        return {**DEFAULT_MARKET, "ppsf": 510, "rent_bed": 1225, "rent_psf": 3.1, "demand": 80, "liquidity": "Supply constrained"}
    return DEFAULT_MARKET


def positive(value: str | None, fallback: float) -> float:
    if not value:
        return fallback
    parsed = re.sub(r"[^0-9.]", "", str(value))
    return float(parsed) if parsed else fallback


def parse_money(value: str | None) -> float:
    if not value:
        return 0
    normalized = value.strip().lower()
    multiplier = 1000000 if normalized.endswith("m") else 1000 if normalized.endswith("k") else 1
    parsed = re.sub(r"[^0-9.]", "", normalized)
    return float(parsed) * multiplier if parsed else 0


def parse_percent(value: str | None) -> float:
    if not value:
        return 0
    parsed = positive(value, 0)
    return parsed / 100 if parsed > 1 else parsed


def estimate_square_feet(property_type: str, beds: float, baths: float) -> int:
    base = beds * 520 + baths * 180 + 450
    lower = property_type.lower()
    if "condo" in lower:
        return round(base * 0.72)
    if "luxury" in lower:
        return round(base * 1.45)
    if "multi" in lower:
        return round(base * 1.85)
    return round(base)


def blend_ppsf(subject_ppsf: float, market_ppsf: float, property_type: str) -> float:
    multiplier = 1.32 if "luxury" in property_type.lower() else 0.86 if "condo" in property_type.lower() else 1
    return clamp(subject_ppsf * 0.55 + market_ppsf * multiplier * 0.45, market_ppsf * 0.55, market_ppsf * 1.75)


def mortgage_payment(principal: float, annual_rate: float, years: int) -> float:
    monthly_rate = annual_rate / 12
    payments = years * 12
    if monthly_rate == 0:
        return principal / payments
    return principal * monthly_rate * (1 + monthly_rate) ** payments / ((1 + monthly_rate) ** payments - 1)


def clamp(value: float, minimum: float, maximum: float) -> float:
    return min(max(value, minimum), maximum)


def positioning(price: float, low: float, high: float) -> str:
    if price < low:
        return "Potentially underpriced versus the modeled value band."
    if price > high:
        return "Premium-priced versus the modeled value band; require strong comp support."
    return "Priced inside the modeled fair-value band."


def build_risks(state: str, price: float, value: float, rent: float, has_census: bool) -> list[dict[str, str]]:
    gap = (price - value) / value
    return [
        {
            "label": "Pricing discipline",
            "level": "High" if gap > 0.08 else "Medium" if gap > 0.02 else "Low",
            "detail": "Validate the modeled price band with MLS sold comps and condition adjustments.",
        },
        {
            "label": "Insurance and hazard exposure",
            "level": "Medium" if state in {"FL", "CA", "TX", "LA"} else "Low",
            "detail": "Check parcel flood, fire, wind, and carrier availability before offer or listing strategy.",
        },
        {
            "label": "Cash-flow sensitivity",
            "level": "High" if rent / price < 0.006 else "Medium" if rent / price < 0.008 else "Low",
            "detail": "Stress-test vacancy, repairs, taxes, insurance, and financing changes.",
        },
        {
            "label": "Public-record completeness",
            "level": "Low" if has_census else "Medium",
            "detail": "Geography is public-data backed when available; parcel details still need disclosure or property-record validation.",
        },
    ]


def build_comps(beds: float, baths: float, sqft: float, ppsf: float) -> list[dict[str, Any]]:
    comps = [
        ("Nearby similar size", "0.3 mi", 0.96, 0.98),
        ("Renovated benchmark", "0.6 mi", 1.04, 1.08),
        ("Value floor", "0.9 mi", 0.9, 0.89),
        ("Premium signal", "1.2 mi", 1.12, 1.15),
    ]
    return [
        {
            "label": label,
            "distance": distance,
            "beds": max(1, round(beds + (1 if size > 1.05 else 0))),
            "baths": max(1, round(baths)),
            "squareFeet": round(sqft * size),
            "estimatedValue": round(sqft * size) * round(ppsf * spread),
            "pricePerSquareFoot": round(ppsf * spread),
            "signal": "below" if spread < 0.95 else "above" if spread > 1.08 else "aligned",
        }
        for label, distance, size, spread in comps
    ]


def source(name: str, active: bool, detail: str) -> dict[str, str]:
    return {"name": name, "status": "verified" if active else "unavailable", "detail": detail}


def next_steps(strategy: str) -> list[str]:
    if strategy == "investor":
        return [
            "Request rent comps from active listings and recently signed leases.",
            "Run a repair walk-through with line-item capex assumptions.",
            "Verify parcel-level flood, fire, insurance, HOA, permit, and title conditions.",
            "Confirm property taxes after transfer and stress-test financing at multiple rates.",
        ]
    if strategy == "seller":
        return [
            "Validate the price band against active competition and pending listings.",
            "Identify repairs or staging moves that can shift the property into the premium comp set.",
            "Pull MLS sold comps within the same school boundary and condition band.",
            "Review disclosures, permits, and title conditions before launch.",
        ]
    return [
        "Pull MLS sold comps within the same school boundary and condition band.",
        "Verify parcel-level flood, fire, insurance, HOA, permit, and title conditions.",
        "Confirm property taxes after transfer and stress-test financing at multiple rates.",
        "Tour the immediate block at commute and evening hours.",
    ]


def executive_summary(report: dict[str, Any]) -> str:
    value = report["valuation"]["estimate"]
    price = report["investment"]["purchasePrice"]
    position = "inside"
    if price > report["valuation"]["high"]:
        position = "above"
    elif price < report["valuation"]["low"]:
        position = "below"
    cash_flow = report["investment"]["projectedCashFlow"]
    flow_word = "positive" if cash_flow >= 0 else "negative"
    return (
        f"{report['location']['matchedAddress']} profiles as a {report['neighborhood']['liquidity'].lower()} "
        f"{report['facts']['propertyType'].lower()} opportunity in {report['location']['county']}. "
        f"The modeled fair-value midpoint is ${value:,.0f}, placing the assumed purchase price {position} "
        f"the modeled band. Rental underwriting indicates {flow_word} modeled monthly cash flow of "
        f"${abs(cash_flow):,.0f}, with a {report['investment']['capRate']:.2f}% cap rate and "
        f"{report['investment']['dscr']:.2f}x DSCR."
    )
