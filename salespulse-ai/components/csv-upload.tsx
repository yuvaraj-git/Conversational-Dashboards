"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, X, Brain, Trash2, RefreshCw } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface CSVUploadProps {
  onUploadSuccess: (data: any) => void
  onUploadError: (error: string) => void
}

interface AIConfig {
  providerId: string
  modelId: string
  apiKey: string
}

export function CSVUpload({ onUploadSuccess, onUploadError }: CSVUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [error, setError] = useState<string>("")
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null)
  const [clearingData, setClearingData] = useState(false)
  const [hasPreviousData, setHasPreviousData] = useState(false)

  // Load AI config on component mount
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
    setHasPreviousData(!!(previousAnalysis || previousInsights))
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setError("")
      previewCSV(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const previewCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").slice(0, 6) // Preview first 5 rows + header
        const preview = lines.map((line) => {
          // Simple CSV parsing for preview
          const cells = []
          let current = ""
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === "," && !inQuotes) {
              cells.push(current.trim())
              current = ""
            } else {
              current += char
            }
          }
          cells.push(current.trim())
          return cells
        })
        setPreviewData(preview)
      } catch (error) {
        console.error("Preview error:", error)
        setPreviewData([])
      }
    }
    reader.readAsText(file)
  }

  const clearPreviousData = async () => {
    setClearingData(true)
    try {
      // Clear localStorage data
      localStorage.removeItem("previous-analysis")
      localStorage.removeItem("dashboard-insights")
      localStorage.removeItem("csv-analysis-cache")
      localStorage.removeItem("last-upload-result")

      // Call API to clear any server-side data if needed
      await fetch("/api/clear-data", {
        method: "POST",
      })

      setHasPreviousData(false)

      // Show success message
      alert("Previous analysis data cleared successfully! Your next upload will start fresh.")
    } catch (error) {
      console.error("Failed to clear data:", error)
      alert("Failed to clear previous data. Please try again.")
    } finally {
      setClearingData(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) return

    setUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)

      // Include AI config if available
      if (aiConfig) {
        formData.append("aiConfig", JSON.stringify(aiConfig))
      }

      // Add flag to indicate this is a fresh analysis
      formData.append("clearPrevious", "true")

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/csv/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const result = await response.json()

      // Store the current analysis result
      localStorage.setItem("last-upload-result", JSON.stringify(result))
      setHasPreviousData(true)

      onUploadSuccess(result)

      // Reset form after success
      setTimeout(() => {
        setUploadedFile(null)
        setPreviewData([])
        setUploadProgress(0)
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      setError(errorMessage)
      onUploadError(errorMessage)
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setPreviewData([])
    setError("")
    setUploadProgress(0)
  }

  return (
    <div className="space-y-4">
      {/* AI Status Alert */}
      <Alert className={aiConfig ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
        {aiConfig ? <CheckCircle className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
        <AlertDescription>
          {aiConfig ? (
            <span>
              <strong>AI Configured:</strong> Using {aiConfig.providerId}/{aiConfig.modelId} for enhanced analysis
            </span>
          ) : (
            <span>
              <strong>Basic Analysis Mode:</strong> Configure an AI provider on the main dashboard for advanced insights
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Clear Previous Data Section */}
      {hasPreviousData && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Previous Analysis Detected:</strong> Clear previous data to analyze only your new upload
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearPreviousData}
              disabled={clearingData}
              className="ml-4 bg-white hover:bg-gray-50"
            >
              {clearingData ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear Previous Data
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Sales Data (CSV)
            </div>
            {hasPreviousData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearPreviousData}
                disabled={clearingData}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {clearingData ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Previous
                  </>
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop your CSV file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">Drag & drop your sales CSV file here, or click to select</p>
                  <p className="text-sm text-gray-500">Supports CSV files up to 10MB</p>
                  {hasPreviousData && (
                    <p className="text-sm text-blue-600 mt-2">
                      💡 Tip: Clear previous data above for fresh analysis of this file only
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={removeFile} disabled={uploading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {previewData.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Data Preview</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {previewData[0]?.map((header, index) => (
                              <th key={index} className="px-3 py-2 text-left font-medium">
                                {header.replace(/"/g, "")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(1, 5).map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-3 py-2">
                                  {cell.replace(/"/g, "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {previewData.length > 6 && (
                      <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600 text-center">... and more rows</div>
                    )}
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {aiConfig ? "Processing with AI analysis..." : "Processing data..."}
                      {hasPreviousData ? " (Fresh analysis mode)" : ""}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-gray-500">
                    {aiConfig
                      ? `Parsing CSV, analyzing data structure, and generating AI insights using ${aiConfig.providerId}...`
                      : "Parsing CSV and analyzing data structure..."}
                    {hasPreviousData && " Previous data will be replaced with this analysis."}
                  </p>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                  {uploading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {aiConfig ? "Analyze with AI" : "Analyze Data"}
                      {hasPreviousData ? " (Fresh)" : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>Supported formats:</strong>
            </p>
            <p>• CSV files with headers (Date, Product, Revenue, Quantity, Customer, etc.)</p>
            <p>• Date formats: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY</p>
            <p>• Currency values: $100, €50, £75 (symbols will be automatically removed)</p>
            <p>
              • {aiConfig ? "AI-powered insights enabled" : "Basic analysis mode - configure AI for advanced insights"}
            </p>
            {hasPreviousData && (
              <p className="text-blue-600">
                • <strong>Fresh Analysis:</strong> Use "Clear Previous Data" to analyze only your new upload
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
