"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Building2
} from "lucide-react"
import { ServiceBrowser } from "./service-browser"

interface ServiceLanguages {
  out: string
  operate: string
  customer: string
  assumptions: string
  deliverables: string
  sow_language: string
  internal_only: string
  design_language: string
  planning_language: string
  implementation_language: string
  service_level_agreement: string
}

interface VariableRate {
  base_amount: string
  unit_amount: string
  minimum_quantity: string
}

interface CalculatedPricing {
  service_cost: string
  material_cost: number
  extended_hours: string
  service_revenue: string
  material_revenue: number
}

interface ScopeServiceAttributes {
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
  languages: ServiceLanguages
  "variable-rates": {
    hours: VariableRate[]
  }
  "calculated-pricing": CalculatedPricing
  "extended-hours": string
  "total-hours": string
  "external-resource-name": string | null
  sku: string
  "service-description": string
  "target-margin": number | null
  "payment-method": string
  "resource-rate-id": number | null
  "custom-hours?": boolean | null
  "phase-name"?: string
  "phase-id"?: string
  "phase-position"?: number
  "subservices-data"?: any[]
  "subservices-count"?: number
}

interface ScopeService {
  id: string
  attributes: ScopeServiceAttributes
  relationships?: any
}

interface ScopeTableProps {
  services: ScopeService[]
  onServiceUpdate: (serviceId: string, updates: Partial<ScopeServiceAttributes>) => void
  onServiceDelete: (serviceId: string) => void
  onServiceAdd: () => void
  onServicesAdd?: (services: any[]) => void
}

interface ColumnConfig {
  key: string
  label: string
  visible: boolean
  sortable: boolean
  editable: boolean
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'name', label: 'Service Name', visible: true, sortable: true, editable: true },
  { key: 'quantity', label: 'Qty', visible: true, sortable: true, editable: true },
  { key: 'total-hours', label: 'Hours', visible: true, sortable: true, editable: false },
  { key: 'external-resource-name', label: 'Resource', visible: true, sortable: false, editable: false },
]

const ADDITIONAL_COLUMNS: ColumnConfig[] = [
  { key: 'service-type', label: 'Type', visible: false, sortable: true, editable: false },
  { key: 'sku', label: 'SKU', visible: false, sortable: true, editable: true },
  { key: 'target-margin', label: 'Margin', visible: false, sortable: true, editable: true },
  { key: 'payment-frequency', label: 'Payment', visible: false, sortable: true, editable: false },
  { key: 'service-description', label: 'Description', visible: false, sortable: false, editable: true },
  { key: 'position', label: 'Position', visible: false, sortable: true, editable: true },
  { key: 'phase-name', label: 'Phase', visible: false, sortable: true, editable: false },
  { key: 'lob-id', label: 'LOB ID', visible: false, sortable: true, editable: false },
  { key: 'active', label: 'Active', visible: false, sortable: true, editable: true },
  { key: 'override-hours', label: 'Override Hours', visible: false, sortable: true, editable: true },
  { key: 'extended-hours', label: 'Extended Hours', visible: false, sortable: true, editable: false },
]

