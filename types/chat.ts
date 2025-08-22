export interface ChatMessage {
  id: string
  type: "user" | "ai" | "system"
  content: string
  timestamp: Date
  serviceMatches?: ServiceMatch[]
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  projectContext: {
    description?: string
    industry?: string
    complexity?: string
    timeline?: string
    needsMoreInfo?: boolean
    pendingQuestions?: any[]
    hasAskedQuestions?: boolean
    additionalInfo?: string
  }
}

import type { ServiceMatch } from "../data/services"
