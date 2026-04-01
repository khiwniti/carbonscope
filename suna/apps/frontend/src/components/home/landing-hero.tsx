'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/carbonscope/button';
import { Badge } from '@/components/ui/carbonscope/badge';
import { ArrowRight, Sparkles, Building2, Zap, Activity, FileText, ChartColumn, ShieldCheck, Network, Calculator, Scale, Download, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

const marqueeItems = [
  'New: Embodied Carbon Module v2.0',
  'Real-time Operational Analytics',
  'ESG Reporting Automation',
  'Whole Building Life Cycle Assessment',
  'COP29 Compliant Methodologies',
];

const analysisTypes = [
  { icon: Building2, label: 'Embodied', active: false },
  { icon: Zap, label: 'Operational', active: false },
  { icon: Activity, label: 'Lifecycle', active: false },
  { icon: FileText, label: 'ESG Reports', active: false },
  { icon: ChartColumn, label: 'Benchmark', active: false },
  { icon: ShieldCheck, label: 'Compliance', active: false },
  { icon: Network, label: 'Supply Chain', active: false },
];

const quickActions = [
  { icon: Calculator, label: 'Calculate scope emissions' },
  { icon: Scale, label: 'Compare materials' },
  { icon: Download, label: 'Export EPIC data' },
  { icon: Leaf, label: 'Offset recommendations' },
];

const stats = [
  { value: '50+', label: 'Data Sources' },
  { value: '99.8%', label: 'Accuracy' },
  { value: '24/7', label: 'Monitoring' },
];

export function LandingHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col overflow-hidden pt-24">
      {/* Background gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none bg-[radial-gradient(circle,_rgba(52,211,153,0.25)_0%,_transparent_70%)] opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none bg-[radial-gradient(circle,_rgba(59,130,246,0.1)_0%,_transparent_70%)]" />

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-48 relative z-10">
        <div className="w-full max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div 
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-1000",
              "bg-emerald-500/10 border border-emerald-800",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400" style={{ fontFamily: 'var(--font-body)' }}>
              Autonomous Carbon Intelligence
            </span>
          </div>

          {/* Heading */}
          <h1 
            className={cn(
              "font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-balance transition-all duration-1000 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ fontFamily: 'var(--font-display)', color: '#E2E8F0', lineHeight: 1.1 }}
          >
            Understand Your <br />
            <span style={{ color: '#34D399', fontStyle: 'italic' }}>Carbon Footprint</span>
          </h1>

          {/* Description */}
          <p 
            className={cn(
              "text-base sm:text-lg max-w-xl mx-auto leading-relaxed transition-all duration-1000 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ fontFamily: 'var(--font-body)', color: '#94A3B8' }}
          >
            Autonomous AI for embodied and operational carbon analysis. Transform complex environmental data into actionable decarbonization strategies.
          </p>

          {/* Stats */}
          <div 
            className={cn(
              "flex items-center justify-center gap-8 sm:gap-12 mt-8 transition-all duration-1000 delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="font-bold text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', color: '#E2E8F0' }}>
                  {stat.value}
                </div>
                <div className="text-xs tracking-wider uppercase mt-1" style={{ fontFamily: 'var(--font-body)', color: '#64748B' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-4 pb-6 sm:pb-8 z-20">
        <div className="w-full max-w-3xl mx-auto space-y-4">
          {/* Analysis Type Buttons */}
          <div 
            className={cn(
              "flex items-center justify-center transition-all duration-1000 delay-400",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex sm:grid sm:grid-cols-7 gap-2 min-w-max sm:min-w-0 px-1">
                {analysisTypes.map((type, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-3 h-10 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200",
                      type.active 
                        ? "bg-emerald-600 text-white border-emerald-700"
                        : "text-zinc-400 border border-zinc-800 hover:bg-zinc-800"
                    )}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div 
            className={cn(
              "transition-all duration-1000 delay-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <div className="rounded-2xl overflow-hidden bg-[#162032] border border-[#1E293B] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="p-4 space-y-4">
                <div className="relative">
                  <textarea
                    className={cn(
                      "w-full bg-transparent border-none resize-none outline-none text-base",
                      "min-h-[60px] max-h-[200px] py-2",
                      "placeholder:text-zinc-500"
                    )}
                    style={{ fontFamily: 'var(--font-body)', color: '#E2E8F0' }}
                    placeholder="Upload your BIM file or ask: 'Analyze the embodied carbon of a steel-frame building with 50,000 sq ft...'"
                    rows={1}
                  />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center justify-center gap-2 w-9 h-9 rounded-lg transition-all duration-200 bg-[#1E293B] border border-[#1E293B] text-zinc-500 hover:bg-zinc-800">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
                      </svg>
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-[#1E293B]" style={{ color: '#64748B' }}>
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span className="hidden md:inline">AI-Powered Analysis</span>
                    </div>
                  </div>
                  <button className="inline-flex items-center justify-center gap-2 w-9 h-9 rounded-lg transition-all duration-200 bg-emerald-600 text-white shadow-[0_0_16px_rgba(52,211,153,0.15)] hover:bg-emerald-500">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 text-zinc-400 bg-[#1E293B] border border-[#1E293B] hover:bg-zinc-800"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
