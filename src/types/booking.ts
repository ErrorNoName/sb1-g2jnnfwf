export interface TimeSlot {
  id: string;
  host_profile_id: string;
  guest_profile_id?: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  discord_id: string;
  guest_discord_id?: string;
  host?: {
    id: string;
    username: string;
    discord_id: string;
  };
}

export interface Profile {
  id: string;
  username: string;
  discord_id?: string;
}