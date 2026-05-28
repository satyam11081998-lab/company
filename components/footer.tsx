import React from 'react';
import Link from 'next/link';
import Logo from '@/components/logo';

export default function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`bg-navy border-t border-navy-mid/30 pt-16 pb-8 px-6 md:px-12 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1.5 flex flex-col items-start">
            <Link href="/" className="inline-block mb-6">
              <Logo variant="light" className="scale-[0.8] origin-left" />
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
              <li><Link href="/learn/case-studies" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Case Studies</Link></li>
              <li><Link href="/learn/guesstimates" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Guesstimates Guide</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="col-span-1">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs mb-5">Company</h4>
            <ul className="space-y-3.5">
              <li><Link href="#" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="#" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-navy-foreground/60 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-mid/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-navy-foreground/50">
            © {new Date().getFullYear()} MECE Prep. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-navy-foreground/50 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link href="#" className="text-navy-foreground/50 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
