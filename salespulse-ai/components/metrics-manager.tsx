"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Save, RefreshCw, Loader2 } from "lucide-react"
import type { MetricData } from "@/lib/metrics-service"

export function MetricsManager() {
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newMetric, setNewMetric] = useState({
    name: "",
    currentValue: 0,
    previousValue: 0,
    category: "financial",
    trend: "up" as "up" | "down",
  })

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/metrics")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics || [])
      } else {
        console.error("Failed to fetch metrics")
        setMetrics([])
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
      setMetrics([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddMetric = async () => {
    if (!newMetric.name || newMetric.currentValue === 0) return

    setSaving(true)
    const change =
      newMetric.previousValue !== 0
        ? ((newMetric.currentValue - newMetric.previousValue) / newMetric.previousValue) * 100
        : 0
    const trend = change >= 0 ? "up" : "down"

    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMetric,
          change: Number.parseFloat(change.toFixed(2)),
          trend,
        }),
      })

      if (response.ok) {
        setNewMetric({
          name: "",
          currentValue: 0,
          previousValue: 0,
          category: "financial",
          trend: "up",
        })
        fetchMetrics()
      } else {
        console.error("Failed to add metric")
      }
    } catch (error) {
      console.error("Failed to add metric:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading metrics...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Metrics Management
            <Button onClick={fetchMetrics} disabled={loading} size="sm" variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {metrics.map((metric, index) => (
                <Card key={metric.id || metric.name || index} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{metric.name || "Unknown Metric"}</h3>
                    <Badge variant={metric.trend === "up" ? "default" : "destructive"}>
                      {metric.change && metric.change > 0 ? "+" : ""}
                      {metric.change?.toFixed(1) || "0"}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold mb-1">{metric.currentValue?.toLocaleString() || "0"}</div>
                  <div className="text-sm text-gray-500">Previous: {metric.previousValue?.toLocaleString() || "0"}</div>
                  <div className="text-xs text-gray-400 mt-2">Category: {metric.category || "Unknown"}</div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No metrics found. Add your first metric below.</p>
            </div>
          )}

          <Card className="p-4 bg-gray-50">
            <h3 className="font-semibold mb-4 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Metric
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="name">Metric Name</Label>
                <Input
                  id="name"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                  placeholder="e.g., Monthly Revenue"
                />
              </div>
              <div>
                <Label htmlFor="current">Current Value</Label>
                <Input
                  id="current"
                  type="number"
                  value={newMetric.currentValue}
                  onChange={(e) => setNewMetric({ ...newMetric, currentValue: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="previous">Previous Value</Label>
                <Input
                  id="previous"
                  type="number"
                  value={newMetric.previousValue}
                  onChange={(e) =>
                    setNewMetric({ ...newMetric, previousValue: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newMetric.category}
                  onValueChange={(value) => setNewMetric({ ...newMetric, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddMetric} className="w-full" disabled={saving || !newMetric.name}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Metric
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
