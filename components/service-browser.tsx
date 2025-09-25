"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Building2,
  Plus,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { scopeStackApi } from "@/lib/scopestack-api"

interface ProjectService {
  id: string
  type: string
  attributes: {
    name: string
    description?: string
    category?: string
    keywords?: string[]
    estimatedHours?: number
    complexity?: "Low" | "Medium" | "High"
    phases?: string[]
    deliverables?: string[]
    active?: boolean
    hours?: number
    "estimated-hours"?: number
    "total-hours"?: string
    "resource-name"?: string
    "external-resource-name"?: string
    "service-category"?: string
    "lob-name"?: string
    "lob-id"?: number
    "phase-name"?: string
    "phase-names"?: string[]
    "hourly-rate"?: number
    "hourly-cost"?: number
    "service-description"?: string
    quantity?: number
    "variable-rates"?: any
    "payment-frequency"?: string
    "payment-method"?: string
    "target-margin"?: number
    "resource-rate-id"?: number
    "subservices-data"?: Array<{
      id: string
      name: string
      description: string
    }>
    "subservices-count"?: number
  }
  relationships?: {
    phase?: {
      data?: {
        type: string
        id: string
      }
    }
    resource?: {
      data?: {
        type: string
        id: string
      }
    }
    "service-category"?: {
      data?: {
        type: string
        id: string
      }
    }
    subservices?: {
      data?: Array<{
        type: string
        id: string
      }>
    }
  }
}

interface ServiceBrowserProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onServicesSelect: (services: ProjectService[]) => void
  excludeServiceIds?: string[]
}

