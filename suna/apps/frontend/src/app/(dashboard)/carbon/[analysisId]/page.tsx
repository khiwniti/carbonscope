'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Download, Leaf, AlertTriangle, CheckCircle,
  BarChart3, FileSpreadsheet, Loader2, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { backendApi } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

interface MaterialResult {
  line_number: number;
  description_th: string;
  description_en: string | null;
  quantity: number;
  unit: string;
  tgo_material: string | null;
  emission_factor: number | null;
  carbon_kgco2e: number | null;
  confidence: number;
  classification: string;
}

interface AnalysisData {
  analysis_id: string;
  status: string;
  total_carbon_kgco2e: number | null;
  materials: MaterialResult[];
  breakdown_by_category: Record<string, number>;
  match_statistics: Record<string, number | string>;
  created_at: string;
  error: string | null;
}

const classificationColor: Record<string, string> = {
  auto_match: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  review_required: 'text-amber-600 bg-amber-50 border-amber-200',
  rejected: 'text-red-600 bg-red-50 border-red-200',
  unmatched: 'text-zinc-500 bg-zinc-50 border-zinc-200',
};

const classificationLabel: Record<string, string> = {
  auto_match: 'Matched',
  review_required: 'Review',
  rejected: 'Rejected',
  unmatched: 'Unmatched',
};

export default function AnalysisResultsPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId) return;

    async function load() {
      try {
        const result = await backendApi.get<AnalysisData>(`/boq/${analysisId}`);
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to load analysis');
        }
        setData(result.data);
      } catch (err) {
        logger.error('Load analysis error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [analysisId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading analysis results…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error || 'Analysis not found'}</p>
        <Button variant="outline" onClick={() => router.push('/carbon')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Carbon Analysis
        </Button>
      </div>
    );
  }

  const matchedCount = data.materials.filter(m => m.classification === 'auto_match').length;
  const matchRate = data.materials.length > 0 ? (matchedCount / data.materials.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/carbon')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Carbon</p>
                <p className="text-xl font-semibold">
                  {data.total_carbon_kgco2e != null
                    ? `${data.total_carbon_kgco2e.toLocaleString()} kgCO₂e`
                    : '—'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Materials Parsed</p>
                <p className="text-xl font-semibold">{data.materials.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                matchRate >= 80 ? 'bg-emerald-500/10' : matchRate >= 50 ? 'bg-amber-500/10' : 'bg-red-500/10'
              )}>
                {matchRate >= 80
                  ? <CheckCircle className="h-5 w-5 text-emerald-500" />
                  : <AlertTriangle className={cn('h-5 w-5', matchRate >= 50 ? 'text-amber-500' : 'text-red-500')} />
                }
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Match Rate</p>
                <p className="text-xl font-semibold">{matchRate.toFixed(0)}%</p>
                <Progress value={matchRate} className="mt-1 h-1.5 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carbon pending notice */}
      {data.total_carbon_kgco2e == null && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Carbon calculation pending</p>
            <p className="text-xs mt-0.5 opacity-80">
              Full carbon calculation requires GraphDB with TGO emission factors. Material matching is complete.
            </p>
          </div>
        </div>
      )}

      {/* Materials Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Material Breakdown
            <Badge variant="secondary" className="ml-auto text-xs font-normal">
              {data.materials.length} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs w-10">#</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Description (Thai)</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs w-24">Quantity</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs w-16">Unit</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">TGO Material</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs w-28">Carbon (kgCO₂e)</th>
                  <th className="px-4 py-2.5 text-center font-medium text-muted-foreground text-xs w-24">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.materials.map((mat) => (
                  <tr key={mat.line_number} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{mat.line_number}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{mat.description_th}</p>
                      {mat.description_en && (
                        <p className="text-xs text-muted-foreground mt-0.5">{mat.description_en}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{mat.quantity.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{mat.unit}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {mat.tgo_material || <span className="italic opacity-50">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-xs">
                      {mat.carbon_kgco2e != null
                        ? mat.carbon_kgco2e.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : <span className="italic text-muted-foreground">pending</span>
                      }
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                        classificationColor[mat.classification] ?? 'text-zinc-500 bg-zinc-50 border-zinc-200'
                      )}>
                        {classificationLabel[mat.classification] ?? mat.classification}
                        {mat.confidence > 0 && (
                          <span className="ml-1 opacity-60">{(mat.confidence * 100).toFixed(0)}%</span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
