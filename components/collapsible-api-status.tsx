"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Wifi, WifiOff, Loader2 } from "lucide-react"
import { ApiStatusDashboard } from "./api-status-dashboard"

interface CollapsibleApiStatusProps {
  apiStatus: "connected" | "fallback" | "checking"
}

export function CollapsibleApiStatus({ apiStatus }: CollapsibleApiStatusProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getStatusIcon = () => {
    switch (apiStatus) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-500" />
      case "fallback":
        return <WifiOff className="w-4 h-4 text-orange-500" />
      case "checking":
        return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
    }
  }

  const getStatusText = () => {
    switch (apiStatus) {
      case "connected":
        return "API Connected"
      case "fallback":
        return "Offline Mode"
      case "checking":
        return "Checking..."
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8">
          {getStatusIcon()}
          <span className="text-xs">{getStatusText()}</span>
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute top-full right-0 z-50 mt-1">
        <Card className="w-80 shadow-lg">
          <CardContent className="p-3">
            <ApiStatusDashboard />
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
