import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Worker Conversation | BKS cBIM AI',
  description: 'Interactive Worker conversation powered by BKS cBIM AI',
  openGraph: {
    title: 'Worker Conversation | BKS cBIM AI',
    description: 'Interactive Worker conversation powered by BKS cBIM AI',
    type: 'website',
  },
};

export default async function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
