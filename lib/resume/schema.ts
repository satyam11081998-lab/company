/**
 * Resume Lab — the MECE one-page B-school resume schema.
 *
 * Modeled on the standard Indian B-school (IIM/IMI-style) one-pager: an academic
 * qualifications table, work experience, internships, positions of responsibility,
 * awards, certifications, extracurriculars, and additional info. Bullets are
 * single-line, quantified, strong-verb-first, and fill ~90-95% of the line. Stored
 * as JSONB so templates can evolve without a migration.
 *
 * This is original MECE content/structure built on standard, non-proprietary
 * resume conventions.
 */

export interface ResumeHeader {
  name: string;
  program: string;   // e.g. "PGDM 2025-27, IMI Delhi"
  email: string;
  phone: string;
  linkedin: string;
  extra: string;     // optional, e.g. "Male, 26 years"
}

export interface EducationRow {
  degree: string;       // "PGDM", "B.Tech (ECE)", "Class XII, CBSE"
  institute: string;
  board: string;        // university / board (optional)
  score: string;        // "84.40%" / "8.2 CGPA" / "Pursuing"
  year: string;
}

export interface ExperienceItem {
  org: string;
  role: string;
  dates: string;        // "Sep'21 - Sep'22"
  meta: string;         // e.g. "13 months" (optional)
  bullets: string[];
}

export interface PorItem {
  org: string;
  role: string;
  year: string;
  bullets: string[];    // optional impact lines
}

export interface CertItem {
  provider: string;
  title: string;
  year: string;
}

export interface ExtraGroup {
  category: string;     // "Sports", "Social Service", "Cultural", ...
  bullets: string[];
}

export interface ResumeData {
  header: ResumeHeader;
  education: EducationRow[];
  academicAchievements: string[];
  workExperience: ExperienceItem[];
  internships: ExperienceItem[];
  projects: ExperienceItem[];
  positionsOfResponsibility: PorItem[];
  awards: string[];
  certifications: CertItem[];
  extracurricular: ExtraGroup[];
  additionalInfo: {
    examScores: string[];
    skills: string[];
    hobbies: string[];
  };
}

/** Bullet line-fill rules — drive the per-bullet fill meter in the editor. */
export const BULLET = {
  /** Soft target: a strong one-line bullet fills roughly this much. */
  targetMin: 90,
  /** Above this, the bullet starts to risk wrapping to a 2nd line. */
  hardMax: 120,
  /** "Ideal" band shown green in the meter. */
  idealLow: 90,
  idealHigh: 115,
} as const;

export type FillState = 'short' | 'ideal' | 'over';

export function fillState(len: number): FillState {
  if (len > BULLET.hardMax) return 'over';
  if (len >= BULLET.idealLow) return 'ideal';
  return 'short';
}

export const EMPTY_RESUME: ResumeData = {
  header: { name: '', program: '', email: '', phone: '', linkedin: '', extra: '' },
  education: [
    { degree: 'PGDM / MBA', institute: '', board: '', score: 'Pursuing', year: '' },
    { degree: 'Graduation', institute: '', board: '', score: '', year: '' },
    { degree: 'Class XII', institute: '', board: '', score: '', year: '' },
    { degree: 'Class X', institute: '', board: '', score: '', year: '' },
  ],
  academicAchievements: [],
  workExperience: [],
  internships: [],
  projects: [],
  positionsOfResponsibility: [],
  awards: [],
  certifications: [],
  extracurricular: [],
  additionalInfo: { examScores: [], skills: [], hobbies: [] },
};

/** A lightly pre-filled starter so a new user sees the structure, not a blank page. */
export const STARTER_RESUME: ResumeData = {
  ...EMPTY_RESUME,
  header: { name: 'Your Name', program: 'PGDM 2025-27, Your B-School', email: 'you@email.com', phone: '+91 90000 00000', linkedin: 'linkedin.com/in/you', extra: '' },
  workExperience: [
    { org: 'Company Name', role: 'Role', dates: "Jul'22 - Jun'24", meta: '24 months', bullets: ['Drove a measurable outcome by doing X, delivering Y% improvement across Z'] },
  ],
  positionsOfResponsibility: [
    { org: 'B-School Club', role: 'Member, Consulting & Strategy Club', year: '2026', bullets: [] },
  ],
  additionalInfo: { examScores: ['CAT 2024 (XX percentile)'], skills: ['Excel', 'PowerPoint', 'SQL'], hobbies: ['Travel', 'Football'] },
};
