"use client";

import ExternalLinkButton from "@/components/ui/ExternalLinkButton";
import { getCvDownloadFilename } from "@/lib/utils/cv-filename";
import Link from "next/link";
import { useState } from "react";
import { BriefcaseIcon, BuildingIcon, LinkedInIcon } from "../admin/icons";

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
  /** CV URL for the View CV and Download CV buttons. */
  cvUrl?: string | null;
  /** When provided, a download is recorded (once per session) when the user clicks Download CV. Owner downloads are not counted. */
  slug?: string;
  /** Original uploaded CV filename. Used for download when useOriginalCvFilename is true. */
  cvFilename?: string | null;
  /** When true (default), download uses cvFilename; when false, uses generated name CV-{Slug}.pdf. */
  useOriginalCvFilename?: boolean;
}

/** Records a CV download (once per session). Owner downloads are not counted. */
function recordDownloadCount(slug: string): void {
  if (typeof window === "undefined") return;
  const storageKey = `download_tracked_${slug}`;
  if (sessionStorage.getItem(storageKey)) return;
  fetch(`/api/applications/${slug}/download`, { method: "POST" })
    .then((response) => {
      if (response.ok) sessionStorage.setItem(storageKey, "true");
    })
    .catch((err) => console.error("Failed to track download:", err));
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
  cvUrl,
  slug,
  cvFilename,
  useOriginalCvFilename = true,
}: ApplicationPageHeaderProps) {
  const [downloading, setDownloading] = useState(false);
  const hasProfileImage =
    profileImageUrl != null && String(profileImageUrl).trim() !== "";
  const displayName = [firstName, lastName].filter(nonEmpty).join(" ").trim();
  const hasName = displayName.length > 0;
  const hasLocation = nonEmpty(location);
  const hasPortfolio = nonEmpty(portfolioUrl);
  const hasLinkedIn = nonEmpty(linkedinUrl);
  const hasLinks = hasPortfolio || hasLinkedIn;
  const hasCv = nonEmpty(cvUrl);

  const handleViewFile = () => {
    if (cvUrl) window.open(cvUrl, "_blank");
  };

  const handleDownload = async () => {
    if (typeof window === "undefined" || !cvUrl) return;
    setDownloading(true);
    try {
      if (slug) recordDownloadCount(slug);
      const response = await fetch(cvUrl, { mode: "cors" });
      if (!response.ok) throw new Error("Failed to fetch PDF");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download =
        useOriginalCvFilename && cvFilename
          ? cvFilename
          : getCvDownloadFilename(slug ?? undefined);
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="pt-5 shadow-sm sm:pt-6 px-2 sm:px-6 lg:px-8">
      <Link href="/" className="text-xl font-bold text-[var(--foreground)]">
        MyHireView
      </Link>

      <div className="mx-auto max-w-6xl ">
        {/* Primary: name + Portfolio/LinkedIn + profile picture */}
        <div className="flex flex-col-reverse gap-6 border-b border-[var(--foreground)]/10 pb-6 sm:flex-row sm:items-stretch sm:justify-between sm:gap-8 p-4 sm:p-6 lg:p-8 bg-[var(--secondary-background)] rounded-xl border border-[var(--foreground)]/10">
          {hasProfileImage && (
            <div className="flex shrink-0 items-center justify-start sm:justify-end">
              <div
                className="h-28 w-28 overflow-hidden rounded-full bg-[var(--background)] ring-2 ring-[var(--foreground)]/10 sm:h-36 sm:w-36"
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

          <div className="flex w-full flex-col justify-between gap-6 py-2">
            <h1 className="text-xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)]">
              {displayName}
            </h1>
            {hasLinks && (
              <div className="flex flex-wrap items-center gap-2">
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
                    <LinkedInIcon className="shrink-0" />
                  </ExternalLinkButton>
                )}
              </div>
            )}
          </div>

          <div className="flex items-end justify-end">
            {onWatchVideo && (
              <button
                type="button"
                onClick={onWatchVideo}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
          </div>
        </div>

        {/* Job (company + role) and optional candidate info */}
        <div
          className="mt-2 flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 lg:p-8 bg-[var(--secondary-background)] rounded-xl border border-[var(--foreground)]/10"
          aria-label="Job and candidate details"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xl text-[var(--foreground)]/80 sm:gap-y-1 sm:text-2xl">
            <span className="inline-flex items-center gap-2">
              <BuildingIcon className="h-5 w-5 shrink-0 text-[var(--foreground)]/60 sm:h-6 sm:w-6" />
              <span className="truncate">{company}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <BriefcaseIcon className="h-5 w-5 shrink-0 text-[var(--foreground)]/60 sm:h-6 sm:w-6" />
              <span className="truncate">{role}</span>
            </span>
          </div>
          {hasCv && (
            <div className="flex gap-2">
              <button
                onClick={handleViewFile}
                className="rounded-md bg-[var(--brand-secondary)] px-4 py-2 text-sm font-semibold text-[var(--brand-secondary-text)] hover:opacity-90"
              >
                View CV
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary-text)] hover:opacity-95 disabled:opacity-50"
              >
                {downloading ? "Downloading…" : "Download CV"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
