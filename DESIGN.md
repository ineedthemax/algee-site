---
name: Algee Smith — Two Stages, One Soul
colors:
  primary: "#050505"
  secondary: "#8A8078"
  tertiary: "#C4222E"
  neutral: "#F5F0EB"
  card: "#111010"
  orange: "#C4622A"
  off: "#D8D2CB"
  dim: "#7A746E"
  red-dark: "#8B1A22"
  red-bright: "#E63946"
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: "220px"
    fontWeight: "900"
    lineHeight: "0.85"
    letterSpacing: "-5px"
  display-lg:
    fontFamily: Playfair Display
    fontSize: "120px"
    fontWeight: "900"
    lineHeight: "0.9"
    letterSpacing: "-3px"
  display-md:
    fontFamily: Playfair Display
    fontSize: "72px"
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: "-1.5px"
  body-lg:
    fontFamily: Barlow
    fontSize: "18px"
    fontWeight: "300"
    lineHeight: "1.9"
  body-md:
    fontFamily: Barlow
    fontSize: "15px"
    fontWeight: "400"
    lineHeight: "1.75"
  body-sm:
    fontFamily: Barlow
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "1.7"
  label-caps:
    fontFamily: Barlow Condensed
    fontSize: "10px"
    fontWeight: "600"
    letterSpacing: "4px"
  label-md:
    fontFamily: Barlow Condensed
    fontSize: "12px"
    fontWeight: "500"
    letterSpacing: "2.5px"
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 100px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 80px
  2xl: 120px
  3xl: 160px
---

## Overview

Cinematic dark luxury. The Algee Smith brand lives at the intersection of
two worlds — film and music — expressed through a high-contrast, editorial
visual identity. The UI feels like a premium magazine spread shot in a dark
studio: deep blacks, warm cream text, a single red accent that commands
attention without shouting.

The design system exists to make every page feel like a deliberate creative
statement — not a template. Every spacing choice, typographic scale, and
color decision serves the brand narrative: "Two Stages, One Soul."

## Colors

The palette is rooted in near-black foundations with a single warm neutral
and two accent temperatures.

- **Primary (#050505):** Near-absolute black. The canvas everything lives on. Not pure #000 — the slight warmth prevents harshness.
- **Secondary (#8A8078):** Warm greige for supporting text. Distinctly warmer than gray, keeps the palette cohesive.
- **Tertiary (#C4222E):** Brand red. The singular action color — used for CTAs, active states, and high-emphasis moments. Draws the eye without competing with the content.
- **Neutral (#F5F0EB):** Warm cream for primary text and headings. Softer than pure white, consistent with the warm undertone running through the full palette.
- **Orange (#C4622A):** Secondary accent, used for eyebrows, labels, and the italic display type. Creates warmth and hierarchy depth alongside the red.
- **Card (#111010):** Slightly lifted surface color for content cards. Just enough separation from the background to define space without harsh borders.

## Typography

Three-font system with strict role separation:

- **Playfair Display** (display, serif): The editorial headline voice. Heavy weights (700, 900) for impact. Italic variant used as a visual counterpoint — lighter weight, red or orange color, creates rhythm within headlines. Never used for body copy.
- **Barlow** (body, sans-serif): Clean, humanist sans for readable prose. Light weight (300) at large sizes, regular (400) at small. The contrast between Playfair's drama and Barlow's neutrality is intentional.
- **Barlow Condensed** (label, sans-serif): Uppercase labels, navigation, metadata, and small caps. Wide letter-spacing (3–5px) is mandatory. Never sentence case.

### Scale rationale

Display sizes use `clamp()` for fluid scaling — the brand must feel massive
on desktop and still commanding on mobile. Body text does not scale; 15–18px
is the readable range and should remain fixed.

## Components

### Navigation
- backgroundColor: "{colors.primary}"
- textColor: "{colors.neutral}"
- Glass effect on scroll: `backdrop-filter: blur(12px)` + 50% opacity background
- Active link: red underline `::after` pseudo-element
- CTA button: red background, cream text — the only filled button in the nav

### Cards
- backgroundColor: "{colors.card}"
- textColor: "{colors.neutral}"
- Border: `1px solid rgba(245,240,235,0.06)` — barely visible, structural only
- Hover: border brightens to `rgba(245,240,235,0.13)`
- Border radius: {rounded.lg} — 12px max, never pill-shaped for content cards

### Buttons — Primary (CTA)
- backgroundColor: "{colors.tertiary}"
- textColor: "{colors.neutral}"
- font: {typography.label-caps}
- Border radius: {rounded.full} — pill shape distinguishes interactive from content
- Hover: slight scale or letter-spacing expansion

### Buttons — Secondary (Ghost)
- backgroundColor: transparent
- textColor: "{colors.secondary}"
- Border: `1px solid rgba(245,240,235,0.15)`
- Hover: border brightens, text goes to {colors.neutral}

### Section Headers (Eyebrow Labels)
- textColor: "{colors.orange}"
- font: {typography.label-caps}
- Always preceded by a short horizontal rule in {colors.orange}

### Timeline Cards
- backgroundColor: "{colors.card}"
- textColor: "{colors.neutral}"
- Tag color: "{colors.tertiary}"
- Image: 16:9 ratio, `object-fit: cover`

## Spacing

Sections use large vertical rhythm — minimum 80px between major sections,
120–160px for hero-level separation. This white space is intentional: the
breathing room is part of the premium feel. Resist the urge to compress.

Mobile sections reduce by ~40% but never below 48px vertical padding.

## Patterns

### "Two Stages" Split Layout
The core homepage pattern: two panels flanking a center divider, one for
Film (left/right-aligned) and one for Music (right/left-aligned). Always
text-align mirrors — left panel right-aligns, right panel left-aligns —
so content reads toward the center. On mobile, panels stack and center.

### Cinematic Hero
Full-viewport heroes with a high-contrast photo, dark overlay, and
massive display type. The type always appears on the darkest region of
the image for readability. No decorative elements compete with the type.

### Bento Grid (Dashboard)
Apple-style information architecture: key metric cards in a CSS Grid
with one dominant card spanning two rows (identity), supported by
smaller stat cards. Tier color (`--tc` CSS var) cascades through the
entire dashboard via a single entry point.

## Intentional Tension

The design uses deliberate visual tension as a feature, not a bug:
- **Serif vs. Sans:** Playfair's drama against Barlow's neutrality
- **Scale contrast:** Massive display type next to tiny label-caps (10px, 4px letter-spacing)
- **Warm vs. cool:** The cream/orange warmth against near-black coolness
- **Motion vs. stillness:** Framer Motion scroll animations that feel earned, not decorative

This tension is what makes the brand feel alive. Don't resolve it.
