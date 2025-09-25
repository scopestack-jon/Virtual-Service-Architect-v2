// Call Recording Integration Module
// Supports: Fireflies.ai, Microsoft Teams, Webex

export interface CallTranscript {
  id: string
  platform: 'fireflies' | 'teams' | 'webex'
  meetingTitle: string
  date: Date
  duration: number // in seconds
  participants: string[]
  transcript: string
  summary?: string
  actionItems?: string[]
  projectRequirements?: string[]
}

export interface IntegrationConfig {
  platform: 'fireflies' | 'teams' | 'webex'
  apiKey?: string
  clientId?: string
  clientSecret?: string
  tenantId?: string // for Teams
  accessToken?: string
}

// Fireflies.ai Integration
export class FirefliesIntegration {
  private apiKey: string
  private baseUrl = 'https://api.fireflies.ai/graphql'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async fetchTranscripts(limit: number = 10): Promise<CallTranscript[]> {
    // Fireflies API uses a different query structure
    const query = `
      query {
        transcripts {
          id
          title
          date
          duration
          participants
          sentences {
            text
            speaker_name
          }
          summary {
            overview
            action_items
            keywords
            outline
          }
        }
      }
    `

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Fireflies API error response:', errorText)
        throw new Error(`Fireflies API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Log the response for debugging
      console.log('Fireflies API Response:', JSON.stringify(data, null, 2))

      // Check for GraphQL errors
      if (data.errors) {
        console.error('GraphQL errors:', data.errors)
        throw new Error(`Fireflies GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`)
      }

      // Validate data structure
      if (!data.data || !data.data.transcripts) {
        console.error('Invalid response structure:', data)
        throw new Error('Invalid response from Fireflies API - no transcripts found')
      }

      return this.mapToCallTranscript(data.data.transcripts)
    } catch (error) {
      console.error('Error fetching Fireflies transcripts:', error)
      throw error
    }
  }

  async fetchTranscriptById(transcriptId: string): Promise<CallTranscript> {
    const query = `
      query GetTranscript($id: String!) {
        transcript(id: $id) {
          id
          title
          date
          duration
          participants
          transcript
          summary
          action_items
          sentences {
            text
            speaker_name
            start_time
          }
        }
      }
    `

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { id: transcriptId }
        })
      })

      if (!response.ok) {
        throw new Error(`Fireflies API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Check for GraphQL errors
      if (data.errors) {
        console.error('GraphQL errors:', data.errors)
        throw new Error(`Fireflies GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`)
      }

      // Validate data structure
      if (!data.data || !data.data.transcript) {
        console.error('Invalid response structure:', data)
        throw new Error('Invalid response from Fireflies API - transcript not found')
      }

      return this.mapToCallTranscript([data.data.transcript])[0]
    } catch (error) {
      console.error('Error fetching Fireflies transcript by ID:', error)
      throw error
    }
  }

  private mapToCallTranscript(firefliesData: any[]): CallTranscript[] {
    if (!Array.isArray(firefliesData)) {
      console.warn('Fireflies data is not an array:', firefliesData)
      return []
    }

    return firefliesData.map(meeting => {
      // Handle different response structures
      const participants = Array.isArray(meeting.participants)
        ? meeting.participants.map((p: any) => typeof p === 'string' ? p : (p.name || p.email || p))
        : []

      const transcript = meeting.transcript ||
        (meeting.sentences && Array.isArray(meeting.sentences)
          ? meeting.sentences.map((s: any) => `${s.speaker_name || 'Speaker'}: ${s.text}`).join('\n')
          : '')

      const summary = meeting.summary && typeof meeting.summary === 'object'
        ? meeting.summary.overview || ''
        : meeting.summary || ''

      const actionItems = meeting.summary && typeof meeting.summary === 'object' && meeting.summary.action_items
        ? meeting.summary.action_items
        : meeting.action_items || []

      return {
        id: meeting.id,
        platform: 'fireflies' as const,
        meetingTitle: meeting.title || 'Untitled Meeting',
        date: new Date(meeting.date),
        duration: meeting.duration || 0,
        participants,
        transcript,
        summary,
        actionItems,
        projectRequirements: this.extractProjectRequirements(transcript)
      }
    })
  }

  private extractProjectRequirements(transcript: string): string[] {
    // AI-powered extraction of project requirements from transcript
    const requirements: string[] = []

    // Look for keywords that indicate requirements
    const requirementPatterns = [
      /we need to (.+?)(?:\.|,|and)/gi,
      /requirement is (.+?)(?:\.|,|and)/gi,
      /must have (.+?)(?:\.|,|and)/gi,
      /should include (.+?)(?:\.|,|and)/gi,
      /want to implement (.+?)(?:\.|,|and)/gi,
      /looking for (.+?)(?:\.|,|and)/gi,
    ]

    requirementPatterns.forEach(pattern => {
      const matches = transcript.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          requirements.push(match[1].trim())
        }
      }
    })

    return requirements
  }
}

// Microsoft Teams Integration
export class TeamsIntegration {
  private clientId: string
  private clientSecret: string
  private tenantId: string
  private accessToken?: string
  private graphBaseUrl = 'https://graph.microsoft.com/v1.0'

  constructor(config: { clientId: string; clientSecret: string; tenantId: string }) {
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.tenantId = config.tenantId
  }

