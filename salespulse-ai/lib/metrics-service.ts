import { createClient } from "@supabase/supabase-js"

// Safe Supabase client creation with fallback
let supabase: any = null
let databaseAvailable = false

try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    databaseAvailable = true
  }
} catch (error) {
  console.warn("Supabase not configured, using fallback data")
  databaseAvailable = false
}

export interface MetricData {
  id?: string
  name: string
  currentValue: number
  previousValue: number
  change: number
  trend: "up" | "down"
  category: string
  createdAt?: string
  updatedAt?: string
}

export interface HistoricalMetric {
  id?: string
  metricName: string
  value: number
  month: string
  year: number
  createdAt?: string
}

export async function getMetricsData(): Promise<MetricData[]> {
  if (!databaseAvailable) {
    return getFallbackMetrics()
  }

  try {
    const { data, error } = await supabase.from("metrics").select("*").order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching metrics:", error)
      return getFallbackMetrics()
    }

    // Transform database fields to match our interface
    const transformedData =
      data?.map((item) => ({
        id: item.id,
        name: item.name,
        currentValue: item.current_value || 0,
        previousValue: item.previous_value || 0,
        change: item.change || 0,
        trend: item.trend || "up",
        category: item.category || "unknown",
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || []

    return transformedData.length > 0 ? transformedData : getFallbackMetrics()
  } catch (error) {
    console.error("Database connection error:", error)
    return getFallbackMetrics()
  }
}

export async function updateMetric(
  metric: Omit<MetricData, "id" | "createdAt" | "updatedAt">,
): Promise<MetricData | null> {
  if (!databaseAvailable) {
    console.warn("Database not available for metric updates")
    return null
  }

  try {
    const { data, error } = await supabase
      .from("metrics")
      .upsert(
        {
          name: metric.name,
          current_value: metric.currentValue,
          previous_value: metric.previousValue,
          change: metric.change,
          trend: metric.trend,
          category: metric.category,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "name",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("Error updating metric:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      currentValue: data.current_value,
      previousValue: data.previous_value,
      change: data.change,
      trend: data.trend,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error("Error updating metric:", error)
    return null
  }
}

export async function getHistoricalData() {
  if (!databaseAvailable) {
    return getFallbackHistoricalData()
  }

  try {
    const { data, error } = await supabase
      .from("historical_metrics")
      .select("*")
      .order("year", { ascending: true })
      .order("month", { ascending: true })

    if (error) {
      console.error("Error fetching historical data:", error)
      return getFallbackHistoricalData()
    }

    // Transform data for chart consumption
    const chartData =
      data?.reduce((acc: any[], item) => {
        const existingMonth = acc.find((d) => d.month === item.month && d.year === item.year)
        if (existingMonth) {
          existingMonth[item.metric_name.toLowerCase().replace(/\s+/g, "_")] = item.value
        } else {
          acc.push({
            month: item.month,
            year: item.year,
            [item.metric_name.toLowerCase().replace(/\s+/g, "_")]: item.value,
          })
        }
        return acc
      }, []) || []

    return chartData.length > 0 ? chartData : getFallbackHistoricalData()
  } catch (error) {
    console.error("Database connection error:", error)
    return getFallbackHistoricalData()
  }
}

export async function addHistoricalMetric(
  metric: Omit<HistoricalMetric, "id" | "createdAt">,
): Promise<HistoricalMetric | null> {
  if (!databaseAvailable) {
    console.warn("Database not available for historical metrics")
    return null
  }

  try {
    const { data, error } = await supabase
      .from("historical_metrics")
      .insert({
        metric_name: metric.metricName,
        value: metric.value,
        month: metric.month,
        year: metric.year,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding historical metric:", error)
      return null
    }

    return {
      id: data.id,
      metricName: data.metric_name,
      value: data.value,
      month: data.month,
      year: data.year,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error("Error adding historical metric:", error)
    return null
  }
}

// Fallback data in case database is not available
function getFallbackMetrics(): MetricData[] {
  return [
    {
      name: "Revenue",
      currentValue: 125000,
      previousValue: 118000,
      change: 5.9,
      trend: "up",
      category: "financial",
    },
    {
      name: "Gross Profit",
      currentValue: 75000,
      previousValue: 70000,
      change: 7.1,
      trend: "up",
      category: "financial",
    },
    {
      name: "Conversion Rate",
      currentValue: 3.2,
      previousValue: 4.1,
      change: -22.0,
      trend: "down",
      category: "performance",
    },
    {
      name: "Customer Retention Rate",
      currentValue: 87.5,
      previousValue: 89.2,
      change: -1.9,
      trend: "down",
      category: "customer",
    },
    {
      name: "Cost Per Acquisition",
      currentValue: 45,
      previousValue: 38,
      change: 18.4,
      trend: "down",
      category: "marketing",
    },
    {
      name: "Customer Satisfaction Score",
      currentValue: 4.6,
      previousValue: 4.4,
      change: 4.5,
      trend: "up",
      category: "customer",
    },
    {
      name: "Average Order Value",
      currentValue: 89.5,
      previousValue: 82.3,
      change: 8.7,
      trend: "up",
      category: "financial",
    },
  ]
}

function getFallbackHistoricalData() {
  return [
    { month: "Jan", revenue: 98000, profit: 58000, conversion: 4.2 },
    { month: "Feb", revenue: 105000, profit: 62000, conversion: 4.0 },
    { month: "Mar", revenue: 112000, profit: 65000, conversion: 3.8 },
    { month: "Apr", revenue: 118000, profit: 70000, conversion: 4.1 },
    { month: "May", revenue: 125000, profit: 75000, conversion: 3.2 },
    { month: "Jun", revenue: 132000, profit: 78000, conversion: 3.5 },
  ]
}
