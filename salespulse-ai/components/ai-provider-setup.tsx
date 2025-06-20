"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Brain, CheckCircle, AlertCircle, ExternalLink, Save, Loader2 } from "lucide-react"
import { providers } from "@/lib/ai-providers"

interface AIConfig {
  providerId: string
  modelId: string
  apiKey: string
}

interface AIProviderSetupProps {
  onConfigChange: (config: AIConfig | null) => void
  initialConfig?: AIConfig | null
}

export function AIProviderSetup({ onConfigChange, initialConfig }: AIProviderSetupProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>(initialConfig?.providerId || "")
  const [selectedModel, setSelectedModel] = useState<string>(initialConfig?.modelId || "")
  const [apiKey, setApiKey] = useState<string>(initialConfig?.apiKey || "")
  const [showApiKey, setShowApiKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const selectedProviderData = providers.find((p) => p.id === selectedProvider)

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem("ai-config")
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setSelectedProvider(config.providerId || "")
        setSelectedModel(config.modelId || "")
        setApiKey(config.apiKey || "")
        onConfigChange(config)
      } catch (error) {
        console.error("Failed to load saved config:", error)
      }
    }
  }, [onConfigChange])

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId)
    setSelectedModel("") // Reset model when provider changes
    setTestResult(null)

    const provider = providers.find((p) => p.id === providerId)
    if (provider && provider.models.length > 0) {
      setSelectedModel(provider.models[0])
    }
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    setTestResult(null)
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    setTestResult(null)
  }

  const testConfiguration = async () => {
    if (!selectedProvider || !selectedModel || !apiKey.trim()) {
      setTestResult({ success: false, message: "Please fill in all fields" })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProvider,
          modelId: selectedModel,
          apiKey: apiKey.trim(),
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setTestResult({ success: true, message: "Configuration test successful!" })
      } else {
        setTestResult({ success: false, message: result.error || "Configuration test failed" })
      }
    } catch (error) {
      setTestResult({ success: false, message: "Network error during test" })
    } finally {
      setTesting(false)
    }
  }

  const saveConfiguration = async () => {
    if (!selectedProvider || !selectedModel || !apiKey.trim()) {
      setTestResult({ success: false, message: "Please fill in all fields" })
      return
    }

    setSaving(true)

    const config: AIConfig = {
      providerId: selectedProvider,
      modelId: selectedModel,
      apiKey: apiKey.trim(),
    }

    // Save to localStorage
    localStorage.setItem("ai-config", JSON.stringify(config))

    // Notify parent component
    onConfigChange(config)

    setSaving(false)
    setTestResult({ success: true, message: "Configuration saved successfully!" })
  }

  const clearConfiguration = () => {
    setSelectedProvider("")
    setSelectedModel("")
    setApiKey("")
    setTestResult(null)
    localStorage.removeItem("ai-config")
    onConfigChange(null)
  }

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "openai":
        return "🤖"
      case "xai":
        return "⚡"
      case "anthropic":
        return "🧠"
      case "groq":
        return "🚀"
      case "deepseek":
        return "🔍"
      default:
        return "🤖"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Provider Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Configure your preferred AI provider and model. Your API key is stored locally and never sent to our
            servers.
          </AlertDescription>
        </Alert>

        {/* Provider Selection */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={selectedProvider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an AI provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      <span>{getProviderIcon(provider.id)}</span>
                      <span>{provider.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          {selectedProviderData && (
            <div>
              <Label htmlFor="model">Model</Label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProviderData.models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* API Key Input */}
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Enter your API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Provider Information */}
        {selectedProviderData && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium flex items-center gap-2">
                  <span>{getProviderIcon(selectedProviderData.id)}</span>
                  {selectedProviderData.name}
                </h4>
                <Button variant="outline" size="sm" asChild>
                  <a href={selectedProviderData.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Get API Key
                  </a>
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-3">{selectedProviderData.description}</p>
              <div className="flex flex-wrap gap-1">
                {selectedProviderData.models.map((model) => (
                  <Badge key={model} variant={model === selectedModel ? "default" : "secondary"} className="text-xs">
                    {model}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Result */}
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={testConfiguration}
            disabled={testing || !selectedProvider || !selectedModel || !apiKey.trim()}
            variant="outline"
            className="flex-1"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              "Test Configuration"
            )}
          </Button>

          <Button
            onClick={saveConfiguration}
            disabled={saving || !selectedProvider || !selectedModel || !apiKey.trim()}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save & Use
              </>
            )}
          </Button>

          {(selectedProvider || selectedModel || apiKey) && (
            <Button onClick={clearConfiguration} variant="outline">
              Clear
            </Button>
          )}
        </div>

        {/* Setup Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Quick Setup Guide:</h4>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>1. Choose your preferred AI provider above</li>
              <li>2. Click "Get API Key" to create an account and get your key</li>
              <li>3. Paste your API key and select a model</li>
              <li>4. Test the configuration to ensure it works</li>
              <li>5. Save to start using AI-powered insights!</li>
            </ol>

            <div className="mt-4 space-y-2">
              <h5 className="font-medium text-sm">Popular Choices:</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  • <strong>OpenAI GPT-4o:</strong> Most advanced, excellent for complex analysis
                </p>
                <p>
                  • <strong>xAI Grok-3:</strong> Fast and efficient, real-time insights
                </p>
                <p>
                  • <strong>Claude Sonnet:</strong> Great reasoning, detailed business analysis
                </p>
                <p>
                  • <strong>Groq Llama:</strong> Ultra-fast inference, high performance
                </p>
                <p>
                  • <strong>DeepSeek:</strong> Cost-effective with strong analytical capabilities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
