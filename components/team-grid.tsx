'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TEAM_FALLBACK, type TeamMember } from '@/lib/testimonials';

/**
 * "Brains behind MECE" grid for the About page. DB-backed (team_members),
 * managed from /admin/team. Starts from the verified two for instant paint,
 * then swaps to the live list.
 */
export default function TeamGrid({ initialMembers = TEAM_FALLBACK }: { initialMembers?: TeamMember[] }) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);

  useEffect(() => {
    let alive = true;
    fetch('/api/testimonials?type=team')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.items?.length) setMembers(d.items as TeamMember[]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const cols = members.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 ${cols} max-w-3xl mx-auto gap-12`}>
      {members.map((member) => (
        <div key={member.id} className="flex flex-col items-center text-center">
          <Avatar className="mb-6 h-40 w-40 border-[6px] border-border shadow-lg">
            {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.name} className="object-cover" />}
            <AvatarFallback className="bg-navy text-5xl font-semibold text-navy-foreground">
              {member.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="mb-1 flex items-center justify-center gap-2">
            <h3 className="text-2xl font-bold text-foreground">{member.name}</h3>
            {member.linkedin_url && (
              <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="transition-opacity hover:opacity-80" title="View LinkedIn Profile">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
          </div>
          <p className="text-body mb-3 font-medium text-muted-foreground">{member.school}</p>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-primary/20" />
          <p className="max-w-[280px] text-base font-medium leading-snug text-primary">{member.placement}</p>
        </div>
      ))}
    </div>
  );
}
