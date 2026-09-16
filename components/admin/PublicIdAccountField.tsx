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
 */
export default function PublicIdAccountField({
  publicId,
}: PublicIdAccountFieldProps) {
  return (
    <div>
      <dt className="text-sm font-medium text-[var(--foreground)]/60">
        {PUBLIC_ID_LABEL}
      </dt>
      <dd className="mt-1 space-y-1.5">
        {publicId ? (
          <>
            <p className="font-mono text-sm text-[var(--foreground)]">{publicId}</p>
            <p className="text-xs text-[var(--foreground)]/60">{PUBLIC_ID_HELP}</p>
            <p className="text-xs text-[var(--foreground)]/55">
              Example path:{" "}
              <span className="font-mono">
                {formatPublicPathExample(publicId)}
              </span>
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--foreground)]/70">{PUBLIC_ID_MISSING}</p>
        )}
      </dd>
    </div>
  );
}
