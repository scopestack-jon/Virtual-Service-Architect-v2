import type { ServiceMatch } from "../data/services"

export interface ProjectAnalysis {
  complexity: "Low" | "Medium" | "High"
  industry: string
  estimatedTimeline: string
  keyRequirements: string[]
  suggestedQuestions: string[]
  scopeReview: ScopeReview
  riskAssessment: RiskAssessment
  recommendations: ProjectRecommendation[]
}

export interface ScopeReview {
  completeness: "Complete" | "Partial" | "Incomplete"
  clarity: "Clear" | "Moderate" | "Unclear"
  feasibility: "High" | "Medium" | "Low"
  missingElements: string[]
  scopeGaps: string[]
  overallScore: number // 0-100
  reviewSummary: string
}

export interface RiskAssessment {
  overallRisk: "Low" | "Medium" | "High" | "Critical"
  riskFactors: RiskFactor[]
  mitigationStrategies: string[]
  budgetRisk: "Low" | "Medium" | "High"
  timelineRisk: "Low" | "Medium" | "High"
  technicalRisk: "Low" | "Medium" | "High"
}

export interface RiskFactor {
  category: "Technical" | "Budget" | "Timeline" | "Resource" | "Compliance" | "Integration"
  description: string
  impact: "Low" | "Medium" | "High"
  probability: "Low" | "Medium" | "High"
  mitigation: string
}

export interface ProjectRecommendation {
  type: "Scope" | "Technical" | "Process" | "Resource" | "Timeline"
  priority: "High" | "Medium" | "Low"
  title: string
  description: string
  impact: string
  effort: "Low" | "Medium" | "High"
}

export interface AIAssistantResponse {
  message: string
  questions: string[]
  missingServices: ServiceSuggestion[]
  scopeGaps: string[]
  nextSteps: string[]
  confidence: number
}

export interface ServiceSuggestion {
  serviceName: string
  reason: string
  priority: "High" | "Medium" | "Low"
  category: string
}

export interface ScopeGuidance {
  currentCompleteness: number
  missingElements: string[]
  clarificationNeeded: string[]
  suggestedQuestions: string[]
  recommendedServices: ServiceSuggestion[]
}

export async function analyzeProject(userInput: string): Promise<ProjectAnalysis> {
  console.log("🧠 Using enhanced AI analysis for project:", userInput.substring(0, 50) + "...")
  return analyzeProjectWithScopeReview(userInput)
}

function analyzeProjectWithScopeReview(userInput: string): ProjectAnalysis {
  const input = userInput.toLowerCase()

  // Basic analysis (existing logic)
  let complexity: "Low" | "Medium" | "High" = "Low"
  if (input.includes("migration") || input.includes("enterprise") || input.includes("complex")) {
    complexity = "High"
  } else if (input.includes("upgrade") || input.includes("integration") || input.includes("security")) {
    complexity = "Medium"
  }

  let industry = "General"
  if (input.includes("healthcare") || input.includes("medical") || input.includes("hipaa")) {
    industry = "Healthcare"
  } else if (input.includes("financial") || input.includes("banking") || input.includes("sox")) {
    industry = "Financial Services"
  } else if (input.includes("manufacturing") || input.includes("factory")) {
    industry = "Manufacturing"
  }

  let estimatedTimeline = "2-4 weeks"
  if (complexity === "High") {
    estimatedTimeline = "3-6 months"
  } else if (complexity === "Medium") {
    estimatedTimeline = "1-3 months"
  }

  const keyRequirements: string[] = []
  if (input.includes("cloud")) keyRequirements.push("Cloud Infrastructure")
  if (input.includes("security")) keyRequirements.push("Security & Compliance")
  if (input.includes("backup")) keyRequirements.push("Data Protection")
  if (input.includes("network")) keyRequirements.push("Network Infrastructure")

  const suggestedQuestions = generateQuestions(input, complexity, industry)

  const scopeReview = analyzeScopeCompleteness(input, keyRequirements)
  const riskAssessment = assessProjectRisks(input, complexity, industry)
  const recommendations = generateProjectRecommendations(input, complexity, scopeReview, riskAssessment)

  return {
    complexity,
    industry,
    estimatedTimeline,
    keyRequirements,
    suggestedQuestions,
    scopeReview,
    riskAssessment,
    recommendations,
  }
}

