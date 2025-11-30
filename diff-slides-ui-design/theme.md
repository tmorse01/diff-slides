# DiffSlides Theme Documentation

This document outlines the design system and theme configuration for DiffSlides, based on the v0.dev design. This theme prioritizes a **dark-first developer aesthetic** optimized for code visualization and diff highlighting.

## Design Philosophy

- **Dark-First**: The theme is designed primarily for dark mode, with a sophisticated dark palette that reduces eye strain during long coding sessions
- **Developer-Focused**: Optimized for code readability and diff visualization
- **Semantic Colors**: Colors have semantic meaning (green for additions, red for deletions)
- **Modern Aesthetics**: Uses OKLCH color space for better color consistency and perceptual uniformity

## Color System

### Color Space
The theme uses **OKLCH** (OK Lightness, Chroma, Hue) color space for:
- Better perceptual uniformity
- More predictable color mixing
- Improved accessibility
- Future-proof color definitions

### Base Colors

#### Background & Foreground
```css
--background: oklch(0.16 0 0)        /* Very dark gray - main background */
--foreground: oklch(0.98 0 0)       /* Near white - primary text */
```

#### Card & Surfaces
```css
--card: oklch(0.19 0 0)             /* Slightly lighter than background */
--card-foreground: oklch(0.98 0 0)  /* Text on cards */
--popover: oklch(0.19 0 0)          /* Popover backgrounds */
```

#### Primary & Secondary
```css
--primary: oklch(0.98 0 0)          /* White/light - primary actions */
--primary-foreground: oklch(0.16 0 0) /* Dark text on primary */
--secondary: oklch(0.24 0 0)         /* Secondary surfaces */
--secondary-foreground: oklch(0.98 0 0) /* Text on secondary */
```

#### Muted Colors
```css
--muted: oklch(0.24 0 0)            /* Muted backgrounds */
--muted-foreground: oklch(0.65 0 0) /* Muted text (medium gray) */
```

### Semantic Colors

#### Accent (Additions/Positive)
```css
--accent: oklch(0.73 0.17 145)      /* Green - for code additions */
--accent-foreground: oklch(0.16 0 0) /* Dark text on accent */
```
- **Usage**: Highlight added lines in code diffs, success states, positive actions
- **Hue**: 145° (green)
- **Visual**: Bright, vibrant green that stands out against dark backgrounds

#### Destructive (Deletions/Negative)
```css
--destructive: oklch(0.65 0.22 22)  /* Red - for code deletions */
--destructive-foreground: oklch(0.98 0 0) /* Light text on destructive */
```
- **Usage**: Highlight removed lines in code diffs, error states, destructive actions
- **Hue**: 22° (red-orange)
- **Visual**: Warm red that clearly indicates removal or errors

#### Borders & Inputs
```css
--border: oklch(0.27 0 0)           /* Subtle borders */
--input: oklch(0.27 0 0)            /* Input field borders */
--ring: oklch(0.73 0.17 145)        /* Focus ring (matches accent) */
```

### Chart Colors
Used for data visualization and additional UI elements:
```css
--chart-1: oklch(0.73 0.17 145)     /* Green (matches accent) */
--chart-2: oklch(0.65 0.22 22)      /* Red (matches destructive) */
--chart-3: oklch(0.75 0.15 85)      /* Yellow-green */
--chart-4: oklch(0.68 0.18 265)     /* Purple */
--chart-5: oklch(0.72 0.16 195)     /* Blue */
```

### Sidebar Colors
```css
--sidebar: oklch(0.19 0 0)          /* Sidebar background */
--sidebar-foreground: oklch(0.98 0 0) /* Sidebar text */
--sidebar-primary: oklch(0.73 0.17 145) /* Active sidebar item */
--sidebar-primary-foreground: oklch(0.16 0 0) /* Text on active item */
--sidebar-accent: oklch(0.24 0 0)   /* Hovered sidebar item */
--sidebar-accent-foreground: oklch(0.98 0 0) /* Text on hovered item */
--sidebar-border: oklch(0.27 0 0)   /* Sidebar borders */
--sidebar-ring: oklch(0.73 0.17 145) /* Sidebar focus ring */
```

### Border Radius
```css
--radius: 0.75rem                    /* 12px - consistent rounded corners */
```
- **Small**: `calc(var(--radius) - 4px)` = 8px
- **Medium**: `calc(var(--radius) - 2px)` = 10px
- **Large**: `var(--radius)` = 12px
- **Extra Large**: `calc(var(--radius) + 4px)` = 16px

## Typography

### Font Families
- **Sans**: "Geist", "Geist Fallback" - Primary UI font
- **Mono**: "Geist Mono", "Geist Mono Fallback" - Code and technical text

### Font Usage
- **UI Elements**: Geist Sans
- **Code Blocks**: Geist Mono
- **Branding**: Geist Mono (for "DiffSlides" branding)

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Layout & Spacing

### Container
- Max width: Responsive with padding
- Padding: `px-4` (1rem) on mobile, more on larger screens

