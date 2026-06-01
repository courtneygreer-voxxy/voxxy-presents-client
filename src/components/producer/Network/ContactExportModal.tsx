import { useState } from 'react';
import { X, Download, Loader2, Check } from 'lucide-react';
import type { VendorContact } from '@/services/api';
import { EXPORT_COLUMNS, getDefaultColumnKeys, contactsToCsv, triggerCsvDownload } from './contactsCsvExport';

interface ContactExportModalProps {
  open: boolean;
  onClose: () => void;
  contactCount: number;
  organizationSlug: string;
  fetchAllContacts: () => Promise<VendorContact[]>;
}

export default function ContactExportModal({
  open,
  onClose,
  contactCount,
  organizationSlug,
  fetchAllContacts,
}: ContactExportModalProps) {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(() => getDefaultColumnKeys());
  const [isExporting, setIsExporting] = useState(false);

  const toggleColumn = (key: string) => {
    setSelectedColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelectedColumns(new Set(EXPORT_COLUMNS.map(c => c.key)));
  const selectNone = () => setSelectedColumns(new Set());

  const handleExport = async () => {
    if (selectedColumns.size === 0) return;
    setIsExporting(true);
    try {
      const contacts = await fetchAllContacts();
      const csv = contactsToCsv(contacts, selectedColumns);
      const date = new Date().toISOString().slice(0, 10);
      triggerCsvDownload(csv, `contacts-export-${organizationSlug}-${date}.csv`);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to export contacts');
    } finally {
      setIsExporting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="voxxy-overlay-scrim fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="voxxy-modal-surface w-full max-w-lg rounded-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="voxxy-gradient-modal-header flex items-center justify-between border-b border-primary/20 px-5 py-3 flex-shrink-0 rounded-t-xl">
          <div>
            <h2 className="text-base font-semibold text-foreground">Export Contacts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {contactCount} contact{contactCount !== 1 ? 's' : ''} will be exported
            </p>
          </div>
          <button onClick={onClose} className="text-foreground/60 hover:text-foreground transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Column selection */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-foreground/70">
              Select columns ({selectedColumns.size} of {EXPORT_COLUMNS.length})
            </p>
            <div className="flex items-center gap-2">
              <button onClick={selectAll} className="text-[11px] text-primary hover:text-primary/80 transition-colors">
                All
              </button>
              <span className="text-foreground/30">|</span>
              <button onClick={selectNone} className="text-[11px] text-primary hover:text-primary/80 transition-colors">
                None
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {EXPORT_COLUMNS.map(col => {
              const isSelected = selectedColumns.has(col.key);
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleColumn(col.key)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-all text-left ${
                    isSelected
                      ? 'bg-primary/15 text-foreground border border-primary/30'
                      : 'bg-card/50 text-foreground/60 border border-border hover:bg-accent/40 hover:text-foreground/80 dark:bg-card/30'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-primary/50 border-primary' : 'border-border'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-foreground" strokeWidth={3} />}
                  </div>
                  <span className="truncate">{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-lg border border-border text-foreground hover:bg-background/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selectedColumns.size === 0 || isExporting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg voxxy-btn-cta disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
