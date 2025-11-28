-- Migration: add trigger to compute AQI, category, and risk_level on insert/update
-- Run this in your Supabase SQL editor or via psql against the database.

-- Helper: convert PM2.5 (µg/m3) to AQI using EPA breakpoints (24-hr)
CREATE OR REPLACE FUNCTION public.pm25_to_aqi(pm25 numeric)
RETURNS integer AS $$
DECLARE
  aqi numeric;
BEGIN
  IF pm25 IS NULL THEN
    RETURN NULL;
  END IF;

  IF pm25 <= 12.0 THEN
    aqi := ((50 - 0) / (12.0 - 0.0)) * (pm25 - 0.0) + 0;
  ELSIF pm25 <= 35.4 THEN
    aqi := ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51;
  ELSIF pm25 <= 55.4 THEN
    aqi := ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101;
  ELSIF pm25 <= 150.4 THEN
    aqi := ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151;
  ELSIF pm25 <= 250.4 THEN
    aqi := ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201;
  ELSIF pm25 <= 350.4 THEN
    aqi := ((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301;
  ELSIF pm25 <= 500.4 THEN
    aqi := ((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401;
  ELSE
    -- Extrapolate above highest breakpoint and clamp to 500
    aqi := 500;
  END IF;

  RETURN ROUND(LEAST(GREATEST(aqi, 0), 500))::integer;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Helper: category mapping
CREATE OR REPLACE FUNCTION public.aqi_category_from_value(aqi integer)
RETURNS text AS $$
BEGIN
  IF aqi IS NULL THEN
    RETURN NULL;
  ELSNIF aqi <= 50 THEN
    RETURN 'Good';
  ELSIF aqi <= 100 THEN
    RETURN 'Moderate';
  ELSIF aqi <= 150 THEN
    RETURN 'Unhealthy for Sensitive Groups';
  ELSIF aqi <= 200 THEN
    RETURN 'Unhealthy';
  ELSIF aqi <= 300 THEN
    RETURN 'Very Unhealthy';
  ELSE
    RETURN 'Hazardous';
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Helper: risk mapping
CREATE OR REPLACE FUNCTION public.risk_from_category(cat text)
RETURNS text AS $$
BEGIN
  IF cat IS NULL THEN
    RETURN NULL;
  ELSIF cat = 'Good' THEN
    RETURN 'Low';
  ELSIF cat = 'Moderate' OR cat = 'Unhealthy for Sensitive Groups' THEN
    RETURN 'Mid';
  ELSE
    RETURN 'High';
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Trigger function to compute fields on INSERT or UPDATE
CREATE OR REPLACE FUNCTION public.compute_aqi_trigger()
RETURNS trigger AS $$
DECLARE
  computed_aqi integer;
  category text;
  risk text;
BEGIN
  -- Compute only if pm25 exists; otherwise leave nulls
  IF NEW.pm25 IS NOT NULL THEN
    computed_aqi := public.pm25_to_aqi(NEW.pm25);
    category := public.aqi_category_from_value(computed_aqi);
    risk := public.risk_from_category(category);

    NEW.aqi := computed_aqi;
    NEW.aqi_category := category;
    NEW.risk_level := risk;
  ELSE
    NEW.aqi := NULL;
    NEW.aqi_category := NULL;
    NEW.risk_level := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on readings table
DROP TRIGGER IF EXISTS trg_compute_aqi ON public.readings;
CREATE TRIGGER trg_compute_aqi
BEFORE INSERT OR UPDATE ON public.readings
FOR EACH ROW
EXECUTE FUNCTION public.compute_aqi_trigger();

-- NOTE: Run this migration in Supabase SQL editor or via psql. It will ensure
-- that any insert/update to `readings` automatically fills `aqi`,
-- `aqi_category`, and `risk_level` columns.
