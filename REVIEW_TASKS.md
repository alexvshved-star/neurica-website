# Code Review Tasks Checklist

> Execution note: keep tasks independent and complete them one by one.

## 1) Typo fix in Ukrainian beta form
- [ ] **Status:** Open
- **Risk level:** Low
- **Issue:** In the Ukrainian beta form, label text is misspelled/truncated: `беа-тестуванні` instead of `бета-тестуванні`.
- **Affected files:** `index.html`
- **Acceptance criteria:**
  - Label text for the `reason` field is corrected to `бета-тестуванні`.
  - Adjacent Ukrainian UI strings in the same form are proofread and consistent.
- **Verification steps:**
  1. Search for old/new string in `index.html`.
  2. Open page locally and visually confirm corrected label in the beta form.

## 2) Functional bug fix for Netlify honeypot
- [ ] **Status:** Open
- **Risk level:** Medium
- **Issue:** The hidden Netlify form uses `netlify-honeypot="bot-field"` but does not include an input with `name="bot-field"`, which can break spam-trap behavior.
- **Affected files:** `index.html`, `index-en.html`
- **Acceptance criteria:**
  - Hidden and visible `beta` forms include a honeypot field with `name="bot-field"`.
  - Netlify still detects the form as `beta` and field mapping is unchanged for user-facing fields.
- **Verification steps:**
  1. Inspect both HTML pages for `netlify-honeypot` and `name="bot-field"`.
  2. Run a deploy preview (or local Netlify validation) and submit test data.
  3. Confirm successful capture of normal submission and honeypot behavior.

## 3) Code comment correction for cache strategy
- [ ] **Status:** Open
- **Risk level:** Low
- **Issue:** `netlify.toml` comment says JS cache uses filename-based cache busting, but `splash.js` uses a stable filename and may become stale under immutable cache headers.
- **Affected files:** `netlify.toml`, `index.html`, `index-en.html`, `splash.js`
- **Acceptance criteria:**
  - Comment in `netlify.toml` reflects actual JS cache strategy.
  - If filename-based busting is claimed, implementation exists (hashed filename or explicit versioning reference).
- **Verification steps:**
  1. Compare cache-header comments with actual JS include pattern in both HTML files.
  2. Validate final wording/implementation consistency in a review diff.

## 4) Documentation requirements gap
- [ ] **Status:** Open
- **Risk level:** Medium
- **Issue:** `README.md` lacks required operational docs for contributors: local run/preview instructions, deployment steps, and form-handling details for Netlify.
- **Affected files:** `README.md`
- **Acceptance criteria:**
  - README has explicit sections: **Local development**, **Deployment**, **Forms**.
  - Each section includes concrete commands/steps and expected outcome.
  - Maintainers can run the site and understand form processing without external context.
- **Verification steps:**
  1. Review README headings and content completeness against this checklist.
  2. Execute documented local-preview command(s) to confirm they work.

## 5) Testing improvement for SEO/i18n consistency
- [ ] **Status:** Open
- **Risk level:** Medium
- **Issue:** There are no automated checks for SEO/i18n consistency (canonical, hreflang, sitemap links, and redirect alignment).
- **Affected files:** `sitemap.xml`, `netlify.toml`, `index.html`, `index-en.html` (plus new CI/check script file, needs review)
- **Acceptance criteria:**
  - Lightweight CI check is added and runs in repository automation.
  - Check validates:
    - canonical + hreflang pairing in `index.html` and `index-en.html`;
    - sitemap URLs existence and alignment with redirects in `netlify.toml`;
    - hidden/visible Netlify form names and key fields consistency.
  - CI fails on mismatch and passes on aligned configuration.
- **Verification steps:**
  1. Run the new check locally.
  2. Intentionally introduce a small mismatch (temporary) to confirm failure.
  3. Revert mismatch and confirm pass.
