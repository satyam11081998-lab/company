import React from 'react';
import Link from 'next/link';
import Logo from '@/components/logo';

export default function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`bg-navy border-t border-navy-mid/30 pt-10 pb-6 px-6 md:px-12 ${className}`}>
      <div className="max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-10">
          {/* Brand Column */}
          <div className="md:col-span-5 lg:col-span-5 flex flex-col items-start pr-0 md:pr-8">
            <Link href="/" className="inline-block -mb-2 md:-mb-4 -ml-4 md:-ml-6">
              <Logo full variant="light" className="!h-[107px] md:!h-[133px]" />
            </Link>
            <p className="text-sm text-navy-foreground/70 leading-relaxed max-w-sm mb-6">
              The premier platform for Indian MBA students to master consulting, finance, and product management interviews through structured, MECE-driven practice.
            </p>
          </div>

          {/* Links Wrapper */}
          <div className="md:col-span-7 lg:col-span-6 lg:col-start-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Product Column */}
            <div>
              <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-5">Product</h4>
              <ul className="space-y-3.5">
                <li><Link href="/cases" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Practice Cases</Link></li>
                <li><Link href="/gd-briefs" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">GD Briefs</Link></li>
                <li><Link href="/leaderboard" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Leaderboard</Link></li>
                <li><Link href="/upgrade" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Pricing & Upgrade</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-5">Resources</h4>
              <ul className="space-y-3.5">
                <li><Link href="/methodology" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Our Methodology</Link></li>
                <li><Link href="/learn/casebook/getting-started/what-it-tests" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">The MECE Casebook</Link></li>
                <li><Link href="/learn/casebook/cases/profitability/regional-dairy-cooperative" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Worked Case Interviews</Link></li>
                <li><Link href="/learn/casebook/guesstimates/pain-and-promise" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Guesstimates Guide</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-5">Company</h4>
              <ul className="space-y-3.5">
                <li><Link href="/about" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">About Us</Link></li>
                <li><a href="mailto:team@mece.in" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Contact Support</a></li>
                <li><Link href="/privacy" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-navy-mid/30 flex justify-center">
          <p className="text-xs text-navy-foreground/50">
             &copy; {new Date().getFullYear()} MECE Prep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
