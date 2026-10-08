/**
 * Re-mounts on every CRM navigation (Next.js templates do), so each page
 * eases in instead of snapping. Off for people who prefer reduced motion.
 */
export default function CrmTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 motion-reduce:animate-none">{children}</div>;
}
