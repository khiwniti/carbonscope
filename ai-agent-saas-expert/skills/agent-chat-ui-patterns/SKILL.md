---
name: Agent Chat UI Patterns
description: This skill should be used when the user asks about "agent chat UI", "streaming message rendering", "tool call display", "chat message bubbles", "agent conversation interface", "file upload in chat", "chat input component", "message actions", or when building or improving any React UI for AI agent conversations. Provides production-grade component patterns, rendering strategies, and accessibility guidance.
version: 0.2.0
---

# Agent Chat UI Patterns

Production-ready React/Next.js UI patterns for AI agent conversation interfaces — from the message bubble all the way to the full chat page layout.

---

## Message Rendering Architecture

### The Parts-Based Message Model

Modern AI SDK messages use a `parts` array rather than a monolithic `content` string. Every message renderer must handle all part types:

```typescript
// packages/shared/src/types/message.ts
export type MessagePart =
  | { type: 'text';        content: string }
  | { type: 'tool-call';   toolCallId: string; toolName: string; args: Record<string, unknown> }
  | { type: 'tool-result'; toolCallId: string; result: unknown; isError?: boolean }
  | { type: 'image';       url: string; alt?: string }
  | { type: 'file';        name: string; url: string; mimeType: string; size: number };

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: MessagePart[];
  createdAt: Date;
  metadata?: Record<string, unknown>;
}
```

### MessageRenderer Component

```tsx
// components/chat/MessageRenderer.tsx
'use client';
import { memo } from 'react';
import { StreamingText }    from './StreamingText';
import { ToolCallCard }     from './ToolCallCard';
import { ImagePart }        from './ImagePart';
import { FilePart }         from './FilePart';
import type { Message }     from '@/types/message';

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export const MessageRenderer = memo(function MessageRenderer({
  message,
  isStreaming = false,
}: Props) {
  return (
    <div className="space-y-2">
      {message.parts.map((part, i) => {
        switch (part.type) {
          case 'text':
            return (
              <StreamingText
                key={`text-${i}`}
                content={part.content}
                isStreaming={isStreaming && i === message.parts.length - 1}
              />
            );
          case 'tool-call':
          case 'tool-result': {
            // Find the paired call/result
            const callPart = message.parts.find(
              p => p.type === 'tool-call' && p.toolCallId === part.toolCallId,
            ) as Extract<MessagePart, { type: 'tool-call' }> | undefined;
            const resultPart = message.parts.find(
              p => p.type === 'tool-result' && p.toolCallId === part.toolCallId,
            ) as Extract<MessagePart, { type: 'tool-result' }> | undefined;

            // Render only once per toolCallId (from call side)
            if (part.type === 'tool-result') return null;

            return (
              <ToolCallCard
                key={`tool-${callPart?.toolCallId}`}
                toolCall={{
                  id: callPart!.toolCallId,
                  toolName: callPart!.toolName,
                  args: callPart!.args,
                  result: resultPart?.result,
                  status: resultPart
                    ? resultPart.isError ? 'error' : 'success'
                    : 'pending',
                }}
              />
            );
          }
          case 'image':
            return <ImagePart key={`img-${i}`} url={part.url} alt={part.alt} />;
          case 'file':
            return <FilePart key={`file-${i}`} {...part} />;
          default:
            return null;
        }
      })}
    </div>
  );
});
```

---

## MessageBubble Layout

