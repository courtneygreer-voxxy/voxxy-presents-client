import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  Monitor,
  Settings,
  Eye,
  EyeOff,
  Save,
  Upload,
  Image,
  Video,
  Music,
  Calendar,
  Users,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  X,
  ExternalLink
} from 'lucide-react'

interface PublicScreenContent {
  id: string
  type: 'image' | 'video' | 'text' | 'event_feed' | 'social_feed'
  title: string
  content?: string
  url?: string
  duration?: number
  isActive: boolean
  position: number
}

interface PublicScreenManagerProps {
  venueId: string
}

export function PublicScreenManager({ venueId }: PublicScreenManagerProps) {
  const [isScreenActive, setIsScreenActive] = useState(true)
  const [screenContent, setScreenContent] = useState<PublicScreenContent[]>([
    {
      id: 'content-1',
      type: 'text',
      title: 'Welcome Message',
      content: 'Welcome to The Brooklyn Lounge! Tonight: Jazz & Comedy',
      duration: 10,
      isActive: true,
      position: 1
    },
    {
      id: 'content-2',
      type: 'event_feed',
      title: 'Upcoming Events',
      duration: 15,
      isActive: true,
      position: 2
    },
    {
      id: 'content-3',
      type: 'image',
      title: 'Venue Photos',
      url: '/images/venue-slideshow',
      duration: 8,
      isActive: false,
      position: 3
    }
  ])
  const [newContent, setNewContent] = useState<Partial<PublicScreenContent>>({
    type: 'text',
    title: '',
    content: '',
    duration: 10,
    isActive: true
  })
  const [isAddingContent, setIsAddingContent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [screenSettings, setScreenSettings] = useState({
    displayMode: 'slideshow',
    transitionDuration: 3,
    showVenueLogo: true,
    showDateTime: true,
    backgroundTheme: 'dark'
  })

  const handleToggleScreen = async () => {
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      console.log('Toggling screen:', !isScreenActive)

      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsScreenActive(!isScreenActive)
    } catch (error) {
      console.error('Error toggling screen:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddContent = async () => {
    if (!newContent.title || !newContent.type) return

    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      console.log('Adding content:', newContent)

      await new Promise(resolve => setTimeout(resolve, 500))

      const content: PublicScreenContent = {
        id: `content-${Date.now()}`,
        title: newContent.title || '',
        type: newContent.type || 'text',
        content: newContent.content,
        url: newContent.url,
        duration: newContent.duration || 10,
        isActive: newContent.isActive || false,
        position: screenContent.length + 1
      }

      setScreenContent(prev => [...prev, content])
      setNewContent({
        type: 'text',
        title: '',
        content: '',
        duration: 10,
        isActive: true
      })
      setIsAddingContent(false)
    } catch (error) {
      console.error('Error adding content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleContent = async (contentId: string) => {
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      console.log('Toggling content:', contentId)

      await new Promise(resolve => setTimeout(resolve, 500))

      setScreenContent(prev => prev.map(content =>
        content.id === contentId ? { ...content, isActive: !content.isActive } : content
      ))
    } catch (error) {
      console.error('Error toggling content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveContent = async (contentId: string) => {
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      console.log('Removing content:', contentId)

      await new Promise(resolve => setTimeout(resolve, 500))

      setScreenContent(prev => prev.filter(content => content.id !== contentId))
    } catch (error) {
      console.error('Error removing content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      console.log('Saving screen settings:', screenSettings)

      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'text':
        return <Monitor className="h-4 w-4" />
      case 'event_feed':
        return <Calendar className="h-4 w-4" />
      case 'social_feed':
        return <Globe className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'image': 'Image/Slideshow',
      'video': 'Video',
      'text': 'Text Message',
      'event_feed': 'Event Feed',
      'social_feed': 'Social Media Feed'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Screen Status & Controls */}
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Monitor className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Public Screen Manager</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isScreenActive ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${isScreenActive ? 'text-green-400' : 'text-red-400'}`}>
                {isScreenActive ? 'Online' : 'Offline'}
              </span>
            </div>
            <Button
              onClick={handleToggleScreen}
              disabled={isSaving}
              className={`${
                isScreenActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : isScreenActive ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {isScreenActive ? 'Turn Off Screen' : 'Turn On Screen'}
            </Button>
          </div>
        </div>

        <Alert className="bg-blue-400/10 border-blue-400/30">
          <Monitor className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-gray-300">
            The public screen displays content for your venue visitors. You can add images, videos, text messages, and live feeds.
            {!isScreenActive && ' The screen is currently offline and not displaying content.'}
          </AlertDescription>
        </Alert>
      </div>

      {/* Current Content */}
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Content Rotation</h3>
          <Button
            onClick={() => setIsAddingContent(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>

        <div className="space-y-3">
          {screenContent.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">No content configured</h4>
              <p className="text-gray-400">Add some content to display on your public screen</p>
            </div>
          ) : (
            screenContent.map((content, index) => (
              <div key={content.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {getContentIcon(content.type)}
                      <span className="text-white font-medium">{content.title}</span>
                    </div>
                    <Badge className="bg-purple-600/80 text-white text-xs">
                      {getContentTypeLabel(content.type)}
                    </Badge>
                    <Badge className="bg-blue-600/80 text-white text-xs">
                      {content.duration}s
                    </Badge>
                    {content.isActive ? (
                      <Badge className="bg-green-600/80 text-white text-xs">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-600/80 text-white text-xs">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleToggleContent(content.id)}
                      disabled={isSaving}
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {content.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      onClick={() => handleRemoveContent(content.id)}
                      disabled={isSaving}
                      variant="outline"
                      size="sm"
                      className="bg-red-600/20 border-red-400/30 text-red-400 hover:bg-red-600/30"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {content.content && (
                  <p className="text-gray-300 text-sm mt-2 pl-6">{content.content}</p>
                )}
                {content.url && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm mt-2 pl-6">
                    <ExternalLink className="h-3 w-3" />
                    <span>{content.url}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Content Form */}
      {isAddingContent && (
        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Content</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="content-type" className="text-white">Content Type</Label>
                <Select value={newContent.type} onValueChange={(value) => setNewContent(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="text" className="text-white hover:bg-gray-700">Text Message</SelectItem>
                    <SelectItem value="image" className="text-white hover:bg-gray-700">Image/Slideshow</SelectItem>
                    <SelectItem value="video" className="text-white hover:bg-gray-700">Video</SelectItem>
                    <SelectItem value="event_feed" className="text-white hover:bg-gray-700">Event Feed</SelectItem>
                    <SelectItem value="social_feed" className="text-white hover:bg-gray-700">Social Media Feed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content-title" className="text-white">Title</Label>
                <Input
                  id="content-title"
                  value={newContent.title || ''}
                  onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
                  placeholder="Content title..."
                />
              </div>
            </div>

            {(newContent.type === 'text') && (
              <div>
                <Label htmlFor="content-text" className="text-white">Message</Label>
                <Textarea
                  id="content-text"
                  value={newContent.content || ''}
                  onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
                  placeholder="Enter your message..."
                />
              </div>
            )}

            {(newContent.type === 'image' || newContent.type === 'video') && (
              <div>
                <Label htmlFor="content-url" className="text-white">File URL or Upload</Label>
                <div className="flex gap-2">
                  <Input
                    id="content-url"
                    value={newContent.url || ''}
                    onChange={(e) => setNewContent(prev => ({ ...prev, url: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 flex-1"
                    placeholder="Enter URL or upload file..."
                  />
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="content-duration" className="text-white">Display Duration (seconds)</Label>
                <Input
                  id="content-duration"
                  type="number"
                  min="1"
                  max="300"
                  value={newContent.duration || 10}
                  onChange={(e) => setNewContent(prev => ({ ...prev, duration: parseInt(e.target.value) || 10 }))}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={newContent.isActive || false}
                  onCheckedChange={(checked) => setNewContent(prev => ({ ...prev, isActive: checked }))}
                />
                <Label className="text-white">Active immediately</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
              <Button
                onClick={() => setIsAddingContent(false)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddContent}
                disabled={isSaving || !newContent.title}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Settings */}
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Display Settings</h3>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="display-mode" className="text-white">Display Mode</Label>
            <Select value={screenSettings.displayMode} onValueChange={(value) => setScreenSettings(prev => ({ ...prev, displayMode: value }))}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="slideshow" className="text-white hover:bg-gray-700">Slideshow Rotation</SelectItem>
                <SelectItem value="split" className="text-white hover:bg-gray-700">Split Screen</SelectItem>
                <SelectItem value="single" className="text-white hover:bg-gray-700">Single Content</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transition-duration" className="text-white">Transition Duration (seconds)</Label>
            <Input
              id="transition-duration"
              type="number"
              min="1"
              max="10"
              value={screenSettings.transitionDuration}
              onChange={(e) => setScreenSettings(prev => ({ ...prev, transitionDuration: parseInt(e.target.value) || 3 }))}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
            />
          </div>

          <div>
            <Label htmlFor="background-theme" className="text-white">Background Theme</Label>
            <Select value={screenSettings.backgroundTheme} onValueChange={(value) => setScreenSettings(prev => ({ ...prev, backgroundTheme: value }))}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="dark" className="text-white hover:bg-gray-700">Dark</SelectItem>
                <SelectItem value="light" className="text-white hover:bg-gray-700">Light</SelectItem>
                <SelectItem value="branded" className="text-white hover:bg-gray-700">Venue Branded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={screenSettings.showVenueLogo}
                onCheckedChange={(checked) => setScreenSettings(prev => ({ ...prev, showVenueLogo: checked }))}
              />
              <Label className="text-white">Show venue logo</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={screenSettings.showDateTime}
                onCheckedChange={(checked) => setScreenSettings(prev => ({ ...prev, showDateTime: checked }))}
              />
              <Label className="text-white">Show date & time</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}