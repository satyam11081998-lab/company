import React from 'react';
import Link from 'next/link';
import Logo from '@/components/logo';

export default function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`bg-navy border-t border-navy-mid/30 pt-16 pb-8 px-6 md:px-12 ${className}`}>
      <div className="max-w-6xl w-[80%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1.5 flex flex-col items-start">
            <Link href="/" className="inline-block mb-6">
              <Logo className="scale-[1.4] origin-left" />
            </Link>
            <p className="text-sm text-navy-foreground/70 leading-relaxed max-w-sm mb-6">
              The premier platform for Indian MBA students to master consulting, finance, and product management interviews through structured, MECE-driven practice.
            </p>
          </div>

          {/* Product Column */}
          <div className="col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-5">Product</h4>
            <ul className="space-y-3.5">
              <li><Link href="/cases" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Practice Cases</Link></li>
              <li><Link href="/gd-briefs" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">GD Briefs</Link></li>
              <li><Link href="/leaderboard" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Leaderboard</Link></li>
              <li><Link href="/upgrade" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Pricing & Upgrade</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-5">Resources</h4>
            <ul className="space-y-3.5">
              <li><Link href="/methodology" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Our Methodology</Link></li>
              <li><Link href="/learn/frameworks-mental-models" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Frameworks</Link></li>
              <li><Link href="/learn/practice-case-library" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Case Studies</Link></li>
              <li><Link href="/learn/guesstimates-market-sizing" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Guesstimates Guide</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-5">Company</h4>
            <ul className="space-y-3.5">
              <li><Link href="/about" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">About Us</Link></li>
              <li><a href="mailto:team@mece.in" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Contact Support</a></li>
              <li><Link href="/privacy" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-mid/30 flex justify-center">
          <p className="text-xs text-navy-foreground/50">
             {new Date().getFullYear()} MECE Prep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
