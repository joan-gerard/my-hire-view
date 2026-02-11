'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import { validateYouTubeUrl } from '@/lib/utils/youtube';

interface YouTubeUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function YouTubeUrlInput({
  value,
  onChange,
  error: externalError,
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
      label="YouTube Video URL"
      type="url"
      value={value}
      onChange={handleChange}
      placeholder="https://www.youtube.com/watch?v=..."
      error={externalError || localError}
    />
  );
}
