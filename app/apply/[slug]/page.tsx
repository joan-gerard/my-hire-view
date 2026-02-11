import { notFound } from 'next/navigation';
import ApplicationHeader from '@/components/public/ApplicationHeader';
import PDFViewer from '@/components/pdf/PDFViewer';
import YouTubeEmbed from '@/components/video/YouTubeEmbed';
import { getBaseUrl } from '@/lib/utils/url';
import ViewTracker from './ViewTracker';

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

  const isArchived = application.is_active === false;

  return (
    <div className="min-h-screen bg-gray-50">
      <ApplicationHeader company={application.company} role={application.role} />
      
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {isArchived ? (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900"
            role="alert"
          >
            <p className="font-semibold">This application is no longer active</p>
            <p className="mt-1 text-sm">
              The candidate has archived this application. The CV and video pitch are no longer available.
            </p>
          </div>
        ) : (
          <>
            <ViewTracker slug={slug} />
            <div className="space-y-12">
              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">Resume</h2>
                <PDFViewer url={application.cv_url} />
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">Video Pitch</h2>
                <YouTubeEmbed url={application.video_url} />
              </section>

              {application.description && (
                <section>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">About</h2>
                  <div className="rounded-lg bg-white p-6 shadow-sm">
                    <p className="whitespace-pre-wrap text-gray-700">
                      {application.description}
                    </p>
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
