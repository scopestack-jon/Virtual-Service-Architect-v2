"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Phone,
  Search,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Settings,
  Loader2
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

interface CallRecordingsBrowserProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRecordingsSelect: (recordings: CallRecording[]) => void
  linkedRecordingIds: string[]
}

export function CallRecordingsBrowser({
  open,
  onOpenChange,
  onRecordingsSelect,
  linkedRecordingIds
}: CallRecordingsBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([])
  const [allRecordings, setAllRecordings] = useState<CallTranscript[]>([])
  const [loading, setLoading] = useState(false)
  const [manager] = useState(() => new CallRecordingManager())

  // Fetch recordings when dialog opens
  useEffect(() => {
    if (open && allRecordings.length === 0) {
      fetchRecordings()
    }
  }, [open])

  const fetchRecordings = async () => {
    setLoading(true)
    try {
      // Try to get recordings from all configured integrations
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
    .filter(recording =>
      recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
    )

  const handleRecordingToggle = (recordingId: string) => {
    setSelectedRecordings(prev =>
      prev.includes(recordingId)
        ? prev.filter(id => id !== recordingId)
        : [...prev, recordingId]
    )
  }

  const handleConfirmSelection = () => {
    const selectedRecordingObjects = filteredRecordings.filter(recording =>
      selectedRecordings.includes(recording.id)
    )
    onRecordingsSelect(selectedRecordingObjects)
    setSelectedRecordings([])
    onOpenChange(false)
  }

  const getPlatformColor = (platform: CallRecording['platform']) => {
    switch (platform) {
      case 'fireflies': return 'bg-orange-100 text-orange-700'
      case 'teams': return 'bg-blue-100 text-blue-700'
      case 'webex': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Browse Call Recordings
          </DialogTitle>
          <DialogDescription>
            Select call recordings to link to this project. Recordings from all connected platforms will appear here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search recordings by title or participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading call recordings...</span>
            </div>
          )}

          {/* No Recordings State */}
          {!loading && allRecordings.length === 0 && (
            <div className="text-center py-8">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">No call recordings found</p>
              <p className="text-sm text-gray-400 mb-4">
                Make sure you have configured integrations and have recordings available
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <Settings className="w-4 h-4 mr-2" />
                Check Integrations
              </Button>
            </div>
          )}

          {/* Recordings List */}
          {!loading && filteredRecordings.length > 0 && (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredRecordings.map((recording) => {
                  const isSelected = selectedRecordings.includes(recording.id)
                  const isAlreadyLinked = recording.isLinked

                  return (
                    <div
                      key={recording.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : isAlreadyLinked
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => !isAlreadyLinked && handleRecordingToggle(recording.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-sm">{recording.title}</h3>
                            <Badge className={`text-xs ${getPlatformColor(recording.platform)}`}>
                              {recording.platform}
                            </Badge>
                            {isAlreadyLinked && (
                              <Badge variant="default" className="text-xs gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Linked
                              </Badge>
                            )}
                          </div>

                          {/* Recording Details */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {recording.date.toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor(recording.duration / 60)} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {recording.participants.length} participants
                            </div>
                          </div>

                          {/* Participants */}
                          <p className="text-xs text-gray-600 mb-2">
                            {recording.participants.slice(0, 3).join(', ')}
                            {recording.participants.length > 3 && ` +${recording.participants.length - 3} more`}
                          </p>

                          {/* Summary */}
                          {recording.summary && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {recording.summary}
                            </p>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        <div className="ml-4">
                          {isAlreadyLinked ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <div
                              className={`w-5 h-5 border-2 rounded ${
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

          {/* Filtered Results */}
          {!loading && searchQuery && filteredRecordings.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p>No recordings match your search</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-gray-500">
              {selectedRecordings.length > 0 && (
                `${selectedRecordings.length} recording${selectedRecordings.length > 1 ? 's' : ''} selected`
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRecordings([])
                  onOpenChange(false)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedRecordings.length === 0}
              >
                Link Selected ({selectedRecordings.length})
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}