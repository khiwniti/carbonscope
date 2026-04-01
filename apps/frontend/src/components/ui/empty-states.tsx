'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  FileText,
  Search,
  Plus,
  Upload,
  FolderOpen,
  Inbox,
  Database,
  AlertCircle,
  Filter,
  Archive,
  FileQuestion,
  Users,
  Settings,
  Bell,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { Button } from './button';

/**
 * Empty States Component Library
 * Guide users with contextual empty states and clear CTAs
 * WCAG 2.1 AA compliant
 */

// ============================================================================
// Base Empty State Component
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  illustration?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, secondaryAction, className, illustration }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
      role="status"
      aria-label={`Empty state: ${title}`}
    >
      {/* Icon or Illustration */}
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : (
        <div className="rounded-full bg-muted p-6 mb-6">
          {icon || <FileQuestion className="h-12 w-12 text-muted-foreground" />}
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          {action && (
            <Button onClick={action.onClick} size="lg" aria-label={action.label}>
              {action.icon || <Plus className="h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" size="lg" aria-label={secondaryAction.label}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Specialized Empty States
// ============================================================================

// No Results Found
interface NoResultsProps {
  searchTerm?: string;
  onClear?: () => void;
  suggestions?: string[];
  className?: string;
}

export function NoResults({ searchTerm, onClear, suggestions, className }: NoResultsProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)} role="status" aria-live="polite">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-3">No results found</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {searchTerm ? (
          <>
            We couldn't find anything matching <span className="font-semibold text-foreground">"{searchTerm}"</span>. Try adjusting your
            search or filters.
          </>
        ) : (
          'No items match your current filters. Try adjusting your search criteria.'
        )}
      </p>

      {suggestions && suggestions.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-foreground">Suggestions:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {onClear && (
        <Button onClick={onClear} variant="outline" aria-label="Clear all filters">
          <Filter className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

// No Documents/Files
interface NoDocumentsProps {
  onUpload?: () => void;
  onCreate?: () => void;
  className?: string;
}

export function NoDocuments({ onUpload, onCreate, className }: NoDocumentsProps) {
  return (
    <EmptyState
      icon={<FileText className="h-12 w-12 text-muted-foreground" />}
      title="No documents yet"
      description="Get started by uploading your first document or creating a new one from scratch."
      action={
        onCreate
          ? {
              label: 'Create document',
              onClick: onCreate,
              icon: <Plus className="h-4 w-4" />,
            }
          : undefined
      }
      secondaryAction={
        onUpload
          ? {
              label: 'Upload file',
              onClick: onUpload,
            }
          : undefined
      }
      className={className}
    />
  );
}

// No Data Available
interface NoDataProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
  className?: string;
}

export function NoData({ title = 'No data available', description = 'There is currently no data to display.', onRefresh, className }: NoDataProps) {
  return (
    <EmptyState
      icon={<Database className="h-12 w-12 text-muted-foreground" />}
      title={title}
      description={description}
      action={
        onRefresh
          ? {
              label: 'Refresh',
              onClick: onRefresh,
            }
          : undefined
      }
      className={className}
    />
  );
}

// Empty Inbox
interface EmptyInboxProps {
  onCompose?: () => void;
  className?: string;
}

export function EmptyInbox({ onCompose, className }: EmptyInboxProps) {
  return (
    <EmptyState
      icon={<Inbox className="h-12 w-12 text-muted-foreground" />}
      title="Inbox zero!"
      description="You're all caught up. No new messages or notifications at the moment."
      action={
        onCompose
          ? {
              label: 'Compose new',
              onClick: onCompose,
              icon: <Plus className="h-4 w-4" />,
            }
          : undefined
      }
      className={className}
    />
  );
}

// Empty Folder
interface EmptyFolderProps {
  folderName?: string;
  onAddItems?: () => void;
  className?: string;
}

export function EmptyFolder({ folderName, onAddItems, className }: EmptyFolderProps) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12 text-muted-foreground" />}
      title={folderName ? `"${folderName}" is empty` : 'This folder is empty'}
      description="Start organizing by adding items to this folder."
      action={
        onAddItems
          ? {
              label: 'Add items',
              onClick: onAddItems,
              icon: <Plus className="h-4 w-4" />,
            }
          : undefined
      }
      className={className}
    />
  );
}

