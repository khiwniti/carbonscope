'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/carbonscope/button';
import { Badge } from '@/components/ui/carbonscope/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/carbonscope/card';
import { 
  ArrowRight, Sparkles, Building2, Zap, Activity, FileText, 
  ChartColumn, ShieldCheck, Network, Calculator, Leaf,
  Cpu, Database, FileCheck, TrendingUp, Users, Clock,
  CheckCircle2, ArrowUpRight, Globe, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { value: '50+', label: 'Data Sources', icon: Database },
  { value: '99.8%', label: 'Accuracy', icon: Target },
  { value: '24/7', label: 'Monitoring', icon: Activity },
  { value: '501', label: 'TGO Materials', icon: Building2 },
];

const features = [
  {
    icon: Cpu,
    title: '12-Agent AI System',
    description: 'Autonomous LangGraph orchestration with Supervisor Router using capability-based routing for intelligent carbon assessment.',
    stat: '100% routing accuracy',
    statIcon: CheckCircle2,
  },
  {
    icon: Calculator,
    title: 'Instant Carbon Calculation',
    description: 'Process Bill of Quantities (BOQ) data with precise EN 15978 lifecycle assessment in under 0.5 seconds.',
    stat: '50x faster than target',
    statIcon: TrendingUp,
  },
  {
    icon: Leaf,
    title: 'TGO Material Intelligence',
    description: '501 construction materials in GraphDB knowledge graph with multi-criteria optimization across carbon, cost, and availability.',
    stat: '9 material categories',
    statIcon: Database,
  },
  {
    icon: FileCheck,
    title: 'Certification Support',
    description: 'Automated TREES NC 1.1 and EDGE V3 assessment with gap analysis and pathway optimization for Gold/Platinum certification.',
    stat: '100% manual accuracy',
    statIcon: ShieldCheck,
  },
];

const capabilities = [
  {
    title: 'Embodied Carbon Assessment',
    description: 'A1-A3 product stage lifecycle assessment with semantic SPARQL queries against TGO database.',
    icon: Building2,
    items: ['Material quantity takeoffs', 'EPD matching', 'EN 15978 compliance'],
  },
  {
    title: 'Operational Analytics',
    description: 'Real-time Scope 1 & 2 emissions monitoring with BMS and IoT sensor integration.',
    icon: Activity,
    items: ['Energy tracking', 'Carbon intensity', 'Live dashboards'],
  },
  {
    title: 'Lifecycle Optimization',
    description: 'B1-B7 use stage and C1-C4 end-of-life impact analysis with scenario comparison.',
    icon: ChartColumn,
    items: ['Pareto analysis', 'Scenario forking', 'Real-time recalculation'],
  },
  {
    title: 'Green Certification',
    description: 'TREES MR1/MR3/MR4 and EDGE baseline calculation with automated gap analysis.',
    icon: FileText,
    items: ['TREES Gold/Platinum', 'EDGE Advanced', 'Gap recommendations'],
  },
];

const certifications = [
  {
    name: 'TREES NC 1.1',
    issuer: 'Thai Green Building Institute',
    features: ['MR1 Green Materials', 'MR3 Reused Materials', 'MR4 Local Materials'],
    color: '#10B981',
  },
  {
    name: 'EDGE V3',
    issuer: 'International Finance Corporation',
    features: ['20% Energy Reduction', '40% Advanced', 'Zero Carbon Path'],
    color: '#3B82F6',
  },
];

