import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Share2, Copy, Check, Facebook, Twitter, Mail } from 'lucide-react'

interface ShareButtonProps {
  url: string
  title: string
  description?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function ShareButton({
  url,
  title,
  description = '',
  variant = 'outline',
  size = 'sm',
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  // Check if Web Share API is available
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  const handleNativeShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        })
        setIsOpen(false)
      } catch (error) {
        console.log('Share was cancelled or failed:', error)
      }
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className={`flex items-center gap-2 ${className}`}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="voxxy-auth-card w-64 p-3 text-foreground" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-foreground">Share this page</h4>

          {/* Copy Link */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="w-full justify-start"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy link'}
          </Button>

          <div className="border-t border-border pt-2">
            <p className="text-xs text-muted-foreground mb-2">Share on social media</p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="flex-1"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="flex-1"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('email')}
                className="flex-1"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Native Share (if available) */}
          {canNativeShare && (
            <div className="border-t border-border pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNativeShare}
                className="w-full justify-start"
              >
                <Share2 className="h-4 w-4 mr-2" />
                More options...
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
