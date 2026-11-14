/**
 * Statutory identity of the company that trades as MECE.
 *
 * WHY THIS FILE EXISTS
 * ────────────────────
 * Two different laws put specific identifiers on documents MECE sends out, and
 * they have nothing to do with each other:
 *
 *  1. Companies Act 2013, s.12(3)(c). Every company must get its name, the
 *     address of its registered office and its Corporate Identity Number,
 *     along with its telephone number, e-mail address and — if it has them —
 *     fax number and website, printed on ALL its business letters, billheads,
 *     letter papers and in all its notices and other official publications.
 *     Default penalty under s.12(8) is Rs 1,000 for every day the default
 *     continues, capped at Rs 1,00,000, on the company and on every officer in
 *     default. The ROC adjudicates it on inspection and does so routinely.
 *     => These fields belong on every outbound email, not only on invoices.
 *
 *  2. CGST Rules 2017, Rule 46. The particulars a *tax invoice* must carry.
 *     These bind only once the company is registered under GST. Until then
 *     s.32 CGST bars an unregistered person from collecting tax, and a tax
 *     invoice cannot be issued at all — the right document is a plain
 *     commercial invoice with no tax line and no GSTIN on it. (A "bill of
 *     supply" is also wrong: s.31(3)(c) makes that a registered person's
 *     document, for exempt supplies and composition dealers.)
 *
 * WHY THESE VALUES ARE IN CODE AND NOT IN ENV VARS
 * Everything here is public register data, not a secret. A Vercel variable
 * scoped to one environment and not the other has already cost this project
 * weeks of failed deploys (PROJECT_BRAIN §13.2, §22), and an invoice that
 * silently loses its CIN in Preview is a compliance bug. One reviewed file is
 * safer than nine environment variables.
 *
 * HOW TO FILL THIS IN
 * Replace every `null` below with the value from the Certificate of
 * Incorporation / GST registration certificate. `missingStatutoryFields()`
 * lists what is still outstanding, and `lib/legal/invoice.ts` refuses to call a
 * document an invoice while anything mandatory is missing — it degrades to a
 * plain payment confirmation instead of emitting a non-compliant invoice.
 * Never put a placeholder or guessed CIN/GSTIN here: a wrong identifier on a
 * real invoice is worse than an absent one.
 */

/** Two-digit GST state codes, for the states MECE is likely to need. */
export const GST_STATE_CODES: Readonly<Record<string, string>> = {
  '07': 'Delhi',
  '06': 'Haryana',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '19': 'West Bengal',
  '24': 'Gujarat',
  '08': 'Rajasthan',
  '03': 'Punjab',
  '23': 'Madhya Pradesh',
  '32': 'Kerala',
  '37': 'Andhra Pradesh',
  '21': 'Odisha',
};

export interface RegisteredOffice {
  /** Street address lines, in the order they should be printed. */
  readonly lines: readonly string[];
  readonly city: string;
  readonly state: string;
  /** Two-digit GST state code for `state`. Determines CGST+SGST vs IGST. */
  readonly stateCode: string;
  readonly postalCode: string;
  readonly country: string;
}

/**
 * GST position. Unregistered is a first-class state, not a missing value: most
 * of what Rule 46 requires must be absent while the company is unregistered.
 */
export type GstStatus =
  | {
      readonly registered: false;
      /** Printed on the invoice so the customer knows why there is no tax line. */
      readonly note: string;
    }
  | {
      readonly registered: true;
      readonly gstin: string;
      /** The state MECE supplies FROM — its place of business. */
      readonly stateName: string;
      readonly stateCode: string;
      /** SAC for the service supplied. 999293 = commercial training and coaching. */
      readonly sacCode: string;
      /** Rate on the supply, per cent. Commercial training/coaching is 18. */
      readonly ratePercent: number;
      /**
       * TRUE  — the ₹299/₹599 shown on /pricing already contain the tax, and the
       *         taxable value is backed out of it. Nothing on the pricing page
       *         changes and no customer is charged more.
       * FALSE — tax is added on top, so every displayed price rises by the rate.
       * Default is TRUE because the prices are live, consumer-facing and
       * advertised without a tax qualifier.
       */
      readonly pricesIncludeTax: boolean;
      /**
       * Route for exports (US/EU sales). Both are zero-rated; they differ in
       * paperwork. 'lut-without-payment' needs Form RFD-11 filed for the
       * financial year BEFORE the first export invoice is raised.
       */
      readonly exportRoute: 'lut-without-payment' | 'with-payment-of-igst';
    };