export function LandingHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: '#0B1120' }}>
      {/* Hero Section */}
      <section className="relative w-full flex-1 flex flex-col overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none bg-[radial-gradient(circle,_rgba(52,211,153,0.25)_0%,_transparent_70%)] opacity-50" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none bg-[radial-gradient(circle,_rgba(59,130,246,0.1)_0%,_transparent_70%)]" />

        {/* Hero Content - Centered */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-5xl mx-auto text-center space-y-4">
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
                "font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance transition-all duration-1000 delay-100",
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
                "text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
              style={{ fontFamily: 'var(--font-body)', color: '#94A3B8' }}
            >
              Autonomous AI for embodied and operational carbon analysis. Transform complex environmental data into actionable decarbonization strategies.
            </p>

            {/* Stats */}
            <div 
              className={cn(
                "flex items-center justify-center gap-6 sm:gap-8 lg:gap-12 mt-6 transition-all duration-1000 delay-300",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="font-bold text-xl sm:text-2xl lg:text-3xl" style={{ fontFamily: 'var(--font-heading)', color: '#E2E8F0' }}>
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

        {/* Chat Input UI - Bottom */}
        <div className="relative z-20 w-full px-3 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="w-full max-w-3xl mx-auto space-y-3">
            {/* Analysis Type Buttons */}
            <div 
              className={cn(
                "flex items-center justify-center transition-all duration-1000 delay-400",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              <div className="w-full overflow-x-auto scrollbar-hide">
                <div className="flex justify-center gap-2 px-1">
                  {[
                    { icon: Building2, label: 'Embodied' },
                    { icon: Activity, label: 'Operational' },
                    { icon: ChartColumn, label: 'Lifecycle' },
                    { icon: FileText, label: 'ESG Reports' },
                  ].map((type, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        "inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200",
                        "text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-emerald-400"
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
              <div className="rounded-xl overflow-hidden" style={{ background: '#162032', border: '1px solid #1E293B', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                <div className="p-3 sm:p-4 space-y-3">
                  <textarea
                    className={cn(
                      "w-full bg-transparent border-none resize-none outline-none text-sm sm:text-base",
                      "min-h-[50px] sm:min-h-[60px] max-h-[150px] py-2",
                      "placeholder:text-zinc-500"
                    )}
                    style={{ fontFamily: 'var(--font-body)', color: '#E2E8F0' }}
                    placeholder="Upload your BIM file or ask: 'Analyze the embodied carbon of a steel-frame building...'"
                    rows={2}
                  />
                  <div className="flex items-center justify-between pt-2 sm:pt-3" style={{ borderTop: '1px solid #1E293B' }}>
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-all duration-200 bg-[#1E293B] border border-[#1E293B] text-zinc-500 hover:bg-zinc-800">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
                        </svg>
                      </button>
                      <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-[#1E293B]" style={{ color: '#64748B' }}>
                        <Sparkles className="w-3 h-3" style={{ color: '#34D399' }} />
                        <span>AI-Powered</span>
                      </div>
                    </div>
                    <button className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-all duration-200 bg-emerald-600 text-white shadow-[0_0_12px_rgba(52,211,153,0.15)] hover:bg-emerald-500">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-2 sm:mt-3 flex justify-center gap-2 overflow-x-auto scrollbar-hide px-1">
                {[
                  { icon: Calculator, label: 'Calculate emissions' },
                  { icon: Leaf, label: 'Compare materials' },
                  { icon: FileText, label: 'Export EPIC' },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 text-zinc-400 bg-[#1E293B] border border-[#1E293B] hover:bg-zinc-800"
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

      {/* Platform Overview Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10" style={{ background: '#111827' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">Platform Overview</Badge>
            <h2 className="font-bold text-3xl sm:text-4xl mb-4" style={{ fontFamily: 'var(--font-display)', color: '#E2E8F0' }}>
              Intelligent Carbon Assessment
            </h2>
            <p className="max-w-2xl mx-auto text-base" style={{ fontFamily: 'var(--font-body)', color: '#94A3B8' }}>
              Built on EN 15978 standards, our platform reduces assessment time from weeks to hours 
              while maintaining 100% accuracy against official certification manuals.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(52,211,153,0.15)' }}
                    >
                      <feature.icon className="w-6 h-6" style={{ color: '#34D399' }} />
                    </div>
                    {feature.stat && (
                      <Badge variant="highlight" className="flex items-center gap-1">
                        <feature.statIcon className="w-3 h-3" />
                        {feature.stat}
                      </Badge>
                    )}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10" style={{ background: '#0B1120' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">Core Capabilities</Badge>
            <h2 className="font-bold text-3xl sm:text-4xl mb-4" style={{ fontFamily: 'var(--font-display)', color: '#E2E8F0' }}>
              Comprehensive Carbon Analysis
            </h2>
            <p className="max-w-2xl mx-auto text-base" style={{ fontFamily: 'var(--font-body)', color: '#94A3B8' }}>
              From material selection to certification, our platform covers the entire carbon assessment lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {capabilities.map((cap, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-xl border transition-all duration-300 hover:border-emerald-600"
                style={{ background: '#162032', borderColor: '#1E293B' }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(52,211,153,0.15)' }}
                  >
                    <cap.icon className="w-6 h-6" style={{ color: '#34D399' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#E2E8F0' }}>
                      {cap.title}
                    </h3>
                    <p className="text-sm mb-3" style={{ fontFamily: 'var(--font-body)', color: '#94A3B8' }}>
                      {cap.description}
                    </p>
                    <ul className="space-y-2">
                      {cap.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm" style={{ color: '#64748B' }}>
                          <CheckCircle2 className="w-4 h-4" style={{ color: '#34D399' }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Support Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10" style={{ background: '#111827' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">Green Certification</Badge>
            <h2 className="font-bold text-3xl sm:text-4xl mb-4" style={{ fontFamily: 'var(--font-display)', color: '#E2E8F0' }}>
              Certification Pathways
            </h2>
            <p className="max-w-2xl mx-auto text-base" style={{ fontFamily: 'var(--font-body)', color: '#94A3B8' }}>
              Automated assessment for Thailand's leading green building certifications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {certifications.map((cert, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl border"
                style={{ 
                  background: '#162032', 
                  borderColor: cert.color,
                  boxShadow: `0 0 30px ${cert.color}20`
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-8 h-8" style={{ color: cert.color }} />
                  <div>
                    <h3 className="font-bold text-xl" style={{ fontFamily: 'var(--font-heading)', color: '#E2E8F0' }}>
                      {cert.name}
                    </h3>
                    <p className="text-sm" style={{ color: '#64748B' }}>{cert.issuer}</p>
                  </div>
                </div>
                <ul className="space-y-2 mt-6">
                  {cert.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: cert.color }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10" style={{ background: '#0B1120' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">Technology</Badge>
            <h2 className="font-bold text-3xl sm:text-4xl mb-4" style={{ fontFamily: 'var(--font-display)', color: '#E2E8F0' }}>
              Production-Grade Infrastructure
            </h2>
            <p className="max-w-2xl mx-auto text-base" style={{ fontFamily: 'var(--font-body)', color: '#94A3B8' }}>
              Enterprise architecture with 248+ tests and proven performance under load.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Cpu, label: '12 LangGraph Agents', sublabel: 'Supervisor Router' },
              { icon: Database, label: 'GraphDB 10.7', sublabel: '501 TGO Materials' },
              { icon: FileCheck, label: '248+ Tests', sublabel: '100% Critical Coverage' },
              { icon: Clock, label: '<2.5s Reports', sublabel: 'Bilingual PDF/Excel' },
            ].map((tech, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-xl text-center"
                style={{ background: '#162032', border: '1px solid #1E293B' }}
              >
                <tech.icon className="w-8 h-8 mx-auto mb-3" style={{ color: '#34D399' }} />
                <div className="font-bold text-sm" style={{ color: '#E2E8F0' }}>{tech.label}</div>
                <div className="text-xs mt-1" style={{ color: '#64748B' }}>{tech.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10" style={{ background: '#111827' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-3xl sm:text-4xl mb-6" style={{ fontFamily: 'var(--font-display)', color: '#E2E8F0' }}>
            Ready to Transform Your Construction Projects?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-body)', color: '#94A3B8' }}>
            Join leading Thai construction companies using AI-powered carbon assessment 
            to achieve sustainability certifications and reduce environmental impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" asChild className="group">
              <Link href="/auth">
                Start Free Assessment
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 mt-auto" style={{ background: '#0B1120', borderTop: '1px solid #1E293B' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #059669, #065F46)' }}
              >
                C
              </div>
              <div>
                <span className="font-bold text-lg block" style={{ fontFamily: 'var(--font-heading)', color: '#E2E8F0' }}>
                  CarbonScope
                </span>
                <span className="text-xs" style={{ fontFamily: 'var(--font-body)', color: '#64748B' }}>
                  by BKS Thailand
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              <Link href="/privacy" className="transition-colors" style={{ color: '#64748B' }}>Privacy</Link>
              <Link href="/terms" className="transition-colors" style={{ color: '#64748B' }}>Terms</Link>
              <Link href="/methodology" className="transition-colors" style={{ color: '#64748B' }}>Methodology</Link>
              <Link href="/contact" className="transition-colors" style={{ color: '#64748B' }}>Contact</Link>
            </div>
            <div className="text-xs" style={{ fontFamily: 'var(--font-body)', color: '#64748B' }}>
              © 2026 BKS Thailand. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