```tsx
// components/chat/MessageBubble.tsx
'use client';
import { memo, useState } from 'react';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageRenderer } from './MessageRenderer';
import { AgentThinkingIndicator } from './AgentThinkingIndicator';
import type { Message } from '@/types/message';

interface Props {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  onFeedback?: (messageId: string, value: 'positive' | 'negative') => void;
  className?: string;
}

export const MessageBubble = memo(function MessageBubble({
  message, isStreaming, onRegenerate, onCopy, onFeedback, className,
}: Props) {
  const [showActions, setShowActions] = useState(false);
  const isUser = message.role === 'user';
  const isEmpty = message.parts.length === 0;

  return (
    <div
      className={cn(
        'group flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className,
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      )}>
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Content */}
      <div className={cn('max-w-[75%] space-y-1', isUser && 'items-end flex flex-col')}>
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted text-foreground rounded-tl-sm',
        )}>
          {isEmpty && isStreaming ? (
            <AgentThinkingIndicator />
          ) : (
            <MessageRenderer message={message} isStreaming={isStreaming} />
          )}
        </div>

        {/* Hover actions (assistant only) */}
        {!isUser && !isStreaming && showActions && (
          <div className="flex items-center gap-1 px-1" role="toolbar" aria-label="Message actions">
            {onCopy && (
              <ActionButton
                icon={<Copy className="w-3.5 h-3.5" />}
                label="Copy message"
                onClick={() => {
                  const text = message.parts
                    .filter(p => p.type === 'text')
                    .map(p => (p as { content: string }).content)
                    .join('\n');
                  onCopy(text);
                }}
              />
            )}
            {onRegenerate && (
              <ActionButton
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                label="Regenerate response"
                onClick={() => onRegenerate(message.id)}
              />
            )}
            {onFeedback && (
              <>
                <ActionButton
                  icon={<ThumbsUp className="w-3.5 h-3.5" />}
                  label="Positive feedback"
                  onClick={() => onFeedback(message.id, 'positive')}
                />
                <ActionButton
                  icon={<ThumbsDown className="w-3.5 h-3.5" />}
                  label="Negative feedback"
                  onClick={() => onFeedback(message.id, 'negative')}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

function ActionButton({ icon, label, onClick }: {
  icon: React.ReactNode; label: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {icon}
    </button>
  );
}
```

---

## Virtualised MessageList

For threads with many messages, virtualise to avoid DOM bloat:

```tsx
// components/chat/MessageList.tsx
'use client';
import { useRef, useEffect, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types/message';

interface Props {
  messages: Message[];
  streamingMessageId?: string;
  onRegenerate?: (id: string) => void;
}

export const MessageList = memo(function MessageList({
  messages, streamingMessageId, onRegenerate,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,      // avg message height px
    overscan: 5,
  });

  // Auto-scroll to bottom unless user scrolled up
  useEffect(() => {
    if (!userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, streamingMessageId]);

  const handleScroll = () => {
    const el = parentRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUp.current = distFromBottom > 100;
  };

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4"
      role="log"
      aria-label="Agent conversation"
      aria-live="polite"
    >
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(vItem => (
          <div
            key={vItem.key}
            data-index={vItem.index}
            ref={virtualizer.measureElement}
            style={{ position: 'absolute', top: vItem.start, left: 0, right: 0 }}
          >
            <MessageBubble
              message={messages[vItem.index]}
              isStreaming={messages[vItem.index].id === streamingMessageId}
              onRegenerate={onRegenerate}
              className="py-1"
            />
          </div>
        ))}
      </div>
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
});
```

---

## File Upload Zone

