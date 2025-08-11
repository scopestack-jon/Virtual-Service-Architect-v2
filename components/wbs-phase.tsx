"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  Target,
  AlertTriangle,
  Info,
} from "lucide-react"
import type { WBSPhase } from "../types/wbs"

interface WBSPhaseProps {
  phase: WBSPhase
  phaseNumber: number
}

export function WBSPhaseComponent({ phase, phaseNumber }: WBSPhaseProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case "Technical":
        return "bg-blue-100 text-blue-800"
      case "Project Management":
        return "bg-purple-100 text-purple-800"
      case "Specialist":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <div>
                  <CardTitle className="text-lg">{phase.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={getRiskColor(phase.riskLevel)} variant="secondary">
                  {phase.riskLevel} Risk
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-medium">${phase.totalCost.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    {phase.totalHours}h • {phase.duration} weeks
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Phase Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-xs text-gray-600">{phase.duration} weeks</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Cost</div>
                  <div className="text-xs text-gray-600">${phase.totalCost.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Hours</div>
                  <div className="text-xs text-gray-600">{phase.totalHours}h</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Start Week</div>
                  <div className="text-xs text-gray-600">Week {phase.startWeek}</div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Services & Deliverables</h4>
              {phase.services.map((service) => (
                <Card key={service.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {service.name} Qty {service.quantity || 1} Hours {service.estimatedHours}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getResourceTypeColor(service.resourceType)} variant="secondary">
                          {service.resourceType}
                        </Badge>
                        {service.sku && (
                          <Badge variant="outline" className="text-xs">
                            {service.sku}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {service.subservices && service.subservices.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm mb-2">Subservices:</h5>
                          <div className="space-y-2 ml-4">
                            {service.subservices.map((subservice) => (
                              <div
                                key={subservice.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="text-sm">
                                  - {subservice.name} Qty {subservice.quantity || 1} Hours {subservice.estimatedHours}
                                </span>
                                {subservice.state && (
                                  <Badge variant="outline" className="text-xs">
                                    {subservice.state}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <h5 className="font-medium text-sm">Deliverables:</h5>
                      {service.deliverables.map((deliverable) => (
                        <div key={deliverable.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h6 className="font-medium text-sm">{deliverable.name}</h6>
                              <div className="flex items-center gap-2">
                                <Badge className={getRiskColor(deliverable.riskLevel)} variant="outline">
                                  {deliverable.riskLevel}
                                </Badge>
                                <span className="text-xs text-gray-500">{deliverable.estimatedHours}h</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">{deliverable.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(service.languages?.outOfScope || service.languages?.customerResponsibility) && (
                      <div className="mt-4 space-y-2">
                        {service.languages.outOfScope && (
                          <div className="flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-red-800">Out of Scope:</div>
                              <div className="text-xs text-red-700">{service.languages.outOfScope}</div>
                            </div>
                          </div>
                        )}
                        {service.languages.customerResponsibility && (
                          <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-blue-800">Customer Responsibility:</div>
                              <div className="text-xs text-blue-700">{service.languages.customerResponsibility}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Milestones */}
            {phase.milestones.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Key Milestones</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {phase.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-800">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dependencies */}
            {phase.dependencies.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Dependencies</h4>
                <div className="flex flex-wrap gap-2">
                  {phase.dependencies.map((dep, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
