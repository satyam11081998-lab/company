"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

/* ============================================================================
   MECE — Growth Strategy Framework
   A single, self-contained framework page that amalgamates the IIM-A / B / C
   growth casebooks into one superior, branded artifact.

   Design tokens mirror app/globals.css:
     primary  #C8102E  (cardinal red)   navy #0F1C33
     bg       #FAF9F6  (warm off-white)  card #FFFFFF
     success  #2A7D4F   warning #D98A0B
   Drop-in for /learn/growth/growth-strategy. Inline styles keep it portable;
   swap to your utility classes (ui-card, text-h1 …) when wiring into Next.
   ============================================================================ */

const C = {
  primary: "#C8102E",
  primaryHover: "#A60D26",
  primaryLight: "#FDECEF",
  navy: "#0F1C33",
  navyMid: "#1E3A5F",
  navySoft: "#5A6B82",
  bg: "#FAF9F6",
  card: "#FFFFFF",
  border: "#E7E3DC",
  borderStrong: "#C9C3B8",
  fg: "#14130F",
  muted: "#6B6862",
  success: "#2A7D4F",
  successSoft: "#E6F2EB",
  warning: "#B5740A",
  warningSoft: "#FAF0DA",
};

const font = `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
const mono = `'SF Mono', 'Fira Mono', ui-monospace, monospace`;

/* ---- The granular levers behind every node (the "best of all casebooks") --- */
const DETAILS = {
  growth: {
    kind: "root",
    title: "Growth",
    tag: "The objective",
    blurb:
      "A company wants to grow value (revenue / profit / users). First align on the growth target & timeline, then decompose where growth can come from, then recommend which levers to pull.",
    points: [
      "Always confirm the metric: revenue, profit, market share, or user base?",
      "Pin the magnitude & horizon — “XX% YoY over 3 years” changes the answer.",
      "Then walk the tree top-down: source of growth → pillar → specific lever.",
    ],
  },
  organic: {
    kind: "branch",
    title: "Organic growth",
    tag: "Grow from within",
    blurb:
      "Growth driven by the firm's own operations — selling to more users or earning more profit per user. Lower risk, slower, builds durable capability.",
    points: [
      "Two engines: more users (volume) and more profit per user (yield).",
      "Preferred when the core is healthy and the market still has headroom.",
      "Analysable through the Ansoff matrix (markets × products).",
    ],
  },
  inorganic: {
    kind: "branch",
    title: "Inorganic growth",
    tag: "Grow by combining",
    blurb:
      "Growth bought rather than built — acquiring, partnering, or absorbing capabilities. Faster, but carries integration, culture and valuation risk.",
    points: [
      "M&A — buy market share, IP, talent or a distribution footprint.",
      "Joint ventures / alliances — share risk to enter a new space.",
      "Build end-to-end capability — vertically integrate up or down the chain.",
    ],
  },
  noncore: {
    kind: "branch",
    title: "Non-core monetisation",
    tag: "The brownie-point branch",
    blurb:
      "Squeeze value from assets and audiences the firm already owns but doesn't monetise. Rarely mentioned by candidates — raising it signals creativity.",
    points: [
      "Lease / rent idle assets — real estate, fleet, equipment, data.",
      "Advertising & audience revenue — monetise traffic / footfall.",
      "Value-added services — warranties, financing, subscriptions, support.",
    ],
  },
  users: {
    kind: "leaf",
    title: "Number of users",
    tag: "Volume engine",
    blurb:
      "Total users = Market Size × Market Share. Grow either the pie or your slice of it.",
    sub: [
      {
        h: "Grow market size",
        items: [
          "Create new use-cases / occasions",
          "Geographic expansion (new regions / countries)",
          "Move adjacent non-consumers into the category",
        ],
      },
      {
        h: "Grow market share",
        items: [
          "Improve the customer journey & experience",
          "Branding & marketing — awareness and pull",
          "Widen distribution channels & reach",
          "Lift retention — cut churn, build loyalty",
        ],
      },
    ],
    note: "Use the Ansoff matrix to be MECE about where the users come from.",
  },
  profit: {
    kind: "leaf",
    title: "Profit per user",
    tag: "Yield engine",
    blurb:
      "Profit / user = Revenue / user − Cost / user. Lift the top line or compress the cost to serve.",
    sub: [
      {
        h: "Revenue per user",
        items: [
          "Price per unit — test elasticity before moving",
          "Units per user — bundling, upselling, cross-selling",
          "Price discrimination across segments",
          "Tiering / premiumisation",
        ],
      },
      {
        h: "Cost per user",
        items: [
          "Variable cost — process innovation, automation",
          "Fixed cost — utilisation, scale, shared infra",
          "Value-chain analysis & strategic vertical integration",
        ],
      },
    ],
    note: "Always check price changes against elasticity of demand.",
  },
  ma: {
    kind: "leaf",
    title: "Mergers & acquisitions",
    tag: "Buy growth",
    blurb:
      "Acquire a target to add revenue, market share, technology, talent or geography overnight.",
    sub: [
      {
        h: "What you're buying",
        items: [
          "Market share / customer base",
          "IP, technology or brand",
          "Distribution & supply footprint",
          "Talent and capability",
        ],
      },
      {
        h: "Watch-outs",
        items: [
          "Valuation & synergy realism",
          "Cultural / operational integration",
          "Regulatory & antitrust clearance",
        ],
      },
    ],
  },
  jv: {
    kind: "leaf",
    title: "Joint ventures & alliances",
    tag: "Share the risk",
    blurb:
      "Partner with another firm to enter a market or build a capability while splitting capital and risk.",
    sub: [
      {
        h: "When it fits",
        items: [
          "Entering an unfamiliar geography",
          "Combining complementary strengths",
          "Capital-heavy or regulated markets",
        ],
      },
    ],
  },
  e2e: {
    kind: "leaf",
    title: "Build E2E capability",
    tag: "Integrate the chain",
    blurb:
      "Develop skills or vertically integrate so the firm controls more of its value chain.",
    sub: [
      {
        h: "Directions",
        items: [
          "Backward — secure supply / inputs",
          "Forward — own distribution / customer",
          "Develop in-house capability vs. buy",
        ],
      },
    ],
  },
  lease: {
    kind: "leaf",
    title: "Lease / rent assets",
    tag: "Idle → income",
    blurb:
      "Turn under-used assets into a revenue stream without a new product.",
    sub: [
      {
        h: "Examples",
        items: [
          "Spare real estate / warehouse space",
          "Fleet, equipment or machine time",
          "Data, APIs or platform access",
        ],
      },
    ],
  },
  ads: {
    kind: "leaf",
    title: "Advertising revenue",
    tag: "Monetise attention",
    blurb:
      "Sell access to the audience or footfall the business already attracts.",
    sub: [
      {
        h: "Examples",
        items: [
          "On-site / in-app ad inventory",
          "Sponsorships & placements",
          "Affiliate / referral revenue",
        ],
      },
    ],
  },
  vas: {
    kind: "leaf",
    title: "Value-added services",
    tag: "Wrap the core",
    blurb:
      "Attach services around the core offering to deepen revenue per customer.",
    sub: [
      {
        h: "Examples",
        items: [
          "Warranties & extended support",
          "Financing / insurance / subscriptions",
          "Installation, training, consulting",
        ],
      },
    ],
  },
};

/* ----------------------------- Tree layout ----------------------------- */
/* Three balanced branches under Growth. Co-ords on a 1000×560 canvas.    */
const TREE = {
  root: { id: "growth", x: 500, y: 40, w: 150, h: 52, tone: "root" },
  branches: [
    { id: "organic", x: 200, y: 150, w: 170, h: 52, tone: "red" },
    { id: "inorganic", x: 500, y: 150, w: 170, h: 52, tone: "navy" },
    { id: "noncore", x: 800, y: 150, w: 170, h: 52, tone: "amber" },
  ],
  leaves: [
    { id: "users", px: "organic", x: 110, y: 270, w: 160, h: 60, tone: "red" },
    { id: "profit", px: "organic", x: 290, y: 270, w: 160, h: 60, tone: "red" },
    { id: "ma", px: "inorganic", x: 410, y: 270, w: 160, h: 56, tone: "navy" },
    { id: "jv", px: "inorganic", x: 590, y: 270, w: 160, h: 56, tone: "navy" },
    { id: "e2e", px: "inorganic", x: 500, y: 350, w: 200, h: 52, tone: "navy" },
    { id: "lease", px: "noncore", x: 710, y: 270, w: 150, h: 56, tone: "amber" },
    { id: "ads", px: "noncore", x: 875, y: 270, w: 150, h: 56, tone: "amber" },
    { id: "vas", px: "noncore", x: 792, y: 350, w: 175, h: 52, tone: "amber" },
  ],
};

const TONES = {
  root: { fill: C.navy, stroke: C.navy, text: "#fff", sub: "#B9C2D0" },
  red: { fill: C.primaryLight, stroke: C.primary, text: C.primary, sub: "#9A3242" },
  navy: { fill: "#EAEEF4", stroke: C.navyMid, text: C.navy, sub: C.navySoft },
  amber: { fill: C.warningSoft, stroke: C.warning, text: C.warning, sub: "#8A6312" },
};

function nodeCenter(n: any) {
  return { cx: n.x + n.w / 2, cy: n.y + n.h / 2 };
}

/* ----------------------------- The tree SVG ----------------------------- */
function GrowthTree({ active, onPick }: any) {
  const r = TREE.root;
  const rc = nodeCenter(r);
  const byId: Record<string, any> = {};
  [r, ...TREE.branches, ...TREE.leaves].forEach((n) => (byId[n.id] = n));

  const connectors: any[] = [];
  TREE.branches.forEach((b) => {
    const bc = nodeCenter(b);
    connectors.push([rc.cx, r.y + r.h, bc.cx, b.y]);
  });
  TREE.leaves.forEach((l) => {
    const p = byId[l.px];
    const pc = nodeCenter(p);
    const lc = nodeCenter(l);
    connectors.push([pc.cx, p.y + p.h, lc.cx, l.y]);
  });

  const renderNode = (n: any, isRoot = false) => {
    const t = TONES[n.tone as keyof typeof TONES];
    const d = DETAILS[n.id as keyof typeof DETAILS] as any;
    const isActive = active === n.id;
    const { cx } = nodeCenter(n);
    const hasSub = d && (d.sub || d.kind === "leaf");
    return (
      <g
        key={n.id}
        style={{ cursor: "pointer" }}
        onClick={() => onPick(n.id)}
      >
        <rect
          x={n.x}
          y={n.y}
          width={n.w}
          height={n.h}
          rx={isRoot ? 10 : 9}
          fill={t.fill}
          stroke={isActive ? C.fg : t.stroke}
          strokeWidth={isActive ? 2.2 : isRoot ? 0 : 1.4}
        />
        <text
          x={cx}
          y={d?.tag ? n.y + n.h / 2 - 6 : n.y + n.h / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={font}
          fontSize={isRoot ? 17 : 13.5}
          fontWeight={700}
          fill={t.text}
        >
          {d?.title ?? n.id}
        </text>
        {d?.tag && (
          <text
            x={cx}
            y={n.y + n.h / 2 + 12}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={font}
            fontSize={10.5}
            fontWeight={500}
            fill={t.sub}
          >
            {d.tag}
          </text>
        )}
        {hasSub && !isRoot && (
          <circle
            cx={n.x + n.w - 11}
            cy={n.y + 11}
            r={7}
            fill={isActive ? C.fg : "#fff"}
            stroke={t.stroke}
            strokeWidth={1.2}
          />
        )}
        {hasSub && !isRoot && (
          <text
            x={n.x + n.w - 11}
            y={n.y + 11}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={font}
            fontSize={9}
            fontWeight={700}
            fill={isActive ? "#fff" : t.stroke}
          >
            +
          </text>
        )}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 1000 430"
      width="100%"
      role="img"
      aria-label="Growth strategy framework tree"
      style={{ display: "block" }}
    >
      {connectors.map(([x1, y1, x2, y2], i) => {
        const my = (y1 + y2) / 2;
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`}
            fill="none"
            stroke={C.borderStrong}
            strokeWidth={1.4}
          />
        );
      })}
      {renderNode(r, true)}
      {TREE.branches.map((b) => renderNode(b))}
      {TREE.leaves.map((l) => renderNode(l))}
    </svg>
  );
}

