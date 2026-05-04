"use client";

import Input from "@/components/ui/Input";
import type { ApplicationFormData } from "@/lib/types/application";
import { buildSlug, validateSlugFormat } from "@/lib/utils/slug-generate";
import { getApplicationUrl } from "@/lib/utils/url";
import { useEffect, useRef, useState } from "react";
import ApplicationFormActions from "./ApplicationFormActions";
import type { CandidateFieldKey } from "./CandidateFieldsSection";
import CandidateFieldsSection from "./CandidateFieldsSection";
import CvDownloadFilenameField from "./CvDownloadFilenameField";
import FileUpload from "./FileUpload";
import NameInUrlField, { type SlugNamePosition } from "./NameInUrlField";
import ProfilePictureField from "./ProfilePictureField";
import YouTubeUrlInput from "./YouTubeUrlInput";
import { FiAlertCircle, FiCheck, FiRefreshCw } from "react-icons/fi";

function hasValue(v: string | null | undefined): boolean {
  return v != null && String(v).trim() !== "";
}

function defaultInclude(
  initialData?: Partial<ApplicationFormData>,
): Record<CandidateFieldKey, boolean> {
  return {
    first_name: hasValue(initialData?.first_name),
    last_name: hasValue(initialData?.last_name),
    location: hasValue(initialData?.location),
    portfolio_url: hasValue(initialData?.portfolio_url),
    linkedin_url: hasValue(initialData?.linkedin_url),
  };
}

/** initialData can include application row fields used to seed form state. */
export type ApplicationFormInitialData = Partial<ApplicationFormData> & {
  cvUrlExists?: boolean;
  /** Stored preference: show profile picture on this application. Used for checkbox default when present. */
  show_profile_picture?: boolean;
  /** Current application profile picture URL (for edit); fallback for checkbox default when show_profile_picture not set. */
  profile_picture_url?: string | null;
};

type SlugLiveStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "invalid"; message: string }
  | { kind: "unavailable"; message: string };

interface ApplicationFormProps {
  initialData?: ApplicationFormInitialData;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  loading?: boolean;
  /** When provided, passed to FileUpload so user can re-check CV existence (edit page). */
  onRetryCvCheck?: () => Promise<void>;
  /** Profile picture URL; when set, Yes/No toggle is enabled; when null, toggle is disabled with No selected. */
  profilePictureUrl?: string | null;
  /**
   * Current application id on edit — slug uniqueness ignores this row.
   * When set, format + availability are checked before save.
   */
  slugExcludeApplicationId?: string;
  /**
   * New application: resolve the saved slug from /api/slug while auto-updating,
   * and validate manual slugs before submit.
   */
  resolveSlugOnCreate?: boolean;
}

