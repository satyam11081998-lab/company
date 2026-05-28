import React, { useState, useEffect } from 'react';

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
    min-height: 480px;
    background-color: var(--surface);
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%239CA3AF' stroke-width='0.5' stroke-opacity='0.12'/%3E%3C/svg%3E");
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 32px;
    box-sizing: border-box;
    overflow: hidden;
  }

  @keyframes diagramEnter {
    from {
      opacity: 0;
      transform: scale(0.98) translateY(5px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .me-slide-container {
    animation: diagramEnter 400ms cubic-bezier(0.16, 1, 0.32, 1) both;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* Typography Roles */
  .role-a {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--navy);
  }

  .role-b {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1.2;
  }

  .role-c {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 7.5px;
    color: var(--muted-fg);
    line-height: 1.5;
  }

  .role-d {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--navy);
  }

  /* Slide 1 Styles */
  .me-title-row {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
  }

  .me-title-bar {
    width: 3px;
    height: 20px;
    background-color: var(--primary);
    margin-right: 10px;
    display: inline-block;
  }

  .me-title-text {
    font-size: 18px;
  }

  .me-zone-a {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    margin-bottom: 16px;
  }
  .me-zone-a::-webkit-scrollbar {
    display: none;
  }

  .me-chip {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 5px 10px;
    background: transparent;
    color: var(--navy);
    white-space: nowrap;
  }

  .me-zone-b {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .me-pillar-card {
    border: 1px solid var(--border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.55);
    padding: 14px;
    backdrop-filter: blur(3px);
  }

  .me-pillar-header {
    background-color: var(--navy);
    border-radius: 4px;
    padding: 4px 8px;
    display: inline-block;
    margin-bottom: 8px;
  }
  .me-pillar-header .role-a {
    color: white;
  }

  .me-bullet-list {
    list-style-type: disc;
    padding-left: 14px;
    margin: 0;
  }
  .me-bullet-list li {
    padding-bottom: 2px;
  }

  .me-zone-c {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .me-flat-card {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px 16px;
    background: transparent;
  }

  /* SVG Animations for Slide 1 */
  @keyframes drawLine {
    to {
      stroke-dashoffset: 0;
    }
  }
  @keyframes fadeInNode {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .path-l {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawLine 800ms cubic-bezier(0.16, 1, 0.32, 1) 100ms forwards;
  }
  .path-r {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawLine 800ms cubic-bezier(0.16, 1, 0.32, 1) 200ms forwards;
  }
  .path-r-sub {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawLine 800ms cubic-bezier(0.16, 1, 0.32, 1) 350ms forwards;
  }

  .node-l { opacity: 0; animation: fadeInNode 400ms ease forwards 900ms; }
  .node-r { opacity: 0; animation: fadeInNode 400ms ease forwards 1000ms; }
  .node-r-sub { opacity: 0; animation: fadeInNode 400ms ease forwards 1150ms; }

  /* Slide 2 Styles */
  .me-table-container {
    position: relative;
    border: 1px solid var(--border);
    margin-bottom: 16px;
    overflow: hidden;
  }

  .me-table {
    display: grid;
    grid-template-columns: 90px 1fr 1fr 1fr 1fr;
  }

  .me-cell {
    border-bottom: 1px solid var(--border);
    border-right: 1px solid var(--border);
    padding: 10px;
    background: transparent;
  }
  .me-cell:last-child {
    border-right: none;
  }
  .me-row:last-child .me-cell {
    border-bottom: none;
  }

  .me-th {
    background-color: var(--navy);
    color: white;
    padding: 8px 10px;
    border-right: 1px solid var(--border);
  }
  .me-th:last-child {
    border-right: none;
  }

  .me-row-header {
    background: rgba(27, 42, 74, 0.06);
    display: flex;
    align-items: center;
  }

  .me-trigger-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }

  .me-trigger-card {
    border: 1px solid var(--navy);
    border-radius: 6px;
    padding: 10px 14px;
    background: transparent;
  }
  .me-trigger-card.primary {
    border-color: var(--primary);
  }
  .me-trigger-card.primary .role-a {
    color: var(--primary);
  }

  @keyframes scanLine { 
    from { top: 0%; opacity: 1; } 
    to { top: 100%; opacity: 0; } 
  }
  .me-scanline {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background-color: var(--primary);
    z-index: 10;
    animation: scanLine 700ms cubic-bezier(0.16, 1, 0.32, 1) forwards;
  }

  /* Navigation */
  .me-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: auto;
    padding-top: 24px;
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

  .emerald { color: var(--emerald); }
`;

function Slide1() {
  return (
    <div className="me-slide-container" key="slide1">
      <div className="me-title-row">
        <div className="me-title-bar" />
        <span className="role-b me-title-text">Market Entry — Should We Enter?</span>
      </div>

      <div className="me-zone-a">
        {["Objective & Growth Target", "Geography Rationale", "Value Chain Position", "Customer Segments & Pricing", "Competitive Landscape"].map(text => (
          <div key={text} className="me-chip role-c" style={{ color: 'var(--navy)' }}>{text}</div>
        ))}
      </div>

      <div className="me-zone-b">
        {/* Pillar 1 */}
        <div className="me-pillar-card">
          <div className="me-pillar-header">
            <span className="role-a">Customer</span>
          </div>
          <ul className="me-bullet-list role-c">
            <li>Segments & Target Group</li>
            <li>Needs & Pain Points</li>
            <li>Market Size & Growth Rate</li>
            <li>Market Dynamics</li>
            <li>Reaction to New Entrants</li>
            <li>Price Sensitivity</li>
          </ul>
        </div>
        {/* Pillar 2 */}
        <div className="me-pillar-card">
          <div className="me-pillar-header">
            <span className="role-a">Company</span>
          </div>
          <ul className="me-bullet-list role-c">
            <li>Product Mix & Key Assets</li>
            <li>Value Chain Feasibility<br/>(procurement → production → distribution)</li>
            <li>Operational Capabilities</li>
            <li>Financial Analysis (Break-Even)</li>
            <li>Existing Differentiators</li>
          </ul>
        </div>
        {/* Pillar 3 */}
        <div className="me-pillar-card">
          <div className="me-pillar-header">
            <span className="role-a">Competition</span>
          </div>
          <ul className="me-bullet-list role-c">
            <li>No. of Competitors & Market Share</li>
            <li>4Ps: Product · Price · Place · Promotion</li>
            <li>SWOT Analysis</li>
            <li>Barriers to Entry:<br/>
              &nbsp;&nbsp;Financial Constraints<br/>
              &nbsp;&nbsp;Govt. Regulations & Patents/IP<br/>
              &nbsp;&nbsp;Supplier Power<br/>
              &nbsp;&nbsp;Operational Barriers
            </li>
          </ul>
        </div>
        {/* Pillar 4 */}
        <div className="me-pillar-card">
          <div className="me-pillar-header">
            <span className="role-a">Product / Gap</span>
          </div>
          <ul className="me-bullet-list role-c">
            <li>Gap: Customer Expectations vs Available Products</li>
            <li>Unique Value Proposition</li>
            <li>Margin & Profit Potential</li>
            <li>Regulatory Fit of Product</li>
          </ul>
        </div>
      </div>

      <div className="me-zone-c">
        {/* Risk Assessment */}
        <div className="me-flat-card">
          <div className="role-a" style={{ marginBottom: 12 }}>RISK ASSESSMENT</div>
          <svg viewBox="0 0 340 120" style={{ width: '100%', height: 'auto' }}>
            {/* Lines */}
            <path d="M 60 25 L 60 40 L 140 40 L 140 50" fill="none" stroke="var(--navy)" strokeWidth="1.2" className="path-l" />
            <path d="M 60 25 L 60 40 L 260 40 L 260 50" fill="none" stroke="var(--navy)" strokeWidth="1.2" className="path-r" />
            
            <path d="M 260 70 L 260 85 L 190 85 L 190 95" fill="none" stroke="var(--navy)" strokeWidth="1.2" className="path-r-sub" />
            <path d="M 260 70 L 260 85 L 320 85 L 320 95" fill="none" stroke="var(--navy)" strokeWidth="1.2" className="path-r-sub" />

            {/* Root Node */}
            <rect x="20" y="5" width="80" height="20" fill="var(--navy)" rx="3" />
            <text x="60" y="19" textAnchor="middle" fill="white" className="role-b" style={{ fontSize: 11 }}>RISKS</text>

            {/* Internal Branch */}
            <g className="node-l">
              <rect x="90" y="50" width="100" height="20" fill="white" stroke="var(--navy)" strokeWidth="1" rx="3" />
              <text x="140" y="63" textAnchor="middle" className="role-b" style={{ fontSize: 10 }}>INTERNAL</text>
              <text x="140" y="80" textAnchor="middle" className="role-c">Constraints · Resources</text>
            </g>

            {/* External Branch */}
            <g className="node-r">
              <rect x="210" y="50" width="100" height="20" fill="white" stroke="var(--navy)" strokeWidth="1" rx="3" />
              <text x="260" y="63" textAnchor="middle" className="role-b" style={{ fontSize: 10 }}>EXTERNAL</text>
            </g>

            <g className="node-r-sub">
              <rect x="130" y="95" width="120" height="20" fill="white" stroke="var(--navy)" strokeWidth="1" rx="3" />
              <text x="190" y="108" textAnchor="middle" className="role-b" style={{ fontSize: 9 }}>INDUSTRY LEVEL</text>
              <text x="190" y="123" textAnchor="middle" className="role-c" style={{ fontSize: 6 }}>Attractiveness · Customers · Competitors · Barriers</text>
            </g>

            <g className="node-r-sub">
              <rect x="260" y="95" width="120" height="20" fill="white" stroke="var(--navy)" strokeWidth="1" rx="3" />
              <text x="320" y="108" textAnchor="middle" className="role-b" style={{ fontSize: 9 }}>MACRO FACTORS</text>
              <text x="320" y="123" textAnchor="middle" className="role-c" style={{ fontSize: 6 }}>PESTEL · Porter's 5F · Currency · Regulations</text>
            </g>
          </svg>
        </div>

        {/* Economic Feasibility */}
        <div className="me-flat-card">
          <div className="role-a" style={{ color: 'var(--primary)', marginBottom: 16 }}>ECONOMIC FEASIBILITY</div>
          <div className="role-d" style={{ marginBottom: 16 }}>
            Market Size × Market Share × (Price − Variable Cost) − Fixed Cost
          </div>
          <div className="role-c">
            Solve the market sizing guesstimate first.<br/><br/>
            Qualitatively assess achievable market share.<br/><br/>
            Operational feasibility: map regulatory/partner constraints per value chain bucket.
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide2() {
  return (
    <div className="me-slide-container" key="slide2">
      <div className="me-title-row">
        <div className="me-title-bar" />
        <span className="role-b me-title-text">Market Entry — How Do We Enter?</span>
      </div>

      <div className="me-table-container">
        <div className="me-scanline" />
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr 1fr' }}>
          {/* Header Row */}
          <div className="me-th"></div>
          <div className="me-th"><span className="role-a" style={{ color: 'white' }}>ORGANIC / GREENFIELD</span></div>
          <div className="me-th"><span className="role-a" style={{ color: 'white' }}>JOINT VENTURE</span></div>
          <div className="me-th"><span className="role-a" style={{ color: 'white' }}>BROWNFIELD / ACQUISITION</span></div>
          <div className="me-th" style={{ borderRight: 'none' }}><span className="role-a" style={{ color: 'white' }}>OUTSOURCING</span></div>

          {/* Row 1 */}
          <div className="me-cell me-row-header"><span className="role-a">ADVANTAGES</span></div>
          <div className="me-cell role-c"><span className="emerald">Retain full control</span> · Build experience curve · Boosts brand equity</div>
          <div className="me-cell role-c"><span className="emerald">Lower capital investment</span> · Local expertise & networks · High scale quickly</div>
          <div className="me-cell role-c"><span className="emerald">Immediate market scope</span> · Leverage local brand · Produce synergies</div>
          <div className="me-cell role-c"><span className="emerald">Speed to market</span> · Low fixed cost · Flexibility</div>

          {/* Row 2 */}
          <div className="me-cell me-row-header"><span className="role-a">DISADVANTAGES</span></div>
          <div className="me-cell role-c">High capex · High time commitment · Slow to scale</div>
          <div className="me-cell role-c">Limited operational control · Brand dilution risk</div>
          <div className="me-cell role-c">Significant investment · Integration complexity · Brand risk</div>
          <div className="me-cell role-c">Low control over quality · Dependency risk · Margin leakage</div>

          {/* Row 3 */}
          <div className="me-cell me-row-header" style={{ borderBottom: 'none' }}><span className="role-a">BEST WHEN</span></div>
          <div className="me-cell role-c" style={{ borderBottom: 'none' }}>Strong internal capability · Long-term market commitment</div>
          <div className="me-cell role-c" style={{ borderBottom: 'none' }}>Local expertise critical · Risk-sharing needed</div>
          <div className="me-cell role-c" style={{ borderBottom: 'none' }}>Speed is priority · Established player exists</div>
          <div className="me-cell role-c" style={{ borderBottom: 'none' }}>Non-core activity · Testing a new market cheaply</div>
        </div>
      </div>

      <div className="me-trigger-row mt-4" style={{ marginTop: 'auto' }}>
        <div className="me-trigger-card">
          <div className="role-a" style={{ marginBottom: 6 }}>CHOOSE ORGANIC WHEN</div>
          <div className="role-c" style={{ color: 'var(--navy)' }}>Internal capability exists. Market is nascent.<br/>Brand protection is paramount.</div>
        </div>
        <div className="me-trigger-card">
          <div className="role-a" style={{ marginBottom: 6 }}>CHOOSE JV / PARTNERSHIP WHEN</div>
          <div className="role-c" style={{ color: 'var(--navy)' }}>Local knowledge is a moat. Capital constraints present.<br/>Regulatory environment favors local partners.</div>
        </div>
        <div className="me-trigger-card primary">
          <div className="role-a" style={{ marginBottom: 6 }}>CHOOSE ACQUISITION WHEN</div>
          <div className="role-c" style={{ color: 'var(--navy)' }}>Speed to market &gt; cost. Established distribution needed.<br/>Market share gap must close fast.</div>
        </div>
      </div>
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
          <div className={\`me-dot \${slide === 1 ? 'active' : ''}\`} />
          <div className={\`me-dot \${slide === 2 ? 'active' : ''}\`} />
        </div>
        <span className="role-a" style={{ margin: '0 8px' }}>
          0{slide} / 02
        </span>
        <button className="me-nav-btn" onClick={() => setSlide(2)}>→</button>
      </div>
    </div>
  );
}
