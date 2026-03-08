# Dark Theme Quick Reference Guide

## 🎨 Color Classes Reference

### Backgrounds
```tsx
// Page backgrounds
bg-primary-50 dark:bg-dark-bg

// Card/Surface backgrounds
bg-white dark:bg-dark-surface
bg-white dark:bg-dark-card

// Hover states
hover:bg-primary-50 dark:hover:bg-dark-card
hover:bg-gray-100 dark:hover:bg-dark-surface
```

### Text Colors
```tsx
// Primary text (headings, important text)
text-gray-900 dark:text-dark-text-primary

// Secondary text (descriptions, labels)
text-gray-600 dark:text-dark-text-secondary

// Muted text (hints, placeholders)
text-gray-500 dark:text-dark-text-muted
```

### Borders
```tsx
// Standard borders
border-gray-200 dark:border-dark-border

// Dividers
border-gray-300 dark:border-dark-border
```

### Accent Colors
```tsx
// Primary actions (buttons, links)
bg-primary-600 dark:bg-dark-accent-blue
text-primary-600 dark:text-dark-accent-blue

// Success states
text-green-600 dark:text-dark-accent-green

// Warning states
text-orange-600 dark:text-dark-accent-orange

// Error states
text-red-600 dark:text-dark-accent-red
```

### Focus States
```tsx
// Input focus rings
focus:ring-primary-500 dark:focus:ring-dark-accent-blue
focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-accent-blue
```

---

## 🔧 Common Patterns

### Card Component
```tsx
<div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-6 smooth-transition">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
    Card Title
  </h3>
  <p className="text-gray-600 dark:text-dark-text-secondary">
    Card description text
  </p>
</div>
```

### Button Component
```tsx
// Primary button
<button className="bg-primary-600 dark:bg-dark-accent-blue text-white px-4 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-dark-accent-blue/80 smooth-transition">
  Click Me
</button>

// Secondary button
<button className="bg-gray-100 dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card smooth-transition">
  Cancel
</button>

// Danger button
<button className="bg-red-600 dark:bg-dark-accent-red text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-dark-accent-red/80 smooth-transition">
  Delete
</button>
```

### Input Component
```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-accent-blue smooth-transition"
  placeholder="Enter text..."
/>
```

### Link Component
```tsx
<a href="#" className="text-primary-600 dark:text-dark-accent-blue hover:text-primary-700 dark:hover:text-dark-accent-blue/80 smooth-transition">
  Click here
</a>
```

### Badge Component
```tsx
// Success badge
<span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
  Active
</span>

// Warning badge
<span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
  Pending
</span>

// Error badge
<span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm">
  Failed
</span>
```

### Modal/Dropdown
```tsx
<div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-4">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
    Modal Title
  </h3>
  <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
    Modal content
  </p>
  <div className="flex justify-end space-x-2">
    <button className="px-4 py-2 text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface rounded smooth-transition">
      Cancel
    </button>
    <button className="px-4 py-2 bg-primary-600 dark:bg-dark-accent-blue text-white rounded hover:bg-primary-700 dark:hover:bg-dark-accent-blue/80 smooth-transition">
      Confirm
    </button>
  </div>
</div>
```

---

## 🎯 Best Practices

### 1. Always Use smooth-transition
```tsx
// ✅ Good
<div className="bg-white dark:bg-dark-surface smooth-transition">

// ❌ Bad
<div className="bg-white dark:bg-dark-surface transition-all">
```

### 2. Pair Light and Dark Classes
```tsx
// ✅ Good - Both themes defined
<p className="text-gray-900 dark:text-dark-text-primary">

// ❌ Bad - Only light theme
<p className="text-gray-900">
```

### 3. Use Semantic Color Names
```tsx
// ✅ Good - Semantic
<button className="bg-primary-600 dark:bg-dark-accent-blue">

// ❌ Bad - Hardcoded
<button className="bg-blue-600 dark:bg-blue-400">
```

### 4. Test Both Themes
Always test your component in both light and dark modes before committing.

### 5. Maintain Contrast Ratios
Ensure text is readable in both themes (WCAG AA: 4.5:1 for normal text).

---

## 🔍 Debugging Tips

### Check Current Theme
```tsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();
  console.log('Current theme:', theme); // 'light' or 'dark'
};
```

### Force Theme for Testing
```tsx
// In browser console
localStorage.setItem('nagarsetu-theme', 'dark');
location.reload();
```

### Inspect Dark Mode Classes
```tsx
// Check if dark mode is active
document.documentElement.classList.contains('dark'); // true/false
```

---

## 📋 Checklist for New Components

- [ ] Add dark mode classes to all elements
- [ ] Use `smooth-transition` for animated properties
- [ ] Test in both light and dark themes
- [ ] Check text contrast ratios
- [ ] Verify hover/focus states work
- [ ] Test on mobile devices
- [ ] Ensure accessibility (keyboard nav, screen readers)

---

## 🎨 Full Color Palette

### Light Theme
| Element | Class | Color |
|---------|-------|-------|
| Page BG | `bg-primary-50` | #f0fdf4 |
| Card BG | `bg-white` | #ffffff |
| Primary | `bg-primary-600` | #22c55e |
| Text | `text-gray-900` | #111827 |
| Secondary Text | `text-gray-600` | #6b7280 |
| Border | `border-gray-200` | #e5e7eb |

### Dark Theme
| Element | Class | Color |
|---------|-------|-------|
| Page BG | `dark:bg-dark-bg` | #0A1929 |
| Surface | `dark:bg-dark-surface` | #132F4C |
| Card | `dark:bg-dark-card` | #1A3A52 |
| Border | `dark:border-dark-border` | #2D4A63 |
| Text Primary | `dark:text-dark-text-primary` | #E3F2FD |
| Text Secondary | `dark:text-dark-text-secondary` | #B0BEC5 |
| Text Muted | `dark:text-dark-text-muted` | #78909C |
| Accent Blue | `dark:bg-dark-accent-blue` | #2196F3 |
| Accent Green | `dark:text-dark-accent-green` | #4CAF50 |
| Accent Orange | `dark:text-dark-accent-orange` | #FF9800 |
| Accent Red | `dark:text-dark-accent-red` | #F44336 |

---

## 🚀 Quick Start

1. Import theme hook:
```tsx
import { useTheme } from '../contexts/ThemeContext';
```

2. Use in component:
```tsx
const { theme, toggleTheme } = useTheme();
```

3. Add dark classes:
```tsx
<div className="bg-white dark:bg-dark-surface smooth-transition">
  <h1 className="text-gray-900 dark:text-dark-text-primary">
    Hello World
  </h1>
</div>
```

4. Test both themes!

---

**Happy Theming! 🎨**