function analyzeScopeCompleteness(input: string, requirements: string[]): ScopeReview {
  const inputLength = input.length
  const hasSpecifics = /\b(server|database|application|network|security|backup|migration|upgrade)\b/i.test(input)
  const hasQuantifiers = /\b(\d+|few|several|many|multiple)\b/i.test(input)
  const hasTimeline = /\b(urgent|asap|month|week|quarter|deadline)\b/i.test(input)
  const hasBudget = /\b(budget|cost|price|expensive|cheap)\b/i.test(input)

  let completeness: "Complete" | "Partial" | "Incomplete" = "Incomplete"
  let clarity: "Clear" | "Moderate" | "Unclear" = "Unclear"
  let feasibility: "High" | "Medium" | "Low" = "Medium"
  let overallScore = 30

  // Assess completeness
  if (hasSpecifics && hasQuantifiers && hasTimeline) {
    completeness = "Complete"
    overallScore += 40
  } else if (hasSpecifics && (hasQuantifiers || hasTimeline)) {
    completeness = "Partial"
    overallScore += 25
  }

  // Assess clarity
  if (inputLength > 100 && hasSpecifics) {
    clarity = "Clear"
    overallScore += 20
  } else if (inputLength > 50) {
    clarity = "Moderate"
    overallScore += 10
  }

  // Assess feasibility
  if (requirements.length > 0 && hasSpecifics) {
    feasibility = "High"
    overallScore += 10
  } else if (hasSpecifics) {
    feasibility = "Medium"
  } else {
    feasibility = "Low"
  }

  const missingElements: string[] = []
  const scopeGaps: string[] = []

  if (!hasTimeline) {
    missingElements.push("Project timeline or deadline")
    scopeGaps.push("Timeline expectations are unclear")
  }
  if (!hasBudget) {
    missingElements.push("Budget constraints or expectations")
    scopeGaps.push("Budget parameters not specified")
  }
  if (!hasQuantifiers) {
    missingElements.push("Scale or quantity specifications")
    scopeGaps.push("Project scale is ambiguous")
  }

  const reviewSummary = generateScopeReviewSummary(completeness, clarity, feasibility, overallScore)

  return {
    completeness,
    clarity,
    feasibility,
    missingElements,
    scopeGaps,
    overallScore,
    reviewSummary,
  }
}

function assessProjectRisks(input: string, complexity: string, industry: string): RiskAssessment {
  const riskFactors: RiskFactor[] = []

  // Technical risks
  if (input.includes("migration") || input.includes("legacy")) {
    riskFactors.push({
      category: "Technical",
      description: "Legacy system migration complexity",
      impact: "High",
      probability: "Medium",
      mitigation: "Conduct thorough system assessment and create detailed migration plan",
    })
  }

  if (input.includes("integration") || input.includes("connect")) {
    riskFactors.push({
      category: "Integration",
      description: "System integration challenges",
      impact: "Medium",
      probability: "Medium",
      mitigation: "Perform integration testing and create rollback procedures",
    })
  }

  // Compliance risks
  if (industry === "Healthcare" || input.includes("hipaa")) {
    riskFactors.push({
      category: "Compliance",
      description: "HIPAA compliance requirements",
      impact: "High",
      probability: "High",
      mitigation: "Engage compliance experts and conduct security audits",
    })
  }

  if (industry === "Financial Services" || input.includes("sox")) {
    riskFactors.push({
      category: "Compliance",
      description: "Financial regulatory compliance",
      impact: "High",
      probability: "High",
      mitigation: "Implement audit trails and access controls",
    })
  }

  // Timeline risks
  if (complexity === "High") {
    riskFactors.push({
      category: "Timeline",
      description: "Complex project timeline overruns",
      impact: "Medium",
      probability: "High",
      mitigation: "Break project into phases with clear milestones",
    })
  }

  const overallRisk = calculateOverallRisk(riskFactors, complexity)
  const budgetRisk = complexity === "High" ? "High" : complexity === "Medium" ? "Medium" : "Low"
  const timelineRisk = riskFactors.some((r) => r.category === "Timeline") ? "High" : "Medium"
  const technicalRisk = riskFactors.some((r) => r.category === "Technical") ? "High" : "Low"

  const mitigationStrategies = [
    "Implement phased approach with clear milestones",
    "Conduct regular stakeholder reviews and approvals",
    "Maintain comprehensive project documentation",
    "Establish clear communication protocols",
  ]

  return {
    overallRisk,
    riskFactors,
    mitigationStrategies,
    budgetRisk,
    timelineRisk,
    technicalRisk,
  }
}