```tsx
// components/chat/FileUploadZone.tsx
'use client';
import { useCallback, useState, memo } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadFile {
  file: File;
  progress: number;    // 0–100
  url?: string;        // set when upload completes
  error?: string;
}

interface Props {
  onUploadComplete: (url: string, file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export const FileUploadZone = memo(function FileUploadZone({
  onUploadComplete,
  accept = 'image/*,.pdf,.docx,.csv,.xlsx',
  maxSizeMB = 20,
  className,
}: Props) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setFiles(prev => prev.map(f =>
        f.file === file ? { ...f, error: `File exceeds ${maxSizeMB} MB` } : f,
      ));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        setFiles(prev => prev.map(f =>
          f.file === file ? { ...f, progress: Math.round((e.loaded / e.total) * 100) } : f,
        ));
      }
    };
    xhr.onload = () => {
      const { url } = JSON.parse(xhr.responseText);
      setFiles(prev => prev.map(f =>
        f.file === file ? { ...f, progress: 100, url } : f,
      ));
      onUploadComplete(url, file);
    };
    xhr.onerror = () => {
      setFiles(prev => prev.map(f =>
        f.file === file ? { ...f, error: 'Upload failed' } : f,
      ));
    };
    xhr.open('POST', '/api/files/upload');
    xhr.send(formData);
  }, [maxSizeMB, onUploadComplete]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    setFiles(prev => [...prev, ...arr.map(f => ({ file: f, progress: 0 }))]);
    arr.forEach(uploadFile);
  }, [uploadFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Drop zone */}
      <label
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/40',
        )}
        aria-label="Drop files here or click to browse"
      >
        <Upload className="w-6 h-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground text-center">
          Drop files here or <span className="text-primary underline">browse</span>
          <br />
          <span className="text-xs opacity-60">Max {maxSizeMB} MB · {accept}</span>
        </span>
        <input
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={e => e.target.files && addFiles(e.target.files)}
          aria-hidden="true"
        />
      </label>

      {/* File tiles */}
      {files.length > 0 && (
        <ul className="space-y-1.5" aria-label="Uploaded files">
          {files.map(({ file, progress, url, error }, i) => (
            <li
              key={i}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                error ? 'border-red-500/50 bg-red-500/5' : 'border-border bg-muted/30',
              )}
            >
              {file.type.startsWith('image/')
                ? <ImageIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                : <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />}
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              {error ? (
                <span className="text-xs text-red-500">{error}</span>
              ) : url ? (
                <span className="text-xs text-emerald-500">✓</span>
              ) : (
                <span className="text-xs text-muted-foreground">{progress}%</span>
              )}
              <button
                onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                aria-label={`Remove ${file.name}`}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
```

---

## Full Chat Page Layout

```tsx
// app/(dashboard)/threads/[threadId]/page.tsx
'use client';
import { useCallback, useState } from 'react';
import { MessageList }       from '@/components/chat/MessageList';
import { ChatInput }         from '@/components/chat/ChatInput';
import { ConnectionBanner }  from '@/components/chat/ConnectionBanner';
import { SandboxStatusBadge } from '@/components/chat/SandboxStatusBadge';
import { useAgentThread }    from '@/hooks/useAgentThread';

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  const [input, setInput] = useState('');
  const {
    messages, streamingMessageId,
    sendMessage, regenerate,
    connectionState, sandboxStatus,
  } = useAgentThread(params.threadId);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  }, [input, sendMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Connection banner */}
      <ConnectionBanner state={connectionState} />

      {/* Thread header */}
      <header className="flex items-center justify-between px-4 py-2 border-b shrink-0">
        <h1 className="text-sm font-semibold truncate">Thread</h1>
        <SandboxStatusBadge status={sandboxStatus} />
      </header>

      {/* Messages */}
      <MessageList
        messages={messages}
        streamingMessageId={streamingMessageId}
        onRegenerate={regenerate}
      />

      {/* Input */}
      <div className="shrink-0 border-t p-3">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isDisabled={!!streamingMessageId || connectionState !== 'connected'}
          placeholder={
            connectionState !== 'connected'
              ? 'Reconnecting…'
              : streamingMessageId
              ? 'Agent is responding…'
              : 'Message agent… (Ctrl+Enter)'
          }
        />
      </div>
    </div>
  );
}
```

---

## Key Principles

1. **Parts-based rendering** — never concatenate all `parts` into a string; dispatch each type
2. **Pair tool calls and results** — match by `toolCallId`, render a single `ToolCallCard`
3. **`React.memo` every message component** — prevents full-list re-render on each token
4. **`aria-live="polite"` on streaming output** — screen readers get token updates without interrupting
5. **Virtualise large thread histories** — switch to `@tanstack/react-virtual` above 50 messages
6. **Always show a thinking indicator** before the first token of an assistant message

## When to Use This Skill

Use when: building a new agent chat page, refactoring an existing chat UI, adding tool-call visualisation, improving streaming UX, implementing file upload in chat, or debugging message rendering bugs.

See `agent-state-management` for Zustand/TanStack Query patterns.
See `agent-streaming-ux` for SSE/WebSocket connection management.
