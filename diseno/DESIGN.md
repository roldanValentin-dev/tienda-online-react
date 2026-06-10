---
name: Pâtisserie & Tradition
colors:
  surface: '#fef8f3'
  surface-dim: '#ded9d4'
  surface-bright: '#fef8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3ee'
  surface-container: '#f2ede8'
  surface-container-high: '#ece7e2'
  surface-container-highest: '#e6e2dd'
  on-surface: '#1d1b19'
  on-surface-variant: '#4f4540'
  inverse-surface: '#32302d'
  inverse-on-surface: '#f5f0eb'
  outline: '#81746f'
  outline-variant: '#d3c3bd'
  surface-tint: '#72594d'
  primary: '#100401'
  on-primary: '#ffffff'
  primary-container: '#2d1b12'
  on-primary-container: '#9d8174'
  inverse-primary: '#e0c0b1'
  secondary: '#755b00'
  on-secondary: '#ffffff'
  secondary-container: '#fed977'
  on-secondary-container: '#785d00'
  tertiary: '#150203'
  on-tertiary: '#ffffff'
  tertiary-container: '#331718'
  on-tertiary-container: '#a77c7c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fddccd'
  primary-fixed-dim: '#e0c0b1'
  on-primary-fixed: '#29170f'
  on-primary-fixed-variant: '#584237'
  secondary-fixed: '#ffe08f'
  secondary-fixed-dim: '#e6c364'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#ecbbba'
  on-tertiary-fixed: '#2f1314'
  on-tertiary-fixed-variant: '#603d3e'
  background: '#fef8f3'
  on-background: '#1d1b19'
  surface-variant: '#e6e2dd'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  italic-detail:
    fontFamily: Libre Caslon Text
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The brand personality bridges the gap between classic Parisian elegance and the warm, welcoming spirit of Tucumán. It is artisanal and sophisticated yet deeply approachable, evoking the tactile quality of flour, the glisten of gold leaf, and the comfort of a warm oven.

The design style is **Modern Editorial with Tactile Warmth**. It avoids the sterility of modern minimalism by embracing organic textures, soft layering, and rich typography. It utilizes high-contrast serif headlines to establish authority and trust, while maintaining a "homey" feel through soft color transitions and generous whitespace that mimics a high-end culinary magazine.

## Colors
The palette is rooted in the natural tones of pastry craft: parchment, chocolate, and caramel.

- **Warm Background (#fdf8f3):** Use as the primary canvas to ensure the UI feels soft and sunlit rather than clinical.
- **Primary Text (#2d1b12):** A deep espresso brown used for maximum readability and a premium feel.
- **Gold (#c9a84c) & Light Gold (#e8d5a3):** Use for highlights, borders, and interactive states to signal quality.
- **Pastel Pink (#d4a5a5):** Used sparingly for soft accents, notifications, or "seasonal" highlights.
- **Caramel (#c17f4e):** The primary action color for buttons and links, providing warmth and visibility.
- **Deep Brown (#1a0f0a):** Reserved for footer sections or immersive "dark mode" card overlays.

## Typography
The typographic scale emphasizes the contrast between the authoritative **Playfair Display** and the functional **DM Sans**. 

- **Display & Headlines:** Use Playfair Display for all major headings. For a truly "French" editorial look, use the Italic variant of Playfair for secondary words in a headline.
- **Body Text:** DM Sans provides clarity for ingredient lists and descriptions. Keep line lengths moderate (max 65 characters) to maintain the "homey" reading experience.
- **Decorative Accents:** Use Libre Caslon Text (as a close alternative to Cormorant) for pull quotes, captions, or "Chef's Notes." It should always be italicized to signify a personal, artisanal touch.

## Layout & Spacing
This design system uses a **fixed-center grid** for desktop and a **fluid grid** for mobile.

- **Desktop:** 12-column grid with a 1200px max-width. Use wide gutters (24px) to allow the "breathable" feel of a luxury menu.
- **Mobile:** 4-column grid with 16px margins.
- **Vertical Rhythm:** Spacing should follow an 8px base unit. Use larger gaps (64px+) between major sections to emphasize the "Editorial" layout.
- **Composition:** Asymmetric layouts are encouraged for product showcases—placing a high-quality pastry image slightly off-center with overlapping typography creates a modern, artisanal aesthetic.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Ambient Shadows** rather than harsh borders.

- **Surfaces:** Use the Warm Background (#fdf8f3) as Level 0. Cards and floating elements use white (#ffffff) to subtly lift off the page.
- **Shadows:** Use extremely soft, diffused shadows with a slight Caramel tint. Example: `0px 10px 30px rgba(193, 127, 78, 0.08)`. This mimics the soft shadow of a pastry on parchment paper.
- **Gold Accents:** Use 1px solid lines in Gold (#c9a84c) or Light Gold (#e8d5a3) to separate sections or frame images, adding a sense of curated luxury without adding "weight."

## Shapes
The shape language is "Rounded" to evoke the organic, hand-rolled nature of dough and pastries.

- **Components:** Standard buttons and input fields use a `0.5rem` (8px) radius.
- **Feature Cards:** Use `1rem` (16px) for larger product cards to feel more inviting.
- **Images:** High-quality food photography should use a soft `rounded-lg` corner or, for specific "Signature" items, a sophisticated **Arch** mask (rounded top, flat bottom).

## Components
- **Buttons:** The primary button uses the Caramel (#c17f4e) background with Primary Text (#2d1b12). Use a slight grow transition on hover. Secondary buttons should use a Gold (#c9a84c) outline with no fill.
- **Cards:** Product cards should have a subtle white background, soft ambient shadow, and a 1px Light Gold border at the bottom.
- **Input Fields:** Use the Warm Background for the field fill, with a 1px border in Secondary Text (#8b7355) that transitions to Gold (#c9a84c) on focus.
- **Chips/Tags:** Use Pastel Pink (#d4a5a5) for "New" or "Seasonal" tags with Primary Text.
- **Dividers:** Instead of plain lines, use a 1px Gold line that fades out at both ends, or a small decorative flourish (like a centered dot or leaf icon).
- **Lists:** Ingredient or menu lists should use DM Sans with increased line height (1.8) and use Gold-colored bullets or small elegant icons.