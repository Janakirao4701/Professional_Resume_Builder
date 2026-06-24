# Design System - Premium Utilitarian Minimalism

This design system defines the visual guidelines, typography, color tokens, and layout guidelines for Pravallika Resume Builder.

## 1. Visual Presets (Option 1)

*   `DESIGN_VARIANCE: 8` - Intentional asymmetry in grids and spacing, structured layout.
*   `MOTION_INTENSITY: 7` - Custom spring-physics animations for interactive controls, scroll-triggered reveal.
*   `VISUAL_DENSITY: 4` - Airy editorial layout with generous breathing space.

---

## 2. Color Palette Tokens

Color is used sparingly for semantic context and subtle accents.

| Token | CSS Variable | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `--color-mist` | `#fafaf9` | Page body background (warm bone off-white) |
| **Surface Element** | `--color-paper` | `#ffffff` | Card elements, editor surface, inputs |
| **Charcoal Primary Ink** | `--color-ink` | `#1f2937` | Primary body text, labels, titles |
| **Pencil Secondary Ink** | `--color-pencil` | `#4b5563` | Subtitles, helper text, captions |
| **Light Divider Line** | `--color-chalk` | `#e5e7eb` | Structural borders, 1px card hairlines |
| **Active Highlight** | `--color-ash` | `#d1d5db` | Hover bounds, key caps |
| **Compliant Action Blue**| `--color-signal-blue`| `#0052cc` | Primary links, interactive highlights (contrast ratio >= 4.5:1) |
| **Deep Action Blue** | `--color-deep-signal`| `#0747a6` | Hover/focus state for buttons |
| **Washed-out Accent Blue**| `--color-pale-blue` | `#e1f3fe` | Blue tags, background for light info status badges |
| **Washed-out Accent Red** | `--color-pale-red` | `#fdebec` | Danger buttons / delete tags |
| **Washed-out Accent Green**| `--color-pale-green`| `#edf3ec` | Verified statuses / green badge tags |
| **Washed-out Accent Yellow**| `--color-pale-yellow`| `#fbf3db` | Alert tags / warning badges |

---

## 3. Typography & Pairings

- **UI & Controls**: Geometric Sans-Serif: `Outfit`, `Plus Jakarta Sans`, system-ui.
- **Body & Information**: Modern legible Sans: `Plus Jakarta Sans`, `Inter`.
- **Headings & Display**: Bold Sans with tight tracking and leading.
  - Tracking: `letter-spacing: -0.03em` for display elements (`H1`, `H2`).
  - Leading: `line-height: 1.15` for headings.
- **Monospace & Metadata**: `Geist Mono`, `SF Mono`, `JetBrains Mono` for code, tags, formatting help.

---

## 4. Layout & Component Rules

### Macro Spacing
- **Section Margin**: Gap between main landing page sections is locked at `120px` to `160px` (`py-32` to `py-40`) to ensure editorial breathe space.
- **Container max-width**: Page width is locked to `max-w-7xl` (`1280px`).

### Double-Bezel Nested Card (Doppelrand)
Every primary card and bento box element must be wrapped in nested enclosures to reflect tactile precision.
- **Outer Wrapper**: `border: 1px solid var(--color-chalk)`, padding `p-1.5`, background `var(--color-mist)`, border-radius `16px`.
- **Inner Core**: Background `var(--color-paper)`, highlight `shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]` (or subtle top highlights), padding `p-6`, border-radius `calc(16px - 6px) = 10px`.

### Button & CTA Architecture
- **Interactive Pills**: Buttons are styled as rounded pills (`border-radius: 9999px` or crisp rounded blocks `6px` depending on style).
- **Button-in-Button Icon**: All primary actions with arrows/icons must place the arrow/icon inside a separate visual circle (`w-7 h-7 bg-white/20 dark:bg-black/10 rounded-full flex items-center justify-center`) placed flush inside the right padding of the button.

### Form Inputs
- **Labels**: Always placed ABOVE inputs in `uppercase tracking-wider text-xs`.
- **Error Placement**: Always inline BELOW inputs in desaturated red `#b91c1c`.

---

## 5. Animation Curves (Spring Physics)

All micro-interactions and scroll entries should avoid linear transitions.
- **Transition Curve**: `cubic-bezier(0.16, 1, 0.3, 1)` (Power4 Out) or spring simulation.
- **Scroll Entrance**: `translateY(24px) opacity: 0` shifting to `translateY(0) opacity: 1` over `600ms`.
- **Button Press Feedbacks**: Scale down slightly (`active:scale-[0.97]`) on active tap/click.
