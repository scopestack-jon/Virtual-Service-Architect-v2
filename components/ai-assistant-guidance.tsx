"use client"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { AlertTriangle, CheckCircle, HelpCircle, Lightbulb } from "lucide-react"
import type { AIAssistantResponse } from "../utils/aiAnalysis"

interface AIAssistantGuidanceProps {
  guidance: AIAssistantResponse
  onQuestionClick?: (question: string) => void
  onServiceSuggestionClick?: (serviceName: string) => void
}

export function AIAssistantGuidance({ guidance, onQuestionClick, onServiceSuggestionClick }: AIAssistantGuidanceProps) {
  return (
    <div className="space-y-4">
      {/* Main AI Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            AI Scope Assistant
            <Badge variant="secondary" className="ml-auto">
              {guidance.confidence}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {guidance.message.split("\n").map(
              (paragraph, index) =>
                paragraph.trim() && (
                  <p key={index} className="mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clarifying Questions */}
      {guidance.questions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4 text-orange-500" />
              Questions to Improve Your Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {guidance.questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => onQuestionClick?.(question)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">{question}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Services Suggestions */}
      {guidance.missingServices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Suggested Additional Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {guidance.missingServices.map((service, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{service.serviceName}</span>
                        <Badge
                          variant={
                            service.priority === "High"
                              ? "destructive"
                              : service.priority === "Medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {service.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{service.reason}</p>
                      <Badge variant="outline" className="text-xs">
                        {service.category}
                      </Badge>
                    </div>
                    <button
                      onClick={() => onServiceSuggestionClick?.(service.serviceName)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {guidance.nextSteps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {guidance.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
