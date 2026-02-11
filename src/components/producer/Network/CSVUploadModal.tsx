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
import { Checkbox } from '@/components/ui/checkbox';
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
  const optionalHeaders = ['phone', 'business_name', 'instagram_handle', 'tiktok_handle', 'website', 'location', 'tags', 'notes'];
  const allExpectedHeaders = [...requiredHeaders, ...optionalHeaders];

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
      preview: 10, // Only parse first 10 rows for preview
      complete: (results) => {
        console.log('📊 CSV preview parsed:', {
          headers: results.meta.fields,
          previewRows: results.data.length,
          errors: results.errors
        });

        const headers = results.meta.fields || [];

        // Check for required headers
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          console.error('❌ Missing required headers:', missingHeaders);
          setErrorMessage(`Missing required columns: ${missingHeaders.join(', ')}`);
          setState('error');
          return;
        }

        // Count total rows (need to parse entire file)
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
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
    <div className="space-y-4">
      {/* Template Download */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
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
        className="border-2 border-dashed border-purple-500/40 bg-white/5 rounded-lg p-12 text-center hover:border-purple-500 hover:bg-white/10 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-purple-400" />
        <p className="mt-2 text-sm text-white/80">
          Drag and drop your CSV file here, or click to browse
        </p>
        <p className="mt-1 text-xs text-white/60">CSV files only</p>
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
    <div className="space-y-4">
      {/* File Info */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>{selectedFile?.name}</strong> ({previewData?.totalRows} contacts)
        </AlertDescription>
      </Alert>

      {/* Preview Table */}
      <div className="border border-purple-500/20 rounded-lg overflow-hidden bg-white/5">
        <div className="bg-purple-500/10 px-3 py-2 border-b border-purple-500/20">
          <h4 className="text-sm font-medium text-white">Preview (first 10 rows)</h4>
        </div>
        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-xs">
            <thead className="bg-white/5 sticky top-0">
              <tr>
                {previewData?.headers.map((header) => (
                  <th
                    key={header}
                    className="px-2 py-1.5 text-left font-medium text-white/90 border-b border-purple-500/20 whitespace-nowrap"
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
                <tr key={idx} className="border-b border-purple-500/10 hover:bg-white/5">
                  {previewData.headers.map((header) => (
                    <td key={header} className="px-2 py-1.5 text-white/70">
                      <div className="truncate max-w-[120px]" title={row[header] || ''}>
                        {row[header] || <span className="text-white/40">—</span>}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Options */}
      <div className="space-y-3 border border-purple-500/20 rounded-lg p-3 bg-white/5">
        <h4 className="text-xs font-medium text-white">Import Options</h4>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="skip-duplicates"
            checked={skipDuplicates}
            onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
          />
          <Label htmlFor="skip-duplicates" className="text-xs cursor-pointer text-white/90">
            Skip duplicates (based on email)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="update-existing"
            checked={updateExisting}
            onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
          />
          <Label htmlFor="update-existing" className="text-xs cursor-pointer text-white/90">
            Update existing contacts (if email matches)
          </Label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bulk-tags" className="text-xs text-white/90">
            Add tags to all imported contacts (comma-separated)
          </Label>
          <Input
            id="bulk-tags"
            placeholder="e.g., imported, 2025, summer-vendors"
            value={bulkTags}
            onChange={(e) => setBulkTags(e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={handleReset} size="sm">
          Choose Different File
        </Button>
        <Button onClick={handleUpload} size="sm">
          Import {previewData?.totalRows} Contacts
        </Button>
      </div>
    </div>
  );

  const renderUploadingState = () => (
    <div className="space-y-4 py-8">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Importing contacts...</p>
        <p className="text-sm text-gray-500 mt-2">
          This may take a few moments for large files
        </p>
      </div>
    </div>
  );

  const renderSuccessState = () => (
    <div className="space-y-4">
      {/* Success Header */}
      <div className="flex items-center justify-center py-4">
        <CheckCircle2 className="h-12 w-12 text-green-400" />
      </div>
      <h3 className="text-lg font-medium text-center text-white">Import Complete!</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-green-500/30 bg-green-500/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {importResult?.summary.created}
          </div>
          <div className="text-sm text-white/70">Created</div>
        </div>

        {importResult && importResult.summary.updated > 0 && (
          <div className="border border-blue-500/30 bg-blue-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {importResult.summary.updated}
            </div>
            <div className="text-sm text-white/70">Updated</div>
          </div>
        )}

        {importResult && importResult.summary.skipped > 0 && (
          <div className="border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {importResult.summary.skipped}
            </div>
            <div className="text-sm text-white/70">Skipped</div>
          </div>
        )}

        {importResult && importResult.summary.failed > 0 && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {importResult.summary.failed}
            </div>
            <div className="text-sm text-white/70">Failed</div>
          </div>
        )}
      </div>

      {/* Errors */}
      {importResult && importResult.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                {importResult.errors.length} row(s) had errors:
              </p>
              <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                {importResult.errors.slice(0, 5).map((error, idx) => (
                  <div key={idx}>
                    Row {error.row}: {error.message}
                  </div>
                ))}
                {importResult.errors.length > 5 && (
                  <div className="text-gray-500">
                    ...and {importResult.errors.length - 5} more errors
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadErrorReport(importResult.errors)}
                className="mt-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Error Report
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleReset}>
          Import Another File
        </Button>
        <Button onClick={() => {
          onSuccess(); // Refresh parent list
          handleClose(); // Then close modal
        }}>Done</Button>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="space-y-4">
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Import Failed</p>
            <p>{errorMessage}</p>
            {selectedFile && (
              <p className="text-sm opacity-75">
                File: {selectedFile.name} ({previewData?.totalRows || 0} rows)
              </p>
            )}
            <p className="text-xs opacity-75 mt-2">
              💡 Tip: Check the browser console (F12) for detailed error logs
            </p>
          </div>
        </AlertDescription>
      </Alert>
      <div className="flex justify-end">
        <Button onClick={handleReset}>Try Again</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] max-w-4xl max-h-[85vh] overflow-y-auto bg-[#1a0f2e]/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl text-white mb-2">Import Contacts from CSV</DialogTitle>
          <DialogDescription className="text-white/70 text-sm">
            Upload a CSV file to bulk import vendor contacts
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {state === 'idle' && renderIdleState()}
          {state === 'validating' && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
