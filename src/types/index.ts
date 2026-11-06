export type FastStatus = 'completed' | 'stopped';

export interface FastingSession {
  id: string;
  /** Unix ms. Can be in the future for a scheduled fast. */
  startAt: number;
  targetMs: number;
  method: string;
}

export interface FastRecord {
  id: string;
  startAt: number;
  endedAt: number;
  durationMs: number;
  targetMs: number;
  method: string;
  status: FastStatus;
}

export interface PlanSettings {
  /** Custom start time (unix ms), or null to start now. */
  startAt: number | null;
  /** Fasting method applied from the schedule (e.g. "16:8"). */
  method: string;
  /** True when the plan repeats on the weekly schedule forever. */
  constantly: boolean;
  /** Number of days when not constant. */
  daysAmount: number;
  /** Weekly schedule, index 0 = Monday. */
  week: boolean[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface CheckIn {
  id: string;
  at: number;
  mood: 'great' | 'okay' | 'hard';
  note?: string;
}

export interface UserProfile {
  displayName: string;
  goalWeightKg: number | null;
}
