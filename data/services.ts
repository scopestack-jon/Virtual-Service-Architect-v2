import { scopeStackApi } from "../lib/scopestack-api"

export interface Service {
  id: string
  name: string
  category: string
  description: string
  keywords: string[]
  estimatedHours: number
  complexity: "Low" | "Medium" | "High"
  source: "scopestack" | "local"
  sku?: string
  subservices?: SubService[]
  quantity?: number
  minimumQuantity?: number
  position?: number
  state?: string
  serviceType?: string
  paymentFrequency?: string
  languages?: {
    outOfScope?: string
    customerResponsibility?: string
  }
  phaseName?: string
}

export interface SubService {
  id: string
  name: string
  description: string
  estimatedHours: number
  resourceType?: string
  quantity?: number
  minimumQuantity?: number
  position?: number
  state?: string
  active?: boolean
  languages?: {
    outOfScope?: string
    customerResponsibility?: string
  }
}

export interface ServiceMatch {
  service: Service
  confidence: number
  matchedKeywords: string[]
}

export const mockServices: Service[] = [
  {
    id: "local-network-assessment",
    name: "Network Infrastructure Assessment",
    category: "Infrastructure",
    description:
      "Comprehensive evaluation of existing network infrastructure, performance analysis, and security assessment.",
    keywords: [
      "network",
      "infrastructure",
      "assessment",
      "evaluation",
      "performance",
      "security",
      "switches",
      "routers",
    ],
    estimatedHours: 40,
    complexity: "Medium",
    source: "local",
    subservices: [
      {
        id: "network-audit",
        name: "Network Audit & Documentation",
        description: "Complete network mapping and documentation",
        estimatedHours: 16,
        quantity: 1,
        minimumQuantity: 1,
        position: 1,
        state: "active",
        active: true,
      },
      {
        id: "performance-testing",
        name: "Performance & Load Testing",
        description: "Network performance analysis and stress testing",
        estimatedHours: 12,
        quantity: 1,
        minimumQuantity: 1,
        position: 2,
        state: "active",
        active: true,
      },
      {
        id: "security-review",
        name: "Security Configuration Review",
        description: "Security assessment and vulnerability analysis",
        estimatedHours: 12,
        quantity: 1,
        minimumQuantity: 1,
        position: 3,
        state: "active",
        active: true,
      }
    ]
  },
  {
    id: "local-cloud-migration",
    name: "Cloud Migration Services",
    category: "Cloud",
    description:
      "End-to-end cloud migration including planning, execution, and optimization for AWS, Azure, or Google Cloud.",
    keywords: ["cloud", "migration", "aws", "azure", "google cloud", "move to cloud", "cloud transition"],
    estimatedHours: 120,
    complexity: "High",
    source: "local",
    subservices: [
      {
        id: "migration-planning",
        name: "Migration Strategy & Planning",
        description: "Comprehensive migration roadmap and planning",
        estimatedHours: 24,
        quantity: 1,
        minimumQuantity: 1,
        position: 1,
        state: "active",
        active: true,
      },
      {
        id: "data-migration",
        name: "Data Migration & Sync",
        description: "Data transfer and synchronization services",
        estimatedHours: 40,
        quantity: 1,
        minimumQuantity: 1,
        position: 2,
        state: "active",
        active: true,
      },
      {
        id: "application-migration",
        name: "Application Migration",
        description: "Application deployment and configuration",
        estimatedHours: 32,
        quantity: 1,
        minimumQuantity: 1,
        position: 3,
        state: "active",
        active: true,
      },
      {
        id: "optimization",
        name: "Post-Migration Optimization",
        description: "Performance tuning and cost optimization",
        estimatedHours: 24,
        quantity: 1,
        minimumQuantity: 1,
        position: 4,
        state: "active",
        active: true,
      }
    ]
  },
  {
    id: "local-security-audit",
    name: "Cybersecurity Audit",
    category: "Security",
    description:
      "Comprehensive security assessment including vulnerability scanning, penetration testing, and compliance review.",
    keywords: [
      "security",
      "audit",
      "cybersecurity",
      "vulnerability",
      "penetration testing",
      "compliance",
      "risk assessment",
    ],
    estimatedHours: 60,
    complexity: "High",
    source: "local",
    subservices: [
      {
        id: "vulnerability-scan",
        name: "Vulnerability Assessment",
        description: "Automated and manual vulnerability scanning",
        estimatedHours: 20,
        quantity: 1,
        minimumQuantity: 1,
        position: 1,
        state: "active",
        active: true,
      },
      {
        id: "penetration-testing",
        name: "Penetration Testing",
        description: "Manual security testing and exploitation",
        estimatedHours: 24,
        quantity: 1,
        minimumQuantity: 1,
        position: 2,
        state: "active",
        active: true,
      },
      {
        id: "compliance-review",
        name: "Compliance & Policy Review",
        description: "Security policy and compliance assessment",
        estimatedHours: 16,
        quantity: 1,
        minimumQuantity: 1,
        position: 3,
        state: "active",
        active: true,
      }
    ]
  },
  {
    id: "local-backup-solution",
    name: "Backup & Disaster Recovery",
    category: "Data Protection",
    description: "Design and implementation of comprehensive backup and disaster recovery solutions.",
    keywords: ["backup", "disaster recovery", "data protection", "recovery", "business continuity", "restore"],
    estimatedHours: 80,
    complexity: "Medium",
    source: "local",
    subservices: [
      {
        id: "backup-design",
        name: "Backup Strategy Design",
        description: "Backup architecture and strategy planning",
        estimatedHours: 16,
        quantity: 1,
        minimumQuantity: 1,
        position: 1,
        state: "active",
        active: true,
      },
      {
        id: "backup-implementation",
        name: "Backup System Implementation",
        description: "Backup infrastructure deployment",
        estimatedHours: 32,
        quantity: 1,
        minimumQuantity: 1,
        position: 2,
        state: "active",
        active: true,
      },
      {
        id: "disaster-recovery",
        name: "Disaster Recovery Planning",
        description: "DR strategy and testing procedures",
        estimatedHours: 24,
        quantity: 1,
        minimumQuantity: 1,
        position: 3,
        state: "active",
        active: true,
      },
      {
        id: "testing-validation",
        name: "Testing & Validation",
        description: "Backup and recovery testing",
        estimatedHours: 8,
        quantity: 1,
        minimumQuantity: 1,
        position: 4,
        state: "active",
        active: true,
      }
    ]
  },
  {
    id: "local-office365-migration",
    name: "Office 365 Migration",
    category: "Productivity",
    description: "Complete migration to Microsoft 365 including email, documents, and collaboration tools.",
    keywords: ["office 365", "microsoft 365", "email migration", "sharepoint", "teams", "productivity"],
    estimatedHours: 100,
    complexity: "Medium",
    source: "local",
    subservices: [
      {
        id: "email-migration",
        name: "Email Migration",
        description: "Exchange/Outlook to Office 365 migration",
        estimatedHours: 40,
        quantity: 1,
        minimumQuantity: 1,
        position: 1,
        state: "active",
        active: true,
      },
      {
        id: "sharepoint-setup",
        name: "SharePoint & OneDrive Setup",
        description: "Document management and collaboration setup",
        estimatedHours: 24,
        quantity: 1,
        minimumQuantity: 1,
        position: 2,
        state: "active",
        active: true,
      },
      {
        id: "teams-deployment",
        name: "Teams Deployment",
        description: "Microsoft Teams configuration and training",
        estimatedHours: 20,
        quantity: 1,
        minimumQuantity: 1,
        position: 3,
        state: "active",
        active: true,
      },
      {
        id: "user-training",
        name: "User Training & Adoption",
        description: "End-user training and change management",
        estimatedHours: 16,
        quantity: 1,
        minimumQuantity: 1,
        position: 4,
        state: "active",
        active: true,
      }
    ]
  },
  {
    id: "local-server-virtualization",
    name: "Server Virtualization",
    category: "Infrastructure",
    description: "Implementation of virtualization solutions using VMware, Hyper-V, or other platforms.",
    keywords: ["virtualization", "vmware", "hyper-v", "virtual machines", "server consolidation"],
    estimatedHours: 90,
    complexity: "High",
    source: "local",
    subservices: [
      {
        id: "virtualization-design",
        name: "Virtualization Architecture Design",
        description: "VMware/Hyper-V infrastructure design",
        estimatedHours: 24,
        quantity: 1,
        minimumQuantity: 1,
        position: 1,
        state: "active",
        active: true,
      },
      {
        id: "host-deployment",
        name: "Host Server Deployment",
        description: "Virtualization host installation and configuration",
        estimatedHours: 32,
        quantity: 1,
        minimumQuantity: 1,
        position: 2,
        state: "active",
        active: true,
      },
      {
        id: "vm-migration",
        name: "VM Migration & Setup",
        description: "Physical to virtual migration and VM creation",
        estimatedHours: 24,
        quantity: 1,
        minimumQuantity: 1,
        position: 3,
        state: "active",
        active: true,
      },
      {
        id: "monitoring-setup",
        name: "Monitoring & Management",
        description: "Virtualization monitoring and management tools",
        estimatedHours: 10,
        quantity: 1,
        minimumQuantity: 1,
        position: 4,
        state: "active",
        active: true,
      }
    ]
  },
]

