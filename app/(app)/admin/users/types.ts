/**
 * Shared shapes for the admin Users panel.
 *
 * Kept OUT of actions.ts on purpose: that file carries the 'use server'
 * directive, where every export is compiled into a server action. Types belong
 * in a plain module so the client component can import them with zero doubt
 * about what crosses the boundary.
 */

export interface UserDetail {
  id: string;
  name: string | null;
  fullName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  onboardedAt: string | null;
  referralSource: string | null;

  collegeName: string | null;
  collegeOther: string | null;
  collegeEmail: string | null;
  collegeEmailVerifiedAt: string | null;
  batchYear: number | null;
  placementFocus: string | null;

  linkedinUrl: string | null;
  showLinkedin: boolean | null;
  linkedinFollowClaimedAt: string | null;

  weeklyHoursTarget: number | null;
  goalText: string | null;

  tier: string;
  subStartedAt: string | null;
  subExpiresAt: string | null;
  isAdmin: boolean;
  isDemo: boolean;

  points: number;
  streak: number;
  streakLastDate: string | null;
  submissionCount: number;
  avgScore: number | null;
  bestScore: number | null;
  lastActiveAt: string | null;

  payments: Array<{
    id: string; tier: string; amountPaise: number; status: string;
    createdAt: string; paidAt: string | null; paymentId: string | null;
  }>;
  couponsUsed: Array<{
    id: string; code: string; tier: string; period: string;
    paidPaise: number; discountPaise: number; createdAt: string;
  }>;
  sessions: Array<{
    id: string; ip: string | null; city: string | null; region: string | null;
    country: string | null; userAgent: string | null; deviceLabel: string | null;
    createdAt: string; lastSeenAt: string; revokedAt: string | null;
  }>;
  recentSubmissions: Array<{
    id: string; caseTitle: string; caseType: string | null;
    score: number | null; createdAt: string;
  }>;
}