/* --------------------------- Detail side panel --------------------------- */
function DetailPanel({ id, onClose }: any) {
  const d = DETAILS[id as keyof typeof DETAILS] as any;
  if (!d) return null;
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 28px rgba(0,0,0,0.06)",
        padding: "20px 22px",
        position: "sticky",
        top: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div
            style={{
              fontFamily: font,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.primary,
              marginBottom: 4,
            }}
          >
            {d.tag}
          </div>
          <h3 style={{ fontFamily: font, fontSize: 20, fontWeight: 700, color: C.navy, margin: 0, letterSpacing: "-0.01em" }}>
            {d.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close detail"
          style={{
            border: `1px solid ${C.border}`,
            background: C.bg,
            borderRadius: 8,
            width: 30,
            height: 30,
            cursor: "pointer",
            color: C.muted,
            fontSize: 16,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      <p style={{ fontFamily: font, fontSize: 13.5, lineHeight: 1.6, color: C.fg, marginTop: 12, marginBottom: 0 }}>
        {d.blurb}
      </p>

      {d.points && (
        <ul style={{ margin: "14px 0 0", paddingLeft: 0, listStyle: "none" }}>
          {d.points.map((p: any, i: any) => (
            <li key={i} style={{ display: "flex", gap: 9, marginBottom: 8, fontFamily: font, fontSize: 13, color: C.fg, lineHeight: 1.5 }}>
              <span style={{ color: C.primary, fontWeight: 700, flexShrink: 0 }}>—</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}

      {d.sub &&
        d.sub.map((s: any, i: any) => (
          <div key={i} style={{ marginTop: 16 }}>
            <div
              style={{
                fontFamily: font,
                fontSize: 12.5,
                fontWeight: 700,
                color: C.navy,
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {s.h}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {s.items.map((it: any, j: any) => (
                <span
                  key={j}
                  style={{
                    fontFamily: font,
                    fontSize: 12,
                    color: C.fg,
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 7,
                    padding: "5px 10px",
                    lineHeight: 1.35,
                  }}
                >
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}

      {d.note && (
        <div
          style={{
            marginTop: 16,
            background: C.successSoft,
            border: `1px solid ${C.success}33`,
            borderRadius: 9,
            padding: "10px 12px",
            display: "flex",
            gap: 8,
          }}
        >
          <span style={{ color: C.success, fontWeight: 700 }}>★</span>
          <span style={{ fontFamily: font, fontSize: 12.5, color: "#1F5C3A", lineHeight: 1.5 }}>{d.note}</span>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Ansoff matrix ----------------------------- */
function AnsoffMatrix() {
  const cell = (title: any, risk: any, items: any, tone: any) => (
    <div
      style={{
        background: tone.bg,
        border: `1px solid ${tone.bd}`,
        borderRadius: 11,
        padding: "14px 15px",
        minHeight: 118,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: font, fontSize: 13.5, fontWeight: 700, color: tone.fg }}>{title}</span>
        <span style={{ fontFamily: font, fontSize: 10, fontWeight: 600, color: tone.fg, background: "#fff", border: `1px solid ${tone.bd}`, borderRadius: 20, padding: "2px 8px" }}>
          {risk}
        </span>
      </div>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {items.map((x: any, i: any) => (
          <li key={i} style={{ fontFamily: font, fontSize: 12, color: C.fg, lineHeight: 1.55 }}>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
  const low = { bg: C.successSoft, bd: `${C.success}40`, fg: "#1F5C3A" };
  const mid = { bg: C.warningSoft, bd: `${C.warning}40`, fg: "#8A6312" };
  const high = { bg: C.primaryLight, bd: `${C.primary}40`, fg: C.primary };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 10, alignItems: "stretch" }}>
      <div />
      <ColHead>Existing products</ColHead>
      <ColHead>New products</ColHead>

      <RowHead>Existing markets</RowHead>
      {cell("Market penetration", "Low risk", ["Win share from rivals", "Increase usage frequency", "Better pricing & retention"], low)}
      {cell("Product development", "Medium", ["New features / variants", "Upsell to current base", "Adjacent product lines"], mid)}

      <RowHead>New markets</RowHead>
      {cell("Market development", "Medium", ["New geographies", "New customer segments", "New channels / occasions"], mid)}
      {cell("Diversification", "High risk", ["New product + new market", "Often via M&A / JV", "Hardest to execute"], high)}
    </div>
  );
}
const ColHead = ({ children }: any) => (
  <div style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: C.navy, textAlign: "center", paddingBottom: 4 }}>{children}</div>
);
const RowHead = ({ children }: any) => (
  <div style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: C.navy, display: "flex", alignItems: "center", writingMode: "horizontal-tb", maxWidth: 80, lineHeight: 1.3 }}>{children}</div>
);

/* ------------------------------- The page ------------------------------- */
const PRELIM = [
  "Clarify the objective — which metric, what magnitude, what timeline?",
  "Why this geography? Has the product launched in other markets?",
  "Business model — where does the firm sit in the value chain?",
  "Who are the target customers? Market size & price sensitivity?",
  "Existing products / capabilities — any differentiators?",
  "Pricing — given or to be set? Target margin?",
  "Competitive landscape — fragmented or consolidated?",
];

const BROWNIE = [
  "Name the non-core branch most candidates forget.",
  "Tie every lever back to the stated growth target.",
  "Pressure-test price moves against elasticity of demand.",
  "Close with a prioritised, sequenced recommendation.",
];

function Pill({ children, tone = "navy" }: any) {
  const map: any = {
    navy: { bg: "#EAEEF4", fg: C.navy },
    red: { bg: C.primaryLight, fg: C.primary },
    amber: { bg: C.warningSoft, fg: C.warning },
  };
  const t = map[tone];
  return (
    <span style={{ fontFamily: font, fontSize: 11, fontWeight: 600, color: t.fg, background: t.bg, borderRadius: 20, padding: "4px 11px" }}>
      {children}
    </span>
  );
}

export default function GrowthStrategyPage() {
  const router = useRouter();

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font, color: C.fg }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Back bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0 14px" }}>
          <button
            onClick={() => router.push("/learn#growth")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              border: `1px solid ${C.border}`,
              background: C.card,
              borderRadius: 9,
              padding: "7px 13px",
              fontFamily: font,
              fontSize: 13,
              fontWeight: 600,
              color: C.navy,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 15 }}>←</span> Back to Growth
          </button>
          <span style={{ fontSize: 12.5, color: C.muted }}>
            Learn <span style={{ color: C.borderStrong }}>/</span> Growth{" "}
            <span style={{ color: C.borderStrong }}>/</span>{" "}
            <span style={{ color: C.navy, fontWeight: 600 }}>Growth Strategy</span>
          </span>
        </div>

        {/* Hero */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Pill tone="red">Core framework</Pill>
              <Pill tone="navy">Case type</Pill>
              <Pill tone="amber">~25 min</Pill>
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", color: C.navy, margin: "0 0 12px", lineHeight: 1.05 }}>
              Growth <span style={{ color: C.primary }}>Strategy</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: C.fg, margin: 0 }}>
              When a company wants to grow, the interviewer expects you to align on the growth
              target, decompose every place that growth could come from, and recommend which
              levers to pull. This tree is the amalgamation of the IIM-A, B and C casebooks —
              nothing one school covers is missing.
            </p>
          </div>
        </div>

        {/* Main framework diagram */}
        <div style={{ marginTop: 26 }}>
          {/* Tree card */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
              padding: "22px 22px 22px",
              overflowX: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: font, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>
                Approach / framework
              </div>
            </div>
            
            <div style={{ minWidth: 1000, display: "flex", justifyContent: "center" }}>
              <img src="/assets/growth-diagram.svg" alt="Growth Strategy Framework Diagram" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
            
          </div>
        </div>

        {/* Two-up: preliminary questions + brownie points */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 22 }}>
          <Card title="Preliminary questions" accent={C.navy} kicker="Open every case here">
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {PRELIM.map((q: any, i: any) => (
                <li key={i} style={{ fontFamily: font, fontSize: 13.5, color: C.fg, lineHeight: 1.65, marginBottom: 6, paddingLeft: 4 }}>
                  {q}
                </li>
              ))}
            </ol>
          </Card>
          <Card title="What earns brownie points" accent={C.primary} kicker="Separate yourself">
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
              {BROWNIE.map((b: any, i: any) => (
                <li key={i} style={{ display: "flex", gap: 10, marginBottom: 11, fontFamily: font, fontSize: 13.5, color: C.fg, lineHeight: 1.55 }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: C.primaryLight,
                      color: C.primary,
                      fontWeight: 700,
                      fontSize: 11,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Ansoff */}
        <div style={{ marginTop: 28 }}>
          <SectionHead label="Sub-tool" title="The Ansoff matrix" sub="Use it to stay MECE about where new users come from — markets × products, ranked by execution risk." />
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
              padding: "22px 24px",
              marginTop: 12,
            }}
          >
            <AnsoffMatrix />
          </div>
        </div>

        {/* Worked snippet */}
        <div style={{ marginTop: 28 }}>
          <SectionHead label="Apply it" title="Structuring the answer in 60 seconds" sub="A clean opening turns the tree into a verbal roadmap the interviewer can follow." />
          <div
            style={{
              background: C.navy,
              borderRadius: 16,
              padding: "26px 28px",
              marginTop: 12,
              color: "#EAEEF4",
            }}
          >
            <p style={{ fontFamily: mono, fontSize: 14, lineHeight: 1.8, margin: 0, color: "#D7DEE8" }}>
              “To grow <span style={{ color: "#fff", fontWeight: 600 }}>profit by 20% over two years</span>, I'll look at three sources of growth.
              First, <span style={{ color: "#F6A3AE", fontWeight: 600 }}>organic</span> — more users via market share and reach, and more profit per user via price and cost-to-serve.
              Second, <span style={{ color: "#A9C4E8", fontWeight: 600 }}>inorganic</span> — acquisitions or a JV if speed matters.
              Third, a <span style={{ color: "#EDC97A", fontWeight: 600 }}>non-core</span> angle — monetising assets we already own.
              I'd start by sizing the organic headroom, then test whether inorganic is worth the integration risk.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: any) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: font, fontSize: 12, color: C.muted }}>
      <span style={{ width: 11, height: 11, borderRadius: 3, background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function Card({ title, kicker, accent, children }: any) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        padding: "20px 22px",
      }}
    >
      <div style={{ fontFamily: font, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 4 }}>
        {kicker}
      </div>
      <h3 style={{ fontFamily: font, fontSize: 18, fontWeight: 700, color: C.navy, margin: "0 0 14px", letterSpacing: "-0.01em" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function SectionHead({ label, title, sub }: any) {
  return (
    <div>
      <div style={{ fontFamily: font, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.primary, marginBottom: 6 }}>
        {label}
      </div>
      <h2 style={{ fontFamily: font, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: C.navy, margin: "0 0 6px" }}>
        {title}
      </h2>
      {sub && <p style={{ fontFamily: font, fontSize: 14.5, color: C.muted, margin: 0, maxWidth: 640, lineHeight: 1.55 }}>{sub}</p>}
    </div>
  );
}
