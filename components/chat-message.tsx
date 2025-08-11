"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, User, CheckCircle } from "lucide-react"
import type { ChatMessage } from "../types/chat"
import { ServiceMatchCard } from "./service-match-card"
import type { ServiceMatch } from "../data/services"

interface ChatMessageProps {
  message: ChatMessage
  selectedServices?: ServiceMatch[]
  onServiceSelect?: (serviceId: string, serviceMatches: ServiceMatch[]) => void
  hasGeneratedWBS?: boolean
}

export function ChatMessageComponent({
  message,
  selectedServices = [],
  onServiceSelect,
  hasGeneratedWBS = false,
}: ChatMessageProps) {
  const isUser = message.type === "user"
  const isSystem = message.type === "system"

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <p className="text-sm text-blue-800">{message.content}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar className="w-8 h-8">
        <AvatarFallback className={isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white"}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
        <div
          className={`inline-block p-3 rounded-lg ${
            isUser ? "bg-blue-500 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        <div className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString()}</div>

        {message.serviceMatches && message.serviceMatches.length > 0 && (
          <div className="mt-4">
            {hasGeneratedWBS ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Services added to WBS</span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedServices.length} selected
                    </Badge>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    {selectedServices.map((s) => s.service.name).join(", ")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Available Services:</h4>
                {message.serviceMatches.map((match, index) => (
                  <ServiceMatchCard
                    key={match.service.id}
                    match={match}
                    rank={index + 1}
                    isSelected={selectedServices.some((s) => s.service.id === match.service.id)}
                    onSelect={(serviceId) => onServiceSelect?.(serviceId, message.serviceMatches!)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
