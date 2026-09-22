/**
 * Topic Radar — the GD topics that actually come up in placement and SIP
 * processes, each tracked across a month of news.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * /gd-briefs lists today's headlines. Headlines are not GD topics: a panel asks
 * a *proposition* people can argue about with a stake in the answer, and the
 * biggest news story of the week is usually a poor one. This module holds the
 * propositions themselves, with the month of reporting that feeds each one.
 *
 * It mirrors `lib/abstract-gd.ts`: curated content lives here as typed data, the
 * page renders it, and the backend can later fill or refresh `dossier` without
 * the UI changing shape. Anything the reader sees is written for the reader —
 * none of the internal selection vocabulary appears in any string here.
 */

import type { CheatDomainId } from '@/lib/cheat-domains';

/* ───────────────────────── types ───────────────────────── */

/** One dated thing that moved the argument. `note` says what it DID, not just that it happened. */
export interface TrailEntry {
  /** display date, e.g. "22 Sep" or "Jun 2025" */
  when: string;
  /** ISO-ish sort key, newest first */
  sort: string;
  /** reader-facing label for the row */
  label:
    | 'How it started'
    | 'The rule'
    | 'Objections'
    | 'New numbers'
    | 'Position taken'
    | 'Question opened'
    | 'Question answered'
    | 'Coming up';
  /** kept in view even when older than the 30-day window, because the argument needs it */
  anchor?: boolean;
  /** dated in the future */
  ahead?: boolean;
  note: string;
  /** the citable facts this entry put on the table */
  adds?: string;
  source: string;
}

/** How safe a figure is to say out loud. Phrased for the reader, not for us. */
export type Trust = 'safe' | 'single' | 'estimate';

export const TRUST_COPY: Record<Trust, { label: string; hint: string }> = {
  safe:     { label: 'Safe to quote',  hint: 'Reported by more than one newsroom.' },
  single:   { label: 'One report',     hint: 'Only one newsroom has carried this — say so if you use it.' },
  estimate: { label: 'Name the source', hint: "Someone's own estimate, not a measured figure. Attribute it." },
};

export interface GdFact {
  figure: string;
  what: string;
  trust: Trust;
  source: string;
  /** ready-made sentence for the cheat sheet, with attribution already in it */
  quote: string;
}

export interface GdPosition {
  who: string;
  attrib: string;
  argument: string;
  weak: string;
}

export interface GdFramework {
  name: string;
  idea: string;
  applied: string;
  say: string;
}

export interface GdLine {
  when: string;
  say: string;
  why: string;
  trap?: boolean;
}

export interface GdQuiz {
  q: string;
  options: string[];
  right: number;
  why: string;
}

export interface GdStakeholder {
  who: string;
  badge?: string;
  want: string;
  lever: string;
  side?: 'gain' | 'cost' | 'call';
}

/** Where a topic is in its life. Decides what a panel is most likely to ask today. */
export type Phase = 'announced' | 'contested' | 'clarifying' | 'deciding' | 'aftermath';

export const PHASES: { id: Phase; label: string; asks: string }[] = [
  { id: 'announced',  label: 'Just announced', asks: 'What happened, and what do you make of it?' },
  { id: 'contested',  label: 'Objections in',  asks: 'Whose side are you on?' },
  { id: 'clarifying', label: 'Facts firming up', asks: 'Are the objections still valid, now that we know more?' },
  { id: 'deciding',   label: 'Decision due',   asks: 'Should this happen at all?' },
  { id: 'aftermath',  label: 'Playing out',    asks: 'Did it work? What does the data show?' },
];

export interface GdDossier {
  /** the two or three numbers the whole topic hangs on */
  hook: { value: string; label: string }[];
  hookCaption: string;
  /** the sixty-second read */
  read: string;
  tension: string;
  framings: string[];

  phase: Phase;
  phaseNote: string;
  /** what moved since a reader's last visit */
  changed: { tag: 'Answered' | 'New rule' | 'New front' | 'Reversal'; text: string }[];
  trail: TrailEntry[];
  openQuestions: { q: string; answered?: string }[];
  silent: string[];
  bridges: { slug: string; title: string; line: string }[];

  facts: GdFact[];
  missing: string[];

  stakeholders: GdStakeholder[];
  chain: { step: string; text: string }[];
  positions: GdPosition[];
  frameworks: GdFramework[];
  precedents: string[];

  lines: GdLine[];
  structure: string[];
  pi: { profile: string; ask: string }[];

  quiz: GdQuiz[];
  glossary: { term: string; def: string }[];
  rehearse: string;
}

export interface GdTopic {
  slug: string;
  /** stated as a question someone can disagree with */
  proposition: string;
  standfirst: string;
  domains: CheatDomainId[];
  /** true = moving in the news now; false = comes round every season */
  live: boolean;
  /** one human sentence: why a reader should care that it is on the list */
  whyHere: string;
  /** which recruiters are most likely to put it in front of you */
  askedBy: string;
  updates: number;
  updated: string;
  dossier?: GdDossier;
}

/* ───────────────────────── the board ───────────────────────── */