const STOP_WORDS = new Set([
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "up",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "among",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "a",
  "an",
  "this",
  "that",
  "these",
  "those",
  "installation",
])

const TECHNOLOGY_AREAS = {
  networking: [
    "router",
    "switch",
    "firewall",
    "vpn",
    "wan",
    "lan",
    "vlan",
    "bgp",
    "ospf",
    "dmvpn",
    "qos",
    "network",
    "ethernet",
    "wifi",
    "wireless",
  ],
  security: [
    "firewall",
    "antivirus",
    "encryption",
    "authentication",
    "authorization",
    "security",
    "threat",
    "vulnerability",
    "compliance",
    "audit",
  ],
  cloud: ["aws", "azure", "gcp", "cloud", "migration", "hybrid", "saas", "paas", "iaas", "kubernetes", "docker"],
  server: ["server", "windows", "linux", "unix", "vmware", "hyper-v", "virtualization", "datacenter", "storage"],
  database: ["sql", "mysql", "postgresql", "oracle", "mongodb", "database", "backup", "recovery", "replication"],
  email: ["exchange", "outlook", "office365", "email", "smtp", "imap", "pop3", "calendar", "contacts"],
  backup: ["backup", "recovery", "disaster", "replication", "archive", "restore", "veeam", "commvault"],
}

