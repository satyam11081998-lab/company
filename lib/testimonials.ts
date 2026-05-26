/**
 * Testimonials displayed on /landing and /home.
 * To add a new testimonial: append to TESTIMONIALS array.
 * Admin UI for managing these = Phase 6.
 */

export interface Testimonial {
  id: string;
  name: string;
  school: string;        // e.g. "IIM Lucknow"
  placement: string;     // e.g. "Summer placed at Bain"
  quote: string;         // 2-4 lines
  avatar_url: string | null;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Aarav Mehta',
    school: 'IIM Lucknow',
    placement: 'Summer placed at Bain',
    quote: "MECE caught flaws in my hypothesis-driven thinking that no one else had pointed out. Used it daily for three weeks before placement season.",
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AaravMehta',
  },
  {
    id: 't2',
    name: 'Ananya Reddy',
    school: 'IIM Shillong',
    placement: 'Summer placed at McKinsey',
    quote: "The 6-dimension scoring is brutally honest — better than mock interviews where peers go easy on you. Pushed me to write tighter syntheses.",
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaReddy',
  },
  {
    id: 't3',
    name: 'Karan Desai',
    school: 'SP Jain',
    placement: 'Final placed at HUL ABM',
    quote: "GD briefs alone saved me hours of news scanning. Smart angles section taught me how to think about consumer goods cases differently.",
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KaranDesai',
  },
  {
    id: 't4',
    name: 'Sneha Mukherjee',
    school: 'IIM Calcutta',
    placement: 'Summer placed at BCG',
    quote: "Career ladder is oddly motivating. Climbing from Day-0 Dreamer to MECE Believer felt like leveling up a game I actually wanted to play.",
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaMukherjee',
  },
  {
    id: 't5',
    name: 'Vihaan Kapoor',
    school: 'FMS Delhi',
    placement: 'Final placed at Goldman Sachs',
    quote: "The structured feedback on my profitability cases was the difference between 'I sort of understand frameworks' and 'I can deploy them under pressure.'",
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VihaanKapoor',
  },
  {
    id: 't6',
    name: 'Divya Menon',
    school: 'XLRI',
    placement: 'Summer placed at Accenture Strategy',
    quote: "I used MECE during commute. Three submissions a day, every day, for a month. The dimension radar showed exactly where I was leaking points.",
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DivyaMenon',
  },
  {
    id: 't7',
    name: 'Arjun Banerjee',
    school: 'IIM Indore',
    placement: 'Summer placed at Kearney',
    quote: "Daily GD briefs gave me an unfair edge in group discussions. Showed up to GDs with actual data points while others gave generic takes.",
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunBanerjee',
  },
  {
    id: 't8',
    name: 'Rhea Joshi',
    school: 'NMIMS Mumbai',
    placement: 'Final placed at P&G',
    quote: "The leaderboard kept me practicing on bad days. Watching ranks shift in real-time made case prep feel less lonely than studying alone at 1am.",
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RheaJoshi',
  },
];
