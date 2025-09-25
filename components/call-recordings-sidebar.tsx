"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Phone,
  Search,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Settings,
  Loader2,
  X,
  Filter
} from "lucide-react"
import { CallRecordingManager, CallTranscript } from "@/lib/call-recording-integrations"

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

interface CallRecordingsSidebarProps {
  isOpen: boolean
  onClose: () => void
  onRecordingsSelect: (recordings: CallRecording[]) => void
  linkedRecordingIds: string[]
}

export function CallRecordingsSidebar({
  isOpen,
  onClose,
  onRecordingsSelect,
  linkedRecordingIds
}: CallRecordingsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([])
  const [allRecordings, setAllRecordings] = useState<CallTranscript[]>([])
  const [loading, setLoading] = useState(false)
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'fireflies' | 'teams' | 'webex'>('all')
  const [manager] = useState(() => new CallRecordingManager())

  // Fetch recordings when sidebar opens
  useEffect(() => {
    if (isOpen && allRecordings.length === 0) {
      fetchRecordings()
    }
  }, [isOpen])

  const fetchRecordings = async () => {
    setLoading(true)
    try {
      const recordings = await manager.fetchAllTranscripts()
      setAllRecordings(recordings)
    } catch (error) {
      console.error('Failed to fetch recordings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Convert CallTranscript to CallRecording format
  const convertToCallRecording = (transcript: CallTranscript): CallRecording => ({
    id: transcript.id,
    title: transcript.meetingTitle,
    date: transcript.date,
    duration: transcript.duration,
    platform: transcript.platform,
    participants: transcript.participants,
    summary: transcript.summary,
    isLinked: linkedRecordingIds.includes(transcript.id)
  })

  const filteredRecordings = allRecordings
    .map(convertToCallRecording)
    .filter(recording => {
      const matchesSearch = recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recording.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesPlatform = filterPlatform === 'all' || recording.platform === filterPlatform

      return matchesSearch && matchesPlatform
    })

  const handleRecordingToggle = (recordingId: string) => {
    setSelectedRecordings(prev =>
      prev.includes(recordingId)
        ? prev.filter(id => id !== recordingId)
        : [...prev, recordingId]
    )
  }

  const handleLinkSelected = () => {
    const selectedRecordingObjects = filteredRecordings.filter(recording =>
      selectedRecordings.includes(recording.id)
    )
    onRecordingsSelect(selectedRecordingObjects)
    setSelectedRecordings([])
  }

  const getPlatformColor = (platform: CallRecording['platform']) => {
    switch (platform) {
      case 'fireflies': return 'bg-orange-100 text-orange-700'
      case 'teams': return 'bg-blue-100 text-blue-700'
      case 'webex': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const platformCounts = {
    all: allRecordings.length,
    fireflies: allRecordings.filter(r => r.platform === 'fireflies').length,
    teams: allRecordings.filter(r => r.platform === 'teams').length,
    webex: allRecordings.filter(r => r.platform === 'webex').length,
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <h2 className="font-semibold">Call Recordings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search recordings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8"
            />
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1">
              {(['all', 'fireflies', 'teams', 'webex'] as const).map((platform) => (
                <Button
                  key={platform}
                  variant={filterPlatform === platform ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterPlatform(platform)}
                  className="h-6 px-2 text-xs"
                  disabled={platform !== 'all' && platformCounts[platform] === 0}
                >
                  {platform === 'all' ? 'All' : platform}
                  {platformCounts[platform] > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                      {platformCounts[platform]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading recordings...</span>
            </div>
          )}

          {/* No Recordings State */}
          {!loading && allRecordings.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <Phone className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-600 mb-1">No recordings found</p>
                <p className="text-xs text-gray-400 mb-3">Configure integrations first</p>
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Integrations
                </Button>
              </div>
            </div>
          )}

          {/* Recordings List */}
          {!loading && filteredRecordings.length > 0 && (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {filteredRecordings.map((recording) => {
                  const isSelected = selectedRecordings.includes(recording.id)
                  const isAlreadyLinked = recording.isLinked

                  return (
                    <div
                      key={recording.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all text-sm ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : isAlreadyLinked
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => !isAlreadyLinked && handleRecordingToggle(recording.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">{recording.title}</p>
                            {isAlreadyLinked && (
                              <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-xs ${getPlatformColor(recording.platform)}`}>
                              {recording.platform}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {recording.date.toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor(recording.duration / 60)}m
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {recording.participants.length}
                            </div>
                          </div>

                          <p className="text-xs text-gray-600 truncate">
                            {recording.participants.slice(0, 2).join(', ')}
                            {recording.participants.length > 2 && ` +${recording.participants.length - 2}`}
                          </p>

                          {recording.summary && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {recording.summary}
                            </p>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        <div className="ml-2 flex-shrink-0">
                          {!isAlreadyLinked && (
                            <div
                              className={`w-4 h-4 border-2 rounded ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <CheckCircle2 className="w-full h-full text-white" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          {/* No Search Results */}
          {!loading && searchQuery && filteredRecordings.length === 0 && allRecordings.length > 0 && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No matching recordings</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedRecordings.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">
                {selectedRecordings.length} selected
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedRecordings([])}
                className="text-xs h-6 px-2"
              >
                Clear
              </Button>
            </div>
            <Button
              onClick={handleLinkSelected}
              className="w-full h-8"
              size="sm"
            >
              Link {selectedRecordings.length} Recording{selectedRecordings.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}