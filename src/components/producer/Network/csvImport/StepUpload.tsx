import React, { useRef } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText } from 'lucide-react'
import { downloadCSVTemplate } from '@/utils/csvTemplateGenerator'

interface StepUploadProps {
  onFileSelect: (file: File) => void
  errorMessage: string
}

export function StepUpload({ onFileSelect, errorMessage }: StepUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <div className="space-y-3">
      <Alert>
        <FileText className="h-3.5 w-3.5" />
        <AlertDescription className="text-xs">
          First time importing?{' '}
          <button
            onClick={downloadCSVTemplate}
            className="font-medium text-primary hover:underline"
          >
            Download our CSV template
          </button>{' '}
          to get started.
        </AlertDescription>
      </Alert>

      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-primary/40 bg-background/5 rounded-lg p-6 text-center hover:border-primary hover:bg-background/10 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-1.5 text-xs text-foreground/80">
          Drag and drop your CSV file here, or click to browse
        </p>
        <p className="mt-0.5 text-[11px] text-foreground/50">CSV files only</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
