"use client"

import { useState, useEffect } from "react"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Edit3,
  Check,
  X,
  Phone,
  FileText,
  Building2,
  Calendar,
  Users,
  Sparkles
} from "lucide-react"

interface ProjectOverviewProps {
  project: any
  onProjectUpdate: (project: any) => void
}

function generateProjectSummary(project: any): string {
  const callsCount = project.callRecordings?.length || 0
  const servicesCount = project.scopeServices?.length || 0
  const notesCount = project.notes?.length || 0

  // Extract key information from call recordings
  const recentCalls = project.callRecordings?.slice(0, 2) || []
  const callSummaries = recentCalls.map(call => call.summary).filter(Boolean)

  // Generate summary based on available data
  let summary = `This is a ${project.status} project for ${project.client}.`

  if (callsCount > 0) {
    summary += ` Based on ${callsCount} call recording${callsCount !== 1 ? 's' : ''}, `

    if (callSummaries.length > 0) {
      const firstCallSummary = callSummaries[0]
      if (firstCallSummary.includes('ConnectWise')) {
        summary += `the project focuses on ConnectWise PSA integration and process optimization. `
      } else if (firstCallSummary.includes('infrastructure')) {
        summary += `the project involves infrastructure upgrades and improvements. `
      } else {
        summary += `key discussions have centered around project requirements and technical implementation. `
      }
    }
  }

  if (servicesCount > 0) {
    summary += `The current scope includes ${servicesCount} service${servicesCount !== 1 ? 's' : ''}, covering various aspects of the implementation. `
  }

  if (notesCount > 0) {
    summary += `Additional context is captured in ${notesCount} project note${notesCount !== 1 ? 's' : ''}. `
  }

  // Add recommendations based on project status
  if (project.status === 'draft') {
    summary += `\n\nRecommendations: Finalize scope requirements, schedule stakeholder review calls, and prepare detailed technical specifications.`
  } else if (project.status === 'in-progress') {
    summary += `\n\nNext steps: Continue implementation activities, maintain regular client communication, and track progress against milestones.`
  }

  return summary
}

export function ProjectOverview({ project, onProjectUpdate }: ProjectOverviewProps) {
  const { generateAIContent, isAIConfigured } = useSettings()
  const [editingName, setEditingName] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [tempName, setTempName] = useState(project.name)
  const [tempDescription, setTempDescription] = useState(project.description || '')
  const [aiSummary, setAiSummary] = useState<string>('')
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const handleNameSave = () => {
    onProjectUpdate({ ...project, name: tempName })
    setEditingName(false)
  }

  const handleNameCancel = () => {
    setTempName(project.name)
    setEditingName(false)
  }

  const handleDescriptionSave = () => {
    onProjectUpdate({ ...project, description: tempDescription })
    setEditingDescription(false)
  }

  const handleDescriptionCancel = () => {
    setTempDescription(project.description || '')
    setEditingDescription(false)
  }

  // Generate AI summary when project changes or on mount
  useEffect(() => {
    const generateSummary = async () => {
      if (!isAIConfigured) {
        setAiSummary(generateProjectSummary(project))
        return
      }

      setIsGeneratingSummary(true)
      try {
        const variables = {
          callRecordings: project.callRecordings || [],
          scopeServices: project.scopeServices || [],
          notes: project.notes || [],
          status: project.status,
          client: project.client
        }

        const generatedSummary = await generateAIContent('summary', variables)
        setAiSummary(generatedSummary)
      } catch (error) {
        console.error('Failed to generate AI summary:', error)
        // Fallback to static summary
        setAiSummary(generateProjectSummary(project))
      } finally {
        setIsGeneratingSummary(false)
      }
    }

    generateSummary()
  }, [project, isAIConfigured, generateAIContent])

  const regenerateSummary = async () => {
    if (!isAIConfigured) return

    setIsGeneratingSummary(true)
    try {
      const variables = {
        callRecordings: project.callRecordings || [],
        scopeServices: project.scopeServices || [],
        notes: project.notes || [],
        status: project.status,
        client: project.client
      }

      const generatedSummary = await generateAIContent('summary', variables)
      setAiSummary(generatedSummary)
    } catch (error) {
      console.error('Failed to regenerate AI summary:', error)
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Overview</h1>
        <Badge variant="outline" className="capitalize">
          {project.status.replace('-', ' ')}
        </Badge>
      </div>

      {/* Project Name */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Project Name</CardTitle>
            {!editingName && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingName(true)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingName ? (
            <div className="space-y-3">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter project name..."
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleNameSave}>
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleNameCancel}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-lg font-semibold">{project.name}</div>
          )}
        </CardContent>
      </Card>

      {/* Project Description */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Description</CardTitle>
            {!editingDescription && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingDescription(true)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingDescription ? (
            <div className="space-y-3">
              <Textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                placeholder="Enter project description..."
                rows={4}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleDescriptionSave}>
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleDescriptionCancel}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-gray-700">
              {project.description || (
                <span className="text-gray-400 italic">No description provided</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                {isAIConfigured ? 'AI Project Summary' : 'Project Summary'}
              </CardTitle>
              <CardDescription>
                {isAIConfigured
                  ? 'AI-generated summary based on calls, scope, and notes'
                  : 'Basic summary based on project data'
                }
              </CardDescription>
            </div>
            {isAIConfigured && (
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateSummary}
                disabled={isGeneratingSummary}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {isGeneratingSummary ? 'Generating...' : 'Regenerate'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isGeneratingSummary ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-600">Generating AI summary...</span>
            </div>
          ) : (
            <div className="prose prose-sm text-gray-700 whitespace-pre-line">
              {aiSummary}
            </div>
          )}
          {!isAIConfigured && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Configure OpenRouter API in Settings to enable AI-powered summaries
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Phone className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{project.contextCount.calls}</div>
              <div className="text-sm text-gray-600">Call Recordings</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{project.contextCount.services}</div>
              <div className="text-sm text-gray-600">Services in Scope</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <FileText className="w-8 h-8 text-orange-500" />
            <div>
              <div className="text-2xl font-bold">{project.contextCount.notes}</div>
              <div className="text-sm text-gray-600">Project Notes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Client</div>
              <div className="text-base">{project.client}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Last Updated</div>
              <div className="text-base">{project.lastUpdated.toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <Badge variant="outline" className="capitalize">
                {project.status.replace('-', ' ')}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Collaborators</div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-base">{project.collaborators.length} member{project.collaborators.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {project.collaborators.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Team Members</div>
              <div className="flex flex-wrap gap-2">
                {project.collaborators.map((collaborator, index) => (
                  <Badge key={index} variant="secondary">
                    {collaborator}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}