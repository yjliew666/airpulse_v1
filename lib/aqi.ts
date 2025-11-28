export type AQICategory =
  | "Good"
  | "Moderate"
  | "Unhealthy for Sensitive Groups"
  | "Unhealthy"
  | "Very Unhealthy"
  | "Hazardous";

export type RiskLevel = "Low" | "Mid" | "High";

// EPA/US AQI breakpoints for PM2.5 (µg/m3) — 24-hour
const PM25_BREAKPOINTS = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
  { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function pm25ToAqi(pm25: number): number {
  if (pm25 === null || pm25 === undefined || Number.isNaN(pm25)) return NaN;

  // Find breakpoint
  for (const bp of PM25_BREAKPOINTS) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      const { cLow, cHigh, iLow, iHigh } = bp;
      const aqi = ((iHigh - iLow) / (cHigh - cLow)) * (pm25 - cLow) + iLow;
      return Math.round(clamp(aqi, iLow, iHigh));
    }
  }

  // If above highest defined breakpoint, extrapolate and clamp to 500
  const highest = PM25_BREAKPOINTS[PM25_BREAKPOINTS.length - 1];
  const aqi = ((highest.iHigh - highest.iLow) / (highest.cHigh - highest.cLow)) * (pm25 - highest.cLow) + highest.iLow;
  return Math.round(clamp(aqi, highest.iHigh, 500));
}

export function getCategoryFromAqi(aqi: number): AQICategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

export function mapCategoryToRisk(category: AQICategory): RiskLevel {
  if (category === "Good") return "Low";
  if (category === "Moderate" || category === "Unhealthy for Sensitive Groups") return "Mid";
  return "High";
}

export function computeAqiFromSensors(values: { pm25?: number | null; co?: number | null; voc?: number | null; }): {
  aqi: number | null;
  aqi_category: AQICategory | null;
  risk_level: RiskLevel | null;
} {
  const { pm25 } = values;

  if (pm25 === null || pm25 === undefined || Number.isNaN(pm25)) {
    return { aqi: null, aqi_category: null, risk_level: null };
  }

  const aqi = pm25ToAqi(pm25);
  const aqi_category = getCategoryFromAqi(aqi);
  const risk_level = mapCategoryToRisk(aqi_category);

  return { aqi, aqi_category, risk_level };
}
