"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

type Device = {
  id: string
  name: string
  location: string
  sensor_type: "mobile" | "static"
}

type Reading = {
  id: number;
  device_id: string | number | null;
  pm25: number;
  voc: number;
  co: number | null;
  aqi?: number | null;
  aqi_category?: string | null;
  risk_level?: string | null;
  created_at: string;
  devices?: Device
};

type AirDataContextType = {
  latest: Reading | null;
  readings: Reading[];
};

const AirDataContext = createContext<AirDataContextType>({
  latest: null,
  readings: [],
});

export function AirDataProvider({ children }: { children: React.ReactNode }) {
  const [readings, setReadings] = useState<Reading[]>([]);

  async function fetchData() {
    try {
      const res = await fetch("/api/sensors");
      const json = await res.json();
      console.log("API /api/sensors response:", json);
      setReadings(json);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  useEffect(() => {
    // Initial load
    fetchData();

    // Subscribe to real-time changes on the readings table.
    const channel = supabaseClient
      .channel("realtime:readings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "readings" },
        () => {
          // Whenever a reading is inserted/updated/deleted, refresh the data
          fetchData();
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  return (
    <AirDataContext.Provider
      value={{
        latest: readings[0] ?? null,
        readings,
      }}
    >
      {children}
    </AirDataContext.Provider>
  );
}

export function useAirData() {
  return useContext(AirDataContext);
}
