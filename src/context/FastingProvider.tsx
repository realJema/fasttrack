import * as Haptics from 'expo-haptics';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { defaultChecklist } from '../constants/content';
import { storage, DEFAULT_PLAN, DEFAULT_PROFILE } from '../storage/storage';
import type { ChecklistItem, FastingSession, FastRecord, PlanSettings, UserProfile } from '../types';
import { methodToMs, uid } from '../utils/time';

interface FastingContextValue {
  isReady: boolean;
  session: FastingSession | null;
  history: FastRecord[];
  plan: PlanSettings;
  checklist: ChecklistItem[];
  profile: UserProfile;

  /** Ticking timestamp, updated once per second while a fast is running. */
  now: number;
  /** Elapsed ms of the running fast (0 before it starts). */
  elapsedMs: number;
  /** 0..1 progress towards the target. */
  progress: number;
  isScheduled: boolean;
  isActive: boolean;
  isGoalReached: boolean;

  startFast: (method?: string, startAt?: number) => void;
  endFast: (reason: FastRecord['status']) => void;
  cancelScheduled: () => void;
  savePlan: (plan: PlanSettings) => Promise<void>;
  toggleChecklistItem: (id: string) => void;
  saveProfile: (profile: UserProfile) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const FastingContext = createContext<FastingContextValue | null>(null);

export function FastingProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<FastingSession | null>(null);
  const [history, setHistory] = useState<FastRecord[]>([]);
  const [plan, setPlan] = useState<PlanSettings>(DEFAULT_PLAN);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist());
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    (async () => {
      const [storedSession, storedHistory, storedPlan, storedChecklist, storedProfile] =
        await Promise.all([
          storage.loadSession(),
          storage.loadHistory(),
          storage.loadPlan(),
          storage.loadChecklist(),
          storage.loadProfile(),
        ]);
      if (!alive) return;
      setSession(storedSession);
      setHistory(storedHistory);
      setPlan(storedPlan);
      setChecklist(storedChecklist);
      setProfile(storedProfile);
      setIsReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);


  const isScheduled = !!session && session.startAt > now;
  const isActive = !!session && !isScheduled;
  const elapsedMs = isActive ? now - (session?.startAt ?? now) : 0;
  const targetMs = session?.targetMs ?? methodToMs(plan.method);
  const progress = Math.min(1, Math.max(0, elapsedMs / targetMs));
  const isGoalReached = isActive && elapsedMs >= targetMs;

  const startFast = useCallback(
    (method?: string, startAt?: number) => {
      const name = method ?? plan.method;
      const next: FastingSession = {
        id: uid(),
        startAt: startAt ?? Date.now(),
        targetMs: methodToMs(name),
        method: name,
      };
      setSession(next);
      void storage.saveSession(next);
      if (startAt == null || startAt <= Date.now()) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    [plan.method],
  );

  const endFast = useCallback(
    (reason: FastRecord['status']) => {
      if (!session) return;
      const current = session;
      const endedAt = Date.now();
      const record: FastRecord = {
        id: current.id,
        startAt: current.startAt,
        endedAt,
        durationMs: Math.max(0, endedAt - Math.max(current.startAt, 0)),
        targetMs: current.targetMs,
        method: current.method,
        status: reason === 'completed' && endedAt - current.startAt >= current.targetMs ? 'completed' : reason,
      };
      setHistory((prev) => {
        const next = [record, ...prev];
        void storage.saveHistory(next);
        return next;
      });
      setSession(null);
      void storage.saveSession(null);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    },
    [session],
  );

  // Tick once per second while a session exists, and auto-complete the fast the
  // moment its target duration is reached so the timer stops and the result is
  // persisted to history (on-device) without requiring a manual tap.
  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => {
      const ts = Date.now();
      setNow(ts);
      if (ts - session.startAt < session.targetMs) return;
      endFast('completed');
    }, 1000);
    return () => clearInterval(id);
  }, [session, endFast]);

  const cancelScheduled = useCallback(() => {
    setSession(null);
    void storage.saveSession(null);
  }, []);

  const savePlan = useCallback(async (next: PlanSettings) => {
    setPlan(next);
    await storage.savePlan(next);
  }, []);

  const toggleChecklistItem = useCallback((id: string) => {
    setChecklist((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
      void storage.saveChecklist(next);
      return next;
    });
  }, []);

  const saveProfile = useCallback(async (next: UserProfile) => {
    setProfile(next);
    await storage.saveProfile(next);
  }, []);

  const resetAllData = useCallback(async () => {
    await storage.wipeAll();
    setSession(null);
    setHistory([]);
    setPlan(DEFAULT_PLAN);
    setChecklist(defaultChecklist());
    setProfile(DEFAULT_PROFILE);
  }, []);

  const value = useMemo<FastingContextValue>(
    () => ({
      isReady,
      session,
      history,
      plan,
      checklist,
      profile,
      now,
      elapsedMs,
      progress,
      isScheduled,
      isActive,
      isGoalReached,
      startFast,
      endFast,
      cancelScheduled,
      savePlan,
      toggleChecklistItem,
      saveProfile,
      resetAllData,
    }),
    [
      isReady,
      session,
      history,
      plan,
      checklist,
      profile,
      now,
      elapsedMs,
      progress,
      isScheduled,
      isActive,
      isGoalReached,
      startFast,
      endFast,
      cancelScheduled,
      savePlan,
      toggleChecklistItem,
      saveProfile,
      resetAllData,
    ],
  );

  return <FastingContext.Provider value={value}>{children}</FastingContext.Provider>;
}

export function useFasting(): FastingContextValue {
  const ctx = useContext(FastingContext);
  if (!ctx) throw new Error('useFasting must be used inside FastingProvider');
  return ctx;
}
