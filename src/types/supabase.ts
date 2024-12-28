export interface Database {
  public: {
    Tables: {
      time_slots: {
        Row: {
          id: string;
          host_id: string;
          discord_id: string;
          start_time: string;
          end_time: string;
          is_booked: boolean;
          booked_by?: string;
          booked_by_discord_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['time_slots']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['time_slots']['Insert']>;
      };
      reports: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
    };
    Views: {
      available_slots: {
        Row: {
          id: string;
          host_id: string;
          discord_id: string;
          start_time: string;
          end_time: string;
          created_at: string;
          host_username: string;
        };
      };
    };
  };
}