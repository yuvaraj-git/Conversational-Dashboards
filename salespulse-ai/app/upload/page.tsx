"use client"

import { useState } from "react"
import { CSVUpload } from "@/components/csv-upload"
import { DataDashboard } from "@/components/data-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const handleUploadSuccess = (result: any) => {
    console.log("Upload success result:", result)
    console.log("Chart data from upload:", result.chartData)
    setUploadResult(result)
    setError("")
  }

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage)
    setUploadResult(null)
  }

  const handleReset = () => {
    setUploadResult(null)
    setError("")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Upload className="h-8 w-8" />
            Upload & Analyze Sales Data
          </h1>
          <p className="text-gray-600">Upload your CSV file to get AI-powered insights and comprehensive analytics</p>
        </div>

        {!uploadResult ? (
          <div className="max-w-2xl mx-auto">
            <CSVUpload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />

            {error && (
              <Card className="mt-6 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Sample CSV Format Guide */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Sample CSV Format</h3>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div>Date,Product,Revenue,Quantity,Customer,Region,Category</div>
                  <div>2024-01-15,Widget A,299.99,2,John Doe,North,Electronics</div>
                  <div>2024-01-16,Widget B,149.50,1,Jane Smith,South,Electronics</div>
                  <div>2024-01-17,Service X,89.00,1,Bob Johnson,East,Services</div>
                </div>
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Tips for best results:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Include date, revenue/sales, and quantity columns</li>
                    <li>Use consistent date formats (YYYY-MM-DD preferred)</li>
                    <li>Include customer and product information when available</li>
                    <li>Add categorical data like region, product type, etc.</li>
                    <li>Ensure numeric values don't contain currency symbols</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Analysis Complete!</h2>
                <p className="text-gray-600">Your data has been processed and analyzed</p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                Upload New File
              </Button>
            </div>

            <DataDashboard
              insights={uploadResult.insights}
              chartData={uploadResult.chartData || []}
              fileName={uploadResult.fileName}
              recordCount={uploadResult.recordCount}
              summary={uploadResult.summary || {}}
              onRefresh={handleReset}
            />
          </div>
        )}
      </div>
    </div>
  )
}
