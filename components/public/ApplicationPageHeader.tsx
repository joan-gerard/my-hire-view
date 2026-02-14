interface ApplicationPageHeaderProps {
  company: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  location?: string | null;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
}

/**
 * Header for the public application page (/view/[slug]). Shows company, role,
 * candidate name, location, and portfolio/LinkedIn links to recruiters.
 */
export default function ApplicationPageHeader({
  company,
  role,
  firstName,
  lastName,
  location,
  portfolioUrl,
  linkedinUrl,
}: ApplicationPageHeaderProps) {
  const hasName = [firstName, lastName].some(
    (v) => v != null && v.trim() !== "",
  );
  const displayName = [firstName, lastName]
    .filter((v) => v != null && v.trim() !== "")
    .join(" ")
    .trim();

  return (
    <div className="bg-white py-12 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">{company}</h1>
        <p className="mt-2 text-2xl text-gray-600">{role}</p>
        {hasName && <p className="mt-2 text-lg text-gray-700">{displayName}</p>}
        {location != null && location.trim() !== "" && (
          <p className="mt-1 text-sm text-gray-500">{location.trim()}</p>
        )}
        {((portfolioUrl != null && portfolioUrl.trim() !== "") ||
          (linkedinUrl != null && linkedinUrl.trim() !== "")) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {portfolioUrl != null && portfolioUrl.trim() !== "" && (
              <a
                href={portfolioUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Portfolio
              </a>
            )}
            {linkedinUrl != null && linkedinUrl.trim() !== "" && (
              <a
                href={linkedinUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:ring-offset-2"
              >
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
