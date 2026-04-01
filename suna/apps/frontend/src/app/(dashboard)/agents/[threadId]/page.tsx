'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RedirectPage } from './redirect-page';

export default function ThreadPage() {
  const params = useParams<{ threadId: string }>();
  return <RedirectPage threadId={params.threadId} />;
}