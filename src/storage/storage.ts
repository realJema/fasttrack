import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultChecklist } from '../constants/content';
import type { ChecklistItem, FastingSession, FastRecord, PlanSettings, UserProfile } from '../types';

const KEYS = {
  session: '@fasting/session',
  history: '@fasting/history',
  plan: '@fasting/plan',
  checklist: '@fasting/checklist',
  profile: '@fasting/profile',
} as const;

export const DEFAULT_PLAN: PlanSettings = {
  startAt: null,
  method: '16:8',
  constantly: true,
  daysAmount: 14,
  week: [true, false, true, false, true, false, false],
};

export const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Faster',
  goalWeightKg: null,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage failures should never crash the timer.
  }
}

export const storage = {
  loadSession: () => readJson<FastingSession | null>(KEYS.session, null),
  saveSession: (session: FastingSession | null) =>
    session === null ? AsyncStorage.removeItem(KEYS.session) : writeJson(KEYS.session, session),

  loadHistory: () => readJson<FastRecord[]>(KEYS.history, []),
  saveHistory: (history: FastRecord[]) => writeJson(KEYS.history, history),

  loadPlan: () => readJson<PlanSettings>(KEYS.plan, DEFAULT_PLAN),
  savePlan: (plan: PlanSettings) => writeJson(KEYS.plan, plan),

  loadChecklist: () => readJson<ChecklistItem[]>(KEYS.checklist, defaultChecklist()),
  saveChecklist: (items: ChecklistItem[]) => writeJson(KEYS.checklist, items),

  loadProfile: () => readJson<UserProfile>(KEYS.profile, DEFAULT_PROFILE),
  saveProfile: (profile: UserProfile) => writeJson(KEYS.profile, profile),

  async wipeAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
