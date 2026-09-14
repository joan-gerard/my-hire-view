import ViewPageContent from "@/components/view/ViewPageContent";
import UnavailableApplicationView from "@/components/view/UnavailableApplicationView";
import { getUser } from "@/lib/auth";
import { isUnavailablePublicApplication } from "@/lib/types/application";
import { loadOwnerDraftPreview } from "@/lib/utils/load-owner-draft-preview";
import { loadPublicApplicationResponse } from "@/lib/utils/load-public-application-response";

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

  if (application && !isUnavailablePublicApplication(application)) {
    return (
      <ViewPageContent
        initialApplication={application}
        publicId={publicId}
        slug={slug}
      />
    );
  }

  // F16-050: owners may preview their own draft on the real share URL.
  const user = await getUser();
  if (user) {
    const preview = await loadOwnerDraftPreview(publicId, slug, user.id);
    if (preview) {
      return (
        <ViewPageContent
          initialApplication={preview.application}
          publicId={publicId}
          slug={slug}
          draftPreviewApplicationId={preview.applicationId}
        />
      );
    }
  }

  return <UnavailableApplicationView />;
}
