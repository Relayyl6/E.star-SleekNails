import ServiceDetailsClient from '@/components/services/ServiceDetailsClient';

export const dynamic = 'force-dynamic';

export default async function ServiceDetailsPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const inspiration = typeof resolvedSearchParams.inspiration === 'string' ? resolvedSearchParams.inspiration : undefined;
  return <ServiceDetailsClient params={params} inspiration={inspiration} />;
}

