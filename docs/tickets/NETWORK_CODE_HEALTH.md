# Network Code Health Review

_Scope: `src/components/producer/Network/` and the contact/tag API surface in `src/services/api.ts`. Triggered by the duplicate "add tag" call paths noticed during the bulk-edit work._

This is a tech-debt analysis. Items marked **Applied** were fixed in this pass (only safe, obvious dedupes). Items marked **Recommended** are deferred follow-ups with a risk note so they can be scheduled deliberately.

---

## Applied in this pass

### 1. Duplicated tag editor UI (3 copies) → shared `TagInput`

**Was:** `AddContactModal`, `EditContactModal`, and `BulkEditModal` each carried a near-identical ~60-line block: a text input + "Add" button, an autocomplete dropdown filtered from `availableTags`, removable chips, and their own `tagInput` state + `handleAddTag` / `handleRemoveTag` + `tag.trim().toLowerCase()` normalization.

**Now:** Extracted `src/components/producer/Network/TagInput.tsx` — a controlled component (`value: string[]`, `onChange`, `availableTags`, `disabled`). All three modals use it. Normalization (trim + lowercase + de-dupe) now lives in one place.

**Why safe:** Each call site only fed `formData.tags` / local `tags` state; no other code referenced the removed `tagInput` buffers or handlers. Behavior is preserved; the only visible change is that the bulk modal's tag chips now match the Add/Edit styling (intentional consistency).

### 2. Removed dead code surfaced by the bulk-edit redesign

- `NetworkPage.handleBulkAddToList`, the `savedLists` state, and `refreshSavedLists()` became unreachable once "Add to list" left the bulk modal (E3). Removed, along with the now-unused `ContactList` import.

### 3. Removed stale unused imports

- `Plus` (`AddContactModal`, `EditContactModal`) and `TrendingUp` (`EditContactModal`) were left behind after the tag refactor / were already dead. Removed.

---

## Recommended follow-ups (deferred)

### A. Consolidate the contact "tag" API paths — _highest priority, the original trigger_

There are **three** ways to mutate a contact's tags, with **different semantics**, and call sites pick inconsistently:

| Method | Endpoint | Semantics |
| --- | --- | --- |
| `vendorContactsApi.addTag(id, tag)` | `POST .../vendor_contacts/:id/add_tag` | append one tag |
| `vendorContactsApi.removeTag(id, tag)` | `POST .../vendor_contacts/:id/remove_tag` | remove one tag |
| `vendorContactsApi.update(id, { tags })` | `PATCH .../vendor_contacts/:id` | **replace** the whole set |
| `vendorContactsApi.bulkUpdate(orgId, ids, { tags })` | `PATCH .../bulk_update` | **replace** the whole set |

Consequence already hit in practice: bulk "add tags" cannot use `bulkUpdate({ tags })` (it would wipe existing tags), so `NetworkPage.handleBulkTags` fans out N×M `addTag` calls instead — correct, but chatty.

**Recommendation:** add an explicit `tag_mode: 'append' | 'replace'` to `bulk_update` (backend), then route all bulk tag adds through a single `bulkUpdate({ tags, tag_mode: 'append' })` call and delete the per-contact fan-out. _Backend change — previously deferred by product; logging here so it isn't lost._ Risk: low-medium (needs BE + a coordinated FE swap).

### B. Bulk-action handler boilerplate in `NetworkPage`

`handleBulkCategoryUpdate`, `handleBulkTags`, `handleBulkLocation`, and `handleBulkDelete` repeat the same skeleton: `setBulkUpdateLoading(true)` → call → `notify.success` → `refreshFilterOptions()` + `fetchContacts(currentPage)` → `setSelectedContacts([])` → `catch notify.error(getApiErrorMessage)` → `finally setBulkUpdateLoading(false)`.

**Recommendation:** a small `runBulkAction({ action, successKey })` wrapper to own the loading/notify/refresh/selection lifecycle. Risk: low, but touches several handlers — better as its own focused change.

### C. Category multi-select dropdown duplicated (Add vs Edit)

`AddContactModal` and `EditContactModal` share an identical category dropdown (checkbox list + colored `category-sequence-badge` chips + `handleCategoryToggle`). Same pattern as the tag block we just deduped.

**Recommendation:** extract a `CategoryMultiSelect` sibling to `TagInput`. Risk: low-medium (badge styling + dropdown outside-click handling must be carried over carefully).

### D. Client-side text-search filter repeated app-wide

`field?.toLowerCase().includes(query)` chains are copy-pasted across `ApplicantsTab`, `InvitesTab`, `GoLiveInvitationEditor`, `CreateEventWizard/steps/Step3InviteList`, `EventsList`, and several Email tabs.

**Recommendation:** a `matchesQuery(record, query, fields)` helper in `src/utils/`. Risk: low, but **broad** (spans well beyond Network); do as a dedicated sweep, not bundled here.

---

## Summary

| Item | Type | Status |
| --- | --- | --- |
| Shared `TagInput` (3 modals) | dedupe | ✅ Applied |
| Remove dead `savedLists` / `handleBulkAddToList` | dead code | ✅ Applied |
| Remove stale `Plus` / `TrendingUp` imports | cleanup | ✅ Applied |
| Consolidate tag API paths (`tag_mode`) | API design | ⏳ Recommended (needs BE) |
| `runBulkAction` wrapper | dedupe | ⏳ Recommended |
| `CategoryMultiSelect` extraction | dedupe | ⏳ Recommended |
| `matchesQuery` search helper | dedupe | ⏳ Recommended (app-wide) |
