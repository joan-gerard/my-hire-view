/**
 * Features section for the marketing/landing page. Describes Custom CV Upload,
 * Video Pitch, and Shareable Links.
 */
export default function MarketingFeatures() {
  return (
    <section id="features" className="bg-[var(--secondary-background)] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-[var(--brand-primary)]">
            Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Everything you need to stand out
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-[var(--foreground)]">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary)]">
                  <svg
                    className="h-6 w-6 text-[var(--brand-primary-text)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                    />
                  </svg>
                </div>
                Custom CV Upload
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-[var(--foreground)]/80">
                <p className="flex-auto">
                  Upload role-specific CVs as PDFs. Each application gets its
                  own tailored resume.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-[var(--foreground)]">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary)]">
                  <svg
                    className="h-6 w-6 text-[var(--brand-primary-text)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                Video Pitch
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-[var(--foreground)]/80">
                <p className="flex-auto">
                  Embed personalized YouTube video pitches to showcase your
                  personality and passion.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-[var(--foreground)]">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary)]">
                  <svg
                    className="h-6 w-6 text-[var(--brand-primary-text)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                  </svg>
                </div>
                Shareable Links
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-[var(--foreground)]/80">
                <p className="flex-auto">
                  Generate unique, shareable links for each application. Track
                  views and manage all your applications from one dashboard.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
