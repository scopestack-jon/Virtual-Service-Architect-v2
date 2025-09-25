"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FolderOpen,
  Settings,
  Plus,
  Search,
  Building2,
  Phone,
  FileSpreadsheet,
  StickyNote,
  Target,
  Users,
  Calendar,
  MoreHorizontal
} from "lucide-react"

export type NavigationView =
  | 'projects'
  | 'integrations'
  | 'templates'

interface Project {
  id: string
  name: string
  client: string
  status: 'draft' | 'in-progress' | 'review' | 'completed'
  lastUpdated: Date
  contextCount: {
    calls: number
    notes: number
    boms: number
    services: number
  }
  collaborators: string[]
}

interface MainNavProps {
  currentView: NavigationView
  onViewChange: (view: NavigationView) => void
  projects: Project[]
  onProjectSelect: (projectId: string) => void
  selectedProjectId?: string
}

export function MainNav({
  currentView,
  onViewChange,
  projects,
  onProjectSelect,
  selectedProjectId
}: MainNavProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'in-progress': return 'bg-blue-100 text-blue-700'
      case 'review': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-green-100 text-green-700'
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">ScopeStack VSA</h1>

        {/* Main Navigation */}
        <div className="flex flex-col gap-2">
          <Button
            variant={currentView === 'projects' ? 'default' : 'ghost'}
            className="justify-start"
            onClick={() => onViewChange('projects')}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Projects
            <Badge variant="secondary" className="ml-auto">
              {projects.length}
            </Badge>
          </Button>

          <Button
            variant={currentView === 'integrations' ? 'default' : 'ghost'}
            className="justify-start"
            onClick={() => onViewChange('integrations')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Integrations
          </Button>

          <Button
            variant={currentView === 'templates' ? 'default' : 'ghost'}
            className="justify-start"
            onClick={() => onViewChange('templates')}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Service Templates
          </Button>
        </div>
      </div>

      {/* Projects View */}
      {currentView === 'projects' && (
        <div className="flex-1 flex flex-col">
          {/* Search & New Project */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedProjectId === project.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => onProjectSelect(project.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                        <CardDescription className="text-xs">{project.client}</CardDescription>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Context Summary */}
                    <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                      {project.contextCount.calls > 0 && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {project.contextCount.calls}
                        </div>
                      )}
                      {project.contextCount.notes > 0 && (
                        <div className="flex items-center gap-1">
                          <StickyNote className="w-3 h-3" />
                          {project.contextCount.notes}
                        </div>
                      )}
                      {project.contextCount.boms > 0 && (
                        <div className="flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3" />
                          {project.contextCount.boms}
                        </div>
                      )}
                      {project.contextCount.services > 0 && (
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {project.contextCount.services}
                        </div>
                      )}
                    </div>

                    {/* Collaborators & Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.collaborators.length}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.lastUpdated.toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredProjects.length === 0 && (
                <div className="text-center py-8">
                  <FolderOpen className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    {searchQuery ? 'No projects found' : 'No projects yet'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchQuery ? 'Try a different search term' : 'Create your first project to get started'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Integrations View Placeholder */}
      {currentView === 'integrations' && (
        <div className="flex-1 p-4">
          <div className="text-center py-8">
            <Settings className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-700">Integration Management</p>
            <p className="text-xs text-gray-500 mt-1">Configure your data sources</p>
          </div>
        </div>
      )}

      {/* Templates View Placeholder */}
      {currentView === 'templates' && (
        <div className="flex-1 p-4">
          <div className="text-center py-8">
            <Building2 className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-700">Service Templates</p>
            <p className="text-xs text-gray-500 mt-1">Manage your ScopeStack services</p>
          </div>
        </div>
      )}
    </div>
  )
}