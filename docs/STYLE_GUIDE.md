# Voxxy Presents — Front-End Style Guide

> Context document for developers and AI coding agents. Keep this file updated as tokens and conventions evolve.  
> Source of truth: `src/index.css` (tokens) · `tailwind.config.ts` (font families, colors) · `src/components/Navigation.tsx` (public nav)

---

## 1. Theme System

### Dark-first approach

The app defaults to **dark mode**. The `<html>` element receives the `.dark` class via a blocking script in `index.html` before React hydrates, preventing a flash of light content.

```ts
// tailwind.config.ts
darkMode: ["class"]  // toggled by adding/removing .dark on <html>
```

CSS tokens live in two blocks inside `src/index.css`:
- `:root { ... }` — light mode values
- `.dark { ... }` — dark mode overrides

Always update **both** blocks when introducing a new semantic token.

### Theme toggle

User preference is stored in `localStorage` under the key `voxxy-theme`. Any value other than `'light'` results in dark mode. There is no in-app theme switcher on public pages; **public pages and utility pages (unsubscribe, legal) are always dark**.

---

## 2. Color Tokens

All colors are expressed as HSL channel triplets so Tailwind's opacity modifier (`/50`, `/80` etc.) works correctly.

### Semantic tokens (`:root` / `.dark`)

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--background` | `270 35% 98%` (near-white violet) | `262 38% 10%` (deep indigo) | Body background |
| `--foreground` | `260 32% 14%` | `240 5% 95%` | Primary text |
| `--card` | `0 0% 100%` | `262 35% 14%` | Card surface |
| `--card-foreground` | `260 32% 14%` | `240 5% 95%` | Text on cards |
| `--primary` | `250 68% 25%` | `262 72% 61%` | Brand violet |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` | Text on primary |
| `--muted` | `262 14% 93%` | `262 20% 18%` | Subdued surfaces |
| `--muted-foreground` | `260 12% 40%` | `240 5% 65%` | Subdued text |
| `--destructive` | `0 72% 48%` | `0 63% 31%` | Red error/danger |
| `--border` | `260 14% 88%` | `0 0% 100% / 0.1` | Default border |
| `--ring` | `250 68% 25%` | `262 72% 61%` | Focus ring |

### Sidebar tokens (`.dark` only — producer app shell)

| Token | Value |
|---|---|
| `--sidebar-background` | `258 55% 16%` |
| `--sidebar-foreground` | `240 5% 96%` |
| `--sidebar-primary` | `262 72% 61%` |
| `--sidebar-border` | `262 20% 20%` |

### Brand hex palette (Tailwind config)

```ts
'voxxy-purple': {
  deep:  '#1a0b2e',  // deepest background
  mid:   '#2d1b4e',  // panel layer
  brand: '#9054e3',  // primary violet
  light: '#cc30e8',  // pink-violet
}
'voxxy-pink': {
  DEFAULT: '#cc30e8',
  deep:    '#af3cda',
  light:   '#d95ef0',
}
```

---

## 3. Gradient Tokens

All gradient tokens live in the `.dark` block of `src/index.css`. Light-mode gradients are defined in `:root` but are very subtle (near-white lavender washes).

### Dark-mode gradient reference

| Token | Value summary | Usage |
|---|---|---|
| `--voxxy-grad-body` | `#221469 → #54309f → #bd2dcf` (0%/30%/100%) | Fixed body background, marketing hero, producer shell |
| `--voxxy-grad-page` | alias `--voxxy-grad-body` | Generic page wrapper |
| `--voxxy-grad-page-cool` | alias `--voxxy-grad-body` | Cool-toned page variant (application form) |
| `--voxxy-grad-brand` | `#cc30e8 → #af3cda → #9054e3 → #651ae9` | Brand CTA buttons, filled accents |
| `--voxxy-grad-cta` | `#af3cda → #651ae9` | CTA buttons, active nav tabs |
| `--voxxy-grad-cta-pink` | `#cc30e8 → #9054e3` | Pink-leaning CTA variant |
| `--voxxy-grad-nav` | `rgba(34,20,105,0.95) → rgba(84,48,159,0.95)` | Fixed nav bar surface |
| `--voxxy-grad-glass-card` | translucent purple wash | `.glass-card` interior |
| `--voxxy-grad-card-deep` | `#322848 → #261c38` | `.voxxy-gradient-card-deep` |
| `--voxxy-grad-panel` | `#221838 → #181222` | Side panels and drawers |
| `--voxxy-grad-editor` | `#151028 → #221a38 → #151028` | Email / template editor |
| `--voxxy-grad-hero-split` | `#cc30e8 → #9054e3 → #651ae9` | Hero section with split layout |
| `--voxxy-grad-table-header` | translucent blue-violet | Table header rows |
| `--voxxy-grad-modal-header` | `purple/92 → blue/92` | Modal header bars |
| `--voxxy-grad-nav-tab-active` | alias `--voxxy-grad-cta` | Active navigation pill in sidebar |
| `--voxxy-grad-application-highlight` | translucent purple-blue | Application card highlights |

### Body gradient paint height

```css
--voxxy-body-gradient-paint-height: 185vh;
```

