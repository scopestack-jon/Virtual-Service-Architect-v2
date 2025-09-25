import { config } from "./config"

// ScopeStack API client with authentication, error handling, and status tracking
export interface ScopeStackService {
  id: string
  name: string
  category: string
  description: string
  keywords: string[]
  estimatedHours: number
  complexity: "Low" | "Medium" | "High"
  phases?: string[]
  deliverables?: string[]
}

export interface ScopeStackPhase {
  id: string
  name: string
  description: string
  services: string[]
  estimatedHours: number
  dependencies?: string[]
}

export interface ScopeStackApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  fallback?: boolean
}

export interface ScopeStackUser {
  attributes: {
    name: string
    title: string
    email: string
    phone: string
    "account-id": number
    "account-slug": string
  }
}

export interface EndpointStatus {
  endpoint: string
  status: "pending" | "success" | "error" | "not-tested"
  lastTested?: Date
  responseTime?: number
  error?: string
  dataCount?: number
}

export interface ScopeStackApiStatus {
  me: EndpointStatus
  services: EndpointStatus
  subservices: EndpointStatus
  overall: "healthy" | "degraded" | "down" | "unknown"
}

class ScopeStackApiClient {
  private baseUrl = "https://api.scopestack.io"
  private apiKey: string | null = null
  private accountSlug: string | null = null

  private status: ScopeStackApiStatus = {
    me: { endpoint: "/v1/me", status: "not-tested" },
    services: { endpoint: "/{account-slug}/v1/services", status: "not-tested" },
    subservices: { endpoint: "/{account-slug}/v1/subservices", status: "not-tested" },
    overall: "unknown",
  }

  constructor() {
    // Use the configuration file instead of process.env
    this.apiKey = config.scopeStackApiKey
    
    console.log("🔑 ScopeStack API Client initialized:", {
      hasApiKey: !!this.apiKey,
      keyLength: this.apiKey?.length || 0,
      baseUrl: config.scopeStackBaseUrl
    })
  }

