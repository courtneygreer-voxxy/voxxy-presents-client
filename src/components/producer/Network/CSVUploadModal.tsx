import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { vendorContactsApi, BulkImportResult } from '@/services/api';
import {
  downloadCSVTemplate,
  downloadErrorReport,
} from '@/utils/csvTemplateGenerator';

interface CSVUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UploadState = 'idle' | 'file_selected' | 'validating' | 'uploading' | 'success' | 'error';

interface CSVPreviewData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export function CSVUploadModal({ open, onClose, onSuccess }: CSVUploadModalProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CSVPreviewData | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [bulkTags, setBulkTags] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredHeaders = ['name', 'email'];
  const optionalHeaders = ['phone', 'business_name', 'instagram_handle', 'tiktok_handle', 'website', 'location', 'tags'];
  const allExpectedHeaders = [...requiredHeaders, ...optionalHeaders];
  const hiddenPreviewColumns = ['notes', 'featured', 'status', 'job_title', 'job title'];

  const handleFileSelect = (file: File) => {
    console.log('📁 File selected:', { name: file.name, size: file.size, type: file.type });

    if (!file.name.endsWith('.csv')) {
      console.error('❌ Invalid file type:', file.name);
      setErrorMessage('Please select a CSV file');
      setState('error');
      return;
    }

    setSelectedFile(file);
    setState('validating');
    setErrorMessage('');

    // Parse CSV for preview
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase().replace(/^\uFEFF/, ''),
      preview: 10, // Only parse first 10 rows for preview
      complete: (results) => {
        console.log('📊 CSV preview parsed:', {
          headers: results.meta.fields,
          previewRows: results.data.length,
          errors: results.errors
        });

        const headers = results.meta.fields || [];

        // Check for required headers (case-insensitive, already lowercased by transformHeader)
        const normalizedHeaders = headers.map(h => h.replace(/\s+/g, '_'));
        const missingHeaders = requiredHeaders.filter(h => !normalizedHeaders.includes(h));
        if (missingHeaders.length > 0) {
          console.error('❌ Missing required headers:', missingHeaders, 'Found:', headers);
          setErrorMessage(`Missing required columns: ${missingHeaders.join(', ')}. Found columns: ${headers.join(', ')}`);
          setState('error');
          return;
        }

        // Count total rows (need to parse entire file)
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim().toLowerCase().replace(/^\uFEFF/, ''),
          complete: (fullResults) => {
            console.log('✅ Full CSV parsed:', {
              totalRows: fullResults.data.length,
              errors: fullResults.errors
            });

            setPreviewData({
              headers,
              rows: results.data as Record<string, string>[],
              totalRows: fullResults.data.length,
            });
            setState('file_selected');
          },
          error: (fullError) => {
            console.error('❌ Failed to parse full CSV:', fullError);
            setErrorMessage(`Failed to parse CSV: ${fullError.message}`);
            setState('error');
          },
        });
      },
      error: (error) => {
        console.error('❌ Failed to parse CSV preview:', error);
        setErrorMessage(`Failed to parse CSV: ${error.message}`);
        setState('error');
      },
    });
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setState('uploading');
    setErrorMessage('');

    try {
      console.log('🔄 Starting CSV import:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        totalRows: previewData?.totalRows,
        options: { skipDuplicates, updateExisting, tags: bulkTags }
      });

      const tags = bulkTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const result = await vendorContactsApi.bulkImport(selectedFile, {
        skipDuplicates,
        updateExisting,
        tags,
      });

      console.log('✅ Import successful:', result);

      setImportResult(result);
      setState('success');

      // Don't call onSuccess() here - let user see success screen first
      // onSuccess() will be called when they click "Done" button
    } catch (error) {
      console.error('❌ Import failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });

      const errorMsg = error instanceof Error ? error.message : 'Upload failed. Please check your file and try again.';
      setErrorMessage(errorMsg);
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    setErrorMessage('');
    setBulkTags('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const renderIdleState = () => (
    <div className="space-y-3">
      {/* Template Download */}
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

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-purple-500/40 bg-background/5 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-background/10 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-purple-400" />
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
    </div>
  );

  const renderFileSelectedState = () => (
    <div className="space-y-3">
      {/* File Info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-background/5 border border-purple-500/20 rounded-lg">
        <FileText className="h-3.5 w-3.5 text-purple-400 shrink-0" />
        <span className="text-xs text-foreground/90 truncate">
          <strong>{selectedFile?.name}</strong> — {previewData?.totalRows} contacts
        </span>
      </div>

      {/* Preview Table */}
      {(() => {
        const visibleHeaders = previewData?.headers.filter(h => !hiddenPreviewColumns.includes(h.toLowerCase())) || [];
        return (
          <div className="border border-purple-500/20 rounded-lg overflow-hidden bg-background/5">
            <div className="bg-purple-500/10 px-3 py-1.5 border-b border-purple-500/20">
              <h4 className="text-[11px] font-medium text-foreground/70 uppercase tracking-wide">Preview (first 10 rows)</h4>
            </div>
            <div className="overflow-x-auto max-h-[40vh]">
              <table className="w-full text-[11px]">
                <thead className="bg-background/5 sticky top-0">
                  <tr>
                    {visibleHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-2 py-1 text-left font-medium text-foreground/80 border-b border-purple-500/20 whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[100px]" title={header}>
                            {header}
                          </span>
                          {requiredHeaders.includes(header) && (
                            <span className="text-red-400">*</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData?.rows.map((row, idx) => (
                    <tr key={idx} className="border-b border-purple-500/10 hover:bg-background/5">
                      {visibleHeaders.map((header) => (
                        <td key={header} className="px-2 py-1 text-foreground/60">
                          <div className="truncate max-w-[150px]" title={row[header] || ''}>
                            {row[header] || <span className="text-foreground/30">—</span>}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Tags + Actions — pinned left so no horizontal scroll needed */}
      <div className="space-y-2">
        <div className="flex items-end gap-3 max-w-md">
          <div className="flex-1">
            <Label htmlFor="bulk-tags" className="text-[11px] text-foreground/70 mb-1 block">
              Tags (comma-separated)
            </Label>
            <Input
              id="bulk-tags"
              placeholder="e.g., imported, 2025, summer-vendors"
              value={bulkTags}
              onChange={(e) => setBulkTags(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleUpload} size="sm" className="text-xs h-8">
            Import {previewData?.totalRows} Contacts
          </Button>
          <Button variant="outline" onClick={handleReset} size="sm" className="text-xs h-8">
            Choose Different File
          </Button>
        </div>
      </div>
    </div>
  );

  const renderUploadingState = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <p className="text-sm font-medium">Importing contacts...</p>
      <p className="text-xs text-foreground/50 mt-1">
        This may take a moment for large files
      </p>
    </div>
  );

  const renderSuccessState = () => (
    <div className="space-y-3">
      {/* Success Header */}
      <div className="flex items-center gap-2 justify-center py-2">
        <CheckCircle2 className="h-6 w-6 text-green-400" />
        <h3 className="text-sm font-semibold text-foreground">Import Complete</h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-green-500/30 bg-green-500/10 rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-green-400">
            {importResult?.summary.created}
          </div>
          <div className="text-[11px] text-foreground/60">Created</div>
        </div>

        {importResult && importResult.summary.updated > 0 && (
          <div className="border border-blue-500/30 bg-blue-500/10 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-blue-400">
              {importResult.summary.updated}
            </div>
            <div className="text-[11px] text-foreground/60">Updated</div>
          </div>
        )}

        {importResult && importResult.summary.skipped > 0 && (
          <div className="border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {importResult.summary.skipped}
            </div>
            <div className="text-[11px] text-foreground/60">Skipped</div>
          </div>
        )}

        {importResult && importResult.summary.failed > 0 && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-red-400">
              {importResult.summary.failed}
            </div>
            <div className="text-[11px] text-foreground/60">Failed</div>
          </div>
        )}
      </div>

      {/* Errors */}
      {importResult && importResult.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertDescription>
            <div className="space-y-1.5">
              <p className="text-xs font-medium">
                {importResult.errors.length} row(s) had errors:
              </p>
              <div className="max-h-24 overflow-y-auto text-[11px] space-y-0.5">
                {importResult.errors.slice(0, 5).map((error, idx) => (
                  <div key={idx}>
                    Row {error.row}: {error.message}
                  </div>
                ))}
                {importResult.errors.length > 5 && (
                  <div className="text-foreground/50">
                    ...and {importResult.errors.length - 5} more errors
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadErrorReport(importResult.errors)}
                className="mt-1 h-7 text-[11px]"
              >
                <Download className="h-3 w-3 mr-1.5" />
                Download Error Report
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-1">
        <Button variant="outline" onClick={handleReset} size="sm" className="text-xs h-8">
          Import Another File
        </Button>
        <Button size="sm" className="text-xs h-8" onClick={() => {
          onSuccess(); // Refresh parent list
          handleClose(); // Then close modal
        }}>Done</Button>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="space-y-3">
      <Alert variant="destructive">
        <XCircle className="h-3.5 w-3.5" />
        <AlertDescription>
          <div className="space-y-1.5">
            <p className="text-xs font-medium">Import Failed</p>
            <p className="text-xs">{errorMessage}</p>
            {selectedFile && (
              <p className="text-[11px] opacity-75">
                File: {selectedFile.name} ({previewData?.totalRows || 0} rows)
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
      <div className="flex justify-end">
        <Button onClick={handleReset} size="sm" className="text-xs h-8">Try Again</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="voxxy-modal-surface max-h-[85vh] w-[95vw] max-w-5xl overflow-y-auto p-5">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base text-foreground">Import Contacts from CSV</DialogTitle>
          <DialogDescription className="text-foreground/60 text-xs">
            Upload a CSV file to bulk import vendor contacts
          </DialogDescription>
        </DialogHeader>

        <div>
          {state === 'idle' && renderIdleState()}
          {state === 'validating' && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {state === 'file_selected' && renderFileSelectedState()}
          {state === 'uploading' && renderUploadingState()}
          {state === 'success' && renderSuccessState()}
          {state === 'error' && renderErrorState()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
