import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // Deprecated: logo now switches automatically via CSS based on theme
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <>
      {/* Light mode logo (hidden in dark mode) */}
      <img 
        src="/logo-light.png" 
        alt="MECE Logo" 
        className={`block dark:hidden h-10 md:h-[66px] w-auto flex-shrink-0 ${className}`} 
      />
      {/* Dark mode logo (hidden in light mode) */}
      <img 
        src="/logo-dark.png" 
        alt="MECE Logo" 
        className={`hidden dark:block h-10 md:h-[66px] w-auto flex-shrink-0 ${className}`} 
      />
    </>
  );
}
