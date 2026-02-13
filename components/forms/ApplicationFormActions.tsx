'use client';

import Button from '@/components/ui/Button';

interface ApplicationFormActionsProps {
  loading?: boolean;
  submitLabel?: string;
}

export default function ApplicationFormActions({
  loading = false,
  submitLabel = 'Save Application',
}: ApplicationFormActionsProps) {
  return (
    <div className="flex justify-end gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={() => window.history.back()}
      >
        Cancel
      </Button>
      <Button type="submit" variant="primary" loading={loading}>
        {submitLabel}
      </Button>
    </div>
  );
}
