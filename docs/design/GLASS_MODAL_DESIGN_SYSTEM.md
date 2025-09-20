# Glass Modal Design System

## Overview
This document defines the standardized glass morphism modal styling used across the Voxxy Presents platform. The design provides a consistent, modern look with enhanced readability.

## Core Styling

### Background & Blur
- **Background**: `bg-white/15` (15% white opacity)
- **Backdrop Blur**: `backdrop-blur-md` (enhanced blur for better contrast)
- **Border**: `border-white/30` (30% white opacity)
- **Shadow**: `shadow-2xl shadow-black/50` for depth

### Text Colors
- **Primary Text**: `text-white`
- **Secondary Text**: `text-gray-300` 
- **Muted Text**: `text-gray-400`
- **Accent Color**: `text-purple-400`

### Input Styling
```css
bg-white/10 border-white/20 text-white placeholder-gray-400 
focus:border-purple-400 focus:ring-purple-400/20
```

### Button Styles
- **Primary**: Purple gradient buttons (`bg-purple-600 hover:bg-purple-700`)
- **Secondary**: Glass buttons (`bg-white/10 border-white/20 hover:bg-white/20`)
- **Outline**: Subtle glass (`bg-white/10 backdrop-blur-sm border-white/20`)

## Component Usage

### GlassModal Component
```tsx
import { GlassModal } from '@/components/ui/glass-modal'

<GlassModal
  trigger={<Button>Open Modal</Button>}
  title="Modal Title"
  icon={<Icon className="h-6 w-6 text-purple-400" />}
  size="lg"
>
  <p>Your modal content here</p>
</GlassModal>
```

### Size Options
- `sm`: `sm:max-w-sm` - Small modals (forms, confirmations)
- `md`: `sm:max-w-md` - Default size
- `lg`: `sm:max-w-lg` - Large content (subscription modal)
- `xl`: `sm:max-w-2xl` - Extra large (complex forms, tables)

### GlassCard for Internal Sections
```tsx
import { GlassCard } from '@/components/ui/glass-modal'

<GlassCard>
  <p>Content with subtle glass background</p>
</GlassCard>
```

## Modals to Update

Based on the current codebase, these modals should adopt the glass style:

1. **Event Management Modals**
   - Create Event Modal
   - Edit Event Modal
   - Event Registration Modal

2. **Admin Modals**
   - Club Settings Modal
   - Delete Confirmation Modals
   - Image Upload Modals

3. **User Interface Modals**
   - Profile Settings Modal
   - Contact Form Modals

## Implementation Notes

### Enhanced Backdrop Blur
The `backdrop-blur-md` with `bg-white/15` provides better contrast than the previous `backdrop-blur-sm` with `bg-white/10`. This prevents white text from being hard to read against light backgrounds showing through.

### Accessibility
- High contrast white text on dark glass background
- Purple accents maintain brand consistency
- Focus states clearly defined with purple rings

### Responsive Behavior
- All modals are responsive with `max-h-[90vh]` and `overflow-y-auto`
- Size classes work across all screen sizes
- Touch-friendly sizing on mobile devices

## Future Enhancements
- Animation presets for consistent enter/exit transitions
- Dark/light theme variants if needed
- Accessibility improvements (focus trapping, ARIA labels)
- Performance optimizations for backdrop blur on lower-end devices