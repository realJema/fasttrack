import type { ChecklistItem } from '../types';

export interface FastingMethod {
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  fastHours: number;
  eatHours: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

export const METHODS: FastingMethod[] = [
  {
    name: '12:12',
    emoji: '🌱',
    tagline: 'Great first step',
    description:
      'Twelve hours of fasting and a twelve-hour eating window. Everyone burns some fat while sleeping — this simply extends that state a little.',
    fastHours: 12,
    eatHours: 12,
    difficulty: 'Easy',
  },
  {
    name: '14:10',
    emoji: '💪',
    tagline: ' Beginner friendly',
    description:
      'A gentle approach that often improves sleep and energy. Popular with people who want results without a big lifestyle change.',
    fastHours: 14,
    eatHours: 10,
    difficulty: 'Easy',
  },
  {
    name: '16:8',
    emoji: '🔥',
    tagline: 'The gold standard',
    description:
      'The most popular intermittent fasting method. Skip breakfast, eat between noon and 8 pm, and enjoy steady fat burning.',
    fastHours: 16,
    eatHours: 8,
    difficulty: 'Medium',
  },
  {
    name: '18:6',
    emoji: '⚡',
    tagline: 'Next level',
    description:
      'Pushes fat burning further by keeping insulin low for longer. Many people report sharp focus during the fasting window.',
    fastHours: 18,
    eatHours: 6,
    difficulty: 'Medium',
  },
  {
    name: '20:4',
    emoji: '🥑',
    tagline: 'The Warrior Diet',
    description:
      'A big fast with one hearty evening meal. Best once you are comfortable with 16–18 hour fasts.',
    fastHours: 20,
    eatHours: 4,
    difficulty: 'Advanced',
  },
  {
    name: '23:1',
    emoji: '🌙',
    tagline: 'OMAD — one meal a day',
    description:
      'Twenty-three hours fasting, one nutrient-dense meal. Effective, but only for experienced fasters.',
    fastHours: 23,
    eatHours: 1,
    difficulty: 'Advanced',
  },
];

export interface BodyPhase {
  hour: number;
  title: string;
  detail: string;
}

/** Rough, well-known metabolic milestones — informational only. */
export const BODY_PHASES: BodyPhase[] = [
  { hour: 0, title: 'Hydrating', detail: 'Your body is burning through its last easy energy' },
  { hour: 4, title: 'Fat burning', detail: 'Insulin is dropping and fat burning is ramping up' },
  { hour: 8, title: 'Fat burning', detail: 'Your body is running mostly on stored fat' },
  { hour: 12, title: 'Ketosis', detail: 'Ketones are rising — mind and body feel lighter' },
  { hour: 16, title: 'Autophagy', detail: 'Cellular cleanup is kicking into high gear' },
  { hour: 24, title: 'Deep autophagy', detail: 'Maximum cell renewal — stay hydrated' },
];

export function bodyPhaseAt(elapsedMs: number): BodyPhase {
  const hours = elapsedMs / 3600000;
  let phase = BODY_PHASES[0];
  for (const p of BODY_PHASES) {
    if (hours >= p.hour) phase = p;
  }
  return phase;
}

export const BEGINNER_TIPS: { emoji: string; text: string }[] = [
  { emoji: '💧', text: 'Hydrate with water before, during, and after the fast.' },
  { emoji: '🥨', text: 'Avoid processed and unhealthy foods before and after fasting.' },
  { emoji: '', text: 'Prepare healthy, fresh foods for your first meal after the fast.' },
];

export function defaultChecklist(): ChecklistItem[] {
  return [
    { id: 'tips', label: 'Read tips for beginners', done: false },
    { id: 'plan', label: 'Set up your fasting plan', done: false },
    { id: 'water', label: 'Keep a water bottle nearby', done: false },
    { id: 'first', label: 'Start your first fast', done: false },
  ];
}

export const MOODS: { value: 'great' | 'okay' | 'hard'; emoji: string; label: string }[] = [
  { value: 'great', emoji: '😎', label: 'Feeling great' },
  { value: 'okay', emoji: '🙂', label: 'Doing okay' },
  { value: 'hard', emoji: '😩', label: 'Kind of hard' },
];
