'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/carbonscope/button';
import { Badge } from '@/components/ui/carbonscope/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/carbonscope/card';
import {
  ArrowRight, Sparkles, Building2, Zap, Activity, FileText,
  ChartColumn, ShieldCheck, Network, Calculator, Leaf,
  Cpu, Database, FileCheck, TrendingUp, Users, Clock,
  CheckCircle2, ArrowUpRight, Globe, Target, Layers,
  BarChart3, Box, Workflow, Gauge, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== INTERACTIVE COMPONENTS =====

function InteractiveCarbonCalculator() {
  const [building, setBuilding] = useState('residential');
  const [area, setArea] = useState(1000);
  const [carbon, setCarbon] = useState(0);
  const [calculating, setCalculating] = useState(false);

  const calculate = () => {
    setCalculating(true);
    // Simulate calculation with realistic values
    setTimeout(() => {
      const baseCarbon = {
        residential: 450,
        commercial: 620,
        industrial: 820,
      }[building] || 500;

      const result = (baseCarbon * (area / 1000)).toFixed(1);
      setCarbon(parseFloat(result));
      setCalculating(false);
    }, 800);
  };

  useEffect(() => {
    calculate();
  }, [building, area]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/40 to-blue-950/40 p-8 border border-emerald-500/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(52,211,153,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Live Carbon Calculator</h3>
            <p className="text-sm text-slate-400">EN 15978 compliant estimation</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Building Type</label>
            <select
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Floor Area (m²)</label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(parseInt(e.target.value) || 1000)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div className="relative rounded-xl bg-slate-900/50 border border-emerald-500/30 p-6">
          <div className="flex items-baseline gap-2 mb-1">
            <div className={cn(
              "font-black text-4xl transition-all duration-500",
              calculating ? "opacity-50 scale-95" : "opacity-100 scale-100"
            )}>
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                {carbon.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-slate-400">tCO₂e</div>
          </div>
          <div className="text-xs text-emerald-400/70">Embodied carbon (A1-A3)</div>

          {!calculating && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="text-xs">
                <div className="text-slate-500">Materials</div>
                <div className="text-white font-semibold">{(carbon * 0.65).toFixed(1)}</div>
              </div>
              <div className="text-xs">
                <div className="text-slate-500">Transport</div>
                <div className="text-white font-semibold">{(carbon * 0.15).toFixed(1)}</div>
              </div>
              <div className="text-xs">
                <div className="text-slate-500">Construction</div>
                <div className="text-white font-semibold">{(carbon * 0.20).toFixed(1)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>Calculated in 0.5s • 100% EN 15978 compliant</span>
        </div>
      </div>
    </div>
  );
}

function MaterialComparisonTool() {
  const [selected, setSelected] = useState<'steel' | 'concrete' | 'timber'>('steel');

  const materials = {
    steel: {
      name: 'Structural Steel',
      carbon: 2.1,
      cost: 850,
      availability: 95,
      color: '#3B82F6',
    },
    concrete: {
      name: 'Reinforced Concrete',
      carbon: 0.8,
      cost: 520,
      availability: 100,
      color: '#64748B',
    },
    timber: {
      name: 'Cross-Laminated Timber',
      carbon: -0.3,
      cost: 720,
      availability: 75,
      color: '#10B981',
    },
  };

  const current = materials[selected];

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900/40 to-purple-950/40 p-8 border border-blue-500/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Material Optimizer</h3>
            <p className="text-sm text-slate-400">501 TGO materials database</p>
          </div>
        </div>

        <div className="flex gap-2">
          {Object.entries(materials).map(([key, mat]) => (
            <button
              key={key}
              onClick={() => setSelected(key as any)}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300",
                selected === key
                  ? "bg-slate-800 text-white ring-2"
                  : "bg-slate-900/50 text-slate-400 hover:bg-slate-800/50"
              )}
              style={selected === key ? { ringColor: mat.color } : {}}
            >
              {mat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="relative rounded-lg bg-slate-900/50 border border-slate-700 p-4">
            <div className="text-xs text-slate-500 mb-2">Carbon Impact</div>
            <div className="flex items-baseline gap-1">
              <div className={cn(
                "font-black text-2xl",
                current.carbon < 0 ? "text-emerald-400" : "text-white"
              )}>
                {current.carbon > 0 ? '+' : ''}{current.carbon}
              </div>
              <div className="text-xs text-slate-500">tCO₂e/m³</div>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${Math.abs(current.carbon / 2.1) * 100}%`,
                  backgroundColor: current.carbon < 0 ? '#10B981' : current.color,
                }}
              />
            </div>
          </div>

          <div className="relative rounded-lg bg-slate-900/50 border border-slate-700 p-4">
            <div className="text-xs text-slate-500 mb-2">Cost</div>
            <div className="flex items-baseline gap-1">
              <div className="font-black text-2xl text-white">
                {current.cost}
              </div>
              <div className="text-xs text-slate-500">THB/m³</div>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full transition-all duration-700 bg-blue-500"
                style={{ width: `${(current.cost / 850) * 100}%` }}
              />
            </div>
          </div>

          <div className="relative rounded-lg bg-slate-900/50 border border-slate-700 p-4">
            <div className="text-xs text-slate-500 mb-2">Availability</div>
            <div className="flex items-baseline gap-1">
              <div className="font-black text-2xl text-white">
                {current.availability}
              </div>
              <div className="text-xs text-slate-500">%</div>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full transition-all duration-700 bg-purple-500"
                style={{ width: `${current.availability}%` }}
              />
            </div>
          </div>
        </div>

        {current.carbon < 0 && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3">
            <div className="flex items-start gap-2">
              <Leaf className="w-4 h-4 text-emerald-400 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-emerald-400">Carbon Negative Material</div>
                <div className="text-emerald-400/70">This material sequesters more carbon than it emits during production</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AIAgentShowcase() {
  const [activeAgent, setActiveAgent] = useState(0);

  const agents = [
    { name: 'Supervisor Router', capability: '100% routing accuracy', icon: Network, color: '#10B981' },
    { name: 'Carbon Calculator', capability: '0.5s response time', icon: Calculator, color: '#3B82F6' },
    { name: 'Material Optimizer', capability: '501 TGO materials', icon: Layers, color: '#8B5CF6' },
    { name: 'Compliance Checker', capability: 'TREES + EDGE certified', icon: ShieldCheck, color: '#F59E0B' },
    { name: 'Report Generator', capability: 'PDF export', icon: FileText, color: '#EC4899' },
    { name: 'Data Analyst', capability: 'Multi-criteria optimization', icon: BarChart3, color: '#06B6D4' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agents.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/40 to-pink-950/40 p-8 border border-purple-500/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_60%)] pointer-events-none" />

      <div className="relative space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Workflow className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">12-Agent LangGraph System</h3>
            <p className="text-sm text-slate-400">Autonomous carbon intelligence</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {agents.map((agent, idx) => (
            <div
              key={idx}
              className={cn(
                "relative rounded-lg p-4 transition-all duration-500 cursor-pointer",
                activeAgent === idx
                  ? "bg-slate-800 ring-2 scale-105"
                  : "bg-slate-900/50 hover:bg-slate-800/50 scale-100"
              )}
              style={activeAgent === idx ? { ringColor: agent.color } : {}}
              onClick={() => setActiveAgent(idx)}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${agent.color}20` }}
                >
                  <agent.icon className="w-4 h-4" style={{ color: agent.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{agent.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">{agent.capability}</div>
                </div>
              </div>

              {activeAgent === idx && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: agent.color }} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs font-semibold text-emerald-400">Active Agent: {agents[activeAgent].name}</div>
          </div>
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 animate-[shimmer_2s_infinite]" style={{ width: '70%' }} />
            </div>
            <div className="text-xs text-slate-500">Processing carbon assessment...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export function LandingEnhanced() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroOpacity = Math.max(1 - scrollY / 500, 0);
  const heroScale = Math.max(1 - scrollY / 2000, 0.95);

  return (
    <div className="w-full min-h-screen" style={{ background: '#0B1120' }}>
      {/* Animated Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(52,211,153,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Gradient Orbs */}
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)',
            opacity: heroOpacity * 0.5,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            opacity: heroOpacity * 0.4,
          }}
        />

        {/* Hero Content */}
        <div
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20"
          style={{
            opacity: heroOpacity,
            transform: `scale(${heroScale})`,
          }}
        >
          <div className="w-full max-w-5xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-1000 backdrop-blur-sm",
                "bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              <div className="relative">
                <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
                <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping bg-emerald-400 opacity-75" />
              </div>
              <span className="text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Autonomous Carbon Intelligence Platform
              </span>
            </div>

            {/* Heading with gradient */}
            <h1
              className={cn(
                "font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight transition-all duration-1000 delay-100",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              <div className="bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent leading-[1.1]">
                Build Smarter.
              </div>
              <div className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-[1.1] mt-2">
                Carbon Neutral.
              </div>
            </h1>

            {/* Description */}
            <p
              className={cn(
                "text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed text-slate-400 transition-all duration-1000 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              12-agent AI system delivering instant EN 15978 carbon assessments for sustainable construction.
              Transform weeks of manual analysis into <span className="text-emerald-400 font-semibold">0.5 seconds</span> of intelligent automation.
            </p>

            {/* CTA Buttons */}
            <div
              className={cn(
                "flex items-center justify-center gap-4 transition-all duration-1000 delay-300",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              <Link href="/auth">
                <button className="group relative px-8 py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-100 group-hover:opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2">
                    <span>Start Free Assessment</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </Link>

              <button className="px-8 py-4 rounded-xl font-bold text-white border-2 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all duration-300">
                View Live Demo
              </button>
            </div>

            {/* Stats */}
            <div
              className={cn(
                "grid grid-cols-2 sm:grid-cols-4 gap-8 mt-16 transition-all duration-1000 delay-400",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              {[
                { value: '501', label: 'TGO Materials', icon: Database },
                { value: '0.5s', label: 'Response Time', icon: Zap },
                { value: '99.8%', label: 'Accuracy', icon: Target },
                { value: '12', label: 'AI Agents', icon: Cpu },
              ].map((stat, idx) => (
                <div key={idx} className="group">
                  <div className="flex flex-col items-center gap-2">
                    <stat.icon className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-black text-4xl bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-20 pb-8 flex justify-center">
          <div className="animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-slate-700 flex items-start justify-center p-2">
              <div className="w-1 h-3 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demos Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8" style={{ background: '#111827' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Live Capabilities
            </Badge>
            <h2 className="font-black text-4xl sm:text-5xl mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Experience Real-Time Carbon Intelligence
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Interact with our AI-powered tools. These are live demonstrations of actual platform capabilities.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <InteractiveCarbonCalculator />
            <MaterialComparisonTool />
          </div>

          <div className="w-full">
            <AIAgentShowcase />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8" style={{ background: '#0B1120' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="default" className="mb-6">Core Capabilities</Badge>
            <h2 className="font-black text-4xl sm:text-5xl mb-6 text-white">
              Complete Carbon Assessment Suite
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Building2,
                title: 'Embodied Carbon',
                description: 'A1-A3 lifecycle assessment with EN 15978 compliance',
                color: '#10B981',
              },
              {
                icon: Activity,
                title: 'Operational Tracking',
                description: 'Real-time Scope 1 & 2 emissions monitoring',
                color: '#3B82F6',
              },
              {
                icon: ChartColumn,
                title: 'Lifecycle Analysis',
                description: 'B1-B7 use stage and C1-C4 end-of-life optimization',
                color: '#8B5CF6',
              },
              {
                icon: ShieldCheck,
                title: 'Certification',
                description: 'TREES NC 1.1 and EDGE V3 automated compliance',
                color: '#F59E0B',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl bg-slate-900/50 p-8 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:scale-105"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="font-bold text-xl text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>

                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-500/5 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8" style={{ background: '#111827' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950/40 via-blue-950/40 to-purple-950/40 p-12 border border-emerald-500/30 backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(52,211,153,0.1),transparent_70%)] pointer-events-none rounded-3xl" />

            <div className="relative space-y-8">
              <h2 className="font-black text-4xl sm:text-5xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Ready to Decarbonize Your Projects?
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Join forward-thinking architects and developers using AI to build a sustainable future.
              </p>

              <div className="flex items-center justify-center gap-4">
                <Link href="/auth">
                  <button className="group relative px-10 py-5 rounded-xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2">
                      <span>Start Free Trial</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Free 14-day trial</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
