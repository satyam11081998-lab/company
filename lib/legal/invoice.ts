/**
 * Invoice numbering, tax arithmetic and the invoice document model.
 *
 * Pure functions only — no database, no network, no `Date.now()` except where a
 * date is passed in. Everything here is unit-testable and is mirrored nowhere
 * else; `lib/email/templates.ts` renders what `buildInvoiceDocument` returns and
 * adds no tax logic of its own.
 *
 * STATUTORY BASIS (CGST Rules 2017, Rule 46, read with s.31/s.32 CGST)
 *  (a) supplier name, address, GSTIN
 *  (b) consecutive serial number — max 16 characters, alphabets/numerals/"-"/"/"
 *      only, unique for a financial year
 *  (c) date of issue
 *  (d) recipient name, address, GSTIN/UIN if registered
 *  (g) HSN/SAC
 *  (h) description
 *  (j) total value   (k) taxable value   (l) rate   (m) amount of tax
 *  (n) place of supply with State name, for an inter-State supply
 *  (p) whether tax is payable on reverse charge
 *  (q) signature — NOT required for an invoice issued electronically under the
 *      Information Technology Act 2000, so an emailed invoice needs no DSC
 *  proviso: for services supplied by an OIDAR provider or through an electronic
 *      commerce operator to an UNREGISTERED recipient, the invoice must state
 *      the recipient's State name whatever the value, and that State name is
 *      deemed to be the recipient's address on record. MECE sells online
 *      services to consumers, so this is the operative rule for it — the
 *      Rs 50,000 threshold in clause (e) never gets a chance to apply.
 *  proviso: export invoices carry a prescribed endorsement and show the
 *      recipient's address and the country of destination.
 *
 * Nothing in Rule 46 binds an unregistered supplier. While `COMPANY.gst` is
 * unregistered this module emits a plain commercial invoice: no tax line, no
 * GSTIN, and the words "Tax Invoice" are never used, because s.32 CGST bars an
 * unregistered person from collecting tax and therefore from issuing one.
 */

import {
  COMPANY,
  GST_STATE_CODES,
  missingStatutoryFields,
  registeredOfficeOneLine,
  type CompanyIdentity,
} from './company';

// ─────────────────────────────────────────────────────────────────────────────
// Financial year and invoice numbering
// ─────────────────────────────────────────────────────────────────────────────

/** IST is the product clock (PROJECT_BRAIN §21), and the Indian FY is an IST concept. */
const IST_OFFSET_MINUTES = 330;

