import useSWR from "swr"

export interface AQIData {
  value: number
  status: string
  color: string
  location: string
}

export function useAQIData() {
  const { data, mutate } = useSWR<AQIData>("aqi-data", null, {
    fallbackData: {
      value: 42,
      status: "Good",
      color: "bg-accent",
      location: "Downtown Sensor #1",
    },
  })

  return {
    aqiData: data,
    updateAQI: mutate,
  }
}
