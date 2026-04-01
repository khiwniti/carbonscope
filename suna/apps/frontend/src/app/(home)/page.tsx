'use client';

import { Suspense } from 'react';
import { BackgroundAALChecker } from '@/components/auth/background-aal-checker';
import { LandingEnhanced } from '@/components/home/landing-enhanced';

export default function Home() {
  return (
    <BackgroundAALChecker>
      <LandingEnhanced />
    </BackgroundAALChecker>
  );
}
