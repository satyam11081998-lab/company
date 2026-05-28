'use client';

import React, { useState } from 'react';

const cssString = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;600;700&display=swap');

  .me-wrapper {
    width: 100%;
    min-height: 700px;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding-bottom: 40px;
  }

  .me-svg-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid hsl(var(--border));
    background-color: hsl(var(--card));
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
  }

  @keyframes diagramEnter {
    0% { opacity: 0; transform: scale(0.99) translateY(10px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  .me-svg {
    width: 100%;
    height: auto;
    animation: diagramEnter 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* Typography Scale for MASSIVE format */
  .text-h1 {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
    fill: hsl(var(--navy));
    letter-spacing: -0.02em;
  }

  .text-h2 {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 18px;
    font-weight: 700;
    fill: white;
    letter-spacing: 0.02em;
  }

  .text-h2-dark {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 18px;
    font-weight: 700;
    fill: hsl(var(--navy));
    letter-spacing: 0.02em;
  }
  
  .text-h2-red {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 18px;
    font-weight: 700;
    fill: hsl(var(--primary));
    letter-spacing: 0.02em;
  }

  .text-body-lg {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 15px;
    line-height: 1.5;
    fill: hsl(var(--navy));
  }

  .text-body {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    fill: hsl(var(--navy));
  }

  .text-body-muted {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    fill: hsl(var(--muted-foreground));
  }

  .text-mono {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    fill: hsl(var(--navy));
  }
  
  .text-mono-sub {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    fill: hsl(var(--muted-foreground));
  }

  .text-formula {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 18px;
    font-weight: 600;
    fill: hsl(var(--navy));
  }

  /* Navigation */
  .me-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 32px;
  }

  .me-nav-btn {
    font-size: 24px;
    color: hsl(var(--navy));
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 16px;
    transition: color 0.2s, transform 0.2s;
  }
  .me-nav-btn:hover {
    color: hsl(var(--primary));
    transform: scale(1.1);
  }

  .me-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: hsl(var(--border));
    transition: all 0.3s ease;
  }
  .me-dot.active {
    width: 12px;
    height: 12px;
    background-color: hsl(var(--primary));
  }
`;

function Slide1() {
  return (
    <div className="me-svg-container" key="slide1">
      <svg viewBox="0 0 1200 700" className="me-svg">
        <defs>
          <pattern id="gridLarge" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#9CA3AF" strokeWidth="0.75" strokeOpacity="0.12" />
          </pattern>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.04" />
          </filter>
        </defs>
        
        <rect width="1200" height="700" fill="url(#gridLarge)" />

        {/* Header Ribbon */}
        <rect x="0" y="0" width="1200" height="6" fill="hsl(var(--navy))" />
        <rect x="0" y="0" width="200" height="6" fill="hsl(var(--primary))" />

        {/* Title */}
        <text x="50" y="65" className="text-h1">Market Entry Framework</text>
        <path d="M 50 85 L 1150 85" stroke="hsl(var(--border))" strokeWidth="2" opacity="0.8" />

        {/* LEFT SIDEBAR - Initial Questions (w=280) */}
        <g filter="url(#shadow)">
          <rect x="50" y="120" width="280" height="530" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" rx="10" />
          <path d="M 50 130 Q 50 120 60 120 L 320 120 Q 330 120 330 130 L 330 170 L 50 170 Z" fill="hsl(var(--navy))" />
        </g>
        
        <text x="190" y="152" className="text-h2" textAnchor="middle">Initial Questions</text>
        
        <g className="text-body-lg" transform="translate(75, 210)">
          <circle cx="-10" cy="-5" r="4" fill="hsl(var(--primary))" />
          <text y="0" style={{fontWeight: 600}}>Objective &amp; Timeline</text>
          <text y="22" className="text-body-muted">Clarify the growth quantum</text>
          <text y="42" className="text-body-muted">and targeted launch date.</text>
          
          <circle cx="-10" cy="85" r="4" fill="hsl(var(--primary))" />
          <text y="90" style={{fontWeight: 600}}>Geography Rationale</text>
          <text y="112" className="text-body-muted">Why this specific region?</text>
          <text y="132" className="text-body-muted">Is it a proven market?</text>
          
          <circle cx="-10" cy="175" r="4" fill="hsl(var(--primary))" />
          <text y="180" style={{fontWeight: 600}}>Value Chain</text>
          <text y="202" className="text-body-muted">Where does the firm intend</text>
          <text y="222" className="text-body-muted">to operate in the chain?</text>
          
          <circle cx="-10" cy="265" r="4" fill="hsl(var(--primary))" />
          <text y="270" style={{fontWeight: 600}}>Target Customers</text>
          <text y="292" className="text-body-muted">Assess market size &amp; price</text>
          <text y="312" className="text-body-muted">sensitivity of the segment.</text>
          
          <circle cx="-10" cy="355" r="4" fill="hsl(var(--primary))" />
          <text y="360" style={{fontWeight: 600}}>Product &amp; Differentiator</text>
          <text y="382" className="text-body-muted">What are existing capabilities?</text>
          <text y="402" className="text-body-muted">Are there new features?</text>
        </g>

        {/* RIGHT AREA - 4 Pillars */}
        <g filter="url(#shadow)">
          {/* Customer */}
          <rect x="360" y="120" width="180" height="310" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" rx="8" />
          <path d="M 360 128 Q 360 120 368 120 L 532 120 Q 540 120 540 128 L 540 165 L 360 165 Z" fill="hsl(var(--navy))" opacity="0.95" />
          <text x="450" y="148" className="text-h2" textAnchor="middle">Customer</text>
          <g className="text-body" transform="translate(380, 200)">
            <text y="0">• Segments</text>
            <text y="30">• Needs &amp; Pains</text>
            <text y="60">• Size &amp; Growth</text>
            <text y="90">• Target Group</text>
            <text y="120">• Market Share</text>
            <text y="150">• Price Sensitivity</text>
          </g>

          {/* Company */}
          <rect x="560" y="120" width="180" height="310" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" rx="8" />
          <path d="M 560 128 Q 560 120 568 120 L 732 120 Q 740 120 740 128 L 740 165 L 560 165 Z" fill="hsl(var(--navy))" opacity="0.95" />
          <text x="650" y="148" className="text-h2" textAnchor="middle">Company</text>
          <g className="text-body" transform="translate(580, 200)">
            <text y="0">• Product Mix</text>
            <text y="30">• Resources</text>
            <text y="60">• Value Chain</text>
            <text y="80" className="text-mono-sub">  - Procurement</text>
            <text y="98" className="text-mono-sub">  - Production</text>
            <text y="116" className="text-mono-sub">  - Distribution</text>
            <text y="146">• Break-even Pt.</text>
          </g>

          {/* Competition */}
          <rect x="760" y="120" width="180" height="310" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" rx="8" />
          <path d="M 760 128 Q 760 120 768 120 L 932 120 Q 940 120 940 128 L 940 165 L 760 165 Z" fill="hsl(var(--navy))" opacity="0.95" />
          <text x="850" y="148" className="text-h2" textAnchor="middle">Competition</text>
          <g className="text-body" transform="translate(780, 200)">
            <text y="0">• Market Share</text>
            <text y="30">• SWOT Analysis</text>
            <text y="60">• 4Ps Strategy</text>
            <text y="90">• Barriers:</text>
            <text y="110" className="text-mono-sub">  - Regulations</text>
            <text y="128" className="text-mono-sub">  - Supplier Power</text>
            <text y="146" className="text-mono-sub">  - Capital Cost</text>
          </g>

          {/* Product */}
          <rect x="960" y="120" width="180" height="310" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" rx="8" />
          <path d="M 960 128 Q 960 120 968 120 L 1132 120 Q 1140 120 1140 128 L 1140 165 L 960 165 Z" fill="hsl(var(--navy))" opacity="0.95" />
          <text x="1050" y="148" className="text-h2" textAnchor="middle">Product Gap</text>
          <g className="text-body" transform="translate(980, 200)">
            <text y="0">• Customer Gap</text>
            <text y="30">• Unique Value</text>
            <text y="60">• Margin Potential</text>
            <text y="90">• Substitutes</text>
            <text y="120">• Regulatory Fit</text>
          </g>
        </g>

        {/* RIGHT AREA BOTTOM - Economic Feasibility */}
        <g filter="url(#shadow)">
          <rect x="360" y="460" width="780" height="190" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" rx="10" />
          <rect x="360" y="460" width="8" height="190" fill="hsl(var(--primary))" rx="4" />
        </g>
        
        <text x="395" y="505" className="text-mono" fill="hsl(var(--primary))">ECONOMIC ANALYSIS (IS IT WORTH IT?)</text>
        
        <rect x="395" y="525" width="710" height="50" fill="hsl(var(--navy))" fillOpacity="0.04" rx="6" stroke="hsl(var(--navy))" strokeOpacity="0.1" strokeWidth="1" />
        <text x="420" y="557" className="text-formula">
          Profit = ( Market Size × Market Share × (Price − Variable Cost) ) − Fixed Cost
        </text>
        
        <g className="text-body-lg" transform="translate(395, 605)">
          <circle cx="6" cy="-5" r="4" fill="hsl(var(--navy))" opacity="0.4" />
          <text x="22" y="0">Market size &amp; share may often require you to undertake a guesstimate.</text>
          
          <circle cx="6" cy="25" r="4" fill="hsl(var(--navy))" opacity="0.4" />
          <text x="22" y="30">Operational Feasibility: Evaluate regulatory &amp; partner constraints in setting up the value chain.</text>
        </g>
      </svg>
    </div>
  );
}

function Slide2() {
  return (
    <div className="me-svg-container" key="slide2">
      <svg viewBox="0 0 1200 700" className="me-svg">
        <defs>
          <pattern id="gridLarge2" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#9CA3AF" strokeWidth="0.75" strokeOpacity="0.12" />
          </pattern>
          <filter id="shadow2" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.04" />
          </filter>
        </defs>
        
        <rect width="1200" height="700" fill="url(#gridLarge2)" />

        {/* Header Ribbon */}
        <rect x="0" y="0" width="1200" height="6" fill="hsl(var(--navy))" />
        <rect x="0" y="0" width="200" height="6" fill="hsl(var(--primary))" />

        {/* Title */}
        <text x="50" y="65" className="text-h1">Market Entry Framework</text>
        <path d="M 50 85 L 1150 85" stroke="hsl(var(--border))" strokeWidth="2" opacity="0.8" />

        {/* LEFT SIDEBAR TAGS */}
        <rect x="50" y="120" width="200" height="260" fill="hsl(var(--primary))" rx="8" filter="url(#shadow2)" />
        <text x="150" y="255" className="text-h2" textAnchor="middle">Risks Involved</text>

        <rect x="50" y="400" width="200" height="260" fill="hsl(var(--navy))" rx="8" filter="url(#shadow2)" />
        <text x="150" y="535" className="text-h2" textAnchor="middle">Modes of Entry</text>

        {/* TOP - Risks Tree */}
        <g strokeWidth="2" stroke="hsl(var(--navy))" fill="none" opacity="0.4">
          <path d="M 700 160 L 700 200 L 500 200 L 500 215" />
          <path d="M 700 200 L 900 200 L 900 215" />
          
          <path d="M 900 265 L 900 300 L 750 300 L 750 315" />
          <path d="M 900 300 L 1050 300 L 1050 315" />
        </g>

        <g filter="url(#shadow2)">
          <rect x="620" y="110" width="160" height="50" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" rx="8" />
          <text x="700" y="140" className="text-h2-dark" textAnchor="middle">Risks</text>

          <rect x="420" y="215" width="160" height="50" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" rx="8" />
          <text x="500" y="245" className="text-h2-dark" textAnchor="middle">Internal</text>
          <text x="500" y="280" className="text-mono-sub" textAnchor="middle">Constraints &amp; Resources</text>

          <rect x="820" y="215" width="160" height="50" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" rx="8" />
          <text x="900" y="245" className="text-h2-dark" textAnchor="middle">External</text>

          <rect x="670" y="315" width="160" height="50" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" rx="8" />
          <text x="750" y="345" className="text-h2-dark" textAnchor="middle">Industry Level</text>
          <text x="750" y="380" className="text-mono-sub" textAnchor="middle">Competitors &amp; Barriers</text>

          <rect x="970" y="315" width="160" height="50" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" rx="8" />
          <text x="1050" y="345" className="text-h2-dark" textAnchor="middle">Macro Factors</text>
          <text x="1050" y="380" className="text-mono-sub" textAnchor="middle">PESTEL &amp; Regulations</text>
        </g>

        {/* BOTTOM - Modes of Entry Tree */}
        <path d="M 280 390 L 1150 390" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 6" />

        <g strokeWidth="2" stroke="hsl(var(--navy))" fill="none" opacity="0.4">
          <path d="M 700 450 L 700 490 L 400 490 L 400 500" />
          <path d="M 700 490 L 600 490 L 600 500" />
          <path d="M 700 490 L 800 490 L 800 500" />
          <path d="M 700 490 L 1000 490 L 1000 500" />
        </g>

        <g filter="url(#shadow2)">
          <rect x="610" y="410" width="180" height="40" fill="hsl(var(--navy))" rx="6" />
          <text x="700" y="437" className="text-h2" textAnchor="middle">How to Enter</text>

          {/* Mode 1: Organic */}
          <rect x="310" y="500" width="180" height="50" fill="hsl(var(--card))" stroke="hsl(var(--navy))" strokeWidth="2" rx="8" />
          <text x="400" y="522" className="text-h2-dark" textAnchor="middle">Organic</text>
          <text x="400" y="540" className="text-mono-sub" textAnchor="middle">(Greenfield)</text>
          <g className="text-body" transform="translate(310, 580)">
            <text fill="hsl(var(--success))" style={{fontWeight:600}}>+ Retain full control</text>
            <text y="22" fill="hsl(var(--success))" style={{fontWeight:600}}>+ Build experience</text>
            <text y="44" fill="hsl(var(--success))" style={{fontWeight:600}}>+ Boosts brand</text>
            <text y="74" fill="hsl(var(--primary))" style={{fontWeight:600}}>- High capex</text>
            <text y="96" fill="hsl(var(--primary))" style={{fontWeight:600}}>- Slow to scale</text>
          </g>

          {/* Mode 2: JV */}
          <rect x="510" y="500" width="180" height="50" fill="hsl(var(--card))" stroke="hsl(var(--navy))" strokeWidth="2" rx="8" />
          <text x="600" y="522" className="text-h2-dark" textAnchor="middle">Joint Venture</text>
          <text x="600" y="540" className="text-mono-sub" textAnchor="middle">(Partnership)</text>
          <g className="text-body" transform="translate(510, 580)">
            <text fill="hsl(var(--success))" style={{fontWeight:600}}>+ Less investment</text>
            <text y="22" fill="hsl(var(--success))" style={{fontWeight:600}}>+ Local expertise</text>
            <text y="44" fill="hsl(var(--success))" style={{fontWeight:600}}>+ Fast scale</text>
            <text y="74" fill="hsl(var(--primary))" style={{fontWeight:600}}>- Limited control</text>
            <text y="96" fill="hsl(var(--primary))" style={{fontWeight:600}}>- Brand dilution</text>
          </g>

          {/* Mode 3: Acquisition */}
          <rect x="710" y="500" width="180" height="50" fill="hsl(var(--card))" stroke="hsl(var(--navy))" strokeWidth="2" rx="8" />
          <text x="800" y="522" className="text-h2-dark" textAnchor="middle">Acquisition</text>
          <text x="800" y="540" className="text-mono-sub" textAnchor="middle">(Brownfield)</text>
          <g className="text-body" transform="translate(710, 580)">
            <text fill="hsl(var(--success))" style={{fontWeight:600}}>+ Immediate scope</text>
            <text y="22" fill="hsl(var(--success))" style={{fontWeight:600}}>+ Utilize local brand</text>
            <text y="44" fill="hsl(var(--success))" style={{fontWeight:600}}>+ Synergies</text>
            <text y="74" fill="hsl(var(--primary))" style={{fontWeight:600}}>- High investment</text>
            <text y="96" fill="hsl(var(--primary))" style={{fontWeight:600}}>- Integration risk</text>
          </g>

          {/* Mode 4: Outsourcing */}
          <rect x="910" y="500" width="180" height="50" fill="hsl(var(--card))" stroke="hsl(var(--navy))" strokeWidth="2" rx="8" />
          <text x="1000" y="522" className="text-h2-dark" textAnchor="middle">Outsourcing</text>
          <text x="1000" y="540" className="text-mono-sub" textAnchor="middle">(Export / Franchise)</text>
          <g className="text-body" transform="translate(910, 580)">
            <text fill="hsl(var(--success))" style={{fontWeight:600}}>+ Lowest fixed cost</text>
            <text y="22" fill="hsl(var(--success))" style={{fontWeight:600}}>+ Fast market test</text>
            <text y="44" fill="hsl(var(--success))" style={{fontWeight:600}}>+ Flexibility</text>
            <text y="74" fill="hsl(var(--primary))" style={{fontWeight:600}}>- Low quality control</text>
            <text y="96" fill="hsl(var(--primary))" style={{fontWeight:600}}>- Dependency risk</text>
          </g>
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className={`me-dot ${slide === 1 ? 'active' : ''}`} />
          <div className={`me-dot ${slide === 2 ? 'active' : ''}`} />
        </div>
        <span className="text-mono" style={{ margin: '0 8px' }}>
          0{slide} / 02
        </span>
        <button className="me-nav-btn" onClick={() => setSlide(2)}>→</button>
      </div>
    </div>
  );
}
