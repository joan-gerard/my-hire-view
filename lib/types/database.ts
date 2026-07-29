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
          created_at: string;
          updated_at: string;
          view_count: number;
          download_count: number;
          /** Last time the page was viewed by a non-owner (null if never viewed). */
          last_viewed_at: string | null;
          user_id: string;
          status: "active" | "draft" | "archived";
          archived_at: string | null;
          first_name: string | null;
          last_name: string | null;
          location: string | null;
          portfolio_url: string | null;
          linkedin_url: string | null;
          include_name_in_slug: "start" | "end" | null;
          cv_filename: string | null;
          use_original_cv_filename: boolean;
          show_profile_picture: boolean;
          cv_kind: "master" | "custom";
          master_cv_id: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          company: string;
          role: string;
          cv_url: string;
          video_url: string;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          download_count?: number;
          last_viewed_at?: string | null;
          user_id: string;
          status?: "active" | "draft" | "archived";
          archived_at?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          location?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
          include_name_in_slug?: "start" | "end" | null;
          cv_filename?: string | null;
          use_original_cv_filename?: boolean;
          show_profile_picture?: boolean;
          cv_kind?: "master" | "custom";
          master_cv_id?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          company?: string;
          role?: string;
          cv_url?: string;
          video_url?: string;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
          download_count?: number;
          last_viewed_at?: string | null;
          user_id?: string;
          status?: "active" | "draft" | "archived";
          archived_at?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          location?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
          include_name_in_slug?: "start" | "end" | null;
          cv_filename?: string | null;
          use_original_cv_filename?: boolean;
          show_profile_picture?: boolean;
          cv_kind?: "master" | "custom";
          master_cv_id?: string | null;
        };
      };
      master_cvs: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          filename: string;
          label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          filename: string;
          label?: string | null;
          created_at?: string;
        };
        Update: {
          url?: string;
          filename?: string;
          label?: string | null;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          public_id: string;
          first_name: string | null;
          last_name: string | null;
          location: string | null;
          portfolio_url: string | null;
          linkedin_url: string | null;
          updated_at: string;
          profile_picture_url: string | null;
        };
        Insert: {
          user_id: string;
          public_id: string;
          first_name?: string | null;
          last_name?: string | null;
          location?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
          updated_at?: string;
          profile_picture_url?: string | null;
        };
        Update: {
          public_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          location?: string | null;
          portfolio_url?: string | null;
          linkedin_url?: string | null;
          updated_at?: string;
          profile_picture_url?: string | null;
        };
      };
    };
  };
}
