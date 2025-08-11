import type { ServiceMatch } from "../data/services"
import type {
  WorkBreakdownStructure,
  WBSPhase,
  WBSService,
  WBSSubService,
  WBSDeliverable,
  WBSSummary,
} from "../types/wbs"

// Hourly rates for different resource types
const HOURLY_RATES = {
  Technical: 150,
  "Project Management": 175,
  Specialist: 200,
}

// Service-specific sub-services and deliverables
const SERVICE_BREAKDOWN = {
  "network-assessment": {
    phaseName: "Network Infrastructure Assessment",
    services: [
      {
        name: "Current State Analysis",
        description: "Document existing network infrastructure and performance",
        hours: 16,
        resourceType: "Technical" as const,
        subservices: [
          {
            name: "Network Discovery",
            description: "Identify all network devices and connections",
            hours: 8,
            resourceType: "Technical" as const,
            deliverables: [
              {
                name: "Network Topology Documentation",
                description: "Complete network diagram with all devices and connections",
                hours: 8,
                riskLevel: "Low" as const,
              },
            ],
          },
          {
            name: "Performance Analysis",
            description: "Analyze current network performance metrics",
            hours: 8,
            resourceType: "Technical" as const,
            deliverables: [
              {
                name: "Performance Baseline Report",
                description: "Current network performance metrics and bottlenecks",
                hours: 8,
                riskLevel: "Medium" as const,
              },
            ],
          },
        ],
      },
      {
        name: "Security Assessment",
        description: "Evaluate network security posture and vulnerabilities",
        hours: 16,
        resourceType: "Specialist" as const,
        subservices: [
          {
            name: "Vulnerability Scanning",
            description: "Automated and manual security vulnerability assessment",
            hours: 12,
            resourceType: "Specialist" as const,
            deliverables: [
              {
                name: "Security Gap Analysis",
                description: "Identification of security vulnerabilities and risks",
                hours: 12,
                riskLevel: "High" as const,
              },
            ],
          },
          {
            name: "Compliance Review",
            description: "Review against industry security standards",
            hours: 4,
            resourceType: "Specialist" as const,
            deliverables: [
              {
                name: "Compliance Review",
                description: "Assessment against industry standards",
                hours: 4,
                riskLevel: "Medium" as const,
              },
            ],
          },
        ],
      },
    ],
  },
  "firewall-installation": {
    phaseName: "Large Office Firewall Installation",
    services: [
      {
        name: "Firewall Hardware Setup",
        description: "Physical installation and configuration of firewall devices",
        hours: 24,
        resourceType: "Technical" as const,
        subservices: [
          {
            name: "Hardware Installation",
            description: "Physical mounting and connection of firewall devices",
            hours: 8,
            resourceType: "Technical" as const,
            deliverables: [
              {
                name: "Hardware Installation Report",
                description: "Documentation of physical firewall installation",
                hours: 2,
                riskLevel: "Low" as const,
              },
            ],
          },
          {
            name: "Initial Configuration",
            description: "Basic firewall configuration and rule setup",
            hours: 16,
            resourceType: "Technical" as const,
            deliverables: [
              {
                name: "Firewall Configuration Document",
                description: "Complete firewall rules and configuration settings",
                hours: 4,
                riskLevel: "Medium" as const,
              },
            ],
          },
        ],
      },
    ],
  },
  "active-directory": {
    phaseName: "Active Directory Server Installation",
    services: [
      {
        name: "AD Server Deployment",
        description: "Installation and configuration of Active Directory servers",
        hours: 32,
        resourceType: "Technical" as const,
        subservices: [
          {
            name: "Server Installation",
            description: "Install and configure Windows Server for AD",
            hours: 16,
            resourceType: "Technical" as const,
            deliverables: [
              {
                name: "Server Installation Documentation",
                description: "Complete server setup and configuration documentation",
                hours: 4,
                riskLevel: "Low" as const,
              },
            ],
          },
          {
            name: "Domain Configuration",
            description: "Configure Active Directory domain and policies",
            hours: 16,
            resourceType: "Technical" as const,
            deliverables: [
              {
                name: "Domain Configuration Guide",
                description: "Active Directory domain structure and policy documentation",
                hours: 6,
                riskLevel: "Medium" as const,
              },
            ],
          },
        ],
      },
    ],
  },
}