function generateProjectRecommendations(
  input: string,
  complexity: string,
  scopeReview: ScopeReview,
  riskAssessment: RiskAssessment,
): ProjectRecommendation[] {
  const recommendations: ProjectRecommendation[] = []

  // Scope recommendations
  if (scopeReview.completeness === "Incomplete") {
    recommendations.push({
      type: "Scope",
      priority: "High",
      title: "Define Complete Project Scope",
      description: "Gather additional requirements to fully define project scope and objectives",
      impact: "Reduces project risks and ensures accurate estimates",
      effort: "Low",
    })
  }

  if (scopeReview.missingElements.includes("Project timeline or deadline")) {
    recommendations.push({
      type: "Timeline",
      priority: "High",
      title: "Establish Project Timeline",
      description: "Define clear project deadlines and milestone dates",
      impact: "Enables proper resource planning and scheduling",
      effort: "Low",
    })
  }

  // Technical recommendations
  if (complexity === "High") {
    recommendations.push({
      type: "Technical",
      priority: "High",
      title: "Implement Phased Approach",
      description: "Break complex project into manageable phases with clear deliverables",
      impact: "Reduces risk and enables incremental value delivery",
      effort: "Medium",
    })
  }

  if (riskAssessment.technicalRisk === "High") {
    recommendations.push({
      type: "Technical",
      priority: "Medium",
      title: "Conduct Technical Proof of Concept",
      description: "Validate technical approach with small-scale implementation",
      impact: "Reduces technical risks and validates solution approach",
      effort: "Medium",
    })
  }

  // Process recommendations
  if (riskAssessment.overallRisk === "High" || riskAssessment.overallRisk === "Critical") {
    recommendations.push({
      type: "Process",
      priority: "High",
      title: "Establish Risk Management Process",
      description: "Implement regular risk reviews and mitigation tracking",
      impact: "Proactive risk management and issue resolution",
      effort: "Low",
    })
  }

  return recommendations.slice(0, 5) // Limit to top 5 recommendations
}

function calculateOverallRisk(riskFactors: RiskFactor[], complexity: string): "Low" | "Medium" | "High" | "Critical" {
  const highImpactRisks = riskFactors.filter((r) => r.impact === "High").length
  const highProbabilityRisks = riskFactors.filter((r) => r.probability === "High").length

  if (complexity === "High" && (highImpactRisks >= 2 || highProbabilityRisks >= 3)) {
    return "Critical"
  } else if (complexity === "High" || highImpactRisks >= 1) {
    return "High"
  } else if (complexity === "Medium" || riskFactors.length >= 2) {
    return "Medium"
  } else {
    return "Low"
  }
}

function generateScopeReviewSummary(completeness: string, clarity: string, feasibility: string, score: number): string {
  if (score >= 80) {
    return "Excellent scope definition with clear requirements and high feasibility"
  } else if (score >= 60) {
    return "Good scope foundation with some areas needing clarification"
  } else if (score >= 40) {
    return "Moderate scope definition requiring additional details for accurate planning"
  } else {
    return "Scope requires significant clarification and additional requirements gathering"
  }
}

