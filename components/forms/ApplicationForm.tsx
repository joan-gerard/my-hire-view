'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import FileUpload from './FileUpload';
import YouTubeUrlInput from './YouTubeUrlInput';
import { generateSlug } from '@/lib/utils/slug-generate';
import { getApplicationUrl } from '@/lib/utils/url';
import type { ApplicationFormData } from '@/lib/types/application';

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
  });

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

    // Validation
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!formData.cv_url.trim()) {
      newErrors.cv_url = 'CV file is required';
    }

    if (!formData.video_url.trim()) {
      newErrors.video_url = 'YouTube URL is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit(formData);
  };

  const shareableUrl = formData.slug ? getApplicationUrl(formData.slug) : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          Save Application
        </Button>
      </div>
    </form>
  );
}