const UPI_MDR: GdTopic = {
  slug: 'upi-merchant-fee',
  proposition: 'Should UPI payments carry a merchant fee?',
  standfirst:
    'India built the world’s largest real-time payments system on the promise that it costs nothing to accept. On 15 October part of that promise ends. Somebody has always been paying — the question is who should.',
  domains: ['finance', 'operations', 'economy', 'technology'],
  live: true,
  whyHere:
    'Everyone in the room has paid by UPI this week, both sides have named people arguing on the record, and it changes on 15 October — inside your interview season.',
  askedBy: 'BFSI · fintech · consulting · retail',
  updates: 6,
  updated: '22 Sep 2026',
  dossier: {
    hook: [
      { value: '0.4%', label: 'the new fee' },
      { value: '~0.5%', label: 'a petrol pump’s margin' },
    ],
    hookCaption: 'Those two numbers sitting next to each other are the whole discussion.',
    read:
      'From 15 October, NPCI’s framework puts a 0.4% merchant discount rate on UPI payments above ₹2,000 at large merchants, capped at ₹300 on transactions of ₹75,000 and above, with a flat ₹5 instead of the percentage in thin-margin categories such as fuel. Merchants receiving up to ₹1 lakh a month keep zero MDR, and person-to-person transfers stay free at any amount. The case for it is that free infrastructure is not free: somebody funds the uptime, the fraud systems and the security, and so far that has been banks and the exchequer. The case against is being made by the people who will pay — petrol dealers, who say they work on roughly half a per cent, plan to stop accepting UPI above ₹2,000 from 16 October, and the Retailers Association of India says acceptance should be incentivised, not taxed. The finance minister says MDR is neither a tax nor a cess. So the real question is not whether UPI is free. It is who has been paying for it, and whether moving that bill to the merchant is the cheapest way to keep the system alive.',
    tension:
      'A payment system can be free to use, free to accept, or financially self-sustaining. It cannot be all three. India has spent six years pretending otherwise, and the bill has been sitting with banks and the taxpayer.',
    framings: [
      '“Should UPI remain free? Take a position.” — the straight opinion GD.',
      '“Who should pay for public digital infrastructure — users, merchants, banks or the taxpayer?” — the version a consulting panel asks, and the better discussion.',
      '“Is zero-MDR a subsidy or a right?” — the abstract cut, where sentiment beats most candidates.',
    ],

    phase: 'clarifying',
    phaseNote:
      'Your SIP interviews fall between this phase and the decision on 15 October. Prepare the “are the objections still valid” answer — it is the one where anybody who read only the first week of coverage will be visibly a week out of date.',
    changed: [
      {
        tag: 'Answered',
        text: 'The gap this brief told you to point out has been filled. Until today nobody had published what share of UPI merchant volume sits above ₹2,000. NPCI has now put transactions at or below ₹2,000 at more than 96% of merchant volume. Drop the old line. The new one is stronger: the fee touches under 4% of volume — and that 4% is growing.',
      },
      {
        tag: 'New rule',
        text: '“Small merchant” finally has a number: anyone receiving up to ₹1 lakh a month through UPI pays no MDR. Six days ago this was the biggest unanswered question in the coverage; it is now the sharpest line in the framework.',
      },
      {
        tag: 'New front',
        text: 'Tax has entered the argument. 18% GST applies to the MDR fee itself — not to your payment — with collections estimated at about ₹5,184 crore a year. That gives the “this is not a tax” position a much harder question to answer, and almost nobody in your room will know it yet.',
      },
    ],
    trail: [
      {
        when: '22 Sep', sort: '2026-09-22', label: 'New numbers',
        note: 'NPCI and government data reframe the scale of the policy — and open a tax question nobody had asked.',
        adds: 'More than 96% of UPI merchant volume is at or below ₹2,000 and stays free · small merchant = up to ₹1 lakh a month received via UPI · 18% GST on the fee, about ₹5,184 crore a year · share of higher-value transactions up from 15.1% in FY23 to 20.1% in the June quarter of FY27.',
        source: 'Business Today, 22 Sep 2026',
      },
      {
        when: '~20 Sep', sort: '2026-09-20', label: 'Position taken',
        note: 'The government briefs that the 0.4% will have “limited impact” — the first defence that argues from scale rather than principle, and the precursor to the 96% figure.',
        source: 'Trade press summary, ~20 Sep 2026',
      },
      {
        when: '19 Sep', sort: '2026-09-19', label: 'The rule',
        note: 'The legal press settles the consumer question for good: UPI stays free for users, and the fee applies only to select merchant payments above ₹2,000. This is the line that kills the most common wrong argument in the room.',
        source: 'SCC Online, 19 Sep 2026',
      },
      {
        when: '17–21 Sep', sort: '2026-09-21', label: 'Objections',
        note: 'The objection becomes organised. Fuel dealers move from complaint to a dated threat, two national trade bodies put positions on record, and the payment industry lines up on the other side. This is the moment it became a real discussion — before it, there was only one side.',
        adds: 'Petrol margin about 0.5% · claimed loss ₹590 a day, roughly ₹17,700 a month per pump · refusal of UPI above ₹2,000 announced for 16 October · pumps already exempt from the fee on card payments.',
        source: 'Medianama, Sep 2026 — MP Petroleum Dealers Association, Retailers Association of India, Clothing Manufacturers Association of India; PhonePe, Paytm and MobiKwik in support; the finance minister: neither a tax nor a cess',
      },
      {
        when: '16 Sep', sort: '2026-09-16', label: 'Question opened',
        note: 'The business press starts asking who counts as small — “run a small shop? how to check whether this applies to you”. The question stayed open for six days and was answered on the 22nd.',
        source: 'Business Standard, 16 Sep 2026',
      },
      {
        when: '16 Sep', sort: '2026-09-16', label: 'How it started',
        note: 'NPCI publishes the FAQs. The topic exists from this moment; everything above is a response to it.',
        adds: '0.4% above ₹2,000 at large merchants · ₹300 cap above ₹75,000 · concessional flat ₹5 in specified categories · effective 15 October 2026 · person-to-person payments free at any amount.',
        source: 'NPCI FAQs via SCC Online, 16 Sep 2026',
      },
      {
        when: 'Jun 2025', sort: '2025-06-01', label: 'Position taken', anchor: true,
        note: 'The finance ministry dismisses reports of a fee on UPI as false and baseless. Anyone arguing this is a reversal starts here; anyone defending the framework answers that NPCI’s fee is not a government levy. You cannot hold either position without knowing this exists.',
        source: 'Finance ministry statement, June 2025, widely reported',
      },
      {
        when: 'Mar 2025', sort: '2025-03-26', label: 'Position taken', anchor: true,
        note: 'Praveen Khandelwal — BJP MP and Secretary General of CAIT — asks the government to exempt small merchants and consumers and charge large ones a nominal fee. Eighteen months later that is almost exactly the framework NPCI adopted. Pointing this out is the most senior-sounding observation available on this topic.',
        adds: 'About 60 million merchants accept digital payments in India, roughly 90% of them small, with turnover at or below ₹20 lakh a year (Payments Council of India, cited March 2025).',
        source: 'The Tribune, 26 Mar 2025',
      },
      {
        when: 'Jan 2020', sort: '2020-01-01', label: 'How it started', anchor: true,
        note: 'Zero MDR on RuPay and UPI begins, announced by the same finance minister now defending a merchant fee. The whole topic is the unwinding of this decision, and dating it correctly separates a prepared candidate from a well-read one.',
        source: 'Announced Dec 2019, effective 1 Jan 2020',
      },
      {
        when: '15–16 Oct', sort: '2026-10-15', label: 'Coming up', ahead: true,
        note: 'The framework takes effect, and the fuel dealers’ refusal is due to begin the next day. Two dated, checkable events inside your interview season — if you interview after the 16th, know whether the refusal actually happened.',
        source: 'Scheduled',
      },
    ],
    openQuestions: [
      {
        q: 'What share of UPI merchant volume sits above ₹2,000?',
        answered:
          'Under 4% by volume — NPCI puts transactions at or below ₹2,000 at more than 96%. But the share of higher-value transactions has gone from 15.1% in FY23 to 20.1% in the June quarter of FY27, so the base this is calibrated to is shrinking. Both numbers came from the same report; using them together is the strongest single move on this topic.',
      },
      { q: 'How much does the fee actually raise? There is a GST estimate of about ₹5,184 crore a year, which implies a pool, but no published figure for the pool itself. Do not back-solve it out loud unless you are confident.' },
      { q: 'Does the government’s digital-payments incentive spending shrink now that the ecosystem has a revenue line? This is the fiscal half of the story and no one has reported it.' },
      { q: 'Will the flat-fee carve-out extend beyond fuel to pharmacy, grocery and travel? The first extension sets the precedent for how big this eventually is.' },
    ],
    silent: [
      'The acquirer banks. They collect the fee and carry the acceptance cost, and not one has said anything on the record. The party that gains most is silent, which is itself worth pointing out.',
      'The RBI. NPCI operates under its oversight and it has not commented. Whether that is endorsement or distance is genuinely unclear — say that rather than assuming.',
      'Consumer bodies. Everyone is arguing on behalf of consumers; no consumer organisation has published a position. If the room keeps saying “consumers will suffer”, this is the observation that stops it.',
      'Any independent economist. So far it is industry bodies against the framework’s authors, with nobody neutral having modelled it — which is exactly why the numbers are contested.',
    ],
    bridges: [
      {
        slug: 'gst-small-business',
        title: 'GST 2.0 — has simplification reached the small business?',
        line: 'The 18% GST on the fee lands the same month the GST Council meets on process reform. Say: “we are simplifying GST for small business in one room and adding a taxable service to their payment costs in another.”',
      },
      {
        slug: 'quick-commerce-kirana',
        title: 'Ten-minute delivery versus the kirana',
        line: 'Both turn on thin-margin retail and the cost of acceptance. Say: “the ₹1 lakh a month line decides which side of the quick-commerce fight a shop is on, because it decides what its payments cost.”',
      },
      {
        slug: 'ai-entry-level-jobs',
        title: 'AI and the entry-level job',
        line: 'NPCI’s stated purpose includes funding fraud and cybersecurity systems, which are increasingly AI. Say: “the 0.4% is partly the country deciding to pay for AI fraud detection through the merchant rather than the taxpayer.”',
      },
    ],

    facts: [
      { figure: '0.4%', what: 'The fee on merchant UPI payments above ₹2,000 at large merchants', trust: 'safe', source: 'Reported widely, Sep 2026', quote: 'From 15 October 2026, NPCI’s framework applies a 0.4% merchant discount rate on UPI payments above ₹2,000 at large merchants.' },
      { figure: '₹2,000', what: 'The threshold above which the fee applies', trust: 'safe', source: 'Reported widely, Sep 2026', quote: 'The UPI merchant fee applies only to transactions above ₹2,000.' },
      { figure: '15 Oct 2026', what: 'The day the framework takes effect', trust: 'safe', source: 'Reported widely, Sep 2026', quote: 'The NPCI UPI MDR framework takes effect on 15 October 2026.' },
      { figure: '>96%', what: 'Share of UPI merchant transaction volume at or below ₹2,000 — unaffected', trust: 'safe', source: 'Business Today, 22 Sep 2026', quote: 'More than 96% of UPI merchant transaction volume is at or below ₹2,000 and carries no fee (NPCI data, reported 22 September 2026).' },
      { figure: '₹1 lakh/month', what: 'Merchants receiving up to this through UPI pay no fee', trust: 'single', source: 'Business Today, 22 Sep 2026', quote: 'Merchants receiving up to ₹1 lakh a month through UPI are not liable for the merchant fee (reported 22 September 2026).' },
      { figure: '18% GST', what: 'Applies to the fee itself, not to the payment. About ₹5,184 crore a year estimated', trust: 'single', source: 'Business Today, 22 Sep 2026', quote: '18% GST applies to the UPI merchant fee itself — not to the transaction value — with collections estimated at about ₹5,184 crore a year (reported 22 September 2026).' },
      { figure: '15.1% → 20.1%', what: 'Share of higher-value transactions, FY23 to the June quarter of FY27 — the exempt base is shrinking', trust: 'single', source: 'Business Today, 22 Sep 2026', quote: 'The share of higher-value UPI transactions rose from 15.1% in FY23 to 20.1% in the June quarter of FY27 (reported 22 September 2026).' },
      { figure: '₹300', what: 'Cap on the fee per transaction, for payments of ₹75,000 and above', trust: 'single', source: 'Sep 2026', quote: 'The UPI merchant fee is capped at ₹300 per transaction for payments of ₹75,000 and above.' },
      { figure: '₹5 flat', what: 'Charged instead of the percentage in thin-margin categories such as fuel', trust: 'single', source: 'Medianama, Sep 2026', quote: 'Thin-margin categories such as fuel face a flat ₹5 charge rather than 0.4% on UPI payments above ₹2,000.' },
      { figure: 'Zero', what: 'Fee on person-to-person transfers, at any amount', trust: 'safe', source: 'Reported widely, Sep 2026', quote: 'Person-to-person UPI transfers remain free at any amount.' },
      { figure: '~0.5%', what: 'Petrol pump operating margin, as stated by the dealers’ association', trust: 'estimate', source: 'MP Petroleum Dealers Association, via Medianama', quote: 'The Madhya Pradesh Petroleum Dealers Association says petrol pumps work on margins of roughly 0.5%.' },
      { figure: '₹17,700/mo', what: 'Loss per pump the dealers’ association estimates, from about ₹590 a day', trust: 'estimate', source: 'Ajay Singh, MP Petroleum Dealers Association', quote: 'The MP Petroleum Dealers Association estimates a loss of about ₹590 a day, roughly ₹17,700 a month, per pump — an association estimate, not a measured figure.' },
      { figure: '60 million', what: 'Merchants accepting digital payments in India, about 90% of them small', trust: 'estimate', source: 'Payments Council of India, cited Mar 2025', quote: 'The Payments Council of India puts the number of merchants accepting digital payments at about 60 million, roughly 90% of them small (cited March 2025).' },
    ],
    missing: [
      'NPCI’s own circular. Everything here is reporting about the framework rather than the document. If a panellist asks for the exact eligibility wording, say you do not have it.',
      'The size of the fee pool. There is a GST estimate but no published revenue figure. Do not construct one from UPI volume — you will be out by an order of magnitude and it will show.',
      'Anything on how the fee is split between the acquiring bank, the issuing bank and the network. Nobody has reported it.',
    ],

    stakeholders: [
      { who: 'Fuel retailers', badge: 'worst hit', side: 'cost', want: 'Roughly half a per cent of margin, a near-universal ticket above ₹2,000, and an existing exemption on cards that makes the UPI charge look arbitrary. Hence the flat ₹5 — and hence the threat to refuse.', lever: 'Refusal. They are the one category customers cannot easily walk away from.' },
      { who: 'Large organised retail', side: 'cost', want: 'Pays on every basket above ₹2,000, in the season when baskets are largest. Big enough to absorb it, and big enough that 0.4% is a real line in the P&L.', lever: 'Voice. The Retailers Association is the loudest organised objector.' },
      { who: 'Banks and payment apps', side: 'gain', want: 'The first genuine revenue line on merchant UPI after years of carrying the cost. PhonePe, Paytm and MobiKwik support the framework, which tells you where the economics sit.', lever: 'They run the rails. The implication that service quality tracks funding is unstated and real.' },
      { who: 'NPCI', badge: 'decides', side: 'call', want: 'A financially self-sustaining system that does not price out the small merchant — which is why the line is drawn at ₹2,000, at large merchants, with person-to-person untouched.', lever: 'It sets the rules. Every carve-out it grants invites the next request.' },
      { who: 'The exchequer', side: 'gain', want: 'Has been part-funding acceptance through incentive spending, and now collects 18% GST on the fee besides. The half of this story that gets almost no airtime.', lever: 'The budget line. Watch whether incentive spending shrinks next year.' },
      { who: 'You, at the counter', want: 'Nominally unaffected — customers are not charged. The exposure is indirect: a merchant who refuses UPI, steers you to cash, or quietly prices the 0.4% into the sticker.', lever: 'None, which is exactly why it is worth arguing about.' },
    ],
    chain: [
      { step: 'First', text: 'Large merchants pay 0.4% on payments above ₹2,000 from 15 October.' },
      { step: 'Second', text: 'Payment values bunch just under ₹2,000 — split bills, two taps, or a nudge to cash. Any bright line gets gamed, and this one is trivially easy to game.' },
      { step: 'Second', text: 'The ₹1 lakh a month line becomes the most valuable boundary in Indian retail, and an incentive to look small on paper.' },
      { step: 'Third', text: 'Payment apps stop competing for users and start competing for high-value merchants, because that is where revenue now lives. Cashback economics change with it.' },
      { step: 'Third', text: 'If acceptance slips back toward cash at the margin, the loss is not merchant P&L — it is the tax trail and the formalisation that zero-MDR was buying. That is the real price, and it is fiscal.' },
    ],
    positions: [
      {
        who: 'The payments industry: free infrastructure is not free',
        attrib: 'NPCI, with PhonePe, Paytm and MobiKwik in support',
        argument: 'Uptime, fraud systems, cybersecurity and capacity for the world’s largest real-time payments network all cost money, and for six years the people paying have been banks, apps and the taxpayer. Charging 0.4% only to large merchants, only above ₹2,000, with small merchants and all person-to-person payments exempt, is close to the narrowest cut anyone could design — and it leaves more than 96% of merchant volume untouched.',
        weak: 'It still does not say what the framework raises or what the shortfall actually is, and the exempt 96% is shrinking on its own numbers — from 15.1% to 20.1% of transactions being higher-value in four years. “Sustainability” without a figure is a position, not a case.',
      },
      {
        who: 'The finance minister: this is not a tax',
        attrib: 'Nirmala Sitharaman',
        argument: 'The fee is neither a tax nor a cess. Nothing accrues to government; it funds the rails. The 2025 assurance was that the government would not levy a charge on UPI, and it has not — a network operator setting a merchant fee is a different thing, and conflating the two is sloppy.',
        weak: '18% GST applies to the fee, with collections estimated at about ₹5,184 crore a year. Something does accrue to government. A merchant ₹17,700 a month worse off will not feel the distinction either, and the line between a levy and a framework is thinner than the phrasing suggests.',
      },
      {
        who: 'Fuel dealers: 0.4% of a 0.5% margin is most of the business',
        attrib: 'Ajay Singh, MP Petroleum Dealers Association',
        argument: 'A percentage fee on a business that keeps half a per cent is not a cost of acceptance, it is a claim on the margin itself. Pumps are already exempt from the fee on cards — so the same sale is free on one rail and charged on another, and the cheaper rail is the one being penalised. Refusing UPI above ₹2,000 is the only lever a dealer has.',
        weak: 'The flat ₹5 exists precisely for this, and ₹5 on a ₹2,000 fill is a quarter of a per cent, not 0.4%. The ₹17,700 figure is also the association’s own estimate of its own loss, which is the weakest kind of number in any argument.',
      },
      {
        who: 'Organised retail: you do not tax the behaviour you spent a decade building',
        attrib: 'Kumar Rajagopalan, Retailers Association of India',
        argument: 'Acceptance is a habit and habits are fragile. Merchants will now think twice between cash and UPI, and that hesitation is exactly what six years of policy was designed to remove. Acceptance should be incentivised, not taxed — the cost of the rails should not fall on the party whose participation the whole system depends on.',
        weak: 'Merchants accept cards at higher fees and have for decades, because acceptance earns them sales. If 0.4% genuinely reverses adoption, that implies UPI acceptance was never worth its cost to merchants — a stronger claim than the argument needs.',
      },
      {
        who: 'The fiscal view: the alternative was never free either',
        attrib: 'The argument nobody in the room will make — make it',
        argument: 'Zero MDR did not remove the cost, it moved it to the budget through incentive spending and to banks through absorbed losses. The honest question is which funding model buys more: merchant-funded rails, or taxpayer-funded acceptance that keeps more of the economy on a digital tax trail. Framed that way, 0.4% on 4% of volume may be cheap.',
        weak: 'It needs numbers that are not public — the incentive outlay, the shortfall, the size of the fee pool. Without them it is a well-shaped argument resting on nothing, which is fair for an opponent to point out.',
      },
    ],
    frameworks: [
      {
        name: 'Who bears the cost on a two-sided platform',
        idea: 'A payment network has two sides that need each other — payers and merchants — and its costs must come from one of four parties: the customer, the merchant, the banks, or the state. Pricing one side at zero does not remove the cost; it relocates it.',
        applied: 'Card networks solved this with interchange, paid by the merchant, and acceptance still grew for forty years. UPI chose zero on both sides and put the bill with banks and the exchequer, which is why it grew faster and why it was never self-sustaining. The 0.4% is India choosing, late, which side pays. Seen that way, the ₹2,000 threshold and the ₹1 lakh exemption read as a deliberate attempt to charge only the side that can recover the cost in sales.',
        say: 'Every payment network recovers its cost from one of four pockets: the customer, the merchant, the bank, or the taxpayer. UPI used the last two for six years. This is not a new charge — it is the bill moving pockets, and the only real question is which pocket buys the most digital adoption per rupee.',
      },
      {
        name: 'Percentage fees versus flat fees on thin margins',
        idea: 'A percentage fee scales with the value of the sale; a flat fee scales with the number of sales. Which is fair depends entirely on whether the merchant’s margin is a percentage of value or a fixed amount per sale.',
        applied: 'Fuel is the clearest case in the Indian economy: value per sale is high, margin per sale is thin and roughly fixed, so a percentage fee eats the margin while a flat fee does not. That is why fuel is carved out at ₹5 — and why the dealers’ objection survives the carve-out only if ₹5 is still large against margin per sale. This is the one place in the discussion where doing the arithmetic out loud wins the room.',
        say: 'The fight is not about 0.4%, it is about percentage versus flat. On a ₹2,000 fill, ₹5 is a quarter of a per cent and survivable; 0.4% on a half-per-cent margin is most of the business. The design question the framework got right for fuel is the one it has not answered for pharmacy, grocery or travel.',
      },
      {
        name: 'Bright lines get gamed — say so before it happens',
        idea: 'Any threshold in a rule creates bunching just below it, because complying is cheaper than paying. Treat it as a certainty to be priced in, not a surprise to be discovered.',
        applied: 'A ₹2,000 line on a payment that takes four seconds is the easiest threshold to game in the economy: split the bill, tap twice, pay part in cash. So the real yield is not 0.4% of merchant volume above ₹2,000 — it is 0.4% of whatever is left there after everyone adjusts. And since under 4% of volume is above the line to begin with, a small behavioural shift wipes out a large share of the base.',
        say: 'I would watch the transaction-size distribution in November. If there is a spike at ₹1,999, this has not raised revenue — it has taught the country to split bills, and added friction without funding anything.',
      },
    ],
    precedents: [
      'Card interchange, everywhere. Merchants have paid to accept cards for decades and acceptance still grew — the strongest single argument that 0.4% will not reverse adoption.',
      'The fuel exemption on cards. India has already decided once that thin-margin categories should not pay a percentage. That precedent is the dealers’ best weapon and the framework’s best defence, depending on who reaches for it first.',
      'Any turnover or audit threshold in Indian tax. Every one produced a cluster of firms sitting just underneath it. Expect the same at ₹2,000 and at ₹1 lakh a month.',
    ],
    lines: [
      {
        when: 'You speak first',
        say: '“I want to narrow this, because ‘should UPI be free’ hides the actual decision. It stays free for the person paying; from 15 October it costs a large merchant 0.4% above ₹2,000, and that is under 4% of merchant volume. So the question on the table is whether the merchant is the right party to fund the rails — and whether 4% of volume can pay for all of it.”',
        why: 'Narrows the motion, plants a date, a rate and a scale, and ends on a question the room has to answer. Three sentences, very high density.',
      },
      {
        when: 'You enter at minute four, into a crowded room',
        say: '“We have three people arguing about fairness. Can I offer a way to settle it? Every payment network recovers its cost from the customer, the merchant, the bank or the state. We have been using the last two. The only real question is which of the four buys the most digital adoption per rupee — and that reframes what everyone has just said.”',
        why: 'Gives the room a structure instead of a sixth opinion, and credits what came before. The highest-scoring move in a crowded GD.',
      },
      {
        when: 'The room has gone sentimental about Digital India',
        say: '“I think we are conflating two things. Nobody is charging the person paying, and person-to-person is untouched. What is being charged is a shop above ₹1 lakh a month, on a payment above ₹2,000. If we are going to argue, it should be about whether that shop passes the cost to us — not whether UPI is still free, because for us it is.”',
        why: 'Corrects a factual drift without calling anyone wrong. Being the person who keeps the discussion accurate reads as leadership.',
      },
      {
        when: 'Nobody has mentioned the tax angle — and they won’t have',
        say: '“One thing worth adding: 18% GST applies to this fee, with collections estimated at about ₹5,184 crore a year. So the claim that nothing accrues to government is not quite right, and that changes how we should read the ‘this is not a tax’ defence.”',
        why: 'Six days old, almost nobody will have it, and it lands on the weakest joint in the strongest position. This is the single highest-value sentence in the brief.',
      },
      {
        when: 'The traps — what most of the room will get wrong',
        say: '“The government is now taxing UPI, so ordinary people will have to pay to send money.”',
        why: 'Wrong three times over: it is NPCI’s framework, customers are not charged, and person-to-person is exempt at any amount. Three more traps: quoting ₹17,700 as fact rather than as the dealers’ own estimate; assuming small merchants pay; and arguing zero-MDR was costless when banks and the budget were funding it.',
        trap: true,
      },
    ],
    structure: [
      'The fact: 0.4% above ₹2,000, large merchants only, from 15 October; person-to-person and merchants under ₹1 lakh a month are exempt, which is over 96% of volume.',
      'The reframe: the cost always existed — it sat with banks and the exchequer. This moves the pocket, it does not create the bill.',
      'Your position, with its cost: “I would charge the large merchant, and I accept that it bites hardest in thin-margin categories, which is why the flat-fee design matters more than the rate.”',
      'The close: watch for bunching at ₹1,999 in November — if it appears, this has added friction without funding anything.',
    ],
    pi: [
      { profile: 'Engineering or analytics', ask: '“How would you detect people gaming the ₹2,000 threshold?” Transaction-size distribution, bunching just below the line, split payments at the same merchant within a short window.' },
      { profile: 'Finance or CA', ask: '“Who earns the fee, and how is it split?” Know that it is shared across the acquiring bank, the issuing bank and the network — and say plainly that the split under this framework has not been published.' },
      { profile: 'Marketing', ask: '“You run payments at a retail chain. Do you steer customers away from UPI?” They are testing whether you weigh 0.4% against conversion and basket size, not whether you know the rule.' },
    ],
    quiz: [
      {
        q: 'From 15 October, who actually pays the 0.4%?',
        options: [
          'The person making the payment',
          'Every merchant, on every UPI payment',
          'Large merchants, on merchant payments above ₹2,000',
          'Banks, through a levy collected by the government',
        ],
        right: 2,
        why: 'Customers are not charged, person-to-person is exempt at any amount, and merchants receiving up to ₹1 lakh a month pay nothing. Getting this wrong in the first minute is the most common way to lose credibility on this topic.',
      },
      {
        q: 'Why does fuel get a flat ₹5 instead of the percentage?',
        options: [
          'Because fuel is a government-controlled sector',
          'Because margin per sale is thin and roughly fixed, so a percentage fee would eat most of it',
          'Because fuel payments are usually below ₹2,000',
          'Because petrol pumps do not accept cards',
        ],
        right: 1,
        why: 'This is the percentage-versus-flat point, and it generalises to pharmacy, grocery and travel — which is why the next fight will be about extending the carve-out. Pumps do accept cards, and are already exempt from the fee on them, which is the dealers’ main argument.',
      },
      {
        q: 'NPCI says more than 96% of merchant volume is unaffected. What is the sharpest reply to that?',
        options: [
          'It is not true',
          'The 96% is by volume, and the share of higher-value payments has risen from 15.1% to 20.1% in four years — so the exempt base is shrinking',
          '96% is not a large enough majority',
          'Consumers will still be charged',
        ],
        right: 1,
        why: 'Both figures came from the same report. Using them together — accepting the number and then showing what it will become — is the strongest single move available on this topic, and almost nobody will make it.',
      },
      {
        q: 'Which of these should you attribute rather than state as fact?',
        options: [
          'That the framework takes effect on 15 October 2026',
          'That the rate is 0.4% above ₹2,000',
          'That person-to-person transfers remain free',
          'That pumps will lose about ₹17,700 a month',
        ],
        right: 3,
        why: 'It is the dealers’ association’s own estimate of its own loss — the most quotable and least verified number in the story. Say “the dealers’ association puts it at” and the same sentence becomes an asset instead of a liability.',
      },
    ],
    glossary: [
      { term: 'MDR (merchant discount rate)', def: 'The fee a merchant pays to accept a digital payment, usually a percentage of the sale, shared between the bank that serves the merchant, the bank that holds the customer’s account, and the network.' },
      { term: 'Merchant payment versus person-to-person', def: 'This framework touches only payments to a merchant, and only above ₹2,000 at larger ones. Money sent to another person is untouched at any amount. Confusing the two is the most common error on this topic.' },
      { term: 'NPCI', def: 'The National Payments Corporation of India, the not-for-profit body that runs UPI and RuPay. It sets this framework; it is not a government department, which is the distinction the “not a tax” argument rests on.' },
      { term: 'Percentage versus flat fee', def: 'A charge set as a share of the sale, versus a fixed amount per sale. The whole fuel argument is about which is appropriate when margin per sale is fixed.' },
      { term: 'The zero-MDR years', def: 'From January 2020, merchant payments on UPI and RuPay carried no fee, with the cost of acceptance borne by banks and payment apps and partly offset by government incentive spending.' },
    ],
    rehearse:
      'Large merchants should pay a fee to accept UPI. Argue for or against in sixty seconds, and end by naming what your position costs.',
  },
};

