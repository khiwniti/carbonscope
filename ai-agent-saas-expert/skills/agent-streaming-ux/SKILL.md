---
name: Agent Streaming UX
description: This skill should be used when the user asks about "SSE streaming for agents", "WebSocket reconnection", "streaming response UX", "EventSource for chat", "real-time agent updates", "streaming text flicker", "connection recovery", "agent heartbeat", "streaming error handling", or when implementing the real-time data channel between the frontend and an AI agent backend. Covers SSE, WebSocket, reconnection logic, optimistic rendering, and UX feedback patterns.
version: 0.2.0
---

# Agent Streaming UX

Production patterns for managing real-time data channels between a Next.js frontend and an AI agent backend — covering SSE token streaming, WebSocket agent events, reconnection logic, and the UX feedback layer.

---

## Choosing SSE vs WebSocket

| Criterion | SSE (EventSource) | WebSocket |
|-----------|-------------------|-----------|
| Direction | Server → Client only | Bidirectional |
| Protocol | HTTP/1.1 + HTTP/2 | WS / WSS |
| Reconnect | Automatic (browser handles) | Manual implementation |
| Proxy/CDN | Excellent (standard HTTP) | Requires upgrade headers |
| Use case | **LLM token streaming** | Agent status events, presence |
| Next.js support | Native `Response` stream | `ws` or `socket.io` on custom server |

**Recommendation for AI agent chat**: SSE for token streaming; WebSocket (or Supabase Realtime) for sandbox status, agent lifecycle, and multi-user presence events.

---

## SSE Token Streaming

### Backend (FastAPI)

```python
# backend/core/endpoints/threads.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio

router = APIRouter()

@router.post("/threads/{thread_id}/messages")
async def send_message(thread_id: str, body: MessageBody):
    async def event_stream():
        async for chunk in agent_service.stream(thread_id, body.content):
            # SSE format: "data: <json>\n\n"
            yield f"data: {chunk.model_dump_json()}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # disable Nginx buffering
            "Connection": "keep-alive",
        },
    )
```

### Frontend — `useSSEStream` Hook

```typescript
// hooks/useSSEStream.ts
'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';

interface SSEChunk {
  type: 'token' | 'tool_call' | 'tool_result' | 'done' | 'error';
  messageId: string;
  content?: string;
  toolCallId?: string;
  toolName?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

interface Options {
  threadId: string;
  onToken:      (messageId: string, token: string) => void;
  onToolCall?:  (messageId: string, toolCallId: string, toolName: string, args: Record<string, unknown>) => void;
  onToolResult?:(messageId: string, toolCallId: string, result: unknown, isError: boolean) => void;
  onDone:       (messageId: string) => void;
  onError?:     (error: string) => void;
}

export function useSSEStream({
  threadId, onToken, onToolCall, onToolResult, onDone, onError,
}: Options) {
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempts = useRef(0);
  const setConnectionState = useUIStore(s => s.setConnectionState);

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource(`/api/threads/${threadId}/stream`);
    esRef.current = es;

    es.onopen = () => {
      reconnectAttempts.current = 0;
      setConnectionState('connected');
    };

    es.onmessage = (event: MessageEvent<string>) => {
      if (event.data === '[DONE]') return;

      try {
        const chunk: SSEChunk = JSON.parse(event.data);

        switch (chunk.type) {
          case 'token':
            onToken(chunk.messageId, chunk.content ?? '');
            break;
          case 'tool_call':
            onToolCall?.(chunk.messageId, chunk.toolCallId!, chunk.toolName!, chunk.args ?? {});
            break;
          case 'tool_result':
            onToolResult?.(chunk.messageId, chunk.toolCallId!, chunk.result, !!chunk.error);
            break;
          case 'done':
            onDone(chunk.messageId);
            break;
          case 'error':
            onError?.(chunk.error ?? 'Unknown streaming error');
            break;
        }
      } catch {
        // Malformed chunk — ignore silently
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;

      const attempts = reconnectAttempts.current;
      if (attempts >= 5) {
        setConnectionState('disconnected');
        return;
      }

      setConnectionState('reconnecting');
      const delay = Math.min(1000 * 2 ** attempts, 30_000); // exponential back-off, max 30s
      reconnectTimer.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        connect();
      }, delay);
    };
  }, [threadId, onToken, onToolCall, onToolResult, onDone, onError, setConnectionState]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      esRef.current?.close();
    };
  }, [connect]);

  // Expose manual reconnect for the ConnectionBanner "Retry" button
  return { reconnect: connect };
}
```

---

## WebSocket — Sandbox & Agent Status Events

### Backend (FastAPI WebSocket)

```python
# backend/core/endpoints/ws.py
from fastapi import WebSocket, WebSocketDisconnect
import json

@router.websocket("/ws/agents/{agent_id}/status")
async def agent_status_ws(websocket: WebSocket, agent_id: str):
    await websocket.accept()
    try:
        async for event in sandbox_service.status_stream(agent_id):
            await websocket.send_text(json.dumps(event))
    except WebSocketDisconnect:
        pass
```

### Frontend — `useSandboxStatus` Hook

