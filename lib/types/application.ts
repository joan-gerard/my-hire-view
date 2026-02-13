export interface Application {
  id: string;
  slug: string;
  company: string;
  role: string;
  cv_url: string;
  video_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
  user_id: string;
  is_active: boolean;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
}

export interface ApplicationFormData {
  company: string;
  role: string;
  slug: string;
  cv_url: string;
  video_url: string;
  description?: string;
}

export interface ApplicationCreateInput {
  company: string;
  role: string;
  slug: string;
  cv_url: string;
  video_url: string;
  description?: string;
}

export interface ApplicationUpdateInput {
  company?: string;
  role?: string;
  slug?: string;
  cv_url?: string;
  video_url?: string;
  description?: string;
  is_active?: boolean;
}
