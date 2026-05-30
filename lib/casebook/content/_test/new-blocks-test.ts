import type { Page } from '../../types';

export const newBlocksTest: Page = {
  slug: '_test/new-blocks',
  title: 'New Blocks Test',
  subtitle: 'Internal testing page',
  kind: 'concept',
  blocks: [
    {
      type: 'hook',
      md: 'This is a **magazine-style** hook. It gives the reader a reason to *keep reading*. The most critical part of this test is the emphasize functionality.',
      emphasize: 'emphasize functionality'
    },
    {
      type: 'dialogue',
      title: 'Opening Dialogue',
      turns: [
        {
          speaker: 'interviewer',
          md: 'Welcome. Our client is a large CPG firm looking to enter the pet food market.',
        },
        {
          speaker: 'candidate',
          md: 'Interesting. Could you tell me more about their primary motive? Are they looking for new revenue streams, or is this a defensive move against a competitor?',
          note: 'Good clarifying question.',
        },
        {
          speaker: 'interviewer',
          md: 'Primarily new revenue. They have strong manufacturing capabilities and want to leverage them.',
        },
        {
          speaker: 'narrator',
          md: 'The candidate took 30 seconds to structure their thoughts.',
        },
      ]
    },
    {
      type: 'drill',
      title: 'Structuring Drill',
      instructions: 'How would you structure your approach to this market entry case? Consider the standard buckets.',
      items: [
        {
          prompt: 'Market Attractiveness',
          answer: 'Market size, growth rate, profit margins, and current trends in the pet food industry.',
        },
        {
          prompt: 'Competitive Landscape',
          answer: 'Key players, market share, product differentiation, barriers to entry.',
        },
        {
          prompt: 'Company Capabilities',
          answer: 'Client\'s current manufacturing capacity, distribution channels, brand equity, and capital available for investment.',
        },
      ]
    },
    {
      type: 'comparison',
      title: 'Candidate Evaluation',
      headers: ['Weak', 'Average', 'Strong'],
      rows: [
        {
          label: 'Structure',
          cells: [
            'Jumps straight to solutions without a framework.',
            'Uses a standard framework (e.g. 4Ps) but doesn\'t adapt it.',
            'Creates a custom MECE structure tailored to the specific prompt.',
          ]
        },
        {
          label: 'Synthesis',
          cells: [
            'Repeats the facts given.',
            'Summarizes the main points well.',
            'Draws second-order insights and clearly answers the core question.',
          ]
        },
        {
          cells: [
            'No label row 1',
            'No label row 2',
            'No label row 3',
          ]
        }
      ]
    },
    {
      type: 'svg',
      caption: 'Token-driven test diagram — should recolor in dark mode.',
      ariaLabel: 'Test diagram with two boxes and a connector',
      maxWidth: 480,
      svg: `<svg viewBox="0 0 400 160" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
    <rect x="20" y="50" width="150" height="60" rx="8" fill="var(--card)" stroke="var(--border)" stroke-width="1.5"/>
    <text x="95" y="85" text-anchor="middle" font-size="14" font-weight="600" fill="var(--foreground)">Revenue</text>
    <rect x="230" y="50" width="150" height="60" rx="8" fill="var(--primary)" stroke="none"/>
    <text x="305" y="85" text-anchor="middle" font-size="14" font-weight="600" fill="#ffffff">Cost</text>
    <line x1="170" y1="80" x2="230" y2="80" stroke="var(--border-strong)" stroke-width="2"/>
  </svg>`
    }
  ]
};
