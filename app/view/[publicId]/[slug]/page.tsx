import ViewPageContent from "@/components/view/ViewPageContent";
import UnavailableApplicationView from "@/components/view/UnavailableApplicationView";
import { loadViewPageApplication } from "@/lib/utils/load-view-page-application";

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
  const result = await loadViewPageApplication(publicId, slug);

  if (result.kind === "live") {
    return (
      <ViewPageContent
        initialApplication={result.application}
        publicId={publicId}
        slug={slug}
      />
    );
  }

  if (result.kind === "owner_draft_preview") {
    return (
      <ViewPageContent
        initialApplication={result.application}
        publicId={publicId}
        slug={slug}
        draftPreviewApplicationId={result.applicationId}
      />
    );
  }

  return <UnavailableApplicationView />;
}
