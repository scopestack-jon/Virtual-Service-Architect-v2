"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Check, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import type { ServiceMatch } from "../data/services"

interface ServiceMatchCardProps {
  match: ServiceMatch
  rank: number
  isSelected?: boolean
  onSelect?: (serviceId: string) => void
}

export function ServiceMatchCard({ match, rank, isSelected = false, onSelect }: ServiceMatchCardProps) {
  const { service, confidence } = match
  const [showSubservices, setShowSubservices] = useState(false)

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500"
    if (confidence >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className={`mb-3 transition-all ${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Badge variant="outline" className="text-xs flex-shrink-0">
              #{rank}
            </Badge>
            <CardTitle className="text-base break-words">{service.name}</CardTitle>
            {service.subservices && service.subservices.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubservices(!showSubservices)}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                {showSubservices ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={service.source === "scopestack" ? "default" : "secondary"} className="text-xs">
              {service.source === "scopestack" ? "SS" : "Local"}
            </Badge>
            {service.sku && (
              <Badge variant="outline" className="text-xs">
                {service.sku}
              </Badge>
            )}
            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidence)}`} />
            <span className="text-xs">{confidence}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>

        {service.subservices && service.subservices.length > 0 && showSubservices && (
          <div className="border-t pt-2 mt-2">
            <div className="text-xs font-medium text-gray-700 mb-2">Subservices ({service.subservices.length}):</div>
            <div className="space-y-1">
              {service.subservices.map((subservice) => (
                <div key={subservice.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{subservice.name}</div>
                    <div className="text-gray-600 text-xs truncate">{subservice.description}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span>{subservice.estimatedHours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs">{service.estimatedHours}h</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {service.complexity}
            </Badge>
            {service.subservices && service.subservices.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {service.subservices.length} subservices
              </Badge>
            )}
          </div>

          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            onClick={() => onSelect?.(service.id)}
            className="h-7 px-2"
          >
            {isSelected ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Selected
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 mr-1" />
                Add to WBS
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
