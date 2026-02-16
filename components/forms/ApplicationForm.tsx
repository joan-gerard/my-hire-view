"use client";

import Input from "@/components/ui/Input";
import type { ApplicationFormData } from "@/lib/types/application";
import { buildSlug } from "@/lib/utils/slug-generate";
import { getApplicationUrl } from "@/lib/utils/url";
import { useEffect, useState } from "react";
import ApplicationFormActions from "./ApplicationFormActions";
import type { CandidateFieldKey } from "./CandidateFieldsSection";
import CandidateFieldsSection from "./CandidateFieldsSection";
import CvDownloadFilenameField from "./CvDownloadFilenameField";
import FileUpload from "./FileUpload";
import NameInUrlField from "./NameInUrlField";
import ProfilePictureField from "./ProfilePictureField";
import YouTubeUrlInput from "./YouTubeUrlInput";

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

interface ApplicationFormProps {
  initialData?: ApplicationFormInitialData;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  loading?: boolean;
  /** When provided, passed to FileUpload so user can re-check CV existence (edit page). */
  onRetryCvCheck?: () => Promise<void>;
  /** Profile picture URL; when set, Yes/No toggle is enabled; when null, toggle is disabled with No selected. */
  profilePictureUrl?: string | null;
}

export default function ApplicationForm({
  initialData,
  onSubmit,
  loading = false,
  onRetryCvCheck,
  profilePictureUrl,
}: ApplicationFormProps) {
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
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  /** File selected but not yet uploaded (upload happens on submit). */
  const [cvPendingFile, setCvPendingFile] = useState<File | null>(null);

  useEffect(() => {
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
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
    if (!formData.company.trim())
      newErrors.company = "Company name is required";
    if (!formData.role.trim()) newErrors.role = "Role is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    const hasCv = cvPendingFile || (formData.cv_url && formData.cv_url.trim());
    if (!hasCv) newErrors.cv_url = "CV file is required";
    if (!formData.video_url.trim())
      newErrors.video_url = "YouTube URL is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let cvUrl = formData.cv_url.trim();
    if (cvPendingFile) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", cvPendingFile);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      if (!response.ok) {
        const { error } = await response.json();
        setErrors({ cv_url: error || "Upload failed" });
        return;
      }
      const { url } = await response.json();
      cvUrl = url;
    }

    const includePicture = hasProfilePicture && showProfilePicture;

    const payload: ApplicationFormData = {
      ...formData,
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
    };
    await onSubmit(payload);
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

      <NameInUrlField value={slugNamePosition} onChange={setSlugNamePosition} />

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
      <p className="text-xs text-gray-500">
        This will be used in the URL: {shareableUrl || "..."}
      </p>

      <FileUpload
        value={formData.cv_url}
        pendingFile={cvPendingFile}
        onPendingFileChange={(file) => {
          setCvPendingFile(file);
          if (file)
            setFormData((prev) => ({ ...prev, cv_filename: file.name }));
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