// No Notifications
export function NoNotifications({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<Bell className="h-12 w-12 text-muted-foreground" />}
      title="No notifications"
      description="You're all set! We'll notify you when something important happens."
      className={className}
    />
  );
}

// No Calendar Events
interface NoEventsProps {
  onCreateEvent?: () => void;
  className?: string;
}

export function NoEvents({ onCreateEvent, className }: NoEventsProps) {
  return (
    <EmptyState
      icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
      title="No events scheduled"
      description="Your calendar is clear. Add an event to get started."
      action={
        onCreateEvent
          ? {
              label: 'Create event',
              onClick: onCreateEvent,
              icon: <Plus className="h-4 w-4" />,
            }
          : undefined
      }
      className={className}
    />
  );
}

// No Team Members
interface NoTeamMembersProps {
  onInvite?: () => void;
  className?: string;
}

export function NoTeamMembers({ onInvite, className }: NoTeamMembersProps) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12 text-muted-foreground" />}
      title="No team members yet"
      description="Invite your team to collaborate and work together more effectively."
      action={
        onInvite
          ? {
              label: 'Invite members',
              onClick: onInvite,
              icon: <Plus className="h-4 w-4" />,
            }
          : undefined
      }
      className={className}
    />
  );
}

// No Messages/Chat
interface NoMessagesProps {
  onStartChat?: () => void;
  className?: string;
}

export function NoMessages({ onStartChat, className }: NoMessagesProps) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-12 w-12 text-muted-foreground" />}
      title="No messages yet"
      description="Start a conversation to connect with others."
      action={
        onStartChat
          ? {
              label: 'Start chat',
              onClick: onStartChat,
              icon: <Plus className="h-4 w-4" />,
            }
          : undefined
      }
      className={className}
    />
  );
}

// Archived Items
interface ArchivedEmptyProps {
  onViewActive?: () => void;
  className?: string;
}

export function ArchivedEmpty({ onViewActive, className }: ArchivedEmptyProps) {
  return (
    <EmptyState
      icon={<Archive className="h-12 w-12 text-muted-foreground" />}
      title="No archived items"
      description="Items you archive will appear here for safekeeping."
      action={
        onViewActive
          ? {
              label: 'View active items',
              onClick: onViewActive,
            }
          : undefined
      }
      className={className}
    />
  );
}

// First Time User Experience
interface FirstTimeProps {
  title: string;
  description: string;
  onGetStarted: () => void;
  onSkipTutorial?: () => void;
  steps?: string[];
  className?: string;
}

export function FirstTimeExperience({ title, description, onGetStarted, onSkipTutorial, steps, className }: FirstTimeProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)} role="region" aria-label="Getting started">
      <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-6 mb-6">
        <Settings className="h-12 w-12 text-primary" />
      </div>

      <h2 className="text-2xl font-semibold text-foreground mb-3">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">{description}</p>

      {steps && steps.length > 0 && (
        <div className="mb-6 space-y-3 max-w-md text-left">
          <p className="text-sm font-medium text-foreground text-center">Here's how to get started:</p>
          <ol className="space-y-2">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={onGetStarted} size="lg" aria-label="Get started">
          Get started
        </Button>
        {onSkipTutorial && (
          <Button onClick={onSkipTutorial} variant="outline" size="lg" aria-label="Skip tutorial">
            Skip tutorial
          </Button>
        )}
      </div>
    </div>
  );
}

// Error State with Empty Appearance
interface ErrorEmptyStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  className?: string;
}

export function ErrorEmptyState({ title, description, onRetry, onContactSupport, className }: ErrorEmptyStateProps) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-12 w-12 text-destructive" />}
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: 'Try again',
              onClick: onRetry,
            }
          : undefined
      }
      secondaryAction={
        onContactSupport
          ? {
              label: 'Contact support',
              onClick: onContactSupport,
            }
          : undefined
      }
      className={className}
    />
  );
}
