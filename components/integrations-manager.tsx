"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Building2,
  Phone,
  CheckCircle,
  AlertCircle,
  Settings,
  Loader2,
  Eye,
  EyeOff,
  TestTube,
  Trash2,
  Plus
} from "lucide-react"
import { CallRecordingConnector } from "./call-recording-connector"
import { scopeStackApi } from "@/lib/scopestack-api"

interface IntegrationStatus {
  scopestack: {
    connected: boolean
    apiKey?: string
    accountName?: string
    serviceCount?: number
    lastSync?: Date
  }
  fireflies: {
    connected: boolean
    apiKey?: string
    transcriptCount?: number
    lastSync?: Date
  }
  teams: {
    connected: boolean
    tenantId?: string
    clientId?: string
    recordingCount?: number
    lastSync?: Date
  }
  webex: {
    connected: boolean
    accessToken?: string
    recordingCount?: number
    lastSync?: Date
  }
}

interface IntegrationsManagerProps {
  onIntegrationUpdate: (integrations: IntegrationStatus) => void
}

export function IntegrationsManager({ onIntegrationUpdate }: IntegrationsManagerProps) {
  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    scopestack: { connected: false },
    fireflies: { connected: false },
    teams: { connected: false },
    webex: { connected: false }
  })

  // Initialize ScopeStack connection on component mount
  useEffect(() => {
    initializeScopeStack()
  }, [])

  const initializeScopeStack = async () => {
    try {
      const result = await scopeStackApi.testConnection()

      if (result.success && result.data?.data) {
        const userData = result.data.data
        setIntegrations(prev => ({
          ...prev,
          scopestack: {
            connected: true,
            apiKey: "***configured***",
            accountName: userData.attributes?.["account-slug"] || "Unknown",
            serviceCount: 0, // Will be updated when services are fetched
            lastSync: new Date()
          }
        }))

        // Fetch service count
        const servicesResult = await scopeStackApi.getServices()
        if (servicesResult.success && servicesResult.data) {
          setIntegrations(prev => ({
            ...prev,
            scopestack: {
              ...prev.scopestack,
              serviceCount: servicesResult.data.length
            }
          }))
        }
      } else {
        setIntegrations(prev => ({
          ...prev,
          scopestack: {
            connected: false,
            apiKey: "",
          }
        }))
      }
    } catch (error) {
      console.error('Failed to initialize ScopeStack:', error)
      setIntegrations(prev => ({
        ...prev,
        scopestack: {
          connected: false,
          apiKey: "",
        }
      }))
    }
  }

  const [activeTab, setActiveTab] = useState<'scopestack' | 'call-recordings' | 'other'>('scopestack')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleScopeStackUpdate = (field: string, value: string) => {
    setIntegrations(prev => ({
      ...prev,
      scopestack: {
        ...prev.scopestack,
        [field]: value
      }
    }))
  }

  const testScopeStackConnection = async () => {
    setIsLoading(prev => ({ ...prev, scopestack: true }))

    try {
      const result = await scopeStackApi.testConnection()

      if (result.success && result.data?.data) {
        const userData = result.data.data
        setIntegrations(prev => ({
          ...prev,
          scopestack: {
            ...prev.scopestack,
            connected: true,
            accountName: userData.attributes?.["account-slug"] || "Unknown",
            lastSync: new Date()
          }
        }))

        // Fetch updated service count
        const servicesResult = await scopeStackApi.getServices()
        if (servicesResult.success && servicesResult.data) {
          setIntegrations(prev => ({
            ...prev,
            scopestack: {
              ...prev.scopestack,
              serviceCount: servicesResult.data.length
            }
          }))
        }

        alert("Successfully connected to ScopeStack!")
      } else {
        setIntegrations(prev => ({
          ...prev,
          scopestack: {
            ...prev.scopestack,
            connected: false
          }
        }))
        alert(`Failed to connect to ScopeStack: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('ScopeStack connection test failed:', error)
      setIntegrations(prev => ({
        ...prev,
        scopestack: {
          ...prev.scopestack,
          connected: false
        }
      }))
      alert(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(prev => ({ ...prev, scopestack: false }))
    }
  }

  const handleCallRecordingAnalysis = (analysis: {
    projectType: string
    requirements: string[]
    transcript: string
  }) => {
    // This would typically create a new project or update an existing one
    console.log('Call recording analyzed:', analysis)
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Integration Management</h1>
        <p className="text-gray-600">Configure your data sources and API connections</p>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
            <TabsTrigger value="scopestack" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              ScopeStack
            </TabsTrigger>
            <TabsTrigger value="call-recordings" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Call Recordings
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Other
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scopestack" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      ScopeStack API
                    </CardTitle>
                    <CardDescription>
                      Connect to your ScopeStack account to access service templates and scoping data
                    </CardDescription>
                  </div>
                  {integrations.scopestack.connected && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scopestack-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="scopestack-key"
                      type={showKeys.scopestack ? "text" : "password"}
                      value={integrations.scopestack.apiKey || ""}
                      onChange={(e) => handleScopeStackUpdate('apiKey', e.target.value)}
                      placeholder="Enter your ScopeStack API key"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKeyVisibility('scopestack')}
                    >
                      {showKeys.scopestack ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Find your API key in ScopeStack Settings → API Keys
                  </p>
                </div>

                {integrations.scopestack.connected && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Connection Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Account:</span>
                        <span className="ml-2 font-medium">{integrations.scopestack.accountName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Services:</span>
                        <span className="ml-2 font-medium">{integrations.scopestack.serviceCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Sync:</span>
                        <span className="ml-2 font-medium">
                          {integrations.scopestack.lastSync?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={testScopeStackConnection}
                    disabled={isLoading.scopestack || !integrations.scopestack.apiKey}
                  >
                    {isLoading.scopestack ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>

                  {integrations.scopestack.connected && (
                    <Button variant="outline">
                      Sync Services
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="call-recordings" className="space-y-6">
            <CallRecordingConnector onTranscriptAnalyzed={handleCallRecordingAnalysis} />
          </TabsContent>

          <TabsContent value="other" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Storage Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    File Storage
                  </CardTitle>
                  <CardDescription>
                    Connect cloud storage for BOM files and documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <Settings className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Google Drive</p>
                          <p className="text-xs text-gray-500">Not connected</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">OneDrive</p>
                          <p className="text-xs text-gray-500">Not connected</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                          <Settings className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Dropbox</p>
                          <p className="text-xs text-gray-500">Not connected</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CRM Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    CRM Systems
                  </CardTitle>
                  <CardDescription>
                    Import client data and project information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Salesforce</p>
                          <p className="text-xs text-gray-500">Not connected</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">HubSpot</p>
                          <p className="text-xs text-gray-500">Not connected</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">ConnectWise</p>
                          <p className="text-xs text-gray-500">Not connected</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}