export function ServiceBrowser({
  open,
  onOpenChange,
  onServicesSelect,
  excludeServiceIds = []
}: ServiceBrowserProps) {
  const [services, setServices] = useState<ProjectService[]>([])
  const [lineOfBusinesses, setLineOfBusinesses] = useState<any[]>([])
  const [phases, setPhases] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [serviceCategories, setServiceCategories] = useState<any[]>([])
  const [subservices, setSubservices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 ServiceBrowser: Fetching services, line of businesses, phases, and service categories...')

      // Fetch services, lines of business, phases, service categories, resources, and subservices in parallel
      const [servicesResult, lobResult, phasesResult, serviceCategoriesResult, resourcesResult, subservicesResult] = await Promise.all([
        scopeStackApi.getProjectServices(),
        scopeStackApi.getLineOfBusinesses(),
        scopeStackApi.getPhases(),
        scopeStackApi.getServiceCategories(),
        scopeStackApi.getResources(),
        scopeStackApi.getSubservices()
      ])

      if (servicesResult.success && servicesResult.data) {
        console.log(`✅ ServiceBrowser: Loaded ${servicesResult.data.length} services`)
        console.log('📊 ServiceBrowser: Sample service data:', servicesResult.data[0])

        // Log services with resource relationships (for debugging)
        const servicesWithResources = servicesResult.data.filter(s => s.relationships?.resource?.data?.id)
        console.log(`🔗 ServiceBrowser: ${servicesWithResources.length} services have resource relationships`)

        setServices(servicesResult.data)

        // Extract included resources from the API response
        if (servicesResult.data.included) {
          const includedResources = servicesResult.data.included
          console.log(`📦 ServiceBrowser: Processing ${includedResources.length} included resources`)

          // Separate included resources by type
          const resourcesData = includedResources.filter((item: any) => item.type === 'resources')
          const serviceCategoriesData = includedResources.filter((item: any) => item.type === 'service-categories')
          const phasesData = includedResources.filter((item: any) => item.type === 'phases')

          if (resourcesData.length > 0) {
            setResources(resourcesData)
            console.log(`📊 ServiceBrowser: Loaded ${resourcesData.length} resources from included data`)
          }

          if (serviceCategoriesData.length > 0) {
            setServiceCategories(serviceCategoriesData)
            console.log(`📊 ServiceBrowser: Loaded ${serviceCategoriesData.length} service categories from included data`)
          }

          if (phasesData.length > 0) {
            setPhases(prev => [...prev, ...phasesData])
            console.log(`📊 ServiceBrowser: Added ${phasesData.length} phases from included data`)
          }
        }
      } else {
        console.error('❌ ServiceBrowser: Failed to fetch services:', servicesResult.error)
        setError(servicesResult.error || 'Failed to fetch services')
      }

      if (lobResult.success && lobResult.data) {
        console.log(`✅ ServiceBrowser: Loaded ${lobResult.data.length} lines of business`)
        console.log('📊 ServiceBrowser: Sample LOB data:', lobResult.data[0])
        setLineOfBusinesses(lobResult.data)
      } else {
        console.warn('⚠️ ServiceBrowser: Failed to fetch lines of business:', lobResult.error)
        // Don't fail the entire operation if LOB fetch fails
      }

      if (phasesResult.success && phasesResult.data) {
        console.log(`✅ ServiceBrowser: Loaded ${phasesResult.data.length} phases`)
        console.log('📊 ServiceBrowser: Sample phases data:', phasesResult.data[0])
        setPhases(phasesResult.data)
      } else {
        console.warn('⚠️ ServiceBrowser: Failed to fetch phases:', phasesResult.error)
        // Don't fail the entire operation if phases fetch fails
      }

      if (serviceCategoriesResult.success && serviceCategoriesResult.data) {
        console.log(`✅ ServiceBrowser: Loaded ${serviceCategoriesResult.data.length} service categories from API`)
        console.log('📊 ServiceBrowser: Sample service category data:', serviceCategoriesResult.data[0])
        setServiceCategories(serviceCategoriesResult.data)
      } else {
        console.warn('⚠️ ServiceBrowser: Failed to fetch service categories:', serviceCategoriesResult.error)
        // Don't fail the entire operation if service categories fetch fails
      }

      if (resourcesResult.success && resourcesResult.data) {
        console.log(`✅ ServiceBrowser: Loaded ${resourcesResult.data.length} resources from API`)
        console.log('📊 ServiceBrowser: Sample resource data:', resourcesResult.data[0])
        // Resource data loaded successfully
        setResources(resourcesResult.data)
      } else {
        console.warn('⚠️ ServiceBrowser: Failed to fetch resources:', resourcesResult.error)
        // Don't fail the entire operation if resources fetch fails
      }

      if (subservicesResult.success && subservicesResult.data) {
        console.log(`✅ ServiceBrowser: Loaded ${subservicesResult.data.length} subservices from API`)
        console.log('📊 ServiceBrowser: Sample subservice data:', subservicesResult.data[0])
        setSubservices(subservicesResult.data)
      } else {
        console.warn('⚠️ ServiceBrowser: Failed to fetch subservices:', subservicesResult.error)
        // Don't fail the entire operation if subservices fetch fails
      }
    } catch (err) {
      console.error('❌ ServiceBrowser: Error fetching data:', err)
      setError('Network error while fetching data')
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service => {
    if (excludeServiceIds.includes(service.id)) return false

    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    const name = service.attributes.name?.toLowerCase() || ''
    const category = service.attributes.category?.toLowerCase() || ''
    const keywords = service.attributes.keywords?.join(' ').toLowerCase() || ''

    return name.includes(query) ||
           category.includes(query) ||
           keywords.includes(query)
  })

  const toggleServiceSelection = (serviceId: string) => {
    const newSelection = new Set(selectedServices)
    if (newSelection.has(serviceId)) {
      newSelection.delete(serviceId)
    } else {
      newSelection.add(serviceId)
    }
    setSelectedServices(newSelection)
  }

  const handleAddServices = () => {
    const servicesToAdd = services.filter(service =>
      selectedServices.has(service.id)
    ).map(service => {
      // Enrich service with resource pricing data and phase information
      const resourceId = service.relationships?.resource?.data?.id
      const resourceData = resourceId ? getResourceData(resourceId) : null

      const phaseId = service.relationships?.phase?.data?.id
      const phaseData = phaseId ? getPhaseData(phaseId) : null

      // Resource data enrichment complete

      return {
        ...service,
        attributes: {
          ...service.attributes,
          "hourly-rate": resourceData?.hourlyRate || service.attributes["hourly-rate"],
          "hourly-cost": resourceData?.hourlyCost || service.attributes["hourly-cost"],
          "phase-name": phaseData?.name || service.attributes["phase-name"],
          "phase-position": phaseData?.position || null,
          // Add resource name from relationship data
          "external-resource-name": resourceData?.name || service.attributes["external-resource-name"] || service.attributes["resource-name"],
          // Add subservices information
          "subservices-data": getSubservicesForService(service),
          "subservices-count": (getSubservicesForService(service) || []).length,
          // Preserve additional service attributes
          quantity: service.attributes.quantity || 1,
          "variable-rates": service.attributes["variable-rates"] || { hours: [] },
          "payment-frequency": service.attributes["payment-frequency"] || "one_time",
          "payment-method": service.attributes["payment-method"] || "payment_term_schedule",
          "target-margin": service.attributes["target-margin"] || null,
          "resource-rate-id": service.attributes["resource-rate-id"] || null
        }
      }
    })

    onServicesSelect(servicesToAdd)
    setSelectedServices(new Set())
    onOpenChange(false)
  }

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLineOfBusinessName = (lobId?: number) => {
    if (!lobId || lineOfBusinesses.length === 0) return null
    const lob = lineOfBusinesses.find(lob => lob.id === lobId.toString() || parseInt(lob.id) === lobId)
    return lob?.attributes?.name || null
  }

  const getPhaseName = (phaseId?: string) => {
    if (!phaseId || phases.length === 0) {
      console.log(`🔍 getPhaseName: No phaseId (${phaseId}) or no phases (${phases.length})`)
      return null
    }
    const phase = phases.find(phase => phase.id === phaseId)
    console.log(`🔍 getPhaseName: Looking for phaseId ${phaseId}, found:`, phase)
    return phase?.attributes?.name || null
  }

  const getPhaseData = (phaseId?: string) => {
    if (!phaseId || phases.length === 0) return null
    const phase = phases.find(phase => phase.id === phaseId)
    if (!phase) return null

    return {
      name: phase.attributes?.name || null,
      position: phase.attributes?.position || null
    }
  }

  const getResourceName = (resourceId?: string) => {
    if (!resourceId || resources.length === 0) return null
    const resource = resources.find(resource => resource.id === resourceId)
    return resource?.attributes?.name || null
  }

  const getResourceData = (resourceId?: string) => {
    if (!resourceId || resources.length === 0) return null
    const resource = resources.find(resource => resource.id === resourceId)
    if (!resource) return null

    return {
      name: resource.attributes?.name || null,
      hourlyRate: resource.attributes?.["hourly-rate"] || null,
      hourlyCost: resource.attributes?.["hourly-cost"] || null
    }
  }

  const getServiceCategoryName = (categoryId?: string) => {
    if (!categoryId || serviceCategories.length === 0) return null
    const category = serviceCategories.find(category => category.id === categoryId)
    return category?.attributes?.["nested-name"] || null
  }

  const getSubservicesForService = (service: ProjectService) => {
    try {
      // Extract subservice IDs from relationship data
      const subserviceIds = service.relationships?.subservices?.data?.map(sub => sub.id) || []

      // Early return for empty subservice IDs
      if (subserviceIds.length === 0) return []

      // Defensive check for subservices array
      if (!subservices || !Array.isArray(subservices) || subservices.length === 0) {
        console.warn('⚠️ getSubservicesForService: subservices is not a valid array:', typeof subservices, subservices)
        return []
      }

      // Map subservice IDs to actual subservice objects
      return subserviceIds
        .map(id => {
          try {
            return subservices.find(sub => sub && sub.id === id)
          } catch (error) {
            console.warn(`⚠️ Error finding subservice with id ${id}:`, error)
            return null
          }
        })
        .filter(Boolean)
        .map(sub => {
          // Get resource information from relationships
          const resourceId = sub.relationships?.resource?.data?.id
          const relationshipResourceName = resourceId ? getResourceName(resourceId) : null
          const resourceName = relationshipResourceName ||
                              sub.attributes?.["resource-name"] ||
                              sub.attributes?.["external-resource-name"]

          return {
            id: sub.id,
            name: sub.attributes?.name || 'Unknown Subservice',
            description: sub.attributes?.description || sub.attributes?.["service-description"] || '',
            quantity: sub.attributes?.quantity || 1,
            'suggested-hours': sub.attributes?.['suggested-hours'] || '0.0',
            'minimum-quantity': sub.attributes?.['minimum-quantity'] || '1.0',
            active: sub.attributes?.active ?? true,
            position: sub.attributes?.position || 1,
            'service-description': sub.attributes?.['service-description'] || '',
            'external-resource-name': resourceName
          }
        })
    } catch (error) {
      console.error('❌ Error in getSubservicesForService:', error)
      return []
    }
  }

  const getSubservicesDisplay = (service: ProjectService) => {
    try {
      const serviceSubservices = getSubservicesForService(service)
      if (!Array.isArray(serviceSubservices) || serviceSubservices.length === 0) return '-'

      if (serviceSubservices.length === 1) {
        return serviceSubservices[0]?.name || 'Unknown Subservice'
      }

      return `${serviceSubservices[0]?.name || 'Unknown'} +${serviceSubservices.length - 1} more`
    } catch (error) {
      console.warn('⚠️ Error in getSubservicesDisplay:', error)
      return '-'
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortableValue = (service: ProjectService, field: string) => {
    switch (field) {
      case 'name':
        return service.attributes.name?.toLowerCase() || ''
      case 'category':
        const serviceCategoryId = service.relationships?.["service-category"]?.data?.id
        const serviceCategoryName = serviceCategoryId ? getServiceCategoryName(serviceCategoryId) : null
        const lobName = getLineOfBusinessName(service.attributes["lob-id"])
        const categoryName = serviceCategoryName ||
                           service.attributes.category ||
                           service.attributes["service-category"] ||
                           service.attributes["lob-name"] ||
                           lobName
        return categoryName?.toLowerCase() || ''
      case 'phase':
        const phaseId = service.relationships?.phase?.data?.id
        const phaseName = phaseId ? getPhaseName(phaseId) : null
        return phaseName?.toLowerCase() || ''
      case 'quantity':
        return service.attributes.quantity || 1
      case 'hours':
        const hours = service.attributes.estimatedHours ||
                     service.attributes.hours ||
                     service.attributes["estimated-hours"] ||
                     (service.attributes["total-hours"] ? parseFloat(service.attributes["total-hours"]) : 0)
        return hours || 0
      case 'resource':
        const resourceId = service.relationships?.resource?.data?.id
        const relationshipResourceName = resourceId ? getResourceName(resourceId) : null
        const resourceName = relationshipResourceName ||
                            service.attributes["resource-name"] ||
                            service.attributes["external-resource-name"]
        return resourceName?.toLowerCase() || ''
      default:
        return ''
    }
  }

  const sortedServices = [...filteredServices].sort((a, b) => {
    const aValue = getSortableValue(a, sortField)
    const bValue = getSortableValue(b, sortField)

    if (aValue === null || aValue === undefined || aValue === '') return 1
    if (bValue === null || bValue === undefined || bValue === '') return -1

    let comparison = 0
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue)
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue
    } else {
      comparison = String(aValue).localeCompare(String(bValue))
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[80vh] w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Browse ScopeStack Services
          </DialogTitle>
          <DialogDescription>
            Select services to add to your project scope
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search services by name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Content */}
          <div className="border rounded-lg min-h-[400px] max-h-[400px] overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading services...
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <Table className="relative">
                  <TableHeader className="sticky top-0 bg-white z-10 border-b">
                    <TableRow>
                      <TableHead className="w-12 bg-white">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedServices(new Set(sortedServices.map(s => s.id)))
                            } else {
                              setSelectedServices(new Set())
                            }
                          }}
                          checked={selectedServices.size === sortedServices.length && sortedServices.length > 0}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead className="min-w-[180px] max-w-[250px] bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('name')}
                          className="h-8 p-0 hover:bg-transparent font-medium"
                        >
                          Service Name
                          {sortField === 'name' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="ml-2 h-3 w-3" />
                            ) : (
                              <ChevronDown className="ml-2 h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[100px] max-w-[140px] bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('category')}
                          className="h-8 p-0 hover:bg-transparent font-medium"
                        >
                          Category
                          {sortField === 'category' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="ml-2 h-3 w-3" />
                            ) : (
                              <ChevronDown className="ml-2 h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[90px] max-w-[110px] bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('phase')}
                          className="h-8 p-0 hover:bg-transparent font-medium"
                        >
                          Phase
                          {sortField === 'phase' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="ml-2 h-3 w-3" />
                            ) : (
                              <ChevronDown className="ml-2 h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[60px] max-w-[80px] bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('quantity')}
                          className="h-8 p-0 hover:bg-transparent font-medium"
                        >
                          Qty
                          {sortField === 'quantity' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="ml-2 h-3 w-3" />
                            ) : (
                              <ChevronDown className="ml-2 h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[70px] max-w-[90px] bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('hours')}
                          className="h-8 p-0 hover:bg-transparent font-medium"
                        >
                          Hours
                          {sortField === 'hours' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="ml-2 h-3 w-3" />
                            ) : (
                              <ChevronDown className="ml-2 h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[120px] max-w-[180px] bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('resource')}
                          className="h-8 p-0 hover:bg-transparent font-medium"
                        >
                          Resource
                          {sortField === 'resource' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="ml-2 h-3 w-3" />
                            ) : (
                              <ChevronDown className="ml-2 h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedServices.map((service) => (
                      <TableRow
                        key={service.id}
                        className={`hover:bg-gray-50 ${selectedServices.has(service.id) ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                      >
                        <TableCell className="py-3">
                          <input
                            type="checkbox"
                            checked={selectedServices.has(service.id)}
                            onChange={() => toggleServiceSelection(service.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium py-3">
                          <div className="max-w-[250px] truncate" title={service.attributes.name}>
                            {service.attributes.name}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          {(() => {
                            const serviceCategoryId = service.relationships?.["service-category"]?.data?.id
                            const serviceCategoryName = serviceCategoryId ? getServiceCategoryName(serviceCategoryId) : null
                            const lobName = getLineOfBusinessName(service.attributes["lob-id"])
                            const categoryName = serviceCategoryName ||
                                               service.attributes.category ||
                                               service.attributes["service-category"] ||
                                               service.attributes["lob-name"] ||
                                               lobName

                            if (categoryName) {
                              return (
                                <Badge variant="outline" className="text-xs">
                                  {categoryName}
                                </Badge>
                              )
                            }
                            return null
                          })()}
                        </TableCell>
                        <TableCell className="py-3">
                          {(() => {
                            // First check relationships for phase ID
                            const phaseId = service.relationships?.phase?.data?.id
                            console.log(`🔍 Phase Display for ${service.attributes.name}:`, {
                              phaseId,
                              relationships: service.relationships,
                              phasesCount: phases.length
                            })
                            const phaseName = phaseId ? getPhaseName(phaseId) : null

                            if (phaseName) {
                              return (
                                <Badge variant="secondary" className="text-xs">
                                  {phaseName}
                                </Badge>
                              )
                            }

                            // Fallback to attributes-based phase data
                            const servicePhases = service.attributes.phases ||
                                                 service.attributes["phase-names"] ||
                                                 (service.attributes["phase-name"] ? [service.attributes["phase-name"]] : null)

                            if (servicePhases && servicePhases.length > 0) {
                              return servicePhases.length === 1 ? (
                                <Badge variant="secondary" className="text-xs">
                                  {servicePhases[0]}
                                </Badge>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {servicePhases[0]}
                                  </Badge>
                                  {servicePhases.length > 1 && (
                                    <span className="text-xs text-gray-500">+{servicePhases.length - 1}</span>
                                  )}
                                </div>
                              )
                            }

                            return '-'
                          })()}
                        </TableCell>
                        <TableCell className="py-3">
                          {service.attributes.quantity || 1}
                        </TableCell>
                        <TableCell className="py-3">
                          {(() => {
                            const hours = service.attributes.estimatedHours ||
                                         service.attributes.hours ||
                                         service.attributes["estimated-hours"] ||
                                         (service.attributes["total-hours"] ? parseFloat(service.attributes["total-hours"]) : null)
                            return hours ? `${hours}h` : '-'
                          })()}
                        </TableCell>
                        <TableCell className="py-3">
                          {(() => {
                            const resourceId = service.relationships?.resource?.data?.id
                            const relationshipResourceName = resourceId ? getResourceName(resourceId) : null
                            const resourceName = relationshipResourceName ||
                                                service.attributes["resource-name"] ||
                                                service.attributes["external-resource-name"]

                            return (
                              <div className="max-w-[180px] truncate" title={resourceName || ''}>
                                {resourceName || '-'}
                              </div>
                            )
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {sortedServices.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {searchQuery ? 'No services found matching your search' : 'No services available'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-500">
              {selectedServices.size > 0 && (
                <span>{selectedServices.size} service{selectedServices.size !== 1 ? 's' : ''} selected</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddServices}
                disabled={selectedServices.size === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Selected Services
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}