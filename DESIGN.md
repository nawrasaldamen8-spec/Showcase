# Warm Gallery (Anthropic × VSCO) — Style Reference

> A monochrome photography exhibition hosted in a warm, vintage scientific journal. Massive geometric headlines meet editorial serif reading text on an ivory canvas.

**Theme:** warm-editorial

This hybrid system reads like a curated, high-end gallery printed on warm parchment. It takes the unyielding, massive typographic scale and edge-to-edge photography of VSCO and softens it with Anthropic's ivory canvases and editorial serif body text. The harsh pure blacks and whites are replaced by deep slates and warm oats. Buttons retain VSCO's unapologetic pill shape (999px radius) but utilize Anthropic's Clay accent for the single moment of action. There are no shadows or gradients—elevation is purely tonal and structural.

## Tokens — Colors

| Name         | Value     | Token                  | Role                                                                                |

| ------------ | --------- | ---------------------- | ----------------------------------------------------------------------------------- |

| Slate Dark   | `#141413` | `--color-slate-dark`   | Primary text, display headings, filled buttons, dark sections. Replaces pure black. |

| Ivory Medium | `#f0eee6` | `--color-ivory-medium` | **Page Canvas** — the primary warm parchment background inherited from Anthropic.   |

| Ivory Light  | `#faf9f5` | `--color-ivory-light`  | Elevated cards, panels, and nav bars. One step brighter than canvas.                |

| Fog Gray     | `#f2f2f2` | `--color-fog-gray`     | Subtle alternate section background for photography bands.                          |

| Cloud Dark   | `#87867f` | `--color-cloud-dark`   | Outlined button borders, muted labels, secondary text.                              |

| Stone        | `#cccbc8` | `--color-stone`        | Hairline borders, dividers, and inactive tabs.                                      |

| Clay         | `#d97757` | `--color-clay`         | The single primary CTA accent color. Earth-toned warmth.                            |

| Amber        | `#f1a900` | `--color-amber`        | Secondary/Micro accent — used strictly for small 'NEW' badges or subtle indicators. |

## Tokens — Typography

### Display: VSCO Gothic

**Role:** Massive, commanding headlines, nav links, and UI tabs. Tracked tight at large sizes, spaced out for UI labels.

- **Sizes:** 13px (UI), 24px (Cards), 54px (Section), 89px+ (Hero)

- **Letter Spacing:** -0.05em (Hero), 0.10em (Nav/Tabs)

### Body: Anthropic Serif

**Role:** Editorial voice — used for all body paragraphs, article text, and supporting copy.

- **Sizes:** 16px (Body-sm), 20px (Body-lg)

- **Line Height:** 1.4 - 1.5

### Type Scale

| Role       | Family | Size | Line Height | Letter Spacing | Token               |

| ---------- | ------ | ---- | ----------- | -------------- | ------------------- |

| label/nav  | Gothic | 13px | 1.0         | 0.10em         | `--text-label`      |

| body-sm    | Serif  | 16px | 1.5         | normal         | `--text-body-sm`    |

| body-lg    | Serif  | 20px | 1.4         | normal         | `--text-body-lg`    |

| subheading | Gothic | 24px | 1.29        | -0.02em        | `--text-subheading` |

| heading    | Gothic | 54px | 1.08        | -0.05em        | `--text-heading`    |

| display    | Gothic | 89px | 0.95        | -0.05em        | `--text-display`    |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** compact reading, expansive imagery

### Border Radius

| Element | Value | Rationale                                               |

| ------- | ----- | ------------------------------------------------------- |

| nav     | 0px   | Flat, editorial flush edges                             |

| cards   | 24px  | Anthropic's paper-stack radius for content blocks       |

| buttons | 999px | VSCO's signature pill shape for all interactive actions |

| tags    | 999px | Pill-shaped metadata                                    |

## Components

### The Gallery Hero Block

**Role:** Asymmetric, massive impact intro.

Canvas `#f0eee6`. Left column features VSCO Gothic at 89px, `#141413`, leading 0.95, tightly tracked. Right column holds the supporting paragraph in Anthropic Serif at 20px, `#141413`. Below the text, a full-bleed photograph edge-to-edge.

### Filled Clay Pill Button

**Role:** Primary CTA (e.g., "Start Creating").

999px radius, `#d97757` background, `#faf9f5` text. Font: VSCO Gothic 13px, weight 500, uppercase, 0.10em tracking. Padding: 12px 24px. The warm accent on the ivory page.

### Slate Action Pill

**Role:** Default action and secondary UI triggers.

999px radius, `#141413` background, `#faf9f5` text. Gothic 13px. Flat, no hover gradient.

### Editorial Product Card

**Role:** Feature showcase.

Background `#faf9f5`, 24px radius. Top 60% is edge-to-edge photography. Bottom 40% has 24px padding. Title in VSCO Gothic 24px `#141413`, description in Anthropic Serif 16px. Inline text link with a persistent 1px underline.

### Tab Bar

**Role:** Section-level content switcher.

Horizontal text tabs. VSCO Gothic 13px, 0.10em tracking, uppercase. Active tab `#141413` with a 1px `#141413` underline. Inactive tabs `#87867f`. No pill containers, just pure typographic navigation.

## Do's and Don'ts

### Do

- Use `#f0eee6` (Ivory) as the absolute baseline canvas. Pure white (`#ffffff`) is banned to maintain the vintage journal warmth.

- Combine the massive VSCO Gothic (89px+) with the elegant Anthropic Serif (20px) right next to each other. The contrast creates the identity.

- Make all interactive buttons 999px pills, but keep cards at 24px radius.

- Ensure all photography bleeds to the edges when used outside of cards.

### Don't

- Don't use box shadows anywhere. Elevation is achieved purely by shifting from `#f0eee6` to `#faf9f5` or `#141413`.

- Don't apply the Clay or Amber colors to typography or backgrounds; reserve them strictly for pill buttons and tiny badges.

- Don't center the massive display text. Always left-align hero sections to maintain the editorial grid.

## Quick Start: CSS Custom Properties

```css
:root {

  /* Colors - Merged Palette */

  --color-slate-dark: #141413;

  --color-ivory-medium: #f0eee6;

  --color-ivory-light: #faf9f5;

  --color-fog-gray: #f2f2f2;

  --color-cloud-dark: #87867f;

  --color-stone: #cccbc8;

  --color-clay: #d97757;

  --color-amber: #f1a900;



  /* Typography */

  --font-gothic: "VSCO Gothic", ui-sans-serif, system-ui, sans-serif;

  --font-serif: "Anthropic Serif", ui-serif, Georgia, serif;



  /* Typographic Scale */

  --text-label: 13px;

  --text-body-sm: 16px;

  --text-body-lg: 20px;

  --text-subheading: 24px;

  --text-heading: 54px;

  --text-display: 89px;



  /* Border Radius */

  --radius-card: 24px;

  --radius-pill: 999px;



  /* Surfaces */

  --surface-canvas: var(--color-ivory-medium);

  --surface-card: var(--color-ivory-light);

  --surface-inverted: var(--color-slate-dark);

}
```