function istCalendarParts(d: Date): { year: number; month: number; day: number } {
  const shifted = new Date(d.getTime() + IST_OFFSET_MINUTES * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export interface FinancialYear {
  /** e.g. '26-27' — the form that goes into the invoice number. */
  readonly label: string;
  /** Calendar year the FY starts in, e.g. 2026 for 1 Apr 2026 – 31 Mar 2027. */
  readonly startYear: number;
}

/** The Indian financial year (1 April – 31 March) containing `d`, evaluated in IST. */
export function financialYearOf(d: Date): FinancialYear {
  const { year, month } = istCalendarParts(d);
  const startYear = month >= 4 ? year : year - 1;
  const two = (y: number) => String(y % 100).padStart(2, '0');
  return { label: `${two(startYear)}-${two(startYear + 1)}`, startYear };
}

/**
 * Series prefix. Kept to two characters so the whole number fits Rule 46(b)'s
 * sixteen with room to spare: 'MI' + '/26-27/' + 5 digits = 14 characters, which
 * leaves headroom up to 99,999 invoices in a financial year.
 */
export const INVOICE_SERIES = 'MI';

/** Rule 46(b): alphabets, numerals, hyphen and slash only; at most 16 characters. */
export const INVOICE_NUMBER_PATTERN = /^[A-Za-z0-9/-]{1,16}$/;

/** `MI/26-27/00001`. Throws rather than return a number Rule 46(b) would reject. */
export function formatInvoiceNumber(fy: FinancialYear, sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error(`invoice sequence must be a positive integer, got ${sequence}`);
  }
  const number = `${INVOICE_SERIES}/${fy.label}/${String(sequence).padStart(5, '0')}`;
  if (!INVOICE_NUMBER_PATTERN.test(number)) {
    throw new Error(`invoice number "${number}" violates CGST Rule 46(b)`);
  }
  return number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tax arithmetic
// ─────────────────────────────────────────────────────────────────────────────

export type SupplyKind =
  /** Recipient in the same state as the supplier: CGST + SGST. */
  | 'intra-state'
  /** Recipient in another Indian state: IGST. */
  | 'inter-state'
  /** Recipient outside India: zero-rated export of services. */
  | 'export'
  /** Supplier not registered under GST: no tax may be charged at all. */
  | 'outside-gst';

export interface TaxBreakdown {
  /** What the customer actually paid, in minor units of the currency. */
  readonly grossMinor: number;
  /** Rule 46(k) — value the tax is computed on. Equals gross when no tax applies. */
  readonly taxableMinor: number;
  readonly cgstMinor: number;
  readonly sgstMinor: number;
  readonly igstMinor: number;
  /** Rule 46(l). Zero for exports and for an unregistered supplier. */
  readonly ratePercent: number;
  readonly supplyKind: SupplyKind;
  /** Invariant check: taxable + cgst + sgst + igst === gross. */
  readonly totalMinor: number;
}

export interface TaxInput {
  /** Amount charged, in minor units (paise for INR, cents for USD/EUR). */
  readonly grossMinor: number;
  readonly currency: 'INR' | 'USD' | 'EUR';
  /**
   * Two-digit GST state code of the recipient, when known. Governs the
   * CGST+SGST vs IGST split. Null means no address is on record, and s.12(2)(b)
   * IGST then puts the place of supply at the supplier's location — which is
   * the fallback used here, and which `placeOfSupplyIsFallback` flags.
   */
  readonly recipientStateCode: string | null;
  readonly company?: CompanyIdentity;
}

/** Split a tax amount into halves that provably re-sum to it. */
function halve(amount: number): { cgst: number; sgst: number } {
  const cgst = Math.floor(amount / 2);
  return { cgst, sgst: amount - cgst };
}

/**
 * Classify the supply. A non-INR payment is treated as an export of services:
 * for online services s.13(12) IGST puts the place of supply at the recipient's
 * location, so a recipient outside India makes the supply an export, provided
 * payment is received in convertible foreign exchange (s.2(6) IGST) — which is
 * what a Razorpay international settlement is. Confirm the forex condition with
 * the CA before relying on the zero-rating.
 */
export function classifySupply(input: TaxInput): SupplyKind {
  const company = input.company ?? COMPANY;
  if (!company.gst.registered) return 'outside-gst';
  if (input.currency !== 'INR') return 'export';
  if (input.recipientStateCode && input.recipientStateCode !== company.gst.stateCode) {
    return 'inter-state';
  }
  return 'intra-state';
}

/**
 * Break the amount charged into taxable value and tax.
 *
 * Works in minor units throughout and derives the taxable value by subtraction
 * so that `taxable + tax === gross` exactly. Computing both halves
 * independently and rounding each is what produces invoices that are a paisa
 * short of the amount the customer was charged.
 */
export function computeTaxBreakdown(input: TaxInput): TaxBreakdown {
  const company = input.company ?? COMPANY;
  const { grossMinor } = input;

  if (!Number.isInteger(grossMinor) || grossMinor < 0) {
    throw new Error(`grossMinor must be a non-negative integer, got ${grossMinor}`);
  }

  const supplyKind = classifySupply(input);

  // No tax is chargeable: unregistered supplier, or a zero-rated export.
  if (supplyKind === 'outside-gst' || supplyKind === 'export') {
    return {
      grossMinor,
      taxableMinor: grossMinor,
      cgstMinor: 0,
      sgstMinor: 0,
      igstMinor: 0,
      ratePercent: 0,
      supplyKind,
      totalMinor: grossMinor,
    };
  }

  // `registered` is narrowed by classifySupply having returned a GST kind.
  const gst = company.gst;
  if (!gst.registered) throw new Error('unreachable: taxable supply with unregistered supplier');
  const rate = gst.ratePercent;

  let taxableMinor: number;
  let taxMinor: number;

  if (gst.pricesIncludeTax) {
    // The advertised price already contains the tax; back it out.
    taxMinor = Math.round((grossMinor * rate) / (100 + rate));
    taxableMinor = grossMinor - taxMinor;
  } else {
    taxableMinor = grossMinor;
    taxMinor = Math.round((grossMinor * rate) / 100);
  }

  const isIntra = supplyKind === 'intra-state';
  const { cgst, sgst } = isIntra ? halve(taxMinor) : { cgst: 0, sgst: 0 };
  const igstMinor = isIntra ? 0 : taxMinor;

  return {
    grossMinor,
    taxableMinor,
    cgstMinor: cgst,
    sgstMinor: sgst,
    igstMinor,
    ratePercent: rate,
    supplyKind,
    totalMinor: taxableMinor + cgst + sgst + igstMinor,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// The invoice document
// ─────────────────────────────────────────────────────────────────────────────

/** Rule 46 proviso wording, verbatim. Printed on export invoices. */
export const EXPORT_ENDORSEMENT = {
  'lut-without-payment':
    'SUPPLY MEANT FOR EXPORT/SUPPLY TO SEZ UNIT OR SEZ DEVELOPER FOR AUTHORISED OPERATIONS UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF INTEGRATED TAX',
  'with-payment-of-igst':
    'SUPPLY MEANT FOR EXPORT/SUPPLY TO SEZ UNIT OR SEZ DEVELOPER FOR AUTHORISED OPERATIONS ON PAYMENT OF INTEGRATED TAX',
} as const;

export interface InvoiceRecipient {
  readonly name: string | null;
  readonly email: string | null;
  /** Two-digit GST state code, when known. */
  readonly stateCode: string | null;
  /** Recipient's own GSTIN, if they gave one (B2B — enables their input credit). */
  readonly gstin: string | null;
  /** For exports: the country the service is supplied to. */
  readonly countryOfDestination: string | null;
}

export interface InvoiceLine {
  readonly description: string;
  /** Rule 46(g). Null while unregistered — an SAC is meaningless without a GSTIN. */
  readonly sacCode: string | null;
  readonly quantity: number;
}

export interface InvoiceDocument {
  /**
   * 'tax-invoice' only when the supplier is GST-registered. Otherwise 'invoice':
   * s.32 CGST forbids an unregistered person from issuing a tax invoice.
   */
  readonly kind: 'tax-invoice' | 'invoice';
  readonly title: string;
  readonly number: string;
  readonly issuedAt: Date;
  readonly currency: 'INR' | 'USD' | 'EUR';

  readonly supplier: {
    readonly legalName: string | null;
    readonly tradeName: string;
    readonly address: string | null;
    readonly cin: string | null;
    readonly pan: string | null;
    readonly gstin: string | null;
    readonly phone: string | null;
    readonly email: string;
    readonly website: string;
  };

  readonly recipient: InvoiceRecipient;
  readonly line: InvoiceLine;
  readonly tax: TaxBreakdown;

  /** Rule 46(n). Null when no tax applies and the field carries no meaning. */
  readonly placeOfSupply: string | null;
  /**
   * True when the place of supply fell back to the supplier's own state because
   * no recipient state was on record. Legal under s.12(2)(b)(ii), but once
   * registered the Rule 46 proviso for online services requires the recipient's
   * State name on the invoice — so this must be false in production by then.
   */
  readonly placeOfSupplyIsFallback: boolean;
  /** Rule 46(p). Always false: MECE's own supplies are forward-charge. */
  readonly reverseCharge: boolean;
  readonly exportEndorsement: string | null;
  /** Printed in place of a tax line when the supplier is unregistered. */
  readonly noTaxNote: string | null;
  /**
   * Rule 46(q) proviso — no signature is needed on an invoice issued
   * electronically, so this line explains the absence rather than leaving a
   * reviewer wondering whether a DSC was skipped.
   */
  readonly signatureNote: string;
  /**
   * Non-empty when `company.ts` is still incomplete. The caller MUST NOT present
   * the document as an invoice while this has entries — see `issueInvoice`.
   */
  readonly blockingProblems: readonly string[];
}

export interface BuildInvoiceInput {
  readonly number: string;
  readonly issuedAt: Date;
  readonly grossMinor: number;
  readonly currency: 'INR' | 'USD' | 'EUR';
  readonly recipient: InvoiceRecipient;
  /** e.g. 'MECE Pro subscription — 3 months'. */
  readonly description: string;
  readonly company?: CompanyIdentity;
}

export function buildInvoiceDocument(input: BuildInvoiceInput): InvoiceDocument {
  const company = input.company ?? COMPANY;
  const gst = company.gst;

  const tax = computeTaxBreakdown({
    grossMinor: input.grossMinor,
    currency: input.currency,
    recipientStateCode: input.recipient.stateCode,
    company,
  });

  const registered = gst.registered;
  const isExport = tax.supplyKind === 'export';

  const placeOfSupplyIsFallback =
    registered && !isExport && !input.recipient.stateCode;

  let placeOfSupply: string | null = null;
  if (registered && isExport) {
    placeOfSupply = input.recipient.countryOfDestination
      ? `Outside India — ${input.recipient.countryOfDestination}`
      : 'Outside India';
  } else if (registered) {
    const code = input.recipient.stateCode ?? gst.stateCode;
    const name = GST_STATE_CODES[code] ?? (code === gst.stateCode ? gst.stateName : code);
    placeOfSupply = `${name} (${code})`;
  }

  return {
    kind: registered ? 'tax-invoice' : 'invoice',
    title: registered ? 'Tax Invoice' : 'Invoice',
    number: input.number,
    issuedAt: input.issuedAt,
    currency: input.currency,

    supplier: {
      legalName: company.legalName,
      tradeName: company.tradeName,
      address: registeredOfficeOneLine(company),
      cin: company.cin,
      pan: company.pan,
      gstin: registered ? gst.gstin : null,
      phone: company.phone,
      email: company.email,
      website: company.website,
    },

    recipient: input.recipient,

    line: {
      description: input.description,
      sacCode: registered ? gst.sacCode : null,
      quantity: 1,
    },

    tax,
    placeOfSupply,
    placeOfSupplyIsFallback,
    reverseCharge: false,
    exportEndorsement: registered && isExport ? EXPORT_ENDORSEMENT[gst.exportRoute] : null,
    noTaxNote: registered ? null : gst.note,
    signatureNote:
      'This is a computer-generated invoice issued electronically. No signature is required (CGST Rule 46, proviso to clause (q)).',
    blockingProblems: missingStatutoryFields(company),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Money formatting
// ─────────────────────────────────────────────────────────────────────────────

// Literal symbols, not escapes — the house rule for this repo (PROJECT_BRAIN §5.5).
const CURRENCY_SYMBOL: Readonly<Record<'INR' | 'USD' | 'EUR', string>> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

/** `₹507.63`, `$29.00`. Always two decimals — an invoice shows exact amounts. */
export function formatMinor(minor: number, currency: 'INR' | 'USD' | 'EUR'): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const major = minor / 100;
  return `${CURRENCY_SYMBOL[currency]}${major.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Invoice date as `8 November 2026`.
 *
 * ALWAYS rendered in IST, whatever the customer's currency. The date of issue
 * under Rule 46(c) is a date in the supplier's own books, and the financial
 * year and sequence number were allocated in IST by `financialYearOf`. Printing
 * a UTC date on an export invoice would put a date on the document that
 * disagrees with the series it was numbered in — and for a payment taken in the
 * IST evening of 1 April, it would print a date belonging to the previous
 * financial year. Only the number formatting follows the reader's locale.
 */
export function formatInvoiceDate(d: Date, currency: 'INR' | 'USD' | 'EUR'): string {
  return d.toLocaleDateString(currency === 'INR' ? 'en-IN' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}
