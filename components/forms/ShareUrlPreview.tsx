import {
  PUBLIC_ID_HELP,
  PUBLIC_ID_LABEL,
  PUBLIC_ID_MISSING,
  SHARE_URL_PREVIEW_HELP,
  SHARE_URL_PREVIEW_LABEL,
  SHARE_URL_PREVIEW_PLACEHOLDER,
} from "@/lib/copy/public-id";
import { getApplicationUrl } from "@/lib/utils/url";

type ShareUrlPreviewProps = {
  publicId?: string | null;
  slug: string;
};

/**
 * Live share-URL preview under the application slug field (F19-046).
 * Explains Public id and shows the final /view/{publicId}/{slug} link.
 */
export default function ShareUrlPreview({
  publicId,
  slug,
}: ShareUrlPreviewProps) {
  const trimmedSlug = slug.trim();
  const hasPublicId = Boolean(publicId);
  const shareableUrl =
    hasPublicId && trimmedSlug
      ? getApplicationUrl(publicId!, trimmedSlug)
      : null;

  return (
    <div className="space-y-1.5 rounded-md border border-[var(--foreground)]/10 bg-[var(--background)]/60 px-3 py-2.5">
      <p className="text-xs font-medium text-[var(--foreground)]">
        {SHARE_URL_PREVIEW_LABEL}
      </p>
      <p className="break-all font-mono text-xs text-[var(--foreground)]/90">
        {shareableUrl ??
          (hasPublicId
            ? `/view/${publicId}/${SHARE_URL_PREVIEW_PLACEHOLDER}`
            : `/view/${SHARE_URL_PREVIEW_PLACEHOLDER}/${trimmedSlug || SHARE_URL_PREVIEW_PLACEHOLDER}`)}
      </p>
      <p className="text-xs text-[var(--foreground)]/60">{SHARE_URL_PREVIEW_HELP}</p>
      <p className="text-xs text-[var(--foreground)]/60">
        <span className="font-medium text-[var(--foreground)]/75">
          {PUBLIC_ID_LABEL}:
        </span>{" "}
        {hasPublicId ? (
          <>
            <span className="font-mono text-[var(--foreground)]/80">{publicId}</span>
            . {PUBLIC_ID_HELP}
          </>
        ) : (
          PUBLIC_ID_MISSING
        )}
      </p>
    </div>
  );
}
