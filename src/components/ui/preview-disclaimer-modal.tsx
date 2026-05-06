import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './dialog'
import { Button } from './button'
import { Badge } from './badge'
import { Info, TestTube, Eye } from 'lucide-react'

interface PreviewDisclaimerModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  mode: 'preview' | 'beta'
}

export function PreviewDisclaimerModal({ 
  isOpen, 
  onClose, 
  onContinue, 
  mode 
}: PreviewDisclaimerModalProps) {
  const isPreview = mode === 'preview'
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-3">
            {isPreview ? (
              <Eye className="h-12 w-12 text-blue-500" />
            ) : (
              <TestTube className="h-12 w-12 text-primary" />
            )}
          </div>
          <DialogTitle className="flex items-center justify-center gap-2">
            {isPreview ? 'Preview Mode' : 'Beta Feature'}
            <Badge 
              variant="secondary" 
              className={isPreview 
                ? "bg-blue-100 text-blue-800" 
                : "bg-primary/10 text-slate-800"
              }
            >
              {isPreview ? 'Preview' : 'Beta'}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-left mt-4">
            {isPreview ? (
              <>
                <div className="flex items-start gap-2 mb-3">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>What is Preview Mode?</strong>
                    <p className="text-gray-600 mt-1">
                      You're seeing a preview of our upcoming platform integrations. 
                      This demonstrates how the feature will work when it launches.
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h4 className="font-medium text-blue-900 mb-2">What works in preview:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Connection flow and user interface</li>
                    <li>• Sample data import and form auto-fill</li>
                    <li>• Complete club creation process</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">What's simulated:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Platform authentication (uses demo data)</li>
                    <li>• Data syncing (one-time import only)</li>
                    <li>• Real-time updates (coming when feature launches)</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2 mb-3">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong>What is Beta Mode?</strong>
                    <p className="text-gray-600 mt-1">
                      You have early access to test platform integrations before general release.
                      This is a working prototype with limited functionality.
                    </p>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-3 rounded-lg mb-3">
                  <h4 className="font-medium text-slate-900 mb-2">Beta features include:</h4>
                  <ul className="text-sm text-slate-800 space-y-1">
                    <li>• Enhanced connection flow testing</li>
                    <li>• Advanced data import options</li>
                    <li>• Priority feedback channel</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">Please note:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Features may change based on feedback</li>
                    <li>• Some functionality is still in development</li>
                    <li>• Report issues to help us improve</li>
                  </ul>
                </div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={onContinue}
            className={`w-full sm:w-auto ${
              isPreview 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'voxxy-btn-solid'
            }`}
          >
            Continue with {isPreview ? 'Preview' : 'Beta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}