# Network Filter → Query UX — KNOWN ISSUES (do not treat as done)

**Status:** ⚠️ Work in progress — shipped prematurely. The feature is wired up and
compiles/type-checks clean, but has **active, unresolved bugs**. Do not consider
Epic E1+E2+E4 complete.

**Where it landed:** PR #130 (`fix/applicants-table-styling`), commit
`98f9d42` — "feat(network): ClickUp-style Filter panel + saved queries".

**Files involved:**
- `src/components/producer/Network/FilterPanel.tsx` (new — the panel UI + draft state)
- `src/components/producer/Network/NetworkPage.tsx` — handlers:
  `handleApplyFilters`, `handleApplyQuery`, `handleSaveQuery`, `handleDeleteQuery`,
  `loadSavedQueries`, and the social branch in `applyClientSideFilters`
- `src/components/producer/Network/copy.ts` — query terminology constants

---

## Active bugs

### 1. Severe load-time / performance regression 🔴
- **Symptom:** Network/contacts page load times got dramatically worse after this
  change went up to dev.
- **Status:** NOT root-caused. Needs backend (Render dev API) log review for slow
  requests around `/contact_lists` and `/vendor_contacts`.
- **Suspects (unverified):**
  - Extra `loadSavedQueries()` (`contactListsApi.getAll`) call added on mount.
  - `handleApplyFilters` sets server-filter state (category/location/tags) which
    triggers the `fetchContacts` effect; if the contacts/list endpoints are slow,
    every Apply round-trips and feels broken.
  - Possible repeated/duplicate fetches from filter state churn — verify the
    `useEffect` dependency on `locationFilters/categoryFilters/tagFilters` isn't
    re-firing unnecessarily.
- **Next step:** Pull Render dev API request logs (timings) and confirm which
  endpoint/query is the bottleneck before optimizing.

### 2. "Save query" does not persist 🔴
- **Symptom:** Saving the current filter draft as a query (`handleSaveQuery` →
  `contactListsApi.create` with `list_type: 'smart'`) does not appear to actually
  save / surface in the Saved Queries list.
- **Status:** NOT root-caused. Verify the create request payload/response, that the
  created list is `list_type: 'smart'`, and that `loadSavedQueries()` re-fetch +
  the `savedQueries` filter (`l.list_type === 'smart'`) actually includes it.

### 3. "Apply" does not update the table 🔴
- **Symptom:** Clicking **Apply** in the filter panel does not visibly change the
  contacts table.
- **Status:** NOT root-caused. May be the same root cause as #1 (slow/blocked
  fetch) or a state-wiring bug between `handleApplyFilters` → `activeFilters` /
  client-side filters → `displayedContacts`. Confirm whether server filters
  (category/location/tags) refetch and whether client filters (social/updated/
  shows-attended) recompute `displayedContacts`.

---

## Notes for the next engineer / agent
- The UI is intentionally "staged draft → Apply" (filters don't apply live; only on
  Apply). Keep that in mind when debugging #3.
- Terminology is UI-only "query"; the underlying model is still the smart
  `ContactList`. No backend changes were made in this PR.
- If this needs to ship without the query feature, the cleanest path is to revert
  commit `98f9d42` from this branch (the other epics — E7, E3, tech-debt, E8 — are
  independent and working).
