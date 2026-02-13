'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
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

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  if (error) {
    const isMissingOrUnavailable =
      /fetch|404|failed|network|Failed to fetch/i.test(error) ||
      error.includes('Missing PDF');
    return (
      <div
        role="alert"
        className="rounded-lg border border-amber-300 bg-amber-50 px-6 py-8 text-center"
      >
        <p className="font-semibold text-amber-900">
          {isMissingOrUnavailable
            ? 'CV is not available'
            : 'Failed to load CV'}
        </p>
        <p className="mt-2 text-sm text-amber-800">
          {isMissingOrUnavailable
            ? 'The resume file is no longer available. It may have been removed from storage. Please contact the candidate if you need their CV.'
            : `The document could not be loaded. (${error})`}
        </p>
        {!isMissingOrUnavailable && (
          <button
            onClick={handleDownload}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Try opening in new tab
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">CV Preview</h3>
        <div className="flex gap-2">
          {numPages && numPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="rounded-md bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-500 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
                className="rounded-md bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-500 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          <button
            onClick={handleDownload}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Download CV
          </button>
        </div>
      </div>

      <div className="flex justify-center rounded-lg border border-gray-300 bg-gray-50 p-4">
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
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="max-w-full"
            width={Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 64 : 800)}
          />
        </Document>
      </div>

      {numPages && numPages > 1 && (
        <p className="text-center text-sm text-gray-500">
          Showing page {pageNumber} of {numPages}. Use the buttons above to navigate.
        </p>
      )}
    </div>
  );
}
