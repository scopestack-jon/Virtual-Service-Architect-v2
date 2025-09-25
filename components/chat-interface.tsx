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
import { analyzeProject, generateAIResponse } from "../utils/aiAnalysis"
import { WBSDisplay } from "./wbs-display"
import { generateWBS } from "../utils/wbsGenerator"
import type { WorkBreakdownStructure } from "../types/wbs"
import { CollapsibleApiStatus } from "./collapsible-api-status"
import { ProjectDetailsTab } from "./project-details-tab"
import { PricingTab } from "./pricing-tab"
import { DocumentsTab } from "./documents-tab"
import type { ServiceMatch } from "../data/services"
import { generateClarifyingQuestions } from "../utils/questionGenerator"
import { config } from "../lib/config"
import { CallRecordingConnector } from "./call-recording-connector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone } from "lucide-react"

// AI-powered service matching function
function findBestServiceMatches(userInput: string, availableServices: any[], analysis: any) {
  const input = userInput.toLowerCase()
  const matches: Array<{
    service: any
    confidence: number
    matchedKeywords: string[]
  }> = []

  // Score each service based on relevance
  availableServices.forEach(service => {
    let score = 0
    const matchedKeywords: string[] = []
    
    // Extract service properties from the API response structure
    const serviceName = service.attributes?.name || service.name || ""
    const serviceDescription = service.attributes?.["service-description"] || service.description || ""
    const serviceType = service.attributes?.["service-type"] || service.category || ""
    const tagList = service.attributes?.["tag-list"] || service.keywords || []
    
    // Check service name relevance
    if (serviceName && input.includes(serviceName.toLowerCase())) {
      score += 40
      matchedKeywords.push(serviceName)
    }
    
    // Check service type relevance
    if (serviceType && input.includes(serviceType.toLowerCase())) {
      score += 30
      matchedKeywords.push(serviceType)
    }
    
    // Check description relevance
    if (serviceDescription) {
      const desc = serviceDescription.toLowerCase()
      const descWords = desc.split(' ')
      const inputWords = input.split(' ')
      
      const commonWords = inputWords.filter(word => 
        word.length > 3 && descWords.includes(word)
      )
      
      if (commonWords.length > 0) {
        score += commonWords.length * 10
        matchedKeywords.push(...commonWords)
      }
    }
    
    // Check tag list relevance
    if (tagList && Array.isArray(tagList)) {
      tagList.forEach((tag: string) => {
        if (input.includes(tag.toLowerCase())) {
          score += 15
          matchedKeywords.push(tag)
        }
      })
    }
    
    // Check for specific technology keywords in the input
    const techKeywords = ['network', 'wireless', 'office 365', 'microsoft', 'cloud', 'security', 'backup', 'migration']
    techKeywords.forEach(keyword => {
      if (input.includes(keyword) && (serviceName.toLowerCase().includes(keyword) || serviceDescription.toLowerCase().includes(keyword))) {
        score += 25
        matchedKeywords.push(keyword)
      }
    })
    
    // Bonus for complexity match (if available)
    if (analysis.complexity && serviceType) {
      if (analysis.complexity.toLowerCase() === serviceType.toLowerCase()) {
        score += 20
      }
    }
    
    // Bonus for industry relevance
    if (analysis.industry && serviceType) {
      if (analysis.industry.toLowerCase().includes(serviceType.toLowerCase()) ||
          serviceType.toLowerCase().includes(analysis.industry.toLowerCase())) {
        score += 15
      }
    }
    
    // Only include services with meaningful scores
    if (score > 20) {
      matches.push({
        service: service, // Return the original service object with full attributes
        confidence: Math.min(score, 100), // Cap at 100%
        matchedKeywords: [...new Set(matchedKeywords)] // Remove duplicates
      })
    }
  })
  
  // Sort by confidence (highest first)
  return matches.sort((a, b) => b.confidence - a.confidence)
}

