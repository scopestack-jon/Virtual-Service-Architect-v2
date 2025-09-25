"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Phone, Loader2, CheckCircle, AlertCircle, Mic } from "lucide-react"
import { CallRecordingManager, CallTranscript } from "@/lib/call-recording-integrations"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CallRecordingConnectorProps {
  onTranscriptAnalyzed: (analysis: {
    projectType: string
    requirements: string[]
    transcript: string
  }) => void
}

export function CallRecordingConnector({ onTranscriptAnalyzed }: CallRecordingConnectorProps) {
  const [manager] = useState(() => new CallRecordingManager())
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([])
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState<{
    fireflies: boolean
    teams: boolean
    webex: boolean
  }>({
    fireflies: false,
    teams: false,
    webex: false
  })

  // Fireflies connection state
  const [firefliesKey, setFirefliesKey] = useState("")

  // Teams connection state
  const [teamsConfig, setTeamsConfig] = useState({
    clientId: "",
    clientSecret: "",
    tenantId: ""
  })

  // Webex connection state
  const [webexToken, setWebexToken] = useState("")

  const connectFireflies = async () => {
    if (!firefliesKey) return

    setLoading(true)
    try {
      manager.addIntegration({
        platform: 'fireflies',
        apiKey: firefliesKey
      })

      // Test connection by fetching transcripts
      const testFetch = await manager.fetchAllTranscripts()
      setConnected(prev => ({ ...prev, fireflies: true }))
      setTranscripts(prev => [...prev, ...testFetch])

      // Show success message if no transcripts but connection works
      if (testFetch.length === 0) {
        alert("Connected successfully! No transcripts found in your Fireflies account.")
      }
    } catch (error: any) {
      console.error("Failed to connect to Fireflies:", error)

      // Provide more specific error messages
      let errorMessage = "Failed to connect to Fireflies. "

      if (error.message?.includes('401') || error.message?.includes('403')) {
        errorMessage += "Invalid API key. Please check your API key and try again."
      } else if (error.message?.includes('GraphQL error')) {
        errorMessage += "API query error. The Fireflies API structure may have changed."
      } else if (error.message?.includes('network')) {
        errorMessage += "Network error. Please check your internet connection."
      } else {
        errorMessage += error.message || "Please check your API key and try again."
      }

      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const connectTeams = async () => {
    if (!teamsConfig.clientId || !teamsConfig.clientSecret || !teamsConfig.tenantId) return

    setLoading(true)
    try {
      manager.addIntegration({
        platform: 'teams',
        ...teamsConfig
      })

      setConnected(prev => ({ ...prev, teams: true }))
    } catch (error) {
      console.error("Failed to connect to Teams:", error)
      alert("Failed to connect to Teams. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const connectWebex = async () => {
    if (!webexToken) return

    setLoading(true)
    try {
      manager.addIntegration({
        platform: 'webex',
        accessToken: webexToken
      })

      const testFetch = await manager.fetchAllTranscripts()
      setConnected(prev => ({ ...prev, webex: true }))
      setTranscripts(prev => [...prev, ...testFetch])
    } catch (error) {
      console.error("Failed to connect to Webex:", error)
      alert("Failed to connect to Webex. Please check your access token.")
    } finally {
      setLoading(false)
    }
  }

  const analyzeTranscript = async (transcript: CallTranscript) => {
    const analysis = await manager.analyzeTranscriptForProject(transcript)

    onTranscriptAnalyzed({
      projectType: analysis.projectType,
      requirements: analysis.requirements,
      transcript: transcript.transcript
    })
  }

  const refreshTranscripts = async () => {
    setLoading(true)
    try {
      const allTranscripts = await manager.fetchAllTranscripts()
      setTranscripts(allTranscripts)
    } catch (error) {
      console.error("Failed to fetch transcripts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call Recording Integrations
        </CardTitle>
        <CardDescription>
          Connect your call recording platforms to automatically extract project requirements from meetings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connect">Connect Platforms</TabsTrigger>
            <TabsTrigger value="transcripts">
              Transcripts
              {transcripts.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {transcripts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4">
            {/* Fireflies Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Fireflies.ai</CardTitle>
                  {connected.fireflies && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fireflies-key">API Key</Label>
                  <Input
                    id="fireflies-key"
                    type="password"
                    placeholder="Enter your Fireflies API key"
                    value={firefliesKey}
                    onChange={(e) => setFirefliesKey(e.target.value)}
                    disabled={connected.fireflies}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key from Fireflies Settings → Integrations → API
                  </p>
                </div>
                <Button
                  onClick={connectFireflies}
                  disabled={loading || connected.fireflies || !firefliesKey}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : connected.fireflies ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : null}
                  {connected.fireflies ? "Connected" : "Connect Fireflies"}
                </Button>
              </CardContent>
            </Card>

            {/* Teams Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Microsoft Teams</CardTitle>
                  {connected.teams && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teams-client-id">Client ID</Label>
                  <Input
                    id="teams-client-id"
                    type="text"
                    placeholder="Azure AD App Client ID"
                    value={teamsConfig.clientId}
                    onChange={(e) => setTeamsConfig(prev => ({ ...prev, clientId: e.target.value }))}
                    disabled={connected.teams}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teams-client-secret">Client Secret</Label>
                  <Input
                    id="teams-client-secret"
                    type="password"
                    placeholder="Azure AD App Client Secret"
                    value={teamsConfig.clientSecret}
                    onChange={(e) => setTeamsConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                    disabled={connected.teams}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teams-tenant-id">Tenant ID</Label>
                  <Input
                    id="teams-tenant-id"
                    type="text"
                    placeholder="Azure AD Tenant ID"
                    value={teamsConfig.tenantId}
                    onChange={(e) => setTeamsConfig(prev => ({ ...prev, tenantId: e.target.value }))}
                    disabled={connected.teams}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure in Azure Portal → App Registrations
                </p>
                <Button
                  onClick={connectTeams}
                  disabled={loading || connected.teams || !teamsConfig.clientId}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : connected.teams ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : null}
                  {connected.teams ? "Connected" : "Connect Teams"}
                </Button>
              </CardContent>
            </Card>

            {/* Webex Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Cisco Webex</CardTitle>
                  {connected.webex && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webex-token">Access Token</Label>
                  <Input
                    id="webex-token"
                    type="password"
                    placeholder="Enter your Webex access token"
                    value={webexToken}
                    onChange={(e) => setWebexToken(e.target.value)}
                    disabled={connected.webex}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your token from developer.webex.com
                  </p>
                </div>
                <Button
                  onClick={connectWebex}
                  disabled={loading || connected.webex || !webexToken}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : connected.webex ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : null}
                  {connected.webex ? "Connected" : "Connect Webex"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcripts" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''} available
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshTranscripts}
                disabled={loading || (!connected.fireflies && !connected.teams && !connected.webex)}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Refresh
              </Button>
            </div>

            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4">
                {transcripts.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Mic className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        No transcripts available yet.<br />
                        Connect a platform to see your call recordings.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  transcripts.map((transcript) => (
                    <Card key={transcript.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{transcript.meetingTitle}</CardTitle>
                            <CardDescription className="text-sm">
                              {new Date(transcript.date).toLocaleDateString()} •
                              {Math.floor(transcript.duration / 60)} mins •
                              {transcript.participants.length} participants
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {transcript.platform}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {transcript.summary && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {transcript.summary.substring(0, 150)}...
                          </p>
                        )}
                        <Button
                          size="sm"
                          onClick={() => analyzeTranscript(transcript)}
                          className="w-full"
                        >
                          Analyze for Project Requirements
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}