const H1B: GdTopic = {
  slug: 'h1b-fee-indian-it',
  proposition: 'Is the $100,000 H-1B fee the end of the Indian IT offshore model, or its reinvention?',
  standfirst:
    'The fee that reprices the single most important career route out of Indian engineering — extended last week, struck down by a US court in June, and still unresolved.',
  domains: ['people', 'technology', 'economy', 'strategy'],
  live: true,
  whyHere:
    'It is the one topic where the people in the room are the subject. Over 70% of H-1B holders are Indian, and the firms affected are the ones on your campus.',
  askedBy: 'IT services · consulting · GCCs · product',
  updates: 4,
  updated: '19 Sep 2026',
};

const AI_JOBS: GdTopic = {
  slug: 'ai-entry-level-jobs',
  proposition: 'Will AI destroy the entry-level job — the one you are interviewing for?',
  standfirst:
    'The question a panel can ask any candidate, in any sector, and learn more from the answer than from a case.',
  domains: ['technology', 'people', 'strategy'],
  live: false,
  whyHere:
    'Asked in some form in almost every season, and the only topic where you are the subject matter. Nobody can sit it out.',
  askedBy: 'Every sector',
  updates: 3,
  updated: '21 Sep 2026',
};

const QUICK_COMMERCE: GdTopic = {
  slug: 'quick-commerce-kirana',
  proposition: 'Ten-minute delivery is winning. Should it be allowed to kill the neighbourhood kirana?',
  standfirst:
    'Unit economics and social cost in one question — which is exactly why FMCG and e-commerce panels keep reaching for it.',
  domains: ['marketing', 'operations', 'strategy'],
  live: false,
  whyHere:
    'The standing favourite of consumer-sector panels, because it tests whether you can hold a commercial view and a social one at the same time.',
  askedBy: 'FMCG · e-commerce · retail · consulting',
  updates: 2,
  updated: '20 Sep 2026',
};

