import { useState } from 'react'
import { Database, Download } from 'lucide-react'
import FullDataExportModal from './FullDataExportModal'

interface FullDataExportSectionProps {
  organizationId: number
  organizationSlug: string
}

export default function FullDataExportSection({
  organizationId,
  organizationSlug,
}: FullDataExportSectionProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="rounded-lg border border-border bg-card dark:bg-card/90 p-4">
        <div className="flex items-start gap-3 mb-3">
          <Database className="w-4 h-4 text-foreground/60 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm text-foreground font-semibold mb-0.5">Data Export</h3>
            <p className="text-xs text-muted-foreground">
              Review and download all your events, contacts, and vendor registrations. Use this for
              full backups, compliance, or switching providers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-accent/60 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Open Data Export</span>
        </button>
      </div>

      <FullDataExportModal
        open={showModal}
        onClose={() => setShowModal(false)}
        organizationId={organizationId}
        organizationSlug={organizationSlug}
      />
    </>
  )
}
