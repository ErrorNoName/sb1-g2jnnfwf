export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  isSelected: boolean;
}

export interface WeeklyAvailability {
  [day: string]: TimeSlot[];
}

export interface AvailabilityData {
  discordId: string;
  slots: TimeSlot[];
}