### Section Spacing
- **Large sections**: `py-24` (6rem / 96px)
- **Medium sections**: `py-12` (3rem / 48px)
- **Small sections**: `py-6` (1.5rem / 24px)

### Component Spacing
- **Card padding**: `p-6` to `p-8` (1.5rem - 2rem)
- **Button padding**: Varies by size (sm, default, lg)
- **Gap between elements**: `gap-4` to `gap-6` (1rem - 1.5rem)

## Component Patterns

### Cards
```tsx
<Card className="p-6 bg-card border-border hover:border-accent/50 transition-colors">
```
- Background: `bg-card`
- Border: `border-border` with hover state `hover:border-accent/50`
- Smooth transitions on hover

### Buttons
- **Primary**: `bg-primary text-primary-foreground` (white on dark)
- **Secondary/Outline**: `variant="outline"` with transparent background
- **Ghost**: Minimal styling, used for secondary actions
- **Hover states**: Subtle opacity changes or background shifts

### Code Blocks
- Background: `bg-background` or `bg-card`
- Border: `border-border`
- Line numbers: `text-muted-foreground`
- Added lines: `bg-accent/10 border-l-2 border-accent text-accent`
- Removed lines: `bg-destructive/10 border-l-2 border-destructive text-destructive line-through`
- Unchanged lines: Default foreground color

### Grid Patterns
- **Features**: `md:grid-cols-2 lg:grid-cols-4`
- **Pricing**: `md:grid-cols-2`
- **Footer**: `md:grid-cols-4`
- Gap: `gap-6` to `gap-8`

## Animations

### Custom Animations

#### Diff Fade In
```css
@keyframes diff-fade-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```
- **Usage**: When code lines appear or change
- **Duration**: 0.5s
- **Easing**: ease-out

#### Code Slide
```css
@keyframes code-slide {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
```
- **Usage**: Subtle floating animation for code previews
- **Duration**: 3s
- **Easing**: ease-in-out
- **Iteration**: infinite

### Transition Patterns
- **Colors**: `transition-colors` for hover states
- **Transforms**: `transition-transform` for icon movements
- **Default duration**: 150-300ms

## Background Patterns

### Grid Pattern
Used in hero sections:
```css
bg-[linear-gradient(to_right,oklch(0.22_0_0)_1px,transparent_1px),
    linear-gradient(to_bottom,oklch(0.22_0_0)_1px,transparent_1px)]
bg-[size:4rem_4rem]
[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]
```
- Creates a subtle grid overlay
- Fades out at the top with radial gradient mask
- Grid size: 4rem (64px)

### Backdrop Effects
- **Blur**: `backdrop-blur-sm` for overlays
- **Opacity**: `bg-card/50` for semi-transparent backgrounds

## Dark Mode

The theme is **dark-first**, meaning:
- Default state is dark mode
- Light mode is not implemented (both `:root` and `.dark` use the same values)
- HTML element has `className="dark"` by default

## Usage Guidelines

### Color Usage
1. **Always use semantic colors**:
   - Green (`accent`) for additions, success, positive actions
   - Red (`destructive`) for deletions, errors, destructive actions
   - Muted colors for secondary information

2. **Maintain contrast**:
   - Text on backgrounds should use `foreground` or `muted-foreground`
   - Ensure WCAG AA contrast ratios (automatically handled by OKLCH values)

3. **Consistent borders**:
   - Use `border-border` for standard borders
   - Use `border-accent` or `border-destructive` for semantic emphasis

### Component Styling
1. **Cards**: Always include hover states with `hover:border-accent/50`
2. **Buttons**: Use appropriate variants (default, outline, ghost)
3. **Code**: Use semantic colors for diff highlighting
4. **Spacing**: Follow the spacing scale (4, 6, 8, 12, 24)

### Animation Guidelines
1. **Keep animations subtle**: Don't distract from content
2. **Use for feedback**: Hover states, transitions between states
3. **Performance**: Prefer `transform` and `opacity` for animations

## Implementation Notes

### CSS Variables
All colors are defined as CSS custom properties in `app/globals.css`:
- Variables are prefixed with `--`
- Tailwind automatically maps these to utility classes
- Use `@theme inline` for Tailwind v4 integration

### Tailwind Configuration
- Uses `cssVariables: true` in `components.json`
- Base color: `neutral`
- Style: `new-york` (shadcn/ui style)

### Theme Provider
Uses `next-themes` for theme management, though currently only dark mode is implemented.

## Future Considerations

1. **Light Mode**: If needed, add light mode variants to color definitions
2. **Accessibility**: Consider adding high contrast mode
3. **Customization**: Allow users to adjust accent colors
4. **Animation Preferences**: Respect `prefers-reduced-motion`

## References

- **v0.dev**: Design generated with v0.dev
- **shadcn/ui**: Component system (New York style)
- **OKLCH**: Modern color space for better color handling
- **Geist Font**: Vercel's font family
- **Tailwind CSS v4**: Utility-first CSS framework

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0
**Design Source**: v0.dev

