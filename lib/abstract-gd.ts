/**
 * Abstract GD — the taught METHOD ("open your mind") + a curated TOPIC BANK.
 *
 * Abstract GD topics have no factual answer; they test lateral + critical
 * thinking. The primer below is the repeatable method that lets a candidate
 * crack ANY abstract topic; the topic bank is practice fuel. Individual topic
 * briefs are generated on demand by the backend (POST /news/abstract-brief).
 */

export interface AbstractBrief {
  topic: string;
  interpretations: string[];
  idea_pool: string[];
  lenses: string[];
  balanced_for: string[];
  balanced_against: string[];
  analogies: string[];
  sample_structure: string[];
  pitfalls: string[];
  opening_lines: string[];
  closing_lines: string[];
}

export interface PrimerStep {
  title: string;
  body: string;
  drill: string; // a quick exercise to build the muscle
}

/** The method. Learn + drill these and any abstract topic becomes crackable. */
export const ABSTRACT_PRIMER: PrimerStep[] = [
  {
    title: '1. Decode the phrase — find many doors',
    body:
      'An abstract prompt is deliberately open. Before saying anything, list 2-3 genuinely different readings: the literal one, a metaphorical one, and a contrarian one. "Black or White" can be about morality vs grey areas, about binary thinking vs nuance, about choice itself, or about design/contrast. Whoever frames the interpretation often leads the GD.',
    drill: 'Take any noun. In 30 seconds, write 3 different things it could "really" be about.',
  },
  {
    title: '2. Flood, then filter (divergent → convergent)',
    body:
      'Brainstorm a wide pool of ideas FAST without judging them — business, society, psychology, history, ethics, the personal. Quantity first. Then prioritise the 3-4 strongest and sequence them. This "inverted funnel" is exactly what panels watch for: can you generate, then organise?',
    drill: 'Set a 60-second timer. Dump 8 angles on a topic. Then star the best 3.',
  },
  {
    title: '3. Apply lenses for instant structure',
    body:
      'When you feel stuck, run the topic through fixed lenses: Stakeholders (who is affected?), Time (past / present / future), Scale (individual / organisation / society), Opposing values (freedom vs safety, etc.), and PESTLE (political, economic, social, tech, legal, environmental). Each lens hands you a ready, structured point.',
    drill: 'Pick one topic and force one sentence from each of the 5 lenses.',
  },
  {
    title: '4. Anchor with examples & analogies',
    body:
      'Abstract talk sounds vague. Pull it down to earth with a crisp analogy, a short story, a historical event, or a current business example. "Necessity is the mother of invention" → UPI born from demonetisation pressure. Concreteness is what makes you memorable.',
    drill: 'For any abstract claim, attach one real example within 10 seconds.',
  },
  {
    title: '5. Open with a frame, hold the balance',
    body:
      'Start by defining/ reframing the topic, then give BOTH sides before any view. Abstract GDs reward balance and maturity, not a hot take. Steelman the opposite of whatever you lean toward — it shows range.',
    drill: 'State a position, then argue the strongest version of its opposite.',
  },
  {
    title: '6. GD craft — enter, include, synthesise',
    body:
      'Enter early with a frame or after two speakers with a structure ("we are conflating two questions here…"). Bring quieter members in — it signals leadership. Never get aggressive. Close by synthesising the threads and naming the central tension rather than just repeating points.',
    drill: 'Practise one "let me build on that and add a new angle…" transition line.',
  },
];

/** A GD topic category with its curated topics. */
export interface TopicCategory {
  category: string;
  blurb: string;
  topics: string[];
}

/**
 * Curated GD topic bank — Abstract AND every domain (news topics live separately
 * in the live GD Briefs feed). Drill the method on any of these, or type your own.
 */