export default function ApplicationForm({
  initialData,
  onSubmit,
  loading = false,
  onRetryCvCheck,
  profilePictureUrl,
  slugExcludeApplicationId,
  resolveSlugOnCreate = false,
}: ApplicationFormProps) {
  const serverSlugValidation = Boolean(slugExcludeApplicationId);
  const hasProfilePicture = Boolean(profilePictureUrl?.trim());
  const showProfilePictureDefault =
    initialData?.show_profile_picture !== undefined
      ? initialData.show_profile_picture === true
      : initialData?.profile_picture_url !== undefined
        ? Boolean(initialData.profile_picture_url?.trim())
        : true;
  const [showProfilePicture, setShowProfilePicture] = useState(
    showProfilePictureDefault,
  );

  const [formData, setFormData] = useState<ApplicationFormData>({
    company: initialData?.company || "",
    role: initialData?.role || "",
    slug: initialData?.slug || "",
    cv_url: initialData?.cv_url || "",
    video_url: initialData?.video_url || "",
    first_name: initialData?.first_name ?? "",
    last_name: initialData?.last_name ?? "",
    location: initialData?.location ?? "",
    portfolio_url: initialData?.portfolio_url ?? "",
    linkedin_url: initialData?.linkedin_url ?? "",
    cv_filename: initialData?.cv_filename ?? null,
    use_original_cv_filename: initialData?.use_original_cv_filename ?? true,
  });

  const [include, setInclude] = useState<Record<CandidateFieldKey, boolean>>(
    () => defaultInclude(initialData),
  );

  const [slugNamePosition, setSlugNamePosition] = useState<
    "start" | "end" | null
  >(initialData?.slugNamePosition ?? null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ApplicationFormData, string>>
  >({});
  const [slugLiveStatus, setSlugLiveStatus] = useState<SlugLiveStatus>({
    kind: "idle",
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const slugManuallyEditedRef = useRef(false);
  slugManuallyEditedRef.current = slugManuallyEdited;
  /** File selected but not yet uploaded (upload happens on submit). */
  const [cvPendingFile, setCvPendingFile] = useState<File | null>(null);
  const isSubmittingRef = useRef(false);
  const uploadedPendingFileRef = useRef<{
    signature: string;
    url: string;
  } | null>(null);
  /** One key per selected CV file; server dedupes uploads / retries to the same R2 object. */
  const cvUploadIdempotencyKeyRef = useRef<string | null>(null);

  const getFileSignature = (file: File): string =>
    `${file.name}:${file.size}:${file.lastModified}`;

  /** Drop slug field errors when inputs that affect slug change so live status can show success again. */
  useEffect(() => {
    setErrors((prev) =>
      prev.slug !== undefined ? { ...prev, slug: undefined } : prev,
    );
  }, [
    formData.slug,
    formData.company,
    formData.role,
    formData.first_name,
    formData.last_name,
    slugNamePosition,
    slugManuallyEdited,
  ]);

  /** Name-in-URL is a structured slug rule; re-enable auto slug when the user changes it. */
  const handleSlugNamePositionChange = (next: SlugNamePosition) => {
    setSlugNamePosition(next);
    setSlugManuallyEdited(false);
  };

  useEffect(() => {
    if (resolveSlugOnCreate && !slugManuallyEdited) {
      return;
    }
    if (!slugManuallyEdited && formData.company && formData.role) {
      const slug = buildSlug(
        formData.company,
        formData.role,
        formData.first_name,
        formData.last_name,
        slugNamePosition,
      );
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [
    formData.company,
    formData.role,
    formData.first_name,
    formData.last_name,
    slugNamePosition,
    slugManuallyEdited,
    resolveSlugOnCreate,
  ]);

  /** New application, auto slug: POST /api/slug returns the derived slug if it is still available. */
  useEffect(() => {
    let cancelled = false;
    if (!resolveSlugOnCreate || slugManuallyEdited) {
      return () => {
        cancelled = true;
      };
    }
    const company = formData.company.trim();
    const role = formData.role.trim();
    if (!company || !role) {
      setSlugLiveStatus({ kind: "idle" });
      return () => {
        cancelled = true;
      };
    }

    setSlugLiveStatus({ kind: "checking" });
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      const derivedSlug = buildSlug(
        formData.company,
        formData.role,
        formData.first_name,
        formData.last_name,
        slugNamePosition,
      );
      try {
        const res = await fetch("/api/slug", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            company: formData.company,
            role: formData.role,
            slugNamePosition: slugNamePosition ?? null,
            ...((slugNamePosition === "start" || slugNamePosition === "end") && {
              first_name: formData.first_name ?? undefined,
              last_name: formData.last_name ?? undefined,
            }),
          }),
        });
        const data: { slug?: string; error?: string } = await res
          .json()
          .catch(() => ({}));
        if (cancelled || slugManuallyEditedRef.current) return;
        if (!res.ok) {
          setFormData((prev) => ({ ...prev, slug: derivedSlug }));
          setSlugLiveStatus({
            kind: "unavailable",
            message: data.error || "Could not reserve a slug. Try again.",
          });
          return;
        }
        const resolved = data.slug;
        if (typeof resolved === "string" && resolved.length > 0) {
          setFormData((prev) => ({ ...prev, slug: resolved }));
          setSlugLiveStatus({ kind: "available" });
        } else {
          setFormData((prev) => ({ ...prev, slug: derivedSlug }));
          setSlugLiveStatus({
            kind: "unavailable",
            message: "Could not reserve a slug. Try again.",
          });
        }
      } catch {
        if (!cancelled && !slugManuallyEditedRef.current) {
          setFormData((prev) => ({ ...prev, slug: derivedSlug }));
          setSlugLiveStatus({
            kind: "unavailable",
            message: "Could not reserve a slug. Check your connection and retry.",
          });
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    resolveSlugOnCreate,
    slugManuallyEdited,
    formData.company,
    formData.role,
    formData.first_name,
    formData.last_name,
    slugNamePosition,
  ]);

  const runManualSlugValidate =
    serverSlugValidation || (resolveSlugOnCreate && slugManuallyEdited);

  useEffect(() => {
    let cancelled = false;
    if (!runManualSlugValidate) {
      return () => {
        cancelled = true;
      };
    }

    const slug = formData.slug.trim();

    if (!slug) {
      setSlugLiveStatus({ kind: "idle" });
      return () => {
        cancelled = true;
      };
    }

    const format = validateSlugFormat(slug);
    if (!format.ok) {
      setSlugLiveStatus({ kind: "invalid", message: format.error });
      return () => {
        cancelled = true;
      };
    }

    setSlugLiveStatus({ kind: "checking" });
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      try {
        const res = await fetch("/api/slug/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            slug,
            ...(slugExcludeApplicationId
              ? { excludeId: slugExcludeApplicationId }
              : {}),
          }),
        });
        const data: { ok?: boolean; error?: string } = await res
          .json()
          .catch(() => ({}));
        if (cancelled) return;
        if (resolveSlugOnCreate && !slugManuallyEditedRef.current) return;
        if (res.status === 401) {
          setSlugLiveStatus({
            kind: "unavailable",
            message: "Sign in again to check slug availability.",
          });
          return;
        }
        if (!res.ok) {
          setSlugLiveStatus({
            kind: "unavailable",
            message: data.error || "Could not verify slug. Try again.",
          });
          return;
        }
        if (data.ok === true) {
          setSlugLiveStatus({ kind: "available" });
        } else {
          setSlugLiveStatus({
            kind: "unavailable",
            message:
              data.error ||
              "This slug is not available. Choose a different one.",
          });
        }
      } catch {
        if (!cancelled) {
          setSlugLiveStatus({
            kind: "unavailable",
            message: "Could not verify slug. Check your connection and retry.",
          });
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    formData.slug,
    slugExcludeApplicationId,
    runManualSlugValidate,
    resolveSlugOnCreate,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setErrors({});

    try {
      const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
      if (!formData.company.trim())
        newErrors.company = "Company name is required";
      if (!formData.role.trim()) newErrors.role = "Role is required";
      const slugTrimmed = formData.slug.trim();
      if (!slugTrimmed) newErrors.slug = "Slug is required";
      const hasCv = cvPendingFile || (formData.cv_url && formData.cv_url.trim());
      if (!hasCv) newErrors.cv_url = "CV file is required";
      if (!formData.video_url.trim())
        newErrors.video_url = "YouTube URL is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      if (resolveSlugOnCreate && !slugManuallyEdited) {
        if (slugLiveStatus.kind === "checking") {
          newErrors.slug = "Please wait until the slug has finished updating.";
          setErrors(newErrors);
          return;
        }
        if (slugLiveStatus.kind === "unavailable") {
          newErrors.slug =
            slugLiveStatus.message ||
            "Could not reserve a slug. Fix company/role or try again.";
          setErrors(newErrors);
          return;
        }
        if (slugLiveStatus.kind === "invalid") {
          newErrors.slug = slugLiveStatus.message;
          setErrors(newErrors);
          return;
        }
      }

      if (serverSlugValidation || (resolveSlugOnCreate && slugManuallyEdited)) {
        const formatCheck = validateSlugFormat(slugTrimmed);
        if (!formatCheck.ok) {
          newErrors.slug = formatCheck.error;
          setErrors(newErrors);
          return;
        }

        const slugValidateRes = await fetch("/api/slug/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            slug: slugTrimmed,
            ...(slugExcludeApplicationId
              ? { excludeId: slugExcludeApplicationId }
              : {}),
          }),
        });
        const slugValidateJson: { ok?: boolean; error?: string } =
          await slugValidateRes.json().catch(() => ({}));
        if (slugValidateRes.status === 401) {
          const msg = "Your session expired. Sign in again and retry.";
          newErrors.slug = msg;
          setErrors(newErrors);
          setSlugLiveStatus({ kind: "unavailable", message: msg });
          return;
        }
        if (!slugValidateRes.ok || slugValidateJson.ok !== true) {
          const slugErr =
            slugValidateJson.error ||
            "This slug is not available. Change it before saving.";
          newErrors.slug = slugErr;
          setErrors(newErrors);
          setSlugLiveStatus({ kind: "unavailable", message: slugErr });
          return;
        }
      }

      let cvUrl = formData.cv_url.trim();
      if (cvPendingFile) {
        const signature = getFileSignature(cvPendingFile);
        const cachedUpload = uploadedPendingFileRef.current;
        if (cachedUpload?.signature === signature) {
          cvUrl = cachedUpload.url;
        } else {
          if (!cvUploadIdempotencyKeyRef.current) {
            cvUploadIdempotencyKeyRef.current = crypto.randomUUID();
          }
          const formDataUpload = new FormData();
          formDataUpload.append("file", cvPendingFile);
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Idempotency-Key": cvUploadIdempotencyKeyRef.current,
            },
            body: formDataUpload,
          });
          if (!response.ok) {
            const { error } = await response.json();
            setErrors({ cv_url: error || "Upload failed" });
            return;
          }
          const { url } = await response.json();
          cvUrl = url;
          uploadedPendingFileRef.current = { signature, url };
        }
      }

      const includePicture = hasProfilePicture && showProfilePicture;

      const payload: ApplicationFormData = {
        ...formData,
        slug: slugTrimmed,
        cv_url: cvUrl,
        first_name: include.first_name
          ? formData.first_name?.trim() || null
          : null,
        last_name: include.last_name ? formData.last_name?.trim() || null : null,
        location: include.location ? formData.location?.trim() || null : null,
        portfolio_url: include.portfolio_url
          ? formData.portfolio_url?.trim() || null
          : null,
        linkedin_url: include.linkedin_url
          ? formData.linkedin_url?.trim() || null
          : null,
        slugNamePosition,
        cv_filename: cvPendingFile
          ? cvPendingFile.name
          : (formData.cv_filename ?? null),
        use_original_cv_filename: formData.use_original_cv_filename ?? true,
        show_profile_picture: includePicture,
        ...(resolveSlugOnCreate ? { slugManuallyEdited } : {}),
      };
      await onSubmit(payload);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const candidateValues: Record<CandidateFieldKey, string> = {
    first_name: formData.first_name ?? "",
    last_name: formData.last_name ?? "",
    location: formData.location ?? "",
    portfolio_url: formData.portfolio_url ?? "",
    linkedin_url: formData.linkedin_url ?? "",
  };

  const handleCandidateValueChange = (
    field: CandidateFieldKey,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCandidateIncludeChange = (
    field: CandidateFieldKey,
    included: boolean,
  ) => {
    setInclude((prev) => ({ ...prev, [field]: included }));
  };

  const shareableUrl = formData.slug ? getApplicationUrl(formData.slug) : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CandidateFieldsSection
        values={candidateValues}
        include={include}
        onValueChange={handleCandidateValueChange}
        onIncludeChange={handleCandidateIncludeChange}
      />

      <ProfilePictureField
        hasProfilePicture={hasProfilePicture}
        showProfilePicture={showProfilePicture}
        onShowProfilePictureChange={setShowProfilePicture}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="Company Name *"
          value={formData.company}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, company: e.target.value }))
          }
          error={errors.company}
          required
        />
        <Input
          label="Role/Position *"
          value={formData.role}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, role: e.target.value }))
          }
          error={errors.role}
          required
        />
      </div>

      <NameInUrlField
        value={slugNamePosition}
        onChange={handleSlugNamePositionChange}
      />

      <Input
        label="Slug *"
        value={formData.slug}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, slug: e.target.value }));
          setSlugManuallyEdited(true);
        }}
        error={errors.slug}
        placeholder="auto-generated-slug"
        required
      />
      {slugLiveStatus.kind === "checking" && (
        <p
          className="flex items-center gap-1.5 text-xs text-(--foreground)/60"
          role="status"
        >
          <FiRefreshCw className="size-3.5 shrink-0 animate-spin" aria-hidden />
          Checking slug…
        </p>
      )}
      {slugLiveStatus.kind === "available" && !errors.slug && (
        <p
          className="flex items-start gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"
          role="status"
        >
          <FiCheck
            className="mt-0.5 size-3.5 shrink-0"
            strokeWidth={2.5}
            aria-hidden
          />
          <span>This slug is available.</span>
        </p>
      )}
      {(slugLiveStatus.kind === "invalid" ||
        slugLiveStatus.kind === "unavailable") &&
        !errors.slug && (
          <p
            className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            <FiAlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              {slugLiveStatus.message}
              {resolveSlugOnCreate &&
                slugManuallyEdited &&
                slugLiveStatus.kind === "unavailable" && (
                  <>
                    {" "}
                    If you continue without changing it, save will use an
                    auto-assigned slug instead.
                  </>
                )}
            </span>
          </p>
        )}
      <p className="text-xs text-(--foreground)/60">
        This will be used in the URL: {shareableUrl || "..."}
      </p>

      <FileUpload
        value={formData.cv_url}
        pendingFile={cvPendingFile}
        onPendingFileChange={(file) => {
          setCvPendingFile(file);
          uploadedPendingFileRef.current = null;
          if (file) {
            cvUploadIdempotencyKeyRef.current = crypto.randomUUID();
            setFormData((prev) => ({ ...prev, cv_filename: file.name }));
          } else {
            cvUploadIdempotencyKeyRef.current = null;
          }
        }}
        cvUrlExists={initialData?.cvUrlExists}
        onRetryCvCheck={onRetryCvCheck}
        error={errors.cv_url}
      />

      <CvDownloadFilenameField
        useOriginalCvFilename={formData.use_original_cv_filename ?? true}
        onUseOriginalCvFilenameChange={(use) =>
          setFormData((prev) => ({ ...prev, use_original_cv_filename: use }))
        }
        slug={formData.slug}
        cvFilename={formData.cv_filename ?? null}
        cvPendingFileName={cvPendingFile?.name ?? null}
      />

      <YouTubeUrlInput
        value={formData.video_url}
        onChange={(url) => setFormData((prev) => ({ ...prev, video_url: url }))}
        error={errors.video_url}
      />

      <ApplicationFormActions
        loading={loading}
        submitLabel="Save Application"
      />
    </form>
  );
}
