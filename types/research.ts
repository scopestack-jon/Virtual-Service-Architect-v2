// Research data types
export interface ResearchSource {
  title: string
  url: string
  summary: string
  credibility: "high" | "medium" | "low"
  relevance: number
  sourceType: "documentation" | "guide" | "case_study" | "vendor" | "community" | "blog" | "news" | "other"
}

export interface ResearchData {
  sources: ResearchSource[]
  researchSummary: string
  keyInsights: string[]
  confidence: number
}
