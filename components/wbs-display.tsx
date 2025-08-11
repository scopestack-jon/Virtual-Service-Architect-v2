"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AlertTriangle, GripVertical, ChevronRight, ChevronDown, Eye, Settings, Plus } from "lucide-react"
import type { WorkBreakdownStructure } from "../types/wbs"
import { WBSSummaryCards } from "./wbs-summary-cards"
import { generateWBSSummary, exportWBS } from "../utils/wbsGenerator"

interface WBSDisplayProps {
  wbs: WorkBreakdownStructure
}

export function WBSDisplay({ wbs }: WBSDisplayProps) {
  const [activeTab, setActiveTab] = useState<"assigned" | "sow" | "pricing">("assigned")
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())
  const [showAllSubservices, setShowAllSubservices] = useState(false)
  const [serviceData, setServiceData] = useState<Record<string, any>>({})
  const summary = generateWBSSummary(wbs)

  const servicesByPhase = wbs.phases.reduce(
    (acc, phase) => {
      if (phase.name === "Project Management & Coordination") {
        return acc
      }

      phase.services.forEach((service) => {
        const actualPhaseName = service.phaseName || phase.name.replace(/^Phase \d+: /, "")

        const mainService = {
          id: service.id,
          actualServiceName: service.name,
          phaseName: actualPhaseName,
          phaseId: phase.id,
          totalHours: service.estimatedHours,
          totalCost: service.estimatedHours * 150, // Assuming $150/hour rate
          riskLevel: phase.riskLevel,
          subservices: service.subservices || [],
          minimumQuantity: service.minimumQuantity || 1,
          suggestedHours: service.estimatedHours,
          resourceType: service.resourceType || "Technical",
          languages: service.languages,
        }

        if (!acc[actualPhaseName]) {
          acc[actualPhaseName] = []
        }

        acc[actualPhaseName].push(mainService)
      })

      return acc
    },
    {} as Record<string, any[]>,
  )

  const togglePhaseExpansion = (phaseName: string) => {
    const newExpanded = new Set(expandedPhases)
    if (newExpanded.has(phaseName)) {
      newExpanded.delete(phaseName)
    } else {
      newExpanded.add(phaseName)
    }
    setExpandedPhases(newExpanded)
  }

  const toggleServiceExpansion = (serviceName: string) => {
    const newExpanded = new Set(expandedServices)
    if (newExpanded.has(serviceName)) {
      newExpanded.delete(serviceName)
    } else {
      newExpanded.add(serviceName)
    }
    setExpandedServices(newExpanded)
  }

  const handleExport = (format: "json" | "csv") => {
    const exportData = exportWBS(wbs, format)
    const blob = new Blob([exportData], {
      type: format === "json" ? "application/json" : "text/csv",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${wbs.projectName.toLowerCase().replace(/\s+/g, "-")}-wbs.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleServiceChange = (serviceId: string, field: string, value: any) => {
    setServiceData((prev) => ({
      ...prev,
      [`${serviceId}-${field}`]: value,
    }))
  }

  const getServiceValue = (serviceId: string, field: string, defaultValue: any) => {
    return serviceData[`${serviceId}-${field}`] ?? defaultValue
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Professional Services</h2>
          <p className="text-sm text-gray-600">{wbs.projectName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAllSubservices(!showAllSubservices)}>
            <Eye className="w-4 h-4 mr-2" />
            {showAllSubservices ? "Hide" : "Show all"} Subservices
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            Export Services
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add a Service
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <WBSSummaryCards summary={summary} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "assigned"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Assigned Services
          </button>
          <button
            onClick={() => setActiveTab("sow")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sow"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Statement of Work
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "pricing"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Service Pricing
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "assigned" && (
        <div className="space-y-4">
          {Object.keys(servicesByPhase).length > 0 ? (
            Object.entries(servicesByPhase).map(([phaseName, services]) => (
              <div key={phaseName} className="border border-gray-200 rounded-lg">
                <div
                  className="bg-blue-50 border-b border-gray-200 p-4 cursor-pointer hover:bg-blue-100"
                  onClick={() => togglePhaseExpansion(phaseName)}
                >
                  <div className="flex items-center gap-2">
                    {expandedPhases.has(phaseName) ? (
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                    )}
                    <h3 className="text-lg font-semibold text-blue-900">{phaseName}</h3>
                  </div>
                </div>

                {expandedPhases.has(phaseName) && (
                  <div>
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-gray-200">
                      <div className="grid grid-cols-11 gap-4 p-4 text-sm font-medium text-gray-700 uppercase tracking-wider">
                        <div className="col-span-1"></div>
                        <div className="col-span-6 text-left">Service Name</div>
                        <div className="col-span-1 text-center">Qty</div>
                        <div className="col-span-1 text-center">Hours</div>
                        <div className="col-span-1">Resource</div>
                        <div className="col-span-1"></div>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="divide-y divide-gray-100">
                      {services.map((service, index) => (
                        <div key={`${service.actualServiceName}-${index}`}>
                          <div className="grid grid-cols-11 gap-4 p-3 hover:bg-gray-50 items-center">
                            <div className="col-span-1 flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                              {service.subservices && service.subservices.length > 0 && (
                                <button
                                  onClick={() => toggleServiceExpansion(service.actualServiceName)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  {expandedServices.has(service.actualServiceName) ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>

                            <div className="col-span-6">
                              <div className="font-medium text-gray-900">{service.actualServiceName}</div>
                            </div>

                            <div className="col-span-1 text-center">
                              <Input
                                value={getServiceValue(service.id, "quantity", service.minimumQuantity || 1)}
                                onChange={(e) =>
                                  handleServiceChange(service.id, "quantity", Number.parseInt(e.target.value) || 1)
                                }
                                className="text-center w-16"
                                type="number"
                                min="1"
                              />
                            </div>

                            <div className="col-span-1 text-center">
                              <Input
                                value={getServiceValue(service.id, "hours", service.suggestedHours || 0)}
                                onChange={(e) =>
                                  handleServiceChange(service.id, "hours", Number.parseFloat(e.target.value) || 0)
                                }
                                className="text-center w-20"
                                type="number"
                                min="0"
                              />
                            </div>

                            <div className="col-span-1">
                              <select
                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                value={getServiceValue(service.id, "resourceType", service.resourceType)}
                                onChange={(e) => handleServiceChange(service.id, "resourceType", e.target.value)}
                              >
                                <option value={service.resourceType}>{service.resourceType}</option>
                                <option value="Technical">Technical</option>
                                <option value="Project Manager">Project Manager</option>
                                <option value="Specialist">Specialist</option>
                              </select>
                            </div>

                            <div className="col-span-1 flex items-center gap-1">
                              <button className="p-1 hover:bg-gray-200 rounded">
                                <Eye className="w-4 h-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded">
                                <Settings className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>

                          {expandedServices.has(service.actualServiceName) &&
                            service.subservices &&
                            service.subservices.length > 0 && (
                              <div className="bg-gray-25 border-t border-gray-100">
                                <div className="p-4">
                                  <h4 className="text-sm font-medium text-gray-700 mb-3">Subservices</h4>

                                  <div className="bg-gray-50 border border-gray-200 rounded-t-lg">
                                    <div className="grid grid-cols-10 gap-4 p-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                                      <div className="col-span-1"></div>
                                      <div className="col-span-5 text-left">Subservice Name</div>
                                      <div className="col-span-1 text-center">Qty</div>
                                      <div className="col-span-1 text-center">Hours</div>
                                      <div className="col-span-1">Resource</div>
                                      <div className="col-span-1"></div>
                                    </div>
                                  </div>

                                  <div className="border border-gray-200 border-t-0 rounded-b-lg divide-y divide-gray-100">
                                    {service.subservices.map((subservice, subIndex) => (
                                      <div
                                        key={`${subservice.id}-${subIndex}`}
                                        className="grid grid-cols-10 gap-4 p-3 hover:bg-gray-50 items-center"
                                      >
                                        <div className="col-span-1">
                                          <GripVertical className="w-3 h-3 text-gray-400 cursor-move" />
                                        </div>

                                        <div className="col-span-5">
                                          <div className="text-sm font-medium text-gray-800">{subservice.name}</div>
                                        </div>

                                        <div className="col-span-1 text-center">
                                          <Input
                                            value={getServiceValue(
                                              subservice.id,
                                              "quantity",
                                              subservice.minimumQuantity || 1,
                                            )}
                                            onChange={(e) =>
                                              handleServiceChange(
                                                subservice.id,
                                                "quantity",
                                                Number.parseInt(e.target.value) || 1,
                                              )
                                            }
                                            className="text-center w-14 text-xs"
                                            type="number"
                                            min="1"
                                          />
                                        </div>

                                        <div className="col-span-1 text-center">
                                          <Input
                                            value={getServiceValue(
                                              subservice.id,
                                              "hours",
                                              subservice.suggestedHours || 0,
                                            )}
                                            onChange={(e) =>
                                              handleServiceChange(
                                                subservice.id,
                                                "hours",
                                                Number.parseFloat(e.target.value) || 0,
                                              )
                                            }
                                            className="text-center w-16 text-xs"
                                            type="number"
                                            min="0"
                                          />
                                        </div>

                                        <div className="col-span-1">
                                          <select
                                            className="w-full p-1 border border-gray-300 rounded text-xs"
                                            value={getServiceValue(
                                              subservice.id,
                                              "resourceType",
                                              subservice.resourceType || "Technical",
                                            )}
                                            onChange={(e) =>
                                              handleServiceChange(subservice.id, "resourceType", e.target.value)
                                            }
                                          >
                                            <option value="Technical">Technical</option>
                                            <option value="Specialist">Specialist</option>
                                          </select>
                                        </div>

                                        <div className="col-span-1">
                                          <button className="p-1 hover:bg-gray-200 rounded">
                                            <Settings className="w-3 h-3 text-gray-400" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No services available. Add services to generate a work breakdown structure.
            </div>
          )}
        </div>
      )}

      {activeTab === "sow" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Statement of Work</h3>

          {Object.entries(servicesByPhase).map(([phaseName, services]) => (
            <Card key={phaseName} className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">{phaseName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service, index) => (
                  <div
                    key={`${service.id}-${index}`}
                    className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{service.actualServiceName}</h4>

                    {service.description && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Service Description:</h5>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    )}

                    {service.languages && (
                      <div className="space-y-3">
                        {service.languages.outOfScope && (
                          <div>
                            <h5 className="text-sm font-medium text-red-700 mb-1">Out of Scope:</h5>
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{service.languages.outOfScope}</p>
                          </div>
                        )}

                        {service.languages.customerResponsibility && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-700 mb-1">Customer Responsibility:</h5>
                            <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                              {service.languages.customerResponsibility}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {service.subservices && service.subservices.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Subservices:</h5>
                        <div className="space-y-2 ml-4">
                          {service.subservices.map((subservice, subIndex) => (
                            <div key={`${subservice.id}-${subIndex}`} className="border-l-2 border-gray-200 pl-3">
                              <h6 className="text-sm font-medium text-gray-800">{subservice.name}</h6>
                              {subservice.description && (
                                <p className="text-xs text-gray-600 mt-1">{subservice.description}</p>
                              )}

                              {subservice.languages && (
                                <div className="mt-2 space-y-1">
                                  {subservice.languages.outOfScope && (
                                    <p className="text-xs text-red-600">
                                      <span className="font-medium">Out of Scope:</span>{" "}
                                      {subservice.languages.outOfScope}
                                    </p>
                                  )}
                                  {subservice.languages.customerResponsibility && (
                                    <p className="text-xs text-blue-600">
                                      <span className="font-medium">Customer Responsibility:</span>{" "}
                                      {subservice.languages.customerResponsibility}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "pricing" && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Service Pricing</h3>
          <div className="text-center py-8 text-gray-500">Pricing information will be displayed here.</div>
        </div>
      )}

      {/* Risk Assessment */}
      {wbs.riskAssessment && wbs.riskAssessment.factors && wbs.riskAssessment.factors.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Overall Risk Level:</span>
                <Badge
                  className={
                    wbs.riskAssessment.overall === "High"
                      ? "bg-red-100 text-red-800"
                      : wbs.riskAssessment.overall === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }
                  variant="secondary"
                >
                  {wbs.riskAssessment.overall}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Risk Factors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {wbs.riskAssessment.factors.map((factor, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        Generated on {wbs.createdAt.toLocaleDateString()} • Total Hours: {wbs.totalHours} • Total Cost: $
        {wbs.totalCost.toLocaleString()}
      </div>
    </div>
  )
}