function classifyTechnologyArea(text: string): string[] {
  const lowerText = text.toLowerCase()
  const areas: string[] = []

  Object.entries(TECHNOLOGY_AREAS).forEach(([area, keywords]) => {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      areas.push(area)
    }
  })

  return areas
}

function filterStopWords(words: string[]): string[] {
  return words.filter(
    (word) => word.length > 2 && !STOP_WORDS.has(word.toLowerCase()) && /^[a-zA-Z0-9]+$/.test(word), // Only alphanumeric words
  )
}

export async function matchServices(userInput: string): Promise<ServiceMatch[]> {
  console.log(`🔍 Starting service matching for: "${userInput}"`)

  try {
    // Get services from ScopeStack API
    const servicesResult = await scopeStackApi.getServices()

    if (servicesResult.success && servicesResult.data) {
      console.log("✅ Using ScopeStack API services")

      let subservicesData: any[] = []

      // Check if the API response has an 'included' section with subservices
      if (servicesResult.data && typeof servicesResult.data === "object" && "included" in servicesResult.data) {
        const included = (servicesResult.data as any).included
        if (Array.isArray(included)) {
          subservicesData = included.filter((item: any) => item.type === "subservices")
          console.log(`📦 Found ${subservicesData.length} subservices in included section`)
        }
      }

      // If no subservices in included section, try separate API call as fallback
      if (subservicesData.length === 0) {
        console.log("🔄 No subservices in included section, trying separate API call")
        const subservicesResult = await scopeStackApi.getSubservices()
        if (subservicesResult.success && subservicesResult.data) {
          subservicesData = subservicesResult.data
        }
      }

      const services = convertScopeStackToServices(servicesResult.data, subservicesData)
      console.log(`🔄 Converted to ${services.length} services with subservices`)

      // Log subservice counts for debugging
      services.forEach((service) => {
        if (service.subservices && service.subservices.length > 0) {
          console.log(
            `📋 Service "${service.name}" has ${service.subservices.length} subservices:`,
            service.subservices.map((sub) => sub.name),
          )
        }
      })

      return matchServicesAgainstReal(userInput, services)
    } else {
      console.log("⚠️ ScopeStack API failed, using offline mode")
      return matchServicesAgainstReal(userInput, mockServices)
    }
  } catch (error) {
    console.error("❌ Service matching error:", error)
    console.log("🔄 Falling back to local services")
    return matchServicesAgainstReal(userInput, mockServices)
  }
}

