'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileSpreadsheet, ArrowRight, Loader2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { backendApi } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

interface RecentAnalysis {
  analysis_id: string;
  filename: string;
  status: string;
  materials_count: number;
  created_at: string;
}

export default function CarbonPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recentAnalyses] = useState<RecentAnalysis[]>([]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Only Excel files (.xlsx, .xls) are accepted');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File must be under 50 MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', 'th');

    try {
      const result = await backendApi.upload('/boq/upload', formData);
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Upload failed');
      }
      toast.success(`Parsed ${result.data.materials_count} materials`);
      router.push(`/carbon/${result.data.analysis_id}`);
    } catch (err) {
      logger.error('BOQ upload error:', err);
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [router]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Carbon Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a Thai BOQ Excel file to calculate embodied carbon and get AI recommendations.
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Upload BOQ File
          </CardTitle>
          <CardDescription>
            Accepts Thai BOQ Excel files (.xlsx, .xls) up to 50 MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label
            htmlFor="boq-upload"
            className={cn(
              'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30',
              isUploading && 'pointer-events-none opacity-60'
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              id="boq-upload"
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              onChange={handleInputChange}
              disabled={isUploading}
              aria-label="Upload BOQ Excel file"
            />

            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div className="text-center">
                  <p className="font-medium text-foreground">Analysing BOQ…</p>
                  <p className="text-sm text-muted-foreground mt-1">Parsing materials and matching to TGO database</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">
                    {isDragging ? 'Drop file here' : 'Drag & drop your BOQ file'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or <span className="text-primary underline underline-offset-2">browse files</span>
                  </p>
                </div>
              </>
            )}
          </label>

          {/* Format guide */}
          <div className="mt-4 flex gap-2 rounded-lg border border-border bg-muted/30 p-3">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Expected BOQ format:</p>
              <p>Columns: รายการ (Description) · หน่วย (Unit) · จำนวน (Quantity)</p>
              <p>Supported units: ม³, กก, ม², ตัน, ชุด and English equivalents</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      {recentAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentAnalyses.map((a) => (
                <button
                  key={a.analysis_id}
                  onClick={() => router.push(`/carbon/${a.analysis_id}`)}
                  className="flex w-full items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.filename}</p>
                      <p className="text-xs text-muted-foreground">{a.materials_count} materials</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <Badge variant={a.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {a.status}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state hint */}
      {recentAnalyses.length === 0 && !isUploading && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Upload your first BOQ file to see carbon analysis results here.</span>
        </div>
      )}
    </div>
  );
}
