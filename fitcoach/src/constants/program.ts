/**
 * Programme d'entraînement pré-chargé (§7). Embarqué en TS pour bénéficier du typage.
 * Sert au seed SQLite et à l'écran Entraînement.
 */

export interface ProgramExercise {
  name: string;
  sets: number;
  reps: string;
  rest_sec: number;
  type?: 'compound';
  technique?: string;
}

export interface ProgramSession {
  id: 'lower_a' | 'upper_a' | 'lower_b' | 'upper_b';
  name: string;
  day: string;
  exercises: ProgramExercise[];
}

export interface Program {
  name: string;
  duration_weeks: number;
  sessions: ProgramSession[];
}

export const PROGRAM: Program = {
  name: 'Upper/Lower 4 jours - Prise de muscle',
  duration_weeks: 8,
  sessions: [
    {
      id: 'lower_a',
      name: 'Lower A - Quadriceps dominant',
      day: 'monday',
      exercises: [
        { name: 'Squat barre', sets: 4, reps: '6-8', rest_sec: 150, type: 'compound' },
        { name: 'Presse à cuisses', sets: 4, reps: '10', rest_sec: 120 },
        { name: 'Fentes marchées haltères', sets: 3, reps: '10/jambe', rest_sec: 90 },
        { name: 'Extension quadriceps', sets: 4, reps: '12', rest_sec: 60, technique: 'rest_pause_last_set' },
        { name: 'Leg curl allongé', sets: 4, reps: '10', rest_sec: 60 },
        { name: 'Mollets debout', sets: 5, reps: '12', rest_sec: 60 },
        { name: 'Gainage planche', sets: 3, reps: '45s', rest_sec: 45 },
      ],
    },
    {
      id: 'upper_a',
      name: 'Upper A - Push',
      day: 'tuesday',
      exercises: [
        { name: 'Développé couché barre', sets: 4, reps: '6-8', rest_sec: 120, type: 'compound' },
        { name: 'Développé militaire haltères', sets: 4, reps: '8', rest_sec: 120 },
        { name: 'Développé incliné haltères', sets: 3, reps: '10', rest_sec: 90 },
        { name: 'Élévations latérales', sets: 4, reps: '12', rest_sec: 60 },
        { name: 'Dips lestées', sets: 3, reps: 'max', rest_sec: 90 },
        { name: 'Extensions triceps corde', sets: 3, reps: '12', rest_sec: 60 },
        { name: 'Extensions triceps barre EZ', sets: 3, reps: '10', rest_sec: 60 },
      ],
    },
    {
      id: 'lower_b',
      name: 'Lower B - Chaîne postérieure',
      day: 'thursday',
      exercises: [
        { name: 'Soulevé de terre', sets: 4, reps: '5-6', rest_sec: 180, type: 'compound' },
        { name: 'Hip thrust barre', sets: 4, reps: '8', rest_sec: 120 },
        { name: 'SDT roumain haltères', sets: 3, reps: '10', rest_sec: 90 },
        { name: 'Presse cuisses pieds hauts', sets: 3, reps: '12', rest_sec: 90 },
        { name: 'Leg curl assis', sets: 4, reps: '12', rest_sec: 60 },
        { name: 'Mollets assis', sets: 4, reps: '15', rest_sec: 45 },
        { name: 'Abdos leg raise suspendu', sets: 3, reps: '12', rest_sec: 60 },
      ],
    },
    {
      id: 'upper_b',
      name: 'Upper B - Pull',
      day: 'saturday',
      exercises: [
        { name: 'Tractions pronation', sets: 4, reps: '6-8', rest_sec: 120, type: 'compound' },
        { name: 'Rowing barre pronation', sets: 4, reps: '8', rest_sec: 120 },
        { name: 'Tirage vertical neutre', sets: 3, reps: '10', rest_sec: 90 },
        { name: 'Rowing haltère unilatéral', sets: 3, reps: '10/bras', rest_sec: 90 },
        { name: 'Face pull poulie', sets: 4, reps: '15', rest_sec: 60 },
        { name: 'Curl barre EZ', sets: 4, reps: '8-10', rest_sec: 60 },
        { name: 'Curl marteau haltères', sets: 3, reps: '12', rest_sec: 60 },
      ],
    },
  ],
};

/** Les 4 exos principaux suivis dans le bilan hebdo (§2, §8). */
export const KEY_LIFTS = ['Squat barre', 'Soulevé de terre', 'Développé couché barre', 'Tractions pronation'];
