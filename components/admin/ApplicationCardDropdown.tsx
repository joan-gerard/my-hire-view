'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  ArchiveIcon,
  CheckIcon,
  EllipsisIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/admin/icons';

export interface ApplicationCardDropdownProps {
  applicationId: string;
  isArchived: boolean;
  isDraft?: boolean;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPublish?: (id: string) => void;
}

export default function ApplicationCardDropdown({
  applicationId,
  isArchived,
  isDraft = false,
  onDelete,
  onArchive,
  onRestore,
  onPublish,
}: ApplicationCardDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDelete = () => {
    setDropdownOpen(false);
    if (confirm('Are you sure you want to delete this application?')) {
      onDelete(applicationId);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--foreground)]/60 hover:bg-[var(--brand-secondary)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent-1)] focus-visible:ring-offset-1"
        aria-label="Open menu"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <EllipsisIcon className="h-5 w-5" />
      </button>
      {dropdownOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-[var(--foreground)]/10 bg-[var(--secondary-background)] py-1 shadow-lg"
          role="menu"
        >
          <Link
            href={`/admin/edit/${applicationId}`}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--background)]"
            role="menuitem"
            onClick={() => setDropdownOpen(false)}
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Link>
          {isDraft && onPublish ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--status-success-fg)] hover:bg-[var(--status-success-bg)]"
              role="menuitem"
              onClick={() => {
                setDropdownOpen(false);
                onPublish(applicationId);
              }}
            >
              <CheckIcon className="h-4 w-4" />
              Publish
            </button>
          ) : isArchived && onRestore ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--status-success-fg)] hover:bg-[var(--status-success-bg)]"
              role="menuitem"
              onClick={() => {
                setDropdownOpen(false);
                onRestore(applicationId);
              }}
            >
              <ArchiveIcon className="h-4 w-4" />
              Restore
            </button>
          ) : !isDraft && onArchive ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--status-draft-fg)] hover:bg-[var(--status-draft-bg)]"
              role="menuitem"
              onClick={() => {
                setDropdownOpen(false);
                onArchive(applicationId);
              }}
            >
              <ArchiveIcon className="h-4 w-4" />
              Archive
            </button>
          ) : null}
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--status-danger-fg)] hover:bg-[var(--status-danger-bg)]"
            role="menuitem"
            onClick={handleDelete}
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
