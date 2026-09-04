import ViewPageContent from '@/components/view/ViewPageContent';
import UnavailableApplicationView from '@/components/view/UnavailableApplicationView';
import { isUnavailablePublicApplication } from '@/lib/types/application';
import { loadPublicApplicationResponse } from '@/lib/utils/load-public-application-response';

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
  const application = await loadPublicApplicationResponse(publicId, slug);

  if (!application || isUnavailablePublicApplication(application)) {
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
