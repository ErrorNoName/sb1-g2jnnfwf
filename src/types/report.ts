export interface Report {
  id: string;
  username: string;
  proof_url: string;
  rules: number[];
  warnings: number;
  kicks: number;
  mutes: number;
  reported_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  username: string;
  proof: File;
  rules: number[];
  warnings: number;
  kicks: number;
  mutes: number;
}