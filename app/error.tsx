'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
        <p className="mt-4 text-gray-600">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="secondary"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
