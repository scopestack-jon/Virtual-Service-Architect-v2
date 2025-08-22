export interface ClarifyingQuestion {
  question: string
  category: "scope" | "timeline" | "budget" | "technical" | "environment" | "compliance"
  priority: "high" | "medium" | "low"
}

export interface QuestioningResult {
  needsQuestioning: boolean
  reasoning: string
  questions: ClarifyingQuestion[]
  confidence: number
}

export function generateClarifyingQuestions(userInput: string, projectContext: any = {}): QuestioningResult {
  const input = userInput.toLowerCase()
  const questions: ClarifyingQuestion[] = []

  const hasSpecificTechnology =
    /\b(server|database|firewall|router|switch|cloud|aws|azure|office 365|active directory|exchange|sharepoint|vmware|hyper-v|backup|security|network|migration|virtualization)\b/i.test(
      input,
    )
  const hasQuantifiers = /\b(\d+|few|several|many|multiple|small|medium|large|enterprise|startup|users?|devices?|locations?|servers?|workstations?)\b/i.test(input)
  const hasTimeline = /\b(urgent|asap|month|week|quarter|deadline|soon|quickly|immediate|phase|timeline|schedule)\b/i.test(input)
  const hasBudget = /\b(budget|cost|price|expensive|cheap|affordable|funding|investment|dollars?|k|thousand|million)\b/i.test(input)
  const hasEnvironment = /\b(office|remote|hybrid|onsite|cloud|datacenter|branch|headquarters|workplace|location)\b/i.test(input)
  const hasCompliance = /\b(hipaa|sox|pci|gdpr|compliance|regulation|audit|security policy|certification)\b/i.test(input)
  const hasIntegration = /\b(integrate|connect|sync|migrate|existing|current|legacy|upgrade|replace|modernize)\b/i.test(input)
  const hasSupport = /\b(support|training|maintenance|managed|help desk|documentation|user adoption)\b/i.test(input)

  const wordCount = input.split(" ").length
  const hasActionWords = /\b(install|setup|configure|implement|deploy|upgrade|migrate|replace|assess|audit|review|plan|design|build|create)\b/i.test(input)
  
  // More intelligent vagueness detection - only consider truly vague inputs
  const isVague = 
    wordCount < 5 || // Very short inputs
    (!hasSpecificTechnology && !hasActionWords && wordCount < 8) || // No tech details AND short
    (input.includes("help me") && wordCount < 10) || // Generic help requests
    (input.includes("what do you think") && wordCount < 10) || // Opinion requests
    (input.includes("i need") && wordCount < 8 && !hasSpecificTechnology) // Vague needs

  const projectType = detectProjectType(input)

  // Only ask questions if we're missing critical information
  const needsMoreInfo = isVague || 
    (!hasSpecificTechnology && !hasQuantifiers) || // Missing both tech and scale
    (projectType === "cloud" && !hasEnvironment) || // Cloud projects need environment info
    (projectType === "security" && !hasCompliance) // Security projects need compliance info

  // If we have enough information, don't ask questions
  if (!needsMoreInfo) {
    return {
      needsQuestioning: false,
      reasoning: "Sufficient information provided",
      questions: [],
      confidence: 0.9
    }
  }

  // Core scope questions - only when truly needed
  if (isVague) {
    if (input.includes("network") || input.includes("infrastructure")) {
      questions.push({
        question: "What specific network components are you working with? (switches, routers, firewalls, wireless, etc.)",
        category: "technical",
        priority: "high",
      })
    } else if (input.includes("cloud") || input.includes("migration")) {
      questions.push({
        question: "What's your current infrastructure setup and which cloud provider are you considering? (AWS, Azure, Google Cloud)",
        category: "technical",
        priority: "high",
      })
    } else if (input.includes("security")) {
      questions.push({
        question: "What specific security concerns are you addressing? (firewall, antivirus, compliance, access control, etc.)",
        category: "technical",
        priority: "high",
      })
    } else {
      questions.push({
        question: "What specific technology or system are you looking to work with? (servers, networking, cloud services, security, etc.)",
        category: "technical",
        priority: "high",
      })
    }
  }

  // Only ask quantifier questions if we don't have any scale information
  if (!hasQuantifiers && !isVague) {
    if (input.includes("office") || input.includes("company") || input.includes("business")) {
      questions.push({
        question: "How many users, devices, or workstations will this project impact?",
        category: "scope",
        priority: "medium",
      })
    } else if (input.includes("network") || input.includes("infrastructure")) {
      questions.push({
        question: "What's the scale of your network? (number of locations, servers, network devices)",
        category: "scope",
        priority: "medium",
      })
    } else {
      questions.push({
        question: "What's the scale of this project? (number of users, devices, locations, or company size)",
        category: "scope",
        priority: "medium",
      })
    }
  }

  // Only ask environment questions if we don't have any environment context
  if (!hasEnvironment && !isVague) {
    if (input.includes("remote") || input.includes("work from home")) {
      questions.push({
        question: "Is this for a remote workforce, hybrid setup, or traditional office environment?",
        category: "environment",
        priority: "medium",
      })
    } else if (input.includes("multiple") || input.includes("branch")) {
      questions.push({
        question: "How many locations or offices does this project need to cover?",
        category: "environment",
        priority: "medium",
      })
    } else {
      questions.push({
        question: "What type of environment is this for? (office building, remote workforce, multiple locations, cloud-only)",
        category: "environment",
        priority: "medium",
      })
    }
  }

  // Project-specific questions
  if (projectType === "infrastructure") {
    if (!hasIntegration) {
      questions.push({
        question: "Do you have existing systems that need to integrate with this new infrastructure?",
        category: "technical",
        priority: "high",
      })
    }
    if (!input.includes("redundancy") && !input.includes("backup")) {
      questions.push({
        question: "Do you need high availability, redundancy, or disaster recovery capabilities?",
        category: "technical",
        priority: "medium",
      })
    }
  }

  if (projectType === "security") {
    if (!hasCompliance) {
      questions.push({
        question: "Are there specific compliance requirements you need to meet? (HIPAA, SOX, PCI-DSS, GDPR)",
        category: "compliance",
        priority: "medium",
      })
    }
    if (!input.includes("monitoring") && !input.includes("alert")) {
      questions.push({
        question: "Do you need ongoing security monitoring and alerting capabilities?",
        category: "technical",
        priority: "medium",
      })
    }
  }

  if (projectType === "cloud") {
    if (!input.includes("provider")) {
      questions.push({
        question: "Do you have a preferred cloud provider? (AWS, Azure, Google Cloud, or open to recommendations)",
        category: "technical",
        priority: "medium",
      })
    }
    if (!hasSupport) {
      questions.push({
        question: "Will your team need training and ongoing support for cloud management?",
        category: "scope",
        priority: "medium",
      })
    }
  }

  if (projectType === "migration") {
    if (!input.includes("backup")) {
      questions.push({
        question: "Do you have a backup and disaster recovery plan for the migration process?",
        category: "technical",
        priority: "high",
      })
    }
    if (!input.includes("downtime")) {
      questions.push({
        question: "What's your tolerance for downtime during the migration?",
        category: "timeline",
        priority: "medium",
      })
    }
  }

  // Timeline and budget questions
  if (!hasTimeline) {
    if (input.includes("urgent") || input.includes("asap")) {
      questions.push({
        question: "How urgent is this project? Do you have a specific deadline or can we plan it properly?",
        category: "timeline",
        priority: "high",
      })
    } else {
      questions.push({
        question: "What's your target timeline? (urgent/ASAP, within 1-3 months, flexible, or phased approach)",
        category: "timeline",
        priority: "medium",
      })
    }
  }

  if (!hasBudget && (hasQuantifiers || input.includes("enterprise") || input.includes("business"))) {
    questions.push({
      question: "Do you have budget constraints or a target investment range I should consider?",
      category: "budget",
      priority: "low",
    })
  }

  // Industry-specific questions
  if (
    input.includes("medical") ||
    input.includes("healthcare") ||
    input.includes("patient") ||
    input.includes("clinic") ||
    input.includes("hospital")
  ) {
    if (!hasCompliance) {
      questions.push({
        question: "Do you need HIPAA compliance for patient data protection and privacy?",
        category: "compliance",
        priority: "high",
      })
    }
    if (!input.includes("ehr") && !input.includes("patient management")) {
      questions.push({
        question: "Will this system handle electronic health records (EHR) or patient management systems?",
        category: "technical",
        priority: "medium",
      })
    }
  }

  if (
    input.includes("financial") ||
    input.includes("banking") ||
    input.includes("payment") ||
    input.includes("accounting") ||
    input.includes("credit card")
  ) {
    if (!hasCompliance) {
      questions.push({
        question: "Are there specific financial compliance requirements? (SOX, PCI-DSS for payments, banking regulations)",
        category: "compliance",
        priority: "high",
      })
    }
    if (!input.includes("audit") && !input.includes("logging")) {
      questions.push({
        question: "Do you need comprehensive audit trails and logging for financial transactions?",
        category: "technical",
        priority: "medium",
      })
    }
  }

  if (
    input.includes("education") ||
    input.includes("school") ||
    input.includes("university") ||
    input.includes("student") ||
    input.includes("classroom")
  ) {
    questions.push({
      question: "Is this for K-12, higher education, or corporate training? Each has different requirements.",
      category: "scope",
      priority: "medium",
    })
    if (!input.includes("remote") && !input.includes("online")) {
      questions.push({
        question: "Will this need to support remote learning or hybrid classroom environments?",
        category: "environment",
        priority: "medium",
      })
    }
  }

  const highPriorityCount = questions.filter((q) => q.priority === "high").length
  const totalInformationGaps = questions.length

  // Need questioning if:
  // 1. Input is vague, OR
  // 2. We have 2+ high priority gaps, OR
  // 3. We have 4+ total information gaps, OR
  // 4. This is clearly a complex project but lacks detail
  const needsQuestioning =
    isVague || highPriorityCount >= 2 || totalInformationGaps >= 4 || (projectType !== "simple" && wordCount < 15)

  let reasoning = ""
  if (needsQuestioning) {
    if (isVague) {
      reasoning =
        "I'd like to better understand your project to provide more targeted recommendations. A few quick questions will help me suggest the most relevant services:"
    } else if (highPriorityCount >= 2) {
      reasoning =
        "To give you the most accurate service recommendations, I need to understand a few key details about your project:"
    } else {
      reasoning =
        "I can see this is a comprehensive project. Let me ask a few questions to ensure I recommend the right services:"
    }
  }

  let confidence = 30
  if (hasSpecificTechnology) confidence += 25
  if (hasQuantifiers) confidence += 20
  if (hasEnvironment) confidence += 15
  if (hasTimeline) confidence += 10
  if (hasActionWords) confidence += 10
  if (projectType !== "simple") confidence += 5
  if (wordCount > 20) confidence += 10
  if (hasIntegration) confidence += 5

  // Prioritize and limit questions
  const prioritizedQuestions = prioritizeQuestions(questions)
  const limitedQuestions = prioritizedQuestions.slice(0, 3) // Reduced to 3 for better UX

  return {
    needsQuestioning,
    reasoning,
    questions: limitedQuestions,
    confidence: Math.min(confidence, 95), // Cap at 95%
  }
}

function detectProjectType(input: string): "infrastructure" | "security" | "cloud" | "migration" | "simple" {
  if (/\b(server|network|infrastructure|hardware|datacenter|virtualization|vmware|hyper-v)\b/i.test(input)) {
    return "infrastructure"
  }
  if (/\b(security|firewall|antivirus|breach|protect|secure|audit|compliance|hipaa|sox|pci)\b/i.test(input)) {
    return "security"
  }
  if (/\b(cloud|aws|azure|gcp|saas|migrate|modernize|office 365|sharepoint|teams)\b/i.test(input)) {
    return "cloud"
  }
  if (/\b(migrate|upgrade|replace|legacy|modernize|transition|move|convert)\b/i.test(input)) {
    return "migration"
  }
  return "simple"
}

// Helper function to prioritize questions
export function prioritizeQuestions(questions: ClarifyingQuestion[]): ClarifyingQuestion[] {
  return questions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// Helper function to format questions for display
export function formatQuestionsForChat(questions: ClarifyingQuestion[]): string {
  return questions.map((q, index) => `${index + 1}. ${q.question}`).join("\n")
}
