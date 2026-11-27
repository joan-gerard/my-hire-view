export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          slug: string;
          company: string;
          role: string;
          cv_url: string | null;
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
          email: string | null;
          phone: string | null;
          slug_segment_order: "company_role" | "role_company";
          cv_filename: string | null;
          use_original_cv_filename: boolean;
          show_profile_picture: boolean;
          cv_type: "primary" | "tailored";
          primary_cv_id: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          company: string;
          role: string;
          cv_url?: string | null;
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
          email?: string | null;
          phone?: string | null;
          slug_segment_order?: "company_role" | "role_company";
          cv_filename?: string | null;
          use_original_cv_filename?: boolean;
          show_profile_picture?: boolean;
          cv_type?: "primary" | "tailored";
          primary_cv_id?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          company?: string;
          role?: string;
          cv_url?: string | null;
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
          email?: string | null;
          phone?: string | null;
          slug_segment_order?: "company_role" | "role_company";
          cv_filename?: string | null;
          use_original_cv_filename?: boolean;
          show_profile_picture?: boolean;
          cv_type?: "primary" | "tailored";
          primary_cv_id?: string | null;
        };
      };
      primary_cvs: {
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
          contact_email: string | null;
          phone: string | null;
          default_show_email: boolean;
          default_show_phone: boolean;
          default_show_profile_picture: boolean;
          default_show_location: boolean;
          default_show_linkedin: boolean;
          default_show_portfolio: boolean;
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
          contact_email?: string | null;
          phone?: string | null;
          default_show_email?: boolean;
          default_show_phone?: boolean;
          default_show_profile_picture?: boolean;
          default_show_location?: boolean;
          default_show_linkedin?: boolean;
          default_show_portfolio?: boolean;
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
          contact_email?: string | null;
          phone?: string | null;
          default_show_email?: boolean;
          default_show_phone?: boolean;
          default_show_profile_picture?: boolean;
          default_show_location?: boolean;
          default_show_linkedin?: boolean;
          default_show_portfolio?: boolean;
        };
      };
    };
  };
}
