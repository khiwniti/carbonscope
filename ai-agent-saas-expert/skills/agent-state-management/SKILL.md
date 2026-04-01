---
name: Agent State Management
description: This skill should be used when the user asks about "Zustand for agent chat", "state management for threads", "TanStack Query for agents", "optimistic thread creation", "agent session state", "chat state management", "useAgentThread hook", "real-time agent state", or when designing the client-side state layer for an AI agent SaaS frontend. Covers Zustand store design, TanStack Query patterns, optimistic updates, and cache invalidation.
version: 0.2.0
---

# Agent State Management

Production-grade state management patterns for AI agent SaaS frontends — combining Zustand for synchronous UI state and TanStack Query for server state.

---

## State Architecture Overview

```
Client State (Zustand)          Server State (TanStack Query)
─────────────────────────       ──────────────────────────────
threadStore                     useAgentList()
  └─ activeThreadId             useThread(threadId)
  └─ streamingMessageId         useInfiniteThreadHistory()
  └─ pendingFiles               useAgentConfig(agentId)

uiStore                         Mutations
  └─ sidebarOpen                useCreateThread()
  └─ theme                      useSendMessage()
  └─ connectionState            useUpdateAgent()
  └─ sandboxStatus              useDeleteThread()

agentBuilderStore
  └─ draftAgent
  └─ unsavedChanges
```

**Rule**: TanStack Query owns all data that lives on the server. Zustand owns transient UI state (which thread is active, sidebar open/closed, connection health, draft forms). Never duplicate server data in Zustand.

---

## Zustand Store Design

### Store-per-Concern Pattern

Split stores by domain — never one giant store:

```typescript
// stores/threadStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ThreadState {
  activeThreadId: string | null;
  streamingMessageId: string | null;
  pendingFiles: File[];
  // Actions
  setActiveThread: (id: string | null) => void;
  setStreamingMessage: (id: string | null) => void;
  addPendingFile: (file: File) => void;
  clearPendingFiles: () => void;
}

export const useThreadStore = create<ThreadState>()(
  immer(set => ({
    activeThreadId: null,
    streamingMessageId: null,
    pendingFiles: [],

    setActiveThread: id =>
      set(state => { state.activeThreadId = id; }),

    setStreamingMessage: id =>
      set(state => { state.streamingMessageId = id; }),

    addPendingFile: file =>
      set(state => { state.pendingFiles.push(file); }),

    clearPendingFiles: () =>
      set(state => { state.pendingFiles = []; }),
  })),
);
```

```typescript
// stores/uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SandboxStatus } from '@/types/sandbox';

type ConnectionState = 'connected' | 'reconnecting' | 'disconnected';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  connectionState: ConnectionState;
  sandboxStatus: SandboxStatus;
  // Actions
  toggleSidebar: () => void;
  setTheme: (t: UIState['theme']) => void;
  setConnectionState: (s: ConnectionState) => void;
  setSandboxStatus: (s: SandboxStatus) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    set => ({
      sidebarOpen: true,
      theme: 'system',
      connectionState: 'connected',
      sandboxStatus: 'UNKNOWN',

      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setTheme: theme => set({ theme }),
      setConnectionState: connectionState => set({ connectionState }),
      setSandboxStatus: sandboxStatus => set({ sandboxStatus }),
    }),
    { name: 'ui-preferences', partialize: s => ({ sidebarOpen: s.sidebarOpen, theme: s.theme }) },
  ),
);
```

```typescript
// stores/agentBuilderStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AgentConfig } from '@/types/agent';

interface AgentBuilderState {
  draft: Partial<AgentConfig>;
  savedConfig: Partial<AgentConfig> | null;
  // Actions
  updateDraft: (patch: Partial<AgentConfig>) => void;
  saveDraft: (config: AgentConfig) => void;
  resetDraft: () => void;
  get hasUnsavedChanges(): boolean;
}

export const useAgentBuilderStore = create<AgentBuilderState>()(
  immer((set, get) => ({
    draft: {},
    savedConfig: null,

    updateDraft: patch =>
      set(state => { Object.assign(state.draft, patch); }),

    saveDraft: config =>
      set(state => {
        state.savedConfig = config;
        state.draft = { ...config };
      }),

    resetDraft: () =>
      set(state => { state.draft = state.savedConfig ? { ...state.savedConfig } : {}; }),

    get hasUnsavedChanges() {
      return JSON.stringify(get().draft) !== JSON.stringify(get().savedConfig);
    },
  })),
);
```

