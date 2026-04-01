'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { backendApi } from '@/lib/api-client';
import { logger } from '@/lib/logger';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CarbonAdvisorChatProps {
  analysisId: string;
  totalCarbon: number | null;
  materialsCount: number;
  matchRate: number;
  topMaterials?: Array<{ name: string; carbon: number }>;
}

const SYSTEM_CONTEXT = (props: CarbonAdvisorChatProps) => `
You are a CarbonBIM AI advisor specializing in embodied carbon for Thai construction projects.

Analysis context:
- Analysis ID: ${props.analysisId}
- Total embodied carbon: ${props.totalCarbon != null ? `${props.totalCarbon.toLocaleString()} kgCO₂e` : 'calculating...'}
- Materials parsed: ${props.materialsCount}
- Match rate: ${props.matchRate.toFixed(0)}%
${props.topMaterials?.length ? `- Top carbon contributors: ${props.topMaterials.map(m => `${m.name} (${m.carbon.toLocaleString()} kgCO₂e)`).join(', ')}` : ''}

You help users:
1. Understand their carbon footprint results
2. Suggest lower-carbon material alternatives (referencing Thai TGO emission factors)
3. Explain TREES Gold/Platinum and EDGE V3 certification pathways
4. Identify which materials to prioritize for carbon reduction
5. Answer questions in Thai or English based on user preference

Keep responses concise (2-4 sentences). Use specific numbers when available.
`.trim();

const STARTER_PROMPTS = [
  'What are my biggest carbon contributors?',
  'How can I reduce carbon by 20%?',
  'Am I on track for EDGE certification?',
  'Suggest lower-carbon concrete alternatives',
];

export function CarbonAdvisorChat(props: CarbonAdvisorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your Carbon Advisor. I've reviewed your BOQ analysis (${props.materialsCount} materials, ${props.matchRate.toFixed(0)}% matched). How can I help you reduce embodied carbon?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for the API
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Use the existing thread/agent system if available, otherwise use a simple prompt
      const result = await backendApi.post('/v1/chat/carbon-advisor', {
        messages: history,
        context: SYSTEM_CONTEXT(props),
        analysis_id: props.analysisId,
      });

      const replyContent = result.data?.reply || generateFallbackReply(text, props);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: replyContent,
        timestamp: new Date(),
      }]);
    } catch (err) {
      logger.error('Carbon advisor chat error:', err);
      // Graceful fallback
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: generateFallbackReply(text, props),
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-emerald-700 transition-colors z-50"
        aria-label="Open Carbon Advisor"
      >
        <MessageSquare className="h-4 w-4" />
        Carbon Advisor
      </button>
    );
  }

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-border bg-background shadow-2xl transition-all',
      isMinimized ? 'h-14 w-72' : 'h-[480px] w-[360px]'
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-2xl bg-emerald-600 px-4 py-3 text-white">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Carbon Advisor</p>
          {!isMinimized && <p className="text-xs opacity-80">AI-powered carbon reduction guide</p>}
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="rounded p-1 hover:bg-white/20 transition-colors"
          aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded p-1 hover:bg-white/20 transition-colors"
          aria-label="Close chat"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                <div className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                )}>
                  {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-primary text-primary-foreground'
                    : 'rounded-tl-sm bg-muted text-foreground'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Starter prompts */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {STARTER_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground hover:border-emerald-500 hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 border-t border-border p-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about carbon reduction…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
              disabled={isLoading}
              aria-label="Message Carbon Advisor"
            />
            <Button
              size="icon"
              className="h-8 w-8 shrink-0 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Rule-based fallback when AI endpoint is unavailable.
 */
function generateFallbackReply(question: string, props: CarbonAdvisorChatProps): string {
  const q = question.toLowerCase();

  if (q.includes('biggest') || q.includes('contributor') || q.includes('top')) {
    if (props.topMaterials?.length) {
      const top = props.topMaterials[0];
      return `Your biggest contributor is ${top.name} at ${top.carbon.toLocaleString()} kgCO₂e. Consider specifying lower-carbon alternatives like AAC blocks or recycled-content steel.`;
    }
    return 'Concrete and steel typically account for 60-80% of embodied carbon in Thai construction. Focus on specifying lower-grade concrete where structural requirements allow.';
  }

  if (q.includes('reduce') || q.includes('20%') || q.includes('alternative')) {
    return 'The fastest wins are: (1) Use C25 instead of C30 for non-structural concrete (~17% reduction), (2) Specify SD30 rebar over SD40 (~6% reduction), (3) Use AAC blocks for partitions (~50% less than brick).';
  }

  if (q.includes('edge') || q.includes('certif')) {
    const carbon = props.totalCarbon;
    if (carbon) {
      const target = carbon * 0.8;
      return `EDGE requires ≥20% embodied carbon reduction. Your target is ≤${target.toLocaleString(undefined, { maximumFractionDigits: 0 })} kgCO₂e. Focus on concrete specification and steel recycled content to hit this threshold.`;
    }
    return 'EDGE V3 requires ≥20% reduction below regional baseline. Get your full carbon figure calculated to determine your gap.';
  }

  if (q.includes('trees') || q.includes('gold') || q.includes('platinum')) {
    return 'TREES Gold requires 50+ points and TREES Platinum requires 70+ points. MR Credit 4 (Low-emission materials) awards up to 6 points — use TGO-labeled materials to maximize this credit.';
  }

  if (props.totalCarbon != null) {
    return `Your total embodied carbon is ${props.totalCarbon.toLocaleString()} kgCO₂e across ${props.materialsCount} materials (${props.matchRate.toFixed(0)}% matched to TGO factors). Ask me about specific reduction strategies or certification pathways.`;
  }

  return 'I can help with carbon reduction strategies, material alternatives, TREES/EDGE certification, and TGO emission factors. What would you like to know?';
}
