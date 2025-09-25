"use client"

import { useState, useEffect } from "react"
import { WorkspaceLayout } from "./workspace-layout"
import { FloatingAiAssistant } from "./ui/glowing-ai-chat-assistant"
import { useLocalStorage, clearVSAData } from "../lib/use-local-storage"

// Sample data
const sampleProjects = [
  {
    id: "1",
    name: "Aldridge Infrastructure Upgrade",
    client: "Aldridge Construction",
    status: 'in-progress' as const,
    lastUpdated: new Date(2024, 8, 20),
    contextCount: { calls: 2, notes: 3, boms: 1, services: 5 },
    collaborators: ["jon@scopestack.io", "aadade@aldridge.com"],
    description: "ConnectWise PSA integration and professional services optimization",
    callRecordings: [
      {
        id: "01K5QBMK645D09WB0408W599G5",
        title: "ScopeStack<>Aldridge | Demo Request",
        date: new Date(2024, 8, 18),
        duration: 33.64 * 60,
        platform: 'fireflies' as const,
        participants: ["aadade@aldridge.com", "jon@scopestack.io"],
        summary: "Discussion about project management tooling and ConnectWise PSA integration requirements",
        isLinked: true
      }
    ],
    notes: [
      {
        id: "1",
        title: "Initial Requirements",
        content: "Client needs better project scoping process. Current ConnectWise PSA workflow takes too long and lacks consistency.",
        author: "Jon Scott",
        createdAt: new Date(2024, 8, 18),
        updatedAt: new Date(2024, 8, 19),
        tags: ["requirements", "connectwise"]
      }
    ],
    boms: [],
    serviceMappings: [
      {
        id: "1",
        serviceId: "psa-integration",
        serviceName: "PSA Integration & Configuration",
        confidence: 89,
        source: 'call' as const,
        sourceId: "01K5QBMK645D09WB0408W599G5"
      },
      {
        id: "2",
        serviceId: "process-optimization",
        serviceName: "Project Management Process Optimization",
        confidence: 76,
        source: 'note' as const,
        sourceId: "1"
      }
    ],
    scopeServices: [
      {
        id: "1",
        attributes: {
          active: true,
          name: "Email Migration Assessment",
          quantity: 1,
          "override-hours": "0.0",
          "actual-hours": null,
          position: 1,
          "service-type": "professional_services",
          "lob-id": 19723,
          "payment-frequency": "one_time",
          "task-source": "standard",
          languages: {
            out: "",
            operate: "",
            customer: "",
            assumptions: "",
            deliverables: "",
            sow_language: "",
            internal_only: "",
            design_language: "",
            planning_language: "",
            implementation_language: "",
            service_level_agreement: ""
          },
          "variable-rates": {
            hours: [
              {
                base_amount: "0.0",
                unit_amount: "0.0",
                minimum_quantity: "1.0"
              }
            ]
          },
          "calculated-pricing": {
            service_cost: "0.0",
            material_cost: 0,
            extended_hours: "0.0",
            service_revenue: "0.0",
            material_revenue: 0
          },
          "extended-hours": "0.0",
          "total-hours": "12.0",
          "external-resource-name": "Senior Migration Engineer",
          sku: "",
          "service-description": "Comprehensive assessment of current email environment",
          "target-margin": null,
          "payment-method": "payment_term_schedule",
          "resource-rate-id": null,
          "custom-hours?": null
        }
      },
      {
        id: "2",
        attributes: {
          active: true,
          name: "ConnectWise PSA Setup",
          quantity: 1,
          "override-hours": "8.0",
          "actual-hours": null,
          position: 2,
          "service-type": "professional_services",
          "lob-id": 19724,
          "payment-frequency": "one_time",
          "task-source": "standard",
          languages: {
            out: "",
            operate: "",
            customer: "",
            assumptions: "",
            deliverables: "",
            sow_language: "",
            internal_only: "",
            design_language: "",
            planning_language: "",
            implementation_language: "",
            service_level_agreement: ""
          },
          "variable-rates": {
            hours: [
              {
                base_amount: "0.0",
                unit_amount: "0.0",
                minimum_quantity: "1.0"
              }
            ]
          },
          "calculated-pricing": {
            service_cost: "0.0",
            material_cost: 0,
            extended_hours: "8.0",
            service_revenue: "0.0",
            material_revenue: 0
          },
          "extended-hours": "8.0",
          "total-hours": "8.0",
          "external-resource-name": null,
          sku: "PSA-SETUP-001",
          "service-description": "Initial configuration and setup of ConnectWise PSA",
          "target-margin": 25,
          "payment-method": "payment_term_schedule",
          "resource-rate-id": null,
          "custom-hours?": true
        }
      }
    ]
  },
  {
    id: "2",
    name: "D&H Impact Analysis",
    client: "D&H Distributing",
    status: 'draft' as const,
    lastUpdated: new Date(2024, 8, 19),
    contextCount: { calls: 1, notes: 0, boms: 0, services: 0 },
    collaborators: ["jon@scopestack.io", "scoyl@dandh.com"],
    callRecordings: [
      {
        id: "01K5QBMK60AZFA11N75J5QT42G",
        title: "ScopeStack<>D&H | Impact updates",
        date: new Date(2024, 8, 19),
        duration: 10.45 * 60,
        platform: 'fireflies' as const,
        participants: ["jon@scopestack.io", "scoyl@dandh.com"],
        isLinked: false
      }
    ],
    notes: [],
    boms: [],
    serviceMappings: [],
    scopeServices: []
  }
]

export function VSAApplication() {
  // Use localStorage for persistence with sample data as fallback
  // Projects data changes frequently (scope updates, notes, etc.) - save after 1 second
  const [projects, setProjects] = useLocalStorage('vsa-projects', sampleProjects, 1000)
  // Selected project changes less frequently - save immediately
  const [selectedProjectId, setSelectedProjectId] = useLocalStorage<string | undefined>('vsa-selected-project-id', sampleProjects[0]?.id, 100)

  // Error boundary for corrupted localStorage data
  useEffect(() => {
    try {
      // Test if dates are working properly on the first project
      if (projects.length > 0 && projects[0].lastUpdated) {
        if (typeof projects[0].lastUpdated.toLocaleDateString !== 'function') {
          console.warn('⚠️ Corrupted date data detected, clearing localStorage...')
          clearVSAData()
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('❌ Error checking data integrity:', error)
      console.warn('⚠️ Clearing corrupted localStorage data...')
      clearVSAData()
      window.location.reload()
    }
  }, []) // Only on initial mount

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null

  const handleProjectUpdate = (updatedProject: any) => {
    console.log('🔄 Project updated:', updatedProject.name)
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
  }

  const handleProjectSelect = (projectId: string) => {
    console.log('📂 Project selected:', projectId)
    setSelectedProjectId(projectId)
  }

  // Auto-save indicator effect
  useEffect(() => {
    // Log initial load
    console.log('🚀 VSA Application loaded with', projects.length, 'projects')
    if (selectedProject) {
      console.log('📌 Current project:', selectedProject.name)
    }
  }, []) // Only on initial mount

  return (
    <div className="relative">
      <WorkspaceLayout
        projects={projects}
        selectedProject={selectedProject}
        onProjectSelect={handleProjectSelect}
        onProjectUpdate={handleProjectUpdate}
      />
      <FloatingAiAssistant />
    </div>
  )
}