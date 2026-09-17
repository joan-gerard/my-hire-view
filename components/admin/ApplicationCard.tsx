'use client';

import type { ApplicationListItem } from '@/lib/types/application';
import { getApplicationUrl } from '@/lib/utils/url';
import { copyToClipboard } from '@/lib/utils/clipboard';
import Link from 'next/link';
import { useState } from 'react';
import ApplicationCardDropdown from '@/components/admin/ApplicationCardDropdown';
import ApplicationCardInsights from '@/components/admin/ApplicationCardInsights';
import {
  ApplicationStatusIcon,
  MissingCvBadge,
} from '@/components/admin/ApplicationStatusIcon';
import {
  ChartIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  ExternalLinkIcon,
} from '@/components/admin/icons';

interface ApplicationCardProps {
  application: ApplicationListItem;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPublish?: (id: string) => void;
}

/** Shared chrome for secondary card actions (Copy Link, Insights). */
const SECONDARY_ACTION_CLASS =
  'inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--foreground)]/12 bg-[var(--brand-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--brand-secondary-text)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent-1)] focus-visible:ring-offset-1';

/** Primary card CTA (View / Preview). */
const PRIMARY_ACTION_CLASS =
  'inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] px-3 py-1.5 text-sm font-medium text-[var(--brand-primary-text)] hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1';

/** Positive action (Publish) — darker teal for WCAG AA contrast with white text. */
const ACCENT_ACTION_CLASS =
  'inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--brand-accent-2)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent-2)] focus-visible:ring-offset-1';

const DISABLED_ACTION_CLASS =
  'inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--foreground)]/10 bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)]/45';

export default function ApplicationCard({
  application,
  onDelete,
  onArchive,
  onRestore,
  onPublish,
}: ApplicationCardProps) {
  const [copied, setCopied] = useState(false);
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const canShare = Boolean(application.public_id);
  const shareableUrl = canShare
    ? getApplicationUrl(application.public_id!, application.slug)
    : null;
  const isArchived = application.status === 'archived';
  const isDraft = application.status === 'draft';
  const canCopyLink = canShare && !isDraft && !isArchived;

  const handleCopyLink = async () => {
    if (!shareableUrl || !canCopyLink) return;
    const success = await copyToClipboard(shareableUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-visible rounded-2xl border border-[var(--foreground)]/10 bg-[var(--secondary-background)] shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
          <ApplicationStatusIcon
            status={application.status}
            viewCount={application.view_count}
          />

          <span className="min-w-0 text-sm font-medium text-[var(--foreground)] sm:text-base">
            {application.company} - {application.role}
          </span>

          {application.cv_exists === false && <MissingCvBadge />}

          <div className="hidden flex-1 sm:block" aria-hidden="true" />

          {isDraft && onPublish ? (
            <button
              type="button"
              onClick={() => onPublish(application.id)}
              className={ACCENT_ACTION_CLASS}
              title="Make this application live so recruiters can open the share link"
            >
              <CheckIcon className="h-4 w-4" />
              Publish
            </button>
          ) : null}

          {canCopyLink ? (
            <button
              type="button"
              onClick={handleCopyLink}
              className={SECONDARY_ACTION_CLASS}
            >
              <CopyIcon className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          ) : (
            <span
              className={DISABLED_ACTION_CLASS}
              title={
                isDraft
                  ? 'Publish this application before sharing the link'
                  : isArchived
                    ? 'Restore this application before sharing the link'
                    : 'Complete your profile to get a share link'
              }
            >
              <CopyIcon className="h-4 w-4" />
              {isDraft ? 'Publish to share' : 'Link unavailable'}
            </span>
          )}

          <button
            type="button"
            onClick={() => setInsightsExpanded(!insightsExpanded)}
            className={SECONDARY_ACTION_CLASS}
          >
            <ChartIcon className="h-4 w-4" />
            View Insights
            {insightsExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>

          {canShare ? (
            <Link
              href={`/view/${application.public_id}/${application.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={PRIMARY_ACTION_CLASS}
              title={
                isDraft
                  ? 'Preview the public page (recruiters cannot see it until you publish)'
                  : 'Open the live public application page'
              }
            >
              <ExternalLinkIcon className="h-4 w-4" />
              {isDraft ? 'Preview' : 'View Application'}
            </Link>
          ) : (
            <span
              className={DISABLED_ACTION_CLASS}
              title="Complete your profile to preview the public page"
            >
              <ExternalLinkIcon className="h-4 w-4" />
              View unavailable
            </span>
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

        <ApplicationCardInsights
          expanded={insightsExpanded}
          viewCount={application.view_count}
          downloadCount={application.download_count ?? 0}
          createdAt={application.created_at}
          lastViewedAt={application.last_viewed_at ?? null}
        />
      </div>
    </div>
  );
}
