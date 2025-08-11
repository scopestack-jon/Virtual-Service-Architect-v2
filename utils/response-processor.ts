// Response processing utilities
export function cleanAIResponse(response: string): string {
  // Remove markdown code blocks
  let cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "")

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim()

  // Find JSON content between first { and last }
  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  }

  return cleaned
}
