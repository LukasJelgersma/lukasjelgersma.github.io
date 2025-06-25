# SCSS Architecture

This project uses a well-organized SCSS architecture following the 7-1 pattern (simplified).

## Folder Structure

```
src/styles/
├── abstracts/           # Variables, mixins, functions
│   ├── _variables.scss  # All project variables
│   ├── _mixins.scss     # Reusable mixins
│   └── _index.scss      # Forward all abstracts
├── base/                # Global styles, resets
│   └── _base.scss       # Global HTML elements
├── components/          # Component-specific styles
│   └── _app.scss        # App component styles
├── pages/               # Page-specific styles
│   ├── _loading-page.scss
│   └── _main-page.scss
└── main.scss           # Main entry point
```

## Variables Available

### Colors
- `$primary: #667eea`
- `$secondary: #764ba2`
- `$accent: #646cff`
- Various neutral colors and text colors

### Spacing
- `$spacing-xs` through `$spacing-2xl`

### Typography
- Font sizes: `$font-xs` through `$font-4xl`
- Font weights: `$font-normal`, `$font-medium`, `$font-semibold`, `$font-bold`

### Other Variables
- Border radius, shadows, transitions, breakpoints, z-index values

## Mixins Available

### Layout Mixins
- `@include flex-center` - Center items with flexbox
- `@include flex-between` - Space between with flexbox
- `@include flex-column-center` - Centered column layout

### Responsive Mixins
- `@include mobile { ... }` - Mobile styles
- `@include tablet { ... }` - Tablet styles
- `@include desktop { ... }` - Desktop styles

### Component Mixins
- `@include card` - Card component styles
- `@include button-primary` - Primary button styles
- `@include hover-lift` - Hover lift effect

### Animation Mixins
- `@include fade-in` - Fade in animation
- `@include fade-out` - Fade out animation

## Usage Examples

```scss
// In a new component file
@import '../abstracts/variables';
@import '../abstracts/mixins';

.my-component {
  background: $primary;
  padding: $spacing-lg;
  @include card;
  @include hover-lift;
  
  @include tablet {
    padding: $spacing-md;
  }
}
```

## Import Order
Always import in this order:
1. Variables
2. Mixins
3. Your component styles
