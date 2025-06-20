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
  console.warn("Supabase not configured, using in-memory storage")
  databaseAvailable = false
}

export interface CSVData {
  [key: string]: string | number | Date
}

export interface DataAnalysis {
  structure: {
    columns: string[]
    rowCount: number
    dataTypes: Record<string, string>
  }
  summary: {
    totalRevenue?: number
    averageOrderValue?: number
    totalOrders?: number
    uniqueCustomers?: number
    dateRange?: { start: string; end: string }
  }
  chartData: any[]
}

// In-memory storage for when database is not available
const inMemoryStorage: { [key: string]: any } = {}

export async function parseCSV(csvText: string): Promise<CSVData[]> {
  try {
    const lines = csvText
      .trim()
      .split("\n")
      .filter((line) => line.trim().length > 0)
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row")
    }

    // Handle different delimiters and quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          result.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }

      result.push(current.trim())
      return result
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.replace(/"/g, ""))
    const data: CSVData[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map((v) => v.replace(/"/g, ""))

      // Skip rows that don't have the right number of columns
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i + 1}: expected ${headers.length} columns, got ${values.length}`)
        continue
      }

      const row: CSVData = {}
      headers.forEach((header, index) => {
        let value: string | number | Date = values[index] || ""

        // Clean and parse currency values
        if (typeof value === "string" && value.match(/^[$€£¥]?[\d,]+\.?\d*$/)) {
          const cleanValue = value.replace(/[$€£¥,]/g, "")
          if (!isNaN(Number(cleanValue))) {
            value = Number(cleanValue)
          }
        }
        // Try to parse as number
        else if (!isNaN(Number(value)) && value !== "" && value !== "0") {
          value = Number(value)
        }
        // Try to parse as date
        else if (isValidDate(value as string)) {
          value = new Date(value as string)
        }

        row[header] = value
      })
      data.push(row)
    }

    if (data.length === 0) {
      throw new Error("No valid data rows found in CSV")
    }

    return data
  } catch (error) {
    console.error("Error parsing CSV:", error)
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function analyzeCSVData(data: CSVData[]): Promise<DataAnalysis> {
  const columns = Object.keys(data[0] || {})
  const rowCount = data.length

  // Determine data types
  const dataTypes: Record<string, string> = {}
  columns.forEach((col) => {
    const sampleValues = data
      .slice(0, 5)
      .map((row) => row[col])
      .filter((val) => val !== null && val !== undefined && val !== "")

    if (sampleValues.length === 0) {
      dataTypes[col] = "string"
      return
    }

    const firstValue = sampleValues[0]
    if (typeof firstValue === "number") {
      dataTypes[col] = "number"
    } else if (firstValue instanceof Date) {
      dataTypes[col] = "date"
    } else {
      dataTypes[col] = "string"
    }
  })

  // Calculate summary statistics
  const summary: DataAnalysis["summary"] = {}

  // Find revenue-related columns (case insensitive)
  const revenueCol = findColumn(columns, ["revenue", "sales", "amount", "total", "price", "value"])
  const quantityCol = findColumn(columns, ["quantity", "qty", "count", "units", "items"])
  const dateCol = findColumn(columns, ["date", "created", "order_date", "timestamp", "time"])
  const customerCol = findColumn(columns, ["customer", "client", "user", "buyer", "name"])

  if (revenueCol) {
    const revenues = data.map((row) => Number(row[revenueCol]) || 0).filter((r) => r > 0)

    if (revenues.length > 0) {
      summary.totalRevenue = revenues.reduce((sum, val) => sum + val, 0)
      summary.averageOrderValue = summary.totalRevenue / revenues.length
    }
  }

  if (quantityCol) {
    const quantities = data.map((row) => Number(row[quantityCol]) || 0)
    summary.totalOrders = quantities.reduce((sum, val) => sum + val, 0)
  } else {
    // If no quantity column, count rows as orders
    summary.totalOrders = data.length
  }

  if (customerCol) {
    const uniqueCustomers = new Set(data.map((row) => row[customerCol]).filter((c) => c && c !== ""))
    summary.uniqueCustomers = uniqueCustomers.size
  }

  if (dateCol) {
    const dates = data
      .map((row) => {
        const dateValue = row[dateCol]
        if (dateValue instanceof Date) return dateValue
        return new Date(dateValue as string)
      })
      .filter((d) => !isNaN(d.getTime()))

    if (dates.length > 0) {
      dates.sort((a, b) => a.getTime() - b.getTime())
      summary.dateRange = {
        start: dates[0].toISOString().split("T")[0],
        end: dates[dates.length - 1].toISOString().split("T")[0],
      }
    }
  }

  // Prepare chart data
  const chartData = prepareChartData(data, { revenueCol, dateCol, quantityCol })

  return {
    structure: { columns, rowCount, dataTypes },
    summary,
    chartData,
  }
}

export async function storeCSVData(data: CSVData[], fileName: string) {
  const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  if (databaseAvailable && supabase) {
    try {
      // Try to store in Supabase
      const { data: uploadRecord, error: uploadError } = await supabase
        .from("csv_uploads")
        .insert({
          file_name: fileName,
          row_count: data.length,
          columns: Object.keys(data[0] || {}),
          uploaded_at: new Date().toISOString(),
          status: "completed",
        })
        .select()
        .single()

      if (uploadError) {
        throw new Error(`Database error: ${uploadError.message}`)
      }

      // Store actual data (first 1000 rows to avoid size limits)
      if (data.length > 0) {
        const dataToStore = data.slice(0, 1000).map((row, index) => ({
          upload_id: uploadRecord.id,
          row_index: index,
          data: row,
        }))

        const { error: dataError } = await supabase.from("csv_data").insert(dataToStore)
        if (dataError) {
          console.warn("Failed to store CSV data rows:", dataError.message)
        }
      }

      return uploadRecord
    } catch (error) {
      console.warn("Database storage failed, using in-memory storage:", error)
      // Fall through to in-memory storage
    }
  }

  // Use in-memory storage as fallback
  const uploadRecord = {
    id: uploadId,
    file_name: fileName,
    row_count: data.length,
    columns: Object.keys(data[0] || {}),
    uploaded_at: new Date().toISOString(),
    status: "completed",
  }

  // Store in memory
  inMemoryStorage[uploadId] = {
    metadata: uploadRecord,
    data: data.slice(0, 1000), // Limit to 1000 rows
  }

  return uploadRecord
}

function findColumn(columns: string[], patterns: string[]): string | null {
  for (const pattern of patterns) {
    const found = columns.find((col) => col.toLowerCase().includes(pattern.toLowerCase()))
    if (found) return found
  }
  return null
}

function isValidDate(value: string): boolean {
  if (!value || value.length < 6) return false

  // Common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
  ]

  const matchesPattern = datePatterns.some((pattern) => pattern.test(value))
  if (!matchesPattern) return false

  const date = new Date(value)
  return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100
}

function prepareChartData(
  data: CSVData[],
  columns: { revenueCol?: string | null; dateCol?: string | null; quantityCol?: string | null },
) {
  if (!columns.dateCol) {
    // If no date column, create simple sequential data
    return data.slice(0, 12).map((row, index) => ({
      month: `Month ${index + 1}`,
      revenue: columns.revenueCol ? Number(row[columns.revenueCol]) || 0 : 0,
      quantity: columns.quantityCol ? Number(row[columns.quantityCol]) || 0 : 1,
      orders: 1,
    }))
  }

  // Group by month
  const monthlyData: Record<string, { revenue: number; quantity: number; orders: number }> = {}

  data.forEach((row) => {
    const dateValue = row[columns.dateCol!]
    let date: Date

    if (dateValue instanceof Date) {
      date = dateValue
    } else {
      date = new Date(dateValue as string)
    }

    if (isNaN(date.getTime())) return

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, quantity: 0, orders: 0 }
    }

    if (columns.revenueCol) {
      monthlyData[monthKey].revenue += Number(row[columns.revenueCol]) || 0
    }
    if (columns.quantityCol) {
      monthlyData[monthKey].quantity += Number(row[columns.quantityCol]) || 0
    }
    monthlyData[monthKey].orders += 1
  })

  const sortedEntries = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // Last 12 months

  return sortedEntries.map(([month, data]) => ({
    month: formatMonth(month),
    revenue: Math.round(data.revenue),
    quantity: data.quantity,
    orders: data.orders,
  }))
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-")
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${monthNames[Number.parseInt(month) - 1]} ${year.slice(2)}`
}
