"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  url: string;
  /** Opaque public id for share/download API paths. */
  publicId?: string;
  slug?: string;
  /** Original uploaded CV filename. Used for download when useOriginalCvFilename is true. */
  cvFilename?: string | null;
  /** When true (default), download uses cvFilename; when false, uses generated name CV-{Slug}.pdf. */
  useOriginalCvFilename?: boolean;
}

export default function PDFViewer({
  url,
  publicId,
  slug,
  cvFilename,
  useOriginalCvFilename = true,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    setError(error.message);
    setLoading(false);
  }

  if (error) {
    const isMissingOrUnavailable =
      /fetch|404|failed|network|Failed to fetch/i.test(error) ||
      error.includes("Missing PDF");
    return (
      <div className="p-4 sm:p-6">
        <div
          role="alert"
          className="rounded-2xl border border-[var(--status-warning-fg)]/25 bg-[var(--status-warning-bg)] px-6 py-8 text-center"
        >
          <p className="font-semibold text-[var(--status-warning-fg)]">
            {isMissingOrUnavailable ? "CV is not available" : "Failed to load CV"}
          </p>
          <p className="mt-2 text-sm text-[var(--status-warning-fg)]">
            {isMissingOrUnavailable
              ? "The resume file is no longer available. It may have been removed from storage. Please contact the candidate if you need their CV."
              : `The document could not be loaded. (${error})`}
          </p>
          {!isMissingOrUnavailable && (
            <button
              type="button"
              onClick={() => window.open(url, "_blank")}
              className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--white)] hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
            >
              Try opening in new tab
            </button>
          )}
        </div>
      </div>
    );
  }

  const pageWidth = Math.min(
    800,
    typeof window !== "undefined" ? window.innerWidth - 64 : 800,
  );

  return (
    <div className="p-3 sm:p-4">
      <div className="flex max-h-[calc(100vh-200px)] justify-center overflow-y-auto rounded-xl bg-[var(--paper)]/60 p-3 sm:p-4">
        {loading && (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-[var(--muted)]">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--muted)] border-t-transparent motion-safe:animate-spin"
              aria-hidden
            />
            Loading CV…
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-[var(--muted)]">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--muted)] border-t-transparent motion-safe:animate-spin"
                aria-hidden
              />
              Loading CV…
            </div>
          }
          className="max-w-full"
        >
          <div className="flex flex-col items-center gap-4">
            {numPages &&
              Array.from({ length: numPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Page
                    key={pageNum}
                    pageNumber={pageNum}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="max-w-full shadow-sm"
                    width={pageWidth}
                  />
                ),
              )}
          </div>
        </Document>
      </div>
    </div>
  );
}