function generateQuestions(input: string, complexity: string, industry: string): string[] {
  const questions: string[] = []

  if (input.includes("migration")) {
    questions.push("What is your current infrastructure setup?")
    questions.push("Do you have any compliance requirements?")
  }

  if (input.includes("security")) {
    questions.push("Have you experienced any security incidents recently?")
    questions.push("What compliance standards do you need to meet?")
  }

  if (complexity === "High") {
    questions.push("What is your preferred timeline for this project?")
    questions.push("Do you have dedicated IT staff to support this project?")
  }

  if (industry === "Healthcare") {
    questions.push("Do you need HIPAA compliance?")
  } else if (industry === "Financial Services") {
    questions.push("Are there SOX compliance requirements?")
  }

  return questions.slice(0, 3) // Limit to 3 questions
}

export function generateAIResponse(
  userInput: string,
  serviceMatches: ServiceMatch[],
  analysis?: ProjectAnalysis,
): string {
  const projectAnalysis = analysis || analyzeProjectWithScopeReview(userInput)

  if (serviceMatches.length === 0) {
    return `I understand you're looking for IT services. Based on your description, this appears to be a ${projectAnalysis.complexity.toLowerCase()} complexity project in the ${projectAnalysis.industry} sector. Could you provide more specific details about what you're trying to achieve?`
  }

  const topMatch = serviceMatches[0]
  const matchCount = serviceMatches.length

  let response = `Great! I've analyzed your requirements and found ${matchCount} relevant service${matchCount > 1 ? "s" : ""} that could help with your project.\n\n`

  response += `Based on your description, this appears to be a **${projectAnalysis.complexity} complexity** project with an estimated timeline of **${projectAnalysis.estimatedTimeline}**.\n\n`

  if (projectAnalysis.keyRequirements.length > 0) {
    response += `Key requirements identified:\n${projectAnalysis.keyRequirements.map((req) => `• ${req}`).join("\n")}\n\n`
  }

  response += `The top recommended service is **${topMatch.service.name}** with a ${topMatch.confidence}% match confidence.`

  return response
}

export function generateInteractiveAIResponse(
  userInput: string,
  selectedServices: any[],
  allAvailableServices: any[],
  conversationHistory: string[] = [],
): AIAssistantResponse {
  const analysis = analyzeProjectWithScopeReview(userInput)
  const scopeGuidance = analyzeScopeGaps(userInput, selectedServices, allAvailableServices)

  let message = ""
  let confidence = 75

  // Assess conversation stage
  const isInitialRequest = conversationHistory.length <= 1
  const hasSelectedServices = selectedServices.length > 0

  if (isInitialRequest) {
    message = generateInitialGuidanceMessage(analysis, scopeGuidance)
    confidence = 60
  } else if (!hasSelectedServices) {
    message = generateServiceSelectionGuidance(analysis, scopeGuidance)
    confidence = 70
  } else {
    message = generateScopeRefinementGuidance(analysis, scopeGuidance, selectedServices)
    confidence = 85
  }

  const questions = generateContextualQuestions(userInput, analysis, scopeGuidance, conversationHistory)
  const missingServices = identifyMissingServices(userInput, selectedServices, allAvailableServices, analysis)
  const nextSteps = generateNextSteps(analysis, scopeGuidance, hasSelectedServices)

  return {
    message,
    questions,
    missingServices,
    scopeGaps: scopeGuidance.missingElements,
    nextSteps,
    confidence,
  }
}

function generateInitialGuidanceMessage(analysis: ProjectAnalysis, guidance: ScopeGuidance): string {
  let message = `I'm here to help you scope your IT project thoroughly. `

  message += `Based on your initial description, I can see this is a **${analysis.complexity.toLowerCase()} complexity** project `
  message += `in the **${analysis.industry}** sector with an estimated timeline of **${analysis.estimatedTimeline}**.\n\n`

  if (guidance.currentCompleteness < 60) {
    message += `To provide you with the most accurate service recommendations, I'd like to understand your requirements better. `
    message += `Your current scope definition is about ${guidance.currentCompleteness}% complete.\n\n`
  }

  if (analysis.keyRequirements.length > 0) {
    message += `I've identified these key requirements:\n`
    message += analysis.keyRequirements.map((req) => `• ${req}`).join("\n") + "\n\n"
  }

  message += `Let me ask you some questions to ensure we don't miss any important services for your project.`

  return message
}

