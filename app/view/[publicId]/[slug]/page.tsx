import ViewPageContent from '@/components/view/ViewPageContent';
import UnavailableApplicationView from '@/components/view/UnavailableApplicationView';
import {
  isUnavailablePublicApplication,
  type PublicApplicationResponse,
} from '@/lib/types/application';
import { getBaseUrl } from '@/lib/utils/url';

async function getApplication(
  publicId: string,
  slug: string,
): Promise<PublicApplicationResponse> {
  const response = await fetch(
    `${getBaseUrl()}/api/applications/${publicId}/${slug}`,
    { cache: 'no-store' },
  );

  if (response.status === 404) {
    return { status: 'unavailable' };
  }

  if (!response.ok) {
    throw new Error(`Failed to load application (${response.status})`);
  }

  const { data } = (await response.json()) as {
    data: PublicApplicationResponse;
  };
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

  if (isUnavailablePublicApplication(application)) {
    return <UnavailableApplicationView />;
  }

  return (
    <ViewPageContent
      initialApplication={application}
      publicId={publicId}
      slug={slug}
    />
  );
}
