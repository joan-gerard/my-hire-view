import {
  formatPublicPathExample,
  PUBLIC_ID_HELP,
  PUBLIC_ID_LABEL,
  PUBLIC_ID_MISSING,
} from "@/lib/copy/public-id";

type PublicIdAccountFieldProps = {
  publicId: string | null;
};

/**
 * Read-only Public id + help for the profile Account section (F19-046).
 * Root is a `dl` row group (`div` > `dt`/`dd`) so callers must not wrap it again.
 */
export default function PublicIdAccountField({
  publicId,
}: PublicIdAccountFieldProps) {
  return (
    <div className="flex flex-col gap-0.5 py-3 last:pb-0 sm:flex-row sm:gap-6">
      <dt className="shrink-0 text-sm font-medium text-[var(--muted)] sm:w-36">
        {PUBLIC_ID_LABEL}
      </dt>
      <dd className="min-w-0 space-y-1.5 text-sm text-[var(--ink)]">
        {publicId ? (
          <>
            <p className="font-mono text-sm text-[var(--ink)]">{publicId}</p>
            <p className="text-xs text-[var(--muted)]">{PUBLIC_ID_HELP}</p>
            <p className="text-xs text-[var(--muted)]">
              Example path:{" "}
              <span className="font-mono">
                {formatPublicPathExample(publicId)}
              </span>
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">{PUBLIC_ID_MISSING}</p>
        )}
      </dd>
    </div>
  );
}
