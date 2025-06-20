"use client"

import { useState, useEffect } from "react"
import { MetricsManager } from "@/components/metrics-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Settings, BarChart3, Loader2 } from "lucide-react"

export default function AdminPage() {
  const [stats, setStats] = useState({
    metricsCount: 0,
    dataPoints: 0,
    connected: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/metrics")
      if (response.ok) {
        const data = await response.json()
        setStats({
          metricsCount: data.metrics?.length || 0,
          dataPoints: 42, // Mock value for now
          connected: true,
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      setStats({
        metricsCount: 0,
        dataPoints: 0,
        connected: false,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            SalesPulse AI - Admin Panel
          </h1>
          <p className="text-gray-600">Manage your business metrics and database settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Status</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Checking...</span>
                </div>
              ) : (
                <>
                  <div className={`text-2xl font-bold ${stats.connected ? "text-green-600" : "text-red-600"}`}>
                    {stats.connected ? "Connected" : "Disconnected"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.connected ? "Supabase integration active" : "Database connection failed"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Metrics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.metricsCount}</div>
              <p className="text-xs text-muted-foreground">Metrics being tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dataPoints}</div>
              <p className="text-xs text-muted-foreground">Historical records</p>
            </CardContent>
          </Card>
        </div>

        <MetricsManager />
      </div>
    </div>
  )
}