`html.dark body` sets `background-size: 100% 185vh` with `background-attachment: fixed`. This stretches the gradient so a typical 900–1100px viewport only sees the top ~55% of the gradient — keeping deep indigo dominant and pushing the warm magenta below the fold.

---

## 4. Typography

| Role | Family | Weight | Style | Class |
|---|---|---|---|---|
| VOXXY wordmark | Montserrat → Barlow Condensed (fallback) | 900 (Black) | Italic | `font-nav-logo italic font-black` |
| Body text | DM Sans | 300–700 | — | default |
| Display headings | Space Grotesk | 400–700 | — | `font-display` if needed |

### Google Fonts import (`index.html`)

```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@1,900&family=Barlow+Condensed:ital,wght@1,900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;...&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### Wordmark usage

```tsx
<span className="font-nav-logo text-xl font-black italic tracking-[0.08em] text-white uppercase md:text-[1.65rem] leading-none">
  VOXXY
</span>
```

---

## 5. Component Naming Conventions

All Voxxy-specific utility classes are defined in `@layer components` inside `src/index.css`.

### Button classes

| Class | Description |
|---|---|
| `.voxxy-btn-brand` | Full-spectrum brand gradient (`--voxxy-grad-brand`), white text, no border. Use for primary page CTAs. |
| `.voxxy-btn-cta` | Violet-to-indigo gradient (`--voxxy-grad-cta`). Use for internal app primary actions. |
| `.voxxy-btn-cta-pink` | Pink-leaning gradient. Secondary emphasis. |
| `.voxxy-btn-solid` | Flat violet fill (light: `#9054e3`). For tertiary actions that need contrast without gradient weight. |
| `.voxxy-btn-public-secondary` | Glassmorphic white-tint button. Sits on dark gradient backgrounds. Has glow on hover. |
| `.voxxy-nav-cta-link` | Plain text nav link; gradient-text effect on hover. No button shape. |

**Rule:** Never add raw `background-image` styles in component files. Always reference a CSS token class or a `--voxxy-grad-*` CSS variable.

### Input classes

| Class | Description |
|---|---|
| `.voxxy-input-frost` | Standard text input for all internal producer forms. Token-controlled surface in dark (`--voxxy-input-frost-bg`), lifted violet fill above glass-card. |
| `.voxxy-input-public-dark` | Input for public dark-background contexts (e.g. homepage contact form). White-tint fill. |
| `.voxxy-input-frost-group` | Wrapper shell for prefix-row inputs (e.g. `https://`, `instagram.com/`). Shares frost styling; `focus-within` triggers the frost focus ring. |
| `.voxxy-input-frost-prefix` | The prefix label cell inside a `voxxy-input-frost-group`. Muted fill, right divider. |

### Surface / layout classes

| Class | Description |
|---|---|
| `.glass-card` | Primary card surface in the producer app. Dark gradient fill + backdrop blur + inset highlight shadow. |
| `.voxxy-contact-form-shell` | Glass card for public-page forms (contact, unsubscribe). Higher contrast white-tint border. |
| `.voxxy-gradient-card-deep` | Lighter gradient card background used inside glass-cards. |
| `.voxxy-gradient-marketing-hero` | Full page background for all public/marketing pages. Always dark. Same source as `--voxxy-grad-body`. |
| `.voxxy-gradient-page-cool` | Internal app page background (light: lavender wash, dark: aliases body gradient). |
| `.voxxy-public-page` | Marker class for public page roots. Combine with `.dark` and `.voxxy-gradient-marketing-hero`. |
| `.voxxy-nav-surface` | Fixed nav bar surface. Frosted glass over the body gradient (`backdrop-filter: blur(18px)`). |
| `.voxxy-auth-card` | Auth form card surface (login/register). Deep purple translucent. |

### Table classes

| Class | Description |
|---|---|
| `.voxxy-table-shell` | Outer wrapper for data tables. Rounded border, opaque card background, overflow hidden (for border-radius). Inner `overflow-x-auto` div handles horizontal scroll. |
| `.voxxy-table-header` | Sticky or top-positioned header row container. Light gradient fill. |
| `.voxxy-table-header-row` | Grid-based header cell row. Use `text-[10px] font-semibold uppercase tracking-wide`. |
| `.voxxy-table-row` | Data row with bottom border. |
| `.voxxy-table-row-hover` | Hover state for data rows. In dark mode uses `--voxxy-grad-hover-row-hover`. |

### Hover effects

| Class | Description |
|---|---|
| `.voxxy-hover-panel` | Card-level hover with panel gradient and border glow. |
| `.voxxy-hover-row` | Row-level hover (lighter than panel). |

---

## 6. Public vs. Internal Surface Rules

### Public pages (always dark)

All public-facing pages — homepage, features, pricing, about, legal, contact, unsubscribe — must:

1. Wrap with `<div className="dark voxxy-public-page relative min-h-screen voxxy-gradient-marketing-hero">`
2. Never read from `--background` or `--foreground` tokens directly (they flip in light mode). Use explicit `text-white`, `text-white/70` etc., or `text-foreground` only if the `.dark` class is guaranteed on the wrapper.
3. Use `.voxxy-contact-form-shell` for main content cards.
4. Use `.voxxy-input-public-dark` for any input fields.
5. Use `.voxxy-btn-brand` for primary CTAs and `.voxxy-btn-public-secondary` for secondary CTAs.