export type EntityType =
  | 'private-limited'
  | 'public-limited'
  | 'one-person-company'
  | 'llp'
  | 'partnership'
  | 'proprietorship';

/**
 * A CIN is self-describing, so most of what you would otherwise have to type in
 * is already inside it. U85499DL2026PTC123456 decomposes as:
 *
 *   U        listing status — U unlisted, L listed
 *   85499    industry code
 *   DL       state of the ROC            → indices 6-7
 *   2026     year of incorporation
 *   PTC      ownership code              → indices 12-14
 *   123456   registration number
 *
 * So `entityType` and the registered-office state do not need stating
 * separately — they are derived here and then cross-checked against whatever
 * else is filled in, which turns the CIN into a check digit for the rest.
 */
const CIN_OWNERSHIP_TO_ENTITY: Readonly<Record<string, EntityType>> = {
  PTC: 'private-limited',
  FTC: 'private-limited', // subsidiary of a foreign company, private
  OPC: 'one-person-company',
  PLC: 'public-limited',
  FLC: 'public-limited', // subsidiary of a foreign company, public
};

/** ROC state letters → GST two-digit state code, for cross-checking the address. */
const CIN_STATE_TO_GST_CODE: Readonly<Record<string, string>> = {
  DL: '07', HR: '06', UP: '09', BR: '10', MH: '27', KA: '29', TN: '33',
  TG: '36', WB: '19', GJ: '24', RJ: '08', PB: '03', MP: '23', KL: '32',
  AP: '37', OR: '21', UT: '05', CH: '04', AS: '18', JH: '20', GA: '30',
  HP: '02', JK: '01', CT: '22', PY: '34',
};

/** Entity type read out of the CIN, or null when there is no usable CIN. */
export function entityTypeFromCin(cin: string | null): EntityType | null {
  if (!cin || !isValidCin(cin)) return null;
  return CIN_OWNERSHIP_TO_ENTITY[cin.slice(12, 15)] ?? null;
}

/** GST state code implied by the CIN's ROC state letters, when recognised. */
export function stateCodeFromCin(cin: string | null): string | null {
  if (!cin || !isValidCin(cin)) return null;
  return CIN_STATE_TO_GST_CODE[cin.slice(6, 8)] ?? null;
}

/** The entity type, stated explicitly or read out of the CIN. */
export function effectiveEntityType(c: CompanyIdentity = COMPANY): EntityType | null {
  return c.entityType ?? entityTypeFromCin(c.cin);
}

