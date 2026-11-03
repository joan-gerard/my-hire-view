'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import { validateYouTubeUrl } from '@/lib/utils/youtube';

interface YouTubeUrlInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Row layouts supply their own label. */
  hideLabel?: boolean;
  placeholder?: string;
  /** Shorter top and bottom padding. */
  dense?: boolean;
}

export default function YouTubeUrlInput({
  id,
  value,
  onChange,
  error: externalError,
  hideLabel = false,
  placeholder = 'https://www.youtube.com/watch?v=... or youtube.com/shorts/...',
  dense = false,
}: YouTubeUrlInputProps) {
  const [localError, setLocalError] = useState<string | undefined>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);

    if (url && !validateYouTubeUrl(url)) {
      setLocalError('Please enter a valid YouTube URL');
    } else {
      setLocalError(undefined);
    }
  };

  return (
    <Input
      id={id}
      label={hideLabel ? undefined : "YouTube intro *"}
      dense={dense}
      type="url"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      error={externalError || localError}
    />
  );
}
