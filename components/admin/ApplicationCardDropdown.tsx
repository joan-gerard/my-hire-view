'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  ArchiveIcon,
  EllipsisIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/admin/icons';

export interface ApplicationCardDropdownProps {
  applicationId: string;
  isArchived: boolean;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
}

export default function ApplicationCardDropdown({
  applicationId,
  isArchived,
  onDelete,
  onArchive,
  onRestore,
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
        className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--foreground)]/60 hover:bg-[var(--brand-secondary)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
        aria-label="Open menu"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <EllipsisIcon className="h-5 w-5" />
      </button>
      {dropdownOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-[var(--foreground)]/10 bg-[var(--secondary-background)] py-1 shadow-lg"
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
          {isArchived && onRestore ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50"
              role="menuitem"
              onClick={() => {
                setDropdownOpen(false);
                onRestore(applicationId);
              }}
            >
              <ArchiveIcon className="h-4 w-4" />
              Restore
            </button>
          ) : onArchive ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50"
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
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
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