function generateServiceSelectionGuidance(analysis: ProjectAnalysis, guidance: ScopeGuidance): string {
  let message = `Thank you for the additional details. `

  if (guidance.currentCompleteness > 70) {
    message += `Your project scope is now ${guidance.currentCompleteness}% complete, which gives me a good foundation to work with.\n\n`
  } else {
    message += `We're making progress on defining your scope (${guidance.currentCompleteness}% complete), but there are still some areas we should clarify.\n\n`
  }

  if (guidance.missingElements.length > 0) {
    message += `I notice we haven't fully addressed:\n`
    message += guidance.missingElements.map((element) => `• ${element}`).join("\n") + "\n\n"
  }

  message += `Based on your project type, I'll show you the most relevant services. Please review them carefully - `
  message += `I may suggest additional services that are commonly needed for projects like yours.`

  return message
}

function generateScopeRefinementGuidance(
  analysis: ProjectAnalysis,
  guidance: ScopeGuidance,
  selectedServices: any[],
): string {
  let message = `Excellent! You've selected ${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""} for your project. `

  message += `Let me review your selections to ensure we haven't missed anything important.\n\n`

  if (guidance.recommendedServices.length > 0) {
    const highPriorityMissing = guidance.recommendedServices.filter((s) => s.priority === "High")
    if (highPriorityMissing.length > 0) {
      message += `⚠️ **Important**: I notice you may be missing some critical services:\n`
      message +=
        highPriorityMissing.map((service) => `• **${service.serviceName}** - ${service.reason}`).join("\n") + "\n\n"
    }
  }

  if (analysis.riskAssessment.overallRisk === "High" || analysis.riskAssessment.overallRisk === "Critical") {
    message += `🔍 **Risk Assessment**: This project has **${analysis.riskAssessment.overallRisk.toLowerCase()} risk**. `
    message += `I recommend reviewing the risk factors and considering additional services for mitigation.\n\n`
  }

  message += `Would you like me to review your service descriptions for completeness and alignment with best practices?`

  return message
}

function generateContextualQuestions(
  userInput: string,
  analysis: ProjectAnalysis,
  guidance: ScopeGuidance,
  conversationHistory: string[],
): string[] {
  const questions: string[] = []
  const input = userInput.toLowerCase()

  // Priority questions based on missing elements
  if (guidance.missingElements.includes("Project timeline or deadline")) {
    questions.push("What's your target timeline or deadline for this project?")
  }

  if (guidance.missingElements.includes("Budget constraints or expectations")) {
    questions.push("Do you have a specific budget range or cost constraints I should consider?")
  }

  if (guidance.missingElements.includes("Scale or quantity specifications")) {
    questions.push("How many users, devices, or locations will this project impact?")
  }

  // Context-specific questions
  if (input.includes("migration") && !input.includes("backup")) {
    questions.push("Do you have a backup and disaster recovery plan for the migration?")
  }

  if (input.includes("security") && !input.includes("compliance")) {
    questions.push("Are there specific compliance requirements (HIPAA, SOX, PCI-DSS) you need to meet?")
  }

  if (input.includes("cloud") && !input.includes("training")) {
    questions.push("Will your team need training on the new cloud systems?")
  }

  if (analysis.complexity === "High" && !input.includes("phase")) {
    questions.push("Would you prefer to implement this project in phases or all at once?")
  }

  // Industry-specific questions
  if (analysis.industry === "Healthcare" && !input.includes("hipaa")) {
    questions.push("Do you need HIPAA compliance for patient data protection?")
  }

  if (analysis.industry === "Financial Services" && !input.includes("audit")) {
    questions.push("Are there audit trail requirements for financial transactions?")
  }

  return questions.slice(0, 3) // Limit to 3 most relevant questions
}

