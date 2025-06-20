import { anthropic } from "@ai-sdk/anthropic"
import { xai } from "@ai-sdk/xai"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"

export interface AIProvider {
  id: string
  name: string
  models: string[]
  getModel: (modelId: string, apiKey: string) => any
  description: string
  website: string
}

// Define all available providers (not checking env vars here)
export const providers: AIProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
    getModel: (modelId: string, apiKey: string) => openai(modelId, { apiKey }),
    description: "Advanced language models with excellent reasoning and analysis capabilities",
    website: "https://platform.openai.com/",
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    models: ["grok-3", "grok-vision-beta"],
    getModel: (modelId: string, apiKey: string) => xai(modelId, { apiKey }),
    description: "Fast and efficient AI analysis, real-time insights",
    website: "https://console.x.ai/",
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307", "claude-3-opus-20240229"],
    getModel: (modelId: string, apiKey: string) => anthropic(modelId, { apiKey }),
    description: "Excellent reasoning, detailed explanations, great for business analysis",
    website: "https://console.anthropic.com/",
  },
  {
    id: "groq",
    name: "Groq",
    models: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    getModel: (modelId: string, apiKey: string) => groq(modelId, { apiKey }),
    description: "Ultra-fast inference, real-time analysis, high performance",
    website: "https://console.groq.com/",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    models: ["deepseek-chat", "deepseek-coder"],
    getModel: (modelId: string, apiKey: string) => {
      const { openai } = require("@ai-sdk/openai")
      return openai(modelId, {
        baseURL: "https://api.deepseek.com/v1",
        apiKey: apiKey,
      })
    },
    description: "Strong coding and analytical capabilities, cost-effective",
    website: "https://platform.deepseek.com/",
  },
]

export function getProviderById(providerId: string): AIProvider | null {
  return providers.find((p) => p.id === providerId) || null
}

export function createModel(providerId: string, modelId: string, apiKey: string) {
  const provider = getProviderById(providerId)

  if (!provider) {
    throw new Error(`Provider ${providerId} not found`)
  }

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(`API key is required for ${provider.name}`)
  }

  if (!provider.models.includes(modelId)) {
    throw new Error(`Model ${modelId} is not available for ${provider.name}`)
  }

  try {
    return provider.getModel(modelId, apiKey)
  } catch (error) {
    console.error(`Failed to create model ${modelId} for provider ${providerId}:`, error)
    throw new Error(`Failed to initialize ${provider.name} with model ${modelId}`)
  }
}