```typescript
// hooks/useSandboxStatus.ts
'use client';
import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';
import type { SandboxStatus } from '@/types/sandbox';

interface StatusEvent {
  type: 'status_change' | 'heartbeat';
  status: SandboxStatus;
  message?: string;
}

export function useSandboxStatus(agentId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const setSandboxStatus = useUIStore(s => s.setSandboxStatus);
  const setConnectionState = useUIStore(s => s.setConnectionState);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;

    function connect() {
      if (!mounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(
        `${protocol}//${window.location.host}/ws/agents/${agentId}/status`,
      );
      wsRef.current = ws;

      ws.onopen = () => {
        attempts = 0;
        setConnectionState('connected');
      };

      ws.onmessage = (e: MessageEvent<string>) => {
        try {
          const event: StatusEvent = JSON.parse(e.data);
          if (event.type === 'status_change') {
            setSandboxStatus(event.status);
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (!mounted) return;
        setConnectionState('reconnecting');
        const delay = Math.min(1000 * 1.5 ** attempts, 20_000);
        attempts += 1;
        reconnectTimer.current = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      mounted = false;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [agentId, setSandboxStatus, setConnectionState]);
}
```

---

## Streaming UX Feedback Patterns

### 1 — Thinking → Streaming → Done State Machine

```typescript
// types/streamingState.ts
export type StreamingPhase =
  | 'idle'       // no active stream
  | 'thinking'   // request sent, no tokens yet
  | 'streaming'  // tokens arriving
  | 'done'       // final token received
  | 'error';     // stream failed

// Usage in component
const phase: StreamingPhase =
  !streamingMessageId    ? 'idle'
  : firstTokenArrived    ? 'streaming'
  : 'thinking';
```

```tsx
// Render the correct indicator per phase
{phase === 'thinking'  && <AgentThinkingIndicator />}
{phase === 'streaming' && <StreamingText content={content} isStreaming />}
{phase === 'done'      && <StreamingText content={content} isStreaming={false} />}
{phase === 'error'     && <ErrorMessage message={errorText} onRetry={retry} />}
```

### 2 — Abort / Stop Generation Button

```typescript
// hooks/useAbortStream.ts
import { useRef, useCallback } from 'react';

export function useAbortStream() {
  const controllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback((url: string, body: unknown) => {
    controllerRef.current = new AbortController();
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controllerRef.current.signal,
    });
  }, []);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return { startStream, abort };
}
```

```tsx
// StopButton — visible only while streaming
{isStreaming && (
  <button
    onClick={abort}
    aria-label="Stop generation"
    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded-full px-3 py-1"
  >
    <Square className="w-3 h-3 fill-current" /> Stop
  </button>
)}
```

### 3 — Scroll Anchor with "Jump to Bottom" Button

```tsx
// components/chat/ScrollAnchor.tsx
'use client';
import { useEffect, useRef, useState, memo } from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  trackingTarget?: string;   // messageId or token count
  className?: string;
}

export const ScrollAnchor = memo(function ScrollAnchor({
  trackingTarget, className,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const el = bottomRef.current?.parentElement;
    if (!el) return;

    const onScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowButton(distFromBottom > 120);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-scroll only when user is near the bottom
  useEffect(() => {
    if (!showButton) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [trackingTarget, showButton]);

  return (
    <>
      <div ref={bottomRef} aria-hidden="true" />
      {showButton && (
        <button
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setShowButton(false);
          }}
          aria-label="Scroll to latest message"
          className={cn(
            'fixed bottom-24 right-6 z-20 p-2 rounded-full shadow-lg bg-background border',
            'hover:bg-muted transition-colors',
            className,
          )}
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </>
  );
});
```

### 4 — Network-Aware Retry with User Feedback

```typescript
// hooks/useOnlineStatus.ts
import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online',  on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return online;
}
```

```tsx
// Show a specific banner when the device is fully offline
const online = useOnlineStatus();
{!online && (
  <div role="alert" className="bg-slate-800 text-slate-200 text-sm px-4 py-2 flex items-center gap-2">
    <WifiOff className="w-4 h-4" /> You are offline. Messages will send when connection restores.
  </div>
)}
```

---

## Streaming Performance Checklist

| Issue | Cause | Fix |
|-------|-------|-----|
| Flickering text on each token | Full `setState` replace instead of append | Use `setState(prev => prev + token)` |
| All messages re-render each token | No `React.memo` on `MessageBubble` | Wrap with `memo()` |
| Scroll jumps during stream | `scrollIntoView` called every token | Only scroll if user is within 120px of bottom |
| 60fps drops during streaming | Heavy markdown parsing on each token | Parse only on `done` event; show plain text while streaming |
| SSE reconnects on tab focus | Browser kills idle connections | Use `keepalive` fetch ping every 25s |
| Tool args render as `[object Object]` | Missing JSON serialiser in `ToolCallCard` | `JSON.stringify(args, null, 2)` |
| Stream hangs after 30s | Nginx / proxy timeout | Add `X-Accel-Buffering: no` header + increase `proxy_read_timeout` |

---

## Key Principles

1. **SSE for tokens, WebSocket for events** — don't mix: SSE is HTTP, simpler and proxy-friendly for streaming text
2. **Exponential back-off reconnection** — cap at 30s, give up after 5 attempts, show `ConnectionBanner`
3. **Append, never replace** — stream tokens as `prev + chunk`; batch DOM updates with `startTransition`
4. **Abort signal** — always pass an `AbortController` signal so users can stop generation
5. **`X-Accel-Buffering: no`** — mandatory for Nginx-proxied SSE; without it tokens buffer and appear in bursts
6. **Parse markdown only on `done`** — do not run `marked` / `remark` on every token; render plain `StreamingText` mid-stream

## When to Use This Skill

Use when: setting up the streaming connection for the first time, debugging connection drops or flickering, implementing the Stop Generation button, handling offline/reconnect UX, or optimising stream rendering performance.

See `agent-chat-ui-patterns` for component-level streaming renders.
See `agent-state-management` for Zustand/TanStack Query integration.
