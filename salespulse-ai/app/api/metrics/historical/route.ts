import { type NextRequest, NextResponse } from "next/server"
import { getHistoricalData, addHistoricalMetric } from "@/lib/metrics-service"

export async function GET() {
  try {
    const historicalData = await getHistoricalData()
    return NextResponse.json({ data: historicalData })
  } catch (error) {
    console.error("Error fetching historical data:", error)
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { metricName, value, month, year } = await request.json()

    // Validate required fields
    if (!metricName || typeof value !== "number" || !month || !year) {
      return NextResponse.json({ error: "Missing required fields: metricName, value, month, year" }, { status: 400 })
    }

    const historicalMetric = await addHistoricalMetric({
      metricName,
      value,
      month,
      year,
    })

    if (!historicalMetric) {
      return NextResponse.json({ error: "Failed to add historical metric" }, { status: 500 })
    }

    return NextResponse.json({ metric: historicalMetric })
  } catch (error) {
    console.error("Error adding historical metric:", error)
    return NextResponse.json({ error: "Failed to add historical metric" }, { status: 500 })
  }
}
