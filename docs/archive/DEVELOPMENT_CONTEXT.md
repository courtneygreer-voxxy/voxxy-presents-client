# 🧠 Development Context & Guidelines

## Overview
This document provides essential context for developers working on the Voxxy Presents codebase, highlighting common patterns, gotchas, and architectural decisions to maintain code quality and prevent recurring issues.

## 🏗️ Architecture Patterns

### Component Organization
```
src/components/
├── ui/                    # Base shadcn/ui components (don't modify)
├── admin/                 # Admin-specific components
│   └── design/           # Design customization system
├── auth/                 # Authentication components
├── profile/              # User profile components
└── [ComponentName.tsx]   # Reusable page components
```

### Key Architectural Decisions
- **No authentication system yet** - Admin access controlled by feature flags
- **Multi-environment support** - Code must work across dev/staging/production
- **Type-safe API calls** - All API interactions use typed service layer
- **Modular design system** - Components should be reusable and composable

## 🚨 Common Issues & Gotchas

### TypeScript Import Errors
**Problem**: Invalid lucide-react icon imports cause deployment failures
```typescript
// ❌ These icons don't exist in lucide-react
import { Gradient, RoundedRect, Minimize } from "lucide-react"

// ✅ Use valid alternatives
import { Layers, RectangleHorizontal, Minus } from "lucide-react"
```