function convertScopeStackToServices(servicesData: any, subservicesData: any): Service[] {
  const services: Service[] = []

  console.log("🔍 Raw API response types:", {
    servicesType: typeof servicesData,
    servicesIsArray: Array.isArray(servicesData),
    subservicesType: typeof subservicesData,
    subservicesIsArray: Array.isArray(subservicesData),
  })

  // Handle different response formats from ScopeStack API
  let actualServicesData = servicesData
  let actualSubservicesData = subservicesData

  // If the response has a 'data' property (JSON:API format), use that
  if (servicesData && typeof servicesData === "object" && servicesData.data) {
    actualServicesData = servicesData.data
    console.log("📦 Extracted services from .data property")
  }

  if (subservicesData && typeof subservicesData === "object" && subservicesData.data) {
    actualSubservicesData = subservicesData.data
    console.log("📦 Extracted subservices from .data property")
  }

  if (!Array.isArray(actualServicesData)) {
    console.warn("⚠️ servicesData is not an array:", {
      type: typeof actualServicesData,
      value: actualServicesData,
      hasData: actualServicesData?.data ? "yes" : "no",
    })
    return services
  }

  if (!Array.isArray(actualSubservicesData)) {
    console.warn("⚠️ subservicesData is not an array:", {
      type: typeof actualSubservicesData,
      value: actualSubservicesData,
      hasData: actualSubservicesData?.data ? "yes" : "no",
    })
    actualSubservicesData = [] // Use empty array as fallback
  }

  console.log(`🔄 Converting ${actualServicesData.length} services and ${actualSubservicesData.length} subservices`)

  console.log("🎯 SPECIFIC DEBUG: Looking for Router service ID 259302 and its subservices")
  const routerService = actualServicesData.find((service) => service.id == 259302 || String(service.id) === "259302")
  if (routerService) {
    console.log("🎯 Found Router service 259302:", {
      id: routerService.id,
      name: routerService.attributes?.name,
      type: routerService.type,
    })
  } else {
    console.log("❌ Router service 259302 NOT found in services data")
  }

  const routerSubservices = actualSubservicesData.filter((sub) => {
    const serviceId = sub.relationships?.service?.data?.id
    return serviceId == 259302 || String(serviceId) === "259302"
  })
  console.log(`🎯 Found ${routerSubservices.length} subservices for Router service 259302:`)
  routerSubservices.forEach((sub, index) => {
    console.log(
      `   ${index + 1}. "${sub.attributes?.name}" (ID: ${sub.id}, Service ID: ${sub.relationships?.service?.data?.id})`,
    )
  })

  console.log("🔍 All subservices data with full structure:")
  actualSubservicesData.forEach((sub, index) => {
    console.log(`   Subservice ${index}:`, {
      id: sub.id,
      type: sub.type,
      name: sub.attributes?.name,
      serviceDescription: sub.attributes?.["service-description"],
      suggestedHours: sub.attributes?.["suggested-hours"],
      minimumQuantity: sub.attributes?.["minimum-quantity"],
      quantity: sub.attributes?.quantity,
      relationshipServiceId: sub.relationships?.service?.data?.id,
      relationshipServiceType: sub.relationships?.service?.data?.type,
    })
  })

  let phasesData: any[] = []
  if (servicesData && typeof servicesData === "object" && "included" in servicesData) {
    const included = (servicesData as any).included
    if (Array.isArray(included)) {
      phasesData = included.filter((item: any) => item.type === "phases")
      console.log(`📦 Found ${phasesData.length} phases in included section`)
    }
  }

  // Create a map of phase IDs to phase names
  const phaseMap = new Map()
  phasesData.forEach((phase) => {
    if (phase.id && phase.attributes?.name) {
      phaseMap.set(String(phase.id), phase.attributes.name)
      console.log(`📋 Phase mapping: ID ${phase.id} -> "${phase.attributes.name}"`)
    }
  })

  actualServicesData.forEach((serviceItem) => {
    if (!serviceItem || typeof serviceItem !== "object") {
      console.warn("⚠️ Invalid service item:", serviceItem)
      return
    }

    const attributes = serviceItem.attributes
    if (!attributes) {
      console.warn("⚠️ Service item missing attributes:", serviceItem)
      return
    }

    const keywords: string[] = []

    // Add main service name as primary keywords (split and clean)
    if (attributes.name) {
      const nameWords = attributes.name
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word.toLowerCase()))
      keywords.push(...nameWords)
    }

    // Add tag list as high-priority keywords
    if (attributes["tag-list"] && Array.isArray(attributes["tag-list"])) {
      keywords.push(...attributes["tag-list"].map((tag) => tag.toLowerCase()))
    }

    // Add SKU parts as keywords (these are usually meaningful)
    if (attributes.sku) {
      keywords.push(
        ...attributes.sku
          .toLowerCase()
          .split(/[-_]/)
          .filter((part) => part.length > 1),
      )
    }

    // Add service type as keyword
    if (attributes["service-type"]) {
      keywords.push(attributes["service-type"].toLowerCase().replace(/_/g, " "))
    }

    // Only add selective description words (avoid common words)
    if (attributes["service-description"]) {
      const descWords = attributes["service-description"]
        .toLowerCase()
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 4 && !["installation", "configuration", "implementation", "service", "system"].includes(word),
        )
      keywords.push(...descWords.slice(0, 3)) // Only take first 3 meaningful words
    }

    // Determine complexity based on hours
    let complexity: "Low" | "Medium" | "High" = "Medium"
    const totalHours = attributes["total-hours"] || attributes["suggested-hours"] || 0
    if (totalHours < 20) complexity = "Low"
    else if (totalHours > 60) complexity = "High"

    const serviceId = serviceItem.id
    const relatedSubservices = actualSubservicesData.filter((sub) => {
      if (!sub || !sub.relationships?.service?.data?.id) return false

      const subServiceId = sub.relationships.service.data.id
      // Handle both string and number ID comparisons
      return subServiceId == serviceId || String(subServiceId) === String(serviceId)
    })

    if (serviceId == 259302 || String(serviceId) === "259302") {
      console.log("🎯 PROCESSING ROUTER SERVICE 259302:")
      console.log(`   - Service Name: ${attributes.name}`)
      console.log(`   - Service ID: ${serviceId} (type: ${typeof serviceId})`)
      console.log(`   - Total subservices in data: ${actualSubservicesData.length}`)
      console.log(`   - Subservices matching this service: ${relatedSubservices.length}`)
      console.log(
        "   - Expected subservices: L3 Services - BGP, Advanced L3 - DMVPN Hub, Advanced L3 - DMVPN Spoke, L3 Services - Dynamic Routing",
      )

      if (relatedSubservices.length === 0) {
        console.log("❌ NO SUBSERVICES FOUND - checking all subservices for potential matches:")
        actualSubservicesData.forEach((sub, idx) => {
          const subServiceId = sub.relationships?.service?.data?.id
          console.log(
            `     ${idx}: "${sub.attributes?.name}" -> Service ID: ${subServiceId} (${typeof subServiceId}) | Match: ${subServiceId == serviceId}`,
          )
        })
      }
    }

    console.log(`🔍 Service "${attributes.name}" (ID: ${serviceId}, Type: ${typeof serviceId}):`)
    console.log(`   - Looking for subservices with service.data.id matching ${serviceId}`)
    console.log(`   - Found ${relatedSubservices.length} related subservices:`)
    relatedSubservices.forEach((sub, index) => {
      console.log(`     ${index + 1}. "${sub.attributes?.name}" (Service ID: ${sub.relationships?.service?.data?.id})`)
    })

    const subservices: SubService[] = relatedSubservices.map((sub) => ({
      id: `ss-sub-${sub.id}`,
      name: sub.attributes?.name || "Unknown Subservice",
      description: sub.attributes?.["service-description"] || "No description available",
      estimatedHours: sub.attributes?.["suggested-hours"] || 0,
      resourceType: sub.relationships?.resource?.data?.type || "Technical",
      quantity: sub.attributes?.quantity || 1,
      minimumQuantity: sub.attributes?.["minimum-quantity"] || 1,
      position: sub.attributes?.position || 0,
      state: sub.attributes?.state || "pending",
      active: sub.attributes?.active !== false, // Default to true if not specified
      languages: sub.attributes?.languages
        ? {
            outOfScope: sub.attributes.languages["out_of_scope"],
            customerResponsibility: sub.attributes.languages["customer_responsibility"],
          }
        : undefined,
    }))

    // Add subservice keywords
    relatedSubservices.forEach((sub) => {
      if (sub.attributes?.name) {
        const subWords = sub.attributes.name
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length > 3 && !["policy", "setup", "config"].includes(word))
        keywords.push(...subWords.slice(0, 2)) // Only take first 2 words per subservice
      }
    })

    let phaseName: string | undefined
    if (serviceItem.relationships?.phase?.data?.id) {
      const phaseId = String(serviceItem.relationships.phase.data.id)
      phaseName = phaseMap.get(phaseId)
      console.log(`🔗 Service "${attributes.name}" linked to phase ID ${phaseId} -> "${phaseName}"`)
    }

    services.push({
      id: `ss-${serviceItem.id}`,
      name: attributes.name || "Unknown Service",
      category: attributes["service-type"] || "General",
      description: attributes["service-description"] || attributes.guidance || "No description available",
      keywords: [...new Set(keywords)], // Remove duplicates
      estimatedHours: totalHours,
      complexity,
      source: "scopestack",
      sku: attributes.sku,
      subservices: subservices.length > 0 ? subservices : undefined,
      quantity: attributes.quantity || 1,
      minimumQuantity: attributes["minimum-quantity"] || 1,
      position: attributes.position || 0,
      state: attributes.state,
      serviceType: attributes["service-type"],
      paymentFrequency: attributes["payment-frequency"],
      languages: attributes.languages,
      phaseName: phaseName,
    })

    console.log(`✅ Created service "${attributes.name}" with ${subservices.length} subservices`)
    if (subservices.length > 0) {
      console.log(`   Subservices: ${subservices.map((s) => s.name).join(", ")}`)
    }
  })

  console.log(`✅ Successfully converted ${services.length} services`)
  return services
}

