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
  /** When provided, a download is recorded (once per session) when the user clicks Download CV. Owner downloads are not counted. */
  slug?: string;
  /** Original uploaded CV filename. Used for download when useOriginalCvFilename is true. */
  cvFilename?: string | null;
  /** When true (default), download uses cvFilename; when false, uses generated name CV-{Slug}.pdf. */
  useOriginalCvFilename?: boolean;
}

export default function PDFViewer({
  url,
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
      <div
        role="alert"
        className="rounded-lg border border-amber-300 bg-amber-50 px-6 py-8 text-center"
      >
        <p className="font-semibold text-amber-900">
          {isMissingOrUnavailable ? "CV is not available" : "Failed to load CV"}
        </p>
        <p className="mt-2 text-sm text-amber-800">
          {isMissingOrUnavailable
            ? "The resume file is no longer available. It may have been removed from storage. Please contact the candidate if you need their CV."
            : `The document could not be loaded. (${error})`}
        </p>
        {!isMissingOrUnavailable && (
          <button
            onClick={() => window.open(url, "_blank")}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Try opening in new tab
          </button>
        )}
      </div>
    );
  }

  const pageWidth = Math.min(
    800,
    typeof window !== "undefined" ? window.innerWidth - 64 : 800,
  );

  return (
    <div className="space-y-4 p-2">
      <div className="flex max-h-[calc(100vh-200px)] justify-center overflow-y-auto rounded-lg bg-gray-50 p-4">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-600">Loading PDF...</div>
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-600">Loading PDF...</div>
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
