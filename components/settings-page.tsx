"use client"

import { useState } from "react"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Brain,
  Key,
  Phone,
  Zap,
  Save,
  TestTube,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon,
  Bot,
  Users,
  FileText,
  Building2
} from "lucide-react"

interface SettingsPageProps {
  onSettingsUpdate?: (settings: any) => void
}

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

const defaultAISettings: AISettings = {
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
}

const defaultIntegrationsSettings: IntegrationsSettings = {
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

export function SettingsPage({ onSettingsUpdate }: SettingsPageProps) {
  const { settings, updateSettings } = useSettings()
  const [testingPrompt, setTestingPrompt] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleAISettingChange = (key: keyof AISettings, value: any) => {
    updateSettings({
      ai: { ...settings.ai, [key]: value }
    })
    setHasUnsavedChanges(false) // Settings are saved automatically via context
  }

  const handleIntegrationSettingChange = (integration: string, key: string, value: any) => {
    updateSettings({
      integrations: {
        ...settings.integrations,
        [integration]: {
          ...settings.integrations[integration as keyof IntegrationsSettings],
          [key]: value
        }
      }
    })
    setHasUnsavedChanges(false) // Settings are saved automatically via context
  }

  const testAIConnection = async () => {
    setTestingPrompt(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: settings.ai.openRouterApiKey,
          model: settings.ai.defaultModel,
          prompt: "Test connection - respond with a simple confirmation."
        })
      })

      if (response.ok) {
        setTestResult({ success: true, message: "AI connection successful!" })
      } else {
        setTestResult({ success: false, message: "Failed to connect to AI service" })
      }
    } catch (error) {
      setTestResult({ success: false, message: "Error testing AI connection" })
    } finally {
      setTestingPrompt(false)
    }
  }


  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            Settings
          </h1>
          <p className="text-gray-600">Configure AI prompts, integrations, and application preferences</p>
        </div>

      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Configuration
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            General
          </TabsTrigger>
        </TabsList>

        {/* AI Configuration Tab */}
        <TabsContent value="ai" className="space-y-6">
          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                OpenRouter API Configuration
              </CardTitle>
              <CardDescription>
                Configure your OpenRouter API key and model preferences for AI-powered features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="or-..."
                    value={settings.ai.openRouterApiKey}
                    onChange={(e) => handleAISettingChange('openRouterApiKey', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Default Model</Label>
                  <Select
                    value={settings.ai.defaultModel}
                    onValueChange={(value) => handleAISettingChange('defaultModel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku</SelectItem>
                      <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature: {settings.ai.temperature}</Label>
                  <input
                    type="range"
                    id="temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.ai.temperature}
                    onChange={(e) => handleAISettingChange('temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="100"
                    max="4000"
                    value={settings.ai.maxTokens}
                    onChange={(e) => handleAISettingChange('maxTokens', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={testAIConnection} disabled={testingPrompt || !settings.ai.openRouterApiKey} variant="outline">
                  <TestTube className="w-4 h-4 mr-2" />
                  {testingPrompt ? 'Testing...' : 'Test Connection'}
                </Button>

                {testResult && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded ${
                    testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {testResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {testResult.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Prompts Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Prompts Configuration
              </CardTitle>
              <CardDescription>
                Customize the prompts used for different AI analysis tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project-summary-prompt">Project Summary Prompt</Label>
                <Textarea
                  id="project-summary-prompt"
                  rows={8}
                  placeholder="Enter the prompt for project summaries..."
                  value={settings.ai.projectSummaryPrompt}
                  onChange={(e) => handleAISettingChange('projectSummaryPrompt', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Available variables: {'{callRecordings}'}, {'{scopeServices}'}, {'{notes}'}, {'{status}'}, {'{client}'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="call-analysis-prompt">Call Analysis Prompt</Label>
                <Textarea
                  id="call-analysis-prompt"
                  rows={6}
                  placeholder="Enter the prompt for call recording analysis..."
                  value={settings.ai.callAnalysisPrompt}
                  onChange={(e) => handleAISettingChange('callAnalysisPrompt', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Available variables: {'{callRecordings}'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope-analysis-prompt">Scope Analysis Prompt</Label>
                <Textarea
                  id="scope-analysis-prompt"
                  rows={6}
                  placeholder="Enter the prompt for scope analysis..."
                  value={settings.ai.scopeAnalysisPrompt}
                  onChange={(e) => handleAISettingChange('scopeAnalysisPrompt', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Available variables: {'{scopeServices}'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Fireflies Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Fireflies Integration
              </CardTitle>
              <CardDescription>
                Connect to Fireflies to automatically import call recordings and transcripts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.integrations.fireflies.enabled}
                  onCheckedChange={(checked) => handleIntegrationSettingChange('fireflies', 'enabled', checked)}
                />
                <Label>Enable Fireflies Integration</Label>
              </div>

              {settings.integrations.fireflies.enabled && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label htmlFor="fireflies-api-key">Fireflies API Key</Label>
                    <Input
                      id="fireflies-api-key"
                      type="password"
                      placeholder="Enter your Fireflies API key"
                      value={settings.integrations.fireflies.apiKey}
                      onChange={(e) => handleIntegrationSettingChange('fireflies', 'apiKey', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fireflies-workspace">Workspace ID</Label>
                    <Input
                      id="fireflies-workspace"
                      placeholder="Enter your Fireflies workspace ID"
                      value={settings.integrations.fireflies.workspaceId}
                      onChange={(e) => handleIntegrationSettingChange('fireflies', 'workspaceId', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.integrations.fireflies.autoSync}
                      onCheckedChange={(checked) => handleIntegrationSettingChange('fireflies', 'autoSync', checked)}
                    />
                    <Label>Automatically sync new recordings</Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ScopeStack Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                ScopeStack Integration
              </CardTitle>
              <CardDescription>
                Configure connection to ScopeStack for project and scope management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.integrations.scopestack.enabled}
                  onCheckedChange={(checked) => handleIntegrationSettingChange('scopestack', 'enabled', checked)}
                />
                <Label>Enable ScopeStack Integration</Label>
              </div>

              {settings.integrations.scopestack.enabled && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label htmlFor="scopestack-api-key">ScopeStack API Key</Label>
                    <Input
                      id="scopestack-api-key"
                      type="password"
                      placeholder="Enter your ScopeStack API key"
                      value={settings.integrations.scopestack.apiKey}
                      onChange={(e) => handleIntegrationSettingChange('scopestack', 'apiKey', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scopestack-url">Base URL</Label>
                    <Input
                      id="scopestack-url"
                      placeholder="https://api.scopestack.io"
                      value={settings.integrations.scopestack.baseUrl}
                      onChange={(e) => handleIntegrationSettingChange('scopestack', 'baseUrl', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Slack Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Slack Integration
              </CardTitle>
              <CardDescription>
                Send project updates and notifications to Slack channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.integrations.slack.enabled}
                  onCheckedChange={(checked) => handleIntegrationSettingChange('slack', 'enabled', checked)}
                />
                <Label>Enable Slack Integration</Label>
              </div>

              {settings.integrations.slack.enabled && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label htmlFor="slack-webhook">Webhook URL</Label>
                    <Input
                      id="slack-webhook"
                      placeholder="https://hooks.slack.com/services/..."
                      value={settings.integrations.slack.webhookUrl}
                      onChange={(e) => handleIntegrationSettingChange('slack', 'webhookUrl', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slack-channel">Default Channel</Label>
                    <Input
                      id="slack-channel"
                      placeholder="#projects"
                      value={settings.integrations.slack.channel}
                      onChange={(e) => handleIntegrationSettingChange('slack', 'channel', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                General application settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">General settings will be added here in future updates.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}