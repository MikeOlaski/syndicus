# Design System Specification: The Luminous Technical Editorial

## 1. Overview & Creative North Star

### Creative North Star: "The Digital Luminary"
This design system rejects the "flat and boxy" SaaS aesthetic in favor of **The Digital Luminary**—an editorial-first approach that treats software as a premium, curated experience. It draws inspiration from high-end tech journalism and architectural lighting, blending deep, authoritative navy foundations with ethereal teal accents.

The system breaks the "template" look through:
*   **Intentional Asymmetry:** Breaking standard grid rows with overlapping circular elements and floating cards.
*   **Radiant Depth:** Using glowing accents (glow-states) rather than heavy drop shadows to signify interaction.
*   **Typographic Authority:** A high-contrast scale that uses technical sans-serifs with generous tracking to feel sophisticated and airy.

---

## 2. Colors

The color palette is designed to transition from a clean, high-light secondary state to a deep, immersive primary state.

### Core Palette (Material Design Tokens)
*   **Primary (Foundation):** `#000000` (Used as the core anchor for typography and deep navigation).
*   **Primary Container:** `#001a40` (The "Deep Navy" base for immersive sections).
*   **Secondary (Action):** `#006b5b` (The "Professional Teal").
*   **Secondary Container:** `#26fedc` (The "Vibrant Cyan" used for high-visibility accents and glow effects).
*   **Background:** `#f7f9fb` (The "Off-White" light secondary background).
*   **Surface Tiers:**
    *   `surface-container-lowest`: `#ffffff` (Floating cards and input fields).
    *   `surface-container`: `#eceef0` (Section backgrounds).

### The "No-Line" Rule
**Explicit Instruction:** Prohibit 1px solid borders for sectioning or card containment. Boundaries must be defined solely through background color shifts or tonal transitions. Use `surface-container-low` sections sitting on a `surface` background to define hierarchy.

### The "Glass & Gradient" Rule
To achieve a signature feel, utilize semi-transparent surface colors with a `backdrop-blur` (12px–20px) for floating elements like navigation bars or overlays. For main CTAs, apply a subtle linear gradient from `secondary` to `secondary_fixed_dim` at a 135-degree angle to provide visual "soul."

---

## 3. Typography

The system utilizes two distinct sans-serif families to balance technical precision with editorial elegance.

### Typographic Hierarchy
*   **Display (Manrope):** `display-lg` (3.5rem) / `display-md` (2.75rem). Used for hero statements. Set with `-0.02em` letter spacing for a "tight," premium look.
*   **Headline (Manrope):** `headline-lg` (2rem). Used for section titles. Often utilizes a "Split Tone" treatment where one word uses the `secondary_container` (Cyan) to highlight key tech concepts.
*   **Title (Inter):** `title-lg` (1.375rem). Bold and structural for card headings.
*   **Body (Inter):** `body-lg` (1rem). Set with a line-height of `1.6` to ensure maximum readability in dense tech documentation.
*   **Label (Inter):** `label-md` (0.75rem). Uppercase with `0.05em` tracking for a technical, "data-tag" appearance.

---

## 4. Elevation & Depth

Hierarchy is achieved through **Tonal Layering** and **Luminous Shadows**.

### The Layering Principle
Depth is created by "stacking" surface tiers.
*   **Level 0:** `surface` (Base page).
*   **Level 1:** `surface-container-low` (Nested sections).
*   **Level 2:** `surface-container-lowest` (Interactive cards).

### Ambient Shadows & Glows
*   **Standard Lift:** Use a shadow tinted with `on-surface` at 4% opacity, with a 32px blur and 8px Y-offset.
*   **The "Teal Bloom":** For high-priority elements (like the circular mission avatars), apply a `secondary_container` drop shadow with a 40px blur at 30% opacity to create a "halo" effect.
*   **The Ghost Border:** If a boundary is required for accessibility, use the `outline-variant` token at 15% opacity. Never use a 100% opaque border.

---

## 5. Components

### Buttons
*   **Primary:** High-pill shape (`rounded-full`). Background: `primary_container`. Label: `primary_fixed`. On hover: Apply a subtle cyan outer glow.
*   **Secondary:** Ghost style. No background. `outline-variant` (15% opacity). 
*   **Tertiary:** Text-only with a "Learn more →" pattern. Use `secondary` color for the arrow to pull the eye.

### Interactive Cards
*   **Style:** `surface-container-lowest` background, `rounded-xl` (1.5rem) corners.
*   **Layout:** Forbid divider lines. Use `spacing-6` (2rem) as the standard internal padding.
*   **The "Overlap" Pattern:** Circular elements (avatars/icons) should be positioned to overlap the top edge of the card by `2.75rem` (spacing-8) to break the rigid grid.

### Input Fields
*   **Default:** `surface-container-highest` background with a `rounded-md` corner.
*   **Active:** Transition background to `surface-container-lowest` and apply a `secondary` 1px "Ghost Border."

### Progress Steps / Numbers
*   **Visual:** Circles using `tertiary_container` with `on_tertiary_container` text. Position these offset to the left of content to create a vertical "timeline" thread without using a physical line.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool. Use `spacing-16` (5.5rem) between major sections to let the "Editorial" breathe.
*   **DO** use vibrant Teal/Cyan specifically for "Future-facing" or "AI" related terms within headings.
*   **DO** utilize the `rounded-full` (9999px) scale for all primary action buttons and iconography containers.

### Don't
*   **DON'T** use 1px solid black or dark grey borders. They break the "Luminous" quality of the system.
*   **DON'T** use standard "Drop Shadows" (#000000 at 25%). They feel "dirty" on the light secondary background.
*   **DON'T** crowd the layout. If a card feels tight, increase the internal padding using the `spacing-8` token rather than shrinking the text.