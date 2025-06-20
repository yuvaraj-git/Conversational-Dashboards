"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Database, BarChart3, CheckCircle } from "lucide-react"

interface ChartDebugProps {
  chartData: any[]
  insights: any
  fileName?: string
}

export function ChartDebug({ chartData, insights, fileName }: ChartDebugProps) {
  const hasValidData = chartData && chartData.length > 0
  const dataFields = hasValidData ? Object.keys(chartData[0] || {}) : []

  return (
    <Card className="mb-4 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Chart Data Status - Ready for Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <Badge variant="default" className="mb-2">
              <Database className="h-3 w-3 mr-1" />
              Data Status
            </Badge>
            <p>Chart Data Points: {chartData?.length || 0}</p>
            <p>Data Available: {hasValidData ? "✅ Yes" : "❌ No"}</p>
            <p>File: {fileName || "Sample Data"}</p>
          </div>

          <div>
            <Badge variant="default" className="mb-2">
              <BarChart3 className="h-3 w-3 mr-1" />
              Data Fields
            </Badge>
            {hasValidData ? (
              <div>
                <p>Fields: {dataFields.join(", ")}</p>
                <p>Sample Revenue: ${chartData[0]?.revenue?.toLocaleString() || "N/A"}</p>
              </div>
            ) : (
              <p>Using fallback sample data</p>
            )}
          </div>

          <div>
            <Badge variant="default" className="mb-2">
              Chart Types
            </Badge>
            <div className="space-y-1">
              <p>✅ Overview (Line Chart)</p>
              <p>✅ Revenue (Bar Chart)</p>
              <p>✅ Distribution (Pie Chart)</p>
              <p>✅ Trends (Area Chart)</p>
            </div>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {hasValidData
              ? `Charts are populated with ${chartData.length} data points from your uploaded file. All visualization tabs should display properly.`
              : "Charts are using comprehensive sample data to ensure all visualizations work properly. Upload your CSV file for real data analysis."}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
