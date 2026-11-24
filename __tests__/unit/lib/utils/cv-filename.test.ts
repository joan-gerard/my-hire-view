import {
  CV_FILENAME_NAME_PLACEHOLDER,
  CV_FILENAME_SLUG_PLACEHOLDER,
  getCvDownloadFilename,
  getCvDownloadFilenameOrFallback,
  getCvDownloadFilenamePreview,
} from "@/lib/utils/cv-filename";

describe("getCvDownloadFilename", () => {
  it("builds Name-Slug.pdf from first name, last name, and slug", () => {
    expect(
      getCvDownloadFilename({
        firstName: "Joan",
        lastName: "Gerard",
        slug: "spotify-software-engineer",
      }),
    ).toBe("Joan-Gerard-Spotify-Software-Engineer.pdf");
  });

  it("title-cases slug segments and sanitizes names", () => {
    expect(
      getCvDownloadFilename({
        firstName: "  marie-claire ",
        lastName: "O'Brien!",
        slug: "Acme-Frontend",
      }),
    ).toBe("Marie-Claire-Obrien-Acme-Frontend.pdf");
  });

  it("strips diacritics from names", () => {
    expect(
      getCvDownloadFilename({
        firstName: "José",
        lastName: "García",
        slug: "volvo-frontend-engineer",
      }),
    ).toBe("Jose-Garcia-Volvo-Frontend-Engineer.pdf");
  });

  it("uses name only when slug is empty (real download, no placeholders)", () => {
    expect(
      getCvDownloadFilename({
        firstName: "Joan",
        lastName: "Gerard",
        slug: "",
      }),
    ).toBe("Joan-Gerard.pdf");
    expect(
      getCvDownloadFilename({
        firstName: "Joan",
        lastName: "Gerard",
        slug: null,
      }),
    ).toBe("Joan-Gerard.pdf");
  });

  it("falls back to CV-Slug.pdf when names are missing", () => {
    expect(
      getCvDownloadFilename({
        slug: "spotify-software-engineer",
      }),
    ).toBe("CV-Spotify-Software-Engineer.pdf");
  });

  it("returns empty string when neither name nor slug can build a name", () => {
    expect(getCvDownloadFilename({})).toBe("");
    expect(getCvDownloadFilename({ slug: "   " })).toBe("");
    expect(getCvDownloadFilename(null)).toBe("");
    expect(getCvDownloadFilename(undefined)).toBe("");
    expect(getCvDownloadFilename("")).toBe("");
  });

  it("accepts a legacy slug-only string argument", () => {
    expect(getCvDownloadFilename("spotify-software-engineer")).toBe(
      "CV-Spotify-Software-Engineer.pdf",
    );
  });
});

describe("getCvDownloadFilenamePreview", () => {
  it("shows the full pattern with real name and slug when both exist", () => {
    expect(
      getCvDownloadFilenamePreview({
        firstName: "Joan",
        lastName: "Gerard",
        slug: "spotify-software-engineer",
      }),
    ).toEqual({
      filename: "Joan-Gerard-Spotify-Software-Engineer.pdf",
      isComplete: true,
    });
  });

  it("fills Company-Role when slug is missing so the preview looks finished", () => {
    expect(
      getCvDownloadFilenamePreview({
        firstName: "Joan",
        lastName: "Gerard",
        slug: "",
      }),
    ).toEqual({
      filename: `Joan-Gerard-${CV_FILENAME_SLUG_PLACEHOLDER}.pdf`,
      isComplete: false,
    });
  });

  it("fills First-Last when names are missing", () => {
    expect(
      getCvDownloadFilenamePreview({
        slug: "spotify-software-engineer",
      }),
    ).toEqual({
      filename: `${CV_FILENAME_NAME_PLACEHOLDER}-Spotify-Software-Engineer.pdf`,
      isComplete: false,
    });
  });

  it("fills both placeholders when nothing is set", () => {
    expect(getCvDownloadFilenamePreview({})).toEqual({
      filename: `${CV_FILENAME_NAME_PLACEHOLDER}-${CV_FILENAME_SLUG_PLACEHOLDER}.pdf`,
      isComplete: false,
    });
  });
});

describe("getCvDownloadFilenameOrFallback", () => {
  it("returns CV.pdf when parts are empty", () => {
    expect(getCvDownloadFilenameOrFallback({})).toBe("CV.pdf");
  });

  it("returns the generated name when available", () => {
    expect(
      getCvDownloadFilenameOrFallback({
        firstName: "Joan",
        lastName: "Gerard",
        slug: "spotify-software-engineer",
      }),
    ).toBe("Joan-Gerard-Spotify-Software-Engineer.pdf");
  });
});
