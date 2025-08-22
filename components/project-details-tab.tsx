"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Calendar, User } from "lucide-react"
import type { ServiceMatch } from "../data/services"

interface ProjectDetailsTabProps {
  selectedServices?: ServiceMatch[]
  projectContext?: any
}

export function ProjectDetailsTab({ selectedServices, projectContext }: ProjectDetailsTabProps) {
  // Extract project information from selected services and context
  const projectName = selectedServices?.length > 0 
    ? selectedServices[0].service.name 
    : projectContext?.description || "IT Project"
  
  const industry = projectContext?.industry || "Technology"
  const complexity = projectContext?.complexity || "Medium"
  const status = selectedServices?.length > 0 ? "Services Selected" : "Scoping"
  
  // Calculate total estimated hours
  const totalHours = selectedServices?.reduce((sum, match) => sum + match.service.estimatedHours, 0) || 0
  
  // Get unique categories
  const categories = [...new Set(selectedServices?.map(match => match.service.category))] || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Project Name</label>
              <p className="text-sm text-gray-900 mt-1">{projectName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Industry</label>
              <p className="text-sm text-gray-900 mt-1">{industry}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Complexity</label>
              <Badge variant="secondary" className="mt-1">
                {complexity}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Badge variant="outline" className="mt-1">
                {status}
              </Badge>
            </div>
          </div>
          
          {selectedServices?.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Services</h4>
              <div className="space-y-2">
                {selectedServices.map((match, index) => (
                  <div key={match.service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{match.service.name}</p>
                      <p className="text-xs text-gray-600">{match.service.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{match.service.estimatedHours}h</p>
                      <p className="text-xs text-gray-600">{match.confidence}% match</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Estimated Hours</span>
                  <span className="text-lg font-semibold text-gray-900">{totalHours}h</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-medium text-gray-700">Service Categories</span>
                  <span className="text-sm text-gray-600">{categories.join(", ")}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Stakeholders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Project Manager</span>
              <span className="text-sm text-gray-600">TBD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Technical Lead</span>
              <span className="text-sm text-gray-600">TBD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Client Contact</span>
              <span className="text-sm text-gray-600">TBD</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Start Date</span>
              <span className="text-sm text-gray-600">TBD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">End Date</span>
              <span className="text-sm text-gray-600">TBD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Duration</span>
              <span className="text-sm text-gray-600">TBD</span>
            </div>
            {totalHours > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Effort</span>
                <span className="text-sm text-gray-600">{totalHours} hours</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
