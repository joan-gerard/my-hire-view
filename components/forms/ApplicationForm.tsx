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
  shouldOpenLinkCustomize,
  SLUG_SEGMENT_ORDER_DEFAULT,
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
import {
  isCurrentPrimaryCvLoad,
  shouldApplyInitialCvModeDefault,
  shouldAutoSelectFirstPrimaryOnLibraryFill,
} from "@/lib/utils/primary-cv-form-sync";
import {
  clearCreateApplicationDraft,
  isCreateApplicationDraftBlank,
  loadCreateApplicationDraft,
  saveCreateApplicationDraft,
  type CreateApplicationDraft,
} from "@/lib/utils/create-application-draft";
import {
  applicationFormDirtySnapshot,
  hasApplicationFormDirtyChanges,
} from "@/lib/utils/application-form-dirty";
import {
  hasLeaveRelevantDraftChanges,
  leaveRelevantDraftSnapshot,
} from "@/lib/utils/leave-confirm";
import { useLeaveConfirm } from "@/hooks/useLeaveConfirm";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ApplicationFormActions from "./ApplicationFormActions";
import ApplicationFormSinglePageLayout, {
  ApplicationFormFieldRow,
  FIELD_IDLE_TIP,
  FIELD_READY_TIP,
  PROFILE_EMPTY_TIP,
  PROFILE_INITIAL_DATA_TIP,
  type ApplicationFormPageRow,
} from "./ApplicationFormSinglePageLayout";
import {
  applicationFormStepForErrors,
  type ApplicationFormStepId,
} from "./application-form-steps";
import CandidateFieldsSection, {
  EditProfileLink,
  type CandidateFieldKey,
} from "./CandidateFieldsSection";
import CvSourceField from "./CvSourceField";
import ProfilePictureField from "./ProfilePictureField";
import YouTubeUrlInput, {
  type YouTubeFieldStatus,
} from "./YouTubeUrlInput";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AdminTooltip from "@/components/admin/AdminTooltip";
import { BrokenLinkIcon, CopyIcon } from "@/components/admin/icons";
import SlugOrderDropdown from "./SlugOrderDropdown";
import { copyToClipboard } from "@/lib/utils/clipboard";
import type { SlugSegmentOrder } from "@/lib/utils/slug-generate";
import { getApplicationUrl, getBaseUrl } from "@/lib/utils/url";
import { validateYouTubeUrl } from "@/lib/utils/youtube";
import { YOUTUBE_UNAVAILABLE_MESSAGE } from "@/lib/utils/youtube-preview";
import { FiAlertCircle } from "react-icons/fi";

function hasValue(v: string | null | undefined): boolean {
  return v != null && String(v).trim() !== "";
}

function checklistErrorTarget(
  errors: Partial<Record<keyof ApplicationFormData, string>>,
): { rowId: string; inputId?: string } | null {
  if (errors.company) {
    return { rowId: "application-row-company", inputId: "application-company" };
  }
  if (errors.role) {
    return { rowId: "application-row-role", inputId: "application-role" };
  }
  if (errors.slug) {
    return { rowId: "application-row-ending", inputId: "application-slug" };
  }
  if (errors.first_name) {
    return {
      rowId: "application-row-first_name",
      inputId: "application-first-name",
    };
  }
  if (errors.last_name) {
    return {
      rowId: "application-row-last_name",
      inputId: "application-last-name",
    };
  }
  if (errors.location) {
    return { rowId: "application-row-location", inputId: "application-location" };
  }
  if (errors.linkedin_url) {
    return {
      rowId: "application-row-linkedin_url",
      inputId: "application-linkedin_url",
    };
  }
  if (errors.portfolio_url) {
    return {
      rowId: "application-row-portfolio_url",
      inputId: "application-portfolio_url",
    };
  }
  if (errors.cv_url || errors.cv_filename) {
    return { rowId: "application-row-resume" };
  }
  if (errors.video_url) {
    return { rowId: "application-row-pitch", inputId: "application-video" };
  }
  const step = applicationFormStepForErrors(errors);
  if (step === "materials") return { rowId: "application-row-resume" };
  if (step === "video") {
    return { rowId: "application-row-pitch", inputId: "application-video" };
  }
  if (step === "candidate") return { rowId: "application-section-about" };
  if (step === "role") {
    return { rowId: "application-row-company", inputId: "application-company" };
  }
  return null;
}

/** Scroll a create-form row into view and focus its control. */
function focusApplicationRow(rowId: string, inputId?: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const row = document.getElementById(rowId);
  row?.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: "center",
  });
  const target =
    (inputId ? document.getElementById(inputId) : null) ??
    row?.querySelector<HTMLElement>("input, textarea, select");
  target?.focus();
}

function defaultInclude(
  initialData?: Partial<ApplicationFormData>,
): Record<CandidateFieldKey, boolean> {
  return {
    first_name: true,
    last_name: true,
    email: hasValue(initialData?.email),
    phone: hasValue(initialData?.phone),
    location: hasValue(initialData?.location),
    portfolio_url: hasValue(initialData?.portfolio_url),
    linkedin_url: hasValue(initialData?.linkedin_url),
  };
}

