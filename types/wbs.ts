export interface WBSDeliverable {
  id: string
  name: string
  description: string
  estimatedHours: number
  dependencies: string[]
  riskLevel: "Low" | "Medium" | "High"
}

// Keeping original naming convention for backward compatibility
export interface WBSSubService {
  id: string
  name: string
  description: string
  estimatedHours: number
  deliverables: WBSDeliverable[]
  resourceType: "Technical" | "Project Management" | "Specialist"
  complexity: "Low" | "Medium" | "High"
}

// New service level between phases and subservices
export interface WBSService {
  id: string
  name: string
  description: string
  estimatedHours: number
  totalCost: number
  subservices: WBSSubService[]
  resourceType: "Technical" | "Project Management" | "Specialist"
  complexity: "Low" | "Medium" | "High"
  riskLevel: "Low" | "Medium" | "High"
}

export interface WBSPhase {
  id: string
  name: string // This is now the Phase Name (e.g., "Large Office Firewall Installation")
  description: string
  startWeek: number
  duration: number
  services: WBSService[] // Now contains Service Names instead of SubServices directly
  totalHours: number
  totalCost: number
  riskLevel: "Low" | "Medium" | "High"
  dependencies: string[]
  milestones: string[]
}

export interface WorkBreakdownStructure {
  id: string
  projectName: string
  totalDuration: number
  totalHours: number
  totalCost: number
  teamSize: number
  phases: WBSPhase[]
  riskAssessment: {
    overall: "Low" | "Medium" | "High"
    factors: string[]
  }
  assumptions: string[]
  createdAt: Date
}

export interface WBSSummary {
  totalInvestment: number
  timeline: string
  phases: number
  teamSize: number
  riskLevel: "Low" | "Medium" | "High"
}
