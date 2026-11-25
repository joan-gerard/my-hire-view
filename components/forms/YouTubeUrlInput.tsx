"use client";

import Input from "@/components/ui/Input";
import { extractVideoId, validateYouTubeUrl } from "@/lib/utils/youtube";
import {
  YOUTUBE_UNAVAILABLE_MESSAGE,
  YOUTUBE_UPSTREAM_MESSAGE,
} from "@/lib/utils/youtube-preview";
import { useEffect, useId, useRef, useState } from "react";

export type YouTubeFieldStatus =
  | { kind: "empty" }
  | { kind: "invalid_url" }
  | { kind: "checking" }
  | { kind: "ready"; title: string; thumbnailUrl: string; videoId: string }
  | { kind: "unavailable"; message: string };

type PriorVideoOption = {
  videoId: string;
  url: string;
  label: string;
};

interface YouTubeUrlInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Row layouts supply their own label. */
  hideLabel?: boolean;
  placeholder?: string;
  /** Shorter top and bottom padding. */
  dense?: boolean;
  /**
   * When editing, skip this application so "reuse" lists other apps only.
   */
  excludeApplicationId?: string;
  /** Notifies the form so tip / publish readiness wait on embeddability. */
  onStatusChange?: (status: YouTubeFieldStatus) => void;
}

const PREVIEW_DEBOUNCE_MS = 450;

function statusForEmpty(): YouTubeFieldStatus {
  return { kind: "empty" };
}

function statusForInvalid(): YouTubeFieldStatus {
  return { kind: "invalid_url" };
}

