import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { getMetricsData, getHistoricalData } from "@/lib/metrics-service"
import { createModel } from "@/lib/ai-providers"

const InsightSchema = z.object({
  topMetrics: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      change: z.number(),
      trend: z.enum(["up", "down"]),
      explanation: z.string(),
      recommendation: z.string(),
    }),
  ),
  poorMetrics: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      change: z.number(),
      trend: z.enum(["up", "down"]),
      explanation: z.string(),
      recommendation: z.string(),
    }),
  ),
  alerts: z.array(z.string()),
  summary: z.string(),
  chartData: z.array(
    z.object({
      month: z.string(),
      revenue: z.number(),
      profit: z.number(),
      conversion: z.number(),
    }),
  ),
  // New fields for detailed responses
  productAnalysis: z
    .array(
      z.object({
        product: z.string(),
        revenue: z.number(),
        units: z.number(),
        growth: z.number(),
        marketShare: z.number(),
        category: z.string(),
      }),
    )
    .optional(),
  detailedResponse: z.string(),
  tables: z
    .array(
      z.object({
        title: z.string(),
        headers: z.array(z.string()),
        rows: z.array(z.array(z.string())),
      }),
    )
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, aiConfig } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!aiConfig || !aiConfig.providerId || !aiConfig.modelId || !aiConfig.apiKey) {
      return NextResponse.json(
        { error: "AI configuration is required. Please configure an AI provider first." },
        { status: 400 },
      )
    }

    // Get current metrics data and historical data
    const metricsData = await getMetricsData()
    const historicalData = await getHistoricalData()

    // Sample product data for realistic responses
    const sampleProductData = [
      { name: "Premium Widget Pro", revenue: 45000, units: 150, growth: 23.5, category: "Electronics", margin: 35 },
      { name: "Smart Home Bundle", revenue: 38000, units: 95, growth: 18.2, category: "Smart Home", margin: 42 },
      { name: "Wireless Headphones X1", revenue: 32000, units: 200, growth: 15.8, category: "Audio", margin: 28 },
      { name: "Fitness Tracker Elite", revenue: 28000, units: 140, growth: 12.4, category: "Wearables", margin: 38 },
      { name: "Gaming Mouse Pro", revenue: 22000, units: 275, growth: 8.9, category: "Gaming", margin: 25 },
      { name: "Bluetooth Speaker Max", revenue: 18000, units: 120, growth: 6.2, category: "Audio", margin: 30 },
      { name: "Smart Watch Series 3", revenue: 15000, units: 75, growth: -2.1, category: "Wearables", margin: 45 },
      { name: "Laptop Stand Deluxe", revenue: 12000, units: 300, growth: -5.3, category: "Accessories", margin: 55 },
    ]

    let insights
    try {
      // Create the AI model with user's configuration
      const aiModel = createModel(aiConfig.providerId, aiConfig.modelId, aiConfig.apiKey)

      console.log(`Using AI provider: ${aiConfig.providerId} with model: ${aiConfig.modelId}`)

      const systemPrompt = `You are SalesPulse AI, a comprehensive business intelligence assistant. You have access to detailed business data and should provide thorough, specific answers to user questions.

Current Metrics Data:
${JSON.stringify(metricsData, null, 2)}

Historical Data:
${JSON.stringify(historicalData, null, 2)}

Sample Product Performance Data:
${JSON.stringify(sampleProductData, null, 2)}

IMPORTANT INSTRUCTIONS:
1. Always provide detailed, comprehensive responses to user questions
2. If asked about products, create realistic product analysis with specific data
3. If asked for tables, provide properly formatted table data
4. Don't say "I don't have data" - use the sample data to create realistic responses
5. Be specific with numbers, percentages, and actionable insights
6. Create detailed tables when requested
7. Provide thorough analysis, not brief summaries

For product questions:
- Use the sample product data to create realistic responses
- Include revenue, units sold, growth rates, categories
- Rank products by performance metrics
- Provide specific recommendations for each product

For table requests:
- Create properly formatted tables with headers and data rows
- Include relevant metrics and comparisons
- Make tables comprehensive and useful

Always be thorough and specific in your responses. Users want detailed analysis, not generic summaries.`

      const { object } = await generateObject({
        model: aiModel,
        system: systemPrompt,
        prompt: `User Question: "${prompt}"

Please provide a comprehensive, detailed response to this specific question. If they're asking about products, provide a complete product analysis with tables. If they want trends, show detailed trend analysis. Be thorough and specific - don't give generic responses.`,
        schema: InsightSchema,
      })

      insights = object
      console.log(`Successfully generated insights using ${aiConfig.providerId}/${aiConfig.modelId}`)
    } catch (error) {
      console.error("AI analysis failed:", error)

      // Return error instead of fallback when user has configured AI
      let errorMessage = "AI analysis failed"
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "Invalid API key. Please check your AI configuration."
        } else if (error.message.includes("quota") || error.message.includes("limit")) {
          errorMessage = "API quota exceeded. Please check your AI provider account."
        } else if (error.message.includes("model")) {
          errorMessage = "Model access denied. Please verify your API key has access to this model."
        } else {
          errorMessage = error.message
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    // Ensure chartData has proper structure - add fallback if AI didn't provide good data
    if (!insights.chartData || insights.chartData.length === 0) {
      console.log("AI didn't provide chart data, using fallback")
      insights.chartData = [
        { month: "Jan", revenue: 98000, profit: 58000, conversion: 4.2 },
        { month: "Feb", revenue: 105000, profit: 62000, conversion: 4.0 },
        { month: "Mar", revenue: 112000, profit: 65000, conversion: 3.8 },
        { month: "Apr", revenue: 118000, profit: 70000, conversion: 4.1 },
        { month: "May", revenue: 125000, profit: 75000, conversion: 3.2 },
        { month: "Jun", revenue: 132000, profit: 78000, conversion: 3.5 },
      ]
    }

    // Validate and fix chart data structure
    insights.chartData = insights.chartData.map((item, index) => ({
      month: item.month || `Month ${index + 1}`,
      revenue: Number(item.revenue) || 100000 + index * 5000,
      profit: Number(item.profit) || 60000 + index * 3000,
      conversion: Number(item.conversion) || 3.5 + Math.random(),
    }))

    console.log("Chart data being returned:", insights.chartData)

    return NextResponse.json(insights)
  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
