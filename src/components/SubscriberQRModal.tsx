import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, Download, Share2, Copy, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { QRCodeCanvas } from 'qrcode.react'

interface SubscriberQRModalProps {
  organizationSlug: string
  organizationName: string
}

export function SubscriberQRModal({ organizationSlug, organizationName }: SubscriberQRModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const subscribeUrl = `${window.location.origin}/subscribe/${organizationSlug}`

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${organizationSlug}-subscribe-qr.png`
      link.href = url
      link.click()

      toast({
        title: "QR Code Downloaded!",
        description: "Save this and print it for your events."
      })
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(subscribeUrl)
      setCopied(true)
      toast({
        title: "Link Copied!",
        description: "Share this link to let people subscribe."
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy the link manually."
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Subscribe to ${organizationName}`,
          text: `Join ${organizationName} to get updates about events!`,
          url: subscribeUrl
        })
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback to copy
      handleCopyLink()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="voxxy-btn-cta-pink">
          <QrCode className="h-4 w-4 mr-2" />
          Get QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground dark:bg-gradient-to-br dark:from-gray-900/95 dark:via-purple-900/95 dark:to-gray-900/95 dark:backdrop-blur-xl dark:border-2 dark:border-purple-400/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Subscriber QR Code
          </DialogTitle>
          <p className="text-muted-foreground dark:text-purple-200 text-center text-sm">
            Scan to subscribe to {organizationName}
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-background p-6 rounded-xl shadow-2xl" ref={qrRef}>
              <QRCodeCanvas
                value={subscribeUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-400/20">
            <p className="text-sm text-purple-200 text-center">
              📱 Pull this up on your phone at events and let guests scan to subscribe instantly!
            </p>
          </div>

          {/* Link Display */}
          <div className="space-y-2">
            <label className="text-sm text-purple-300 font-semibold">Subscription Link:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subscribeUrl}
                readOnly
                className="flex-1 bg-background/10 border border-purple-400/30 rounded px-3 py-2 text-sm text-foreground"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="bg-background/10 border-purple-400/30 text-foreground hover:bg-background/20"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDownload}
              className="voxxy-btn-solid"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleShare}
              className="bg-pink-600 hover:bg-pink-700 text-foreground"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Tips */}
          <div className="text-xs text-purple-300 space-y-1">
            <p>💡 <strong>Tip:</strong> Download and print this for your venue</p>
            <p>📲 <strong>Mobile:</strong> Save this page as a bookmark for quick access</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
