import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // 'light' is for dark backgrounds (white text), 'dark' is for light backgrounds (navy text)
}

export default function Logo({ className = "", variant = 'dark' }: LogoProps) {
  const isDarkBackground = variant === 'light';
  
  // Navy colors in original SVG become white on dark backgrounds
  const navyColor = isDarkBackground ? '#FFFFFF' : '#081B3B';
  const navySoftColor = isDarkBackground ? '#FFFFFF' : '#091E39';
  const navySymbolColor = isDarkBackground ? '#FFFFFF' : '#071A3A';

  // Subtitle characters and their precise x-positions from the original SVG
  const subtitleChars = [
    { char: 'M', x: 1131.35, fill: '#CA121E' },
    { char: 'e', x: 1159.99 },
    { char: 't', x: 1178.9 },
    { char: 'h', x: 1188.64 },
    { char: 'o', x: 1207.55 },
    { char: 'd', x: 1226.45 },
    { char: ' ', x: 1245.36 },
    { char: 'f', x: 1255.1 },
    { char: 'o', x: 1264.84 },
    { char: 'r', x: 1283.74 },
    { char: ' ', x: 1295.2 },
    { char: 'E', x: 1304.94, fill: '#CA121E' },
    { char: 'v', x: 1327.86 },
    { char: 'a', x: 1345.05 },
    { char: 'l', x: 1363.95 },
    { char: 'u', x: 1371.4 },
    { char: 'a', x: 1390.31 },
    { char: 't', x: 1409.21 },
    { char: 'i', x: 1418.95 },
    { char: 'n', x: 1426.4 },
    { char: 'g', x: 1445.31 },
    { char: ' ', x: 1464.21 },
    { char: 'C', x: 1473.95, fill: '#CA121E' },
    { char: 'o', x: 1498.59 },
    { char: 'r', x: 1517.49 },
    { char: 'p', x: 1528.95 },
    { char: 'o', x: 1547.86 },
    { char: 'r', x: 1566.77 },
    { char: 'a', x: 1578.22 },
    { char: 't', x: 1597.13 },
    { char: 'e', x: 1606.87 },
    { char: ' ', x: 1625.78 },
    { char: 'E', x: 1635.52, fill: '#CA121E' },
    { char: 'x', x: 1658.43 },
    { char: 'c', x: 1675.62 },
    { char: 'e', x: 1692.81 },
    { char: 'l', x: 1711.71 },
    { char: 'l', x: 1719.16 },
    { char: 'e', x: 1726.61 },
    { char: 'n', x: 1745.52 },
    { char: 'c', x: 1764.42 },
    { char: 'e', x: 1781.61 },
  ];

  return (
    <svg
      viewBox="657 274 1429 470"
      className={`h-[64.8px] w-auto flex-shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Mask to create transparent cuts inside the triangle */}
        <mask id="logo-transparency-cuts">
          {/* Default visible area (everything white is kept) */}
          <rect x="657" y="274" width="1429" height="470" fill="#FFFFFF" />
          
          {/* Slices (everything black is cut out / made transparent) */}
          <path
            d="M692.84 655.201 859.087 364.87 897.476 386.852 731.229 677.183Z"
            fill="#000000"
            fillRule="evenodd"
          />
          <path
            d="M774.03 690.768 940.278 400.437 978.393 422.262 812.145 712.593Z"
            fill="#000000"
            fillRule="evenodd"
          />
        </mask>
      </defs>

      {/* Main Group with translation matching original SVG */}
      <g>
        {/* Triangles Group using the transparency mask */}
        <g mask="url(#logo-transparency-cuts)">
          {/* Red Left Triangle */}
          <path
            d="M826.5 341 996 638 657 638 826.5 341Z"
            fill="#CA121E"
            fillRule="evenodd"
          />
          {/* Navy Right Triangle (adapts to background) */}
          <path
            d="M849.5 381 996 638 703 638 849.5 381Z"
            fill={navySymbolColor}
            fillRule="evenodd"
          />
        </g>

        {/* MECE Text letters (converted from MS PUA symbols) */}
        <text
          fill={navyColor}
          fontFamily="SansSerif,SansSerif_MSFontService,sans-serif"
          fontWeight="700"
          fontSize="223"
          x="1045.32"
          y="559"
        >
          M
        </text>
        <text
          fill={navyColor}
          fontFamily="SansSerif,SansSerif_MSFontService,sans-serif"
          fontWeight="700"
          fontSize="223"
          x="1296.3"
          y="559"
        >
          E
        </text>
        <text
          fill={navyColor}
          fontFamily="SansSerif,SansSerif_MSFontService,sans-serif"
          fontWeight="700"
          fontSize="223"
          x="1510.62"
          y="559"
        >
          C
        </text>
        <text
          fill={navyColor}
          fontFamily="SansSerif,SansSerif_MSFontService,sans-serif"
          fontWeight="700"
          fontSize="223"
          x="1736.96"
          y="559"
        >
          E
        </text>

        {/* Subtitle text letters (mapped and converted) */}
        {subtitleChars.map((item, idx) => (
          <text
            key={idx}
            fill={item.fill || navySoftColor}
            fontFamily="SansSerif,SansSerif_MSFontService,sans-serif"
            fontWeight="400"
            fontSize="34"
            x={item.x}
            y="628"
          >
            {item.char}
          </text>
        ))}

        {/* Horizontal flanking lines below the subtitle */}
        {/* Left Line */}
        <path
          d="M1018.5 619.5 1101 619.5"
          stroke={navySoftColor}
          strokeWidth="5.27083"
          strokeLinecap="square"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          fill="none"
          fillRule="evenodd"
        />
        {/* Right Line */}
        <path
          d="M1843.5 619.5 1926 619.5"
          stroke={navyColor}
          strokeWidth="5.27083"
          strokeLinecap="square"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          fill="none"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

