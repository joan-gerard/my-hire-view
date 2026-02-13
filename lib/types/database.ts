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
          user_id: string;
          is_active: boolean;
          first_name: string | null;
          last_name: string | null;
          location: string | null;
          portfolio_url: string | null;
          linkedin_url: string | null;
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
          user_id: string;
          is_active?: boolean;
          first_name?: string | null;
          last_name?: string | null;
          location?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
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
          user_id?: string;
          is_active?: boolean;
          first_name?: string | null;
          last_name?: string | null;
          location?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
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
