import { AirDataProvider } from "@/components/data-content";
import { AQICard } from "@/components/aqi-card";
import { PollutantGrid } from "@/components/pollutant-grid";
import { RecommendationsCard } from "@/components/recommendations-card";
import { SyncIndicator } from "@/components/sync-indicator";

export default function HomePage() {
  return (
    <AirDataProvider>
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AirPulse</h1>
              <p className="text-primary-foreground/80 text-sm">
                Real-time Air Quality
              </p>
            </div>
            <SyncIndicator />
          </div>
        </header>

        <div className="p-4 space-y-6">
          <AQICard />
          <PollutantGrid />
          <RecommendationsCard />
        </div>
      </div>
    </AirDataProvider>
  );
}