**Prevention**: 
- Check [Lucide React docs](https://lucide.dev/icons/) for valid icon names
- Run `npm run precheck` before committing

### Object Rendering in React
**Problem**: Attempting to render objects as React children
```typescript
// ❌ Don't render objects directly
<p>{organization.background}</p> // if background is an object

// ✅ Check type first
<p>{typeof organization.background === 'string' ? organization.background : organization.description}</p>
```

### CSS Custom Properties in TypeScript
**Problem**: TypeScript doesn't recognize CSS custom properties
```typescript
// ❌ TypeScript error
const styles: React.CSSProperties = {
  '--custom-color': '#ff0000'
}

// ✅ Use type assertion
const styles = {
  '--custom-color': '#ff0000'
} as React.CSSProperties
```

### Environment Variable Access
**Problem**: Using Node.js patterns in browser code
```typescript
// ❌ Browser doesn't have process.env
const apiUrl = process.env.VITE_API_URL

// ✅ Use Vite's import.meta.env
const apiUrl = import.meta.env.VITE_API_URL
```

## 🎯 Code Quality Standards

### Before Every Commit
```bash
npm run precheck      # TypeScript + ESLint checks
npm run build        # Ensure deployment build passes
```

### Import Management
- Remove unused imports immediately after coding
- Use specific imports instead of barrel exports when possible
- Group imports: React → Third-party → Internal → Types

### Component Patterns
```typescript
// ✅ Good pattern
interface ComponentProps {
  data: TypedData
  onAction: (id: string) => void
}

export function Component({ data, onAction }: ComponentProps) {
  // Implementation
}
```

### Error Handling
```typescript
// ✅ Always handle API errors
try {
  await updateOrganization(data)
  setSaveMessage('✅ Success!')
} catch (error) {
  console.error('Update failed:', error)
  setSaveMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
}
```

## 🗂️ Data Layer Patterns

### Organization Data Structure
```typescript
interface Organization {
  // Core fields
  id: string
  name: string
  slug: string
  description: string
  background: string        // Short description (NOT design background)
  
  // Settings contain design data
  settings: {
    design?: OrganizationDesign  // New design customization
    theme: { primaryColor, backgroundColor }  // Legacy theme
    defaultLocation: string
    defaultAddress: string
  }
}
```

### Design System Integration
- Design data stored in `organization.settings.design`
- Background field is for text description, NOT design background
- Use `DEFAULT_DESIGN` constant for fallbacks

## 🎨 Design System Guidelines

### Current Implementation
The design customization system provides:
- **Background Color**: Full page background
- **Text Color**: Main headings only ("Welcome to [Club]", "Upcoming Events", "About [Club]", etc.)
- **Button Color**: Admin and action buttons

### Design Context Usage
```typescript
// ✅ Use design context in components
import { useDesign } from '@/contexts/DesignContext'

function MyComponent() {
  const { designState, updatePreviewDesign } = useDesign()
  // Use designState.preview for current design
}
```

### Styling Patterns
```typescript
// ✅ Apply design colors to specific elements only
<h1 style={{ color: design.theme.textColor }}>Main Heading</h1>
<p className="text-gray-700">Regular text stays default</p>
<Button style={{ backgroundColor: design.theme.primaryColor }}>Action</Button>
```

## 🔧 Development Workflow

### Local Development
1. Run `npm run setup` for initial setup
2. Use `npm run seed:dev` for test data
3. Start with `npm run dev`
4. Access admin at `/{org-slug}/admin`

### Testing Admin Features
- **Brooklyn Hearts Club**: `/brooklyn-hearts-club/admin`
- **Test Organization**: `/test/admin`
- **Voxxy Presents NYC**: `/voxxy-presents-nyc/admin`

### Common Debug Steps
1. Check browser console for React errors
2. Verify environment variables are loaded
3. Test API connectivity in network tab
4. Check Firebase console for data issues

## 📝 File Naming Conventions

### Components
- **PascalCase**: `OrganizationPage.tsx`, `EventCreateForm.tsx`
- **Admin components**: `admin/ComponentName.tsx`
- **UI components**: `ui/component-name.tsx` (shadcn pattern)

### Hooks
- **camelCase**: `useOrganization.ts`, `useAuth.ts`
- **Prefix with 'use'**: All custom hooks

### Services
- **camelCase**: `api.ts`, `designService.ts`
- **Descriptive names**: Indicate purpose clearly

## 🚧 Known Limitations

### Current System Constraints
- **No user authentication** - Admin access by feature flags only
- **Firebase rate limits** - Large uploads may fail
- **Image optimization** - Currently disabled for simplicity
- **Design persistence** - May require page refresh in some cases

### Future Considerations
- Design system will expand to include wallpaper/image backgrounds
- Authentication system will replace feature flag admin access
- Advanced typography controls planned
- Mobile responsiveness needs optimization

## 🎯 Best Practices

### Component Development
1. **Read existing code first** - Understand patterns and conventions
2. **Use TypeScript strictly** - No `any` types unless absolutely necessary
3. **Handle loading states** - Every async operation needs loading/error states
4. **Mobile-first design** - Responsive by default

### State Management
1. **Keep state local** - Use React Context only when necessary
2. **Validate user inputs** - Both client-side and server-side
3. **Handle edge cases** - Empty states, error states, loading states
4. **Optimize re-renders** - Use useCallback/useMemo appropriately

### API Integration
1. **Use service layer** - Don't call APIs directly from components
2. **Handle network errors** - Show meaningful error messages
3. **Cache when possible** - Avoid unnecessary API calls
4. **Type API responses** - Use proper TypeScript interfaces

## 🔍 Debugging Tips

### Common Error Patterns
- **"Objects are not valid as React child"** → Check if rendering an object instead of string
- **"Cannot find module"** → Check import paths and file extensions
- **"Property does not exist"** → Verify TypeScript interfaces match actual data
- **Build failures** → Run `npm run precheck` to catch issues early

### Quick Fixes
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build

# Fix import issues
npm run lint -- --fix

# Check TypeScript without building
npm run typecheck
```

## 📋 Checklist for New Features

### Before Development
- [ ] Read existing code to understand patterns
- [ ] Check if similar functionality exists
- [ ] Verify required types are defined
- [ ] Plan component structure

### During Development  
- [ ] Use existing design system components
- [ ] Follow naming conventions
- [ ] Add proper TypeScript types
- [ ] Handle loading and error states
- [ ] Test in multiple environments

### Before Commit
- [ ] Run `npm run precheck`
- [ ] Test admin functionality
- [ ] Remove unused imports/variables
- [ ] Verify mobile responsiveness
- [ ] Check console for errors

### Before Staging Push
- [ ] Build passes locally
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings minimized
- [ ] Feature tested end-to-end
- [ ] Documentation updated if needed

---

**Remember**: This is a fast-moving codebase. When in doubt, check existing patterns and ask questions rather than implementing from scratch. The goal is consistency and maintainability over clever solutions.