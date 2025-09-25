"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AISettings {
  openRouterApiKey: string
  defaultModel: string
  projectSummaryPrompt: string
  callAnalysisPrompt: string
  scopeAnalysisPrompt: string
  temperature: number
  maxTokens: number
}

interface IntegrationsSettings {
  fireflies: {
    enabled: boolean
    apiKey: string
    workspaceId: string
    autoSync: boolean
  }
  scopestack: {
    enabled: boolean
    apiKey: string
    baseUrl: string
  }
  slack: {
    enabled: boolean
    webhookUrl: string
    channel: string
  }
}

interface Settings {
  ai: AISettings
  integrations: IntegrationsSettings
}

const defaultSettings: Settings = {
  ai: {
    openRouterApiKey: "",
    defaultModel: "anthropic/claude-3.5-sonnet",
    projectSummaryPrompt: `Analyze this project data and create a comprehensive summary. Include:

1. Project Overview: Current status, client, and key objectives
2. Progress Analysis: What's been completed and what's pending
3. Key Insights: Important findings from call recordings and scope
4. Risk Assessment: Potential challenges or blockers
5. Next Steps: Recommended actions for project advancement

Use the following context:
- Call recordings: {callRecordings}
- Scope services: {scopeServices}
- Project notes: {notes}
- Project status: {status}
- Client: {client}

Provide actionable insights and maintain a professional, consultative tone.`,
    callAnalysisPrompt: `Analyze these call recordings and extract:

1. Key decisions made
2. Action items and owners
3. Technical requirements discussed
4. Timeline and milestone changes
5. Stakeholder concerns or feedback

Context: {callRecordings}

Format as structured insights with clear action items.`,
    scopeAnalysisPrompt: `Review the project scope and provide:

1. Scope completeness assessment
2. Resource allocation analysis
3. Timeline feasibility
4. Risk areas or gaps
5. Optimization opportunities

Scope data: {scopeServices}

Focus on practical recommendations for scope management.`,
    temperature: 0.7,
    maxTokens: 2000
  },
  integrations: {
    fireflies: {
      enabled: false,
      apiKey: "",
      workspaceId: "",
      autoSync: false
    },
    scopestack: {
      enabled: true,
      apiKey: "",
      baseUrl: "https://api.scopestack.io"
    },
    slack: {
      enabled: false,
      webhookUrl: "",
      channel: "#projects"
    }
  }
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  generateAIContent: (type: 'summary' | 'call' | 'scope', variables: any) => Promise<string>
  isAIConfigured: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('vsa-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }, [])

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = {
      ...settings,
      ...newSettings,
      ai: { ...settings.ai, ...newSettings.ai },
      integrations: { ...settings.integrations, ...newSettings.integrations }
    }

    setSettings(updatedSettings)
    localStorage.setItem('vsa-settings', JSON.stringify(updatedSettings))
  }

  const generateAIContent = async (type: 'summary' | 'call' | 'scope', variables: any): Promise<string> => {
    if (!settings.ai.openRouterApiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    let prompt = ''
    switch (type) {
      case 'summary':
        prompt = settings.ai.projectSummaryPrompt
        break
      case 'call':
        prompt = settings.ai.callAnalysisPrompt
        break
      case 'scope':
        prompt = settings.ai.scopeAnalysisPrompt
        break
      default:
        throw new Error('Invalid AI content type')
    }

    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: settings.ai.openRouterApiKey,
        model: settings.ai.defaultModel,
        prompt,
        variables,
        temperature: settings.ai.temperature,
        maxTokens: settings.ai.maxTokens
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate AI content')
    }

    const data = await response.json()
    return data.content
  }

  const isAIConfigured = Boolean(settings.ai.openRouterApiKey)

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      generateAIContent,
      isAIConfigured
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}