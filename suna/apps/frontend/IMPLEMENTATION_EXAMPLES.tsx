/**
 * UI/UX Component Implementation Examples
 * Real-world usage patterns for SUNA BIM project
 *
 * Copy these examples and adapt them to your needs
 */

import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  DashboardSkeleton,
  Spinner,
  ProgressLoading,
  InlineLoading,
} from '@/components/ui/loading-states';
import {
  ErrorState,
  InlineError,
  NetworkError,
  ValidationErrors,
} from '@/components/ui/error-states';
import {
  NoDocuments,
  NoResults,
  FirstTimeExperience,
} from '@/components/ui/empty-states';
import {
  SuccessToasts,
  showSuccessToast,
  ActionSuccess,
} from '@/components/ui/success-states';
import {
  FormField,
  SkipToContent,
  Landmarks,
} from '@/components/ui/accessibility';
import { useIsMobile, useDeviceType } from '@/hooks/use-responsive';
import { Button } from '@/components/ui/button';

// ============================================================================
// Example 1: Data Fetching with Loading/Error/Empty States
// ============================================================================

export function BOQDocumentList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['boq-documents'],
    queryFn: fetchBOQDocuments,
  });

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load BOQ documents"
        message="We couldn't retrieve your Bill of Quantities documents. Please try again or contact support if the problem persists."
        onRetry={refetch}
        showRetry
        showGoBack
      />
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <NoDocuments
        onUpload={() => handleUploadModal()}
        onCreate={() => handleCreateNew()}
      />
    );
  }

  // Success state - render data
  return (
    <div className="space-y-4">
      {data.map((doc) => (
        <BOQCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}

// ============================================================================
// Example 2: Form with Validation and Success Toast
// ============================================================================

export function MaterialSubmissionForm() {
  const [errors, setErrors] = React.useState<string[]>([]);
  const isMobile = useIsMobile();

  const mutation = useMutation({
    mutationFn: submitMaterial,
    onSuccess: (data) => {
      SuccessToasts.created(data.name, 'Material');
      // Navigate or reset form
    },
    onError: (error) => {
      setErrors([error.message]);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Skip to content for accessibility */}
      <SkipToContent contentId="material-form" />

      {/* Validation errors */}
      {errors.length > 0 && (
        <ValidationErrors
          errors={errors}
          onDismiss={() => setErrors([])}
        />
      )}

      {/* Accessible form fields */}
      <FormField
        label="Material Name"
        htmlFor="material-name"
        required
        hint="Enter the Thai or English name"
      >
        <input
          id="material-name"
          type="text"
          className="w-full rounded-2xl border p-3"
          disabled={mutation.isPending}
        />
      </FormField>

      <FormField
        label="Carbon Footprint (kg CO2e)"
        htmlFor="carbon"
        required
        hint="Based on TGO emission factors"
      >
        <input
          id="carbon"
          type="number"
          step="0.01"
          className="w-full rounded-2xl border p-3"
          disabled={mutation.isPending}
        />
      </FormField>

      {/* Submit button with loading state */}
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full"
      >
        {mutation.isPending ? (
          <InlineLoading text="Submitting..." size="sm" />
        ) : (
          'Submit Material'
        )}
      </Button>
    </form>
  );
}

// ============================================================================
// Example 3: Search with No Results
// ============================================================================

export function MaterialSearch() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['materials', searchTerm],
    queryFn: () => searchMaterials(searchTerm),
    enabled: searchTerm.length > 0,
  });

  if (isLoading) {
    return <Spinner label="Searching materials..." />;
  }

  if (searchTerm && data?.length === 0) {
    return (
      <NoResults
        searchTerm={searchTerm}
        onClear={() => setSearchTerm('')}
        suggestions={[
          'Try using Thai characters: คอนกรีต, เหล็ก',
          'Check your spelling',
          'Use more general terms',
          'Browse all materials instead',
        ]}
      />
    );
  }

  return (
    <div>
      <input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search materials..."
        className="w-full rounded-2xl border p-3"
      />
      {/* Render results */}
    </div>
  );
}

// ============================================================================
// Example 4: File Upload with Progress
// ============================================================================

export function BOQFileUploader() {
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload with progress
      const result = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      SuccessToasts.fileUploaded(file.name);

      // Show success with quick actions
      showSuccessToast({
        title: 'BOQ uploaded successfully',
        description: `${file.name} is being processed. Carbon calculations will be available shortly.`,
        action: {
          label: 'View Analysis',
          onClick: () => navigateTo(`/analysis/${result.id}`),
        },
      });
    } catch (error) {
      // Error handling
      setIsUploading(false);
    }
  };

  if (isUploading) {
    return (
      <div className="space-y-4 p-6 rounded-2xl border border-border">
        <ProgressLoading
          progress={uploadProgress}
          label="Uploading BOQ file"
        />
        <p className="text-sm text-muted-foreground text-center">
          Please don't close this window...
        </p>
      </div>
    );
  }

  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUpload(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}

// ============================================================================
// Example 5: Responsive Layout
// ============================================================================

