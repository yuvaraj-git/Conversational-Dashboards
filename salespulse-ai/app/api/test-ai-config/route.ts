import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createModel } from "@/lib/ai-providers"

export async function POST(request: NextRequest) {
  try {
    const { providerId, modelId, apiKey } = await request.json()

    if (!providerId || !modelId || !apiKey) {
      return NextResponse.json({ error: "Provider ID, model ID, and API key are required" }, { status: 400 })
    }

    // Create the AI model with the provided configuration
    const aiModel = createModel(providerId, modelId, apiKey.trim())

    // Test the model with a simple prompt
    const { text } = await generateText({
      model: aiModel,
      prompt: "Say 'Configuration test successful!' in exactly those words.",
      maxTokens: 20,
    })

    const isWorking = text.trim().includes("Configuration test successful!")

    return NextResponse.json({
      success: true,
      provider: providerId,
      model: modelId,
      response: text.trim(),
      working: isWorking,
    })
  } catch (error) {
    console.error("AI configuration test failed:", error)

    let errorMessage = "Configuration test failed"
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "Invalid API key or insufficient permissions"
      } else if (error.message.includes("model")) {
        errorMessage = "Model not available or access denied"
      } else if (error.message.includes("quota") || error.message.includes("limit")) {
        errorMessage = "API quota exceeded or rate limit reached"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
