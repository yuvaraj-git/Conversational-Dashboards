import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Clear localStorage data (this will be handled on the client side)
    // Here we can add any server-side cleanup if needed

    return NextResponse.json({
      success: true,
      message: "Previous data cleared successfully",
    })
  } catch (error) {
    console.error("Error clearing data:", error)
    return NextResponse.json({ error: "Failed to clear previous data" }, { status: 500 })
  }
}