/** initialData can include application row fields used to seed form state. */
export type ApplicationFormInitialData = Partial<ApplicationFormData> & {
  /** Saved application status — active edits keep the full publish-ready gate. */
  status?: "active" | "draft" | "archived";
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

export type ApplicationSubmitOptions = {
  /**
   * Create only: when false, persist the draft without navigating away
   * (leave-confirm Save Draft). Defaults to true.
   */
  navigate?: boolean;
};

interface ApplicationFormProps {
  initialData?: ApplicationFormInitialData;
  onSubmit: (
    data: ApplicationFormData,
    options?: ApplicationSubmitOptions,
  ) => Promise<{ id?: string } | void>;
  loading?: boolean;
  /** Primary submit button label. Create uses “Save Draft”. */
  submitLabel?: string;
  /** When provided, passed to FileUpload so user can re-check CV existence (edit page). */
  /** Resolves false when the saved CV is still missing from storage. */
  onRetryCvCheck?: () => Promise<boolean | void>;
  /** Profile picture URL. Show/Hide appears only when this is set. */
  profilePictureUrl?: string | null;
  /** Cache-bust key for the live profile picture (e.g. profiles.updated_at). */
  profilePictureVersion?: string | null;
  /**
   * Which optional profile fields this application currently shares.
   * Names are always shared. Edit passes this from the saved row so a
   * hidden location stays hidden even when the live profile has a value.
   */
  initialInclude?: Partial<Record<CandidateFieldKey, boolean>>;
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
  /**
   * When set (create flow only), autosave form fields to localStorage under this
   * key and restore on mount (F15-045). Cleared after a successful submit.
   */
  persistDraftKey?: string;
}

export default function ApplicationForm({
  initialData,
  onSubmit,
  loading = false,
  submitLabel = "Save Application",
  onRetryCvCheck,
  profilePictureUrl,
  profilePictureVersion,
  initialInclude,
  publicId,
  slugExcludeApplicationId,
  resolveSlugOnCreate = false,
  persistDraftKey,
}: ApplicationFormProps) {
  const serverSlugValidation = Boolean(slugExcludeApplicationId);
  const isEdit = Boolean(slugExcludeApplicationId);
  const hasProfilePicture = Boolean(profilePictureUrl?.trim());
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  /** Leave-confirm Save Draft button: idle or saving (then leave to pending). */
  const [leaveDialogSave, setLeaveDialogSave] = useState<"idle" | "saving">(
    "idle",
  );

  /** Load once per mount; ignore later key changes while the form is open. */
  const restoredDraftRef = useRef<CreateApplicationDraft | null | undefined>(
    undefined,
  );
  if (restoredDraftRef.current === undefined) {
    restoredDraftRef.current = persistDraftKey
      ? loadCreateApplicationDraft(persistDraftKey)
      : null;
  }
  const restoredDraft = restoredDraftRef.current;

  /**
   * F15-049: once the user (or a restored draft) picks a CV source, the primary
   * library fetch must not overwrite it.
   */
  const cvModeUserChosenRef = useRef(
    Boolean(restoredDraft?.cvModeUserChosen),
  );
  const showProfilePictureUserChosenRef = useRef(
    Boolean(restoredDraft?.showProfilePictureUserChosen),
  );
  /** After a successful create, ignore further draft writes (F15-045). */
  const skipDraftSaveRef = useRef(false);
  /** Disarm leave confirm after discard or successful navigating save. */
  const [leaveGuardArmed, setLeaveGuardArmed] = useState(true);
  /** Edit: baseline of last saved values — Save stays off until something changes. */
  const editBaselineRef = useRef<string | null>(null);
  /** True when mount restored a non-blank draft (cleared once the form is blank again). */
  const hadRestoredDraftRef = useRef(
    Boolean(restoredDraft && !isCreateApplicationDraftBlank(restoredDraft)),
  );
  const leaveBaselineRef = useRef<string | null>(null);
  /** Flush localStorage clear after a restored draft is emptied (before paint). */
  const pendingClearRestoredDraftRef = useRef(false);

  const showProfilePictureDefault =
    restoredDraft?.showProfilePicture !== undefined
      ? restoredDraft.showProfilePicture
      : initialData?.show_profile_picture !== undefined
        ? initialData.show_profile_picture === true
        : hasProfilePicture;
  const [showProfilePicture, setShowProfilePicture] = useState(
    showProfilePictureDefault,
  );

  const [formData, setFormData] = useState<ApplicationFormData>({
    company: restoredDraft?.company || initialData?.company || "",
    role: restoredDraft?.role || initialData?.role || "",
    slug: restoredDraft?.slug || initialData?.slug || "",
    cv_url: initialData?.cv_url || "",
    video_url: restoredDraft?.video_url || initialData?.video_url || "",
    first_name: initialData?.first_name ?? "",
    last_name: initialData?.last_name ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    location: initialData?.location ?? "",
    portfolio_url: initialData?.portfolio_url ?? "",
    linkedin_url: initialData?.linkedin_url ?? "",
    cv_filename: initialData?.cv_filename ?? null,
    use_original_cv_filename:
      restoredDraft?.use_original_cv_filename ??
      initialData?.use_original_cv_filename ??
      false,
    cv_type: restoredDraft?.cvMode ?? initialData?.cv_type,
    primary_cv_id:
      restoredDraft?.selectedPrimaryId ?? initialData?.primary_cv_id ?? null,
  });

  const [include, setInclude] = useState<Record<CandidateFieldKey, boolean>>(
    () => {
      const fallback = defaultInclude(initialData);
      const base = restoredDraft?.include ?? fallback;
      const fromDraft = Boolean(restoredDraft?.include);
      return {
        first_name: true,
        last_name: true,
        email: fromDraft
          ? base.email
          : (initialInclude?.email ?? fallback.email),
        phone: fromDraft
          ? base.phone
          : (initialInclude?.phone ?? fallback.phone),
        location: fromDraft
          ? base.location
          : (initialInclude?.location ?? fallback.location),
        portfolio_url: fromDraft
          ? base.portfolio_url
          : (initialInclude?.portfolio_url ?? fallback.portfolio_url),
        linkedin_url: fromDraft
          ? base.linkedin_url
          : (initialInclude?.linkedin_url ?? fallback.linkedin_url),
      };
    },
  );

  const [slugSegmentOrder, setSlugSegmentOrder] = useState<SlugSegmentOrder>(
    restoredDraft?.slugSegmentOrder ??
      initialData?.slugSegmentOrder ??
      SLUG_SEGMENT_ORDER_DEFAULT,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof ApplicationFormData, string>>
  >({});
  const [slugLiveStatus, setSlugLiveStatus] = useState<SlugLiveStatus>({
    kind: "idle",
  });
  /** Edit: treat a non-derived saved slug as manual so mount auto-rebuild does not wipe it (F14-099). */
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(() => {
    if (restoredDraft) return restoredDraft.slugManuallyEdited;
    return isCustomSlug(
      initialData?.slug ?? "",
      initialData?.company ?? "",
      initialData?.role ?? "",
      initialData?.slugSegmentOrder ?? SLUG_SEGMENT_ORDER_DEFAULT,
    );
  });
  /**
   * Advanced link controls (order + ending) stay collapsed unless the link is
   * already customized, the user opens Customize link, or a link error appears.
   */
  const [linkCustomizeOpen, setLinkCustomizeOpen] = useState(() =>
    shouldOpenLinkCustomize({
      slugManuallyEdited: restoredDraft
        ? restoredDraft.slugManuallyEdited
        : isCustomSlug(
            initialData?.slug ?? "",
            initialData?.company ?? "",
            initialData?.role ?? "",
            initialData?.slugSegmentOrder ?? SLUG_SEGMENT_ORDER_DEFAULT,
          ),
      slugSegmentOrder:
        restoredDraft?.slugSegmentOrder ??
        initialData?.slugSegmentOrder ??
        SLUG_SEGMENT_ORDER_DEFAULT,
    }),
  );
  const slugManuallyEditedRef = useRef(false);
  slugManuallyEditedRef.current = slugManuallyEdited;
  /**
   * Bumped by "Reset to suggested" so auto-reserve re-runs even when already
   * in auto mode (F27-101).
   */
  const [slugAutoReserveNonce, setSlugAutoReserveNonce] = useState(0);
  /**
   * A saved application keeps its slug when company or role change.
   * Reset, segment order, or typing in the slug field releases it.
   */
  const [slugPinned, setSlugPinned] = useState(
    () => isEdit && Boolean((initialData?.slug ?? "").trim()),
  );
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
  /** Which footer action is in flight — drives Save vs Publish busy labels. */
  const [submitIntent, setSubmitIntent] = useState<"save" | "publish" | null>(
    null,
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
  /** Bumped by modal library updates so a slower form GET cannot overwrite them. */
  const primaryCvLoadGenerationRef = useRef(0);
  const [cvMode, setCvMode] = useState<ApplicationCvType>(() => {
    if (restoredDraft?.cvMode === "primary" || restoredDraft?.cvMode === "tailored") {
      return restoredDraft.cvMode;
    }
    if (initialData?.cv_type === "primary" || initialData?.cv_type === "tailored") {
      return initialData.cv_type;
    }
    return "primary";
  });
  const [selectedPrimaryId, setSelectedPrimaryId] = useState<string | null>(
    restoredDraft?.selectedPrimaryId ?? initialData?.primary_cv_id ?? null,
  );
  /** Keep load/timeout handlers off stale mount closures (F15-049). */
  const cvModeRef = useRef(cvMode);
  cvModeRef.current = cvMode;
  const selectedPrimaryIdRef = useRef(selectedPrimaryId);
  selectedPrimaryIdRef.current = selectedPrimaryId;
  const [switchToPrimaryConfirmOpen, setSwitchToPrimaryConfirmOpen] =
    useState(false);
  /** YouTube URL format + oEmbed embeddability (private / blocked embeds fail). */
  const [videoStatus, setVideoStatus] = useState<YouTubeFieldStatus>(() => {
    const initial = (initialData?.video_url ?? "").trim();
    if (!initial) return { kind: "empty" };
    return validateYouTubeUrl(initial)
      ? { kind: "checking" }
      : { kind: "invalid_url" };
  });
  /** Tracks whether the current edit still has an unsaved tailored file that would be abandoned. */
  const hadTailoredCvOnLoad =
    initialData?.cv_type === "tailored" && Boolean(initialData?.cv_url?.trim());

  useEffect(() => {
    let cancelled = false;
    const generation = ++primaryCvLoadGenerationRef.current;
    /** Unlock CV radios if the library GET hangs (F15-049 review). */
    const PRIMARY_CV_LOAD_TIMEOUT_MS = 12_000;
    const timeoutId = window.setTimeout(() => {
      if (
        !isCurrentPrimaryCvLoad(
          generation,
          primaryCvLoadGenerationRef.current,
          cancelled,
        )
      ) {
        return;
      }
      setPrimaryCvsLoading(false);
      // No list yet — unlock tailored upload when defaults would have applied.
      if (
        shouldApplyInitialCvModeDefault({
          hasSavedCvType: Boolean(initialData?.cv_type),
          userChoseCvMode: cvModeUserChosenRef.current,
        })
      ) {
        setCvMode("tailored");
      }
    }, PRIMARY_CV_LOAD_TIMEOUT_MS);

    async function loadPrimaryCvs() {
      try {
        const res = await fetch("/api/profile/primary-cvs", {
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (
          !isCurrentPrimaryCvLoad(
            generation,
            primaryCvLoadGenerationRef.current,
            cancelled,
          )
        ) {
          return;
        }
        const list = (json.data as PrimaryCv[] | undefined) ?? [];
        setPrimaryCvs(list);
        const applyDefault = shouldApplyInitialCvModeDefault({
          hasSavedCvType: Boolean(initialData?.cv_type),
          userChoseCvMode: cvModeUserChosenRef.current,
        });
        if (applyDefault) {
          if (list.length > 0) {
            const pick = list[0]!;
            const prevId = selectedPrimaryIdRef.current;
            const stillValid =
              prevId != null && list.some((m) => m.id === prevId);
            const next =
              (stillValid && list.find((m) => m.id === prevId)) || pick;
            setCvMode("primary");
            setSelectedPrimaryId(next.id);
            setFormData((prev) => ({
              ...prev,
              cv_url: next.url,
              cv_filename: next.filename,
              primary_cv_id: next.id,
              cv_type: "primary",
            }));
          } else {
            setCvMode("tailored");
          }
        } else if (!initialData?.cv_type) {
          // Draft / explicit choice: keep mode when possible; repair stale primary ids.
          // Use refs — after a timeout unlock the user may already have switched mode.
          if (cvModeRef.current === "primary") {
            if (list.length === 0) {
              setSelectedPrimaryId(null);
              setCvMode("tailored");
              setFormData((prev) => ({
                ...prev,
                cv_url: "",
                cv_filename: null,
                primary_cv_id: null,
                cv_type: "tailored",
              }));
            } else {
              const currentSelected = selectedPrimaryIdRef.current;
              const preferred =
                (currentSelected &&
                  list.find((m) => m.id === currentSelected)) ||
                list[0]!;
              setSelectedPrimaryId(preferred.id);
              setFormData((prev) => ({
                ...prev,
                cv_url: preferred.url,
                cv_filename: preferred.filename,
                primary_cv_id: preferred.id,
                cv_type: "primary",
              }));
            }
          }
        } else if (
          initialData?.cv_type === "primary" &&
          initialData.primary_cv_id &&
          !list.some((m) => m.id === initialData.primary_cv_id)
        ) {
          // Primary CV was deleted; keep URL for display but force re-pick
          setSelectedPrimaryId(null);
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (
          isCurrentPrimaryCvLoad(
            generation,
            primaryCvLoadGenerationRef.current,
            cancelled,
          )
        ) {
          setPrimaryCvsLoading(false);
        }
      }
    }
    void loadPrimaryCvs();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
    // Only on mount / when initial identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Sync form selection after library modal upload/delete. */
  const handlePrimaryLibraryChange = (list: PrimaryCv[]) => {
    primaryCvLoadGenerationRef.current += 1;
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
    // Use create vs edit, not form-GET loading, so a modal update can win the race.
    // F15-049: skip if the user already chose tailored (or primary) explicitly.
    if (
      shouldAutoSelectFirstPrimaryOnLibraryFill({
        hadPrimaryCvs,
        isCreate: !initialData?.cv_type,
        listLength: list.length,
        userChoseCvMode: cvModeUserChosenRef.current,
      })
    ) {
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

  /** F15-045: debounced local draft while creating (not on edit). */
  useEffect(() => {
    if (!persistDraftKey || skipDraftSaveRef.current) return;
    const timer = window.setTimeout(() => {
      if (skipDraftSaveRef.current) return;
      saveCreateApplicationDraft(persistDraftKey, {
        company: formData.company,
        role: formData.role,
        slug: formData.slug,
        video_url: formData.video_url,
        first_name: formData.first_name ?? "",
        last_name: formData.last_name ?? "",
        email: formData.email ?? "",
        phone: formData.phone ?? "",
        location: formData.location ?? "",
        portfolio_url: formData.portfolio_url ?? "",
        linkedin_url: formData.linkedin_url ?? "",
        include,
        slugSegmentOrder,
        slugManuallyEdited,
        showProfilePicture,
        showProfilePictureUserChosen: showProfilePictureUserChosenRef.current,
        cvMode,
        cvModeUserChosen: cvModeUserChosenRef.current,
        selectedPrimaryId,
        use_original_cv_filename: formData.use_original_cv_filename ?? false,
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [
    persistDraftKey,
    formData.company,
    formData.role,
    formData.slug,
    formData.video_url,
    formData.first_name,
    formData.last_name,
    formData.email,
    formData.phone,
    formData.location,
    formData.portfolio_url,
    formData.linkedin_url,
    formData.use_original_cv_filename,
    include,
    slugSegmentOrder,
    slugManuallyEdited,
    showProfilePicture,
    cvMode,
    selectedPrimaryId,
    cvPendingFile,
  ]);

  const draftSnapshot = {
    company: formData.company,
    role: formData.role,
    slug: formData.slug,
    video_url: formData.video_url,
    first_name: formData.first_name ?? "",
    last_name: formData.last_name ?? "",
    email: formData.email ?? "",
    phone: formData.phone ?? "",
    location: formData.location ?? "",
    portfolio_url: formData.portfolio_url ?? "",
    linkedin_url: formData.linkedin_url ?? "",
    include,
    slugSegmentOrder,
    slugManuallyEdited,
    showProfilePicture,
    showProfilePictureUserChosen: showProfilePictureUserChosenRef.current,
    cvMode,
    cvModeUserChosen: cvModeUserChosenRef.current,
    selectedPrimaryId,
    use_original_cv_filename: formData.use_original_cv_filename ?? false,
  };
  const editDirtyInput = {
    company: formData.company,
    role: formData.role,
    slug: formData.slug,
    video_url: formData.video_url,
    first_name: formData.first_name ?? "",
    last_name: formData.last_name ?? "",
    location: formData.location ?? "",
    portfolio_url: formData.portfolio_url ?? "",
    linkedin_url: formData.linkedin_url ?? "",
    email: formData.email ?? "",
    phone: formData.phone ?? "",
    includeEmail: include.email,
    includePhone: include.phone,
    includeLocation: include.location,
    includePortfolio: include.portfolio_url,
    includeLinkedin: include.linkedin_url,
    slugSegmentOrder,
    showProfilePicture,
    cvMode,
    selectedPrimaryId,
    cv_url: formData.cv_url ?? "",
    cv_filename: formData.cv_filename ?? null,
    use_original_cv_filename: formData.use_original_cv_filename ?? false,
    hasPendingCvFile: Boolean(cvPendingFile),
  };
  if (persistDraftKey && leaveBaselineRef.current === null) {
    leaveBaselineRef.current = leaveRelevantDraftSnapshot(draftSnapshot);
  }
  if (isEdit && editBaselineRef.current === null) {
    editBaselineRef.current = applicationFormDirtySnapshot(editDirtyInput);
  }
  if (
    hadRestoredDraftRef.current &&
    isCreateApplicationDraftBlank(draftSnapshot) &&
    !cvPendingFile
  ) {
    // User cleared the restored draft back to empty — stop treating it as
    // progress and realign the leave baseline so blank ≠ "changed from draft".
    hadRestoredDraftRef.current = false;
    leaveBaselineRef.current = leaveRelevantDraftSnapshot(draftSnapshot);
    pendingClearRestoredDraftRef.current = true;
  }

  useLayoutEffect(() => {
    if (!persistDraftKey || !pendingClearRestoredDraftRef.current) return;
    pendingClearRestoredDraftRef.current = false;
    // Drop storage immediately so a fast navigate cannot restore the old draft
    // before the debounced autosave runs.
    clearCreateApplicationDraft(persistDraftKey);
  });

  const hasCreateProgress =
    Boolean(persistDraftKey) &&
    (Boolean(cvPendingFile) ||
      (hadRestoredDraftRef.current &&
        !isCreateApplicationDraftBlank(draftSnapshot)) ||
      (leaveBaselineRef.current != null &&
        hasLeaveRelevantDraftChanges(
          leaveBaselineRef.current,
          draftSnapshot,
        )));
  const hasEditProgress =
    isEdit &&
    editBaselineRef.current != null &&
    hasApplicationFormDirtyChanges(
      editBaselineRef.current,
      editDirtyInput,
    );
  const hasLeaveProgress = hasCreateProgress || hasEditProgress;
  const leaveConfirmEnabled = leaveGuardArmed && hasLeaveProgress;

  const discardOnLeave = () => {
    if (persistDraftKey) {
      skipDraftSaveRef.current = true;
      clearCreateApplicationDraft(persistDraftKey);
    }
    setLeaveGuardArmed(false);
    setLeaveDialogSave("idle");
  };

  const {
    open: leaveConfirmOpen,
    onConfirm: onConfirmLeave,
    onCancel: onCancelLeaveFromHook,
    disarmForNavigation,
  } = useLeaveConfirm(leaveConfirmEnabled, discardOnLeave);

  useEffect(() => {
    if (leaveConfirmOpen) return;
    setLeaveDialogSave("idle");
  }, [leaveConfirmOpen]);

  const hasCompany = Boolean(formData.company.trim());
  const hasRole = Boolean(formData.role.trim());
  const hasSlug = Boolean(formData.slug.trim());
  const hasCv =
    cvMode === "primary"
      ? Boolean(
          selectedPrimaryId &&
            primaryCvs.some((m) => m.id === selectedPrimaryId),
        )
      : Boolean(
          cvPendingFile ||
            (formData.cv_url &&
              formData.cv_url.trim() &&
              initialData?.cv_type === "tailored"),
        );
  /** Saved file is gone from storage. Choosing a replacement is not done yet. */
  const savedCvFileMissing = isEdit && initialData?.cvUrlExists === false;
  const stillUsingMissingSavedCv =
    savedCvFileMissing &&
    !cvPendingFile &&
    (initialData?.cv_type === "primary"
      ? cvMode === "primary" &&
        selectedPrimaryId === (initialData.primary_cv_id ?? null)
      : cvMode === "tailored");
  const hasUsableCv = hasCv && !stillUsingMissingSavedCv;
  const hasValidVideo = videoStatus.kind === "ready";
  const videoUrlEntered = Boolean(formData.video_url.trim());
  /** Entered URL that failed format or oEmbed — blocks Save until fixed or cleared. */
  const videoHardBlock =
    videoUrlEntered &&
    (videoStatus.kind === "invalid_url" ||
      videoStatus.kind === "unavailable");
  /** Still resolving oEmbed — Save may wait on submit. */
  const videoStillChecking =
    videoUrlEntered && videoStatus.kind === "checking";
  const savedSlug = (initialData?.slug ?? "").trim();
  const slugUnchangedFromSave =
    slugPinned && hasSlug && formData.slug.trim() === savedSlug;
  const slugReady =
    hasSlug &&
    (slugLiveStatus.kind === "available" || slugUnchangedFromSave);

  const hasFirstName = Boolean(formData.first_name?.trim());
  const hasLastName = Boolean(formData.last_name?.trim());

  /**
   * F40: draft create/edit only needs company, role, and a ready share link
   * (auto-filled from company + role). Live apps keep the full publish set.
   */
  const requiresPublishCompleteSet =
    isEdit && initialData?.status === "active";

  const draftSaveReady =
    hasCompany && hasRole && slugReady && !videoHardBlock;
  const publishSaveReady =
    draftSaveReady &&
    hasFirstName &&
    hasLastName &&
    hasUsableCv &&
    hasValidVideo;
  const requiredReady = requiresPublishCompleteSet
    ? publishSaveReady
    : draftSaveReady;

  const formBusy =
    loading || submitPhase !== "idle" || cvPendingDigesting;
  const hasUnsavedEditChanges =
    !isEdit ||
    (editBaselineRef.current != null &&
      hasApplicationFormDirtyChanges(
        editBaselineRef.current,
        editDirtyInput,
      ));
  const canSubmit = requiredReady && !formBusy && hasUnsavedEditChanges;
  /** Create or draft edit: Publish appears once the full go-live set is ready. */
  const showPublish = !requiresPublishCompleteSet && publishSaveReady;
  const canPublish = showPublish && !formBusy;
  const saveLoadingLabel =
    cvPendingDigesting
      ? "Preparing…"
      : submitPhase === "uploading"
        ? "Uploading…"
        : "Saving…";

  const saveBlockers = (() => {
    if (canSubmit || formBusy) return [] as { name: string; note?: string; stepId: ApplicationFormStepId }[];
    const items: { name: string; note?: string; stepId: ApplicationFormStepId }[] = [];
    if (!hasCompany) items.push({ name: "Company", stepId: "role" });
    if (!hasRole) items.push({ name: "Role", stepId: "role" });
    if (slugLiveStatus.kind === "checking") {
      items.push({
        name: "Your application link",
        note: "Your application link is still being checked",
        stepId: "role",
      });
    } else if (slugLiveStatus.kind === "invalid") {
      items.push({
        name: "Your application link",
        note: slugLiveStatus.message || "Your application link is not valid",
        stepId: "role",
      });
    } else if (slugLiveStatus.kind === "unavailable") {
      items.push({
        name: "Your application link",
        note: slugLiveStatus.message || "Your application link is taken",
        stepId: "role",
      });
    } else if (!hasSlug || !slugReady) {
      items.push({ name: "Your application link", stepId: "role" });
    }
    if (requiresPublishCompleteSet) {
      if (!hasFirstName) {
        items.push({ name: "First name", stepId: "candidate" });
      }
      if (!hasLastName) {
        items.push({ name: "Last name", stepId: "candidate" });
      }
      if (!hasUsableCv) items.push({ name: "Your Résumé", stepId: "materials" });
      if (!hasValidVideo) items.push({ name: "YouTube intro", stepId: "video" });
    } else if (videoHardBlock) {
      items.push({
        name: "YouTube intro",
        note:
          videoStatus.kind === "unavailable"
            ? videoStatus.message || YOUTUBE_UNAVAILABLE_MESSAGE
            : "Enter a valid YouTube URL",
        stepId: "video",
      });
    }
    return items;
  })();

  const disabledReason = (() => {
    if (formBusy) return null;
    if (saveBlockers.length > 0) {
      const phrases = saveBlockers.map((item) => item.note ?? item.name);
      const prefix = requiresPublishCompleteSet
        ? "Required before saving"
        : "Required before saving draft";
      return `${prefix}: ${phrases.join(", ")}`;
    }
    if (isEdit && !hasUnsavedEditChanges) {
      return "No changes to save.";
    }
    return null;
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
    slugSegmentOrder,
    slugManuallyEdited,
  ]);

  /** Segment order is a structured slug rule; re-enable auto slug when the user changes it. */
  const handleSlugSegmentOrderChange = (next: SlugSegmentOrder) => {
    setSlugSegmentOrder(next);
    setSlugManuallyEdited(false);
    setSlugPinned(false);
  };

  /**
   * Exit manual slug mode and re-derive from company + role + segment order
   * via POST /api/slug (create and edit; excludeId on edit) — F27-101.
   */
  const handleResetSlugToSuggested = () => {
    setSlugManuallyEdited(false);
    setSlugPinned(false);
    setSlugAutoReserveNonce((n) => n + 1);
  };

  /** Typing the suggested ending again leaves manual mode. */
  const handleSlugFieldChange = (nextSlug: string) => {
    setFormData((prev) => ({ ...prev, slug: nextSlug }));
    setSlugManuallyEdited(
      isCustomSlug(
        nextSlug,
        formData.company,
        formData.role,
        slugSegmentOrder,
      ),
    );
    setSlugPinned(false);
  };

  /** Create, or an edit whose slug was released: auto mode uses POST /api/slug. */
  const shouldAutoReserveSlug =
    !slugPinned &&
    !slugManuallyEdited &&
    (resolveSlugOnCreate || Boolean(slugExcludeApplicationId));

  useEffect(() => {
    if (slugPinned || shouldAutoReserveSlug) {
      return;
    }
    if (!slugManuallyEdited && formData.company && formData.role) {
      const slug = buildSlug(
        formData.company,
        formData.role,
        slugSegmentOrder,
      );
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [
    formData.company,
    formData.role,
    slugSegmentOrder,
    slugManuallyEdited,
    shouldAutoReserveSlug,
    slugPinned,
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
        slugSegmentOrder,
      );
      try {
        const res = await fetch("/api/slug", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            company: formData.company,
            role: formData.role,
            slugSegmentOrder,
            ...(slugExcludeApplicationId
              ? { excludeId: slugExcludeApplicationId }
              : {}),
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
    slugSegmentOrder,
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
        // Discard if the user left manual mode (e.g. Reset to suggested / segment order).
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

  /** Surface field errors on the step / row that owns those inputs. */
  const revealFormErrors = (
    nextErrors: Partial<Record<keyof ApplicationFormData, string>>,
  ) => {
    const needsLinkCustomize = Boolean(nextErrors.slug);
    if (needsLinkCustomize) setLinkCustomizeOpen(true);
    setErrors(nextErrors);
    const target = checklistErrorTarget(nextErrors);
    if (target) {
      window.setTimeout(
        () => focusApplicationRow(target.rowId, target.inputId),
        needsLinkCustomize ? 50 : 0,
      );
    }
  };

  const runSubmit = async (
    intent: "save" | "publish",
    options?: { fromLeaveDialog?: boolean },
  ) => {
    const fromLeaveDialog = options?.fromLeaveDialog === true;
    // Single-page create blocks Enter in inputs separately.
    if (isSubmittingRef.current) return;
    if (!fromLeaveDialog && formBusy) return;
    if (intent === "save" && !fromLeaveDialog && !canSubmit) return;
    if (intent === "publish" && !canPublish) return;
    if (fromLeaveDialog && intent === "save") {
      if (!requiredReady || leaveDialogSave === "saving") return;
      if (isEdit && !hasUnsavedEditChanges) return;
      setLeaveDialogSave("saving");
    }
    isSubmittingRef.current = true;
    setSubmitIntent(intent);
    setErrors({});
    setSubmitPhase("saving");

    const mustBeComplete =
      requiresPublishCompleteSet || intent === "publish";
    /** Tracks leave-dialog save so early returns still reset the button. */
    let leaveSaveCompleted = false;

    try {
      const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
      if (!formData.company.trim())
        newErrors.company = "Company name is required";
      if (!formData.role.trim()) newErrors.role = "Role is required";
      const slugTrimmed = formData.slug.trim();
      if (!slugTrimmed) newErrors.slug = "Slug is required";

      const firstName = formData.first_name?.trim() ?? "";
      const lastName = formData.last_name?.trim() ?? "";

      if (mustBeComplete) {
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
          newErrors.video_url = "YouTube intro is required";
        else if (videoStatus.kind === "unavailable")
          newErrors.video_url =
            videoStatus.message || YOUTUBE_UNAVAILABLE_MESSAGE;
        else if (videoStatus.kind === "checking")
          newErrors.video_url = "Wait for the video check to finish";
        else if (!hasValidVideo)
          newErrors.video_url = "Enter a valid YouTube URL";
        if (!firstName) newErrors.first_name = "First name is required";
        if (!lastName) newErrors.last_name = "Last name is required";
      } else if (videoUrlEntered && (videoHardBlock || videoStillChecking)) {
        // Draft: when a URL is entered, require a usable (embeddable) video.
        if (videoStatus.kind === "unavailable") {
          newErrors.video_url =
            videoStatus.message || YOUTUBE_UNAVAILABLE_MESSAGE;
        } else if (videoStatus.kind === "checking") {
          newErrors.video_url = "Wait for the video check to finish";
        } else {
          newErrors.video_url = "Enter a valid YouTube URL";
        }
      }

      if (Object.keys(newErrors).length > 0) {
        revealFormErrors(newErrors);
        return;
      }

      // canSubmit already requires slugLiveStatus === available; server validation below for races.

      if (serverSlugValidation || (resolveSlugOnCreate && slugManuallyEdited)) {
        const formatCheck = validateSlugFormat(slugTrimmed);
        if (!formatCheck.ok) {
          newErrors.slug = formatCheck.error;
          revealFormErrors(newErrors);
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
          revealFormErrors(newErrors);
          return;
        }
        const slugValidateJson: { ok?: boolean; error?: string } =
          await slugValidateRes.json().catch(() => ({}));
        if (slugValidateRes.status === 401) {
          const msg = "Your session expired. Sign in again and retry.";
          newErrors.slug = msg;
          revealFormErrors(newErrors);
          setSlugLiveStatus({ kind: "unavailable", message: msg });
          return;
        }
        if (!slugValidateRes.ok || slugValidateJson.ok !== true) {
          const slugErr =
            slugValidateJson.error ||
            "This slug is not available. Change it before saving.";
          newErrors.slug = slugErr;
          revealFormErrors(newErrors);
          setSlugLiveStatus({ kind: "unavailable", message: slugErr });
          return;
        }
      }

      // About you values come from the profile (read-only here). Snapshot
      // shown fields onto the application; edit identity on /admin/profile.
      let cvUrl = formData.cv_url?.trim() ?? "";
      let cvFilename = formData.cv_filename ?? null;
      let primaryCvId: string | null = null;

      if (cvMode === "primary") {
        if (selectedPrimaryId) {
          const primary = primaryCvs.find((m) => m.id === selectedPrimaryId);
          if (!primary) {
            revealFormErrors({ cv_url: "Select a primary CV" });
            return;
          }
          cvUrl = primary.url;
          cvFilename = primary.filename;
          primaryCvId = primary.id;
        } else if (mustBeComplete) {
          revealFormErrors({ cv_url: "Select a primary CV" });
          return;
        } else {
          cvUrl = "";
          primaryCvId = null;
        }
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
            revealFormErrors({
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
            revealFormErrors({
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
            revealFormErrors({
              cv_url: messageForUploadFailure("cv", 500, null),
            });
            return;
          }
          cvUrl = body.url;
          uploadedPendingFileRef.current = { signature, url: body.url };
          setSubmitPhase("saving");
        }
        cvFilename = cvPendingFile.name;
      } else {
        // Tailored mode, no new file. Keep a saved tailored URL on edit; otherwise
        // clear so a leftover primary-library URL is not sent as tailored (draft
        // may select "Upload one for this role" before choosing a PDF).
        const savedTailoredUrl =
          isEdit && initialData?.cv_type === "tailored"
            ? (initialData.cv_url ?? "").trim()
            : "";
        const currentUrl = formData.cv_url?.trim() ?? "";
        if (savedTailoredUrl && currentUrl === savedTailoredUrl) {
          cvUrl = savedTailoredUrl;
          cvFilename = initialData?.cv_filename ?? cvFilename;
        } else {
          cvUrl = "";
          cvFilename = null;
        }
      }

      const includePicture = hasProfilePicture && showProfilePicture;

      const resolvedCvType: ApplicationCvType =
        cvMode === "primary" && primaryCvId ? "primary" : "tailored";

      const payload: ApplicationFormData = {
        ...formData,
        slug: slugTrimmed,
        cv_url: cvUrl || null,
        video_url: formData.video_url.trim(),
        first_name: formData.first_name?.trim() || null,
        last_name: formData.last_name?.trim() || null,
        email: include.email ? formData.email?.trim() || null : null,
        phone: include.phone ? formData.phone?.trim() || null : null,
        location: include.location ? formData.location?.trim() || null : null,
        portfolio_url: include.portfolio_url
          ? formData.portfolio_url?.trim() || null
          : null,
        linkedin_url: include.linkedin_url
          ? formData.linkedin_url?.trim() || null
          : null,
        slugSegmentOrder,
        cv_filename: cvFilename,
        use_original_cv_filename: formData.use_original_cv_filename ?? false,
        show_profile_picture: includePicture,
        // Draft without a selected primary must not send cv_type primary
        // (API requires primary_cv_id in that case).
        cv_type: resolvedCvType,
        primary_cv_id: primaryCvId,
        // Create and edit both need this so handlers keep a validated typed slug.
        slugManuallyEdited,
        ...(intent === "publish" ? { status: "active" as const } : {}),
      };
      // Disarm leave-confirm before parent navigates. Clearing the history
      // sentinel after router.push can race and cancel the redirect (F16).
      // Leave-dialog save keeps the dialog open and does not navigate yet.
      if (persistDraftKey && !fromLeaveDialog) {
        skipDraftSaveRef.current = true;
        setLeaveGuardArmed(false);
        await disarmForNavigation();
      }
      try {
        await onSubmit(
          payload,
          fromLeaveDialog ? { navigate: false } : undefined,
        );
        if (persistDraftKey) {
          clearCreateApplicationDraft(persistDraftKey);
          skipDraftSaveRef.current = true;
          leaveBaselineRef.current = leaveRelevantDraftSnapshot({
            ...draftSnapshot,
            company: payload.company,
            role: payload.role,
            slug: payload.slug,
            video_url: payload.video_url,
          });
          hadRestoredDraftRef.current = false;
        }
        // Publish navigates away (view/dashboard). Draft/live save on edit stays put
        // unless this save came from the leave dialog (then continue to pending).
        if (isEdit && intent === "save" && !fromLeaveDialog) {
          // Stay on edit: clear pending upload and realign the dirty baseline
          // so Save turns off until the next change.
          clearPendingCvSelection();
          const nextCvMode: ApplicationCvType = resolvedCvType;
          setCvMode(nextCvMode);
          setSelectedPrimaryId(primaryCvId);
          setShowProfilePicture(includePicture);
          setSlugPinned(Boolean(payload.slug.trim()));
          setFormData((prev) => ({
            ...prev,
            company: payload.company,
            role: payload.role,
            slug: payload.slug,
            video_url: payload.video_url,
            first_name: payload.first_name ?? "",
            last_name: payload.last_name ?? "",
            email: formData.email ?? "",
            phone: formData.phone ?? "",
            location: formData.location ?? "",
            portfolio_url: formData.portfolio_url ?? "",
            linkedin_url: formData.linkedin_url ?? "",
            cv_url: payload.cv_url ?? "",
            cv_filename: payload.cv_filename ?? null,
            use_original_cv_filename:
              payload.use_original_cv_filename ?? false,
            cv_type: nextCvMode,
            primary_cv_id: primaryCvId,
          }));
          editBaselineRef.current = applicationFormDirtySnapshot({
            company: payload.company,
            role: payload.role,
            slug: payload.slug,
            video_url: payload.video_url,
            first_name: payload.first_name ?? "",
            last_name: payload.last_name ?? "",
            email: formData.email ?? "",
            phone: formData.phone ?? "",
            location: formData.location ?? "",
            portfolio_url: formData.portfolio_url ?? "",
            linkedin_url: formData.linkedin_url ?? "",
            includeEmail: include.email,
            includePhone: include.phone,
            includeLocation: include.location,
            includePortfolio: include.portfolio_url,
            includeLinkedin: include.linkedin_url,
            slugSegmentOrder,
            showProfilePicture: includePicture,
            cvMode: nextCvMode,
            selectedPrimaryId: primaryCvId,
            cv_url: payload.cv_url ?? "",
            cv_filename: payload.cv_filename ?? null,
            use_original_cv_filename:
              payload.use_original_cv_filename ?? false,
            hasPendingCvFile: false,
          });
        }
        if (fromLeaveDialog) {
          leaveSaveCompleted = true;
          // Continue to Cancel / Dashboard / Profile / Back — not stay on the form.
          onConfirmLeave();
        }
      } catch {
        if (persistDraftKey && !fromLeaveDialog) {
          skipDraftSaveRef.current = false;
          setLeaveGuardArmed(true);
        }
        // Parent surfaces the error (alert). Keep the local draft for retry.
      }
    } catch {
      // Validation / upload errors above — parent or field UI already informed.
    } finally {
      if (fromLeaveDialog && !leaveSaveCompleted) {
        setLeaveDialogSave("idle");
      }
      isSubmittingRef.current = false;
      setSubmitPhase("idle");
      setSubmitIntent(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await runSubmit("save");
  };

  const candidateValues: Record<CandidateFieldKey, string> = {
    first_name: formData.first_name ?? "",
    last_name: formData.last_name ?? "",
    email: formData.email ?? "",
    phone: formData.phone ?? "",
    location: formData.location ?? "",
    portfolio_url: formData.portfolio_url ?? "",
    linkedin_url: formData.linkedin_url ?? "",
  };

  const handleCandidateIncludeChange = (
    field: CandidateFieldKey,
    included: boolean,
  ) => {
    setInclude((prev) => ({ ...prev, [field]: included }));
  };

  const trimmedPublicId = publicId?.trim() || "";
  const trimmedSlug = formData.slug.trim();
  const shareLinkPath = `/view/${trimmedPublicId || "…"}/${trimmedSlug || "…"}`;
  const shareLinkFull = `${getBaseUrl()}${shareLinkPath}`;
  const shareableUrl =
    trimmedPublicId && trimmedSlug
      ? getApplicationUrl(trimmedPublicId, trimmedSlug)
      : null;
  /** Copy is a share action: only live apps. Create/draft still show the URL preview. */
  const isLiveApplication = isEdit && initialData?.status === "active";
  const canCopyShareLink = Boolean(shareableUrl) && isLiveApplication;
  const shareLinkCopyUnavailableLabel = !trimmedPublicId
    ? "Complete your profile to get a share link"
    : !trimmedSlug
      ? "Add a company and role to build the link"
      : !isLiveApplication && slugReady
        ? publishSaveReady
          ? "Publish before sharing this link"
          : "Finish required fields before publishing and sharing"
        : "Link is not ready to copy";

  const handleCopyShareLink = async () => {
    if (!shareableUrl || !canCopyShareLink) return;
    const success = await copyToClipboard(shareableUrl);
    if (success) {
      setShareLinkCopied(true);
      window.setTimeout(() => setShareLinkCopied(false), 2000);
    }
  };

  const shareLinkCopyClass =
    "inline-flex size-7 items-center justify-center rounded-lg border border-[var(--ink)]/15 bg-[var(--white)] shadow-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

  const linkCustomizeHasError = Boolean(
    errors.slug ||
      slugLiveStatus.kind === "invalid" ||
      slugLiveStatus.kind === "unavailable",
  );
  const linkCustomizeLabel = linkCustomizeOpen
    ? "Hide link options"
    : "Customize link";
  const linkCustomizeErrorMessage =
    errors.slug ||
    (slugLiveStatus.kind === "invalid" || slugLiveStatus.kind === "unavailable"
      ? slugLiveStatus.message
      : null);

  const linkEndingControl = (
    <div className="space-y-3">
      <Input
        id="application-slug"
        dense
        value={formData.slug}
        onChange={(e) => handleSlugFieldChange(e.target.value)}
        error={errors.slug}
        autoComplete="off"
        spellCheck={false}
      />
      {slugManuallyEdited ? (
        <button
          type="button"
          onClick={handleResetSlugToSuggested}
          disabled={!hasCompany || !hasRole || formBusy}
          className="rounded-sm text-sm font-medium text-[var(--ink)] underline decoration-[var(--ink)]/30 underline-offset-4 outline-none hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
        >
          Use the suggested link
        </button>
      ) : null}
      {slugLiveStatus.kind === "checking" ? (
        <p
          className="text-sm leading-relaxed text-[var(--muted)] italic"
          role="status"
        >
          Checking...
        </p>
      ) : null}
      {(slugLiveStatus.kind === "invalid" ||
        slugLiveStatus.kind === "unavailable") &&
      !errors.slug ? (
        <p
          className="flex items-start gap-1.5 text-sm text-[var(--status-danger-fg)]"
          role="alert"
        >
          <FiAlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{slugLiveStatus.message}</span>
        </p>
      ) : null}
    </div>
  );

  const shareLinkControl = (
    <div className="space-y-3">
      <div className="relative">
        <div
          id="application-share-link"
          role="textbox"
          aria-readonly="true"
          aria-label="Your application link"
          className="block w-full cursor-not-allowed break-all rounded-xl border-0 bg-[var(--white)] py-1.5 pr-12 pl-3.5 text-[var(--ink)] ring-1 ring-inset ring-[var(--ink)]/15 sm:text-sm sm:leading-6"
        >
          <span className="sm:hidden">{shareLinkPath}</span>
          <span className="hidden sm:inline">{shareLinkFull}</span>
        </div>
        <div className="absolute inset-y-0 right-1.5 flex items-center">
          {slugLiveStatus.kind === "checking" ? (
            <span
              role="status"
              className={`${shareLinkCopyClass} text-[var(--muted)]`}
              aria-label="Checking link availability"
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
                aria-hidden
              />
            </span>
          ) : linkCustomizeHasError ? (
            <AdminTooltip
              label={
                linkCustomizeErrorMessage?.trim() ||
                "Link needs attention"
              }
              side="top"
            >
              <span
                role="img"
                className={`${shareLinkCopyClass} text-[var(--status-danger-fg)]`}
                aria-label={
                  linkCustomizeErrorMessage?.trim() ||
                  "Link needs attention"
                }
              >
                <FiAlertCircle className="h-4 w-4" aria-hidden />
              </span>
            </AdminTooltip>
          ) : canCopyShareLink ? (
            <AdminTooltip
              label={shareLinkCopied ? "Copied!" : "Copy link"}
              side="top"
            >
              <button
                type="button"
                onClick={handleCopyShareLink}
                className={`${shareLinkCopyClass} cursor-pointer text-[var(--ink)] hover:bg-[var(--paper)]`}
                aria-label={shareLinkCopied ? "Copied!" : "Copy link"}
              >
                <CopyIcon className="h-4 w-4" />
              </button>
            </AdminTooltip>
          ) : (
            <AdminTooltip label={shareLinkCopyUnavailableLabel} side="top">
              <span
                role="img"
                className={`${shareLinkCopyClass} text-[var(--muted)]`}
                aria-label={shareLinkCopyUnavailableLabel}
              >
                <BrokenLinkIcon className="h-4 w-4" />
              </span>
            </AdminTooltip>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-expanded={linkCustomizeOpen}
        aria-controls={
          linkCustomizeOpen ? "application-row-slug-order" : undefined
        }
        aria-label={
          linkCustomizeHasError
            ? `${linkCustomizeLabel}. Link needs attention${
                linkCustomizeErrorMessage
                  ? `: ${linkCustomizeErrorMessage}`
                  : ""
              }`
            : linkCustomizeLabel
        }
        onClick={() => setLinkCustomizeOpen((open) => !open)}
        className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-[var(--ink)] underline decoration-[var(--ink)]/30 underline-offset-4 outline-none hover:decoration-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
      >
        {linkCustomizeLabel}
        {linkCustomizeHasError ? (
          <FiAlertCircle
            className="size-3.5 shrink-0 text-[var(--status-danger-fg)]"
            aria-hidden
          />
        ) : null}
      </button>
    </div>
  );

  const candidateStep = (
    <CandidateFieldsSection
      layout="rows"
      values={candidateValues}
      include={include}
      onIncludeChange={handleCandidateIncludeChange}
      afterNames={
        <ApplicationFormFieldRow
          id="application-row-picture"
          label="Picture"
          tip={hasProfilePicture ? PROFILE_INITIAL_DATA_TIP : PROFILE_EMPTY_TIP}
          tipTone={hasProfilePicture ? "ready" : "idle"}
          align="top"
        >
          <ProfilePictureField
            variant="checklist"
            hideLegend
            profilePictureUrl={profilePictureUrl}
            profilePictureVersion={profilePictureVersion}
            firstName={formData.first_name}
            lastName={formData.last_name}
            showProfilePicture={showProfilePicture}
            onShowProfilePictureChange={(next) => {
              showProfilePictureUserChosenRef.current = true;
              setShowProfilePicture(next);
            }}
          />
        </ApplicationFormFieldRow>
      }
    />
  );

  const materialsStep = (
    <>
      <CvSourceField
        variant="checklist"
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
          cvModeUserChosenRef.current = true;
          setCvMode("primary");
          clearPendingCvSelection();
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
          cvModeUserChosenRef.current = true;
          setCvMode("tailored");
          clearPendingCvSelection();
          // Keep primary selection + CV fields when leaving primary so a failed
          // tailored digest can restore mode/selection and Save stays usable.
          if (cvMode === "primary") {
            return;
          }
          // Already in tailored (or switching back): restore saved tailored URL
          // on edit, otherwise clear until a new file is chosen.
          if (initialData?.cv_type === "tailored" && isEdit) {
            setSelectedPrimaryId(null);
            setFormData((prev) => ({
              ...prev,
              cv_url: initialData.cv_url ?? prev.cv_url,
              cv_filename: initialData.cv_filename ?? prev.cv_filename,
              primary_cv_id: null,
              cv_type: "tailored",
            }));
          } else {
            setSelectedPrimaryId(null);
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
            cvMode === "tailored" && hadTailoredCvOnLoad && !cvPendingFile;
          if (leavingSavedTailored) {
            setSwitchToPrimaryConfirmOpen(true);
            return;
          }
          cvModeUserChosenRef.current = true;
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
          const restoreSavedTailoredForm = () => {
            if (isEdit && initialData?.cv_type === "tailored") {
              setFormData((prev) => ({
                ...prev,
                cv_url: initialData.cv_url ?? "",
                cv_filename: initialData.cv_filename ?? null,
                cv_type: "tailored",
                primary_cv_id: null,
              }));
            }
          };

          if (!file) {
            setCvPendingFile(null);
            setCvPendingDigesting(false);
            uploadedPendingFileRef.current = null;
            cvPendingSignatureRef.current = null;
            cvUploadIdempotencyKeyRef.current = null;
            restoreSavedTailoredForm();
            return;
          }

          cvModeUserChosenRef.current = true;
          const previousSignature = cvPendingSignatureRef.current;
          const previousCache = uploadedPendingFileRef.current;
          // Prefer form cv_type so a primary→tailored switch that kept primary
          // fields can restore mode + selection after a digest failure.
          const previousCvMode: ApplicationCvType =
            formData.cv_type === "primary" ? "primary" : cvMode;
          const previousSelectedPrimaryId = selectedPrimaryId;
          const previousFormCv = {
            cv_url: formData.cv_url,
            cv_filename: formData.cv_filename,
            cv_type: formData.cv_type,
            primary_cv_id: formData.primary_cv_id,
          };
          setCvPendingFile(file);
          setCvPendingDigesting(true);
          cvPendingSignatureRef.current = null;
          setSelectedPrimaryId(null);
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
            // Restore prior CV fields so Save cannot keep a stale URL under the
            // failed selection's filename (same restore as clear on edit).
            if (isEdit && initialData?.cv_type === "tailored") {
              restoreSavedTailoredForm();
              setCvMode("tailored");
              setSelectedPrimaryId(null);
            } else {
              setCvMode(previousCvMode);
              setSelectedPrimaryId(previousSelectedPrimaryId);
              setFormData((prev) => ({
                ...prev,
                ...previousFormCv,
              }));
            }
            // Let FileUpload surface the selection error (avoid duplicating in CvSourceField).
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
          cvModeUserChosenRef.current = true;
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
        slug={formData.slug}
        firstName={formData.first_name}
        lastName={formData.last_name}
        useOriginalCvFilename={formData.use_original_cv_filename ?? false}
        onUseOriginalCvFilenameChange={(useOriginal) => {
          setFormData((prev) => ({
            ...prev,
            use_original_cv_filename: useOriginal,
          }));
        }}
        uploading={submitPhase === "uploading"}
        preparing={cvPendingDigesting}
        disabled={submitPhase !== "idle"}
      />
    </>
  );

  const focusFirstGap = () => {
    const item = saveBlockers[0];
    if (!item) return;
    const needsLinkCustomize = item.name === "Your application link";
    if (needsLinkCustomize) setLinkCustomizeOpen(true);
    const target =
      item.name === "Company"
        ? { rowId: "application-row-company", inputId: "application-company" }
        : item.name === "Role"
          ? { rowId: "application-row-role", inputId: "application-role" }
          : needsLinkCustomize
            ? { rowId: "application-row-ending", inputId: "application-slug" }
            : item.name === "First name"
              ? {
                  rowId: "application-row-first_name",
                  inputId: "application-first-name",
                }
              : item.name === "Last name"
                ? {
                    rowId: "application-row-last_name",
                    inputId: "application-last-name",
                  }
                : item.stepId === "materials"
                  ? { rowId: "application-row-resume" }
                  : item.stepId === "video"
                    ? {
                        rowId: "application-row-pitch",
                        inputId: "application-video",
                      }
                    : {
                        rowId: "application-row-company",
                        inputId: "application-company",
                      };
    window.setTimeout(
      () => focusApplicationRow(target.rowId, target.inputId),
      needsLinkCustomize ? 50 : 0,
    );
  };

  const formActions = (
    <ApplicationFormActions
      loading={formBusy && submitIntent !== "publish"}
      loadingLabel={saveLoadingLabel}
      submitLabel={submitLabel}
      canSubmit={canSubmit}
      dimWhenBlocked
      disabledReason={disabledReason}
      onBlocked={focusFirstGap}
      showPublish={showPublish}
      canPublish={canPublish}
      publishLoading={formBusy && submitIntent === "publish"}
      onPublish={() => {
        void runSubmit("publish");
      }}
    />
  );

  const leaveSaveLabel = requiresPublishCompleteSet
    ? "Save application"
    : "Save Draft";
  const canSaveFromLeaveDialog =
    requiredReady &&
    leaveDialogSave !== "saving" &&
    (!isEdit || hasUnsavedEditChanges);
  const leaveDialogMessage = (
    <>
      <p>Leaving this page will discard unsaved changes. Are you sure?</p>
      {!hasCompany || !hasRole ? (
        <p>
          Add a company and role first if you want to save a draft before
          leaving.
        </p>
      ) : !requiredReady ? (
        <p>
          {requiresPublishCompleteSet
            ? "Finish the required fields first if you want to save before leaving."
            : "Wait until the share link is ready, then you can save a draft here."}
        </p>
      ) : null}
    </>
  );

  const handleLeaveDialogStay = () => {
    onCancelLeaveFromHook();
    setLeaveDialogSave("idle");
  };

  const handleLeaveDialogSave = () => {
    void runSubmit("save", { fromLeaveDialog: true });
  };

  const leaveDialog = (
    <ConfirmDialog
      open={leaveConfirmOpen}
      title="Want to leave this page?"
      message={leaveDialogMessage}
      confirmLabel="Yes, I'm sure"
      cancelLabel="No, stay on this page"
      midActionLabel={
        hasCompany && hasRole ? leaveSaveLabel : undefined
      }
      midActionLoading={leaveDialogSave === "saving"}
      midActionLoadingLabel="Saving…"
      midActionDisabled={!canSaveFromLeaveDialog}
      onMidAction={handleLeaveDialogSave}
      onConfirm={onConfirmLeave}
      onCancel={handleLeaveDialogStay}
    />
  );

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          event.target instanceof HTMLInputElement
        ) {
          event.preventDefault();
        }
      }}
    >
      <ApplicationFormSinglePageLayout
          title={isEdit ? "Edit application" : "New application"}
          description={
            isEdit
              ? "Update this role’s page and share link. Save when the required pieces are ready."
              : "This role gets its own page and share link. Save a draft when the required pieces are ready, then keep editing it."
          }
          cancelHref="/admin"
          actions={formActions}
          blockedReason={disabledReason}
          onBlockedReason={focusFirstGap}
          rows={(
            [
              {
                type: "section",
                id: "application-section-link",
                label: "Your link",
              },
              {
                type: "field",
                id: "application-row-company",
                label: "Company",
                labelFor: "application-company",
                align: "field",
                required: true,
                tip: hasCompany ? FIELD_READY_TIP : FIELD_IDLE_TIP,
                tipTone: hasCompany ? "ready" : "idle",
                children: (
                  <Input
                    id="application-company"
                    dense
                    value={formData.company}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    error={errors.company}
                    required
                    autoComplete="organization"
                  />
                ),
              },
              {
                type: "field",
                id: "application-row-role",
                label: "Role",
                labelFor: "application-role",
                align: "field",
                required: true,
                tip: hasRole ? FIELD_READY_TIP : FIELD_IDLE_TIP,
                tipTone: hasRole ? "ready" : "idle",
                children: (
                  <Input
                    id="application-role"
                    dense
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    error={errors.role}
                    required
                    autoComplete="organization-title"
                  />
                ),
              },
              {
                type: "field",
                id: "application-row-share",
                label: "Your application link",
                layout: "result",
                hint: linkCustomizeOpen
                  ? "The link you will send, built from the choices above."
                  : "The link you will send. It updates as you type company and role.",
                children: shareLinkControl,
              },
              ...(linkCustomizeOpen
                ? ([
                    {
                      type: "field",
                      id: "application-row-slug-order",
                      label: "How the link reads",
                      align: "field",
                      info: "Choose whether the company or the role comes first.",
                      tip: FIELD_READY_TIP,
                      tipTone: "ready",
                      className: "relative z-10",
                      children: (
                        <SlugOrderDropdown
                          id="application-slug-order"
                          fieldLabel="How the link reads"
                          value={slugSegmentOrder}
                          onChange={handleSlugSegmentOrderChange}
                        />
                      ),
                    },
                    {
                      type: "field",
                      id: "application-row-ending",
                      label: "Link ending",
                      labelFor: "application-slug",
                      align: "field",
                      info: "Pre-filled for you. Edit it if you like. Each ending must be unique.",
                      tip: slugReady ? FIELD_READY_TIP : FIELD_IDLE_TIP,
                      tipTone: slugReady ? "ready" : "idle",
                      children: linkEndingControl,
                    },
                  ] satisfies ApplicationFormPageRow[])
                : []),
              {
                type: "section",
                id: "application-section-about",
                label: "About you",
                description: (
                  <>
                    From your profile. First and last name are required to
                    publish. Choose what else recruiters see on this page.{" "}
                    <EditProfileLink />
                  </>
                ),
              },
              {
                type: "block",
                id: "application-row-about",
                children: candidateStep,
              },
              {
                type: "section",
                id: "application-section-resume",
                label: "Your Résumé",
                required: true,
              },
              {
                type: "block",
                id: "application-row-resume",
                children: materialsStep,
              },
              {
                type: "section",
                id: "application-section-pitch",
                label: "Your Pitch",
              },
              {
                type: "field",
                id: "application-row-pitch",
                label: "YouTube",
                labelFor: "application-video",
                align: "field",
                required: true,
                hint: "A YouTube video they can watch on the page.",
                tip: hasValidVideo ? FIELD_READY_TIP : FIELD_IDLE_TIP,
                tipTone: hasValidVideo ? "ready" : "idle",
                children: (
                  <YouTubeUrlInput
                    id="application-video"
                    hideLabel
                    dense
                    placeholder="https://www.youtube.com/watch?v=…"
                    value={formData.video_url}
                    onChange={(url) =>
                      setFormData((prev) => ({ ...prev, video_url: url }))
                    }
                    error={errors.video_url}
                    excludeApplicationId={slugExcludeApplicationId}
                    onStatusChange={setVideoStatus}
                  />
                ),
              },
            ] satisfies ApplicationFormPageRow[]
          )}
        />

      {leaveDialog}
    </form>
  );
}
