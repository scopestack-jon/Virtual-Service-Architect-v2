"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Phone,
  StickyNote,
  FileSpreadsheet,
  Target,
  Plus,
  Upload,
  Link,
  MessageSquare,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  FileText,
  Download
} from "lucide-react"
import { CallRecordingsBrowser } from "./call-recordings-browser"
import { ScopeTable } from "./scope-table"

interface CallRecording {
  id: string
  title: string
  date: Date
  duration: number
  platform: 'fireflies' | 'teams' | 'webex'
  participants: string[]
  summary?: string
  isLinked: boolean
}

interface Note {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface BOM {
  id: string
  name: string
  fileName: string
  uploadedAt: Date
  itemCount: number
  isProcessed: boolean
}

interface ServiceMapping {
  id: string
  serviceId: string
  serviceName: string
  confidence: number
  source: 'call' | 'note' | 'bom' | 'manual'
  sourceId?: string
}

interface ScopeService {
  id: string
  attributes: {
    active: boolean
    name: string
    quantity: number
    "override-hours": string
    "actual-hours": string | null
    position: number
    "service-type": string
    "lob-id": number
    "payment-frequency": string
    "task-source": string
    languages: any
    "variable-rates": any
    "calculated-pricing": any
    "extended-hours": string
    "total-hours": string
    "external-resource-name": string | null
    sku: string
    "service-description": string
    "target-margin": number | null
    "payment-method": string
    "resource-rate-id": number | null
    "custom-hours?": boolean | null
  }
}

interface Project {
  id: string
  name: string
  client: string
  description?: string
  status: 'draft' | 'in-progress' | 'review' | 'completed'
  callRecordings: CallRecording[]
  notes: Note[]
  boms: BOM[]
  serviceMappings: ServiceMapping[]
  scopeServices: ScopeService[]
}

interface ProjectWorkspaceProps {
  project: Project
  onProjectUpdate: (project: Project) => void
}

export function ProjectWorkspace({ project, onProjectUpdate }: ProjectWorkspaceProps) {
  const [showCallBrowser, setShowCallBrowser] = useState(false)

  const handleLinkCallRecording = (callId: string) => {
    const updatedProject = {
      ...project,
      callRecordings: project.callRecordings.map(call =>
        call.id === callId ? { ...call, isLinked: !call.isLinked } : call
      )
    }
    onProjectUpdate(updatedProject)
  }

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      author: "Current User",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    }

    const updatedProject = {
      ...project,
      notes: [...project.notes, newNote]
    }
    onProjectUpdate(updatedProject)
  }

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    const updatedProject = {
      ...project,
      notes: project.notes.map(note =>
        note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note
      )
    }
    onProjectUpdate(updatedProject)
  }

  const handleCallRecordingsSelect = (selectedRecordings: CallRecording[]) => {
    // Add selected recordings to project, marking them as linked
    const newRecordings = selectedRecordings.map(recording => ({
      ...recording,
      isLinked: true
    }))

    const updatedProject = {
      ...project,
      callRecordings: [
        ...project.callRecordings.filter(existing =>
          !selectedRecordings.some(selected => selected.id === existing.id)
        ),
        ...newRecordings
      ]
    }
    onProjectUpdate(updatedProject)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Project Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.client}</p>
            {project.description && (
              <p className="text-sm text-gray-500 mt-2">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
              {project.status === 'draft' && <Clock className="w-3 h-3 mr-1" />}
              {project.status === 'in-progress' && <AlertCircle className="w-3 h-3 mr-1" />}
              {project.status === 'review' && <MessageSquare className="w-3 h-3 mr-1" />}
              {project.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
              {project.status}
            </Badge>
            <Button size="sm">
              <Users className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Context Overview */}
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{project.callRecordings.filter(c => c.isLinked).length}/{project.callRecordings.length} calls linked</span>
          </div>
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            <span>{project.notes.length} notes</span>
          </div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            <span>{project.boms.length} BOMs</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>{project.serviceMappings.length} services mapped</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Call Recordings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Call Recordings
                      </CardTitle>
                      <CardDescription>Link relevant call recordings to this project</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowCallBrowser(true)}>
                      <Link className="w-4 h-4 mr-2" />
                      Browse Calls
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.callRecordings.map((call) => (
                      <div
                        key={call.id}
                        className={`p-3 border rounded-lg ${
                          call.isLinked ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{call.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>{call.date.toLocaleDateString()}</span>
                              <span>{Math.floor(call.duration / 60)} mins</span>
                              <Badge variant="outline" className="text-xs">
                                {call.platform}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {call.participants.slice(0, 2).join(', ')}
                              {call.participants.length > 2 && ` +${call.participants.length - 2} more`}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={call.isLinked ? "default" : "outline"}
                            onClick={() => handleLinkCallRecording(call.id)}
                          >
                            {call.isLinked ? 'Linked' : 'Link'}
                          </Button>
                        </div>
                        {call.summary && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{call.summary}</p>
                        )}
                      </div>
                    ))}
                    {project.callRecordings.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <Phone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No call recordings available</p>
                        <p className="text-xs">Configure integrations to see calls</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <StickyNote className="w-5 h-5" />
                        Project Notes
                      </CardTitle>
                      <CardDescription>Collaborative notes and observations</CardDescription>
                    </div>
                    <Button size="sm" onClick={addNote}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {project.notes.map((note) => (
                      <div key={note.id} className="p-3 border border-gray-200 rounded-lg">
                        <Input
                          value={note.title}
                          onChange={(e) => updateNote(note.id, { title: e.target.value })}
                          className="border-0 p-0 font-medium text-sm focus:ring-0"
                          placeholder="Note title..."
                        />
                        <Textarea
                          value={note.content}
                          onChange={(e) => updateNote(note.id, { content: e.target.value })}
                          className="border-0 p-0 mt-2 text-sm resize-none focus:ring-0"
                          placeholder="Add your notes here..."
                          rows={3}
                        />
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{note.author}</span>
                          <span>{note.updatedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {project.notes.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <StickyNote className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No notes yet</p>
                        <p className="text-xs">Add notes to capture important details</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* BOMs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5" />
                        Bill of Materials
                      </CardTitle>
                      <CardDescription>Upload CSV/Excel files with equipment lists</CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload BOM
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.boms.map((bom) => (
                      <div key={bom.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{bom.name}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>{bom.fileName}</span>
                              <span>{bom.itemCount} items</span>
                              <span>{bom.uploadedAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={bom.isProcessed ? "default" : "secondary"}>
                              {bom.isProcessed ? "Processed" : "Processing"}
                            </Badge>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {project.boms.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No BOMs uploaded</p>
                        <p className="text-xs">Upload equipment lists to enhance scoping</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Service Mappings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Mapped Services
                      </CardTitle>
                      <CardDescription>ScopeStack services identified from context</CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                      <Building2 className="w-4 h-4 mr-2" />
                      Browse Services
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.serviceMappings.map((mapping) => (
                      <div key={mapping.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{mapping.serviceName}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>Confidence: {Math.round(mapping.confidence)}%</span>
                              <Badge variant="outline" className="text-xs">
                                {mapping.source}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                    {project.serviceMappings.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No services mapped yet</p>
                        <p className="text-xs">Link context to identify services</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
      </div>

      {/* Call Recordings Browser Dialog */}
      <CallRecordingsBrowser
        open={showCallBrowser}
        onOpenChange={setShowCallBrowser}
        onRecordingsSelect={handleCallRecordingsSelect}
        linkedRecordingIds={project.callRecordings.filter(r => r.isLinked).map(r => r.id)}
      />
    </div>
  )
}