function matchServicesAgainstReal(userInput: string, services: Service[]): ServiceMatch[] {
  const input = userInput.toLowerCase().trim()
  const inputWords = input.split(/\s+/).filter((word) => word.length > 2) // Simplified to basic word filtering
  const matches: ServiceMatch[] = []

  console.log(`🔍 Matching "${userInput}" against ${services.length} services`)
  console.log(`📝 Input words: [${inputWords.join(", ")}]`)

  services.forEach((service) => {
    const matchedKeywords: string[] = []
    let totalScore = 0

    // Exact service name match
    if (service.name.toLowerCase().includes(input)) {
      totalScore += 100
      matchedKeywords.push("exact-name")
    }

    // Individual word matches in service name
    inputWords.forEach((inputWord) => {
      if (service.name.toLowerCase().includes(inputWord)) {
        totalScore += 50
        matchedKeywords.push(inputWord)
      }
    })

    // SKU matching
    if (service.sku && inputWords.some((word) => service.sku!.toLowerCase().includes(word))) {
      totalScore += 40
      matchedKeywords.push("sku-match")
    }

    // Keyword matching
    inputWords.forEach((inputWord) => {
      service.keywords.forEach((keyword) => {
        if (keyword.toLowerCase().includes(inputWord)) {
          totalScore += 30
          if (!matchedKeywords.includes(keyword)) {
            matchedKeywords.push(keyword)
          }
        }
      })
    })

    // Description matching
    if (service.description) {
      inputWords.forEach((inputWord) => {
        if (service.description!.toLowerCase().includes(inputWord)) {
          totalScore += 20
        }
      })
    }

    // Category matching
    inputWords.forEach((inputWord) => {
      if (service.category.toLowerCase().includes(inputWord)) {
        totalScore += 25
        matchedKeywords.push("category")
      }
    })

    // Phase name matching
    if (service.phaseName && inputWords.some((word) => service.phaseName.toLowerCase().includes(word))) {
      totalScore += 25
      matchedKeywords.push("phase-name")
    }

    if (totalScore >= 20) {
      const confidence = Math.min(totalScore, 100)
      matches.push({
        service,
        confidence: Math.round(confidence),
        matchedKeywords,
      })
    }
  })

  const sortedMatches = matches.sort((a, b) => b.confidence - a.confidence).slice(0, 8)

  console.log(`🎯 Found ${sortedMatches.length} matches:`)
  sortedMatches.forEach((match, index) => {
    console.log(`   ${index + 1}. ${match.service.name} (${match.confidence}% - ${match.matchedKeywords.join(", ")})`)
  })

  return sortedMatches
}

