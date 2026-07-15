/**
 * Shared table styling constants.
 *
 * Every table should compose its className from these tokens so that
 * text size, font weight, and tracking stay consistent across
 * the Network table, Email Audit log, Applicants table, etc.
 *
 * Padding (px/py) is intentionally omitted — each table controls its own
 * spacing since some tables are compact (Network) and others need breathing
 * room (Email, Applicants).
 *
 * ─── Grid-table column convention ────────────────────────────────────────────
 * Grid-based tables (grid grid-cols-[...]) MUST use fr / minmax(min, fr) tracks
 * so the row always fills the available container width on any viewport.
 *
 *   Good:  grid-cols-[minmax(180px,1.2fr),minmax(120px,0.9fr),50px]
 *   Bad:   grid-cols-[200px,130px,80px]   ← leaves dead space on wide screens
 *
 * Rules:
 *  - Text-heavy columns (name, subject, email): minmax(minPx, Xfr) — grows.
 *  - Badge / numeric columns (status, count):   minmax(minPx, 0.7fr) — grows slowly.
 *  - Icon-only columns (checkbox, actions):     fixed px (e.g. 28px, 50px) — never grows.
 *  - Horizontally-scrollable tables (e.g. Step3InviteList with min-w-[...]):
 *      fixed px is acceptable because overflow-x scroll is the intended UX.
 *
 * Both the header row and every body row must use the IDENTICAL grid-cols string.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Header row: text size, font weight, uppercase tracking */
export const TABLE_HEADER_CLASSES =
  'items-center gap-2 text-[10px] font-semibold uppercase tracking-wide'

/** Body row: text size, alignment, gap */
export const TABLE_ROW_CLASSES = 'items-center gap-2 text-[11px]'

/** Cell text: default body text style */
export const TABLE_CELL_TEXT = 'text-[11px]'

/** Cell text: muted / secondary value */
export const TABLE_CELL_MUTED = 'text-[11px] text-foreground/60'

/** Truncated cell wrapper */
export const TABLE_CELL_TRUNCATE = 'min-w-0 truncate'
