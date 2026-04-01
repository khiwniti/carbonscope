'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/carbonscope/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20 opacity-50" />

          {/* Content */}
          <div className="relative p-12 md:p-16 text-center space-y-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-950/50 border border-emerald-900/30 mb-4">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-white">Ready to reduce your </span>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                carbon footprint?
              </span>
            </h2>

            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Join thousands of architects and engineers using BKS cBIM AI to design more sustainable buildings.
              Start your free assessment today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="xl" asChild className="group">
                <Link href="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>

            <p className="text-sm text-zinc-500 pt-4">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
