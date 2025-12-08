// app/loading.tsx
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="ml-2 text-gray-500">Syncing AirPulse Data...</p>
    </div>
  )
}