### Selector Memoisation — Critical for Streaming Performance

**Wrong** — subscribes the component to the entire store (re-renders on every state change including unrelated fields):
```typescript
// ❌ Anti-pattern
const store = useThreadStore();
const activeId = store.activeThreadId;
```

**Correct** — subscribes only to the specific slice:
```typescript
// ✅ Correct — only re-renders when activeThreadId changes
const activeThreadId = useThreadStore(s => s.activeThreadId);
```

During streaming, `streamingMessageId` changes frequently. Components that don't use it must NOT re-render:
```typescript
// In ThreadSidebar — only cares about activeThreadId, not streaming state
const activeThreadId = useThreadStore(s => s.activeThreadId);       // ✅
const setActive      = useThreadStore(s => s.setActiveThread);      // stable ref
```

---

## TanStack Query Patterns

### Query Client Setup

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s — agent list, configs
      gcTime:    5 * 60_000,    // 5min garbage collection
      retry: (failureCount, error: unknown) => {
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Agent List Query

```typescript
// hooks/queries/useAgentList.ts
import { useQuery } from '@tanstack/react-query';
import { agentsApi } from '@/lib/api';

export const agentKeys = {
  all:    () => ['agents'] as const,
  list:   () => [...agentKeys.all(), 'list'] as const,
  detail: (id: string) => [...agentKeys.all(), 'detail', id] as const,
};

export function useAgentList() {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn:  () => agentsApi.list(),
    staleTime: 60_000,   // agents change infrequently
  });
}
```

### Infinite Thread History

```typescript
// hooks/queries/useInfiniteThreadHistory.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { threadsApi } from '@/lib/api';

export function useInfiniteThreadHistory(agentId: string) {
  return useInfiniteQuery({
    queryKey: ['threads', agentId, 'history'],
    queryFn: ({ pageParam = 0 }) =>
      threadsApi.list({ agentId, offset: pageParam as number, limit: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasMore ? (lastPageParam as number) + 20 : undefined,
    staleTime: 30_000,
  });
}
```

### Optimistic Thread Creation

Show new thread in sidebar immediately — before the server round-trip:

```typescript
// hooks/mutations/useCreateThread.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { threadsApi } from '@/lib/api';
import { useThreadStore } from '@/stores/threadStore';
import type { Thread } from '@/types/thread';

export function useCreateThread(agentId: string) {
  const queryClient = useQueryClient();
  const setActiveThread = useThreadStore(s => s.setActiveThread);

  return useMutation({
    mutationFn: (title?: string) => threadsApi.create({ agentId, title }),

    onMutate: async (title) => {
      // Cancel in-flight thread list fetches
      await queryClient.cancelQueries({ queryKey: ['threads', agentId, 'history'] });

      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData<Thread[]>(['threads', agentId, 'history']);

      // Optimistically insert a placeholder thread
      const optimisticThread: Thread = {
        id: `optimistic-${Date.now()}`,
        agentId,
        title: title ?? 'New thread',
        createdAt: new Date(),
        messageCount: 0,
      };
      queryClient.setQueryData<Thread[]>(
        ['threads', agentId, 'history'],
        old => [optimisticThread, ...(old ?? [])],
      );
      setActiveThread(optimisticThread.id);

      return { previous };
    },

    onError: (_err, _vars, context) => {
      // Roll back optimistic update
      if (context?.previous) {
        queryClient.setQueryData(['threads', agentId, 'history'], context.previous);
      }
    },

    onSuccess: (thread) => {
      // Replace optimistic entry with real data
      queryClient.setQueryData<Thread[]>(
        ['threads', agentId, 'history'],
        old => old?.map(t => t.id.startsWith('optimistic-') ? thread : t) ?? [thread],
      );
      setActiveThread(thread.id);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['threads', agentId, 'history'] });
    },
  });
}
```

### useAgentThread Composite Hook

Compose Zustand + TanStack Query + streaming in one hook used by the chat page:

```typescript
// hooks/useAgentThread.ts
'use client';
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThreadStore } from '@/stores/threadStore';
import { useUIStore }     from '@/stores/uiStore';
import { threadsApi, messagesApi } from '@/lib/api';
import { useSSEStream }   from './useSSEStream';
import type { Message }   from '@/types/message';

export function useAgentThread(threadId: string) {
  const queryClient = useQueryClient();
  const setStreamingMessage = useThreadStore(s => s.setStreamingMessage);
  const streamingMessageId  = useThreadStore(s => s.streamingMessageId);
  const connectionState     = useUIStore(s => s.connectionState);
  const sandboxStatus       = useUIStore(s => s.sandboxStatus);

  // Fetch existing messages
  const { data: messages = [] } = useQuery({
    queryKey: ['threads', threadId, 'messages'],
    queryFn:  () => messagesApi.list(threadId),
    staleTime: Infinity,   // messages never go stale — we update via SSE
  });

  // Stream new assistant message
  const appendToken = useCallback((messageId: string, token: string) => {
    queryClient.setQueryData<Message[]>(
      ['threads', threadId, 'messages'],
      old => old?.map(m =>
        m.id === messageId
          ? { ...m, parts: [
              ...m.parts.slice(0, -1),
              { type: 'text' as const, content: (
                (m.parts.at(-1) as { content: string } | undefined)?.content ?? ''
              ) + token },
            ]}
          : m,
      ) ?? old,
    );
  }, [queryClient, threadId]);

  useSSEStream({ threadId, onToken: appendToken, onDone: () => setStreamingMessage(null) });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: (content: string) => messagesApi.send(threadId, content),
    onMutate: async (content) => {
      // Optimistically add user message
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        parts: [{ type: 'text', content }],
        createdAt: new Date(),
      };
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        parts: [],
        createdAt: new Date(),
      };
      queryClient.setQueryData<Message[]>(
        ['threads', threadId, 'messages'],
        old => [...(old ?? []), userMsg, assistantMsg],
      );
      setStreamingMessage(assistantMsg.id);
    },
  });

  return {
    messages,
    streamingMessageId,
    sendMessage: (content: string) => sendMessage.mutate(content),
    regenerate: (messageId: string) => { /* ... */ },
    connectionState,
    sandboxStatus,
  };
}
```

---

## Cache Invalidation Strategy

| Event | Invalidate |
|-------|-----------|
| Agent updated | `agentKeys.detail(agentId)`, `agentKeys.list()` |
| Thread deleted | `['threads', agentId, 'history']` |
| File uploaded | `['files', threadId]` |
| Sandbox restarted | Update `sandboxStatus` via `useUIStore` directly (no cache key) |
| User signs out | `queryClient.clear()` — wipe all cached data |

```typescript
// On sign-out
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
await signOut();
queryClient.clear();
```

---

## Key Principles

1. **Single source of truth** — server data in TanStack Query; UI state in Zustand
2. **Granular selectors** — always `useStore(s => s.specificField)`, never `useStore()`
3. **Optimistic updates** — thread creation, message send: appear instantly, roll back on error
4. **`staleTime: Infinity` for messages** — messages are only updated by SSE push, not polling
5. **Store-per-domain** — separate `threadStore`, `uiStore`, `agentBuilderStore`; never one giant store
6. **`immer` middleware** — use for stores with nested updates to avoid accidental mutation bugs

## When to Use This Skill

Use when designing client state architecture, debugging re-render storms during streaming, implementing optimistic UI patterns, or setting up TanStack Query for an agent chat frontend.

See `agent-chat-ui-patterns` for component-level rendering.
See `agent-streaming-ux` for SSE/WebSocket connection management.
