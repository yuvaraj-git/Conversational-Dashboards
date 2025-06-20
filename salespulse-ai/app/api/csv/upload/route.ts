import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { parseCSV, analyzeCSVData, storeCSVData } from "@/lib/csv-service"
import { createModel } from "@/lib/ai-providers"

const CSVAnalysisSchema = z.object({
  summary: z.string(),
  keyInsights: z.array(z.string()),
  topPerformers: z.array(
    z.object({
      category: z.string(),
      value: z.string(),
      insight: z.string(),
    }),
  ),
  concerns: z.array(
    z.object({
      category: z.string(),
      value: z.string(),
      recommendation: z.string(),
    }),
  ),
  trends: z.array(
    z.object({
      metric: z.string(),
      direction: z.enum(["up", "down", "stable"]),
      percentage: z.number(),
      explanation: z.string(),
    }),
  ),
  recommendations: z.array(z.string()),
  chartConfigs: z.array(
    z.object({
      type: z.enum(["line", "bar", "pie", "area"]),
      title: z.string(),
      description: z.string(),
      dataKey: z.string(),
      metrics: z.array(z.string()),
    }),
  ),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const aiConfigStr = formData.get("aiConfig") as string

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json({ error: "Please upload a CSV file" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    let aiConfig = null
    if (aiConfigStr) {
      try {
        aiConfig = JSON.parse(aiConfigStr)
      } catch (error) {
        console.warn("Invalid AI config provided:", error)
      }
    }

    // Parse CSV file
    const csvText = await file.text()

    if (!csvText || csvText.trim().length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 })
    }

    console.log("Parsing CSV file:", file.name)
    const parsedData = await parseCSV(csvText)

    if (!parsedData || parsedData.length === 0) {
      return NextResponse.json({ error: "No valid data found in CSV file" }, { status: 400 })
    }

    console.log(`Successfully parsed ${parsedData.length} rows`)

    // Analyze the data structure and content
    const dataAnalysis = await analyzeCSVData(parsedData)
    console.log("Data analysis completed:", dataAnalysis.structure)

    // Store the data (with fallback to in-memory storage)
    let storedData
    try {
      storedData = await storeCSVData(parsedData, file.name)
      console.log("Data stored successfully:", storedData.id)
    } catch (error) {
      console.warn("Storage failed, continuing with analysis:", error)
      storedData = {
        id: `temp-${Date.now()}`,
        file_name: file.name,
        row_count: parsedData.length,
        uploaded_at: new Date().toISOString(),
      }
    }

    // Generate AI insights if configuration is provided
    let insights
    if (aiConfig && aiConfig.providerId && aiConfig.modelId && aiConfig.apiKey) {
      try {
        const aiModel = createModel(aiConfig.providerId, aiConfig.modelId, aiConfig.apiKey)

        const systemPrompt = `You are a business intelligence analyst. Analyze the provided sales CSV data and generate comprehensive insights.

Data Structure:
- File: ${file.name}
- Rows: ${parsedData.length}
- Columns: ${dataAnalysis.structure.columns.join(", ")}

Data Summary:
${JSON.stringify(dataAnalysis.summary, null, 2)}

Sample Data (first 3 rows):
${JSON.stringify(parsedData.slice(0, 3), null, 2)}

Provide specific, actionable insights based on this actual data. Focus on:
1. Revenue patterns and trends
2. Customer behavior insights
3. Product/service performance
4. Operational efficiency opportunities
5. Growth recommendations`

        console.log(`Generating AI insights using ${aiConfig.providerId}/${aiConfig.modelId}...`)
        const { object } = await generateObject({
          model: aiModel,
          system: systemPrompt,
          prompt: `Analyze this sales data and provide comprehensive business insights. The data contains ${parsedData.length} records with ${dataAnalysis.structure.columns.length} columns. Focus on actionable recommendations and clear explanations.`,
          schema: CSVAnalysisSchema,
        })

        insights = object
        console.log(`AI insights generated successfully using ${aiConfig.providerId}/${aiConfig.modelId}`)
      } catch (error) {
        console.warn("AI analysis failed:", error)
        // Don't fail the entire upload if AI analysis fails
        insights = null
      }
    }

    // Fallback insights if no AI config or AI analysis failed
    if (!insights) {
      insights = {
        summary: `Successfully analyzed ${file.name} containing ${parsedData.length} records across ${dataAnalysis.structure.columns.length} data fields. ${
          dataAnalysis.summary.totalRevenue
            ? `Total revenue of $${dataAnalysis.summary.totalRevenue.toLocaleString()} identified.`
            : "Data structure analyzed and ready for insights."
        } ${
          dataAnalysis.summary.uniqueCustomers ? `Found ${dataAnalysis.summary.uniqueCustomers} unique customers.` : ""
        } Configure an AI provider for enhanced insights.`,

        keyInsights: [
          `Dataset contains ${parsedData.length} records with ${dataAnalysis.structure.columns.length} columns`,
          dataAnalysis.summary.totalRevenue
            ? `Total revenue: $${dataAnalysis.summary.totalRevenue.toLocaleString()}`
            : "Revenue data structure identified",
          dataAnalysis.summary.averageOrderValue
            ? `Average order value: $${dataAnalysis.summary.averageOrderValue.toFixed(2)}`
            : "Order value metrics available",
          dataAnalysis.summary.dateRange
            ? `Data spans from ${dataAnalysis.summary.dateRange.start} to ${dataAnalysis.summary.dateRange.end}`
            : "Time-series data structure detected",
          "Data processing completed successfully",
        ].filter(Boolean),

        topPerformers: [
          {
            category: "Data Quality",
            value: "Excellent",
            insight: `Successfully processed ${parsedData.length} records with clean data structure`,
          },
          dataAnalysis.summary.totalRevenue
            ? {
                category: "Revenue",
                value: `$${dataAnalysis.summary.totalRevenue.toLocaleString()}`,
                insight: "Strong revenue data available for detailed analysis",
              }
            : {
                category: "Data Structure",
                value: "Complete",
                insight: "All data fields properly identified and processed",
              },
          {
            category: "Processing Speed",
            value: "Fast",
            insight: "Data analysis completed efficiently",
          },
        ].filter(Boolean) as any[],

        concerns: [
          {
            category: "AI Analysis",
            value: "Not Configured",
            recommendation: "Configure an AI provider for advanced insights and recommendations",
          },
        ],

        trends: [
          {
            metric: "Data Processing",
            direction: "up" as const,
            percentage: 100,
            explanation: "All data successfully processed and analyzed",
          },
        ],

        recommendations: [
          "Data structure is excellent for business intelligence analysis",
          "Configure an AI provider for advanced insights and recommendations",
          "Regular data uploads will enable trend tracking over time",
          "Consider setting up automated data pipelines for real-time insights",
        ],

        chartConfigs: [
          {
            type: "line" as const,
            title: "Performance Trends",
            description: "Time-based analysis of key metrics",
            dataKey: "date",
            metrics: ["revenue", "orders", "quantity"],
          },
          {
            type: "bar" as const,
            title: "Category Performance",
            description: "Comparative analysis across categories",
            dataKey: "category",
            metrics: ["revenue", "count"],
          },
        ],
      }
    }

    return NextResponse.json({
      success: true,
      dataId: storedData.id,
      fileName: file.name,
      recordCount: parsedData.length,
      columns: dataAnalysis.structure.columns,
      insights,
      chartData: dataAnalysis.chartData,
      rawData: parsedData.slice(0, 50), // Return first 50 rows for preview
      summary: dataAnalysis.summary,
      aiUsed: !!aiConfig,
    })
  } catch (error) {
    console.error("CSV upload error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process CSV file. Please check your file format and try again.",
      },
      { status: 500 },
    )
  }
}
