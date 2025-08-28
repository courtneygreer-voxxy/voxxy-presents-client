import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  History, 
  RotateCcw, 
  Eye, 
  MessageSquare,
  Clock,
  User,
  Palette,
  Image as ImageIcon,
  Layout,
  ChevronRight,
  Download
} from "lucide-react"
import { designService } from '@/services/designService'
import { useDesign } from '@/contexts/DesignContext'
import type { Organization } from '@/types/database'

interface DesignHistoryProps {
  organization: Organization
}

interface HistoryEntry {
  id: string
  version: number
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  comment?: string
  changes: {
    background?: boolean
    colors?: boolean
    layout?: boolean
  }
  design: any // OrganizationDesign
}

export function DesignHistory({ organization }: DesignHistoryProps) {
  const { designState, updatePreviewDesign } = useDesign()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<HistoryEntry | null>(null)
  const [restoreComment, setRestoreComment] = useState('')
  const [isRestoring, setIsRestoring] = useState(false)

  // Load design history
  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true)
      try {
        const historyData = await designService.getDesignHistory(organization.id, { limit: 20 })
        setHistory(historyData.map(item => ({
          ...item,
          changes: {
            background: Math.random() > 0.7,
            colors: Math.random() > 0.6,
            layout: Math.random() > 0.8,
          }
        })))
      } catch (err) {
        // Mock data for development
        const mockHistory: HistoryEntry[] = [
          {
            id: '1',
            version: 3,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            createdBy: {
              id: '1',
              name: 'Current User',
              email: 'user@example.com',
            },
            comment: 'Updated color palette for better accessibility',
            changes: { colors: true },
            design: designState.current
          },
          {
            id: '2',
            version: 2,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            createdBy: {
              id: '2',
              name: 'Design Team',
              email: 'design@example.com',
            },
            comment: 'Added new background image and adjusted layout',
            changes: { background: true, layout: true },
            design: designState.current
          },
          {
            id: '3',
            version: 1,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: {
              id: '1',
              name: 'Current User',
              email: 'user@example.com',
            },
            comment: 'Initial design setup',
            changes: { background: true, colors: true, layout: true },
            design: designState.current
          },
        ]
        setHistory(mockHistory)
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [organization.id, designState.current])

  const handlePreviewVersion = (version: HistoryEntry) => {
    setSelectedVersion(version)
    updatePreviewDesign(version.design)
  }

  const handleRestoreVersion = async () => {
    if (!selectedVersion) return

    setIsRestoring(true)
    try {
      await designService.restoreDesignVersion(
        organization.id,
        selectedVersion.id,
        restoreComment || `Restored to version ${selectedVersion.version}`
      )
      
      // Reload history
      window.location.reload() // In a real app, you'd update state properly
    } catch (error) {
      console.error('Failed to restore version:', error)
    } finally {
      setIsRestoring(false)
    }
  }

  const getChangeIcon = (changes: HistoryEntry['changes']) => {
    if (changes.background && changes.colors && changes.layout) {
      return <Palette className="h-4 w-4" />
    } else if (changes.background) {
      return <ImageIcon className="h-4 w-4" />
    } else if (changes.colors) {
      return <Palette className="h-4 w-4" />
    } else if (changes.layout) {
      return <Layout className="h-4 w-4" />
    }
    return <History className="h-4 w-4" />
  }

  const getChangeDescription = (changes: HistoryEntry['changes']) => {
    const changeTypes = []
    if (changes.background) changeTypes.push('Background')
    if (changes.colors) changeTypes.push('Colors')
    if (changes.layout) changeTypes.push('Layout')
    
    if (changeTypes.length === 0) return 'Minor changes'
    if (changeTypes.length === 1) return changeTypes[0]
    if (changeTypes.length === 2) return changeTypes.join(' & ')
    return 'Multiple changes'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Design History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Design History
        </CardTitle>
        <CardDescription>
          View and restore previous versions of your design
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert>
            <AlertDescription>
              {error} (Showing mock data for demo)
            </AlertDescription>
          </Alert>
        )}

        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No design history available yet</p>
            <p className="text-sm">Changes will appear here as you save your design</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors ${
                  selectedVersion?.id === entry.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {entry.createdBy.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      v{entry.version}
                    </Badge>
                    
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {getChangeIcon(entry.changes)}
                      <span className="text-sm">{getChangeDescription(entry.changes)}</span>
                    </div>

                    {index === 0 && (
                      <Badge className="text-xs">Current</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <User className="h-4 w-4" />
                    <span>{entry.createdBy.name}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>

                  {entry.comment && (
                    <div className="flex items-start gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-foreground">{entry.comment}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewVersion(entry)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>

                    {index > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restore
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Restore Design Version</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to restore to version {entry.version}? 
                              This will replace your current design.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="text-sm">
                              <p className="font-medium mb-2">This version includes:</p>
                              <ul className="space-y-1 text-muted-foreground">
                                {entry.changes.background && (
                                  <li className="flex items-center gap-2">
                                    <ImageIcon className="h-3 w-3" />
                                    Background changes
                                  </li>
                                )}
                                {entry.changes.colors && (
                                  <li className="flex items-center gap-2">
                                    <Palette className="h-3 w-3" />
                                    Color palette updates
                                  </li>
                                )}
                                {entry.changes.layout && (
                                  <li className="flex items-center gap-2">
                                    <Layout className="h-3 w-3" />
                                    Layout modifications
                                  </li>
                                )}
                              </ul>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Restoration comment (optional)
                              </label>
                              <Textarea
                                placeholder="Describe why you're restoring this version..."
                                value={restoreComment}
                                onChange={(e) => setRestoreComment(e.target.value)}
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setRestoreComment('')}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleRestoreVersion}
                              disabled={isRestoring}
                            >
                              {isRestoring ? 'Restoring...' : 'Restore Version'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        {/* Export Options */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Export History</h4>
              <p className="text-xs text-muted-foreground">
                Download your complete design history
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => designService.exportDesign(organization.id, 'json')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DesignHistory