export function CarbonAnalysisDashboard() {
  const deviceType = useDeviceType();
  const isMobile = useIsMobile();

  return (
    <Landmarks.Main id="main-content">
      <div className="container mx-auto p-4">
        {/* Responsive grid */}
        <div
          className={`grid gap-4 ${
            deviceType === 'mobile'
              ? 'grid-cols-1'
              : deviceType === 'tablet'
              ? 'grid-cols-2'
              : 'grid-cols-4'
          }`}
        >
          <StatCard title="Total Carbon" value="1,234 kg CO2e" />
          <StatCard title="TREES Credits" value="8/10" />
          <StatCard title="EDGE Progress" value="18%" />
          <StatCard title="Cost Savings" value="฿45,000" />
        </div>

        {/* Responsive text */}
        <h2
          className={`font-bold ${
            isMobile ? 'text-xl' : 'text-3xl'
          } mt-8 mb-4`}
        >
          Carbon Breakdown by Category
        </h2>

        {/* Charts */}
        <div
          className={`${
            isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-2 gap-6'
          }`}
        >
          <CarbonPieChart />
          <CarbonBarChart />
        </div>
      </div>
    </Landmarks.Main>
  );
}

// ============================================================================
// Example 6: Network Error Handling
// ============================================================================

export function DataSyncStatus() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <NetworkError
        onRetry={() => window.location.reload()}
      />
    );
  }

  return null; // or your component content
}

// ============================================================================
// Example 7: First Time User Onboarding
// ============================================================================

export function ProjectOnboarding({ isFirstTime }: { isFirstTime: boolean }) {
  if (!isFirstTime) return null;

  return (
    <FirstTimeExperience
      title="Welcome to SUNA BIM!"
      description="Let's get started with your first carbon footprint analysis. Follow these simple steps to calculate emissions for your construction project."
      steps={[
        'Upload your Bill of Quantities (BOQ) Excel file',
        'Review the material matching and carbon calculations',
        'Explore alternative materials to reduce emissions',
        'Generate TREES/EDGE certification reports',
      ]}
      onGetStarted={() => handleStartTutorial()}
      onSkipTutorial={() => handleSkipTutorial()}
    />
  );
}

// ============================================================================
// Example 8: Success with Quick Actions
// ============================================================================

export function ReportGenerated({ reportId }: { reportId: string }) {
  return (
    <ActionSuccess
      title="Carbon Report Generated"
      description="Your comprehensive carbon footprint analysis is ready. The report includes TREES/EDGE compliance status and material recommendations."
      quickActions={[
        {
          label: 'Download PDF',
          onClick: () => downloadPDF(reportId),
          icon: <DownloadIcon className="h-4 w-4" />,
        },
        {
          label: 'Share Report',
          onClick: () => shareReport(reportId),
          icon: <ShareIcon className="h-4 w-4" />,
        },
        {
          label: 'View Online',
          onClick: () => viewReport(reportId),
          icon: <ExternalLinkIcon className="h-4 w-4" />,
        },
      ]}
    />
  );
}

// ============================================================================
// Example 9: Inline Error with Retry
// ============================================================================

export function MaterialCalculationCard({ materialId }: { materialId: string }) {
  const { data, error, refetch } = useQuery({
    queryKey: ['material-carbon', materialId],
    queryFn: () => calculateCarbon(materialId),
    retry: 2,
  });

  return (
    <div className="p-4 rounded-2xl border border-border">
      <h3 className="font-semibold mb-2">Carbon Calculation</h3>

      {error && (
        <InlineError
          message="Failed to calculate carbon footprint for this material."
          onRetry={refetch}
          severity="warning"
        />
      )}

      {data && (
        <div className="space-y-2">
          <p className="text-2xl font-bold text-emerald-primary">
            {data.carbonFootprint} kg CO2e
          </p>
          <p className="text-sm text-muted-foreground">
            Based on TGO emission factors
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 10: Thai Language Support
// ============================================================================

export function BilingualContent() {
  return (
    <div className="space-y-4">
      {/* Thai text with proper font */}
      <div lang="th" className="thai-text">
        <h2 className="text-2xl font-semibold mb-2">
          การคำนวณคาร์บอนฟุตพริ้นท์
        </h2>
        <p className="text-muted-foreground">
          ระบบคำนวณการปล่อยก๊าซคาร์บอนไดออกไซด์จากวัสดุก่อสร้าง
          ตามมาตรฐาน TGO และ TREES NC 1.1
        </p>
      </div>

      {/* English text */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Carbon Footprint Calculation
        </h2>
        <p className="text-muted-foreground">
          Calculate CO2 emissions from construction materials
          based on TGO standards and TREES NC 1.1
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Functions (Mock)
// ============================================================================

async function fetchBOQDocuments() {
  // Implementation
  return [];
}

async function submitMaterial(data: FormData) {
  // Implementation
  return { id: '1', name: 'Material' };
}

function validateForm(data: FormData): string[] {
  // Validation logic
  return [];
}

async function searchMaterials(term: string) {
  // Implementation
  return [];
}

async function uploadFile(
  file: File,
  onProgress: (progress: number) => void
) {
  // Upload implementation with progress callback
  return { id: '1' };
}

function handleUploadModal() {}
function handleCreateNew() {}
function handleStartTutorial() {}
function handleSkipTutorial() {}
function navigateTo(path: string) {}
function downloadPDF(id: string) {}
function shareReport(id: string) {}
function viewReport(id: string) {}
async function calculateCarbon(id: string) {
  return { carbonFootprint: 123.45 };
}

// Icon placeholders
const DownloadIcon = ({ className }: { className: string }) => <span />;
const ShareIcon = ({ className }: { className: string }) => <span />;
const ExternalLinkIcon = ({ className }: { className: string }) => <span />;

function StatCard({ title, value }: { title: string; value: string }) {
  return <div className="p-4 rounded-2xl border border-border">{/* ... */}</div>;
}

function BOQCard({ document }: { document: any }) {
  return <div>{/* ... */}</div>;
}

function CarbonPieChart() {
  return <div>{/* ... */}</div>;
}

function CarbonBarChart() {
  return <div>{/* ... */}</div>;
}