export function generateWBS(serviceMatches: ServiceMatch[], projectName: string): WorkBreakdownStructure {
  const validServiceMatches = serviceMatches.filter(
    (match) => match && match.service && match.service.id && match.service.name,
  )

  if (validServiceMatches.length === 0) {
    console.warn("⚠️ No valid services provided to generateWBS")
    return {
      id: "empty-wbs",
      projectName,
      phases: [],
      totalHours: 0,
      totalCost: 0,
      totalDuration: 0,
      teamSize: 1,
      riskAssessment: {
        overall: "Low",
        factors: [],
      },
      assumptions: [],
      createdAt: new Date(),
    }
  }

  console.log(`🔧 Generating WBS for ${validServiceMatches.length} valid services`)

  const phaseMap = new Map<string, WBSPhase>()
  let totalHours = 0
  let totalCost = 0

  validServiceMatches.forEach((match, index) => {
    const service = match.service

    if (!service || !service.id || !service.name) {
      console.warn(`⚠️ Skipping invalid service at index ${index}:`, service)
      return
    }

    // Use phase name from API data if available, otherwise fall back to service-based phase
    const phaseName = service.phaseName || `Phase ${index + 1}: ${service.name}`

    console.log(`🔍 Processing service "${service.name}" with phase name: "${phaseName}"`)

    // Create or get existing phase
    if (!phaseMap.has(phaseName)) {
      phaseMap.set(phaseName, {
        id: `phase-${phaseName.toLowerCase().replace(/\s+/g, "-")}`,
        name: phaseName,
        description: `Implementation phase for ${phaseName}`,
        startWeek: 1,
        duration: 0,
        services: [],
        totalHours: 0,
        totalCost: 0,
        riskLevel: "Medium",
        dependencies: [],
        milestones: [],
      })
    }

    const phase = phaseMap.get(phaseName)!

    // Check if we have predefined breakdown for this service
    const serviceBreakdown = SERVICE_BREAKDOWN[service.id as keyof typeof SERVICE_BREAKDOWN]

    if (serviceBreakdown) {
      // Use predefined breakdown for mock services
      serviceBreakdown.services.forEach((serviceData) => {
        const subservices: WBSSubService[] = serviceData.subservices.map((subserviceData) => {
          const deliverables: WBSDeliverable[] = subserviceData.deliverables.map((deliverable) => ({
            id: `deliverable-${deliverable.name.toLowerCase().replace(/\s+/g, "-")}`,
            name: deliverable.name,
            description: deliverable.description,
            estimatedHours: deliverable.hours,
            dependencies: [],
            riskLevel: deliverable.riskLevel,
          }))

          return {
            id: `subservice-${subserviceData.name.toLowerCase().replace(/\s+/g, "-")}`,
            name: subserviceData.name,
            description: subserviceData.description,
            estimatedHours: subserviceData.hours,
            deliverables,
            resourceType: subserviceData.resourceType,
            complexity: "Medium",
          }
        })

        const wbsService: WBSService = {
          id: `service-${serviceData.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: serviceData.name,
          description: serviceData.description,
          estimatedHours: serviceData.hours,
          totalCost: serviceData.hours * HOURLY_RATES[serviceData.resourceType],
          subservices,
          resourceType: serviceData.resourceType,
          complexity: "Medium",
          riskLevel: "Medium",
        }

        phase.services.push(wbsService)
        phase.totalHours += serviceData.hours
        phase.totalCost += wbsService.totalCost
      })
    } else {
      const estimatedHours = service.estimatedHours || 40
      const resourceType: "Technical" | "Project Management" | "Specialist" =
        service.complexity === "High" ? "Specialist" : "Technical"

      let subServices: WBSSubService[] = []

      if (service.subservices && service.subservices.length > 0) {
        // Convert API subservices to WBS subservices
        subServices = service.subservices.map((subservice) => ({
          id: subservice.id,
          name: subservice.name,
          description: subservice.description,
          estimatedHours: subservice.estimatedHours || Math.round(estimatedHours / service.subservices!.length),
          deliverables: [
            {
              id: `deliverable-${subservice.id}`,
              name: `${subservice.name} Deliverable`,
              description: `Completion of ${subservice.name}`,
              estimatedHours: Math.round((subservice.estimatedHours || 0) * 0.2),
              dependencies: [],
              riskLevel: "Medium" as const,
            },
          ],
          resourceType: (subservice.resourceType as "Technical" | "Project Management" | "Specialist") || resourceType,
          complexity: service.complexity,
        }))
      } else {
        // Create default subservices if none exist
        subServices = [
          {
            id: `${service.id}-planning`,
            name: `${service.name} Planning`,
            description: `Planning and preparation for ${service.name}`,
            estimatedHours: Math.round(estimatedHours * 0.2),
            deliverables: [
              {
                id: `${service.id}-planning-deliverable`,
                name: `${service.name} Plan`,
                description: `Detailed implementation plan for ${service.name}`,
                estimatedHours: Math.round(estimatedHours * 0.1),
                dependencies: [],
                riskLevel: "Low" as const,
              },
            ],
            resourceType: "Project Management",
            complexity: service.complexity,
          },
          {
            id: `${service.id}-implementation`,
            name: `${service.name} Implementation`,
            description: `Core implementation of ${service.name}`,
            estimatedHours: Math.round(estimatedHours * 0.7),
            deliverables: [
              {
                id: `${service.id}-implementation-deliverable`,
                name: `${service.name} Implementation`,
                description: `Completed implementation of ${service.name}`,
                estimatedHours: Math.round(estimatedHours * 0.1),
                dependencies: [`${service.id}-planning-deliverable`],
                riskLevel: service.complexity === "High" ? "High" : ("Medium" as const),
              },
            ],
            resourceType,
            complexity: service.complexity,
          },
          {
            id: `${service.id}-testing`,
            name: `${service.name} Testing & Documentation`,
            description: `Testing and documentation for ${service.name}`,
            estimatedHours: Math.round(estimatedHours * 0.1),
            deliverables: [
              {
                id: `${service.id}-testing-deliverable`,
                name: `${service.name} Documentation`,
                description: `Complete documentation and testing results for ${service.name}`,
                estimatedHours: Math.round(estimatedHours * 0.05),
                dependencies: [`${service.id}-implementation-deliverable`],
                riskLevel: "Low" as const,
              },
            ],
            resourceType: "Technical",
            complexity: "Low",
          },
        ]
      }

      const serviceHours = subServices.reduce((sum, sub) => sum + sub.estimatedHours, 0)
      const serviceCost = subServices.reduce((sum, sub) => sum + sub.estimatedHours * HOURLY_RATES[sub.resourceType], 0)

      const wbsService: WBSService = {
        id: `service-${service.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: service.name,
        description: service.description || "No description available",
        estimatedHours: serviceHours,
        totalCost: serviceCost,
        subservices: subServices,
        resourceType,
        complexity: service.complexity,
        riskLevel: service.complexity === "High" ? "High" : service.complexity === "Medium" ? "Medium" : "Low",
      }

      phase.services.push(wbsService)
      phase.totalHours += serviceHours
      phase.totalCost += serviceCost
    }

    totalHours += phase.totalHours
    totalCost += phase.totalCost
  })

  const phases = Array.from(phaseMap.values())

  // Add project management overhead (15% of total hours)
  const pmHours = Math.round(totalHours * 0.15)
  const pmCost = pmHours * HOURLY_RATES["Project Management"]
  totalHours += pmHours
  totalCost += pmCost

  // Add project management phase
  if (phases.length > 0) {
    const pmPhase: WBSPhase = {
      id: "phase-pm",
      name: "Project Management & Coordination",
      description: "Overall project coordination, stakeholder management, and quality assurance",
      startWeek: 1,
      duration: Math.ceil(totalHours / 40),
      services: [
        {
          id: "pm-coordination",
          name: "Project Coordination",
          description: "Daily project management and stakeholder communication",
          estimatedHours: pmHours,
          totalCost: pmCost,
          subservices: [
            {
              id: "pm-status-reports",
              name: "Weekly Status Reports",
              description: "Regular project status updates and milestone tracking",
              estimatedHours: Math.round(pmHours * 0.3),
              deliverables: [
                {
                  id: "pm-status-reports-deliverable",
                  name: "Weekly Status Reports",
                  description: "Regular project status updates and milestone tracking",
                  estimatedHours: Math.round(pmHours * 0.3),
                  dependencies: [],
                  riskLevel: "Low",
                },
              ],
              resourceType: "Project Management",
              complexity: "Medium",
            },
            {
              id: "pm-risk-management",
              name: "Risk Management",
              description: "Ongoing risk identification and mitigation",
              estimatedHours: Math.round(pmHours * 0.2),
              deliverables: [
                {
                  id: "pm-risk-management-deliverable",
                  name: "Risk Management",
                  description: "Ongoing risk identification and mitigation",
                  estimatedHours: Math.round(pmHours * 0.2),
                  dependencies: [],
                  riskLevel: "Medium",
                },
              ],
              resourceType: "Project Management",
              complexity: "Medium",
            },
            {
              id: "pm-quality-assurance",
              name: "Quality Assurance",
              description: "Quality reviews and deliverable validation",
              estimatedHours: Math.round(pmHours * 0.5),
              deliverables: [
                {
                  id: "pm-quality-assurance-deliverable",
                  name: "Quality Assurance",
                  description: "Quality reviews and deliverable validation",
                  estimatedHours: Math.round(pmHours * 0.5),
                  dependencies: [],
                  riskLevel: "Low",
                },
              ],
              resourceType: "Project Management",
              complexity: "Medium",
            },
          ],
          resourceType: "Project Management",
          complexity: "Medium",
          riskLevel: "Low",
        },
      ],
      totalHours: pmHours,
      totalCost: pmCost,
      riskLevel: "Low",
      dependencies: [],
      milestones: ["Project Kickoff", "Mid-Project Review", "Project Closure"],
    }

    phases.unshift(pmPhase) // Add PM phase at the beginning
  }

  // Calculate risk assessment
  const highRiskPhases = phases.filter((p) => p.riskLevel === "High").length
  const mediumRiskPhases = phases.filter((p) => p.riskLevel === "Medium").length
  const overallRisk: "Low" | "Medium" | "High" =
    highRiskPhases > 0 ? "High" : mediumRiskPhases > phases.length / 2 ? "Medium" : "Low"

  const riskFactors: string[] = []
  if (totalHours > 200) riskFactors.push("Large project scope")
  if (phases.length > 4) riskFactors.push("Multiple complex phases")
  if (highRiskPhases > 0) riskFactors.push("High-risk technical components")
  if (validServiceMatches.some((m) => m.service.keywords.includes("migration")))
    riskFactors.push("Data migration complexity")

  const totalWeeks = Math.max(Math.ceil(totalHours / 40), 1) // Ensure at least 1 week
  const teamSize = Math.ceil(totalHours / (160 * totalWeeks)) // Assuming 160 hours per person per month

  return {
    id: `wbs-${Date.now()}`,
    projectName,
    totalDuration: totalWeeks,
    totalHours,
    totalCost,
    teamSize,
    phases,
    riskAssessment: {
      overall: overallRisk,
      factors: riskFactors,
    },
    assumptions: [
      "Client will provide necessary access and resources",
      "No major scope changes during implementation",
      "Standard business hours for implementation",
    ],
    createdAt: new Date(),
  }
}

export function generateWBSSummary(wbs: WorkBreakdownStructure): WBSSummary {
  if (!wbs || !wbs.riskAssessment) {
    return {
      totalInvestment: 0,
      timeline: "0 weeks",
      phases: 0,
      teamSize: 0,
      riskLevel: "Low",
    }
  }

  return {
    totalInvestment: wbs.totalCost || 0,
    timeline: `${wbs.totalDuration || 0} weeks`,
    phases: wbs.phases?.length || 0,
    teamSize: wbs.teamSize || 0,
    riskLevel: wbs.riskAssessment?.overall || "Low",
  }
}

export function exportWBS(wbs: WorkBreakdownStructure, format: "json" | "csv"): string {
  if (format === "json") {
    return JSON.stringify(wbs, null, 2)
  }

  // CSV export
  const csvRows: string[] = []
  csvRows.push("Phase,Service,Subservice,Deliverable,Hours,Cost,Risk Level,Resource Type")

  wbs.phases.forEach((phase) => {
    phase.services.forEach((service) => {
      service.subservices.forEach((subservice) => {
        subservice.deliverables.forEach((deliverable) => {
          const cost = deliverable.estimatedHours * HOURLY_RATES[subservice.resourceType]
          csvRows.push(
            `"${phase.name}","${service.name}","${subservice.name}","${deliverable.name}",${deliverable.estimatedHours},${cost},"${deliverable.riskLevel}","${subservice.resourceType}"`,
          )
        })
      })
    })
  })

  return csvRows.join("\n")
}
