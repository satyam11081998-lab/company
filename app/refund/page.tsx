import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'MECE refund and cancellation policy — cancel any time; 7-day money-back guarantee on Pro plans.',
  alternates: { canonical: '/refund' },
};

export default function RefundPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 min-h-[calc(100vh-64px)] bg-background text-foreground">
      <h1 className="text-4xl font-serif text-foreground font-semibold mb-8">Refund & Cancellation Policy</h1>
      <div className="prose prose-navy max-w-none text-foreground">
        <p>Last updated: June 2026</p>
        <p>Our aim at MECE is to ensure you have the best possible experience. If you are not completely satisfied with our services, we are here to help.</p>
        
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Cancellations</h2>
        <p>You may cancel your subscription at any time. Cancellations will take effect at the end of your current billing cycle, and you will not be charged for subsequent cycles.</p>
        
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Refunds</h2>
        <p>Subscriptions are billed as a one-time charge per month and do not auto-renew. We do not offer a money-back guarantee or refunds for periods that have already elapsed or where the paid features have been substantially used.</p>
        <p className="mt-4">If you were charged in error (for example, a duplicate charge or a failed-but-debited transaction), you are eligible for a full refund. Please reach out to us with your payment details.</p>
        
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
        <p>If you have any questions regarding our refund policy, please reach out to us at <a href="mailto:team@mece.in" className="text-primary hover:underline">team@mece.in</a>.</p>
      </div>
    </main>
  );
}
