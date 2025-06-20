import { NextResponse } from "next/server"
import { getRealtimeAlerts } from "@/lib/alert-service"

export async function GET() {
  try {
    const alerts = await getRealtimeAlerts()
    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ alerts: [] })
  }
}
