/**
 * Allocates a statutory invoice number for a payment and records the invoice on
 * the payments row. Server-only — needs the service-role client.
 *
 * Shared by BOTH payment paths (`/api/razorpay/verify` and the webhook
 * backstop) so one payment can never be invoiced twice under two numbers.
 *
 * DESIGN RULES
 *  1. Never throw at the caller. A failure to invoice must never fail a paid
 *     upgrade — the customer has already been charged and must get access.
 *     Callers get `{ issued: false, reason }` and should alert on it.
 *  2. Never issue a non-compliant invoice. While `lib/legal/company.ts` is
 *     incomplete (no CIN, no registered office) this refuses to issue at all,
 *     and the customer gets the existing plain payment confirmation instead.
 *     An invoice missing its CIN is a s.12(3)(c) default on every copy sent;
 *     a payment confirmation that does not call itself an invoice is not.
 *  3. Allocate only after the payment is known good, so the series stays
 *     consecutive (CGST Rule 46(b)) and failed checkouts burn no numbers.
 */

import type { createServiceClient } from '@/lib/supabase/service';
import { COMPANY, missingStatutoryFields } from './company';
import {
  buildInvoiceDocument,
  financialYearOf,
  formatInvoiceNumber,
  type InvoiceDocument,
  type InvoiceRecipient,
} from './invoice';

type ServiceClient = ReturnType<typeof createServiceClient>;

export interface IssueInvoiceInput {
  /** Identifies the payments row to stamp. */
  readonly razorpayPaymentId: string;
  /** Amount charged, in minor units of `currency` — i.e. `payments.amount_paise`. */
  readonly grossMinor: number;
  readonly currency: 'INR' | 'USD' | 'EUR';
  /** Date of issue, Rule 46(c). Use the payment time, not "now". */
  readonly paidAt: Date;
  readonly recipient: InvoiceRecipient;
  /** Rule 46(h), e.g. 'MECE Pro subscription — 3 months'. */
  readonly description: string;
}

export type IssueInvoiceResult =
  | { readonly issued: true; readonly document: InvoiceDocument }
  | { readonly issued: false; readonly reason: string };

export async function issueInvoiceForPayment(
  db: ServiceClient,
  input: IssueInvoiceInput,
): Promise<IssueInvoiceResult> {
  // Rule 2: refuse rather than emit something non-compliant.
  const problems = missingStatutoryFields(COMPANY);
  if (problems.length > 0) {
    return {
      issued: false,
      reason: `lib/legal/company.ts is incomplete, so no invoice was issued: ${problems.join('; ')}`,
    };
  }

  const fy = financialYearOf(input.paidAt);

  let sequence: number;
  try {
    const { data, error } = await db.rpc('allocate_invoice_sequence', { p_fy: fy.label });
    if (error) {
      return { issued: false, reason: `allocate_invoice_sequence failed: ${error.message}` };
    }
    sequence = Number(data);
    if (!Number.isInteger(sequence) || sequence < 1) {
      return { issued: false, reason: `allocate_invoice_sequence returned ${String(data)}` };
    }
  } catch (e) {
    // Migration 0082 not run yet: degrade to a payment confirmation.
    return { issued: false, reason: `allocate_invoice_sequence threw: ${(e as Error).message}` };
  }

  let document: InvoiceDocument;
  try {
    document = buildInvoiceDocument({
      number: formatInvoiceNumber(fy, sequence),
      issuedAt: input.paidAt,
      grossMinor: input.grossMinor,
      currency: input.currency,
      recipient: input.recipient,
      description: input.description,
    });
  } catch (e) {
    return { issued: false, reason: `buildInvoiceDocument threw: ${(e as Error).message}` };
  }

  const { tax } = document;
  const { error: updateError } = await db
    .from('payments')
    .update({
      invoice_number: document.number,
      invoice_seq: sequence,
      invoice_fy: fy.label,
      invoice_date: document.issuedAt.toISOString(),
      taxable_value_minor: tax.taxableMinor,
      cgst_minor: tax.cgstMinor,
      sgst_minor: tax.sgstMinor,
      igst_minor: tax.igstMinor,
      tax_rate_percent: tax.ratePercent,
      supplier_gstin: document.supplier.gstin,
      sac_code: document.line.sacCode,
      recipient_state_code: input.recipient.stateCode,
      recipient_gstin: input.recipient.gstin,
      place_of_supply: document.placeOfSupply,
      is_export: tax.supplyKind === 'export',
    })
    .eq('razorpay_payment_id', input.razorpayPaymentId);

  if (updateError) {
    // The number is spent but not recorded, which leaves a gap in the series.
    // A gap is a defect worth explaining to an officer; a duplicate number is
    // not defensible at all, so this is the right way round. Alert loudly.
    return {
      issued: false,
      reason:
        `invoice ${document.number} was allocated but could not be saved ` +
        `(${updateError.message}) — sequence ${sequence} for FY ${fy.label} is now a gap`,
    };
  }

  return { issued: true, document };
}
