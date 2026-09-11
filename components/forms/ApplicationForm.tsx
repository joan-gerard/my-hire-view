"use client";

import Input from "@/components/ui/Input";
import type {
  ApplicationCvType,
  ApplicationFormData,
} from "@/lib/types/application";
import type { PrimaryCv } from "@/lib/types/primary-cv";
import {
  buildSlug,
  isCustomSlug,
  validateSlugFormat,
} from "@/lib/utils/slug-generate";
import {
  getFileSignature,
  resolveCvUploadIdempotencyKey,
} from "@/lib/utils/cv-upload-client-key";
import {
  messageForUploadFailure,
  messageForUploadNetworkError,
} from "@/lib/utils/upload-form-messages";
import { getApplicationUrl } from "@/lib/utils/url";
import { useEffect, useRef, useState } from "react";
import ApplicationFormActions from "./ApplicationFormActions";
import type { CandidateFieldKey } from "./CandidateFieldsSection";
import CandidateFieldsSection from "./CandidateFieldsSection";
import CvSourceField from "./CvSourceField";
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
  /** Stored preference: show profile picture on this application. */
  show_profile_picture?: boolean;
  cv_type?: ApplicationCvType;
  primary_cv_id?: string | null;
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
  /** Cache-bust key for the live profile picture (e.g. profiles.updated_at). */
  profilePictureVersion?: string | null;
  /** When set, the field offers Add/Change picture via a modal (new/edit flows). */
  onProfilePictureSaved?: (result: {
    url: string | null;
    updated_at?: string | null;
  }) => void;
  /** Opaque public id for share URL preview (from profile or auth metadata). */
  publicId?: string;
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
  profilePictureVersion,
  onProfilePictureSaved,
  publicId,
  slugExcludeApplicationId,
  resolveSlugOnCreate = false,
}: ApplicationFormProps) {
  const serverSlugValidation = Boolean(slugExcludeApplicationId);
  const isEdit = Boolean(slugExcludeApplicationId);
  const hasProfilePicture = Boolean(profilePictureUrl?.trim());
  const showProfilePictureDefault =
    initialData?.show_profile_picture !== undefined
      ? initialData.show_profile_picture === true
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
    cv_type: initialData?.cv_type,
    primary_cv_id: initialData?.primary_cv_id ?? null,
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
  /** Edit: treat a non-derived saved slug as manual so mount auto-rebuild does not wipe it (F14-099). */
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(() =>
    isCustomSlug(
      initialData?.slug ?? "",
      initialData?.company ?? "",
      initialData?.role ?? "",
      initialData?.first_name,
      initialData?.last_name,
      initialData?.slugNamePosition ?? null,
    ),
  );
  const slugManuallyEditedRef = useRef(false);
  slugManuallyEditedRef.current = slugManuallyEdited;
  /**
   * Bumped by "Reset to suggested" so auto-reserve re-runs even when already
   * in auto mode (F27-101).
   */
  const [slugAutoReserveNonce, setSlugAutoReserveNonce] = useState(0);
  /** File selected but not yet uploaded (upload happens on submit). */
  const [cvPendingFile, setCvPendingFile] = useState<File | null>(null);
  /** True while SHA-256 digest of the pending CV is in flight. */
  const [cvPendingDigesting, setCvPendingDigesting] = useState(false);
  /**
   * Local submit phase so Save stays busy during CV upload (before parent
   * `loading`) and shows honest "Uploading…" / "Saving…" copy (F8-051 / F8-055).
   */
  const [submitPhase, setSubmitPhase] = useState<"idle" | "uploading" | "saving">(
    "idle",
  );
  const isSubmittingRef = useRef(false);
  const uploadedPendingFileRef = useRef<{
    signature: string;
    url: string;
  } | null>(null);
  /** Content digest signature for the current pending file (avoids re-hashing). */
  const cvPendingSignatureRef = useRef<string | null>(null);
  /** Bumped on each pending-file change so stale digests are ignored. */
  const cvPendingFileGenRef = useRef(0);
  /** One key per selected CV file; reused on retry until the file changes (F8-063). */
  const cvUploadIdempotencyKeyRef = useRef<string | null>(null);

  /** Invalidate in-flight digest work and clear pending tailored selection. */
  const clearPendingCvSelection = () => {
    cvPendingFileGenRef.current += 1;
    setCvPendingFile(null);
    setCvPendingDigesting(false);
    uploadedPendingFileRef.current = null;
    cvPendingSignatureRef.current = null;
    cvUploadIdempotencyKeyRef.current = null;
  };

  const [primaryCvs, setPrimaryCvs] = useState<PrimaryCv[]>([]);
  const [primaryCvsLoading, setPrimaryCvsLoading] = useState(true);
  const [cvMode, setCvMode] = useState<ApplicationCvType>(() => {
    if (initialData?.cv_type === "primary" || initialData?.cv_type === "tailored") {
      return initialData.cv_type;
    }
    return "primary";
  });
  const [selectedPrimaryId, setSelectedPrimaryId] = useState<string | null>(
    initialData?.primary_cv_id ?? null,
  );
  const [switchToPrimaryConfirmOpen, setSwitchToPrimaryConfirmOpen] =
    useState(false);
  /** Tracks whether the current edit still has an unsaved tailored file that would be abandoned. */
  const hadTailoredCvOnLoad =
    initialData?.cv_type === "tailored" && Boolean(initialData?.cv_url?.trim());

  useEffect(() => {
    let cancelled = false;
    async function loadPrimaryCvs() {
      try {
        const res = await fetch("/api/profile/primary-cvs", {
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        const list = (json.data as PrimaryCv[] | undefined) ?? [];
        setPrimaryCvs(list);
        if (!initialData?.cv_type) {
          if (list.length > 0) {
            setCvMode("primary");
            setSelectedPrimaryId((prev) => prev ?? list[0]!.id);
            setFormData((prev) => ({
              ...prev,
              cv_url: list[0]!.url,
              cv_filename: list[0]!.filename,
              primary_cv_id: list[0]!.id,
              cv_type: "primary",
            }));
          } else {
            setCvMode("tailored");
          }
        } else if (
          initialData.cv_type === "primary" &&
          initialData.primary_cv_id &&
          !list.some((m) => m.id === initialData.primary_cv_id)
        ) {
          // Primary CV was deleted; keep URL for display but force re-pick
          setSelectedPrimaryId(null);
        }
      } finally {
        if (!cancelled) setPrimaryCvsLoading(false);
      }
    }
    void loadPrimaryCvs();
    return () => {
      cancelled = true;
    };
    // Only on mount / when initial identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Sync form selection after library modal upload/delete. */
  const handlePrimaryLibraryChange = (list: PrimaryCv[]) => {
    const hadPrimaryCvs = primaryCvs.length > 0;
    const prevSelected = selectedPrimaryId;
    setPrimaryCvs(list);
    setPrimaryCvsLoading(false);

    const stillSelected =
      prevSelected != null && list.some((m) => m.id === prevSelected);
    if (stillSelected) return;

    if (list.length === 0) {
      setSelectedPrimaryId(null);
      if (cvMode === "primary") {
        setCvMode("tailored");
        setFormData((prev) => ({
          ...prev,
          cv_url: "",
          cv_filename: null,
          primary_cv_id: null,
          cv_type: "tailored",
        }));
      }
      return;
    }

    // Selected primary was deleted while in primary mode — pick another.
    if (cvMode === "primary" && prevSelected) {
      const pick = list[0]!;
      setSelectedPrimaryId(pick.id);
      setFormData((prev) => ({
        ...prev,
        cv_url: pick.url,
        cv_filename: pick.filename,
        primary_cv_id: pick.id,
        cv_type: "primary",
      }));
      setErrors((prev) => ({ ...prev, cv_url: undefined }));
      return;
    }

    // First primary CV(s) added while empty — prefer primary mode (create-form default).
    // Skip while the form's own initial fetch is still in flight to avoid racing edit mode.
    if (!hadPrimaryCvs && !primaryCvsLoading) {
      const pick = list[0]!;
      setCvMode("primary");
      setSelectedPrimaryId(pick.id);
      clearPendingCvSelection();
      setFormData((prev) => ({
        ...prev,
        cv_url: pick.url,
        cv_filename: pick.filename,
        primary_cv_id: pick.id,
        cv_type: "primary",
      }));
      setErrors((prev) => ({ ...prev, cv_url: undefined }));
    }
  };

  const hasCompany = Boolean(formData.company.trim());
  const hasRole = Boolean(formData.role.trim());
  const hasSlug = Boolean(formData.slug.trim());
  const hasCv =
    cvMode === "primary"
      ? Boolean(selectedPrimaryId)
      : Boolean(
          cvPendingFile ||
            (formData.cv_url &&
              formData.cv_url.trim() &&
              initialData?.cv_type === "tailored"),
        );
  const hasVideo = Boolean(formData.video_url.trim());
  const slugReady =
    slugLiveStatus.kind === "available" && hasSlug;

  const requiredReady =
    hasCompany && hasRole && hasCv && hasVideo && slugReady;

  const formBusy =
    loading || submitPhase !== "idle" || cvPendingDigesting;
  const canSubmit = requiredReady && !formBusy;
  const saveLoadingLabel =
    cvPendingDigesting
      ? "Preparing…"
      : submitPhase === "uploading"
        ? "Uploading…"
        : "Saving…";

  const disabledReason = (() => {
    if (canSubmit || formBusy) return null;
    if (!hasCompany) return "Company name is required.";
    if (!hasRole) return "Role is required.";
    if (!hasCv)
      return cvMode === "primary"
        ? "Select a primary CV, or upload a tailored CV."
        : "Upload a CV file for this application.";
    if (!hasVideo) return "YouTube URL is required.";
    if (slugLiveStatus.kind === "checking") {
      return "Please wait until the slug has finished updating.";
    }
    if (slugLiveStatus.kind === "invalid") {
      return slugLiveStatus.message || "Fix the slug before saving.";
    }
    if (slugLiveStatus.kind === "unavailable") {
      return (
        slugLiveStatus.message ||
        "This slug is not available. Change it before saving."
      );
    }
    if (!hasSlug) return "Slug is required.";
    return "Fill in all required fields to save.";
  })();

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

  /**
   * Exit manual slug mode and re-derive from company + role + Name in URL
   * via POST /api/slug (create and edit; excludeId on edit) — F27-101.
   */
  const handleResetSlugToSuggested = () => {
    setSlugManuallyEdited(false);
    setSlugAutoReserveNonce((n) => n + 1);
  };

  /** Create or edit: auto mode uses POST /api/slug (not local-only buildSlug). */
  const shouldAutoReserveSlug =
    !slugManuallyEdited &&
    (resolveSlugOnCreate || Boolean(slugExcludeApplicationId));

  useEffect(() => {
    if (shouldAutoReserveSlug) {
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
    shouldAutoReserveSlug,
  ]);

  /**
   * Auto slug (create + edit): POST /api/slug returns the derived slug if available.
   * Edit passes excludeId so the current application’s own slug is not treated as taken.
   */
  useEffect(() => {
    let cancelled = false;
    if (!shouldAutoReserveSlug) {
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
            ...(slugExcludeApplicationId
              ? { excludeId: slugExcludeApplicationId }
              : {}),
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
    shouldAutoReserveSlug,
    slugAutoReserveNonce,
    slugExcludeApplicationId,
    formData.company,
    formData.role,
    formData.first_name,
    formData.last_name,
    slugNamePosition,
  ]);

  const runManualSlugValidate =
    slugManuallyEdited && (serverSlugValidation || resolveSlugOnCreate);

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
        // Discard if the user left manual mode (e.g. Reset to suggested / Name in URL).
        if (!slugManuallyEditedRef.current) return;
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
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formBusy || isSubmittingRef.current || !canSubmit) return;
    isSubmittingRef.current = true;
    setErrors({});
    setSubmitPhase("saving");

    try {
      const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
      if (!formData.company.trim())
        newErrors.company = "Company name is required";
      if (!formData.role.trim()) newErrors.role = "Role is required";
      const slugTrimmed = formData.slug.trim();
      if (!slugTrimmed) newErrors.slug = "Slug is required";
      if (cvMode === "primary") {
        if (!selectedPrimaryId) newErrors.cv_url = "Select a primary CV";
      } else {
        const hasTailoredCv =
          cvPendingFile ||
          (initialData?.cv_type === "tailored" &&
            formData.cv_url &&
            formData.cv_url.trim());
        if (!hasTailoredCv) {
          newErrors.cv_url = "Upload a CV file for this application";
        }
      }
      if (!formData.video_url.trim())
        newErrors.video_url = "YouTube URL is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // canSubmit already requires slugLiveStatus === available; server validation below for races.

      if (serverSlugValidation || (resolveSlugOnCreate && slugManuallyEdited)) {
        const formatCheck = validateSlugFormat(slugTrimmed);
        if (!formatCheck.ok) {
          newErrors.slug = formatCheck.error;
          setErrors(newErrors);
          return;
        }

        let slugValidateRes: Response;
        try {
          slugValidateRes = await fetch("/api/slug/validate", {
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
        } catch {
          // Keep slugLiveStatus available so Save stays enabled for an immediate retry.
          const msg =
            "Could not verify slug. Check your connection and retry.";
          newErrors.slug = msg;
          setErrors(newErrors);
          return;
        }
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
      let cvFilename = formData.cv_filename ?? null;
      let primaryCvId: string | null = null;

      if (cvMode === "primary") {
        const primary = primaryCvs.find((m) => m.id === selectedPrimaryId);
        if (!primary) {
          setErrors({ cv_url: "Select a primary CV" });
          return;
        }
        cvUrl = primary.url;
        cvFilename = primary.filename;
        primaryCvId = primary.id;
      } else if (cvPendingFile) {
        const signature =
          cvPendingSignatureRef.current ??
          (await getFileSignature(cvPendingFile));
        cvPendingSignatureRef.current = signature;
        const cachedUpload = uploadedPendingFileRef.current;
        if (cachedUpload?.signature === signature) {
          cvUrl = cachedUpload.url;
        } else {
          // Reuse key on retry; only mint when missing (file-change path sets it).
          cvUploadIdempotencyKeyRef.current = resolveCvUploadIdempotencyKey(
            cvUploadIdempotencyKeyRef.current,
            false,
          );
          const formDataUpload = new FormData();
          formDataUpload.append("file", cvPendingFile);
          setSubmitPhase("uploading");
          let response: Response;
          try {
            response = await fetch("/api/upload", {
              method: "POST",
              headers: {
                "Idempotency-Key": cvUploadIdempotencyKeyRef.current,
              },
              body: formDataUpload,
            });
          } catch {
            // Keep the same idempotency key for retry (F8-063).
            setErrors({
              cv_url: messageForUploadNetworkError("cv"),
            });
            return;
          }
          if (!response.ok) {
            const body = (await response.json().catch(() => ({}))) as {
              error?: string;
            };
            // 409 = key already bound to different bytes; rotate so Save retry works.
            // Network / 5xx keep the same key (F8-063).
            if (response.status === 409) {
              cvUploadIdempotencyKeyRef.current = resolveCvUploadIdempotencyKey(
                cvUploadIdempotencyKeyRef.current,
                true,
              );
              uploadedPendingFileRef.current = null;
            }
            setErrors({
              cv_url: messageForUploadFailure(
                "cv",
                response.status,
                body.error,
              ),
            });
            return;
          }
          const body = (await response.json().catch(() => ({}))) as {
            url?: string;
          };
          if (typeof body.url !== "string" || !body.url) {
            setErrors({
              cv_url: messageForUploadFailure("cv", 500, null),
            });
            return;
          }
          cvUrl = body.url;
          uploadedPendingFileRef.current = { signature, url: body.url };
          setSubmitPhase("saving");
        }
        cvFilename = cvPendingFile.name;
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
        cv_filename: cvFilename,
        use_original_cv_filename: formData.use_original_cv_filename ?? true,
        show_profile_picture: includePicture,
        cv_type: cvMode,
        primary_cv_id: primaryCvId,
        // Name-in-URL uses typed values; include toggles only affect public-page fields.
        slugFirstName: formData.first_name?.trim() || null,
        slugLastName: formData.last_name?.trim() || null,
        // Create and edit both need this so handlers keep a validated typed slug.
        slugManuallyEdited,
      };
      await onSubmit(payload);
    } finally {
      isSubmittingRef.current = false;
      setSubmitPhase("idle");
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

  const shareableUrl =
    publicId && formData.slug
      ? getApplicationUrl(publicId, formData.slug)
      : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CandidateFieldsSection
        values={candidateValues}
        include={include}
        onValueChange={handleCandidateValueChange}
        onIncludeChange={handleCandidateIncludeChange}
      />

      <ProfilePictureField
        profilePictureUrl={profilePictureUrl}
        profilePictureVersion={profilePictureVersion}
        onProfilePictureSaved={onProfilePictureSaved}
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

      <div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <label
            htmlFor="application-slug"
            className="block text-sm font-medium text-foreground"
          >
            Slug *
          </label>
          <button
            type="button"
            onClick={handleResetSlugToSuggested}
            disabled={!hasCompany || !hasRole || formBusy}
            className="text-sm font-medium text-(--brand-primary) hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
          >
            Reset to suggested
          </button>
        </div>
        <Input
          id="application-slug"
          value={formData.slug}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, slug: e.target.value }));
            setSlugManuallyEdited(true);
          }}
          error={errors.slug}
          placeholder="auto-generated-slug"
          required
        />
      </div>
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
            <span>{slugLiveStatus.message}</span>
          </p>
        )}
      <p className="text-xs text-(--foreground)/60">
        This will be used in the URL: {shareableUrl || "..."}
      </p>

      <CvSourceField
        isEdit={isEdit}
        currentFilename={initialData?.cv_filename ?? null}
        currentType={initialData?.cv_type ?? null}
        currentUrl={initialData?.cv_url ?? ""}
        cvUrlExists={initialData?.cvUrlExists}
        onRetryCvCheck={onRetryCvCheck}
        mode={cvMode}
        primaryCvs={primaryCvs}
        primaryCvsLoading={primaryCvsLoading}
        selectedPrimaryId={selectedPrimaryId}
        pendingFile={cvPendingFile}
        error={errors.cv_url}
        onSelectPrimary={(primaryId) => {
          const primary = primaryCvs.find((m) => m.id === primaryId);
          if (!primary) return;
          setSelectedPrimaryId(primaryId);
          setFormData((prev) => ({
            ...prev,
            cv_url: primary.url,
            cv_filename: primary.filename,
            primary_cv_id: primary.id,
            cv_type: "primary",
          }));
          setErrors((prev) => ({ ...prev, cv_url: undefined }));
        }}
        onSwitchToTailored={() => {
          setCvMode("tailored");
          setSelectedPrimaryId(null);
          clearPendingCvSelection();
          // Keep saved tailored URL until a new file is chosen; clear if leaving primary.
          if (initialData?.cv_type === "tailored" && isEdit) {
            setFormData((prev) => ({
              ...prev,
              cv_url: initialData.cv_url ?? prev.cv_url,
              cv_filename: initialData.cv_filename ?? prev.cv_filename,
              primary_cv_id: null,
              cv_type: "tailored",
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              cv_url: "",
              cv_filename: null,
              primary_cv_id: null,
              cv_type: "tailored",
            }));
          }
        }}
        onSwitchToPrimary={() => {
          const leavingSavedTailored =
            cvMode === "tailored" &&
            hadTailoredCvOnLoad &&
            !cvPendingFile;
          if (leavingSavedTailored) {
            setSwitchToPrimaryConfirmOpen(true);
            return;
          }
          setCvMode("primary");
          clearPendingCvSelection();
          const first = primaryCvs[0];
          if (first) {
            setSelectedPrimaryId(first.id);
            setFormData((prev) => ({
              ...prev,
              cv_url: first.url,
              cv_filename: first.filename,
              primary_cv_id: first.id,
              cv_type: "primary",
            }));
          } else {
            setSelectedPrimaryId(null);
            setFormData((prev) => ({
              ...prev,
              primary_cv_id: null,
              cv_type: "primary",
            }));
          }
        }}
        onPendingFileChange={async (file) => {
          const gen = ++cvPendingFileGenRef.current;
          if (!file) {
            setCvPendingFile(null);
            setCvPendingDigesting(false);
            uploadedPendingFileRef.current = null;
            cvPendingSignatureRef.current = null;
            cvUploadIdempotencyKeyRef.current = null;
            // Restored saved tailored URL after clearing a new selection
            if (isEdit && initialData?.cv_type === "tailored") {
              setFormData((prev) => ({
                ...prev,
                cv_url: initialData.cv_url ?? "",
                cv_filename: initialData.cv_filename ?? null,
                cv_type: "tailored",
                primary_cv_id: null,
              }));
            }
            return;
          }

          // Commit selection immediately so Save cannot submit the previous
          // saved tailored CV while the content digest is still in flight.
          const previousSignature = cvPendingSignatureRef.current;
          const previousCache = uploadedPendingFileRef.current;
          setCvPendingFile(file);
          setCvPendingDigesting(true);
          cvPendingSignatureRef.current = null;
          setFormData((prev) => ({
            ...prev,
            cv_filename: file.name,
            cv_type: "tailored",
            primary_cv_id: null,
          }));
          setErrors((prev) => ({ ...prev, cv_url: undefined }));

          let signature: string;
          try {
            signature = await getFileSignature(file);
          } catch {
            if (gen !== cvPendingFileGenRef.current) return;
            setCvPendingDigesting(false);
            setCvPendingFile(null);
            uploadedPendingFileRef.current = null;
            cvPendingSignatureRef.current = null;
            cvUploadIdempotencyKeyRef.current = null;
            setErrors({
              cv_url:
                "Couldn’t read that PDF. Please choose the file again.",
            });
            throw new Error("CV file digest failed");
          }
          if (gen !== cvPendingFileGenRef.current) return;

          const sameAsCached = previousCache?.signature === signature;
          const sameAsPending = previousSignature === signature;
          // Reselecting the same PDF (by content) keeps the client upload cache
          // and idempotency key so Save does not create a duplicate R2 object.
          if (sameAsCached && previousCache) {
            uploadedPendingFileRef.current = previousCache;
          } else {
            uploadedPendingFileRef.current = null;
            if (!sameAsPending) {
              cvUploadIdempotencyKeyRef.current = resolveCvUploadIdempotencyKey(
                cvUploadIdempotencyKeyRef.current,
                true,
              );
            }
          }

          cvPendingSignatureRef.current = signature;
          setCvPendingDigesting(false);
        }}
        onPrimaryLibraryChange={handlePrimaryLibraryChange}
        switchToPrimaryConfirmOpen={switchToPrimaryConfirmOpen}
        onConfirmSwitchToPrimary={() => {
          setSwitchToPrimaryConfirmOpen(false);
          setCvMode("primary");
          clearPendingCvSelection();
          const first = primaryCvs[0];
          if (first) {
            setSelectedPrimaryId(first.id);
            setFormData((prev) => ({
              ...prev,
              cv_url: first.url,
              cv_filename: first.filename,
              primary_cv_id: first.id,
              cv_type: "primary",
            }));
          }
        }}
        onCancelSwitchToPrimary={() => setSwitchToPrimaryConfirmOpen(false)}
        useOriginalCvFilename={formData.use_original_cv_filename ?? true}
        onUseOriginalCvFilenameChange={(use) =>
          setFormData((prev) => ({ ...prev, use_original_cv_filename: use }))
        }
        slug={formData.slug}
        uploading={submitPhase === "uploading"}
        preparing={cvPendingDigesting}
      />

      <YouTubeUrlInput
        value={formData.video_url}
        onChange={(url) => setFormData((prev) => ({ ...prev, video_url: url }))}
        error={errors.video_url}
      />

      <ApplicationFormActions
        loading={formBusy}
        loadingLabel={saveLoadingLabel}
        submitLabel="Save Application"
        canSubmit={canSubmit}
        disabledReason={disabledReason}
      />
    </form>
  );
}
