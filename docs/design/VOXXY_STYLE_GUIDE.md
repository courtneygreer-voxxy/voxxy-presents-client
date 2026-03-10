# Voxxy Presents - Style Guide & Design System

**Last Updated:** October 30, 2025
**Version:** 1.0

This document contains all styling, colors, typography, and design patterns used in the Voxxy Presents application.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Gradients](#gradients)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations & Effects](#animations--effects)
7. [CSS Variables](#css-variables)
8. [Quick Copy: CSS Stylesheet](#quick-copy-css-stylesheet)

---

## Color Palette

### Primary Brand Colors

```css
/* Purple Shades - Primary Brand Color */
--purple-400: #c084fc;      /* Light purple for text highlights */
--purple-500: #a855f7;      /* Standard purple */
--purple-600: #9333ea;      /* Primary CTA buttons */
--purple-700: #7e22ce;      /* Hover states */

/* Pink Accents */
--pink-400: #f472b6;        /* Light pink for gradients */
--pink-500: #ec4899;        /* Accent pink */

/* Blue Accents */
--blue-500: #3b82f6;        /* Accent blue */
--indigo-600: #4f46e5;      /* Indigo accent */
```

### Background Colors (Dark Theme)

```css
/* Deep Purple/Navy Backgrounds - Core Brand Identity */
--bg-primary: #1a0b2e;      /* Deep purple-black (darkest) */
--bg-secondary: #2d1b4e;    /* Medium purple-navy */
--bg-tertiary: #0f172a;     /* Slate-navy (darkest slate) */

/* Glassmorphism Overlays */
--overlay-light: rgba(255, 255, 255, 0.1);    /* Light glass effect */
--overlay-dark: rgba(0, 0, 0, 0.5);           /* Dark overlay */
```

### Text Colors

```css
/* Text */
--text-primary: #ffffff;         /* Pure white - main text */
--text-secondary: #e2e8f0;       /* Light gray - secondary text */
--text-muted: #94a3b8;           /* Muted gray - subtle text */
--text-purple: #c084fc;          /* Purple text highlights */
--text-pink: #f472b6;            /* Pink text accents */

/* Borders */
--border-light: rgba(255, 255, 255, 0.1);     /* Subtle white borders */
--border-medium: rgba(255, 255, 255, 0.2);    /* Medium white borders */
--border-purple: rgba(168, 85, 247, 0.3);     /* Purple borders */
```

### State Colors

```css
/* Success */
--success: #10b981;             /* Green for success states */

/* Error/Destructive */
--error: #ef4444;               /* Red for errors */

/* Warning */
--warning: #f59e0b;             /* Orange for warnings */
```

---

## Gradients

### Background Gradients

```css
/* Main Background - Dark Purple/Navy (MOST USED) */
background: linear-gradient(to bottom right, #1a0b2e, #2d1b4e, #0f172a);
/* Usage: Page backgrounds, hero sections */

/* Purple/Pink/Blue Gradient (Vibrant) */
background: linear-gradient(to bottom right, #a855f7, #ec4899, #3b82f6);
/* Usage: Login split screens, hero graphics */

/* Purple/Indigo Overlay */
background: linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(79, 70, 229, 0.2));
/* Usage: Section backgrounds, cards with backdrop blur */
```

### Text Gradients

```css
/* Purple to Pink (Primary) */
background: linear-gradient(to right, #c084fc, #f472b6);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
/* Usage: Hero headlines, emphasis text */

/* White to Light Purple */
background: linear-gradient(to right, #ffffff, #e9d5ff);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
/* Usage: Secondary headlines */
```

### Button Gradients

```css
/* Primary CTA Button Gradient */
background: linear-gradient(to right, #9333ea, #ec4899, #3b82f6);
/* Hover state */
background: linear-gradient(to right, #7e22ce, #db2777, #2563eb);
/* Usage: Main call-to-action buttons */
```

---

## Typography

### Font Family

```css
/* Primary Font */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
             "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
             sans-serif;

/* Alternative: Geist Font (if installed) */
font-family: "Geist", sans-serif;
```

### Font Sizes & Weights

```css
/* Headings */
.text-5xl {
  font-size: 3rem;        /* 48px */
  line-height: 1.2;
  font-weight: 700;       /* Bold */
}

.text-4xl {
  font-size: 2.25rem;     /* 36px */
  line-height: 1.3;
  font-weight: 700;
}

.text-3xl {
  font-size: 1.875rem;    /* 30px */
  line-height: 1.3;
  font-weight: 600;       /* Semi-bold */
}

.text-2xl {
  font-size: 1.5rem;      /* 24px */
  line-height: 1.4;
  font-weight: 600;
}

.text-xl {
  font-size: 1.25rem;     /* 20px */
  line-height: 1.5;
  font-weight: 500;       /* Medium */
}

/* Body Text */
.text-lg {
  font-size: 1.125rem;    /* 18px */
  line-height: 1.6;
  font-weight: 400;       /* Regular */
}

.text-base {
  font-size: 1rem;        /* 16px */
  line-height: 1.6;
  font-weight: 400;
}

.text-sm {
  font-size: 0.875rem;    /* 14px */
  line-height: 1.5;
  font-weight: 400;
}
```

---

## Spacing & Layout

### Container Widths

```css
/* Maximum content width */
max-width: 1152px;        /* 72rem - main content container */
margin: 0 auto;
padding: 0 1rem;          /* 16px horizontal padding */

/* Responsive padding */
@media (min-width: 768px) {
  padding: 0 2rem;        /* 32px on tablets and up */
}
```

### Section Spacing

```css
/* Section padding */
padding-top: 5rem;        /* 80px */
padding-bottom: 5rem;     /* 80px */

/* Card/Component padding */
padding: 1.5rem;          /* 24px */

/* Button padding */
padding: 0.75rem 2rem;    /* 12px vertical, 32px horizontal */
```

### Border Radius

```css
/* Buttons, small cards */
border-radius: 0.5rem;    /* 8px */

/* Large cards */
border-radius: 1rem;      /* 16px */

/* Circular elements (badges, avatars) */
border-radius: 9999px;    /* Fully rounded */
```

---

## Components

### Navigation Bar

```css
.navbar {
  position: relative;
  z-index: 50;
  padding: 1.5rem 1rem;
  background: rgba(31, 41, 55, 0.5);    /* Gray-800 with 50% opacity */
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-link {
  color: #d1d5db;                       /* Gray-300 */
  transition: color 0.2s ease;
}

.navbar-link:hover {
  color: #c084fc;                       /* Purple-400 */
}
```

### Buttons

#### Primary Button (Purple Gradient)

```css
.btn-primary {
  padding: 0.75rem 2rem;
  background: linear-gradient(to right, #9333ea, #ec4899, #3b82f6);
  color: #ffffff;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
}

.btn-primary:hover {
  background: linear-gradient(to right, #7e22ce, #db2777, #2563eb);
  box-shadow: 0 0 30px rgba(236, 72, 153, 0.7);
}
```

#### Secondary Button (Glass Effect)

```css
.btn-secondary {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}
```

#### Solid Purple Button

```css
.btn-purple {
  padding: 0.5rem 1rem;
  background: #9333ea;                  /* Purple-600 */
  color: #ffffff;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.btn-purple:hover {
  background: #7e22ce;                  /* Purple-700 */
}
```

### Cards

#### Glass Card (Most Common)

```css
.card-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card-glass:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}
```

#### Purple Accent Card

```css
.card-purple {
  background: rgba(168, 85, 247, 0.2);  /* Purple-500 at 20% opacity */
  border: 1px solid rgba(196, 132, 252, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(168, 85, 247, 0.2);  /* Purple-500 at 20% opacity */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(196, 132, 252, 0.3);
  color: #d8b4fe;                       /* Purple-300 */
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 9999px;
}
```

### Input Fields

```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: #9333ea;                /* Purple-600 */
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.2);
}

.input::placeholder {
  color: #94a3b8;                       /* Slate-400 */
}
```

---

## Animations & Effects

### Backdrop Blur (Glassmorphism)

```css
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
```

### Transitions

```css
/* Standard transition */
transition: all 0.2s ease;

/* Slower transition for major changes */
transition: all 0.3s ease;

/* Color-only transition */
transition: color 0.2s ease;

/* Transform transition */
transition: transform 0.3s ease;
```

### Hover Effects

```css
/* Lift effect */
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Glow effect */
.hover-glow:hover {
  box-shadow: 0 0 30px rgba(236, 72, 153, 0.7);
}
```

### Pulse Animation

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## CSS Variables

```css
:root {
  /* Backgrounds */
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;

  /* Cards */
  --card: 0 0% 10%;
  --card-foreground: 0 0% 98%;

  /* Primary Colors */
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;

  /* Secondary Colors */
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;

  /* Muted Colors */
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;

  /* Accent Colors */
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;

  /* Destructive Colors */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;

  /* Borders & Inputs */
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;

  /* Border Radius */
  --radius: 0.5rem;
}

/* Dark Mode (Default for Voxxy) */
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
}
```

---

## Quick Copy: CSS Stylesheet

Here's a complete CSS file you can use directly:

```css
/* ============================================
   VOXXY PRESENTS - COMPLETE STYLESHEET
   ============================================ */

/* Reset & Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
               "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
               sans-serif;
  background: linear-gradient(to bottom right, #1a0b2e, #2d1b4e, #0f172a);
  color: #ffffff;
  min-height: 100vh;
  line-height: 1.6;
}

/* Container */
.container {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}

/* Typography */
h1 {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 0.75rem;
}

p {
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* Text Gradient */
.text-gradient-purple-pink {
  background: linear-gradient(to right, #c084fc, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation */
.navbar {
  position: relative;
  z-index: 50;
  padding: 1.5rem 1rem;
  background: rgba(31, 41, 55, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.navbar-link {
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.2s ease;
}

.navbar-link:hover {
  color: #c084fc;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(to right, #9333ea, #ec4899, #3b82f6);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
}

.btn-primary:hover {
  background: linear-gradient(to right, #7e22ce, #db2777, #2563eb);
  box-shadow: 0 0 30px rgba(236, 72, 153, 0.7);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-purple {
  background: #9333ea;
  color: #ffffff;
}

.btn-purple:hover {
  background: #7e22ce;
}

/* Cards */
.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.card-purple {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(196, 132, 252, 0.3);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(168, 85, 247, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(196, 132, 252, 0.3);
  color: #d8b4fe;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 9999px;
}

/* Input Fields */
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.2);
}

.input::placeholder {
  color: #94a3b8;
}

/* Sections */
.section {
  padding: 5rem 0;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.text-white {
  color: #ffffff;
}

.text-gray-300 {
  color: #d1d5db;
}

.text-purple-400 {
  color: #c084fc;
}

.text-pink-400 {
  color: #f472b6;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mt-8 {
  margin-top: 2rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.gap-4 {
  gap: 1rem;
}

.gap-8 {
  gap: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.75rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  .section {
    padding: 3rem 0;
  }
}
```

---

## Usage Examples

### Example: Hero Section

```html
<div class="section text-center">
  <div class="container">
    <div class="badge mb-4">
      🎉 Now in Beta
    </div>
    <h1 class="text-gradient-purple-pink">
      Build Your Community
    </h1>
    <p class="text-gray-300 mb-8">
      The easiest way to manage events, engage your audience, and grow your club.
    </p>
    <button class="btn btn-primary">
      Get Started
    </button>
  </div>
</div>
```

### Example: Feature Card

```html
<div class="card">
  <h3>Event Management</h3>
  <p class="text-gray-300">
    Create and manage events with ease. Track RSVPs, send updates, and more.
  </p>
  <button class="btn btn-purple">Learn More</button>
</div>
```

---

## Brand Guidelines

### Do's ✅
- Use the dark purple/navy gradient background (`#1a0b2e` → `#2d1b4e` → `#0f172a`)
- Apply glassmorphism effects (backdrop blur + subtle borders)
- Use purple (`#9333ea`) as the primary CTA color
- Combine purple and pink in gradients for emphasis
- Maintain generous whitespace and padding
- Use smooth transitions (0.2s-0.3s)

### Don'ts ❌
- Don't use bright white backgrounds (breaks brand aesthetic)
- Don't use hard borders without transparency
- Don't use colors outside the purple/pink/blue palette
- Don't skip the backdrop blur on glass elements
- Don't use jarring transitions (keep them smooth)

---

**End of Style Guide**

For questions or clarifications, contact the Voxxy Presents design team.