function identifyMissingServices(
  userInput: string,
  selectedServices: any[],
  allAvailableServices: any[],
  analysis: ProjectAnalysis,
): ServiceSuggestion[] {
  const suggestions: ServiceSuggestion[] = []
  const input = userInput.toLowerCase()
  const selectedServiceNames = selectedServices.map((s) => s.name?.toLowerCase() || "")

  // Common service gaps based on project type
  if (input.includes("migration") || input.includes("upgrade")) {
    if (!selectedServiceNames.some((name) => name.includes("backup") || name.includes("disaster"))) {
      suggestions.push({
        serviceName: "Backup & Disaster Recovery",
        reason: "Critical for data protection during migration",
        priority: "High",
        category: "Data Protection",
      })
    }

    if (!selectedServiceNames.some((name) => name.includes("training") || name.includes("support"))) {
      suggestions.push({
        serviceName: "User Training & Support",
        reason: "Users will need training on new systems",
        priority: "Medium",
        category: "Change Management",
      })
    }
  }

  if (input.includes("security") || input.includes("firewall")) {
    if (!selectedServiceNames.some((name) => name.includes("monitoring") || name.includes("siem"))) {
      suggestions.push({
        serviceName: "Security Monitoring",
        reason: "Continuous monitoring is essential for security",
        priority: "High",
        category: "Security",
      })
    }
  }

  if (input.includes("cloud") || input.includes("aws") || input.includes("azure")) {
    if (!selectedServiceNames.some((name) => name.includes("optimization") || name.includes("cost"))) {
      suggestions.push({
        serviceName: "Cloud Cost Optimization",
        reason: "Prevent unexpected cloud costs",
        priority: "Medium",
        category: "Cloud Management",
      })
    }
  }

  // Industry-specific suggestions
  if (analysis.industry === "Healthcare") {
    if (!selectedServiceNames.some((name) => name.includes("compliance") || name.includes("hipaa"))) {
      suggestions.push({
        serviceName: "HIPAA Compliance Assessment",
        reason: "Required for healthcare data protection",
        priority: "High",
        category: "Compliance",
      })
    }
  }

  if (analysis.industry === "Financial Services") {
    if (!selectedServiceNames.some((name) => name.includes("audit") || name.includes("sox"))) {
      suggestions.push({
        serviceName: "Financial Audit & Compliance",
        reason: "Required for financial regulatory compliance",
        priority: "High",
        category: "Compliance",
      })
    }
  }

  return suggestions.slice(0, 4) // Limit to top 4 suggestions
}

function analyzeScopeGaps(userInput: string, selectedServices: any[], allAvailableServices: any[]): ScopeGuidance {
  const analysis = analyzeProjectWithScopeReview(userInput)
  const missingServices = identifyMissingServices(userInput, selectedServices, allAvailableServices, analysis)

  let completeness = analysis.scopeReview.overallScore

  // Adjust completeness based on service selection
  if (selectedServices.length > 0) {
    completeness += 20
  }

  if (missingServices.filter((s) => s.priority === "High").length === 0) {
    completeness += 10
  }

  completeness = Math.min(completeness, 100)

  return {
    currentCompleteness: completeness,
    missingElements: analysis.scopeReview.missingElements,
    clarificationNeeded: analysis.scopeReview.scopeGaps,
    suggestedQuestions: analysis.suggestedQuestions,
    recommendedServices: missingServices,
  }
}

function generateNextSteps(analysis: ProjectAnalysis, guidance: ScopeGuidance, hasSelectedServices: boolean): string[] {
  const steps: string[] = []

  if (!hasSelectedServices) {
    steps.push("Review and select the most relevant services for your project")
    steps.push("Consider the suggested additional services based on your project type")
  } else {
    steps.push("Review the suggested missing services to ensure complete coverage")
    steps.push("Generate your Work Breakdown Structure (WBS) to see detailed project tasks")
  }

  if (guidance.currentCompleteness < 80) {
    steps.push("Provide additional project details to improve scope accuracy")
  }

  if (analysis.riskAssessment.overallRisk === "High" || analysis.riskAssessment.overallRisk === "Critical") {
    steps.push("Review risk assessment and consider mitigation strategies")
  }

  steps.push("Proceed to generate pricing estimates and project timeline")

  return steps.slice(0, 4) // Limit to 4 next steps
}
