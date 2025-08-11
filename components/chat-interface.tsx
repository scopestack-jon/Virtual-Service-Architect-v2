"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Loader2, MessageSquare, Clock, Target, FileText, X } from "lucide-react"
import type { ChatMessage, ChatSession } from "../types/chat"
import { ChatMessageComponent } from "./chat-message"
import { matchServices } from "../data/services"
import { analyzeProject } from "../utils/aiAnalysis"
import { WBSDisplay } from "./wbs-display"
import { generateWBS } from "../utils/wbsGenerator"
import type { WorkBreakdownStructure } from "../types/wbs"
import { CollapsibleApiStatus } from "./collapsible-api-status"
import { ProjectDetailsTab } from "./project-details-tab"
import { PricingTab } from "./pricing-tab"
import { DocumentsTab } from "./documents-tab"
import type { ServiceMatch } from "../data/services"
import { generateClarifyingQuestions } from "../utils/questionGenerator"

export function ChatInterface() {
  const [session, setSession] = useState<ChatSession>({
    id: "session-1",
    messages: [
      {
        id: "welcome",
        type: "system",
        content:
          "Welcome to ScopeStack! I'm here to help you scope your IT project. Please describe what you're looking to accomplish.",
        timestamp: new Date(),
      },
    ],
    projectContext: {},
  })

  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentTab, setCurrentTab] = useState<"project-details" | "wbs" | "pricing" | "documents">("project-details")
  const [generatedWBS, setGeneratedWBS] = useState<WorkBreakdownStructure | null>(null)
  const [apiStatus, setApiStatus] = useState<"connected" | "fallback" | "checking">("checking")
  const [selectedServices, setSelectedServices] = useState<ServiceMatch[]>([])
  const [hasGeneratedWBS, setHasGeneratedWBS] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [session.messages])

  const handleServiceSelect = (serviceId: string, serviceMatches: ServiceMatch[]) => {
    const service = serviceMatches.find((match) => match.service.id === serviceId)
    if (!service) return

    console.log(`🔍 Selecting service: "${service.service.name}"`)
    console.log(`   - Service ID: ${service.service.id}`)
    console.log(`   - Has subservices: ${service.service.subservices ? "Yes" : "No"}`)
    if (service.service.subservices) {
      console.log(`   - Subservice count: ${service.service.subservices.length}`)
      service.service.subservices.forEach((sub, index) => {
        console.log(`     ${index + 1}. "${sub.name}" (ID: ${sub.id})`)
      })
    }

    setSelectedServices((prev) => {
      const isAlreadySelected = prev.some((s) => s.service.id === serviceId)
      if (isAlreadySelected) {
        return prev.filter((s) => s.service.id !== serviceId)
      } else {
        return [...prev, service]
      }
    })
  }

  const generateWBSFromSelected = () => {
    if (selectedServices.length === 0) return

    console.log(`🏗️ Generating WBS from ${selectedServices.length} selected services:`)
    selectedServices.forEach((match, index) => {
      console.log(`   ${index + 1}. "${match.service.name}"`)
      console.log(`      - Has subservices: ${match.service.subservices ? "Yes" : "No"}`)
      if (match.service.subservices) {
        console.log(`      - Subservice count: ${match.service.subservices.length}`)
        match.service.subservices.forEach((sub, subIndex) => {
          console.log(`        ${subIndex + 1}. "${sub.name}"`)
        })
      }
    })

    const wbs = generateWBS(selectedServices, "Custom IT Services Project")
    setGeneratedWBS(wbs)
    setCurrentTab("wbs")
    setHasGeneratedWBS(true)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const isFirstUserMessage = session.messages.filter((m) => m.type === "user").length === 0

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }))

    const currentInput = inputValue
    setInputValue("")
    setIsLoading(true)

    try {
      console.log(`🚀 Starting analysis for: "${currentInput}"`)
      console.log(`📊 Current API status: ${apiStatus}`)
      console.log(`🔍 Is first user message: ${isFirstUserMessage}`)

      const allUserMessages = session.messages
        .filter((m) => m.type === "user")
        .map((m) => m.content)
        .join(" ")
      const fullContext = `${allUserMessages} ${currentInput}`.trim()

      // Check if we need to ask clarifying questions
      const questioning = generateClarifyingQuestions(fullContext, session.projectContext)

      console.log(`❓ Questioning result:`, questioning)

      if (questioning.needsQuestioning && !session.projectContext.hasAskedQuestions) {
        let contextualResponse = ""

        // Acknowledge what the user said and respond naturally
        if (currentInput.toLowerCase().includes("help") && currentInput.toLowerCase().includes("scope")) {
          contextualResponse =
            "I'd be happy to help you scope your project. To give you the most relevant recommendations, I need to understand a bit more about what you're working on."
        } else if (currentInput.toLowerCase().includes("project")) {
          contextualResponse =
            "Great! I can help you scope that project. Let me ask a few questions to better understand your requirements."
        } else {
          contextualResponse = "I'd like to better understand your project to provide more targeted recommendations."
        }

        // Add the most relevant questions (limit to 2-3 for better UX)
        const topQuestions = questioning.questions.slice(0, 3)
        const questionText = topQuestions.map((q) => `• ${q.question}`).join("\n")

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: `${contextualResponse}\n\n${questionText}\n\nOnce I have these details, I can suggest the most relevant services for your project.`,
          timestamp: new Date(),
        }

        setSession((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          projectContext: {
            ...prev.projectContext,
            description: fullContext,
            needsMoreInfo: true,
            pendingQuestions: questioning.questions,
            hasAskedQuestions: true,
          },
        }))

        setIsLoading(false)
        return
      }

      if (session.projectContext.needsMoreInfo && session.projectContext.pendingQuestions) {
        const updatedContext = {
          ...session.projectContext,
          additionalInfo: currentInput,
          description: `${session.projectContext.description} ${currentInput}`,
        }

        const followUpQuestioning = generateClarifyingQuestions(updatedContext.description, updatedContext)

        if (followUpQuestioning.needsQuestioning && followUpQuestioning.questions.length > 0) {
          // Limit follow-up questions to avoid overwhelming the user
          const followUpQuestions = followUpQuestioning.questions.slice(0, 2)
          const followUpText = followUpQuestions.map((q) => `• ${q.question}`).join("\n")

          const followUpMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            type: "ai",
            content: `Thanks for that information! Just a couple more quick questions to ensure I recommend the right services:\n\n${followUpText}`,
            timestamp: new Date(),
          }

          setSession((prev) => ({
            ...prev,
            messages: [...prev.messages, followUpMessage],
            projectContext: {
              ...updatedContext,
              pendingQuestions: followUpQuestions,
            },
          }))

          setIsLoading(false)
          return
        } else {
          const transitionMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            type: "ai",
            content: "Perfect! I have enough information now. Let me find the best services for your project...",
            timestamp: new Date(),
          }

          setSession((prev) => ({
            ...prev,
            messages: [...prev.messages, transitionMessage],
            projectContext: {
              ...updatedContext,
              needsMoreInfo: false,
              pendingQuestions: undefined,
            },
          }))

          // Brief delay before showing service matches for better UX
          setTimeout(() => {
            setIsLoading(true)
            // Continue with service matching logic below
          }, 1000)
        }
      }

      // Proceed with service matching (either after questions answered or if no questions needed)
      const [serviceMatches, analysis] = await Promise.all([
        matchServices(fullContext || currentInput),
        analyzeProject(fullContext || currentInput),
      ])

      const usingApi =
        serviceMatches.length > 0 &&
        !serviceMatches.some((match) =>
          ["network-assessment", "cloud-migration", "security-audit"].includes(match.service.id),
        )

      setApiStatus(usingApi ? "connected" : "fallback")

      console.log(`📈 Analysis complete:`)
      console.log(`   - Service matches: ${serviceMatches.length}`)
      console.log(`   - Data source: ${usingApi ? "ScopeStack API" : "Local fallback"}`)
      console.log(`   - Complexity: ${analysis.complexity}`)
      console.log(`   - Industry: ${analysis.industry}`)

      let aiResponseContent = ""

      if (serviceMatches.length > 0) {
        if (
          serviceMatches.filter((m) => m.service.source === "scopestack").length > 0 &&
          serviceMatches.filter((m) => m.service.source === "local").length > 0
        ) {
          aiResponseContent = `Based on your requirements, I found ${serviceMatches.filter((m) => m.service.source === "scopestack").length} ScopeStack services and ${serviceMatches.filter((m) => m.service.source === "local").length} additional services for your ${analysis.industry.toLowerCase()} project. Select the services you want to include:`
        } else if (serviceMatches.filter((m) => m.service.source === "scopestack").length > 0) {
          aiResponseContent = `Perfect! I found ${serviceMatches.filter((m) => m.service.source === "scopestack").length} ScopeStack services that match your ${analysis.industry.toLowerCase()} project requirements. Select which services to include:`
        } else if (serviceMatches.filter((m) => m.service.source === "local").length > 0) {
          aiResponseContent = `I found ${serviceMatches.filter((m) => m.service.source === "local").length} services for your ${analysis.industry.toLowerCase()} project. Select which services to include:`
        }
      } else {
        aiResponseContent = `I analyzed your ${analysis.industry.toLowerCase()} project but couldn't find matching services. Could you provide more specific details about your technical requirements?`
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: aiResponseContent,
        timestamp: new Date(),
        serviceMatches: serviceMatches.length > 0 ? serviceMatches : undefined,
      }

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        projectContext: {
          ...prev.projectContext,
          description: isFirstUserMessage ? currentInput : `${prev.projectContext.description} ${currentInput}`,
          complexity: analysis.complexity,
          industry: analysis.industry,
          needsMoreInfo: false,
        },
      }))
    } catch (error) {
      console.error("❌ Error processing message:", error)
      setApiStatus("fallback")

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "system",
        content: "I'm experiencing some technical difficulties. Please try again or rephrase your request.",
        timestamp: new Date(),
      }

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case "project-details":
        return <ProjectDetailsTab />
      case "wbs":
        return generatedWBS ? (
          <WBSDisplay wbs={generatedWBS} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No WBS Generated Yet</h3>
              <p className="text-gray-600">Select services from chat to generate a work breakdown structure</p>
            </div>
          </div>
        )
      case "pricing":
        return <PricingTab />
      case "documents":
        return <DocumentsTab />
      default:
        return <ProjectDetailsTab />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">ScopeStack Chat</h1>
              <p className="text-sm text-gray-600">AI-powered project scoping assistant</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="relative">
                <CollapsibleApiStatus apiStatus={apiStatus} />
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{session.messages.filter((m) => m.type !== "system").length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Active</span>
              </div>
            </div>
          </div>

          {selectedServices.length > 0 && !hasGeneratedWBS && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Selected Services
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {selectedServices.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedServices.map((match) => (
                  <div key={match.service.id} className="flex items-center justify-between text-xs">
                    <span className="break-words flex-1">{match.service.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleServiceSelect(match.service.id, selectedServices)}
                      className="h-5 w-5 p-0 ml-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {session.messages.map((message) => (
            <ChatMessageComponent
              key={message.id}
              message={message}
              selectedServices={selectedServices}
              onServiceSelect={handleServiceSelect}
              hasGeneratedWBS={hasGeneratedWBS}
            />
          ))}

          {isLoading && (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-3 bg-gray-100 rounded-lg rounded-bl-sm">
                  <p className="text-gray-600">Analyzing your requirements and finding matching services...</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 p-4">
          {selectedServices.length > 0 && !hasGeneratedWBS && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} selected
                  </span>
                </div>
                <Button
                  onClick={generateWBSFromSelected}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                >
                  Add to WBS
                </Button>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Ready to generate your project WBS with the selected services
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your IT project requirements..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="icon">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>

      <div className="w-1/2 bg-white flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-4">Project Workspace</h1>

          <div className="flex space-x-1">
            <Button
              variant={currentTab === "project-details" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentTab("project-details")}
              className="px-4"
            >
              Project Details
            </Button>
            <Button
              variant={currentTab === "wbs" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentTab("wbs")}
              className="px-4"
            >
              WBS
              {generatedWBS && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {generatedWBS.phases.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={currentTab === "pricing" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentTab("pricing")}
              className="px-4"
            >
              Pricing
            </Button>
            <Button
              variant={currentTab === "documents" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentTab("documents")}
              className="px-4"
            >
              Documents
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{renderTabContent()}</div>
      </div>
    </div>
  )
}
