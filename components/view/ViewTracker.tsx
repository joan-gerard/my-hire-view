'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  publicId: string;
  slug: string;
}

export default function ViewTracker({ publicId, slug }: ViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      const storageKey = `view_tracked_${publicId}_${slug}`;
      const alreadyTracked = sessionStorage.getItem(storageKey);

      if (alreadyTracked) {
        return;
      }

      try {
        const response = await fetch(
          `/api/applications/${publicId}/${slug}/view`,
          { method: 'POST' },
        );

        if (response.ok) {
          sessionStorage.setItem(storageKey, 'true');
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    trackView();
  }, [publicId, slug]);

  return null;
}
