import PracticeTile from '@/components/landing/practice-tile';
import { HOME_PHOTOS } from '@/lib/home/photos';

/**
 * India hero's practice tile — the shared components/landing/practice-tile.tsx
 * with India's topic photos (a restaurant counter for the case, a glass of
 * chai for the tea guesstimate).
 */
const TOPICS = {
  case: { photo: HOME_PHOTOS.qsr, kicker: 'The case', title: 'A quick-service chain’s profit fell 18%' },
  guess: { photo: HOME_PHOTOS.chai, kicker: 'The guesstimate', title: 'Cups of tea sold in a city of 10M' },
};

export default function HeroTile({
  caseId,
  guesstimateId,
  className = '',
}: {
  caseId: string | null;
  guesstimateId: string | null;
  className?: string;
}) {
  return <PracticeTile caseId={caseId} guesstimateId={guesstimateId} topics={TOPICS} className={`rounded-[14px] ${className}`} />;
}
