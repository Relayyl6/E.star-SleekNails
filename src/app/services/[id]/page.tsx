import ServiceDetailsClient from '@/components/services/ServiceDetailsClient';

export const dynamic = 'force-dynamic';

export default function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  return <ServiceDetailsClient params={params} />;
}

