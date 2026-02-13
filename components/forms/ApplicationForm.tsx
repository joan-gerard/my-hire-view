'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import FileUpload from './FileUpload';
import YouTubeUrlInput from './YouTubeUrlInput';
import CandidateFieldsSection from './CandidateFieldsSection';
import type { CandidateFieldKey } from './CandidateFieldsSection';
import ApplicationFormActions from './ApplicationFormActions';
import { generateSlug } from '@/lib/utils/slug-generate';
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

  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (!slugManuallyEdited && formData.company && formData.role) {
      const autoSlug = generateSlug(formData.company, formData.role);
      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.company, formData.role, slugManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.cv_url.trim()) newErrors.cv_url = 'CV file is required';
    if (!formData.video_url.trim()) newErrors.video_url = 'YouTube URL is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: ApplicationFormData = {
      ...formData,
      first_name: include.first_name ? (formData.first_name?.trim() || null) : null,
      last_name: include.last_name ? (formData.last_name?.trim() || null) : null,
      location: include.location ? (formData.location?.trim() || null) : null,
      portfolio_url: include.portfolio_url ? (formData.portfolio_url?.trim() || null) : null,
      linkedin_url: include.linkedin_url ? (formData.linkedin_url?.trim() || null) : null,
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
        onChange={(url) => setFormData((prev) => ({ ...prev, cv_url: url }))}
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