  async authenticate(): Promise<void> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      })
    })

    const data = await response.json()
    this.accessToken = data.access_token
  }

  async fetchCallRecordings(userId: string): Promise<CallTranscript[]> {
    if (!this.accessToken) await this.authenticate()

    // Get online meetings
    const meetingsResponse = await fetch(
      `${this.graphBaseUrl}/users/${userId}/onlineMeetings`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        }
      }
    )

    const meetings = await meetingsResponse.json()
    const transcripts: CallTranscript[] = []

    for (const meeting of meetings.value) {
      // Get call records
      const recordingResponse = await fetch(
        `${this.graphBaseUrl}/communications/callRecords/${meeting.id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          }
        }
      )

      if (recordingResponse.ok) {
        const recording = await recordingResponse.json()
        transcripts.push(this.mapToCallTranscript(meeting, recording))
      }
    }

    return transcripts
  }

  private mapToCallTranscript(meeting: any, recording: any): CallTranscript {
    return {
      id: meeting.id,
      platform: 'teams' as const,
      meetingTitle: meeting.subject || 'Teams Meeting',
      date: new Date(meeting.startDateTime),
      duration: new Date(meeting.endDateTime).getTime() - new Date(meeting.startDateTime).getTime(),
      participants: meeting.participants?.map((p: any) => p.upn || p.displayName) || [],
      transcript: recording.transcript || '',
      summary: recording.summary,
      projectRequirements: []
    }
  }
}

// Webex Integration
export class WebexIntegration {
  private accessToken: string
  private baseUrl = 'https://webexapis.com/v1'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async fetchRecordings(): Promise<CallTranscript[]> {
    const response = await fetch(`${this.baseUrl}/recordings`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    const data = await response.json()
    return this.mapToCallTranscript(data.items)
  }

  async fetchRecordingTranscript(recordingId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/recordings/${recordingId}/transcript`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      }
    })

    const data = await response.json()
    return data.text
  }

  private mapToCallTranscript(recordings: any[]): CallTranscript[] {
    return recordings.map(recording => ({
      id: recording.id,
      platform: 'webex' as const,
      meetingTitle: recording.topic || 'Webex Meeting',
      date: new Date(recording.createTime),
      duration: recording.durationSeconds || 0,
      participants: recording.participants || [],
      transcript: '', // Will need to fetch separately
      projectRequirements: []
    }))
  }
}

// Main integration manager
export class CallRecordingManager {
  private integrations: Map<string, FirefliesIntegration | TeamsIntegration | WebexIntegration> = new Map()

  addIntegration(config: IntegrationConfig) {
    switch (config.platform) {
      case 'fireflies':
        if (config.apiKey) {
          this.integrations.set('fireflies', new FirefliesIntegration(config.apiKey))
        }
        break
      case 'teams':
        if (config.clientId && config.clientSecret && config.tenantId) {
          this.integrations.set('teams', new TeamsIntegration({
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            tenantId: config.tenantId
          }))
        }
        break
      case 'webex':
        if (config.accessToken) {
          this.integrations.set('webex', new WebexIntegration(config.accessToken))
        }
        break
    }
  }

  async fetchAllTranscripts(): Promise<CallTranscript[]> {
    const allTranscripts: CallTranscript[] = []

    for (const [platform, integration] of this.integrations) {
      try {
        let transcripts: CallTranscript[] = []

        if (integration instanceof FirefliesIntegration) {
          transcripts = await integration.fetchTranscripts()
        } else if (integration instanceof TeamsIntegration) {
          // You'll need to provide userId
          // transcripts = await integration.fetchCallRecordings(userId)
        } else if (integration instanceof WebexIntegration) {
          transcripts = await integration.fetchRecordings()
        }

        allTranscripts.push(...transcripts)
      } catch (error) {
        console.error(`Error fetching from ${platform}:`, error)
      }
    }

    return allTranscripts
  }

  // Extract project requirements from transcript using AI analysis
  async analyzeTranscriptForProject(transcript: CallTranscript): Promise<{
    projectType: string
    requirements: string[]
    estimatedScope: string
    suggestedServices: string[]
  }> {
    // This would integrate with your existing AI analysis
    const projectAnalysis = {
      projectType: this.detectProjectType(transcript.transcript),
      requirements: transcript.projectRequirements || [],
      estimatedScope: this.estimateScope(transcript.transcript),
      suggestedServices: this.suggestServices(transcript.transcript)
    }

    return projectAnalysis
  }

  private detectProjectType(transcript: string): string {
    // Simple keyword-based detection (can be enhanced with AI)
    const types = {
      'cloud migration': ['cloud', 'aws', 'azure', 'migration', 'migrate'],
      'network upgrade': ['network', 'router', 'switch', 'wifi', 'bandwidth'],
      'security audit': ['security', 'audit', 'compliance', 'hipaa', 'sox'],
      'backup solution': ['backup', 'disaster', 'recovery', 'restore']
    }

    for (const [type, keywords] of Object.entries(types)) {
      if (keywords.some(keyword => transcript.toLowerCase().includes(keyword))) {
        return type
      }
    }

    return 'general IT project'
  }

  private estimateScope(transcript: string): string {
    // Estimate based on transcript length and complexity
    const wordCount = transcript.split(' ').length
    if (wordCount > 5000) return 'large'
    if (wordCount > 2000) return 'medium'
    return 'small'
  }

  private suggestServices(transcript: string): string[] {
    // Suggest services based on transcript content
    const services: string[] = []

    if (transcript.toLowerCase().includes('network')) {
      services.push('Network Assessment', 'Network Design & Implementation')
    }
    if (transcript.toLowerCase().includes('security')) {
      services.push('Security Audit', 'Vulnerability Assessment')
    }
    if (transcript.toLowerCase().includes('cloud')) {
      services.push('Cloud Migration', 'Cloud Architecture Design')
    }

    return services
  }
}