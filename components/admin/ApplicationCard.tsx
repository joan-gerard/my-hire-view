'use client';

import type { ApplicationListItem } from '@/lib/types/application';
import { getApplicationUrl } from '@/lib/utils/url';
import { copyToClipboard } from '@/lib/utils/clipboard';
import Link from 'next/link';
import { useState } from 'react';
import ApplicationCardDropdown from '@/components/admin/ApplicationCardDropdown';
import ApplicationCardInsights from '@/components/admin/ApplicationCardInsights';
import {
  ArchiveIcon,
  ChartIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  ExternalLinkIcon,
  ClockIcon,
} from '@/components/admin/icons';

interface ApplicationCardProps {
  application: ApplicationListItem;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
}

function StatusIcon({
  isActive,
  viewCount,
}: {
  isActive: boolean;
  viewCount: number;
}) {
  const hasBeenViewed = viewCount > 0;
  const title = isActive
    ? hasBeenViewed
      ? 'Active (viewed)'
      : 'Active (not viewed yet)'
    : 'Archived';
  const ariaLabel = title;

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      title={title}
      aria-label={ariaLabel}
    >
      {isActive ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
          {hasBeenViewed ? (
            <CheckIcon className="h-5 w-5 text-emerald-600" />
          ) : (
            <ClockIcon className="h-5 w-5 text-emerald-600" />
          )}
        </span>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--foreground)]/10">
          <ArchiveIcon className="h-5 w-5 text-[var(--foreground)]/60" />
        </span>
      )}
    </div>
  );
}

export default function ApplicationCard({
  application,
  onDelete,
  onArchive,
  onRestore,
}: ApplicationCardProps) {
  const [copied, setCopied] = useState(false);
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const shareableUrl = getApplicationUrl(application.slug);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareableUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-visible rounded-lg bg-[var(--secondary-background)] shadow border border-[var(--foreground)]/10">
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
          {/* 1. Status icon */}
          <StatusIcon
            isActive={application.is_active}
            viewCount={application.view_count}
          />

          {/* 2 & 3. Company name - Role applied */}
          <span className="min-w-0 text-sm font-medium text-[var(--foreground)] sm:text-base">
            {application.company} - {application.role}
          </span>

          {/* Spacer to push buttons right on larger screens */}
          <div className="hidden flex-1 sm:block" aria-hidden="true" />

          {/* 4. Copy Link button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--brand-primary)]/30 bg-[var(--secondary-background)] px-3 py-1.5 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
          >
            <CopyIcon className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          {/* 5. View Insights button - expands to show views and creation date */}
          <button
            type="button"
            onClick={() => setInsightsExpanded(!insightsExpanded)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--brand-primary)]/30 bg-[var(--secondary-background)] px-3 py-1.5 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
          >
            <ChartIcon className="h-4 w-4" />
            View Insights
            {insightsExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>

          {/* 6. View Link button */}
          <Link
            href={`/view/${application.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-sm font-medium text-[var(--brand-primary-text)] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            View Application
          </Link>

          {/* 7. 3-dot dropdown menu */}
          <ApplicationCardDropdown
            applicationId={application.id}
            isArchived={application.is_active === false}
            onDelete={onDelete}
            onArchive={onArchive}
            onRestore={onRestore}
          />
        </div>

        {/* Expanded insights section */}
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
