import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Keys | BKS cBIM AI',
  description: 'Manage your API keys for programmatic access to BIM Carbon',
  openGraph: {
    title: 'API Keys | BKS cBIM AI',
    description: 'Manage your API keys for programmatic access to BIM Carbon',
    type: 'website',
  },
};

export default async function APIKeysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
