# ANTIGRAVITY_HANDOFF — casebook-mobile-ux (Brain / Cowork, 2026-07-10)

Owner ask (verbatim intent): mobile casebook is not UX-friendly. (1) The "☰ Contents"
pill should become an icon-only hamburger — RED background, WHITE icon, no "Contents"
text — so it reads as highlighted. (2) The left pane the hamburger opens must have
EVERY topic collapsed by default. (3) The page header eats the whole first screen;
keep the headline at top and tuck everything after it (dek, byline, meta) behind a
"Read more" so the actual case/guesstimate content shows near the top.

touches:
- components/casebook/casebook-reader.tsx — mobile SheetTrigger restyled: icon-only
  `w-10 h-10 bg-primary text-primary-foreground` + `sr-only` "Contents" label
  (aria-label kept). SheetContent now renders `<CasebookSearch defaultCollapsed />`.
  Header block (h1 + subtitle + EEATSignals + PageMetaBar) replaced by new
  `<PageIntro>` wrapper: EEAT + meta bar are passed as children. Primer branch passes
  `mobileNav={<CasebookSearch defaultCollapsed />}` to PrimerWorkspace. Desktop
  markup/classes otherwise unchanged.
- components/casebook/page-intro.tsx — NEW client component. Desktop (lg+): renders
  exactly the old header stack (h1 mb-4, dek, EEAT, meta) — pixel-neutral. Mobile:
  only the h1 shows plus a `Read more` / `Show less` toggle (text-primary + chevron);
  dek + EEAT + meta are `hidden` until expanded; collapsed state adds a hairline
  border-b under the intro so content separation survives.
- components/casebook/casebook-search.tsx — accepts optional `defaultCollapsed`
  prop (default false), forwards to NavTree. No other change.
- components/casebook/nav-tree.tsx — NavTree + NavTreeSection accept
  `defaultCollapsed`. When true: initial state is CLOSED regardless of
  `node.defaultOpen`, and sessionStorage is neither read nor written — so every
  open of the mobile sheet mounts fully collapsed (Radix Sheet unmounts content on
  close). Desktop behaviour (data-driven defaultOpen + sessionStorage persistence)
  untouched. Search-forces-open behaviour untouched.
- components/casebook/primer-workspace.tsx — new optional `mobileNav` prop
  (falls back to `nav`); mobile SheetTrigger restyled to the same red icon-only
  hamburger. Desktop collapse/expand rail unchanged.

breaking: no — no CONTRACTS.md surface. Pure frontend UI in components/casebook/*.
No Casebook-Page-schema, DB, API, or scoring change. New props are optional with
back-compatible defaults.

## Behaviour summary
- Mobile hamburger: solid red (--primary) 40×40 rounded square, white Menu icon,
  no text. Screen-reader label preserved.
- Mobile drawer: all top-level sections collapsed every time it opens; user can
  expand freely; desktop sidebar keeps its remembered/sessionStorage state.
- Mobile page: h1 → "Read more ▾" → content starts immediately. Expanding reveals
  dek + byline (EEAT) + meta chips; "Show less" collapses again. Desktop unchanged.

## Phased build steps + gates (run on the real tree, not the Cowork sandbox mount)
1. `npx tsc --noEmit` — must be clean. NOTE: the Cowork bash mount AGAIN served
   stale/truncated file copies this session (same failure mode as the
   mic-recording-ux handoff: phantom TS1127/TS17008 on freshly-edited files).
   Verified clean by typechecking a corrected copy of the tree (/tmp) with real
   node_modules — 0 errors. Authoritative on-disk files re-read and intact.
   Trust the real-tree tsc.
2. `next build` — must pass.
3. Manual QA (mobile viewport <1024px):
   - Casebook page: red hamburger visible, opens drawer; ALL sections collapsed;
     expand/collapse works; search still force-opens matching sections.
   - Page header: only headline + "Read more" above the fold; toggle reveals
     dek/byline/meta; "Show less" works; anchor link "Key Takeaways" inside the
     expanded meta bar still scrolls to #key-takeaways.
   - Primer page (e.g. /learn/casebook/<primer slug>): red hamburger + collapsed
     drawer there too; desktop rail collapse/expand still works.
   - Desktop (≥1024px): confirm ZERO visual change on casebook + primer pages
     (header, sidebar defaultOpen sections, sessionStorage persistence).
4. Redeploy frontend. No SQL, no env, no backend.

## Commit
git add components/casebook/casebook-reader.tsx components/casebook/page-intro.tsx \
  components/casebook/casebook-search.tsx components/casebook/nav-tree.tsx \
  components/casebook/primer-workspace.tsx \
  .brain/handoffs/ANTIGRAVITY_HANDOFF_casebook-mobile-ux.md
Suggested branch: feat/casebook-mobile-ux
Suggested message: feat(casebook): mobile UX — red icon-only hamburger, drawer tree
collapsed by default, headline-first header with Read more
