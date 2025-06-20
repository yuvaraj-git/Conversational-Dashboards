"use client"

import { DataDashboard } from "@/components/data-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TestChartsPage() {
  // Sample data for testing
  const sampleChartData = [
    { month: "Jan", revenue: 98000, orders: 245, quantity: 1200, profit: 58000, conversion: 4.2 },
    { month: "Feb", revenue: 105000, orders: 267, quantity: 1350, profit: 62000, conversion: 4.0 },
    { month: "Mar", revenue: 112000, orders: 289, quantity: 1450, profit: 65000, conversion: 3.8 },
    { month: "Apr", revenue: 118000, orders: 312, quantity: 1580, profit: 70000, conversion: 4.1 },
    { month: "May", revenue: 125000, orders: 334, quantity: 1670, profit: 75000, conversion: 3.2 },
    { month: "Jun", revenue: 132000, orders: 356, quantity: 1780, profit: 78000, conversion: 3.5 },
  ]

  const sampleInsights = {
    summary: "This is a test dashboard showing sample sales data with various performance metrics and trends.",
    topPerformers: [
      {
        category: "Revenue Growth",
        value: "+34.7%",
        insight: "Strong revenue growth over the 6-month period",
      },
      {
        category: "Order Volume",
        value: "+45.3%",
        insight: "Significant increase in order volume",
      },
    ],
    concerns: [
      {
        category: "Conversion Rate",
        value: "-16.7%",
        recommendation: "Focus on improving website conversion funnel",
      },
    ],
    trends: [
      {
        metric: "Revenue",
        direction: "up",
        percentage: 34.7,
        explanation: "Consistent upward trend in revenue",
      },
    ],
    keyInsights: [
      "Revenue has grown consistently over 6 months",
      "Order volume is increasing month over month",
      "Conversion rate needs attention",
      "Profit margins are stable",
    ],
    recommendations: [
      "Continue current growth strategies",
      "Investigate conversion rate decline",
      "Optimize marketing spend",
      "Focus on customer retention",
    ],
  }

  const sampleSummary = {
    totalRevenue: 690000,
    totalOrders: 1803,
    uniqueCustomers: 1245,
    averageOrderValue: 382.75,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chart Testing Page</h1>
          <p className="text-gray-600">Test the Performance Visualization with sample data</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Data Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Chart Data Points:</strong> {sampleChartData.length}
              </div>
              <div>
                <strong>Revenue Range:</strong> $98K - $132K
              </div>
              <div>
                <strong>Time Period:</strong> Jan - Jun 2024
              </div>
              <div>
                <strong>Data Fields:</strong> Revenue, Orders, Profit, Conversion
              </div>
            </div>
          </CardContent>
        </Card>

        <DataDashboard
          insights={sampleInsights}
          chartData={sampleChartData}
          fileName="test-sales-data.csv"
          recordCount={1803}
          summary={sampleSummary}
          onRefresh={() => window.location.reload()}
        />
      </div>
    </div>
  )
}