export default function YouTubeUrlInput({
  id,
  value,
  onChange,
  error: externalError,
  hideLabel = false,
  placeholder = "https://www.youtube.com/watch?v=... or youtube.com/shorts/...",
  dense = false,
  excludeApplicationId,
  onStatusChange,
}: YouTubeUrlInputProps) {
  const reuseSelectId = useId();
  const [localFormatError, setLocalFormatError] = useState<string | undefined>();
  const [status, setStatus] = useState<YouTubeFieldStatus>(() =>
    value.trim()
      ? validateYouTubeUrl(value.trim())
        ? { kind: "checking" }
        : statusForInvalid()
      : statusForEmpty(),
  );
  const [playing, setPlaying] = useState(false);
  const [priorVideos, setPriorVideos] = useState<PriorVideoOption[]>([]);
  const previewGenRef = useRef(0);
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  const publishStatus = (next: YouTubeFieldStatus) => {
    setStatus(next);
    onStatusChangeRef.current?.(next);
  };

  const readyVideoId = status.kind === "ready" ? status.videoId : null;
  useEffect(() => {
    setPlaying(false);
  }, [readyVideoId]);

  // Keep parent in sync on mount / when callback identity changes.
  useEffect(() => {
    onStatusChangeRef.current?.(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount + callback only
  }, [onStatusChange]);

  useEffect(() => {
    let cancelled = false;
    async function loadPriorVideos() {
      try {
        const res = await fetch("/api/applications?limit=50", {
          credentials: "include",
        });
        if (!res.ok || cancelled) return;
        const json = (await res.json().catch(() => ({}))) as {
          data?: Array<{
            id?: string;
            company?: string;
            role?: string;
            video_url?: string | null;
          }>;
        };
        const rows = Array.isArray(json.data) ? json.data : [];
        const byVideoId = new Map<string, PriorVideoOption>();
        for (const row of rows) {
          if (
            excludeApplicationId &&
            typeof row.id === "string" &&
            row.id === excludeApplicationId
          ) {
            continue;
          }
          const url = typeof row.video_url === "string" ? row.video_url.trim() : "";
          if (!url) continue;
          const videoId = extractVideoId(url);
          if (!videoId || byVideoId.has(videoId)) continue;
          const company =
            typeof row.company === "string" && row.company.trim()
              ? row.company.trim()
              : "Application";
          const role =
            typeof row.role === "string" && row.role.trim()
              ? row.role.trim()
              : "";
          byVideoId.set(videoId, {
            videoId,
            url,
            label: role ? `${company} · ${role}` : company,
          });
        }
        if (!cancelled) {
          setPriorVideos(Array.from(byVideoId.values()));
        }
      } catch {
        // Reuse is optional — leave empty on failure.
      }
    }
    void loadPriorVideos();
    return () => {
      cancelled = true;
    };
  }, [excludeApplicationId]);

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      setLocalFormatError(undefined);
      previewGenRef.current += 1;
      publishStatus(statusForEmpty());
      return;
    }

    if (!validateYouTubeUrl(trimmed)) {
      setLocalFormatError("Please enter a valid YouTube URL");
      previewGenRef.current += 1;
      publishStatus(statusForInvalid());
      return;
    }

    setLocalFormatError(undefined);
    const gen = ++previewGenRef.current;
    publishStatus({ kind: "checking" });

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(
            `/api/youtube/preview?url=${encodeURIComponent(trimmed)}`,
            { credentials: "include" },
          );
          if (gen !== previewGenRef.current) return;

          const body = (await res.json().catch(() => ({}))) as {
            data?: {
              video_id?: string;
              title?: string;
              thumbnail_url?: string;
            };
            error?: string;
            code?: string;
          };

          if (gen !== previewGenRef.current) return;

          if (res.ok && body.data?.title && body.data.thumbnail_url) {
            publishStatus({
              kind: "ready",
              title: body.data.title,
              thumbnailUrl: body.data.thumbnail_url,
              videoId:
                typeof body.data.video_id === "string"
                  ? body.data.video_id
                  : extractVideoId(trimmed) ?? "",
            });
            return;
          }

          if (res.status === 422 || body.code === "unavailable") {
            publishStatus({
              kind: "unavailable",
              message: body.error || YOUTUBE_UNAVAILABLE_MESSAGE,
            });
            return;
          }

          if (res.status === 400 || body.code === "invalid_url") {
            setLocalFormatError(body.error || "Please enter a valid YouTube URL");
            publishStatus(statusForInvalid());
            return;
          }

          publishStatus({
            kind: "unavailable",
            message: body.error || YOUTUBE_UPSTREAM_MESSAGE,
          });
        } catch {
          if (gen !== previewGenRef.current) return;
          publishStatus({
            kind: "unavailable",
            message: YOUTUBE_UPSTREAM_MESSAGE,
          });
        }
      })();
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
    // publishStatus closes over setState; value is the only input we care about.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const previewError =
    status.kind === "unavailable"
      ? status.message
      : status.kind === "invalid_url"
        ? localFormatError
        : undefined;
  const shownError = externalError || previewError;

  const currentVideoId = extractVideoId(value.trim());
  const reuseValue =
    currentVideoId && priorVideos.some((v) => v.videoId === currentVideoId)
      ? currentVideoId
      : "";

  return (
    <div className="space-y-2">
      <Input
        id={id}
        label={hideLabel ? undefined : "YouTube intro *"}
        dense={dense}
        type="url"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        error={shownError}
      />

      <p className="text-xs text-[var(--muted)]">Unlisted videos work.</p>

      {priorVideos.length > 0 ? (
        <div className="space-y-1">
          <label
            htmlFor={reuseSelectId}
            className="block text-xs text-[var(--muted)]"
          >
            Reuse a video from an earlier application
          </label>
          <select
            id={reuseSelectId}
            className="w-full rounded-xl border-0 bg-[var(--white)] px-3 py-2 text-sm text-[var(--ink)] shadow-sm outline-none ring-1 ring-inset ring-[var(--ink)]/15 focus:ring-2 focus:ring-inset focus:ring-[var(--ink)]"
            value={reuseValue}
            onChange={(e) => {
              const selected = priorVideos.find(
                (v) => v.videoId === e.target.value,
              );
              if (selected) onChange(selected.url);
            }}
          >
            <option value="">Choose one…</option>
            {priorVideos.map((video) => (
              <option key={video.videoId} value={video.videoId}>
                {video.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {status.kind === "checking" ? (
        <p className="text-xs text-[var(--muted)]" role="status">
          Checking video…
        </p>
      ) : null}

      {status.kind === "ready" ? (
        <div className="w-full space-y-2" data-testid="youtube-preview">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-inset ring-[var(--ink)]/10">
            {playing ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${status.videoId}?autoplay=1&rel=0`}
                title={status.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className="group absolute inset-0 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
                onClick={() => setPlaying(true)}
                aria-label={`Play ${status.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube CDN */}
                <img
                  src={status.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white transition-opacity group-hover:bg-black/85">
                  <svg
                    viewBox="0 0 24 24"
                    className="ml-0.5 h-7 w-7"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M8 5.14v13.72L19 12 8 5.14z" />
                  </svg>
                </span>
              </button>
            )}
          </div>
          <p className="text-sm font-medium text-[var(--ink)] line-clamp-2">
            {status.title}
          </p>
        </div>
      ) : null}
    </div>
  );
}
