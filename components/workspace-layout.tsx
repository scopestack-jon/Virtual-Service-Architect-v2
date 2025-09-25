"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FolderOpen,
  Settings,
  Plus,
  Phone,
  Building2,
  StickyNote,
  FileSpreadsheet,
  Target,
  Users,
  Menu,
  X,
  Search,
  Filter,
  ChevronDown
} from "lucide-react"
import { ProjectWorkspace } from "./project-workspace"
import { CallRecordingsSidebar } from "./call-recordings-sidebar"
import { Sidebar } from "./sidebar"
import { ScopeTable } from "./scope-table"
import { ProjectOverview } from "./project-overview"
import { SettingsPage } from "./settings-page"

export type SidebarType =
  | 'overview'
  | 'scope'
  | 'projects'
  | 'call-recordings'
  | 'integrations'
  | 'services'
  | 'notes'
  | 'boms'
  | 'settings'
  | null

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
  description?: string
  callRecordings: any[]
  notes: any[]
  boms: any[]
  serviceMappings: any[]
}

interface WorkspaceLayoutProps {
  projects: Project[]
  selectedProject: Project | null
  onProjectSelect: (projectId: string) => void
  onProjectUpdate: (project: Project) => void
}

export function WorkspaceLayout({
  projects,
  selectedProject,
  onProjectSelect,
  onProjectUpdate
}: WorkspaceLayoutProps) {
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>(null)
  const [isTopBarExpanded, setIsTopBarExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeProjectsExpanded, setActiveProjectsExpanded] = useState(true)

  const toggleSidebar = (sidebar: SidebarType) => {
    // Toggle the selected sidebar - if it's already active, deselect it
    setActiveSidebar(activeSidebar === sidebar ? null : sidebar)
  }

  const handleCallRecordingsSelect = (recordings: any[]) => {
    if (!selectedProject) return

    // Add selected recordings to project, marking them as linked
    const newRecordings = recordings.map(recording => ({
      ...recording,
      isLinked: true
    }))

    const updatedProject = {
      ...selectedProject,
      callRecordings: [
        ...selectedProject.callRecordings.filter(existing =>
          !recordings.some(selected => selected.id === existing.id)
        ),
        ...newRecordings
      ]
    }
    onProjectUpdate(updatedProject)
  }

  // Filter projects based on search and status
  const activeProjects = projects.filter(p =>
    p.status === 'in-progress' &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const completedProjects = projects.filter(p =>
    p.status === 'completed' &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const draftProjects = projects.filter(p =>
    p.status === 'draft' &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar
        selectedProject={selectedProject}
        activeSidebar={activeSidebar}
        onSidebarToggle={toggleSidebar}
        onProjectDeselect={() => onProjectSelect("")}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Primary Workspace */}
        <div className="h-full">
          {selectedProject ? (
            <div className="h-full">
              {/* Overview View */}
              {activeSidebar === 'overview' && (
                <ProjectOverview
                  project={selectedProject}
                  onProjectUpdate={onProjectUpdate}
                />
              )}

              {/* Scope View */}
              {activeSidebar === 'scope' && (
                <div className="p-6">
                  <ScopeTable
                    services={selectedProject.scopeServices || []}
                    onServiceUpdate={(serviceId, updates) => {
                      const updatedProject = {
                        ...selectedProject,
                        scopeServices: (selectedProject.scopeServices || []).map(service =>
                          service.id === serviceId
                            ? { ...service, attributes: { ...service.attributes, ...updates } }
                            : service
                        )
                      }
                      onProjectUpdate(updatedProject)
                    }}
                    onServiceDelete={(serviceId) => {
                      const updatedProject = {
                        ...selectedProject,
                        scopeServices: (selectedProject.scopeServices || []).filter(service => service.id !== serviceId)
                      }
                      onProjectUpdate(updatedProject)
                    }}
                    onServiceAdd={() => {
                      const newService = {
                        id: Date.now().toString(),
                        attributes: {
                          active: true,
                          name: "New Service",
                          quantity: 1,
                          "override-hours": "0.0",
                          "actual-hours": null,
                          position: (selectedProject.scopeServices?.length || 0) + 1,
                          "service-type": "professional_services",
                          "lob-id": 0,
                          "payment-frequency": "one_time",
                          "task-source": "standard",
                          languages: {},
                          "variable-rates": { hours: [] },
                          "calculated-pricing": {
                            service_cost: "0.0",
                            material_cost: 0,
                            extended_hours: "0.0",
                            service_revenue: "0.0",
                            material_revenue: 0
                          },
                          "extended-hours": "0.0",
                          "total-hours": "0.0",
                          "external-resource-name": null,
                          sku: "",
                          "service-description": "",
                          "target-margin": null,
                          "payment-method": "payment_term_schedule",
                          "resource-rate-id": null,
                          "custom-hours?": null
                        }
                      }
                      const updatedProject = {
                        ...selectedProject,
                        scopeServices: [...(selectedProject.scopeServices || []), newService]
                      }
                      onProjectUpdate(updatedProject)
                    }}
                    onServicesAdd={(projectServices) => {
                      const newServices = projectServices.map((service, index) => {
                        // Extract hours from various possible sources
                        const hoursValue = service.attributes.estimatedHours ||
                                         service.attributes["estimated-hours"] ||
                                         service.attributes.hours ||
                                         service.attributes["total-hours"] ||
                                         0

                        // Extract quantity from service attributes or default to 1
                        const quantityValue = service.attributes.quantity || 1

                        // Extract resource name from relationship data or attributes
                        const resourceName = service.attributes["external-resource-name"] ||
                                           service.attributes["resource-name"] ||
                                           null

                        // Service processing with resource data

                        return {
                          id: `${service.id}-${Date.now()}-${index}`,
                          attributes: {
                            active: service.attributes.active ?? true,
                            name: service.attributes.name || "Imported Service",
                            quantity: quantityValue,
                            "override-hours": hoursValue.toString(),
                            "actual-hours": null,
                            position: (selectedProject.scopeServices?.length || 0) + index + 1,
                            "service-type": service.attributes["service-type"] || "professional_services",
                            "lob-id": service.attributes["lob-id"] || 0,
                            "payment-frequency": service.attributes["payment-frequency"] || "one_time",
                            "task-source": "scopestack",
                            languages: service.attributes.languages || {},
                            "variable-rates": service.attributes["variable-rates"] || { hours: [] },
                            "calculated-pricing": {
                              service_cost: service.attributes["hourly-cost"]?.toString() || "0.0",
                              material_cost: 0,
                              extended_hours: (hoursValue * quantityValue).toString(),
                              service_revenue: service.attributes["hourly-rate"] ?
                                             (parseFloat(service.attributes["hourly-rate"].toString()) * hoursValue * quantityValue).toString() : "0.0",
                              material_revenue: 0
                            },
                            "extended-hours": (hoursValue * quantityValue).toString(),
                            "total-hours": hoursValue.toString(),
                            "external-resource-name": resourceName,
                            sku: service.attributes.sku || "",
                            "service-description": service.attributes["service-description"] || service.attributes.description || "",
                            "target-margin": service.attributes["target-margin"] || null,
                            "payment-method": service.attributes["payment-method"] || "payment_term_schedule",
                            "resource-rate-id": service.attributes["resource-rate-id"] || null,
                            "custom-hours?": service.attributes["custom-hours?"] || null,
                            "phase-name": service.attributes["phase-name"] || null,
                            "phase-id": service.relationships?.phase?.data?.id || null,
                            "phase-position": service.attributes["phase-position"] || null,
                            "subservices-data": service.attributes["subservices-data"] || [],
                            "subservices-count": service.attributes["subservices-count"] || 0
                          },
                          relationships: service.relationships || {}
                        }
                      })
                      const updatedProject = {
                        ...selectedProject,
                        scopeServices: [...(selectedProject.scopeServices || []), ...newServices]
                      }
                      onProjectUpdate(updatedProject)
                    }}
                  />
                </div>
              )}

              {/* Default/Context View */}
              {!activeSidebar && (
                <ProjectWorkspace
                  project={selectedProject}
                  onProjectUpdate={onProjectUpdate}
                />
              )}

              {/* Settings View */}
              {activeSidebar === 'settings' && (
                <SettingsPage />
              )}

              {/* Other sidebar views can be added here */}
              {activeSidebar && activeSidebar !== 'scope' && activeSidebar !== 'call-recordings' && activeSidebar !== 'overview' && activeSidebar !== 'settings' && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Target className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h2>
                    <p className="text-gray-500">
                      {activeSidebar === 'notes' && 'Notes management interface'}
                      {activeSidebar === 'boms' && 'Bill of Materials viewer'}
                      {activeSidebar === 'collaborators' && 'Team collaboration tools'}
                      {activeSidebar === 'settings' && 'Project settings'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex bg-gray-900">
              {/* Projects Navigation Panel */}
              <div className="w-80 bg-gray-900 text-white flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                  <h1 className="text-xl font-semibold mb-4">Projects</h1>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Quick Actions</h3>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      New project
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-gray-800"
                    >
                      <Filter className="w-4 h-4 mr-3" />
                      Filter projects
                    </Button>
                  </div>
                </div>

                {/* Project Lists */}
                <div className="flex-1 overflow-y-auto">
                  {/* Active Projects */}
                  <div className="p-4">
                    <button
                      onClick={() => setActiveProjectsExpanded(!activeProjectsExpanded)}
                      className="flex items-center justify-between w-full text-left mb-3 text-gray-300 hover:text-white"
                    >
                      <span className="font-medium">Active Projects</span>
                      <ChevronDown className={`w-4 h-4 transform transition-transform ${activeProjectsExpanded ? '' : '-rotate-90'}`} />
                    </button>

                    {activeProjectsExpanded && (
                      <div className="space-y-1">
                        {activeProjects.map((project) => (
                          <div
                            key={project.id}
                            onClick={() => onProjectSelect(project.id)}
                            className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-800 group"
                          >
                            <FolderOpen className="w-4 h-4 mr-3 text-gray-400 group-hover:text-white" />
                            <span className="text-sm text-gray-300 group-hover:text-white truncate">{project.name}</span>
                          </div>
                        ))}
                        {activeProjects.length === 0 && (
                          <p className="text-sm text-gray-500 pl-7">No active projects</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Draft Projects */}
                  {draftProjects.length > 0 && (
                    <div className="p-4 border-t border-gray-800">
                      <h3 className="font-medium text-gray-300 mb-3">Draft</h3>
                      <div className="space-y-1">
                        {draftProjects.map((project) => (
                          <div
                            key={project.id}
                            onClick={() => onProjectSelect(project.id)}
                            className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-800 group"
                          >
                            <FolderOpen className="w-4 h-4 mr-3 text-gray-400 group-hover:text-white" />
                            <span className="text-sm text-gray-300 group-hover:text-white truncate">{project.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Projects */}
                  {completedProjects.length > 0 && (
                    <div className="p-4 border-t border-gray-800">
                      <h3 className="font-medium text-gray-300 mb-3">Completed</h3>
                      <div className="space-y-1">
                        {completedProjects.map((project) => (
                          <div
                            key={project.id}
                            onClick={() => onProjectSelect(project.id)}
                            className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-800 group"
                          >
                            <FolderOpen className="w-4 h-4 mr-3 text-gray-400 group-hover:text-white" />
                            <span className="text-sm text-gray-300 group-hover:text-white truncate">{project.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details Preview */}
              <div className="flex-1 bg-white">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Select a Project</h2>
                    <p className="text-gray-500">Choose a project from the list to view details and start working</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call Recordings Sidebar (only one that stays as right panel) */}
        {activeSidebar === 'call-recordings' && (
          <CallRecordingsSidebar
            isOpen={true}
            onClose={() => setActiveSidebar(null)}
            onRecordingsSelect={handleCallRecordingsSelect}
            linkedRecordingIds={selectedProject?.callRecordings.filter(r => r.isLinked).map(r => r.id) || []}
          />
        )}
      </div>
    </div>
  )
}