### Internal producer app (dark by default, light opt-in)

1. Shells: `.glass-card` for cards, `.voxxy-input-frost` for all inputs (selects, textareas, text inputs).
2. Actions: `.voxxy-btn-cta` for primary, `.voxxy-btn-solid` for secondary, transparent/ghost for tertiary.
3. Sidebar: uses `--sidebar-*` tokens; do not use `--background` for sidebar backgrounds.
4. Theme respects user preference (stored in `localStorage`). Do not hard-code `.dark` on internal pages.

### Utility / transactional pages (always dark)

Unsubscribe, email opt-out, legal pages:
- Force dark by including `dark` class on page root div
- Use `voxxy-gradient-marketing-hero` background
- No light/dark toggle

---

## 7. Glass Layering Hierarchy

From deepest to shallowest:

```
body (--voxxy-grad-body, fixed, 185vh painted height)
  └── voxxy-public-page / glass-card shell
        └── glass-card (--voxxy-grad-glass-card, backdrop-blur 12px)
              └── voxxy-input-frost (--voxxy-input-frost-bg, lifted charcoal)
                    └── focus ring (--voxxy-input-frost-ring, violet spread glow)
```

Each layer must be visually distinguishable from the one below it. Do not set `background: transparent` on a layer that has its own semantic role.

---

## 8. Accessibility

- **Focus visible:** All interactive elements must include `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. The `ring` token resolves to the primary violet in both modes.
- **Reduced motion:** Use `motion-safe:transition-[width]` and `motion-safe:duration-500` on animated fills (e.g. wizard progress bar). Do not animate layout properties unconditionally.
- **Contrast:** Light mode forms must pass WCAG AA (4.5:1 for text). Run a contrast audit when changing `--muted-foreground` or label colors. In dark mode, `text-white/55` (~55% opacity on white on `#321848` card) is the minimum for secondary labels — do not go below `/50`.
- **Button sizing:** Minimum touch target 44×44px. Internal app buttons (`h-7` Button default) are too small for mobile — use `h-auto` with explicit padding for any public-facing or large-screen buttons.

---

## 9. Do's and Don'ts

### Do

- Use `--voxxy-grad-*` token classes (`.voxxy-btn-brand`, `.voxxy-gradient-marketing-hero`) rather than inline `style={{ backgroundImage: ... }}`.
- Update **both** `:root` and `.dark` blocks when adding a new CSS token.
- Add new button variants as CSS classes in `@layer components`, not as inline Tailwind strings scattered across components.
- Use `voxxy-input-frost` on all producer-app form fields (search bars, settings inputs, wizard fields, modals).
- Prefix new Voxxy-specific utility classes with `voxxy-` to distinguish them from Tailwind utilities.

### Don't

- Don't use raw hex values in component files (`.tsx`). Reference a token or gradient class instead.
- Don't add `dark:` Tailwind variants in component files without verifying the `:root` (light) behavior still looks correct.
- Don't use `bg-background/5` for important UI elements — at 5% opacity the gradient bleeds through. Use at least `bg-card/50` or a named surface class.
- Don't add `overflow-hidden` to `voxxy-table-shell` overrides — it breaks the inner `overflow-x-auto` scroll. The outer shell already has `overflow-hidden` for border-radius.
- Don't use `backdrop-blur` on per-item list cards inside already-blurred containers — it creates stacking context collisions that break `z-index` dropdowns. Keep blur only on the outermost shell.
- Don't set `border: 1px solid transparent` on gradient-fill buttons — it creates a visible tinted edge artifact. Use `border: none` on dark gradient buttons.

---

## 10. File Map

| File | Role |
|---|---|
| `src/index.css` | All CSS tokens, component classes, gradient utilities |
| `tailwind.config.ts` | Font families, brand colors, border radius, animation keyframes |
| `index.html` | Google Fonts import, dark-mode init script, Mixpanel init |
| `src/components/Navigation.tsx` | Public marketing nav (frosted glass, wordmark, text CTA links) |
| `src/pages/HomePage.tsx` | Main marketing page — reference for public page structure |
| `src/pages/UnsubscribePage.tsx` | Unsubscribe / email opt-out — always dark, glass card layout |
| `src/pages/Dashboard.tsx` | Producer app shell — sidebar, header, nav tabs, guide button |
| `src/pages/SettingsPage.tsx` | Settings form reference for glass-card + voxxy-input-frost usage |
| `src/components/producer/CreateEventWizard/` | Wizard with WizardProgress (compact bar) + 6 step pages |
| `src/components/producer/Network/NetworkPage.tsx` | Network contacts — Actions dropdown, frost search, filter buttons |
| `src/components/ui/button.tsx` | shadcn Button base — default size `h-7`; use `h-auto` for large public CTAs |
| `src/components/ui/input.tsx` | shadcn Input base — for internal use; prefer `voxxy-input-frost` class override |
