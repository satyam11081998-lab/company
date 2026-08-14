/* scripts/seed-founder-certificate.ts
 *
 * One-shot: inserts the Founder certificate for Satyam Kumar into the
 * existing certificates table.
 *
 * Run:
 *   set SUPABASE_SERVICE_ROLE_KEY=<your-key>
 *   npx tsx scripts/seed-founder-certificate.ts
 *
 * Or pass the key inline:
 *   npx tsx scripts/seed-founder-certificate.ts --key <your-service-role-key>
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ihwhvjoykwpvxoaivbjz.supabase.co';
const keyArg = process.argv.find((a) => a.startsWith('--key='))?.split('=')[1]
  ?? process.argv[process.argv.indexOf('--key') + 1];
const key = keyArg || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  console.error(
    '❌ Missing SUPABASE_SERVICE_ROLE_KEY.\n' +
    '   Set it in .env.local or pass: --key <your-service-role-key>\n' +
    '   Find it at: Supabase Dashboard → Project Settings → API → service_role',
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function seed() {
  // 1. Generate a proper certificate ID via the existing DB function.
  const { data: certId, error: idError } = await supabase.rpc('generate_certificate_id', {});
  if (idError || !certId) {
    console.error('❌ Failed to generate certificate ID:', idError?.message);
    process.exit(1);
  }
  console.log(`🔑 Generated certificate ID: ${certId}`);

  // 2. Insert the Founder certificate.
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      cert_id: certId,
      cert_title: 'Certificate of Live Project & Foundership',
      recipient_name: 'Satyam Kumar',
      recipient_program: null,
      recipient_email: null,
      role_title: 'Founder & Product Builder',
      project_title: 'mece.in - AI-led case, guesstimate & interview preparation platform for Indian MBA students',
      start_date: '2026-06-15',
      end_date: '2026-08-15',
      duration_label: '2 months',
      engagement_mode: null,
      reporting_to: null,
      scope_line: 'Scope of work: 0-to-1 product development, product strategy, platform execution, and launch.',
      work_notes: 'Founder certificate. Satyam Kumar is the founder of mece.in.',
      engagement_type: 'Foundership: conceived, built and launched the platform.',
      sig1_name: 'Kishan Jayaswal',
      sig1_title: 'Founder, MECE',
      sig2_name: 'Mohit Kumar Raj',
      sig2_title: 'Co-Founder, MECE',
      created_by: null,
    })
    .select('cert_id, recipient_name, cert_title, start_date, end_date')
    .single();

  if (error) {
    console.error('❌ Failed to insert certificate:', error.message);
    process.exit(1);
  }

  console.log('✅ Founder certificate seeded successfully:');
  console.log(`   Certificate ID : ${data.cert_id}`);
  console.log(`   Recipient      : ${data.recipient_name}`);
  console.log(`   Title          : ${data.cert_title}`);
  console.log(`   Period         : ${data.start_date} to ${data.end_date}`);
  console.log(`   Verify URL     : https://mece.in/verify/${data.cert_id}`);
  process.exit(0);
}

seed();
