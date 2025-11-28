// app/api/sensors/route.ts

import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabaseClient";
import { computeAqiFromSensors } from "@/lib/aqi";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, pm25, voc, co } = body;

    if (!deviceId || pm25 === undefined || voc === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // compute AQI fields from available sensor values
    const { aqi, aqi_category, risk_level } = computeAqiFromSensors({ pm25, co, voc });

    const { data, error } = await supabaseClient
      .from("readings")
      .insert({
        device_id: deviceId,
        pm25,
        voc,
        co: co ?? null,
        aqi,
        aqi_category,
        risk_level,
      })
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to insert reading" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: data[0] });
  } catch (e: any) {
    console.error("POST /api/sensors error:", e);
    return NextResponse.json(
      { error: "Invalid JSON or server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const resource = url.searchParams.get("resource")
    const deviceId = url.searchParams.get("deviceId")

    // If explicitly requested, return raw devices table rows
    if (resource === "devices") {
      const { data, error } = await supabaseClient
        .from("devices")
        .select("id, name, location, sensor_type, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase select devices error:", error)
        return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    // Default: return readings joined with their device info
    // Use the explicit foreign key name so Supabase performs the join,
    // and keep the property name as `devices` to match the frontend.
    let query = supabaseClient
      .from("readings")
      .select(
        "id, device_id, pm25, voc, co, aqi, aqi_category, risk_level, created_at, devices!readings_device_id_fkey ( id, name, location, sensor_type )",
      )
      .order("created_at", { ascending: false })
      .limit(50)

    if (deviceId) {
      query = query.eq("device_id", deviceId)
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase select error:", error);
      return NextResponse.json(
        { error: "Failed to fetch readings" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("GET /api/sensors error:", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
