"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Upload, Plus } from "lucide-react"

export function DocumentsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Project Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Document
            </Button>
            <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Statement of Work</p>
                  <p className="text-xs text-gray-600">Generated from WBS</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Draft</Badge>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Project Proposal</p>
                  <p className="text-xs text-gray-600">Auto-generated</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Ready</Badge>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Technical Requirements</p>
                  <p className="text-xs text-gray-600">From chat analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Draft</Badge>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-start bg-transparent">
              <span className="font-medium">SOW Template</span>
              <span className="text-xs text-gray-600">Standard statement of work</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-start bg-transparent">
              <span className="font-medium">Proposal Template</span>
              <span className="text-xs text-gray-600">Project proposal format</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-start bg-transparent">
              <span className="font-medium">Requirements Doc</span>
              <span className="text-xs text-gray-600">Technical requirements</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-start bg-transparent">
              <span className="font-medium">Project Charter</span>
              <span className="text-xs text-gray-600">Project initiation document</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
