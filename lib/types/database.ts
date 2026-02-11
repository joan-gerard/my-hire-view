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
        };
      };
    };
  };
}
