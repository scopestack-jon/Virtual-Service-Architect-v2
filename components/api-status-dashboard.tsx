"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RefreshCw, ChevronDown, User, Building } from "lucide-react"
import { scopeStackApi, type ScopeStackApiStatus, type EndpointStatus } from "@/lib/scopestack-api"

export function ApiStatusDashboard() {
  const [status, setStatus] = useState<ScopeStackApiStatus | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasInitiallyTested, setHasInitiallyTested] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  const refreshStatus = () => {
    setStatus(scopeStackApi.getStatus())
  }

  const testAllEndpoints = async () => {
    setIsRefreshing(true)
    try {
      // Test /me endpoint
      await scopeStackApi.testConnection()

      // Test /services endpoint
      await scopeStackApi.getServices()

      // Test /subservices endpoint
      await scopeStackApi.getSubservices()

      refreshStatus()
    } catch (error) {
      console.error("Error testing endpoints:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    refreshStatus()

    if (!hasInitiallyTested) {
      setHasInitiallyTested(true)
      const currentStatus = scopeStackApi.getStatus()
      if (currentStatus?.overall !== "healthy") {
        testAllEndpoints()
      }
    }

    const interval = setInterval(refreshStatus, 2000)
    return () => clearInterval(interval)
  }, [hasInitiallyTested])

  if (!status) return null

  const getStatusIcon = (endpointStatus: EndpointStatus) => {
    switch (endpointStatus.status) {
      case "success":
        return <div className="h-2 w-2 rounded-full bg-green-500" />
      case "error":
        return <div className="h-2 w-2 rounded-full bg-red-500" />
      case "pending":
        return <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-400" />
    }
  }

  const getOverallStatusColor = () => {
    switch (status.overall) {
      case "healthy":
        return "border-green-200 bg-green-50"
      case "degraded":
        return "border-yellow-200 bg-yellow-50"
      case "down":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const userInfo = status.me.data as any
  const userName = userInfo?.data?.attributes?.name
  const accountSlug = userInfo?.data?.attributes?.["account-slug"]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`w-full ${getOverallStatusColor()}`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-black/5 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">ScopeStack API</CardTitle>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    status.overall === "healthy"
                      ? "bg-green-500"
                      : status.overall === "degraded"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
            {!isOpen && userName && (
              <div className="text-xs text-muted-foreground truncate">
                {userName} • {accountSlug}
              </div>
            )}
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {userName && (
              <div className="space-y-1 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-3 w-3" />
                  <span className="truncate font-medium">{userName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span className="truncate">{accountSlug}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {/* /me endpoint */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {getStatusIcon(status.me)}
                  <span className="font-mono text-xs">/me</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {status.me.responseTime && <span>{status.me.responseTime}ms</span>}
                </div>
              </div>

              {/* /services endpoint */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {getStatusIcon(status.services)}
                  <span className="font-mono text-xs">/services</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {status.services.dataCount !== undefined && <span>{status.services.dataCount}</span>}
                  {status.services.responseTime && <span>{status.services.responseTime}ms</span>}
                </div>
              </div>

              {/* /subservices endpoint */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {getStatusIcon(status.subservices)}
                  <span className="font-mono text-xs">/subservices</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {status.subservices.dataCount !== undefined && <span>{status.subservices.dataCount}</span>}
                  {status.subservices.responseTime && <span>{status.subservices.responseTime}ms</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={testAllEndpoints}
                disabled={isRefreshing}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                Test
              </Button>
            </div>

            {(status.me.error || status.services.error || status.subservices.error) && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs space-y-1">
                {status.me.error && <div className="text-red-600 break-words">• /me: {status.me.error}</div>}
                {status.services.error && (
                  <div className="text-red-600 break-words">• /services: {status.services.error}</div>
                )}
                {status.subservices.error && (
                  <div className="text-red-600 break-words">• /subservices: {status.subservices.error}</div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