const WORK_HOURS: GdTopic = {
  slug: 'seventy-hour-week',
  proposition: 'Seventy-hour weeks: is India’s work-culture debate about productivity or about power?',
  standfirst:
    'Everyone can enter in the first ten seconds, which is precisely why panels use it to see who adds structure instead of opinion.',
  domains: ['people', 'strategy'],
  live: false,
  whyHere:
    'The easiest topic to speak on and the hardest to say anything new in. If you can add a frame here, you can add one anywhere.',
  askedBy: 'Consulting · IT services · start-ups',
  updates: 1,
  updated: '18 Sep 2026',
};

const RESERVATION: GdTopic = {
  slug: 'private-sector-reservation',
  proposition: 'Should reservation extend to private-sector hiring?',
  standfirst:
    'The most evenly balanced topic on the list, and the one where a careless sentence costs you the offer.',
  domains: ['people', 'economy', 'general'],
  live: false,
  whyHere:
    'Both sides have serious arguments and serious people behind them. Handled well it shows judgement; handled badly it ends the interview.',
  askedBy: 'Public policy · consulting · conglomerates',
  updates: 1,
  updated: '17 Sep 2026',
};

const GST: GdTopic = {
  slug: 'gst-small-business',
  proposition: 'GST 2.0: has simplification actually reached the small business it was sold to?',
  standfirst:
    'The Council meets on 7 October on process reform, weeks after a Centre-state meeting on what GST 2.0 has actually done.',
  domains: ['economy', 'finance', 'operations'],
  live: true,
  whyHere:
    'A dated decision inside your interview season, and the topic that connects to almost every other one on this list.',
  askedBy: 'BFSI · consulting · manufacturing',
  updates: 3,
  updated: '19 Sep 2026',
};

const RUSSIAN_OIL: GdTopic = {
  slug: 'russian-oil-tariff',
  proposition: 'Should India keep buying discounted Russian oil under the threat of a 100% US tariff?',
  standfirst:
    'The US House passed the sanctions bill on 17 September. The trade-off is real, immediate and quantifiable.',
  domains: ['economy', 'strategy'],
  live: true,
  whyHere:
    'Genuinely live and genuinely consequential — but harder to enter than it looks, so prepare a way in rather than an opinion.',
  askedBy: 'Energy · consulting · public policy',
  updates: 2,
  updated: '17 Sep 2026',
};

/** Order is the running order of the board. */
export const GD_TOPICS: GdTopic[] = [
  UPI_MDR, H1B, AI_JOBS, QUICK_COMMERCE, WORK_HOURS, RESERVATION, GST, RUSSIAN_OIL,
];

export function getTopic(slug: string): GdTopic | undefined {
  return GD_TOPICS.find((t) => t.slug === slug);
}

/** Topics carrying a full brief right now. */
export function readyTopics(): GdTopic[] {
  return GD_TOPICS.filter((t) => t.dossier);
}
