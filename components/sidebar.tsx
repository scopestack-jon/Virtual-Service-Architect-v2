"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FolderOpen,
  Settings,
  Phone,
  Target,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
  ChevronDown,
  ChevronRight as ChevronRightSmall,
  StickyNote,
  FileSpreadsheet,
  Crosshair,
  FileText
} from "lucide-react"

export type SidebarType =
  | 'overview'
  | 'scope'
  | 'call-recordings'
  | 'notes'
  | 'boms'
  | 'collaborators'
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
}

interface SidebarProps {
  selectedProject: Project | null
  activeSidebar: SidebarType
  onSidebarToggle: (sidebar: SidebarType) => void
  onProjectDeselect: () => void
}

export function Sidebar({
  selectedProject,
  activeSidebar,
  onSidebarToggle,
  onProjectDeselect
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const sidebarItems = selectedProject ? [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: FileText,
      active: activeSidebar === 'overview'
    },
    {
      id: 'scope' as const,
      label: 'Scope',
      icon: Crosshair,
      active: activeSidebar === 'scope'
    },
    {
      id: 'call-recordings' as const,
      label: 'Call Recordings',
      icon: Phone,
      badge: selectedProject.contextCount.calls.toString(),
      active: activeSidebar === 'call-recordings'
    },
    {
      id: 'notes' as const,
      label: 'Notes',
      icon: StickyNote,
      badge: selectedProject.contextCount.notes.toString(),
      active: activeSidebar === 'notes'
    },
    {
      id: 'boms' as const,
      label: 'Bill of Materials',
      icon: FileSpreadsheet,
      badge: selectedProject.contextCount.boms.toString(),
      active: activeSidebar === 'boms'
    },
    {
      id: 'collaborators' as const,
      label: 'Collaborators',
      icon: Users,
      badge: selectedProject.collaborators.length.toString(),
      active: activeSidebar === 'collaborators'
    }
  ] : []

  return (
    <div className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            <h1 className="text-lg font-semibold">VSA</h1>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Current Project */}
      {!isCollapsed && selectedProject && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400">Current Project</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onProjectDeselect}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              title="Switch Project"
            >
              <FolderOpen className="w-3 h-3" />
            </Button>
          </div>
          <div className="text-sm font-medium truncate">{selectedProject.name}</div>
          <div className="text-xs text-gray-400 truncate">{selectedProject.client}</div>
          <Badge
            variant="secondary"
            className="mt-1 text-xs bg-gray-700 text-gray-300"
          >
            {selectedProject.status}
          </Badge>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-2">
        {selectedProject ? (
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon

              return (
                <Button
                  key={item.id}
                  variant={item.active ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onSidebarToggle(item.id)}
                  className={`w-full justify-start gap-3 text-left ${
                    item.active
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  } ${isCollapsed ? 'px-2' : 'px-3'}`}
                >
                  <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-600 text-gray-200"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              )
            })}
          </div>
        ) : (
          !isCollapsed && (
            <div className="text-center py-8">
              <FolderOpen className="w-8 h-8 mx-auto mb-3 text-gray-600" />
              <p className="text-sm text-gray-500">Select a project to view navigation</p>
            </div>
          )
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="mt-auto">
        {/* Settings */}
        <div className="p-2">
          <Button
            variant={activeSidebar === 'settings' ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSidebarToggle('settings')}
            className={`w-full justify-start gap-3 text-left ${
              activeSidebar === 'settings'
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            } ${isCollapsed ? 'px-2' : 'px-3'}`}
          >
            <Settings className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
            {!isCollapsed && <span>Settings</span>}
          </Button>
        </div>

        {/* User Context */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                JS
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">Jon Scott</div>
                <div className="text-xs text-gray-400 truncate">jon@scopestack.io</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}