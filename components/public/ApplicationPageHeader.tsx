import ExternalLinkButton from "@/components/ui/ExternalLinkButton";

interface ApplicationPageHeaderProps {
  company: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  location?: string | null;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  /** Profile picture URL when the candidate chose to show it. When null/empty, no avatar is shown. */
  profileImageUrl?: string | null;
  /** When provided, shows a "Watch Video Pitch" button that calls this on click. */
  onWatchVideo?: () => void;
}

function nonEmpty(value: string | null | undefined): value is string {
  return value != null && String(value).trim() !== "";
}

/**
 * Header for the public application page (/view/[slug]). Shows company, role,
 * and an optional candidate block (name, location, portfolio/LinkedIn) only
 * when the candidate has provided that data. Layout stays balanced whether
 * optional fields are present or not.
 */
export default function ApplicationPageHeader({
  company,
  role,
  firstName,
  lastName,
  location,
  portfolioUrl,
  linkedinUrl,
  profileImageUrl,
  onWatchVideo,
}: ApplicationPageHeaderProps) {
  const hasProfileImage =
    profileImageUrl != null && String(profileImageUrl).trim() !== "";
  const displayName = [firstName, lastName].filter(nonEmpty).join(" ").trim();
  const hasName = displayName.length > 0;
  const hasLocation = nonEmpty(location);
  const hasPortfolio = nonEmpty(portfolioUrl);
  const hasLinkedIn = nonEmpty(linkedinUrl);
  const hasLinks = hasPortfolio || hasLinkedIn;

  return (
    <header className="bg-gradient-to-b from-slate-50 to-white py-10 shadow-sm sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Primary: name + Portfolio/LinkedIn + profile picture */}
        <div className="flex flex-col-reverse gap-6 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0 flex-1 flex flex-col gap-6">
            <h1 className="text-xl sm:text-5xl font-bold tracking-tight text-gray-900">
              {displayName}
            </h1>
            {(hasLinks || onWatchVideo) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {onWatchVideo && (
                  <button
                    type="button"
                    onClick={onWatchVideo}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Watch video pitch"
                  >
                    <svg
                      className="h-5 w-5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Video Pitch
                  </button>
                )}
                {hasPortfolio && (
                  <ExternalLinkButton
                    href={portfolioUrl!.trim()}
                    variant="portfolio"
                  >
                    Portfolio
                  </ExternalLinkButton>
                )}
                {hasLinkedIn && (
                  <ExternalLinkButton
                    href={linkedinUrl!.trim()}
                    variant="linkedin"
                  >
                    LinkedIn
                  </ExternalLinkButton>
                )}
              </div>
            )}
          </div>
          {hasProfileImage && (
            <div className="flex shrink-0 justify-start sm:justify-end">
              <div
                className="h-28 w-28 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200/80 sm:h-36 sm:w-36"
                aria-hidden
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileImageUrl!.trim()}
                  alt=""
                  className="h-full w-full object-cover"
                  width={144}
                  height={144}
                  decoding="async"
                />
              </div>
            </div>
          )}
        </div>

        {/* Job (company + role) and optional candidate info */}
        <div
          className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2"
          aria-label="Job and candidate details"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xl text-gray-600 sm:text-2xl">
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-5 w-5 shrink-0 text-gray-400 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008H17.25v-.008z"
                />
              </svg>
              <span className="truncate">{company}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-5 w-5 shrink-0 text-gray-400 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                />
              </svg>
              <span className="truncate">{role}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
