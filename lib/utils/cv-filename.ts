/**
 * Returns the downloadable CV filename for a given slug.
 * Matches the format used when users click "Download CV" on the view page.
 */
export function getCvDownloadFilename(slug: string | null | undefined): string {
  if (!slug || slug.trim() === "") return "CV.pdf";
  const capitalized = slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join("-");
  return `CV-${capitalized}.pdf`;
}
