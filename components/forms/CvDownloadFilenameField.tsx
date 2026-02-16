"use client";

import { getCvDownloadFilename } from "@/lib/utils/cv-filename";

export interface CvDownloadFilenameFieldProps {
  useOriginalCvFilename: boolean;
  onUseOriginalCvFilenameChange: (use: boolean) => void;
  slug: string;
  cvFilename: string | null;
  /** Display name of the pending file (when user selected but not yet uploaded). */
  cvPendingFileName: string | null;
}

export default function CvDownloadFilenameField({
  useOriginalCvFilename,
  onUseOriginalCvFilenameChange,
  slug,
  cvFilename,
  cvPendingFileName,
}: CvDownloadFilenameFieldProps) {
  const displayFilename = cvPendingFileName ?? cvFilename;
  const generatedName = slug ? getCvDownloadFilename(slug) : "CV-Slug.pdf";

  return (
    <fieldset className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
      <legend className="px-1 text-base font-semibold text-gray-900">
        Download file name
      </legend>
      <p className="mt-0.5 mb-3 text-sm text-gray-600">
        Choose the filename recruiters will see when they download your CV.
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="useOriginalCvFilename"
            checked={useOriginalCvFilename !== false}
            onChange={() => onUseOriginalCvFilenameChange(true)}
            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-base font-medium text-gray-900">
            Use original file name
          </span>
          {displayFilename && (
            <span className="text-sm text-gray-500">({displayFilename})</span>
          )}
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name="useOriginalCvFilename"
            checked={useOriginalCvFilename === false}
            onChange={() => onUseOriginalCvFilenameChange(false)}
            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-base font-medium text-gray-900">
            Use generated name
          </span>
          <span className="text-sm text-gray-500">({generatedName})</span>
        </label>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Downloadable file name:{" "}
        {useOriginalCvFilename !== false && displayFilename
          ? displayFilename
          : slug
            ? getCvDownloadFilename(slug)
            : "..."}
      </p>
    </fieldset>
  );
}
