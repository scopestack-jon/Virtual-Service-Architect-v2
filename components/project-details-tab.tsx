"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Calendar, User } from "lucide-react"

export function ProjectDetailsTab() {
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
              <p className="text-sm text-gray-900 mt-1">IT Infrastructure Upgrade</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Industry</label>
              <p className="text-sm text-gray-900 mt-1">Technology</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Complexity</label>
              <Badge variant="secondary" className="mt-1">
                Medium
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Badge variant="outline" className="mt-1">
                Scoping
              </Badge>
            </div>
          </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