  getStatus(): ScopeStackApiStatus {
    return { ...this.status }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ScopeStackApiResponse<T>> {
    const startTime = Date.now()
    const statusKey = this.getStatusKey(endpoint)

    if (statusKey) {
      this.status[statusKey].status = "pending"
      this.status[statusKey].lastTested = new Date()
    }

    try {
      const headers: HeadersInit = {
        accept: "application/vnd.api+json",
        "Content-Type": "application/json",
        ...options.headers,
      }

      if (this.apiKey) {
        (headers as any)["Authorization"] = `Bearer ${this.apiKey}`
      }

      const fullUrl = `${this.baseUrl}${endpoint}`
      console.log(`🌐 Making API request to: ${fullUrl}`)
      console.log(`🔑 Using API key: ${this.apiKey ? `${this.apiKey.substring(0, 10)}...` : "None"}`)

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: AbortSignal.timeout(10000),
      })

      const responseTime = Date.now() - startTime

      console.log(`📡 API Response: ${response.status} ${response.statusText} (${responseTime}ms)`)

      if (!response.ok) {
        const error = `API request failed: ${response.status} ${response.statusText}`
        try {
          const errorBody = await response.text()
          console.error(`❌ API Error Body:`, errorBody)
        } catch (e) {
          console.error(`❌ Could not read error response body`)
        }

        if (statusKey) {
          this.status[statusKey].status = "error"
          this.status[statusKey].error = error
          this.status[statusKey].responseTime = responseTime
        }
        throw new Error(error)
      }

      const data = await response.json()

      console.log(`✅ API Success:`, {
        hasData: !!data,
        dataType: Array.isArray(data?.data) ? "array" : typeof data?.data,
        dataLength: Array.isArray(data?.data) ? data.data.length : "N/A",
      })

      if (statusKey) {
        this.status[statusKey].status = "success"
        this.status[statusKey].error = undefined
        this.status[statusKey].responseTime = responseTime

        // Track data count for services/subservices
        if (data?.data && Array.isArray(data.data)) {
          this.status[statusKey].dataCount = data.data.length
        }
      }

      this.updateOverallStatus()
      return { success: true, data }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : "Unknown API error"

      console.error(`❌ ScopeStack API error for ${endpoint}:`, {
        error: errorMessage,
        responseTime,
        hasApiKey: !!this.apiKey,
        accountSlug: this.accountSlug,
      })

      if (statusKey) {
        this.status[statusKey].status = "error"
        this.status[statusKey].error = errorMessage
        this.status[statusKey].responseTime = responseTime
      }

      this.updateOverallStatus()
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  private async ensureAccountSlug(): Promise<boolean> {
    if (this.accountSlug) {
      return true
    }

    const userResult = await this.testConnection()
    if (userResult.success && userResult.data?.data?.attributes?.["account-slug"]) {
      this.accountSlug = userResult.data.data.attributes["account-slug"]
      console.log(`🔑 ScopeStack API: Set account slug to "${this.accountSlug}"`)
      return true
    }

    console.error("❌ ScopeStack API: Unable to extract account slug from /me response")
    return false
  }

  async getServices(): Promise<ScopeStackApiResponse<ScopeStackService[]>> {
    const hasSlug = await this.ensureAccountSlug()
    if (!hasSlug) {
      return {
        success: false,
        error: "Unable to get account slug for API requests",
        fallback: true,
      }
    }

    const endpoint = `/${this.accountSlug}/v1/services?include=phase,subservices`
    console.log(`🔍 ScopeStack API: Fetching services from ${endpoint}`)
    const result = await this.makeRequest<any>(endpoint)

    if (result.success) {
      // Extract services from JSON:API response structure
      const services = result.data?.data || []
      const included = result.data?.included || []
      
      console.log(`✅ ScopeStack API: Successfully fetched ${services.length} services`)
      console.log(`📦 ScopeStack API: Response includes ${included.length} related resources`)
      
      // Return the services array directly
      return {
        success: true,
        data: services
      }
    } else {
      console.log(`❌ ScopeStack API: Failed to fetch services - ${result.error}`)
    }

    return result
  }

  async getServicesByCategory(category: string): Promise<ScopeStackApiResponse<ScopeStackService[]>> {
    const hasSlug = await this.ensureAccountSlug()
    if (!hasSlug) {
      return {
        success: false,
        error: "Unable to get account slug for API requests",
        fallback: true,
      }
    }

    return this.makeRequest<ScopeStackService[]>(
      `/${this.accountSlug}/v1/services?category=${encodeURIComponent(category)}`,
    )
  }

  async getPhases(): Promise<ScopeStackApiResponse<any[]>> {
    const hasSlug = await this.ensureAccountSlug()
    if (!hasSlug) {
      return {
        success: false,
        error: "Unable to get account slug for API requests",
        fallback: true,
      }
    }

    console.log(`🔍 ScopeStack API: Fetching active phases from /${this.accountSlug}/v1/phases?filter[active]=true`)
    const result = await this.makeRequest<any[]>(`/${this.accountSlug}/v1/phases?filter[active]=true`)

    if (result.success) {
      console.log(`✅ ScopeStack API: Successfully fetched ${result.data?.data?.length || 0} phases`)

      // Return the data array from the JSON:API response
      return {
        success: true,
        data: result.data?.data || []
      }
    } else {
      console.log(`❌ ScopeStack API: Failed to fetch phases - ${result.error}`)
    }

    return result
  }

  async matchServices(userInput: string): Promise<
    ScopeStackApiResponse<{
      matches: Array<{
        service: ScopeStackService
        confidence: number
        matchedKeywords: string[]
      }>
    }>
  > {
    const hasSlug = await this.ensureAccountSlug()
    if (!hasSlug) {
      return {
        success: false,
        error: "Unable to get account slug for API requests",
        fallback: true,
      }
    }

    console.log(`🔍 ScopeStack API: Matching services for input: "${userInput.substring(0, 50)}..."`)
    const result = await this.makeRequest(`/${this.accountSlug}/v1/match`, {
      method: "POST",
      body: JSON.stringify({ input: userInput }),
    })

    if (result.success) {
      const matchCount = (result.data as any)?.matches?.length || 0
      console.log(`✅ ScopeStack API: Found ${matchCount} service matches`)
      ;(result.data as any)?.matches?.forEach((match: any, index: number) => {
        console.log(`   ${index + 1}. ${match.service.name} (${match.confidence}% confidence)`)
      })
    } else {
      console.log(`❌ ScopeStack API: Service matching failed - ${result.error}`)
      result.fallback = true
    }

    return result as any
  }

  async testConnection(): Promise<ScopeStackApiResponse<{ data: any; authenticated: boolean }>> {
    if (!this.apiKey) {
      return {
        success: false,
        error: "No API key configured. Please add NEXT_PUBLIC_SCOPESTACK_API_KEY to your environment variables.",
      }
    }

    const result = await this.makeRequest<{ data: any; authenticated: boolean }>("/v1/me")

    if (result.success) {
      return {
        ...result,
        data: {
          ...(result.data || {}),
          authenticated: true,
        },
      }
    }

    return result
  }

  private getStatusKey(endpoint: string): keyof Omit<ScopeStackApiStatus, "overall"> | null {
    if (endpoint === "/v1/me") return "me"
    if (endpoint.includes("/v1/services")) return "services"
    if (endpoint.includes("/v1/subservices")) return "subservices"
    return null
  }

  private updateOverallStatus() {
    const statuses = [this.status.me.status, this.status.services.status, this.status.subservices.status]

    if (statuses.every((s) => s === "success")) {
      this.status.overall = "healthy"
    } else if (statuses.some((s) => s === "success")) {
      this.status.overall = "degraded"
    } else if (statuses.some((s) => s === "error")) {
      this.status.overall = "down"
    } else {
      this.status.overall = "unknown"
    }
  }

  async getSubservices(): Promise<ScopeStackApiResponse<any[]>> {
    const hasSlug = await this.ensureAccountSlug()
    if (!hasSlug) {
      return {
        success: false,
        error: "Unable to get account slug for API requests",
        fallback: true,
      }
    }

    console.log(`🔍 ScopeStack API: Fetching subservices from /${this.accountSlug}/v1/subservices`)
    const result = await this.makeRequest<any[]>(`/${this.accountSlug}/v1/subservices`)

    if (result.success) {
      console.log(`✅ ScopeStack API: Successfully fetched ${result.data?.data?.length || 0} subservices`)

      // Return the data array from the JSON:API response
      return {
        success: true,
        data: result.data?.data || []
      }
    } else {
      console.log(`❌ ScopeStack API: Failed to fetch subservices - ${result.error}`)
      return result
    }
  }

  async getProjectServices(): Promise<ScopeStackApiResponse<any[]>> {
    const hasSlug = await this.ensureAccountSlug()
    if (!hasSlug) {
      return {
        success: false,
        error: "Unable to get account slug for API requests",
        fallback: true,
      }
    }

    console.log(`🔍 ScopeStack API: Fetching active services from /${this.accountSlug}/v1/services?filter[state]=active&include=phase,resource,service-category,subservices,subservices.resource`)
    const result = await this.makeRequest<any[]>(`/${this.accountSlug}/v1/services?filter[state]=active&include=phase,resource,service-category,subservices,subservices.resource`)

    if (result.success) {
      const services = result.data?.data || []
      const included = result.data?.included || []

      console.log(`✅ ScopeStack API: Successfully fetched ${services.length} active services`)
      console.log(`📦 ScopeStack API: Response includes ${included.length} related resources`)

      // Log sample service with relationships
      if (services.length > 0) {
        console.log('📊 ScopeStack API: Sample service with relationships:', {
          id: services[0].id,
          name: services[0].attributes?.name,
          relationships: services[0].relationships
        })
      }

      // Return the data array from the JSON:API response
      return {
        success: true,
        data: services
      }
    } else {
      console.log(`❌ ScopeStack API: Failed to fetch active services - ${result.error}`)
    }

    return result
  }

  async getLineOfBusinesses(): Promise<ScopeStackApiResponse<any[]>> {
    const hasSlug = await this.ensureAccountSlug()
    if (!hasSlug) {
      return {
        success: false,
        error: "Unable to get account slug for API requests",
        fallback: true,
      }
    }

    console.log(`🔍 ScopeStack API: Fetching lines of business from /${this.accountSlug}/v1/line-of-businesses`)
    const result = await this.makeRequest<any[]>(`/${this.accountSlug}/v1/line-of-businesses`)

    if (result.success) {
      console.log(`✅ ScopeStack API: Successfully fetched ${result.data?.data?.length || 0} lines of business`)

      // Return the data array from the JSON:API response
      return {
        success: true,
        data: result.data?.data || []
      }
    } else {
      console.log(`❌ ScopeStack API: Failed to fetch lines of business - ${result.error}`)
    }

    return result
  }

  async getServiceCategories(): Promise<ScopeStackApiResponse<any[]>> {
    const hasSlug = await this.ensureAccountSlug()
    if (!hasSlug) {
      return {
        success: false,
        error: "Unable to get account slug for API requests",
        fallback: true,
      }
    }

    console.log(`🔍 ScopeStack API: Fetching service categories from /${this.accountSlug}/v1/service-categories`)
    const result = await this.makeRequest<any[]>(`/${this.accountSlug}/v1/service-categories`)

    if (result.success) {
      console.log(`✅ ScopeStack API: Successfully fetched ${result.data?.data?.length || 0} service categories`)

      // Return the data array from the JSON:API response
      return {
        success: true,
        data: result.data?.data || []
      }
    } else {
      console.log(`❌ ScopeStack API: Failed to fetch service categories - ${result.error}`)
    }

    return result
  }

  async getResources(): Promise<ScopeStackApiResponse<any[]>> {
    const hasSlug = await this.ensureAccountSlug()
    if (!hasSlug) {
      return {
        success: false,
        error: "Unable to get account slug for API requests",
        fallback: true,
      }
    }

    console.log(`🔍 ScopeStack API: Fetching active resources from /${this.accountSlug}/v1/resources?filter[active]=true`)
    const result = await this.makeRequest<any[]>(`/${this.accountSlug}/v1/resources?filter[active]=true`)

    if (result.success) {
      console.log(`✅ ScopeStack API: Successfully fetched ${result.data?.data?.length || 0} active resources`)

      // Return the data array from the JSON:API response
      return {
        success: true,
        data: result.data?.data || []
      }
    } else {
      console.log(`❌ ScopeStack API: Failed to fetch resources - ${result.error}`)
    }

    return result
  }
}

export const scopeStackApi = new ScopeStackApiClient()