export async function getServices(): Promise<Service[]> {
  try {
    console.log(`📋 Fetching services from ScopeStack API...`)
    const servicesResult = await scopeStackApi.getServices()

    if (servicesResult.success && servicesResult.data) {
      console.log("✅ Successfully loaded services from ScopeStack API")

      let subservicesData: any[] = []

      // Check if the API response has an 'included' section with subservices
      if (servicesResult.data && typeof servicesResult.data === "object" && "included" in servicesResult.data) {
        const included = (servicesResult.data as any).included
        if (Array.isArray(included)) {
          subservicesData = included.filter((item: any) => item.type === "subservices")
          console.log(`📦 Found ${subservicesData.length} subservices in included section`)
        }
      }

      // If no subservices in included section, try separate API call as fallback
      if (subservicesData.length === 0) {
        console.log("🔄 No subservices in included section, trying separate API call")
        const subservicesResult = await scopeStackApi.getSubservices()
        if (subservicesResult.success && subservicesResult.data) {
          subservicesData = subservicesResult.data
        }
      }

      return convertScopeStackToServices(servicesResult.data, subservicesData)
    }
  } catch (error) {
    console.warn("🔄 ScopeStack API unavailable, using mock services:", error)
  }

  console.log(`🏠 Using local mock services (${mockServices.length} services available)`)

  // Fallback to mock services
  return mockServices
}
