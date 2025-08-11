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
    /\b(server|database|firewall|router|switch|cloud|aws|azure|office 365|active directory|exchange|sharepoint)\b/i.test(
      input,
    )
  const hasQuantifiers = /\b(\d+|few|several|many|multiple|small|medium|large|enterprise|startup)\b/i.test(input)
  const hasTimeline = /\b(urgent|asap|month|week|quarter|deadline|soon|quickly|immediate|phase)\b/i.test(input)
  const hasBudget = /\b(budget|cost|price|expensive|cheap|affordable|funding|investment)\b/i.test(input)
  const hasEnvironment = /\b(office|remote|hybrid|onsite|cloud|datacenter|branch|headquarters)\b/i.test(input)
  const hasCompliance = /\b(hipaa|sox|pci|gdpr|compliance|regulation|audit|security policy)\b/i.test(input)
  const hasIntegration = /\b(integrate|connect|sync|migrate|existing|current|legacy)\b/i.test(input)
  const hasSupport = /\b(support|training|maintenance|managed|help desk)\b/i.test(input)

  const wordCount = input.split(" ").length
  const hasActionWords = /\b(install|setup|configure|implement|deploy|upgrade|migrate|replace)\b/i.test(input)
  const isVague =
    wordCount < 10 ||
    (!hasSpecificTechnology && !hasActionWords) ||
    input.includes("help me") ||
    input.includes("what do you think")

  const projectType = detectProjectType(input)

  // Core scope questions
  if (!hasSpecificTechnology || isVague) {
    questions.push({
      question:
        "What specific technology or system are you looking to work with? (servers, networking, cloud services, etc.)",
      category: "technical",
      priority: "high",
    })
  }

  if (!hasQuantifiers) {
    questions.push({
      question: "What's the scale of this project? (number of users, devices, locations, or company size)",
      category: "scope",
      priority: "high",
    })
  }

  if (!hasEnvironment) {
    questions.push({
      question:
        "What type of environment is this for? (office building, remote workforce, multiple locations, cloud-only)",
      category: "environment",
      priority: "high",
    })
  }

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
    questions.push({
      question:
        "What specific security concerns are you trying to address? (data breaches, compliance, access control, network threats)",
      category: "technical",
      priority: "high",
    })
    if (!hasCompliance) {
      questions.push({
        question: "Are there specific compliance requirements you need to meet? (HIPAA, SOX, PCI-DSS, GDPR)",
        category: "compliance",
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

  // Timeline and budget questions
  if (!hasTimeline) {
    questions.push({
      question: "What's your target timeline? (urgent/ASAP, within 1-3 months, flexible, or phased approach)",
      category: "timeline",
      priority: "medium",
    })
  }

  if (!hasBudget && (hasQuantifiers || input.includes("enterprise"))) {
    questions.push({
      question: "Do you have budget constraints or a target investment range I should consider?",
      category: "budget",
      priority: "low",
    })
  }

  if (
    input.includes("medical") ||
    input.includes("healthcare") ||
    input.includes("patient") ||
    input.includes("clinic")
  ) {
    if (!hasCompliance) {
      questions.push({
        question: "Do you need HIPAA compliance for patient data protection and privacy?",
        category: "compliance",
        priority: "high",
      })
    }
    questions.push({
      question: "Will this system handle electronic health records (EHR) or patient management systems?",
      category: "technical",
      priority: "medium",
    })
  }

  if (
    input.includes("financial") ||
    input.includes("banking") ||
    input.includes("payment") ||
    input.includes("accounting")
  ) {
    if (!hasCompliance) {
      questions.push({
        question:
          "Are there specific financial compliance requirements? (SOX, PCI-DSS for payments, banking regulations)",
        category: "compliance",
        priority: "high",
      })
    }
  }

  if (
    input.includes("education") ||
    input.includes("school") ||
    input.includes("university") ||
    input.includes("student")
  ) {
    questions.push({
      question: "Is this for K-12, higher education, or corporate training? Each has different requirements.",
      category: "scope",
      priority: "medium",
    })
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
  if (/\b(server|network|infrastructure|hardware|datacenter)\b/i.test(input)) {
    return "infrastructure"
  }
  if (/\b(security|firewall|antivirus|breach|protect|secure)\b/i.test(input)) {
    return "security"
  }
  if (/\b(cloud|aws|azure|saas|migrate|modernize)\b/i.test(input)) {
    return "cloud"
  }
  if (/\b(migrate|upgrade|replace|legacy|modernize)\b/i.test(input)) {
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
