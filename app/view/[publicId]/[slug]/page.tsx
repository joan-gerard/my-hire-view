import { notFound } from 'next/navigation';
import ViewPageContent from '@/components/view/ViewPageContent';
import { getBaseUrl } from '@/lib/utils/url';

async function getApplication(publicId: string, slug: string) {
  const response = await fetch(
    `${getBaseUrl()}/api/applications/${publicId}/${slug}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    return null;
  }

  const { data } = await response.json();
  return data;
}

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ publicId: string; slug: string }>;
}) {
  const { publicId, slug } = await params;
  const application = await getApplication(publicId, slug);

  if (!application) {
    notFound();
  }

  return (
    <ViewPageContent
      initialApplication={application}
      publicId={publicId}
      slug={slug}
    />
  );
}
