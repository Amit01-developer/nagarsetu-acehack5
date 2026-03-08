# NagarSetu Frontend Theme Update

## 🎨 Changes Implemented

### 1. Theme System
- **Light Theme**: Clean, green-tinted design (default)
- **Dark Theme**: BHIM UPI-inspired dark mode with blue accents
- **Theme Toggle**: Moon/Sun icon button in header (desktop & mobile)
- **Persistence**: Theme preference saved in localStorage

### 2. Color Scheme

#### Light Theme
- Background: `#f0fdf4` (light green tint)
- Primary: Green shades (`#22c55e` family)
- Cards: White with subtle shadows
- Text: Dark gray to black

#### Dark Theme (BHIM UPI Style)
- Background: `#0A1929` (deep navy blue)
- Surface: `#132F4C` (medium blue)
- Cards: `#1A3A52` (card blue)
- Borders: `#2D4A63` (border blue)
- Text Primary: `#E3F2FD` (light blue-white)
- Text Secondary: `#B0BEC5` (muted blue-gray)
- Accent Blue: `#2196F3`
- Accent Green: `#4CAF50`
- Accent Orange: `#FF9800`
- Accent Red: `#F44336`

### 3. Performance Optimizations

#### CSS Optimizations
- GPU acceleration for smooth transitions
- Reduced animation durations (0.5s → 0.35s)
- Respects `prefers-reduced-motion` for accessibility
- Optimized scrollbar styling
- Smooth color transitions (0.3s cubic-bezier)

#### Animation Improvements
- `fadeInScale`: 0.5s (was 0.6s)
- `fadeUp`: 0.45s (was 0.52s)
- `popIn`: 0.35s (was 0.38s)
- All use optimized cubic-bezier easing

### 4. Components Updated

#### Header Component
- Theme toggle button (desktop & mobile)
- Dark mode support for all elements
- Smooth transitions on theme change
- Notification badge styling
- User menu dark mode

#### Landing Page
- Hero section with gradient backgrounds
- Feature cards with dark mode
- Rewards section styling
- All interactive elements themed

#### Global Styles
- Input/textarea dark mode styling
- Focus states for dark theme
- Scrollbar theming
- Leaflet map dark mode filter

### 5. Technical Implementation

#### New Files
- `src/contexts/ThemeContext.tsx` - Theme state management
- `THEME_UPDATE.md` - This documentation

#### Modified Files
- `tailwind.config.js` - Added dark mode config & colors
- `src/index.css` - Dark theme styles & optimizations
- `src/main.tsx` - ThemeProvider integration
- `src/components/common/Header.tsx` - Theme toggle button
- `src/pages/Landing.tsx` - Dark mode support
- `src/App.tsx` - Error pages dark mode

### 6. Usage

#### For Users
1. Click the Moon/Sun icon in the header to toggle theme
2. Theme preference is automatically saved
3. Works on all pages and components

#### For Developers
```tsx
import { useTheme } from './contexts/ThemeContext';

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-dark-surface">
      <button onClick={toggleTheme}>
        Toggle to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </div>
  );
};
```

### 7. Tailwind Dark Mode Classes

Use these patterns for dark mode styling:
```tsx
// Background
className="bg-white dark:bg-dark-surface"

// Text
className="text-gray-900 dark:text-dark-text-primary"
className="text-gray-600 dark:text-dark-text-secondary"

// Borders
className="border-gray-200 dark:border-dark-border"

// Buttons
className="bg-primary-600 dark:bg-dark-accent-blue"

// Cards
className="bg-white dark:bg-dark-card"

// Transitions
className="smooth-transition" // 0.3s ease for all properties
```

### 8. Browser Support
- Modern browsers with CSS custom properties support
- localStorage for theme persistence
- Fallback to light theme if localStorage unavailable

### 9. Accessibility
- Respects `prefers-reduced-motion`
- Proper ARIA labels on theme toggle
- High contrast ratios in both themes
- Keyboard navigation support

## 🚀 Next Steps (Optional)

1. Add theme to remaining pages (Login, Register, Dashboards)
2. Add system theme detection (`prefers-color-scheme`)
3. Add more theme variants (e.g., high contrast)
4. Add theme transition animations
5. Add theme preview in settings

## 📝 Notes

- Backend integration remains unchanged
- All API calls work the same way
- No breaking changes to existing functionality
- Theme is purely frontend/CSS based
