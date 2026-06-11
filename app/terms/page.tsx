import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import { UserProvider } from '@/components/user-context';
import Footer from '@/components/footer';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms of service',
  description: 'The terms that govern your use of MECE.',
  alternates: { canonical: '/terms' },
};

export default async function TermsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userRow: UserRow | null = null;
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
    userRow = data as UserRow | null;
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <UserProvider initialUser={userRow}>
        <AppNav />
      </UserProvider>
      <main className="container max-w-4xl py-16 flex-grow">
        <div className="mb-12">
          <p className="text-base font-semibold uppercase tracking-wider text-primary mb-2">Legal</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-4 text-muted-foreground">Last Updated: June 2026</p>
        </div>

        <div className="prose prose-slate max-w-none text-foreground/80 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using MECE.in (the "Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services. These Terms apply to all visitors, users, and others who access or use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
            <p className="leading-relaxed mb-4">
              MECE is an AI-powered placement-interview preparation platform tailored for Indian MBA and PGDM students. The Platform provides case studies, guesstimates, group discussion briefs, and an automated evaluation rubric.
            </p>
            <p className="leading-relaxed">
              <strong>Disclaimer of Affiliation:</strong> MECE is an independent educational tool. We are not affiliated with, endorsed by, or connected to McKinsey & Company, Boston Consulting Group (BCG), Bain & Company, or any specific firm, university, or business school referenced on the Platform. Trademarks belong to their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. User Accounts and Responsibilities</h2>
            <p className="leading-relaxed mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for safeguarding the password that you use to access the Service.</li>
              <li>You agree not to disclose your password to any third party.</li>
              <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
              <li>You agree not to use the Platform for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Subscriptions, Payments, and Refunds</h2>
            <p className="leading-relaxed mb-4">
              MECE offers free access with limited usage, as well as premium subscription tiers ("Lite" and "Pro") that unlock unlimited practice and additional features.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Billing:</strong> Premium tiers are billed on a recurring monthly or annual basis depending on your selection. Payments are securely processed via Razorpay.</li>
              <li><strong>Modifications:</strong> We reserve the right to change our subscription plans or adjust pricing. Any price changes will apply to subsequent billing cycles following notice to you.</li>
              <li><strong>Refund Policy:</strong> All subscription charges are non-refundable unless otherwise required by applicable Indian consumer protection laws. If you cancel your subscription, you will retain access to the premium features until the end of your current billing period.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Intellectual Property Rights</h2>
            <p className="leading-relaxed">
              The Platform and its original content (excluding User-Generated Content), features, and functionality are and will remain the exclusive property of MECE and its licensors. The Platform is protected by copyright, trademark, and other laws of India. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of MECE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. User-Generated Content and AI Evaluation</h2>
            <p className="leading-relaxed mb-4">
              By submitting responses, calculations, and text to the Platform ("User Content"), you grant us a non-exclusive, worldwide, royalty-free license to process, store, and evaluate your submissions for the purpose of providing the service.
            </p>
            <p className="leading-relaxed">
              <strong>Evaluation Limitations:</strong> MECE relies on Artificial Intelligence (OpenAI API) to evaluate User Content. While we strive for high accuracy, the AI evaluation augments practice but does not replace human feedback. We assess written submissions only; live behavioral signals are not captured. We are not liable for any placement outcomes or decisions made based on MECE scores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Termination</h2>
            <p className="leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Platform will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              In no event shall MECE, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; and (iii) unauthorized access, use or alteration of your transmissions or content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or the Platform shall be resolved exclusively in the courts located in India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms, please contact us at: <a href="mailto:team@mece.in" className="text-primary hover:underline">team@mece.in</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
