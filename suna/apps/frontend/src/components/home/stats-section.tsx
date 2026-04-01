'use client';

import { Badge } from '@/components/ui/carbonscope/badge';
import { TrendingDown } from 'lucide-react';

const stats = [
  {
    value: '40%',
    label: 'Average Carbon Reduction',
    description: 'Achieved through our optimization recommendations',
  },
  {
    value: '10k+',
    label: 'Projects Analyzed',
    description: 'Across 50+ countries worldwide',
  },
  {
    value: '2.5M',
    label: 'Tonnes CO₂e Saved',
    description: 'Cumulative carbon savings from platform users',
  },
  {
    value: '< 5 min',
    label: 'Assessment Time',
    description: 'From BIM upload to detailed carbon report',
  },
];

export function StatsSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/10 via-transparent to-emerald-950/10" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="border-emerald-900/50 bg-emerald-950/30 text-emerald-300">
            <TrendingDown className="w-3 h-3 mr-2" />
            Impact Metrics
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Driving measurable{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              carbon impact
            </span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 cs-stagger">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent rounded-2xl border border-zinc-800 group-hover:border-emerald-800/50 transition-all duration-300" />

              {/* Content */}
              <div className="relative p-8 space-y-3">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-white">
                  {stat.label}
                </div>
                <div className="text-sm text-zinc-400 leading-relaxed">
                  {stat.description}
                </div>
              </div>

              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
