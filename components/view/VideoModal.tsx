"use client";

import { CloseIcon } from "@/components/admin/icons";
import YouTubeEmbed from "@/components/video/YouTubeEmbed";
import { useEffect, useRef } from "react";

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

/**
 * Product-chrome dialog for the video pitch on `/view`.
 * Dim backdrop, floating panel (~28px radius + soft shadow), Escape / backdrop close.
 */
export default function VideoModal({ videoUrl, onClose }: VideoModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/50 transition-opacity"
        aria-label="Close video pitch"
        onClick={onClose}
      />
      <aside
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] border border-[var(--ink)]/10 bg-[var(--white)] shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Video pitch"
      >
        <div className="flex items-center justify-between border-b border-[var(--ink)]/10 px-4 py-3">
          <p className="text-sm font-medium text-[var(--ink)]">Video pitch</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ink)]/12 bg-[var(--white)] text-[var(--ink)] hover:bg-[var(--ink)]/[0.04] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
            aria-label="Close video modal"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-hidden bg-[var(--ink)]">
          <YouTubeEmbed url={videoUrl} />
        </div>
      </aside>
    </div>
  );
}
