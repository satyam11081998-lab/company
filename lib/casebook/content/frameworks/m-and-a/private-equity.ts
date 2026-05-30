import type { Page } from '@/lib/casebook/types';

export const privateEquity: Page = {
  slug: 'core-frameworks/m-and-a/private-equity',
  title: 'Private Equity',
  titleEmphasize: 'Private Equity',
  subtitle: 'The financial-buyer lens on a deal. A PE fund does not buy to keep — it buys to improve and sell. This page covers how funds create returns, the deal lifecycle built around the exit, and how to run a "should this fund invest" case.',
  kind: 'framework',
  meta: { readingTimeMin: 13, tags: ['core-frameworks', 'm-and-a', 'private-equity'], caseType: 'Private Equity' },
  blocks: [
    { type: 'hook', md: 'A strategic acquirer asks "does this make my business stronger?" A private-equity fund asks a colder question: "can I buy this, make it more valuable, and sell it for a strong return before my fund\'s clock runs out?" The target is not a permanent addition — it is a temporary holding with an exit date. That single shift, from owner to investor, reframes the entire analysis.', emphasize: 'a temporary holding with an exit date' },

    { type: 'prose', md: 'Private equity is the financial-buyer view of the deal frameworks. It reuses the same machinery — valuation, due diligence — but judges everything by returns rather than strategic fit. Because the fund must eventually sell, the exit is not an afterthought; it is the starting point. (For the underlying valuation and diligence mechanics, see Value & Synergies and Due Diligence; this page focuses on what is distinctively PE.)' },

    { type: 'heading', level: 2, text: 'How a fund creates returns', emphasize: 'creates returns' },

    { type: 'prose', md: 'A PE fund makes money three ways: by growing the business\'s profit, by selling at a higher valuation multiple than it bought at, and by using debt to amplify the equity return. They are not equally reliable, and a strong thesis leans on the one the fund actually controls.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Three private equity return levers: grow profit, exit at higher multiple, and leverage", caption: "The three PE value-creation levers — operational improvement, multiple expansion, and leverage. Operational improvement is the lever the fund controls.", svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="225" y="18" width="270" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">HOW PE CREATES RETURNS</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">three levers — buy, improve, and exit higher</text>

  <path d="M360 64 C360 84, 140 82, 140 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 360 82, 360 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M360 64 C360 84, 580 82, 580 102" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>

  <rect x="40" y="102" width="200" height="180" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="58" y="124" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">1 · GROW PROFIT</text>
  <text x="58" y="139" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">OPERATIONAL IMPROVEMENT</text>
  <circle cx="60" cy="160" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="164" font-size="9.5" fill="hsl(var(--foreground))">Grow revenue</text>
  <circle cx="60" cy="182" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="186" font-size="9.5" fill="hsl(var(--foreground))">Cut cost / improve margin</text>
  <circle cx="60" cy="204" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="208" font-size="9.5" fill="hsl(var(--foreground))">Professionalise ops</text>
  <circle cx="60" cy="226" r="2.5" fill="hsl(var(--primary))"/><text x="70" y="230" font-size="9.5" fill="hsl(var(--foreground))">Bolt-on acquisitions</text>
  <text x="58" y="256" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">the highest-quality,</text>
  <text x="58" y="270" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">most durable lever</text>

  <rect x="260" y="102" width="200" height="180" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="278" y="124" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">2 · EXIT HIGHER</text>
  <text x="278" y="139" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">MULTIPLE EXPANSION</text>
  <circle cx="280" cy="160" r="2.5" fill="hsl(var(--primary))"/><text x="290" y="164" font-size="9.5" fill="hsl(var(--foreground))">Buy at a low multiple,</text>
  <text x="290" y="176" font-size="9.5" fill="hsl(var(--foreground))">sell at a higher one</text>
  <circle cx="280" cy="196" r="2.5" fill="hsl(var(--primary))"/><text x="290" y="200" font-size="9.5" fill="hsl(var(--foreground))">De-risk the business</text>
  <circle cx="280" cy="218" r="2.5" fill="hsl(var(--primary))"/><text x="290" y="222" font-size="9.5" fill="hsl(var(--foreground))">Grow into a bigger,</text>
  <text x="290" y="234" font-size="9.5" fill="hsl(var(--foreground))">higher-rated category</text>
  <text x="278" y="258" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">partly market-driven —</text>
  <text x="278" y="272" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">less in your control</text>

  <rect x="480" y="102" width="200" height="180" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1" filter="url(#cs)"/>
  <text x="498" y="124" font-size="11.5" font-weight="700" fill="hsl(var(--foreground))">3 · PAY DOWN DEBT</text>
  <text x="498" y="139" font-size="8.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">LEVERAGE</text>
  <circle cx="500" cy="160" r="2.5" fill="hsl(var(--primary))"/><text x="510" y="164" font-size="9.5" fill="hsl(var(--foreground))">Buy with debt + equity</text>
  <circle cx="500" cy="182" r="2.5" fill="hsl(var(--primary))"/><text x="510" y="186" font-size="9.5" fill="hsl(var(--foreground))">Cash flows repay debt</text>
  <circle cx="500" cy="204" r="2.5" fill="hsl(var(--primary))"/><text x="510" y="208" font-size="9.5" fill="hsl(var(--foreground))">Equity value grows as</text>
  <text x="510" y="220" font-size="9.5" fill="hsl(var(--foreground))">debt shrinks</text>
  <circle cx="500" cy="240" r="2.5" fill="hsl(var(--primary))"/><text x="510" y="244" font-size="9.5" fill="hsl(var(--foreground))">Amplifies returns</text>
  <text x="498" y="270" font-size="8.5" font-style="italic" fill="hsl(var(--muted-foreground))">also amplifies risk</text>

  <!-- nav band -->
  <rect x="40" y="304" width="640" height="218" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="328" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — RETURNS = ENTRY PRICE, IMPROVEMENT, EXIT PRICE, AND LEVERAGE</text>
  <circle cx="64" cy="352" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="356" font-size="10.5" fill="hsl(var(--foreground))">A PE return (measured as IRR or MOIC — multiple of money) comes from: buy cheap, grow the profit,</text>
  <text x="74" y="372" font-size="10.5" fill="hsl(var(--foreground))">sell at a good multiple, with debt amplifying the equity gain along the way.</text>
  <circle cx="64" cy="394" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="398" font-size="10.5" fill="hsl(var(--foreground))">Lead with operational improvement — it is the lever the fund controls and the one interviewers respect most.</text>
  <text x="74" y="414" font-size="10.5" fill="hsl(var(--foreground))">Relying on multiple expansion alone is hoping the market re-rates you — a weak thesis.</text>
  <circle cx="64" cy="436" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="440" font-size="10.5" fill="hsl(var(--foreground))">Leverage cuts both ways: it magnifies returns if the business performs, and magnifies losses if it does not.</text>
  <circle cx="64" cy="462" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="466" font-size="10.5" fill="hsl(var(--foreground))">Always tie back to the exit: a PE investment is only as good as the price someone else will pay in 4–6 years.</text>
  <text x="60" y="492" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">A strong PE answer names a value-creation plan built on operational improvement, not financial engineering alone.</text>
  <text x="60" y="510" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The difference from M&amp;A: no synergies with an acquirer — the target must create value on its own, then be sold.</text>
</svg>` },

    { type: 'callout', variant: 'insight', title: 'Lead with operational improvement', md: 'Of the three levers, only operational improvement is genuinely in the fund\'s control. Multiple expansion depends on the market re-rating the business, and leverage is a financing choice that amplifies whatever the business does — good or bad. A thesis that rests mainly on "we\'ll buy at 8× and sell at 12×" is hoping, not planning. Strong answers centre on a concrete value-creation plan: grow revenue, expand margin, professionalise operations, bolt on acquisitions.' },

    { type: 'heading', level: 2, text: 'The deal lifecycle', emphasize: 'deal lifecycle' },

    { type: 'prose', md: 'A PE investment moves through a defined lifecycle — source and diligence, buy, create value over a hold period, then exit — and the defining feature is that the fund plans the exit before it buys.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Private equity deal lifecycle as a chevron flow with exit options panel", caption: "The PE deal lifecycle — source and diligence, buy, create value, exit. A fund reasons backwards from the exit.", svg: `<svg viewBox="0 0 720 500" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="240" y="18" width="240" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="40" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="0.02em" fill="#ffffff">THE PE DEAL LIFECYCLE</text>
  <text x="360" y="55" text-anchor="middle" font-size="9" fill="#b9c4d6">enter with the exit already in mind</text>

  <!-- horizontal 4-stage chevron flow -->
  <path d="M40 90 h140 l16 18 l-16 18 h-140 z" fill="url(#ng)"/>
  <text x="103" y="113" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">SOURCE &amp; DILIGENCE</text>
  <path d="M204 90 h140 l16 18 l-16 18 h-140 z" fill="hsl(214 60% 22%)"/>
  <text x="270" y="113" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">BUY (entry price)</text>
  <path d="M368 90 h140 l16 18 l-16 18 h-140 z" fill="hsl(214 56% 28%)"/>
  <text x="434" y="113" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">CREATE VALUE</text>
  <path d="M532 90 h116 l16 18 l-16 18 h-116 z" fill="hsl(356 74% 46%)"/>
  <text x="592" y="113" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">EXIT</text>

  <!-- under-stage notes -->
  <text x="60" y="150" font-size="9" fill="hsl(var(--muted-foreground))">find target, run</text>
  <text x="60" y="162" font-size="9" fill="hsl(var(--muted-foreground))">commercial DD,</text>
  <text x="60" y="174" font-size="9" fill="hsl(var(--muted-foreground))">form the thesis</text>

  <text x="224" y="150" font-size="9" fill="hsl(var(--muted-foreground))">negotiate price,</text>
  <text x="224" y="162" font-size="9" fill="hsl(var(--muted-foreground))">structure debt +</text>
  <text x="224" y="174" font-size="9" fill="hsl(var(--muted-foreground))">equity, close</text>

  <text x="388" y="150" font-size="9" fill="hsl(var(--muted-foreground))">execute the plan over</text>
  <text x="388" y="162" font-size="9" fill="hsl(var(--muted-foreground))">4–6 years: grow profit,</text>
  <text x="388" y="174" font-size="9" fill="hsl(var(--muted-foreground))">pay down debt</text>

  <text x="540" y="150" font-size="9" fill="hsl(var(--muted-foreground))">sell, and realise</text>
  <text x="540" y="162" font-size="9" fill="hsl(var(--muted-foreground))">the return</text>

  <!-- EXIT OPTIONS panel -->
  <rect x="40" y="196" width="640" height="118" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1"/>
  <text x="60" y="220" font-size="10" font-weight="700" letter-spacing="0.07em" fill="hsl(var(--primary))">EXIT OPTIONS — DECIDED AT ENTRY, NOT AT THE END</text>
  <text x="60" y="244" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">Strategic sale</text>
  <text x="200" y="244" font-size="9.5" fill="hsl(var(--muted-foreground))">to a corporate acquirer</text>
  <text x="60" y="268" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">Secondary buyout</text>
  <text x="200" y="268" font-size="9.5" fill="hsl(var(--muted-foreground))">sell to another PE fund</text>
  <text x="60" y="292" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">IPO</text>
  <text x="200" y="292" font-size="9.5" fill="hsl(var(--muted-foreground))">list publicly, often a partial exit</text>
  <text x="410" y="244" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">Total vs partial</text>
  <text x="410" y="262" font-size="9.5" fill="hsl(var(--muted-foreground))">sell all at once, or stage</text>
  <text x="410" y="274" font-size="9.5" fill="hsl(var(--muted-foreground))">the exit to keep upside</text>
  <text x="410" y="286" font-size="9.5" fill="hsl(var(--muted-foreground))">in a strong asset</text>

  <!-- nav band -->
  <rect x="40" y="332" width="640" height="150" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="356" font-size="10" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">HOW TO USE THIS — A PE FUND BUYS BACKWARDS, FROM THE EXIT</text>
  <circle cx="64" cy="380" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="384" font-size="10.5" fill="hsl(var(--foreground))">Before buying, a fund asks "who will buy this from us, and at what price, in five years?" If there is no</text>
  <text x="74" y="400" font-size="10.5" fill="hsl(var(--foreground))">credible exit, there is no investment — however good the business looks today.</text>
  <circle cx="64" cy="422" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="426" font-size="10.5" fill="hsl(var(--foreground))">In a case, name the likely exit and the buyer early — it shows you think like an investor, not just an analyst.</text>
  <circle cx="64" cy="448" r="2.5" fill="hsl(var(--foreground))"/><text x="74" y="452" font-size="10.5" fill="hsl(var(--foreground))">Hold period (often 4–6 years) and horizon shape everything: how aggressive the plan can be, how much debt is safe.</text>
  <text x="60" y="476" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">This is the cleanest difference from strategic M&amp;A — the buyer is temporary, so the resale matters as much as the buy.</text>
</svg>` },

    { type: 'callout', variant: 'tip', title: 'Reason backwards from the exit', md: 'The cleanest way to sound like an investor rather than an analyst is to name the exit early: "in five years, this would likely be sold to a strategic acquirer in the sector, or to a larger PE fund, at roughly this multiple." If you cannot name a credible buyer and a plausible exit price, the investment does not work — no matter how good the business looks today. The exit is the test, not the epilogue.' },

    { type: 'heading', level: 2, text: 'Navigating it live', emphasize: 'Navigating it live' },

    { type: 'prose', md: 'Run a PE case as four linked questions plus a returns check: is it a good business, can we improve it, is there a credible exit, and do the returns clear the fund\'s hurdle? All four must hold.' },
    { type: 'svg', maxWidth: 720, ariaLabel: "Private equity diagnostic flow as a five-step path with a returns-hurdle gate", caption: "How to run a private-equity case live — clarify the mandate, diligence the business, define value creation, confirm the exit, check the returns.", svg: `<svg viewBox="0 0 720 510" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <filter id="rs" x="-30%" y="-30%" width="160%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#0f1c33" flood-opacity="0.22"/></filter>
    <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(var(--card))"/><stop offset="1" stop-color="hsl(var(--background))"/></linearGradient>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>

  <rect x="200" y="20" width="320" height="46" rx="11" fill="url(#ng)" filter="url(#rs)"/>
  <text x="360" y="42" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">1 · Clarify the fund &amp; the mandate</text>
  <text x="360" y="57" text-anchor="middle" font-size="9" fill="#b9c4d6">target return, hold period, cheque size, sector focus</text>

  <path d="M360 66 C360 80, 360 80, 360 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="94" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="116" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">2 · Is this a good business? (diligence)</text>
  <text x="360" y="133" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">run the four DD lenses — hunt for the deal-breaker</text>

  <path d="M360 144 C360 158, 360 158, 360 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="172" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="194" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">3 · Can WE create value? (the plan)</text>
  <text x="360" y="211" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">operational improvement first, then multiple, then leverage</text>

  <path d="M360 222 C360 236, 360 236, 360 248" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="250" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="272" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">4 · Is there a credible exit?</text>
  <text x="360" y="289" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">name the buyer and the exit multiple in 4–6 years</text>

  <path d="M360 300 C360 314, 360 314, 360 326" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="210" y="328" width="300" height="44" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="360" y="348" text-anchor="middle" font-size="11" font-weight="700" letter-spacing="0.02em" fill="hsl(var(--primary))">DO THE RETURNS CLEAR THE HURDLE?</text>
  <text x="360" y="364" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">estimate IRR / MOIC at a sensible entry price</text>

  <path d="M360 372 C360 386, 360 386, 360 398" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#ar)"/>
  <rect x="150" y="400" width="420" height="50" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#cs)"/>
  <text x="360" y="422" text-anchor="middle" font-size="12.5" font-weight="700" fill="hsl(var(--foreground))">5 · Recommend — invest, at what price</text>
  <text x="360" y="439" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">with the value-creation plan and the target exit</text>

  <rect x="40" y="466" width="640" height="40" rx="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.25"/>
  <text x="60" y="491" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Good business + we can improve it + credible exit + returns clear the hurdle. All four, or the fund passes.</text>
</svg>` },

    { type: 'heading', level: 2, text: 'Worked mini-case', emphasize: 'Worked mini-case' },

    { type: 'prose', md: 'A short example of the PE lens — note how the candidate separates the business quality from the returns question, leads the value-creation plan with operations, and reasons from the exit.' },

    { type: 'dialogue', title: 'A buyout of a regional gym chain', turns: [
      { speaker: 'interviewer', md: 'A mid-market PE fund is considering buying a profitable regional gym chain in India for ₹300cr. The chain has steady cash flows and 25 outlets. Should the fund invest?' },
      { speaker: 'candidate', md: 'I\'ll judge this on returns, not strategic fit, so I\'ll work through four things: is it a good business, can the fund create value, is there a credible exit, and do the returns clear the fund\'s hurdle — usually something like a 20%+ IRR or 2.5–3× money over five years. Steady cash flows and 25 outlets is a promising base. First, what is the fund\'s target return and hold period?' },
      { speaker: 'interviewer', md: 'Five-year hold, targeting roughly 2.5× their money. How would they get there?' },
      { speaker: 'candidate', md: 'Let me build the value-creation plan, leading with operations since that is what they control. The obvious lever is expansion — 25 outlets in one region suggests room to add more, funded partly by the chain\'s own cash flow. Beyond unit growth, there is revenue per member (premium tiers, personal training, retail) and cost efficiency at scale (procurement, shared management). That operational growth, compounded over five years, can do a lot of the 2.5×. Leverage helps too — a stable, cash-generative business like a gym chain can carry debt, so the fund can buy partly with debt and let the cash flows pay it down, amplifying the equity return. I\'d be cautious not to over-lever, since memberships can be cyclical.' },
      { speaker: 'interviewer', md: 'And the exit?' },
      { speaker: 'candidate', md: 'This is the key test. In five years, a chain that has grown from 25 to, say, 60 outlets with stronger per-member economics becomes attractive to either a larger national gym operator, a strategic wellness/retail player, or a bigger PE fund — and a larger, more diversified chain should command a higher multiple than the fund paid for a regional one, giving some multiple expansion on top of the profit growth. So my recommendation is a conditional yes: it is a good business, the fund has a clear operational plan to roughly double profit, debt can amplify the return, and there are credible buyers at exit. I\'d invest at or below ₹300cr, with the plan anchored on disciplined outlet expansion rather than financial engineering.' },
      { speaker: 'narrator', md: 'The candidate judged on returns not fit, set the hurdle up front, built a value-creation plan led by operations, used leverage sensibly with a risk caveat, and reasoned the exit explicitly — naming likely buyers and the source of multiple expansion.', note: 'Returns over fit; operations-led plan; sensible leverage; and an exit reasoned from the start.' },
    ]},

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'You will judge a PE case on returns, not strategic fit — setting the fund\'s hurdle (IRR / MOIC) and hold period up front and measuring everything against it.',
      'You will build returns from three levers — operational improvement, multiple expansion, and leverage — and lead with operational improvement because it is the lever the fund controls.',
      'You will reason backwards from the exit: name a credible buyer and exit multiple early, because an investment with no plausible exit does not work however good the business looks.',
      'You will use leverage as an amplifier with discipline — it magnifies both returns and losses, so size it to how stable the cash flows are.',
      'You will recommend invest / pass / re-price by checking all four conditions — good business, a value-creation plan, a credible exit, and returns that clear the hurdle.',
    ]},
  ],
};
