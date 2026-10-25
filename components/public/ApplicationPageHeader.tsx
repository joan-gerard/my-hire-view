"use client";

import {
  ADMIN_PANEL_CLASS,
  ADMIN_PRIMARY_CLASS,
  ADMIN_SECONDARY_CLASS,
} from "@/components/admin/admin-chrome";
import { VIEW_SHELL_CLASS } from "@/components/view/view-chrome";
import ExternalLinkButton from "@/components/ui/ExternalLinkButton";
import { LogoBlack } from "@/components/ui/Logo";
import { getCvDownloadFilename } from "@/lib/utils/cv-filename";
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
  publicId?: string;
  slug?: string;
  /** Original uploaded CV filename. Used for download when useOriginalCvFilename is true. */
  cvFilename?: string | null;
  /** When true (default), download uses cvFilename; when false, uses generated name CV-{Slug}.pdf. */
  useOriginalCvFilename?: boolean;
}

/** Records a CV download (once per session). Owner downloads are not counted. */
function recordDownloadCount(publicId: string, slug: string): void {
  if (typeof window === "undefined") return;
  const storageKey = `download_tracked_${publicId}_${slug}`;
  if (sessionStorage.getItem(storageKey)) return;
  fetch(`/api/applications/${publicId}/${slug}/download`, { method: "POST" })
    .then((response) => {
      if (response.ok) sessionStorage.setItem(storageKey, "true");
    })
    .catch((err) => console.error("Failed to track download:", err));
}

function nonEmpty(value: string | null | undefined): value is string {
  return value != null && String(value).trim() !== "";
}

/**
 * Header for the public application page (/view/[publicId]/[slug]). Shows company, role,
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
  publicId,
  slug,
  cvFilename,
  useOriginalCvFilename = true,
}: ApplicationPageHeaderProps) {
  const [downloading, setDownloading] = useState(false);
  const hasProfileImage =
    profileImageUrl != null && String(profileImageUrl).trim() !== "";
  const displayName = [firstName, lastName].filter(nonEmpty).join(" ").trim();
  const hasLocation = nonEmpty(location);
  const hasPortfolio = nonEmpty(portfolioUrl);
  const hasLinkedIn = nonEmpty(linkedinUrl);
  const hasLinks = hasPortfolio || hasLinkedIn;
  const hasCv = nonEmpty(cvUrl);
  const hasIdentity =
    Boolean(displayName) || hasLocation || hasLinks || hasProfileImage;

  const handleViewFile = () => {
    if (cvUrl) window.open(cvUrl, "_blank");
  };

  const handleDownload = async () => {
    if (typeof window === "undefined" || !cvUrl) return;
    setDownloading(true);
    try {
      if (publicId && slug) recordDownloadCount(publicId, slug);
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
    <header className={`${VIEW_SHELL_CLASS} pt-5 sm:pt-6`}>
      <div className="mb-4">
        <LogoBlack />
      </div>

      {/* Primary: identity (name, location, links, avatar) + optional video */}
      {hasIdentity || onWatchVideo ? (
        <div className={`${ADMIN_PANEL_CLASS} p-4 sm:p-6`}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
              {displayName ? (
                <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-4xl lg:text-5xl">
                  {displayName}
                </h1>
              ) : null}
              {hasLocation ? (
                <p className="text-sm text-[var(--muted)] sm:text-base">
                  {location!.trim()}
                </p>
              ) : null}
              {hasLinks ? (
                <div className="flex flex-wrap items-center gap-2">
                  {hasPortfolio ? (
                    <ExternalLinkButton
                      href={portfolioUrl!.trim()}
                      variant="portfolio"
                    >
                      Portfolio
                    </ExternalLinkButton>
                  ) : null}
                  {hasLinkedIn ? (
                    <ExternalLinkButton
                      href={linkedinUrl!.trim()}
                      variant="linkedin"
                    >
                      <LinkedInIcon className="shrink-0" />
                    </ExternalLinkButton>
                  ) : null}
                </div>
              ) : null}
              {onWatchVideo ? (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onWatchVideo}
                    className={ADMIN_PRIMARY_CLASS}
                    aria-label="Watch video pitch"
                  >
                    <svg
                      className="h-4 w-4 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Video Pitch
                  </button>
                </div>
              ) : null}
            </div>

            {hasProfileImage ? (
              <div className="flex shrink-0 items-center justify-start sm:justify-end">
                <div
                  className="h-28 w-28 overflow-hidden rounded-full bg-[var(--paper)] ring-2 ring-[var(--ink)]/10 sm:h-36 sm:w-36"
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
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Quieter job + CV actions strip */}
      <div
        className={`mt-3 flex flex-wrap items-center justify-between gap-3 ${ADMIN_PANEL_CLASS} px-4 py-3 sm:px-6 sm:py-4`}
        aria-label="Job and candidate details"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-base text-[var(--ink)] sm:text-xl">
          <span className="inline-flex min-w-0 items-center gap-2">
            <BuildingIcon className="h-5 w-5 shrink-0 text-[var(--muted)]" />
            <span className="truncate font-medium">{company}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 shrink-0 text-[var(--muted)]" />
            <span className="truncate font-medium">{role}</span>
          </span>
        </div>
        {hasCv ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleViewFile}
              className={ADMIN_SECONDARY_CLASS}
            >
              View CV
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className={ADMIN_PRIMARY_CLASS}
            >
              {downloading ? "Downloading…" : "Download CV"}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
