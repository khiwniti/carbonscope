import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-[100dvh] w-full max-w-md mx-auto flex flex-col items-center justify-center bg-gray-50 p-6 text-center font-sarabun shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={40} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">ขออภัย เกิดข้อผิดพลาด</h1>
            <p className="text-gray-500 mb-8 max-w-xs">
                ระบบขัดข้องชั่วคราว ทีมงานได้รับรายงานแล้วและกำลังดำเนินการแก้ไข
            </p>
            <div className="bg-gray-100 p-4 rounded-xl text-left text-xs text-gray-600 font-mono w-full max-w-sm overflow-auto mb-8 max-h-40 border border-gray-200">
                {this.state.error?.toString()}
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="bg-black text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg active:scale-95 transition"
            >
                <RefreshCw size={18} className="mr-2" />
                โหลดหน้าใหม่
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;