export function ChatInterface() {
  const [session, setSession] = useState<ChatSession>({
    id: "session-1",
    messages: [
      {
        id: "welcome",
        type: "system",
        content:
          "Welcome to ScopeStack! I'm here to help you scope your IT project. I can help you with:\n\n• **Infrastructure Projects** - Network upgrades, server virtualization, datacenter improvements\n• **Cloud Migration** - AWS, Azure, Google Cloud, Office 365 migrations\n• **Security & Compliance** - Security audits, HIPAA/SOX compliance, cybersecurity assessments\n• **Data Protection** - Backup solutions, disaster recovery, business continuity\n\n**To get started, describe your project in detail.** For example:\n• \"I need to upgrade our network infrastructure for 50 users across 3 offices\"\n• \"We want to migrate our email to Office 365 and need help with the setup\"\n• \"Looking for a security audit to meet HIPAA compliance requirements\"\n\nWhat can I help you with today?",
        timestamp: new Date(),
      },
    ],
    projectContext: {},
  })

  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentTab, setCurrentTab] = useState<"project-details" | "wbs" | "pricing" | "documents" | "call-recordings">("project-details")
  const [generatedWBS, setGeneratedWBS] = useState<WorkBreakdownStructure | null>(null)
  const [apiStatus, setApiStatus] = useState<"connected" | "fallback" | "checking">("checking")
  const [selectedServices, setSelectedServices] = useState<ServiceMatch[]>([])
  const [hasGeneratedWBS, setHasGeneratedWBS] = useState(false)

  // Check API key status on component mount
  useEffect(() => {
    const checkApiStatus = () => {
      if (config.scopeStackApiKey) {
        console.log("🔑 API Key found, testing connection...")
        setApiStatus("checking")
      } else {
        console.warn("⚠️ No API key found - using fallback mode")
        setApiStatus("fallback")
      }
    }
    
    checkApiStatus()
  }, [])

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

      // If we have API connectivity, proceed with AI-powered service matching
      if (apiStatus === "connected" || apiStatus === "checking") {
        console.log("🚀 API is available - proceeding with AI-powered service matching")
        
        try {
          // First, get available services from the ScopeStack API
          const { scopeStackApi } = await import("../lib/scopestack-api")
          const servicesResponse = await scopeStackApi.getServices()
          
          if (servicesResponse.success && servicesResponse.data && servicesResponse.data.length > 0) {
            console.log("✅ Got services from API, using AI to find best matches")
            
            // Use AI analysis to determine the best service matches
            const analysis = await analyzeProject(fullContext)
            
            // Create a smart service matching algorithm
            const matchedServices = findBestServiceMatches(fullContext, servicesResponse.data, analysis)
            
            if (matchedServices.length > 0) {
              console.log("🎯 AI found", matchedServices.length, "relevant services")
              
              // Create response message
              const topMatch = matchedServices[0]
              const responseMessage = `Great! I've analyzed your requirements using AI and found ${matchedServices.length} relevant service${matchedServices.length > 1 ? 's' : ''} that could help with your project.

The top recommended service is **${topMatch.service.name}** with a ${topMatch.confidence}% match confidence.

Here are the services I found for you:`

              const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                type: "ai",
                content: responseMessage,
                timestamp: new Date(),
              }

              setSession((prev) => ({
                ...prev,
                messages: [...prev.messages, aiMessage],
                projectContext: {
                  ...prev.projectContext,
                  description: fullContext,
                  needsMoreInfo: false,
                  hasAskedQuestions: false,
                },
              }))

              // Convert and show the matched services
              const convertedMatches = matchedServices.map((match: any) => {
                // Extract the original service data from the API response
                const originalService = match.service
                
                console.log("🔍 Converting service:", {
                  id: originalService.id,
                  name: originalService.attributes?.name,
                  description: originalService.attributes?.["service-description"],
                  type: originalService.attributes?.["service-type"]
                })
                
                // Get subservices if they exist in the included data
                let subservices: any[] = []
                if (originalService.relationships?.subservices?.data) {
                  // This would need to be expanded with the actual subservice data
                  subservices = originalService.relationships.subservices.data.map((sub: any) => ({
                    id: sub.id,
                    name: "Subservice", // Would need to get from included data
                    description: "Subservice description",
                    estimatedHours: 8
                  }))
                }
                
                return {
                  service: {
                    id: originalService.id,
                    name: originalService.attributes?.name || "Unknown Service",
                    description: originalService.attributes?.["service-description"] || "No description available",
                    category: originalService.attributes?.["service-type"] || "General",
                    keywords: originalService.attributes?.["tag-list"] || [],
                    estimatedHours: parseFloat(originalService.attributes?.["total-hours"] || "40"),
                    complexity: "Medium" as const, // Could be derived from service-type
                    source: "scopestack" as const,
                    subservices: subservices,
                    // Additional API-specific fields
                    sku: originalService.attributes?.sku || "",
                    paymentFrequency: originalService.attributes?.["payment-frequency"] || "",
                    minimumQuantity: parseFloat(originalService.attributes?.["minimum-quantity"] || "1"),
                    state: originalService.attributes?.state || "active",
                    guidance: originalService.attributes?.guidance || "",
                    // Scope language fields
                    scopeLanguage: {
                      outOfScope: originalService.attributes?.languages?.out || "",
                      customerResponsibility: originalService.attributes?.languages?.customer || "",
                      assumptions: originalService.attributes?.languages?.assumptions || "",
                      deliverables: originalService.attributes?.languages?.deliverables || "",
                      sowLanguage: originalService.attributes?.languages?.sow_language || "",
                      demoLanguage: originalService.attributes?.languages?.demo_language || "",
                      internalOnly: originalService.attributes?.languages?.internal_only || "",
                      designLanguage: originalService.attributes?.languages?.design_language || "",
                      planningLanguage: originalService.attributes?.languages?.planning_language || "",
                      implementationLanguage: originalService.attributes?.languages?.implementation_language || "",
                      serviceLevelAgreement: originalService.attributes?.languages?.service_level_agreement || ""
                    }
                  },
                  confidence: match.confidence,
                  matchedKeywords: match.matchedKeywords
                }
              })
              
              setSelectedServices(convertedMatches)
            } else {
              // No good matches found
              const noMatchMessage = `I've analyzed your requirements using AI, but I couldn't find exact service matches in our database. 

Could you provide more specific details about:
• What specific technology or system you're working with?
• The scale of your project (number of users, devices, locations)?
• Any specific requirements or constraints?`

              const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                type: "ai",
                content: noMatchMessage,
                timestamp: new Date(),
              }

              setSession((prev) => ({
                ...prev,
                messages: [...prev.messages, aiMessage],
                projectContext: {
                  ...prev.projectContext,
                  description: fullContext,
                  needsMoreInfo: true,
                  hasAskedQuestions: false,
                },
              }))
            }
          } else {
            console.log("⚠️ No services available from API, using fallback")
            // Fallback to local AI analysis
            const analysis = await analyzeProject(fullContext)
            const aiResponse = generateAIResponse(fullContext, [], analysis)
            
            const aiMessage: ChatMessage = {
              id: `ai-${Date.now()}`,
              type: "ai",
              content: aiResponse,
              timestamp: new Date(),
            }

            setSession((prev) => ({
              ...prev,
              messages: [...prev.messages, aiMessage],
              projectContext: {
                ...prev.projectContext,
                description: fullContext,
                needsMoreInfo: false,
                hasAskedQuestions: false,
              },
            }))
          }
        } catch (error) {
          console.error("❌ API call failed, using local AI analysis:", error)
          
          // Fallback to local AI analysis if API fails
          const analysis = await analyzeProject(fullContext)
          const aiResponse = generateAIResponse(fullContext, [], analysis)
          
          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            type: "ai",
            content: aiResponse,
            timestamp: new Date(),
          }

          setSession((prev) => ({
            ...prev,
            messages: [...prev.messages, aiMessage],
            projectContext: {
              ...prev.projectContext,
              description: fullContext,
              needsMoreInfo: false,
              hasAskedQuestions: false,
            },
          }))
        }
        
        setIsLoading(false)
        return
      }

      // Only ask questions if API is not available (fallback mode)
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
        return <ProjectDetailsTab selectedServices={selectedServices} projectContext={session.projectContext} />
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
      case "call-recordings":
        return (
          <CallRecordingConnector
            onTranscriptAnalyzed={(analysis) => {
              // Automatically add the transcript content to the chat
              const transcriptMessage = `Based on the call recording analysis:\n\nProject Type: ${analysis.projectType}\n\nRequirements identified:\n${analysis.requirements.map(r => `• ${r}`).join('\n')}\n\nPlease help me scope this project.`
              setInputValue(transcriptMessage)
            }}
          />
        )
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

          {/* Quick Start Buttons - only show after welcome message */}
          {session.messages.length === 1 && (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 font-medium">Quick Start Examples:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setInputValue("I need to upgrade our network infrastructure for 50 users across 3 offices")
                  }}
                  className="text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm transition-colors"
                >
                  <div className="font-medium text-blue-900">Network Upgrade</div>
                  <div className="text-blue-700 text-xs">50 users, 3 offices</div>
                </button>
                <button
                  onClick={() => {
                    setInputValue("We want to migrate our email to Office 365 and need help with the setup")
                  }}
                  className="text-left p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm transition-colors"
                >
                  <div className="font-medium text-green-900">Office 365 Migration</div>
                  <div className="text-green-700 text-xs">Email migration</div>
                </button>
                <button
                  onClick={() => {
                    setInputValue("Looking for a security audit to meet HIPAA compliance requirements")
                  }}
                  className="text-left p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm transition-colors"
                >
                  <div className="font-medium text-red-900">Security Audit</div>
                  <div className="text-red-700 text-xs">HIPAA compliance</div>
                </button>
                <button
                  onClick={() => {
                    setInputValue("Need backup and disaster recovery solution for our small business")
                  }}
                  className="text-left p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm transition-colors"
                >
                  <div className="font-medium text-purple-900">Backup & DR</div>
                  <div className="text-purple-700 text-xs">Small business</div>
                </button>
              </div>
            </div>
          )}

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
          {/* Manual API Key Input for Testing */}
          {!config.scopeStackApiKey && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-yellow-900">🔑 API Key Required</span>
                <span className="text-xs text-yellow-700">(Development Mode)</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your ScopeStack API key here"
                  className="flex-1 text-xs p-2 border border-yellow-300 rounded"
                  onChange={(e) => {
                    if (e.target.value.trim()) {
                      localStorage.setItem('SCOPESTACK_API_KEY', e.target.value.trim())
                      console.log("🔑 API Key stored in localStorage")
                      // Reload the page to use the new key
                      setTimeout(() => window.location.reload(), 500)
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const key = localStorage.getItem('SCOPESTACK_API_KEY')
                    if (key) {
                      console.log("🔑 Using stored API key")
                      window.location.reload()
                    }
                  }}
                  className="px-3 py-2 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                >
                  Use Stored Key
                </button>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Get your API key from <a href="https://scopestack.io" target="_blank" rel="noopener noreferrer" className="underline">scopestack.io</a>
              </p>
            </div>
          )}

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
            <Button
              variant={currentTab === "call-recordings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentTab("call-recordings")}
              className="px-4 flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Recordings
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{renderTabContent()}</div>
      </div>
    </div>
  )
}
