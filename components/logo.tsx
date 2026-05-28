import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Logo({ className = "", variant = 'dark' }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-navy';
  const mutedTextColor = variant === 'light' ? 'text-white/80' : 'text-navy-soft';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Triangle SVG */}
      <svg viewBox="0 0 100 100" className={`w-[52px] h-[52px] flex-shrink-0 ${textColor}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="logo-cuts">
            <rect width="100" height="100" fill="white" />
            {/* The white sweeping cut lines */}
            <path d="M 25 95 C 40 60, 48 30, 50 2" stroke="black" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 52 95 C 70 65, 65 30, 50 2" stroke="black" strokeWidth="4" fill="none" strokeLinecap="round" />
          </mask>
        </defs>
        <g mask="url(#logo-cuts)">
          {/* Base Triangle */}
          <polygon points="50,2 5,95 95,95" className="fill-current" />
          {/* Red Slice - ensuring it only covers the left-most segment */}
          <polygon points="50,2 5,95 32,95 50,2" className="fill-primary" />
        </g>
      </svg>
      
      {/* Vertical Line */}
      <div className={`w-[2px] h-12 ${variant === 'light' ? 'bg-white/20' : 'bg-border/80'}`}></div>
      
      {/* Text Block */}
      <div className="flex flex-col justify-center select-none w-[170px] pt-0.5">
        <div className={`text-3xl font-extrabold leading-none ${textColor} flex justify-between items-center tracking-wider`}>
          <span>M</span><span>E</span><span>C</span><span>E</span>
        </div>
        
        <div className="h-[2px] w-full bg-primary mt-1.5 mb-1.5 rounded-full"></div>
        
        <div className={`text-[8.5px] font-medium ${mutedTextColor} flex justify-between whitespace-nowrap`}>
          <span><span className="text-primary font-bold">M</span>ethod</span>
          <span>for</span>
          <span><span className="text-primary font-bold">E</span>valuating</span>
          <span><span className="text-primary font-bold">C</span>orporate</span>
          <span><span className="text-primary font-bold">E</span>xcellence</span>
        </div>
      </div>
    </div>
  );
}
