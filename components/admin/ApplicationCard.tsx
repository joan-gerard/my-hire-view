"use client";

import type { ApplicationListItem } from "@/lib/types/application";
import { getApplicationUrl } from "@/lib/utils/url";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatApplicationTime } from "@/lib/utils/group-applications-by-day";
import Link from "next/link";
import { useState } from "react";
import ApplicationCardDropdown from "@/components/admin/ApplicationCardDropdown";
import ApplicationCardInsights from "@/components/admin/ApplicationCardInsights";
import AdminTooltip from "@/components/admin/AdminTooltip";
import {
  ApplicationStatusIcon,
  MissingCvBadge,
  MissingProfilePictureBadge,
} from "@/components/admin/ApplicationStatusIcon";
import {
  ChartIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
} from "@/components/admin/icons";
import {
  ADMIN_ICON_DISABLED_CLASS,
  ADMIN_ICON_SECONDARY_CLASS,
  ADMIN_PRIMARY_CLASS,
} from "@/components/admin/admin-chrome";

interface ApplicationCardProps {
  application: ApplicationListItem;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPublish?: (id: string) => void;
}

export default function ApplicationCard({
  application,
  onDelete,
  onArchive,
  onRestore,
  onPublish,
}: ApplicationCardProps) {
  const [copied, setCopied] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const canShare = Boolean(application.public_id);
  const shareableUrl = canShare
    ? getApplicationUrl(application.public_id!, application.slug)
    : null;
  const isArchived = application.status === "archived";
  const isDraft = application.status === "draft";
  const canCopyLink = canShare && !isDraft && !isArchived;
  const createdLabel = formatApplicationTime(application.created_at);
  const companyRole =
    [application.company.trim(), application.role.trim()]
      .filter(Boolean)
      .join(" - ") || "Untitled application";

  const copyUnavailableLabel = isDraft
    ? "Publish this application before sharing the link"
    : isArchived
      ? "Restore this application before sharing the link"
      : "Complete your profile to get a share link";

  const handleCopyLink = async () => {
    if (!shareableUrl || !canCopyLink) return;
    const success = await copyToClipboard(shareableUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Always visible on small screens; hover/focus/open menu on md+.
  const actionsVisibleClass =
    "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:group-has-[[aria-expanded=true]]:opacity-100";

  return (
    <article className="group relative z-0 overflow-visible hover:z-30 hover:bg-[var(--ink)]/[0.03] has-[[aria-expanded=true]]:z-40">
      <div className="px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex flex-wrap items-start gap-3 sm:flex-nowrap sm:items-center sm:gap-4">
          <time
            dateTime={application.created_at}
            className="w-14 shrink-0 pt-0.5 text-xs tabular-nums text-[var(--muted)] sm:pt-0"
          >
            {createdLabel}
          </time>

          <ApplicationStatusIcon
            status={application.status}
            viewCount={application.view_count}
          />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="min-w-0 text-sm text-[var(--ink)]">
                {companyRole}
              </span>
              {application.cv_exists === false && <MissingCvBadge />}
              {application.profile_picture_missing === true && (
                <MissingProfilePictureBadge />
              )}
            </div>
          </div>

          <div
            className={`flex min-w-0 flex-wrap items-center justify-end gap-1.5 transition-opacity ${actionsVisibleClass}`}
          >
            {isDraft && onPublish ? (
              <AdminTooltip label="Make this application live so recruiters can open the share link">
                <button
                  type="button"
                  onClick={() => onPublish(application.id)}
                  className={ADMIN_PRIMARY_CLASS}
                >
                  <CheckIcon className="h-4 w-4" />
                  Publish
                </button>
              </AdminTooltip>
            ) : null}

            {canCopyLink ? (
              <AdminTooltip label={copied ? "Copied!" : "Copy link"}>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={ADMIN_ICON_SECONDARY_CLASS}
                  aria-label={copied ? "Copied!" : "Copy link"}
                >
                  <CopyIcon className="h-4 w-4" />
                </button>
              </AdminTooltip>
            ) : (
              <AdminTooltip label={copyUnavailableLabel}>
                <span
                  className={ADMIN_ICON_DISABLED_CLASS}
                  aria-label={
                    isDraft
                      ? "Publish to share"
                      : isArchived
                        ? "Link unavailable — restore first"
                        : "Link unavailable"
                  }
                >
                  <CopyIcon className="h-4 w-4" />
                </span>
              </AdminTooltip>
            )}

            <AdminTooltip label="View insights">
              <button
                type="button"
                onClick={() => setInsightsOpen(true)}
                className={ADMIN_ICON_SECONDARY_CLASS}
                aria-label="View insights"
                aria-haspopup="dialog"
                aria-expanded={insightsOpen}
              >
                <ChartIcon className="h-4 w-4" />
              </button>
            </AdminTooltip>

            {canShare ? (
              <AdminTooltip
                label={
                  isDraft
                    ? "Preview the public page (recruiters cannot see it until you publish)"
                    : "View application"
                }
              >
                <Link
                  href={`/view/${application.public_id}/${application.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ADMIN_ICON_SECONDARY_CLASS}
                  aria-label={
                    isDraft ? "Preview application" : "View application"
                  }
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </Link>
              </AdminTooltip>
            ) : (
              <AdminTooltip label="Complete your profile to preview the public page">
                <span
                  className={ADMIN_ICON_DISABLED_CLASS}
                  aria-label="View unavailable"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </span>
              </AdminTooltip>
            )}

            <ApplicationCardDropdown
              applicationId={application.id}
              isArchived={isArchived}
              isDraft={isDraft}
              onDelete={onDelete}
              onArchive={onArchive}
              onRestore={onRestore}
              onPublish={onPublish}
            />
          </div>
        </div>
      </div>

      <ApplicationCardInsights
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        applicationLabel={companyRole}
        viewCount={application.view_count}
        downloadCount={application.download_count ?? 0}
        createdAt={application.created_at}
        lastViewedAt={application.last_viewed_at ?? null}
      />
    </article>
  );
}
