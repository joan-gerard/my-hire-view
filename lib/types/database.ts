export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
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
          download_count: number;
          /** Last time the page was viewed by a non-owner (null if never viewed). */
          last_viewed_at: string | null;
          user_id: string;
          is_active: boolean;
          first_name: string | null;
          last_name: string | null;
          location: string | null;
          portfolio_url: string | null;
          linkedin_url: string | null;
          include_name_in_slug: 'start' | 'end' | null;
        };
        Insert: {
          id?: string;
          slug: string;
          company: string;
          role: string;
          cv_url: string;
          video_url: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          download_count?: number;
          last_viewed_at?: string | null;
          user_id: string;
          is_active?: boolean;
          first_name?: string | null;
          last_name?: string | null;
          location?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
          include_name_in_slug?: 'start' | 'end' | null;
        };
        Update: {
          id?: string;
          slug?: string;
          company?: string;
          role?: string;
          cv_url?: string;
          video_url?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          download_count?: number;
          last_viewed_at?: string | null;
          user_id?: string;
          is_active?: boolean;
          first_name?: string | null;
          last_name?: string | null;
          location?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
          include_name_in_slug?: 'start' | 'end' | null;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          location: string | null;
          portfolio_url: string | null;
          linkedin_url: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          first_name?: string | null;
          last_name?: string | null;
          location?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
          updated_at?: string;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          location?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
