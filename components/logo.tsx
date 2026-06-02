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

  // Subtitle characters and their precise x-positions from the new original SVG
  const subtitleChars = [
    { char: 'M', x: 1108.47, fill: '#CA121E' },
    { char: 'e', x: 1146.86 },
    { char: 't', x: 1172.07 },
    { char: 'h', x: 1184.67 },
    { char: 'o', x: 1209.88 },
    { char: 'd', x: 1235.09 },
    { char: ' ', x: 1260.3 },
    { char: 'f', x: 1272.9 },
    { char: 'o', x: 1285.5 },
    { char: 'r', x: 1310.71 },
    { char: ' ', x: 1326.18 },
    { char: 'E', x: 1338.78, fill: '#CA121E' },
    { char: 'v', x: 1369.15 },
    { char: 'a', x: 1392.07 },
    { char: 'l', x: 1417.27 },
    { char: 'u', x: 1427.59 },
    { char: 'a', x: 1452.8 },
    { char: 't', x: 1478 },
    { char: 'i', x: 1490.61 },
    { char: 'n', x: 1500.92 },
    { char: 'g', x: 1526.13 },
    { char: ' ', x: 1551.34 },
    { char: 'C', x: 1563.94, fill: '#CA121E' },
    { char: 'o', x: 1597.17 },
    { char: 'r', x: 1622.38 },
    { char: 'p', x: 1637.85 },
    { char: 'o', x: 1663.06 },
    { char: 'r', x: 1688.26 },
    { char: 'a', x: 1703.73 },
    { char: 't', x: 1728.94 },
    { char: 'e', x: 1741.55 },
    { char: ' ', x: 1766.75 },
    { char: 'E', x: 1779.36, fill: '#CA121E' },
    { char: 'x', x: 1809.72 },
    { char: 'c', x: 1832.64 },
    { char: 'e', x: 1855.56 },
    { char: 'l', x: 1880.76 },
    { char: 'l', x: 1891.08 },
    { char: 'e', x: 1901.39 },
    { char: 'n', x: 1926.6 },
    { char: 'c', x: 1951.81 },
    { char: 'e', x: 1974.72 },
  ];

  return (
    <svg
      viewBox="657 274 1560 470"
      className={`h-[97.2px] w-auto flex-shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Mask to create transparent cuts inside the triangle */}
        <mask id="logo-transparency-cuts">
          {/* Default visible area (everything white is kept) */}
          <rect x="657" y="274" width="1560" height="470" fill="#FFFFFF" />
          
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

      <g>
        <g mask="url(#logo-transparency-cuts)">
          <path
            d="M826.5 341 996 638 657 638 826.5 341Z"
            fill="#CA121E"
            fillRule="evenodd"
          />
          <path
            d="M849.5 381 996 638 703 638 849.5 381Z"
            fill={navySymbolColor}
            fillRule="evenodd"
          />
        </g>

        {/* Vertical Separator Line */}
        <path 
          d="M1045.5 309.5 1045.5 677.308" 
          stroke={navyColor} 
          strokeWidth="4.58333" 
          strokeLinejoin="round" 
          strokeMiterlimit="10" 
          fill="none" 
          fillRule="evenodd"
        />

        {/* MECE Text letters (converted from MS PUA symbols) */}
        <text
          fill={navyColor}
          fontFamily="SansSerif,SansSerif_MSFontService,sans-serif"
          fontWeight="700"
          fontSize="223"
          x="1107.73"
          y="559"
        >
          M
        </text>
        <text
          fill={navyColor}
          fontFamily="SansSerif,SansSerif_MSFontService,sans-serif"
          fontWeight="700"
          fontSize="223"
          x="1375.86"
          y="559"
        >
          E
        </text>
        <text
          fill={navyColor}
          fontFamily="SansSerif,SansSerif_MSFontService,sans-serif"
          fontWeight="700"
          fontSize="223"
          x="1607.32"
          y="559"
        >
          C
        </text>
        <text
          fill={navyColor}
          fontFamily="SansSerif,SansSerif_MSFontService,sans-serif"
          fontWeight="700"
          fontSize="223"
          x="1850.81"
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
            fontSize="46"
            x={item.x}
            y="631"
          >
            {item.char}
          </text>
        ))}
      </g>
    </svg>
  );
}
