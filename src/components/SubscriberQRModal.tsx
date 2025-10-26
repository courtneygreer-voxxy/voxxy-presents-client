import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, Download, Share2, Copy, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCodeStyling from 'qr-code-styling'

interface SubscriberQRModalProps {
  organizationSlug: string
  organizationName: string
}

export function SubscriberQRModal({ organizationSlug, organizationName }: SubscriberQRModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const subscribeUrl = `${window.location.origin}/subscribe/${organizationSlug}`

  useEffect(() => {
    if (isOpen && !qrCode) {
      // Create QR code with Voxxy styling
      const qr = new QRCodeStyling({
        width: 300,
        height: 300,
        data: subscribeUrl,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H'
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 4
        },
        dotsOptions: {
          type: 'rounded',
          color: '#9333ea', // Purple
          gradient: {
            type: 'linear',
            rotation: 0,
            colorStops: [
              { offset: 0, color: '#9333ea' },
              { offset: 1, color: '#ec4899' }
            ]
          }
        },
        backgroundOptions: {
          color: '#ffffff'
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: '#7c3aed'
        },
        cornersDotOptions: {
          type: 'dot',
          color: '#a855f7'
        }
      })

      setQrCode(qr)

      // Append to container
      const container = document.getElementById('qr-code-container')
      if (container) {
        container.innerHTML = '' // Clear previous
        qr.append(container)
      }
    }
  }, [isOpen, qrCode, subscribeUrl])

  const handleDownload = () => {
    if (qrCode) {
      qrCode.download({
        name: `${organizationSlug}-subscribe-qr`,
        extension: 'png'
      })

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
    } catch (err) {
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
      } catch (err) {
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
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          <QrCode className="h-4 w-4 mr-2" />
          Get QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-xl border-2 border-purple-400/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Subscriber QR Code
          </DialogTitle>
          <p className="text-purple-200 text-center text-sm">
            Scan to subscribe to {organizationName}
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div id="qr-code-container"></div>
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
                className="flex-1 bg-white/10 border border-purple-400/30 rounded px-3 py-2 text-sm text-white"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="bg-white/10 border-purple-400/30 text-white hover:bg-white/20"
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
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleShare}
              className="bg-pink-600 hover:bg-pink-700 text-white"
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
