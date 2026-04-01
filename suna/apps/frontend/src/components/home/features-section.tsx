'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/carbonscope/card';
import { Badge } from '@/components/ui/carbonscope/badge';
import {
  Cpu,
  BarChart3,
  Shield,
  Zap,
  Database,
  TrendingDown,
  FileText,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms analyze your BIM models and provide intelligent carbon reduction recommendations.',
    badge: 'Core',
  },
  {
    icon: BarChart3,
    title: 'Lifecycle Assessment',
    description: 'Complete EN 15978 lifecycle analysis from raw material extraction to end-of-life disposal.',
    badge: 'LCA',
  },
  {
    icon: Database,
    title: 'EPD Integration',
    description: 'Direct access to global Environmental Product Declaration databases for accurate carbon data.',
    badge: 'Data',
  },
  {
    icon: TrendingDown,
    title: 'Carbon Optimization',
    description: 'Identify high-impact interventions and track carbon savings across design iterations.',
    badge: 'Optimization',
  },
  {
    icon: FileText,
    title: 'Automated Reporting',
    description: 'Generate compliance-ready reports for LEED, BREEAM, DGNB, and other green building certifications.',
    badge: 'Compliance',
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Enterprise-grade encryption and compliance with GDPR, ISO 27001, and industry standards.',
    badge: 'Security',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-4 sm:px-6">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="border-emerald-900/50 bg-emerald-950/30 text-emerald-300">
            <Zap className="w-3 h-3 mr-2" />
            Platform Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Everything you need for{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              carbon transparency
            </span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Comprehensive tools for measuring, analyzing, and reducing embodied carbon in building projects
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cs-stagger">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:border-emerald-800/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-900/30 group-hover:border-emerald-700/50 transition-colors">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Available now
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