// Helper function to get nested values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export function ScopeTable({
  services,
  onServiceUpdate,
  onServiceDelete,
  onServiceAdd,
  onServicesAdd
}: ScopeTableProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>([
    ...DEFAULT_COLUMNS,
    ...ADDITIONAL_COLUMNS
  ])
  const [sortField, setSortField] = useState<string>('phase-position')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [editingCell, setEditingCell] = useState<{serviceId: string, field: string} | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [showServiceBrowser, setShowServiceBrowser] = useState(false)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())

  const visibleColumns = columns.filter(col => col.visible)

  const getColumnWidth = (columnKey: string) => {
    switch (columnKey) {
      case 'name': return 'w-1/2'
      case 'quantity': return 'w-20'
      case 'total-hours': return 'w-24'
      case 'external-resource-name': return 'w-32'
      default: return ''
    }
  }

  const toggleColumn = (columnKey: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === columnKey
          ? { ...col, visible: !col.visible }
          : col
      )
    )
  }

  const togglePhaseExpansion = (phaseKey: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev)
      if (newSet.has(phaseKey)) {
        newSet.delete(phaseKey)
      } else {
        newSet.add(phaseKey)
      }
      return newSet
    })
  }

  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId)
      } else {
        newSet.add(serviceId)
      }
      return newSet
    })
  }

  // Group services by phase
  const servicesByPhase = services.reduce((acc, service) => {
    const phaseName = service.attributes["phase-name"] || "No Phase"
    const phaseId = service.attributes["phase-id"] || "no-phase"
    const phasePosition = service.attributes["phase-position"] || 999

    if (!acc[phaseId]) {
      acc[phaseId] = {
        name: phaseName,
        position: phasePosition,
        services: []
      }
    }

    acc[phaseId].services.push(service)

    return acc
  }, {} as Record<string, { name: string; position: number; services: ScopeService[] }>)

  // Sort phases by position
  const sortedPhases = Object.entries(servicesByPhase)
    .sort(([, a], [, b]) => a.position - b.position)

  const getCellValue = (service: ScopeService, columnKey: string): string => {
    // Special handling for phase-name column
    if (columnKey === 'phase-name') {
      // First try the attribute-based phase name
      if (service.attributes["phase-name"]) {
        return service.attributes["phase-name"]
      }

      // If no direct phase name, show position or indication it has no phase
      if (service.attributes.position) {
        return `Phase ${service.attributes.position}`
      }

      return '-'
    }

    const value = getNestedValue(service.attributes, columnKey)

    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') return value.toString()

    return value
  }

  const startEdit = (serviceId: string, field: string, currentValue: string) => {
    setEditingCell({ serviceId, field })
    setEditValue(currentValue)
  }

  const saveEdit = () => {
    if (!editingCell) return

    const { serviceId, field } = editingCell
    let processedValue: any = editValue

    // Type conversion based on field
    if (field === 'quantity' || field === 'position') {
      processedValue = parseInt(editValue) || 0
    } else if (field === 'active') {
      processedValue = editValue.toLowerCase() === 'yes' || editValue.toLowerCase() === 'true'
    } else if (field.includes('hours') || field.includes('margin')) {
      processedValue = parseFloat(editValue) || 0
    }

    onServiceUpdate(serviceId, { [field]: processedValue })
    setEditingCell(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleServicesAdd = (selectedServices: any[]) => {
    if (onServicesAdd) {
      onServicesAdd(selectedServices)
    }
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Project Scope</h2>
          <Badge variant="secondary">
            {services.length} services
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onServiceAdd} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>

          {onServicesAdd && (
            <Button onClick={() => setShowServiceBrowser(true)} size="sm">
              <Building2 className="w-4 h-4 mr-2" />
              Browse Services
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={column.visible}
                  onCheckedChange={() => toggleColumn(column.key)}
                  disabled={column.key === 'name'} // Name is always required
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={columns.every(c => c.visible || c.key === 'name')}
                onCheckedChange={(checked) => {
                  setColumns(prev => prev.map(col => ({ ...col, visible: checked || col.key === 'name' })))
                }}
              >
                Show All
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Services Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <Table className="w-full [&_td]:text-left [&_th]:text-left">
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead key={column.key} className={`font-medium text-left ${getColumnWidth(column.key)}`}>
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPhases.map(([phaseKey, phase]) => {
              const isPhaseExpanded = expandedPhases.has(phaseKey)

              return (
                <React.Fragment key={phaseKey}>
                  {/* Phase Row */}
                  <TableRow className="bg-blue-50 font-semibold">
                    {visibleColumns.map((column, columnIndex) => (
                      <TableCell key={column.key} className={getColumnWidth(column.key)}>
                        {columnIndex === 0 ? (
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 mr-2"
                              onClick={() => togglePhaseExpansion(phaseKey)}
                            >
                              {isPhaseExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <span>{phase.name}</span>
                          </div>
                        ) : column.key === 'quantity' ? (
                          <span>{phase.services.reduce((sum, s) => sum + (s.attributes.quantity || 1), 0)}</span>
                        ) : column.key === 'total-hours' ? (
                          <span>{phase.services.reduce((sum, s) => sum + parseFloat(s.attributes["total-hours"] || '0'), 0).toFixed(1)}</span>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell></TableCell>
                  </TableRow>

                  {/* Services in this phase */}
                  {isPhaseExpanded && phase.services.map((service) => {
                    const isServiceExpanded = expandedServices.has(service.id)
                    const hasSubservices = service.attributes["subservices-data"] &&
                                          service.attributes["subservices-data"].length > 0

                    return (
                      <React.Fragment key={service.id}>
                        {/* Service Row */}
                        <TableRow>
                          {visibleColumns.map((column, columnIndex) => {
                            const cellValue = getCellValue(service, column.key)
                            const isEditing = editingCell?.serviceId === service.id && editingCell?.field === column.key
                            const showExpandButton = columnIndex === 0 && hasSubservices

                            return (
                              <TableCell key={column.key} className={getColumnWidth(column.key)}>
                                {columnIndex === 0 ? (
                                  <div className="flex items-center ml-8">
                                    <div className="w-6 h-6 mr-2 flex items-center justify-center">
                                      {showExpandButton && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={() => toggleServiceExpansion(service.id)}
                                        >
                                          {isServiceExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                    {isEditing ? (
                                      <Input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={saveEdit}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') saveEdit()
                                          if (e.key === 'Escape') cancelEdit()
                                        }}
                                        className="h-8 flex-1"
                                        autoFocus
                                      />
                                    ) : (
                                      <div
                                        className={`flex-1 ${column.editable ? 'cursor-pointer hover:bg-gray-50 rounded px-2 py-1' : ''}`}
                                        onClick={() => column.editable ? startEdit(service.id, column.key, cellValue) : undefined}
                                      >
                                        {cellValue}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  isEditing ? (
                                    <Input
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onBlur={saveEdit}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEdit()
                                        if (e.key === 'Escape') cancelEdit()
                                      }}
                                      className="h-8"
                                      autoFocus
                                    />
                                  ) : (
                                    <div
                                      className={`${column.editable ? 'cursor-pointer hover:bg-gray-50 rounded px-2 py-1' : ''}`}
                                      onClick={() => column.editable ? startEdit(service.id, column.key, cellValue) : undefined}
                                    >
                                      {column.key === 'active' && typeof service.attributes.active === 'boolean' ? (
                                        <Badge variant={service.attributes.active ? "default" : "secondary"}>
                                          {service.attributes.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                      ) : column.key === 'service-type' ? (
                                        <Badge variant="outline">
                                          {cellValue.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Badge>
                                      ) : (
                                        <span className={cellValue === '-' ? 'text-gray-400' : ''}>{cellValue}</span>
                                      )}
                                    </div>
                                  )
                                )}
                              </TableCell>
                            )
                          })}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <button
                                  className="flex items-center w-full px-2 py-1 text-sm hover:bg-gray-100 rounded"
                                  onClick={() => startEdit(service.id, 'name', service.attributes.name)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </button>
                                <button
                                  className="flex items-center w-full px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                                  onClick={() => onServiceDelete(service.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </button>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>

                        {/* Subservices under this service */}
                        {isServiceExpanded && hasSubservices && service.attributes["subservices-data"].map((subservice: any, subIndex: number) => (
                          <TableRow key={`${service.id}-sub-${subIndex}`} className="bg-gray-50">
                            {visibleColumns.map((column, columnIndex) => (
                              <TableCell key={column.key} className={`py-2 ${getColumnWidth(column.key)}`}>
                                {columnIndex === 0 ? (
                                  <div className="flex items-center pl-16">
                                    <div className="w-0.5 h-4 bg-gray-300 mr-3"></div>
                                    <span className="text-sm text-gray-600">{subservice.name || 'Unnamed Subservice'}</span>
                                  </div>
                                ) : column.key === 'quantity' ? (
                                  <span className="text-sm text-gray-600">{subservice.quantity || 1}</span>
                                ) : column.key === 'total-hours' || column.key === 'override-hours' ? (
                                  <span className="text-sm text-gray-600">{subservice['suggested-hours'] || '0.0'}</span>
                                ) : column.key === 'service-description' ? (
                                  <span className="text-sm text-gray-500">{subservice.description || subservice['service-description'] || '-'}</span>
                                ) : column.key === 'active' ? (
                                  <Badge variant={subservice.active ? "default" : "secondary"} className="text-xs">
                                    {subservice.active ? 'Active' : 'Inactive'}
                                  </Badge>
                                ) : column.key === 'external-resource-name' ? (
                                  <span className="text-sm text-gray-600">{subservice['external-resource-name'] || '-'}</span>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </TableCell>
                            ))}
                            <TableCell>
                              {/* Empty cell for actions column */}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    )
                  })}
                </React.Fragment>
              )
            })}
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="text-center py-8 text-gray-500">
                  No services added yet.
                  <br />
                  <Button variant="link" onClick={onServiceAdd} className="mt-2">
                    Add your first service
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Service Browser Dialog */}
      {onServicesAdd && (
        <ServiceBrowser
          open={showServiceBrowser}
          onOpenChange={setShowServiceBrowser}
          onServicesSelect={handleServicesAdd}
          excludeServiceIds={services.map(s => s.id)}
        />
      )}
    </div>
  )
}