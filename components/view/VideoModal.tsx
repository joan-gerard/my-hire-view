"use client";

import { CloseIcon } from "@/components/admin/icons";
import YouTubeEmbed from "@/components/video/YouTubeEmbed";

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

/**
 * Modal component for displaying a video pitch in a fixed overlay.
 * Includes a backdrop that closes the modal on click and a close button.
 */
export default function VideoModal({ videoUrl, onClose }: VideoModalProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-4 top-1/2 z-50 max-w-md -translate-y-1/2 sm:right-6 sm:max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Video pitch"
      >
        <div className="relative w-[min(100vw-2rem,28rem)] overflow-visible">
          <div className="overflow-hidden rounded-[10px]">
            <YouTubeEmbed url={videoUrl} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20"
            aria-label="Close video modal"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
