import { type NextRequest, NextResponse } from "next/server"
import { getMetricsData, updateMetric } from "@/lib/metrics-service"

export async function GET() {
  try {
    const metrics = await getMetricsData()
    return NextResponse.json({ metrics })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()

    // Validate required fields
    if (!metric.name || typeof metric.currentValue !== "number") {
      return NextResponse.json({ error: "Missing required fields: name and currentValue" }, { status: 400 })
    }

    const updatedMetric = await updateMetric(metric)

    if (!updatedMetric) {
      return NextResponse.json({ error: "Failed to update metric" }, { status: 500 })
    }

    return NextResponse.json({ metric: updatedMetric })
  } catch (error) {
    console.error("Error updating metric:", error)
    return NextResponse.json({ error: "Failed to update metric" }, { status: 500 })
  }
}
