'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { Profile } from '@/lib/types/profile';

interface ProfileFormProps {
  initialData: Profile | null;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name ?? '',
    last_name: initialData?.last_name ?? '',
    location: initialData?.location ?? '',
    portfolio_url: initialData?.portfolio_url ?? '',
    linkedin_url: initialData?.linkedin_url ?? '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name.trim() || null,
          last_name: formData.last_name.trim() || null,
          location: formData.location.trim() || null,
          portfolio_url: formData.portfolio_url.trim() || null,
          linkedin_url: formData.linkedin_url.trim() || null,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? 'Failed to save profile');
        return;
      }
      router.refresh();
    } catch {
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          type="text"
          value={formData.first_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, first_name: e.target.value }))
          }
          placeholder="Your first name"
        />
        <Input
          label="Last name"
          type="text"
          value={formData.last_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, last_name: e.target.value }))
          }
          placeholder="Your last name"
        />
      </div>
      <Input
        label="Location"
        type="text"
        value={formData.location}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, location: e.target.value }))
        }
        placeholder="e.g. London, UK"
      />
      <Input
        label="Portfolio URL"
        type="url"
        value={formData.portfolio_url}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, portfolio_url: e.target.value }))
        }
        placeholder="https://..."
      />
      <Input
        label="LinkedIn URL"
        type="url"
        value={formData.linkedin_url}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
        }
        placeholder="https://linkedin.com/in/..."
      />
      <Button type="submit" variant="primary" loading={loading}>
        Save profile
      </Button>
    </form>
  );
}
