/**
 * Profile-owned master CV (library entry). Max 5 per user.
 * See docs/CV_REUSE_AND_STORAGE.md
 */
export interface MasterCv {
  id: string;
  user_id: string;
  url: string;
  filename: string;
  label: string | null;
  created_at: string;
}

export interface MasterCvCreateResult {
  data: MasterCv;
}

export const MASTER_CV_MAX_PER_USER = 5;
