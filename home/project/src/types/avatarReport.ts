export interface AvatarCrashReport {
  id: string;
  avatar_id: string;
  reported_by: string;
  created_at: string;
}

export interface AvatarCrashReportFormData {
  avatar_id: string;
}