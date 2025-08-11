"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Wifi } from "lucide-react"
import { scopeStackApi } from "@/lib/scopestack-api"

export function ApiConnectionTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    status: "idle" | "success" | "error"
    message: string
    details?: any
  }>({ status: "idle", message: "Not tested" })

  const testConnection = async () => {
    setIsLoading(true)
    setConnectionStatus({ status: "idle", message: "Testing connection..." })

    try {
      const result = await scopeStackApi.testConnection()

      if (result.success) {
        setConnectionStatus({
          status: "success",
          message: "Connected successfully!",
          details: result.data,
        })
      } else {
        setConnectionStatus({
          status: "error",
          message: result.error || "Connection failed",
        })
      }
    } catch (error) {
      setConnectionStatus({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />
    if (connectionStatus.status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />
    if (connectionStatus.status === "error") return <XCircle className="h-4 w-4 text-red-500" />
    return <Wifi className="h-4 w-4 text-gray-500" />
  }

  const getStatusBadge = () => {
    if (connectionStatus.status === "success")
      return (
        <Badge variant="default" className="bg-green-500 text-xs">
          Connected
        </Badge>
      )
    if (connectionStatus.status === "error")
      return (
        <Badge variant="destructive" className="text-xs">
          Disconnected
        </Badge>
      )
    return (
      <Badge variant="secondary" className="text-xs">
        Unknown
      </Badge>
    )
  }

  return (
    <Card className="mb-4 w-full">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 min-w-0">
            {getStatusIcon()}
            <CardTitle className="text-sm truncate">ScopeStack API</CardTitle>
            {getStatusBadge()}
          </div>
          <Button
            onClick={testConnection}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="w-full text-xs whitespace-normal h-auto py-1.5 bg-transparent"
          >
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
        </div>
        <CardDescription className="text-xs break-words">{connectionStatus.message}</CardDescription>
      </CardHeader>

      {connectionStatus.details && (
        <CardContent className="pt-0">
          <div className="text-xs text-muted-foreground space-y-1 min-w-0">
            <div className="font-medium text-foreground break-words">
              {connectionStatus.details.data?.attributes?.name || "Unknown User"}
            </div>
            <div className="break-words">
              Account: {connectionStatus.details.data?.attributes?.["account-slug"] || "Unknown"}
            </div>
            <div className="break-words">
              Email: {connectionStatus.details.data?.attributes?.email || "Not provided"}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
