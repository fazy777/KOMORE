export type StudentArchetype = 'day_scholar' | 'hostel' | 'other';

export type TransportMode =
  | 'public_bus'
  | 'metro_train'
  | 'college_bus'
  | 'personal_vehicle'
  | 'walking_bicycle'
  | 'carpool';

export interface DayScholarDetails {
  commuteMinutesOneWay: number;
  morningCommuteWindow: string; // e.g. "07:30 - 08:30"
  eveningCommuteWindow: string; // e.g. "16:30 - 17:30"
  transportMode: TransportMode;
  canStudyDuringCommute: boolean;
}

export type DormEnvironment = 'quiet' | 'moderate' | 'lively' | 'library_only';

export interface HostelDetails {
  curfewTime?: string; // e.g. "21:30"
  diningMessHours: {
    breakfast: string; // e.g. "07:30 - 09:00"
    lunch: string; // e.g. "12:30 - 14:00"
    dinner: string; // e.g. "19:30 - 21:00"
  };
  dormEnvironment: DormEnvironment;
  roomSharingCount: number;
}

export type NoiseSensitivity = 'low' | 'moderate' | 'high';
export type PrimaryStudySpace =
  | 'bedroom'
  | 'campus_library'
  | 'hostel_study_room'
  | 'cafe'
  | 'commute';

export interface EnvironmentalRules {
  noiseSensitivity: NoiseSensitivity;
  preferredStudySpace: PrimaryStudySpace;
  allowCommuteStudy: boolean;
  distractingAppsWhitelist: string[];
  notes?: string;
}

export type FocusPreference = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'late_night';

export interface LifestyleBoundaries {
  wakeTime: string; // e.g. "07:00"
  sleepTime: string; // e.g. "23:00"
  maxContinuousStudyMinutes: number; // e.g. 50
  minimumBreakMinutes: number; // e.g. 10
  preferredStudyTime: FocusPreference;
  strictLockdownEnabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university?: string;
  archetype: StudentArchetype;
  archetypeCustomNotes?: string;
  dayScholarDetails?: DayScholarDetails;
  hostelDetails?: HostelDetails;
  environmentalRules: EnvironmentalRules;
  lifestyleBoundaries: LifestyleBoundaries;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}
