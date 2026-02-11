'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      // Check if we've already tracked this view in this session
      const storageKey = `view_tracked_${slug}`;
      const alreadyTracked = sessionStorage.getItem(storageKey);

      if (alreadyTracked) {
        return;
      }

      try {
        const response = await fetch(`/api/applications/${slug}/view`, {
          method: 'POST',
        });

        if (response.ok) {
          sessionStorage.setItem(storageKey, 'true');
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    trackView();
  }, [slug]);

  return null;
}
