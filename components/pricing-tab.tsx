"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Calculator } from "lucide-react"

export function PricingTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Cost Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Total Hours</label>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Estimated Cost</label>
              <p className="text-2xl font-bold text-green-600 mt-1">$0</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Badge variant="outline" className="mb-2">
              Preliminary Estimate
            </Badge>
            <p className="text-xs text-gray-600">
              Pricing will be calculated based on selected services and their estimated hours.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Labor</span>
              <span className="text-sm text-gray-600">$0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Materials</span>
              <span className="text-sm text-gray-600">$0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overhead</span>
              <span className="text-sm text-gray-600">$0</span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between font-medium">
              <span>Total</span>
              <span>$0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Pricing Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Fixed Price</span>
                <Badge variant="secondary">Recommended</Badge>
              </div>
              <p className="text-xs text-gray-600">Single price for the entire project scope</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Time & Materials</span>
                <Badge variant="outline">Flexible</Badge>
              </div>
              <p className="text-xs text-gray-600">Hourly billing with estimated hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
