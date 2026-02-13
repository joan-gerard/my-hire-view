'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import FileUpload from './FileUpload';
import YouTubeUrlInput from './YouTubeUrlInput';
import CandidateFieldsSection from './CandidateFieldsSection';
import type { CandidateFieldKey } from './CandidateFieldsSection';
import ApplicationFormActions from './ApplicationFormActions';
import { buildSlug } from '@/lib/utils/slug-generate';
import { getApplicationUrl } from '@/lib/utils/url';
import type { ApplicationFormData } from '@/lib/types/application';

function hasValue(v: string | null | undefined): boolean {
  return v != null && String(v).trim() !== '';
}

function defaultInclude(initialData?: Partial<ApplicationFormData>): Record<CandidateFieldKey, boolean> {
  return {
    first_name: hasValue(initialData?.first_name),
    last_name: hasValue(initialData?.last_name),
    location: hasValue(initialData?.location),
    portfolio_url: hasValue(initialData?.portfolio_url),
    linkedin_url: hasValue(initialData?.linkedin_url),
  };
}

interface ApplicationFormProps {
  initialData?: Partial<ApplicationFormData>;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  loading?: boolean;
}

export default function ApplicationForm({
  initialData,
  onSubmit,
  loading = false,
}: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    company: initialData?.company || '',
    role: initialData?.role || '',
    slug: initialData?.slug || '',
    cv_url: initialData?.cv_url || '',
    video_url: initialData?.video_url || '',
    description: initialData?.description || '',
    first_name: initialData?.first_name ?? '',
    last_name: initialData?.last_name ?? '',
    location: initialData?.location ?? '',
    portfolio_url: initialData?.portfolio_url ?? '',
    linkedin_url: initialData?.linkedin_url ?? '',
  });

  const [include, setInclude] = useState<Record<CandidateFieldKey, boolean>>(() =>
    defaultInclude(initialData)
  );

  const [slugNamePosition, setSlugNamePosition] = useState<'start' | 'end' | null>(
    initialData?.slugNamePosition ?? null
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
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
        slugNamePosition
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
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    const hasCv = cvPendingFile || (formData.cv_url && formData.cv_url.trim());
    if (!hasCv) newErrors.cv_url = 'CV file is required';
    if (!formData.video_url.trim()) newErrors.video_url = 'YouTube URL is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let cvUrl = formData.cv_url.trim();
    if (cvPendingFile) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', cvPendingFile);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      if (!response.ok) {
        const { error } = await response.json();
        setErrors({ cv_url: error || 'Upload failed' });
        return;
      }
      const { url } = await response.json();
      cvUrl = url;
    }

    const payload: ApplicationFormData = {
      ...formData,
      cv_url: cvUrl,
      first_name: include.first_name ? (formData.first_name?.trim() || null) : null,
      last_name: include.last_name ? (formData.last_name?.trim() || null) : null,
      location: include.location ? (formData.location?.trim() || null) : null,
      portfolio_url: include.portfolio_url ? (formData.portfolio_url?.trim() || null) : null,
      linkedin_url: include.linkedin_url ? (formData.linkedin_url?.trim() || null) : null,
      slugNamePosition,
    };
    await onSubmit(payload);
  };

  const candidateValues: Record<CandidateFieldKey, string> = {
    first_name: formData.first_name ?? '',
    last_name: formData.last_name ?? '',
    location: formData.location ?? '',
    portfolio_url: formData.portfolio_url ?? '',
    linkedin_url: formData.linkedin_url ?? '',
  };

  const handleCandidateValueChange = (field: CandidateFieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCandidateIncludeChange = (field: CandidateFieldKey, included: boolean) => {
    setInclude((prev) => ({ ...prev, [field]: included }));
  };

  const shareableUrl = formData.slug ? getApplicationUrl(formData.slug) : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CandidateFieldsSection
        values={candidateValues}
        include={include}
        onValueChange={handleCandidateValueChange}
        onIncludeChange={handleCandidateIncludeChange}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="Company Name *"
          value={formData.company}
          onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
          error={errors.company}
          required
        />
        <Input
          label="Role/Position *"
          value={formData.role}
          onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
          error={errors.role}
          required
        />
      </div>

      <fieldset className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
        <legend className="text-base font-semibold text-gray-900 px-1">
          Name in URL
        </legend>
        <p className="text-sm text-gray-600 mt-0.5 mb-3">
          Choose where your name appears in the shareable link (if at all).
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <label className="inline-flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="slugNamePosition"
              checked={slugNamePosition === null}
              onChange={() => setSlugNamePosition(null)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-base font-medium text-gray-900">None</span>
          </label>
          <label className="inline-flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="slugNamePosition"
              checked={slugNamePosition === 'start'}
              onChange={() => setSlugNamePosition('start')}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-base font-medium text-gray-900">At start</span>
            <span className="text-sm text-gray-500">(e.g. john-doe-company-role)</span>
          </label>
          <label className="inline-flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="slugNamePosition"
              checked={slugNamePosition === 'end'}
              onChange={() => setSlugNamePosition('end')}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-base font-medium text-gray-900">At end</span>
            <span className="text-sm text-gray-500">(e.g. company-role-john-doe)</span>
          </label>
        </div>
      </fieldset>
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
        This will be used in the URL: {shareableUrl || '...'}
      </p>

      <FileUpload
        value={formData.cv_url}
        pendingFile={cvPendingFile}
        onPendingFileChange={setCvPendingFile}
        error={errors.cv_url}
      />

      <YouTubeUrlInput
        value={formData.video_url}
        onChange={(url) => setFormData((prev) => ({ ...prev, video_url: url }))}
        error={errors.video_url}
      />

      <Textarea
        label="Description (Optional)"
        value={formData.description || ''}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
        rows={4}
        placeholder="Add any notes about this application..."
      />

      <ApplicationFormActions loading={loading} submitLabel="Save Application" />
    </form>
  );
}
