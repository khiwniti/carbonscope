'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Check, Download, Share2, Copy, Mail, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';

/**
 * Success States Component Library
 * Success confirmations with toasts and modals
 * WCAG 2.1 AA compliant
 */

// ============================================================================
// Success Toast Helpers
// ============================================================================

interface SuccessToastOptions {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export function showSuccessToast({ title, description, action, duration = 4000 }: SuccessToastOptions) {
  toast.success(title, {
    description,
    duration,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
    icon: <CheckCircle2 className="h-5 w-5" />,
  });
}

export function showInfoToast(message: string, duration = 3000) {
  toast.info(message, { duration });
}

export function showWarningToast(message: string, duration = 4000) {
  toast.warning(message, { duration });
}

// ============================================================================
// Specific Success Toast Patterns
// ============================================================================

export const SuccessToasts = {
  // File Operations
  fileUploaded: (fileName: string) => {
    showSuccessToast({
      title: 'File uploaded successfully',
      description: `${fileName} has been uploaded and is ready to use.`,
    });
  },

  fileDeleted: (fileName: string) => {
    showSuccessToast({
      title: 'File deleted',
      description: `${fileName} has been removed.`,
    });
  },

  fileDownloaded: (fileName: string) => {
    showSuccessToast({
      title: 'Download started',
      description: `${fileName} is being downloaded.`,
      duration: 2000,
    });
  },

  // Data Operations
  saved: (itemName?: string) => {
    showSuccessToast({
      title: 'Changes saved',
      description: itemName ? `${itemName} has been updated successfully.` : 'Your changes have been saved.',
    });
  },

  created: (itemName: string, itemType?: string) => {
    showSuccessToast({
      title: `${itemType || 'Item'} created`,
      description: `${itemName} has been created successfully.`,
    });
  },

  deleted: (itemName: string, itemType?: string) => {
    showSuccessToast({
      title: `${itemType || 'Item'} deleted`,
      description: `${itemName} has been removed.`,
    });
  },

  updated: (itemName: string) => {
    showSuccessToast({
      title: 'Updated successfully',
      description: `${itemName} has been updated.`,
    });
  },

  // User Actions
  copied: (itemName?: string) => {
    showSuccessToast({
      title: 'Copied to clipboard',
      description: itemName ? `${itemName} has been copied.` : 'Content copied to clipboard.',
      duration: 2000,
    });
  },

  shared: (recipientCount?: number) => {
    showSuccessToast({
      title: 'Shared successfully',
      description: recipientCount ? `Shared with ${recipientCount} ${recipientCount === 1 ? 'person' : 'people'}.` : 'Link has been shared.',
    });
  },

  invited: (emailCount: number) => {
    showSuccessToast({
      title: 'Invitations sent',
      description: `${emailCount} ${emailCount === 1 ? 'invitation has' : 'invitations have'} been sent.`,
    });
  },

  // Settings
  settingsSaved: () => {
    showSuccessToast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    });
  },

  passwordChanged: () => {
    showSuccessToast({
      title: 'Password changed',
      description: 'Your password has been updated successfully.',
    });
  },

  emailVerified: () => {
    showSuccessToast({
      title: 'Email verified',
      description: 'Your email address has been confirmed.',
    });
  },

  // Generic
  success: (message: string, description?: string) => {
    showSuccessToast({ title: message, description });
  },
};

// ============================================================================
// Success Modal Component
// ============================================================================

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
    icon?: React.ReactNode;
  }>;
  icon?: React.ReactNode;
  className?: string;
}

export function SuccessModal({ isOpen, onClose, title, description, actions, icon, className }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      aria-describedby="success-modal-description"
      onClick={onClose}
    >
      <div
        className={cn('bg-card rounded-2xl border border-border p-8 max-w-md w-full mx-4 shadow-2xl', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
            {icon || <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />}
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3 mb-6">
          <h2 id="success-modal-title" className="text-2xl font-semibold text-foreground">
            {title}
          </h2>
          <p id="success-modal-description" className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {actions && actions.length > 0 ? (
            actions.map((action, index) => (
              <Button
                key={index}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                variant={action.variant || 'default'}
                className="w-full"
                aria-label={action.label}
              >
                {action.icon}
                {action.label}
              </Button>
            ))
          ) : (
            <Button onClick={onClose} className="w-full" aria-label="Close success message">
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Inline Success Message
// ============================================================================

interface InlineSuccessProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function InlineSuccess({ message, onDismiss, className }: InlineSuccessProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">{message}</p>
      </div>
      {onDismiss && (
        <Button size="sm" variant="ghost" onClick={onDismiss} className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40" aria-label="Dismiss success message">
          ×
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Success Banner
// ============================================================================

interface SuccessBannerProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  onDismiss?: () => void;
  className?: string;
}

export function SuccessBanner({ title, description, action, onDismiss, className }: SuccessBannerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 p-6',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-2 shrink-0">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-100 mb-1">{title}</h3>
          {description && <p className="text-sm text-emerald-700 dark:text-emerald-300">{description}</p>}
          {action && (
            <Button
              onClick={action.onClick}
              variant="outline"
              size="sm"
              className="mt-3 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
              aria-label={action.label}
            >
              {action.icon}
              {action.label}
            </Button>
          )}
        </div>
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="shrink-0 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            aria-label="Dismiss success banner"
          >
            ×
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Compact Success Indicator
// ============================================================================

interface CompactSuccessProps {
  message: string;
  className?: string;
}

export function CompactSuccess({ message, className }: CompactSuccessProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400', className)} role="status" aria-live="polite">
      <Check className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}

// ============================================================================
// Action Success with Quick Actions
// ============================================================================

interface ActionSuccessProps {
  title: string;
  description: string;
  quickActions?: Array<{
    label: string;
    onClick: () => void;
    icon: React.ReactNode;
  }>;
  className?: string;
}

export function ActionSuccess({ title, description, quickActions, className }: ActionSuccessProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-2 shrink-0">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-100 mb-1">{title}</h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{description}</p>
        </div>
      </div>

      {quickActions && quickActions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 w-full mb-2">Quick actions:</p>
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant="outline"
              size="sm"
              className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
              aria-label={action.label}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Common Quick Actions
// ============================================================================

export const QuickActions = {
  download: (onClick: () => void) => ({
    label: 'Download',
    onClick,
    icon: <Download className="h-4 w-4" />,
  }),
  share: (onClick: () => void) => ({
    label: 'Share',
    onClick,
    icon: <Share2 className="h-4 w-4" />,
  }),
  copy: (onClick: () => void) => ({
    label: 'Copy link',
    onClick,
    icon: <Copy className="h-4 w-4" />,
  }),
  email: (onClick: () => void) => ({
    label: 'Email',
    onClick,
    icon: <Mail className="h-4 w-4" />,
  }),
  view: (onClick: () => void) => ({
    label: 'View',
    onClick,
    icon: <ExternalLink className="h-4 w-4" />,
  }),
};