export interface CompanyIdentity {
  /** Exact name on the Certificate of Incorporation, including "Private Limited". */
  readonly legalName: string | null;
  /** The brand. Printed as "trading as", never in place of the legal name. */
  readonly tradeName: string;
  /**
   * Leave null for a company — it is derived from the CIN. Only state it when
   * there is no CIN to derive it from: an LLP, a firm or a proprietorship.
   */
  readonly entityType: EntityType | null;
  /** 21-character CIN. Mandatory under s.12(3)(c) for a company or an OPC. */
  readonly cin: string | null;
  /** Not statutorily required on an invoice, but customers deducting TDS ask for it. */
  readonly pan: string | null;
  readonly registeredOffice: RegisteredOffice | null;
  /** Mandatory under s.12(3)(c) — the "if any" in that clause covers fax and website, not this. */
  readonly phone: string | null;
  /** Mandatory under s.12(3)(c). */
  readonly email: string;
  readonly website: string;
  readonly gst: GstStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE ONE PLACE TO EDIT
// ─────────────────────────────────────────────────────────────────────────────

export const COMPANY: CompanyIdentity = {
  // ── REQUIRED: these are what Companies Act s.12(3)(c) actually names ──
  // All taken from the Certificate of Incorporation dated 2 November 2026
  // (CRC, Manesar). Incorporated under the Companies Act 2013, limited by
  // shares. Industry code 85499 = other education n.e.c.
  legalName: 'MECE Technologies Private Limited',
  cin: 'U85499HR2026PTC152350',
  // The COI prints this as the "Mailing Address as per record available in
  // Registrar of Companies office":
  //   RADHEY SHAYAM Vill, Chandhat, Palwal, Palwal, Faridabad- 121102, Haryana
  // Reproduced here without the repeated district token. VERIFY against the
  // "Registered Address" on the MCA master-data page before the first invoice
  // goes out — s.12(3)(c) wants the registered office, and if INC-22 ever
  // moves it, this line moves with it.
  registeredOffice: {
    lines: ['Radhey Shayam, Vill. Chandhat'],
    city: 'Palwal',
    state: 'Haryana',
    stateCode: '06',
    postalCode: '121102',
    country: 'India',
  },
  phone: '+91 74164 40232',

  // ── OPTIONAL: nothing below is required to issue a compliant invoice ──
  tradeName: 'MECE',
  // Derived from the CIN's PTC ownership code. Only set this if NOT a company.
  entityType: null,
  // Not required on an invoice by any rule, but it is on the COI and a
  // customer deducting TDS will ask for it. (TAN, for tax MECE itself
  // deducts, is RTKM24302F — not an invoice field, so it is not kept here.)
  pan: 'AAVCM7131N',
  email: 'team@mece.in',
  website: 'https://mece.in',

  // Current position: revenue to date is far below the Rs 20 lakh services
  // threshold (s.22 CGST), and Notification 10/2017-Integrated Tax keeps the
  // US/EU sales from forcing registration, because inter-State supply of
  // *services* below the threshold is exempt from compulsory registration
  // under s.24. So no GST is charged and none may be.
  // When registration happens, replace this whole object with the registered
  // variant below and nothing else in the codebase needs to change.
  gst: {
    registered: false,
    note: 'GST not applicable — supplier is not registered under GST.',
  },

  // ── Registered variant, ready to swap in ──────────────────────────────────
  // The GSTIN will read 06 + AAVCM7131N + entity digit + Z + checksum, because
  // characters 3-12 of a GSTIN are always the PAN and 06 is Haryana — where the
  // registered office is. If GST is taken in a different state (supply is
  // actually made from Delhi), stateCode and stateName must change together and
  // `missingStatutoryFields` will flag a GSTIN that disagrees with them.
  // gst: {
  //   registered: true,
  //   gstin: '06AAVCM7131N1Z?',        // TODO: exactly as on the GST certificate
  //   stateName: 'Haryana',
  //   stateCode: '06',
  //   sacCode: '999293',               // commercial training and coaching, 18%
  //   ratePercent: 18,
  //   pricesIncludeTax: true,          // ₹599 stays ₹599; CA to confirm
  //   exportRoute: 'lut-without-payment',
  // },
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CIN: 21 characters — listing status (L/U) + 5-digit industry code +
 * 2-letter state + 4-digit year of incorporation + 3-letter ownership code
 * (PTC private, PLC public, OPC one-person) + 6-digit registration number.
 */
export const CIN_PATTERN = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;

/** PAN: 5 letters + 4 digits + 1 letter. 4th letter is the holder type. */
export const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/;

/** GSTIN: 2-digit state code + 10-character PAN + entity digit + 'Z' + checksum. */
export const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;

export function isValidCin(value: string): boolean {
  return CIN_PATTERN.test(value);
}

export function isValidPan(value: string): boolean {
  return PAN_PATTERN.test(value);
}

export function isValidGstin(value: string): boolean {
  return GSTIN_PATTERN.test(value);
}

/**
 * Everything mandatory that is still unset or malformed, as human-readable
 * lines. Empty array => the company may issue invoices.
 *
 * Deliberately strict about cross-field agreement: a GSTIN whose embedded PAN
 * or state code contradicts the other fields on this page is the kind of
 * typo that survives every other check and then appears on a year of invoices.
 */
export function missingStatutoryFields(c: CompanyIdentity = COMPANY): string[] {
  const problems: string[] = [];

  if (!c.legalName) {
    problems.push('legalName — exact registered name from the Certificate of Incorporation');
  }

  // A CIN is required of a company or an OPC. It is not asked for when
  // `entityType` says MECE is something that has no CIN to give.
  const notACompany =
    c.entityType === 'llp' || c.entityType === 'partnership' || c.entityType === 'proprietorship';
  if (!notACompany) {
    if (!c.cin) {
      problems.push(
        'cin — 21-character CIN from the Certificate of Incorporation (Companies Act ' +
          's.12(3)(c)); if MECE is not a company, set entityType instead',
      );
    } else if (!isValidCin(c.cin)) {
      problems.push(`cin — "${c.cin}" is not a valid 21-character CIN`);
    } else if (!entityTypeFromCin(c.cin) && !c.entityType) {
      problems.push(
        `cin — ownership code "${c.cin.slice(12, 15)}" is not one of PTC/OPC/PLC/FTC/FLC; ` +
          'set entityType explicitly',
      );
    }
  }

  // PAN is optional — no rule puts it on an invoice. Checked only if supplied.
  const isCompany = (() => {
    const t = effectiveEntityType(c);
    return t === 'private-limited' || t === 'public-limited' || t === 'one-person-company';
  })();
  if (c.pan && !isValidPan(c.pan)) {
    problems.push(`pan — "${c.pan}" is not a valid PAN`);
  }
  if (isCompany && c.pan && isValidPan(c.pan) && c.pan[3] !== 'C') {
    problems.push(`pan — 4th character should be 'C' for a company, got '${c.pan[3]}'`);
  }

  const office = c.registeredOffice;
  if (!office) {
    problems.push('registeredOffice — address as filed with the ROC (s.12(3)(c))');
  } else {
    if (office.lines.filter((l) => l.trim().length > 0).length === 0) {
      problems.push('registeredOffice.lines — at least one street line');
    }
    if (!office.city) problems.push('registeredOffice.city');
    if (!office.postalCode) problems.push('registeredOffice.postalCode');
    if (!GST_STATE_CODES[office.stateCode]) {
      problems.push(`registeredOffice.stateCode — "${office.stateCode}" is not a known GST state code`);
    } else if (GST_STATE_CODES[office.stateCode] !== office.state) {
      problems.push(
        `registeredOffice — state "${office.state}" does not match code ${office.stateCode} (${GST_STATE_CODES[office.stateCode]})`,
      );
    }
    // The CIN carries the ROC's state, so it can check the address for free.
    const cinState = stateCodeFromCin(c.cin);
    if (cinState && cinState !== office.stateCode) {
      problems.push(
        `registeredOffice — CIN says the company is registered in ` +
          `${GST_STATE_CODES[cinState] ?? cinState} (${cinState}) but the address says ${office.stateCode}`,
      );
    }
  }

  if (!c.phone) {
    problems.push('phone — mandatory under s.12(3)(c); only fax and website are "if any"');
  }

  if (c.gst.registered) {
    const { gstin, stateCode, stateName, ratePercent, sacCode } = c.gst;
    if (!isValidGstin(gstin)) {
      problems.push(`gst.gstin — "${gstin}" is not a valid 15-character GSTIN`);
    } else {
      if (gstin.slice(0, 2) !== stateCode) {
        problems.push(`gst — GSTIN starts ${gstin.slice(0, 2)} but stateCode is ${stateCode}`);
      }
      if (c.pan && isValidPan(c.pan) && gstin.slice(2, 12) !== c.pan) {
        problems.push('gst — characters 3-12 of the GSTIN must equal the company PAN');
      }
    }
    if (GST_STATE_CODES[stateCode] && GST_STATE_CODES[stateCode] !== stateName) {
      problems.push(`gst — stateName "${stateName}" does not match code ${stateCode}`);
    }
    if (!(ratePercent > 0 && ratePercent <= 40)) {
      problems.push(`gst.ratePercent — ${ratePercent} is not a plausible GST rate`);
    }
    if (!/^\d{6}$/.test(sacCode)) {
      problems.push(`gst.sacCode — "${sacCode}" should be a 6-digit SAC`);
    }
  }

  return problems;
}

/** True when every mandatory identifier is present and internally consistent. */
export function canIssueInvoices(c: CompanyIdentity = COMPANY): boolean {
  return missingStatutoryFields(c).length === 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rendering
// ─────────────────────────────────────────────────────────────────────────────

/** Registered office as one line, for compact footers. */
export function registeredOfficeOneLine(c: CompanyIdentity = COMPANY): string | null {
  const o = c.registeredOffice;
  if (!o) return null;
  return [...o.lines, o.city, `${o.state} ${o.postalCode}`.trim(), o.country]
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .join(', ');
}

/**
 * The s.12(3)(c) block, as plain text lines, for any medium. Only non-null
 * fields appear — a half-filled block is still better than a wrong one, and
 * `missingStatutoryFields()` is what surfaces the gap.
 */
export function statutoryIdentityLines(c: CompanyIdentity = COMPANY): string[] {
  const lines: string[] = [];
  if (c.legalName) lines.push(c.legalName);

  const office = registeredOfficeOneLine(c);
  if (office) lines.push(`Registered office: ${office}`);
  if (c.cin) lines.push(`CIN: ${c.cin}`);
  if (c.gst.registered) lines.push(`GSTIN: ${c.gst.gstin}`);
  if (c.pan) lines.push(`PAN: ${c.pan}`);

  const contact = [c.phone ? `Tel: ${c.phone}` : null, c.email, c.website.replace(/^https?:\/\//, '')]
    .filter((p): p is string => Boolean(p))
    .join(' · ');
  if (contact) lines.push(contact);

  return lines;
}
