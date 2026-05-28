'use client';

import React, { useState } from 'react';

const cssString = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;700&display=swap');

  :root {
    --navy: #1B2A4A;
    --primary: #C41E3A;
    --emerald: #10B981;
    --muted-fg: #9CA3AF;
    --surface: #F8F7F4;
    --border: rgba(27, 42, 74, 0.15);
  }

  .me-wrapper {
    width: 100%;
    min-height: 500px;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .me-svg-container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid var(--border);
    background-color: var(--surface);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  @keyframes diagramEnter {
    0% { opacity: 0; transform: scale(0.98) translateY(5px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  .me-svg {
    width: 100%;
    height: auto;
    animation: diagramEnter 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* Typography */
  .text-title {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 22px;
    font-weight: 700;
    fill: var(--navy);
  }

  .text-header {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    fill: white;
  }

  .text-header-dark {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    fill: var(--navy);
  }

  .text-body {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 10px;
    fill: var(--navy);
  }

  .text-body-muted {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 10px;
    fill: var(--muted-fg);
  }

  .text-micro {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    fill: var(--muted-fg);
  }

  .text-mono-bold {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    fill: var(--navy);
  }

  .text-formula {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    fill: var(--navy);
  }

  /* Navigation */
  .me-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }

  .me-nav-btn {
    font-size: 18px;
    color: var(--navy);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 12px;
  }
  .me-nav-btn:hover {
    color: var(--primary);
  }

  .me-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--border);
  }
  .me-dot.active {
    width: 8px;
    height: 8px;
    background-color: var(--primary);
  }
`;

function Slide1() {
  return (
    <div className="me-svg-container" key="slide1">
      <svg viewBox="0 0 900 500" className="me-svg">
        <defs>
          <pattern id="grid1" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#9CA3AF" strokeWidth="0.5" strokeOpacity="0.15" />
          </pattern>
        </defs>
        <rect width="900" height="500" fill="url(#grid1)" />

        {/* Title */}
        <rect x="30" y="25" width="4" height="24" fill="var(--primary)" />
        <text x="44" y="44" className="text-title">Market Entry Framework</text>
        <path d="M 30 60 L 870 60" stroke="var(--navy)" strokeWidth="2" opacity="0.8" />

        {/* LEFT SIDEBAR - Initial Questions */}
        <rect x="30" y="80" width="220" height="390" fill="white" stroke="var(--border)" strokeWidth="1" rx="6" />
        <rect x="30" y="80" width="220" height="36" fill="var(--navy)" rx="6" />
        {/* Fix top rounded corners only for header */}
        <rect x="30" y="100" width="220" height="16" fill="var(--navy)" />
        
        <text x="45" y="102" className="text-header">Initial Questions</text>
        
        <g className="text-body" transform="translate(45, 135)">
          <circle cx="-6" cy="-3" r="2" fill="var(--primary)" />
          <text y="0">Clarify objective, growth</text>
          <text y="14">quantum and targeted timeline.</text>
          
          <circle cx="-6" cy="37" r="2" fill="var(--primary)" />
          <text y="40">Geography: Why are we looking</text>
          <text y="54">into this geography? Have they</text>
          <text y="68">launched this product in</text>
          <text y="82">another market?</text>
          
          <circle cx="-6" cy="107" r="2" fill="var(--primary)" />
          <text y="110">Business Model: Where does</text>
          <text y="124">the firm lie in the value chain?</text>
          
          <circle cx="-6" cy="147" r="2" fill="var(--primary)" />
          <text y="150">Who are the target customers?</text>
          <text y="164">Market size &amp; price sensitivity.</text>
          
          <circle cx="-6" cy="187" r="2" fill="var(--primary)" />
          <text y="190">What are the existing products,</text>
          <text y="204">services, &amp; capabilities of the</text>
          <text y="218">firm? Any differentiating features?</text>
          
          <circle cx="-6" cy="247" r="2" fill="var(--primary)" />
          <text y="250">Pricing - given or required?</text>
          <text y="264">Ask for targeted margin.</text>
          
          <circle cx="-6" cy="287" r="2" fill="var(--primary)" />
          <text y="290">What is the competitive</text>
          <text y="304">landscape?</text>
        </g>

        {/* RIGHT AREA - 4 Pillars */}
        {/* Customer */}
        <rect x="270" y="80" width="135" height="230" fill="white" stroke="var(--border)" strokeWidth="1" rx="4" />
        <rect x="270" y="80" width="135" height="30" fill="var(--navy)" rx="4" />
        <rect x="270" y="100" width="135" height="10" fill="var(--navy)" />
        <text x="337" y="100" className="text-header" textAnchor="middle">Customer</text>
        
        <g className="text-body-muted" transform="translate(285, 130)">
          <text y="0">- Segments</text>
          <text y="20">- Needs &amp; Pain Points</text>
          <text y="40">- Size &amp; Growth</text>
          <text y="60">- Target Group</text>
          <text y="80">- Market Share</text>
          <text y="100">- Price Sensitivity</text>
        </g>

        {/* Company */}
        <rect x="420" y="80" width="135" height="230" fill="white" stroke="var(--border)" strokeWidth="1" rx="4" />
        <rect x="420" y="80" width="135" height="30" fill="var(--navy)" rx="4" />
        <rect x="420" y="100" width="135" height="10" fill="var(--navy)" />
        <text x="487" y="100" className="text-header" textAnchor="middle">Company</text>
        
        <g className="text-body-muted" transform="translate(435, 130)">
          <text y="0">- Product Mix</text>
          <text y="20">- Resources &amp; Assets</text>
          <text y="40">- Value Chain Analysis</text>
          <text y="54" className="text-micro">(Procurement,</text>
          <text y="66" className="text-micro"> Production,</text>
          <text y="78" className="text-micro"> Distribution)</text>
          <text y="98">- Financial Analysis</text>
          <text y="112" className="text-micro">(Break-even point)</text>
        </g>

        {/* Competition */}
        <rect x="570" y="80" width="135" height="230" fill="white" stroke="var(--border)" strokeWidth="1" rx="4" />
        <rect x="570" y="80" width="135" height="30" fill="var(--navy)" rx="4" />
        <rect x="570" y="100" width="135" height="10" fill="var(--navy)" />
        <text x="637" y="100" className="text-header" textAnchor="middle">Competition</text>
        
        <g className="text-body-muted" transform="translate(585, 130)">
          <text y="0">- No. of competitors</text>
          <text y="14" className="text-micro">  &amp; market share</text>
          <text y="34">- SWOT Analysis</text>
          <text y="54">- 4Ps Strategy</text>
          <text y="74">- Barriers to entry:</text>
          <text y="88" className="text-micro">  · Regulations</text>
          <text y="100" className="text-micro">  · Supplier Power</text>
          <text y="112" className="text-micro">  · Financial Const.</text>
        </g>

        {/* Product / Gap */}
        <rect x="720" y="80" width="135" height="230" fill="white" stroke="var(--border)" strokeWidth="1" rx="4" />
        <rect x="720" y="80" width="135" height="30" fill="var(--navy)" rx="4" />
        <rect x="720" y="100" width="135" height="10" fill="var(--navy)" />
        <text x="787" y="100" className="text-header" textAnchor="middle">Product / Gap</text>
        
        <g className="text-body-muted" transform="translate(735, 130)">
          <text y="0">- Gap between</text>
          <text y="14" className="text-micro">  customer expectation</text>
          <text y="26" className="text-micro">  &amp; available products</text>
          <text y="46">- Unique Value Prop</text>
          <text y="66">- Margin Potential</text>
          <text y="86">- Substitutes</text>
        </g>

        {/* RIGHT AREA BOTTOM - Economic Feasibility */}
        <rect x="270" y="330" width="585" height="140" fill="rgba(255,255,255,0.7)" stroke="var(--border)" strokeWidth="1" rx="6" />
        <path d="M 270 330 L 270 470" stroke="var(--primary)" strokeWidth="6" />
        
        <text x="290" y="360" className="text-mono-bold" fill="var(--primary)">ECONOMIC ANALYSIS (IS IT WORTH IT?)</text>
        
        <rect x="290" y="375" width="540" height="40" fill="rgba(27,42,74,0.04)" rx="4" />
        <text x="305" y="400" className="text-formula">
          Profit = ( Market Size × Market Share × (Price − Variable Cost) ) − Fixed Cost
        </text>
        
        <g className="text-body" transform="translate(290, 440)">
          <circle cx="4" cy="-3" r="2" fill="var(--navy)" opacity="0.5" />
          <text x="12" y="0">Market size &amp; share may often require you to undertake a guesstimate.</text>
          
          <circle cx="4" cy="15" r="2" fill="var(--navy)" opacity="0.5" />
          <text x="12" y="18">Operational Feasibility: Regulatory/other barriers in setting up a value chain.</text>
        </g>
      </svg>
    </div>
  );
}

function Slide2() {
  return (
    <div className="me-svg-container" key="slide2">
      <svg viewBox="0 0 900 500" className="me-svg">
        <defs>
          <pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#9CA3AF" strokeWidth="0.5" strokeOpacity="0.15" />
          </pattern>
        </defs>
        <rect width="900" height="500" fill="url(#grid2)" />

        {/* Title */}
        <rect x="30" y="25" width="4" height="24" fill="var(--primary)" />
        <text x="44" y="44" className="text-title">Market Entry Framework</text>
        <path d="M 30 60 L 870 60" stroke="var(--navy)" strokeWidth="2" opacity="0.8" />

        {/* LEFT SIDEBAR TAGS */}
        <rect x="30" y="80" width="140" height="190" fill="var(--primary)" rx="4" />
        <text x="100" y="175" className="text-header" textAnchor="middle">Risks Involved</text>

        <rect x="30" y="280" width="140" height="190" fill="var(--navy)" rx="4" />
        <text x="100" y="375" className="text-header" textAnchor="middle">Modes of Entry</text>

        {/* TOP - Risks Tree */}
        <g strokeWidth="1.5" stroke="var(--navy)" fill="none" opacity="0.3">
          <path d="M 530 110 L 530 130 L 380 130 L 380 140" />
          <path d="M 530 130 L 680 130 L 680 140" />
          
          <path d="M 680 170 L 680 190 L 560 190 L 560 200" />
          <path d="M 680 190 L 800 190 L 800 200" />
        </g>

        <rect x="470" y="80" width="120" height="30" fill="white" stroke="var(--primary)" strokeWidth="1.5" rx="4" />
        <text x="530" y="100" className="text-header-dark" textAnchor="middle">Risks</text>

        <rect x="320" y="140" width="120" height="30" fill="white" stroke="var(--primary)" strokeWidth="1.5" rx="4" />
        <text x="380" y="160" className="text-header-dark" textAnchor="middle">Internal</text>
        <text x="380" y="185" className="text-micro" textAnchor="middle">- Constraints</text>
        <text x="380" y="197" className="text-micro" textAnchor="middle">- Resources</text>

        <rect x="620" y="140" width="120" height="30" fill="white" stroke="var(--primary)" strokeWidth="1.5" rx="4" />
        <text x="680" y="160" className="text-header-dark" textAnchor="middle">External</text>

        <rect x="500" y="200" width="120" height="30" fill="white" stroke="var(--primary)" strokeWidth="1.5" rx="4" />
        <text x="560" y="220" className="text-header-dark" textAnchor="middle">Industry Level</text>
        <text x="560" y="245" className="text-micro" textAnchor="middle">- Competitors / Barrier</text>

        <rect x="740" y="200" width="120" height="30" fill="white" stroke="var(--primary)" strokeWidth="1.5" rx="4" />
        <text x="800" y="220" className="text-header-dark" textAnchor="middle">Macro Factors</text>
        <text x="800" y="245" className="text-micro" textAnchor="middle">- PESTEL / Govt.</text>

        {/* BOTTOM - Modes of Entry Tree */}
        <path d="M 190 270 L 870 270" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />

        <g strokeWidth="1.5" stroke="var(--navy)" fill="none" opacity="0.3">
          <path d="M 530 310 L 530 330 L 280 330 L 280 340" />
          <path d="M 530 330 L 446 330 L 446 340" />
          <path d="M 530 330 L 613 330 L 613 340" />
          <path d="M 530 330 L 780 330 L 780 340" />
        </g>

        <rect x="460" y="280" width="140" height="30" fill="var(--navy)" rx="4" />
        <text x="530" y="300" className="text-header" textAnchor="middle">How to Enter</text>

        {/* Mode 1: Organic */}
        <rect x="210" y="340" width="140" height="40" fill="white" stroke="var(--navy)" strokeWidth="1" rx="4" />
        <text x="280" y="358" className="text-header-dark" textAnchor="middle">Organic</text>
        <text x="280" y="370" className="text-micro" textAnchor="middle">(Greenfield)</text>
        
        <g className="text-body" transform="translate(210, 400)">
          <text fill="var(--emerald)">+ Retain business control</text>
          <text y="16" fill="var(--emerald)">+ Build experience curve</text>
          <text y="32" fill="var(--emerald)">+ Boosts brand image</text>
          
          <text y="52" fill="var(--primary)">- High capex required</text>
          <text y="68" fill="var(--primary)">- High time commitment</text>
        </g>

        {/* Mode 2: JV */}
        <rect x="376" y="340" width="140" height="40" fill="white" stroke="var(--navy)" strokeWidth="1" rx="4" />
        <text x="446" y="358" className="text-header-dark" textAnchor="middle">Joint Venture</text>
        <text x="446" y="370" className="text-micro" textAnchor="middle">(Partnership)</text>

        <g className="text-body" transform="translate(376, 400)">
          <text fill="var(--emerald)">+ Less investment</text>
          <text y="16" fill="var(--emerald)">+ Local expertise &amp; network</text>
          <text y="32" fill="var(--emerald)">+ Fast scale &amp; scope</text>
          
          <text y="52" fill="var(--primary)">- Limited control</text>
          <text y="68" fill="var(--primary)">- Brand dilution risk</text>
        </g>

        {/* Mode 3: Acquisition */}
        <rect x="543" y="340" width="140" height="40" fill="white" stroke="var(--navy)" strokeWidth="1" rx="4" />
        <text x="613" y="358" className="text-header-dark" textAnchor="middle">Acquisition</text>
        <text x="613" y="370" className="text-micro" textAnchor="middle">(Brownfield)</text>

        <g className="text-body" transform="translate(543, 400)">
          <text fill="var(--emerald)">+ Immediate market scope</text>
          <text y="16" fill="var(--emerald)">+ Utilize local established brand</text>
          <text y="32" fill="var(--emerald)">+ Produce synergies</text>
          
          <text y="52" fill="var(--primary)">- Significant investment</text>
          <text y="68" fill="var(--primary)">- Integration complexities</text>
        </g>

        {/* Mode 4: Outsourcing */}
        <rect x="710" y="340" width="140" height="40" fill="white" stroke="var(--navy)" strokeWidth="1" rx="4" />
        <text x="780" y="358" className="text-header-dark" textAnchor="middle">Outsourcing</text>
        <text x="780" y="370" className="text-micro" textAnchor="middle">(Exporting / Franchising)</text>

        <g className="text-body" transform="translate(710, 400)">
          <text fill="var(--emerald)">+ Lowest fixed cost</text>
          <text y="16" fill="var(--emerald)">+ Speed to test market</text>
          <text y="32" fill="var(--emerald)">+ High flexibility</text>
          
          <text y="52" fill="var(--primary)">- Low quality control</text>
          <text y="68" fill="var(--primary)">- Margin leakage / Dependency</text>
        </g>

      </svg>
    </div>
  );
}

export default function MarketEntryFramework() {
  const [slide, setSlide] = useState(1);

  return (
    <div className="me-wrapper">
      <style dangerouslySetInnerHTML={{ __html: cssString }} />
      
      {slide === 1 ? <Slide1 /> : <Slide2 />}
      
      <div className="me-nav">
        <button className="me-nav-btn" onClick={() => setSlide(1)}>←</button>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className={`me-dot ${slide === 1 ? 'active' : ''}`} />
          <div className={`me-dot ${slide === 2 ? 'active' : ''}`} />
        </div>
        <span className="text-mono-bold" style={{ margin: '0 8px' }}>
          0{slide} / 02
        </span>
        <button className="me-nav-btn" onClick={() => setSlide(2)}>→</button>
      </div>
    </div>
  );
}