export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    category: 'Abstract — classics',
    blurb: 'Pure abstract prompts with no factual answer. Best for training raw lateral thinking.',
    topics: [
      'Black or White', 'The glass is half full', 'Zero', 'A circle has no end', 'Red',
      'Change is the only constant', 'If I were invisible', 'Mountains or oceans',
      'Success vs significance', '0 and 1', 'The road not taken', 'Time is money',
      'Silence', 'The pen is mightier than the sword', 'Necessity is the mother of invention',
      'Less is more', 'Yesterday, today, tomorrow', 'Where there is a will, there is a way',
      'Light and shadow', 'Twenty rupees',
    ],
  },
  {
    category: 'Abstract — business & leadership',
    blurb: 'Abstract prompts framed around organisations and leadership — common in B-school GDs.',
    topics: [
      'Trust is invisible until it breaks',
      'Leaders are made in storms, not sunshine',
      "The strongest voice isn't always the loudest",
      'Every organization has an unwritten constitution',
      'Culture eats strategy for breakfast',
      'The cost of being right',
      'The weight of expectations',
      'The art of letting go',
      'Success has many parents, failure has none',
      'A chain is only as strong as its weakest link',
      'The comfort zone is the biggest competitor',
      'Change begins with one conversation',
      'Every wall is also a door',
      'Listening is the new leadership',
      'The best decisions begin with questions',
    ],
  },
  {
    category: 'HR & people',
    blurb: 'Workplace, talent and people-management debates — frequent in HR/PGDM GDs.',
    topics: [
      'Should AI replace recruiters in the hiring process?',
      'Work from home vs work from office: which is more sustainable?',
      'Is a four-day work week the future of employment?',
      'Skills vs degrees: what matters more in today\'s job market?',
      'Should companies prioritize cultural fit over technical skills?',
      'The impact of social media on professional careers',
      'Mental health at work: employer responsibility or personal responsibility?',
      'Is job hopping beneficial for career growth?',
      'DEI: business necessity or corporate trend?',
      'Performance-based incentives vs fixed salary structures',
      'Ethical use of AI in human resource management',
      'Should employees have the right to disconnect after office hours?',
      'Upskilling and reskilling: employee or employer responsibility?',
      'Quiet quitting: employee disengagement or poor organizational culture?',
      'Campus placements vs off-campus hiring',
      'Employee monitoring software: productivity or invasion of privacy?',
      'Gen Z in the workplace: changing culture for the better?',
      'The importance of emotional intelligence in leadership',
    ],
  },
  {
    category: 'Business & economy',
    blurb: 'Strategy, markets and the Indian economy.',
    topics: [
      'Is India ready to become a $5 trillion economy?',
      'Startups vs profitability: is the funding winter a correction?',
      'Should the government privatise public sector banks?',
      'Is GST helping or hurting small businesses?',
      'Are unicorns overvalued?',
      'Make in India: progress or slogan?',
      'Should India fully open up to Chinese investment?',
      'Is the gig economy good for the Indian workforce?',
      'Free market vs regulation: where should the line be?',
      'Is jobless growth India\'s biggest economic risk?',
    ],
  },
  {
    category: 'Technology & AI',
    blurb: 'Tech, AI and their impact on business and society.',
    topics: [
      'Will AI create more jobs than it destroys?',
      'Should AI be regulated like a public utility?',
      'Is data the new oil — and who should own it?',
      'Are we too dependent on technology?',
      'Should social media platforms be liable for content?',
      'Is digital privacy a lost cause in India?',
      'Will automation widen the rich-poor gap?',
      'Should coding be a mandatory school subject?',
    ],
  },
  {
    category: 'Social & ethics',
    blurb: 'Society, ethics and policy debates with two defensible sides.',
    topics: [
      'Is reservation still relevant in modern India?',
      'Should voting be made mandatory?',
      'Individual freedom vs collective good',
      'Is social media doing more harm than good to democracy?',
      'Should euthanasia be legalised in India?',
      'Is censorship ever justified?',
      'Does money buy happiness?',
      'Is capitalism compatible with sustainability?',
    ],
  },
];

/** Flat list of every curated topic (handy for search / random pick). */
export const ALL_TOPICS: string[] = TOPIC_CATEGORIES.flatMap((c) => c.topics);
