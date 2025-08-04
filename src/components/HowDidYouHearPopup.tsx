import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, X } from "lucide-react"

interface HowDidYouHearPopupProps {
  isOpen: boolean
  onClose: () => void
  eventTitle: string
}

const hearAboutOptions = [
  { value: 'friend', label: 'Friend or word of mouth' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'eventbrite', label: 'Eventbrite' },
  { value: 'google', label: 'Google search' },
  { value: 'flyer', label: 'Flyer or poster' },
  { value: 'website', label: 'Organization website' },
  { value: 'newsletter', label: 'Email newsletter' },
  { value: 'other', label: 'Other' }
]

export default function HowDidYouHearPopup({ isOpen, onClose, eventTitle }: HowDidYouHearPopupProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [otherText, setOtherText] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedOption) return

    setIsSubmitting(true)
    
    try {
      // TODO: Add API call to save how they heard about us
      console.log('How did you hear about us submission:', {
        eventTitle,
        source: selectedOption,
        otherDetails: selectedOption === 'other' ? otherText : undefined
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onClose()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const handleClose = () => {
    setSelectedOption('')
    setOtherText('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              Quick Question
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            How did you hear about <strong>{eventTitle}</strong>?
          </p>

          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            <div className="space-y-3">
              {hearAboutOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {selectedOption === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="other-details" className="text-sm">
                Please specify:
              </Label>
              <Textarea
                id="other-details"
                placeholder="Tell us how you heard about this event..."
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                rows={2}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleSkip}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedOption || isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}