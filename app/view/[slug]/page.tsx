import { notFound } from 'next/navigation';
import ViewPageContent from '@/app/view/[slug]/ViewPageContent';
import { getBaseUrl } from '@/lib/utils/url';

async function getApplication(slug: string) {
  const response = await fetch(`${getBaseUrl()}/api/applications/${slug}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const { data } = await response.json();
  return data;
}

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const application = await getApplication(slug);

  if (!application) {
    notFound();
  }

  return <ViewPageContent initialApplication={application} slug={slug} />;
}
