import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'MECE refund and cancellation policy — cancel any time; 7-day money-back guarantee on Pro plans.',
  alternates: { canonical: '/refund' },
};

export default function RefundPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 min-h-[calc(100vh-64px)]">
      <h1 className="text-4xl font-serif text-navy font-semibold mb-8">Refund & Cancellation Policy</h1>
      <div className="prose prose-navy max-w-none text-navy-foreground/80">
        <p>Last updated: June 2026</p>
        <p>Our aim at MECE is to ensure you have the best possible experience. If you are not completely satisfied with our services, we are here to help.</p>
        
        <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Cancellations</h2>
        <p>You may cancel your subscription at any time. Cancellations will take effect at the end of your current billing cycle, and you will not be charged for subsequent cycles.</p>
        
        <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Refunds</h2>
        <p>We offer a 7-day money-back guarantee for all our Pro plans. If you are unsatisfied within the first 7 days of your purchase, please contact us for a full refund. After 7 days, all sales are final and no refunds will be issued.</p>
        
        <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Contact Us</h2>
        <p>If you have any questions regarding our refund policy, please reach out to us at <a href="mailto:support@mece.in" className="text-primary hover:underline">support@mece.in</a>.</p>
      </div>
    </main>
  );
}
