"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AIProviderSetup } from "@/components/ai-provider-setup"
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MessageSquare,
  Upload,
  Database,
  Settings,
  CheckCircle,
  AlertCircle,
  Brain,
  Table,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import Link from "next/link"

interface Metric {
  name: string
  value: number
  change: number
  trend: "up" | "down"
  explanation: string
  recommendation: string
}

interface ProductAnalysis {
  product: string
  revenue: number
  units: number
  growth: number
  marketShare: number
  category: string
}

interface TableData {
  title: string
  headers: string[]
  rows: string[][]
}

interface DashboardInsight {
  topMetrics: Metric[]
  poorMetrics: Metric[]
  alerts: string[]
  summary: string
  chartData: any[]
  productAnalysis?: ProductAnalysis[]
  detailedResponse: string
  tables?: TableData[]
}

interface AIConfig {
  providerId: string
  modelId: string
  apiKey: string
}

export default function Dashboard() {
  const [prompt, setPrompt] = useState("")
  const [insights, setInsights] = useState<DashboardInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null)
  const [showAiSetup, setShowAiSetup] = useState(false)
  const [clearingData, setClearingData] = useState(false)
  const [hasPreviousData, setHasPreviousData] = useState(false)

  // Sample prompt for demonstration
  const samplePrompt = "Show me what's working and what's not in our business performance"

  // Check if AI is configured on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("ai-config")
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setAiConfig(config)
      } catch (error) {
        console.error("Failed to load AI config:", error)
      }
    }

    // Check if there's previous analysis data
    const previousAnalysis = localStorage.getItem("previous-analysis")
    const previousInsights = localStorage.getItem("dashboard-insights")
    const lastUpload = localStorage.getItem("last-upload-result")
    setHasPreviousData(!!(previousAnalysis || previousInsights || lastUpload))
  }, [])

  // Poll for real-time alerts
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/alerts")
        const data = await response.json()
        if (data.alerts && data.alerts.length > 0) {
          setAlerts(data.alerts)
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error)
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const clearAllData = async () => {
    setClearingData(true)
    try {
      // Clear all localStorage data
      localStorage.removeItem("previous-analysis")
      localStorage.removeItem("dashboard-insights")
      localStorage.removeItem("csv-analysis-cache")
      localStorage.removeItem("last-upload-result")

      // Clear current insights
      setInsights(null)

      // Call API to clear any server-side data if needed
      await fetch("/api/clear-data", {
        method: "POST",
      })

      setHasPreviousData(false)

      // Show success message
      alert("All previous data cleared successfully! You can now start fresh with new uploads.")
    } catch (error) {
      console.error("Failed to clear data:", error)
      alert("Failed to clear previous data. Please try again.")
    } finally {
      setClearingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    if (!aiConfig) {
      setShowAiSetup(true)
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/dashboard/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, aiConfig }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get insights")
      }

      const data = await response.json()
      console.log("Received insights data:", data)
      console.log("Chart data:", data.chartData)

      // Store insights for future reference
      localStorage.setItem("dashboard-insights", JSON.stringify(data))
      setHasPreviousData(true)

      setInsights(data)
    } catch (error) {
      console.error("Error:", error)
      // Show error to user
      alert(error instanceof Error ? error.message : "Failed to generate insights")
    } finally {
      setLoading(false)
    }
  }

  const handleAiConfigChange = (config: AIConfig | null) => {
    setAiConfig(config)
    if (config) {
      setShowAiSetup(false)
    }
  }

  const MetricCard = ({ metric, type }: { metric: Metric; type: "top" | "poor" }) => (
    <Card className={`${type === "top" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>{metric.name}</span>
          <Badge variant={type === "top" ? "default" : "destructive"} className="flex items-center gap-1">
            {type === "top" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {metric.change > 0 ? "+" : ""}
            {metric.change}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{metric.value.toLocaleString()}</div>
        <div className="text-sm text-gray-600 mb-3">{metric.explanation}</div>
        <div className="text-sm font-medium text-blue-600">💡 {metric.recommendation}</div>
      </CardContent>
    </Card>
  )

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${
                entry.dataKey === "revenue" || entry.dataKey === "profit"
                  ? `$${entry.value.toLocaleString()}`
                  : `${entry.value}%`
              }`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Component to render tables
  const TableComponent = ({ table }: { table: TableData }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table className="h-5 w-5" />
          {table.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                {table.headers.map((header, index) => (
                  <th key={index} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SalesPulse AI</h1>
              <p className="text-gray-600">Conversational Business Performance Dashboard</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV Data
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin">
                  <Database className="h-4 w-4 mr-2" />
                  Admin Panel
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setShowAiSetup(!showAiSetup)}>
                <Settings className="h-4 w-4 mr-2" />
                AI Settings
              </Button>
              {hasPreviousData && (
                <Button
                  variant="outline"
                  onClick={clearAllData}
                  disabled={clearingData}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  {clearingData ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Data Status Alert */}
        {hasPreviousData && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <RefreshCw className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>Previous Analysis Data Found:</strong> Clear all data to start fresh with new uploads only
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllData}
                disabled={clearingData}
                className="ml-4 bg-white hover:bg-gray-50 text-red-600 hover:text-red-700 border-red-200"
              >
                {clearingData ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All Data
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* AI Configuration Status */}
        <Alert className={`mb-6 ${aiConfig ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
          {aiConfig ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>
            {aiConfig ? (
              <span>
                <strong>AI Configured:</strong> Using {aiConfig.providerId} with {aiConfig.modelId} for analysis
              </span>
            ) : (
              <span>
                <strong>AI Not Configured:</strong> Configure an AI provider (OpenAI, xAI, Anthropic, Groq, or DeepSeek)
                to enable advanced insights
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* AI Provider Setup */}
        {showAiSetup && (
          <div className="mb-8">
            <AIProviderSetup onConfigChange={handleAiConfigChange} initialConfig={aiConfig} />
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Upload Your Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload CSV files with your sales data for instant AI-powered analysis
              </p>
              <Button asChild size="sm">
                <Link href="/upload">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ask Questions</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use natural language to query your business data and get insights
              </p>
              <Button variant="outline" size="sm" onClick={() => setPrompt(samplePrompt)}>
                Try Sample Query
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Configure AI</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set up your preferred AI provider for personalized business insights
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowAiSetup(true)}>
                Configure AI
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            {alerts.map((alert, index) => (
              <Alert key={index} className="mb-2 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{alert}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Prompt Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Ask Your Business Question
              {aiConfig && (
                <Badge variant="secondary" className="ml-auto">
                  {aiConfig.providerId}/{aiConfig.modelId}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  aiConfig ? "What are my top selling products?" : "Configure AI provider first to ask questions"
                }
                className="flex-1"
                disabled={loading || !aiConfig}
              />
              <Button type="submit" disabled={loading || !prompt.trim() || !aiConfig}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </form>
            <div className="mt-2 flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("What are my top selling products?")}
                disabled={loading || !aiConfig}
              >
                Top Products
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Show me revenue trends by region")}
                disabled={loading || !aiConfig}
              >
                Regional Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Create a table of product performance with revenue and growth")}
                disabled={loading || !aiConfig}
              >
                Product Table
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Which products are underperforming and need attention?")}
                disabled={loading || !aiConfig}
              >
                Underperforming Products
              </Button>
            </div>
            {!aiConfig && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please configure an AI provider above to start asking questions and getting insights.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Insights Display */}
        {insights && (
          <div className="space-y-8">
            {/* Detailed Response */}
            {insights.detailedResponse && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{insights.detailedResponse}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tables */}
            {insights.tables && insights.tables.length > 0 && (
              <div>
                {insights.tables.map((table, index) => (
                  <TableComponent key={index} table={table} />
                ))}
              </div>
            )}

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Business Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
              </CardContent>
            </Card>

            {/* Top Performing Metrics */}
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.topMetrics.map((metric, index) => (
                  <MetricCard key={index} metric={metric} type="top" />
                ))}
              </div>
            </div>

            {/* Underperforming Metrics */}
            <div>
              <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Areas Needing Attention
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.poorMetrics.map((metric, index) => (
                  <MetricCard key={index} metric={metric} type="poor" />
                ))}
              </div>
            </div>

            {/* Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {insights.chartData && insights.chartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={insights.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8884d8"
                          strokeWidth={3}
                          name="Revenue ($)"
                          dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="profit"
                          stroke="#82ca9d"
                          strokeWidth={3}
                          name="Profit ($)"
                          dot={{ fill: "#82ca9d", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="conversion"
                          stroke="#ffc658"
                          strokeWidth={3}
                          name="Conversion Rate (%)"
                          dot={{ fill: "#ffc658", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No chart data available</p>
                      <p className="text-sm">Try asking a question to generate performance trends</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Initial State */}
        {!insights && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze Your Business</h3>
              <p className="text-gray-600 mb-4">
                {aiConfig
                  ? "Ask detailed questions about your business performance using natural language"
                  : "Configure an AI provider and upload your CSV data to get started"}
              </p>
              <div className="text-sm text-gray-500 mb-6">
                {aiConfig
                  ? 'Try: "What are my top selling products?" or "Create a table of product performance"'
                  : "Choose from OpenAI, xAI, Anthropic, Groq, or DeepSeek for AI-powered insights"}
              </div>
              <div className="flex justify-center gap-4">
                {aiConfig ? (
                  <>
                    <Button asChild>
                      <Link href="/upload">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload CSV Data
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => setPrompt("What are my top selling products?")}>
                      Ask About Products
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setShowAiSetup(true)}>
                    <Brain className="h-4 w-4 mr-2" />
                    Configure AI Provider
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
