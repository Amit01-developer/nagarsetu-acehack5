# NagarSetu Frontend - Installation & Setup Guide

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git (optional)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd nagarsetu-acehack5/frontend
npm install
```

### 2. Environment Setup
Create a `.env` file in the frontend directory (if not exists):
```env
VITE_API_URL=http://localhost:5000/api
VITE_ONESIGNAL_APP_ID=your-onesignal-app-id
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🎨 Theme System Setup

The theme system is already configured! No additional setup needed.

### How It Works
1. **ThemeContext** provides theme state
2. **localStorage** persists user preference
3. **Tailwind dark mode** handles styling
4. **Theme toggle** in header for easy switching

### Files Involved
```
src/contexts/ThemeContext.tsx    # Theme state management
src/main.tsx                     # ThemeProvider wrapper
tailwind.config.js               # Dark mode config
src/index.css                    # Dark theme styles
```

---

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.30.1"
}
```

### UI Libraries
```json
{
  "lucide-react": "^0.344.0",      // Icons
  "react-hot-toast": "^2.6.0",     // Notifications
  "react-hook-form": "^7.61.1"     // Forms
}
```

### Map Integration
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1"
}
```

### Utilities
```json
{
  "axios": "^1.6.5",               // HTTP client
  "zod": "^3.25.76",               // Validation
  "react-onesignal": "^3.5.0"      // Push notifications
}
```

### Dev Dependencies
```json
{
  "vite": "^5.4.2",
  "typescript": "^5.5.3",
  "tailwindcss": "^3.4.19",
  "autoprefixer": "^10.4.18",
  "postcss": "^8.4.35"
}
```

---

## 🔧 Configuration Files

### tailwind.config.js
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',  // Enable dark mode
  theme: {
    extend: {
      colors: {
        primary: { /* green shades */ },
        dark: { /* dark theme colors */ }
      }
    }
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

### tsconfig.json
TypeScript configuration for React + Vite project.

---

## 🌐 Environment Variables

### Required Variables
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# OneSignal App ID (for push notifications)
VITE_ONESIGNAL_APP_ID=your-app-id-here
```

### Optional Variables
```env
# Development mode
VITE_DEV_MODE=true

# API timeout
VITE_API_TIMEOUT=30000
```

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── logo.png
│   ├── tabicon.png
│   └── OneSignal workers
├── src/
│   ├── api/              # API integration
│   ├── components/       # React components
│   │   ├── common/       # Shared components
│   │   ├── citizen/      # Citizen-specific
│   │   ├── contractor/   # Contractor-specific
│   │   └── municipality/ # Municipality-specific
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx  # NEW!
│   ├── pages/            # Page components
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── Documentation files
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🎨 Theme System Usage

### In Components
```tsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-dark-surface">
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}
```

### Styling with Dark Mode
```tsx
// Always pair light and dark classes
<div className="bg-white dark:bg-dark-surface">
  <h1 className="text-gray-900 dark:text-dark-text-primary">
    Title
  </h1>
  <p className="text-gray-600 dark:text-dark-text-secondary">
    Description
  </p>
</div>
```

---

## 🧪 Testing

### Run Linter
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```

### Manual Testing
1. Start dev server: `npm run dev`
2. Test light theme
3. Toggle to dark theme
4. Check all pages
5. Test on mobile
6. Verify accessibility

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Deploy to Custom Server
1. Build: `npm run build`
2. Copy `dist/` folder to server
3. Configure web server (nginx/apache)
4. Point to `index.html`

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts
server: {
  port: 3000  // or any other port
}
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Theme Not Working
```bash
# Clear browser cache and localStorage
localStorage.clear()
location.reload()
```

### Build Errors
```bash
# Clean build cache
rm -rf dist .vite
npm run build
```

---

## 📚 Documentation

### For Users
- `README_UPDATES.md` - What's new
- `UI_UX_IMPROVEMENTS.md` - Detailed changes

### For Developers
- `DARK_THEME_GUIDE.md` - Quick reference
- `THEME_UPDATE.md` - Theme system docs
- `INSTALLATION.md` - This file

---

## 🔄 Update Guide

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update react react-dom
```

### Updating Theme
1. Modify colors in `tailwind.config.js`
2. Update styles in `src/index.css`
3. Test in both themes
4. Rebuild: `npm run build`

---

## 🤝 Contributing

### Setup Development Environment
1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/my-feature`
5. Make changes
6. Test thoroughly
7. Commit: `git commit -m "Add feature"`
8. Push: `git push origin feature/my-feature`
9. Create Pull Request

### Code Style
- Use TypeScript
- Follow existing patterns
- Add dark mode support
- Test accessibility
- Document changes

---

## 📞 Support

### Getting Help
- Check documentation files
- Review code examples
- Email: cleanvillage63@gmail.com

### Reporting Issues
1. Check existing issues
2. Provide clear description
3. Include screenshots
4. Mention browser/OS
5. Share error messages

---

## ✅ Checklist

### Initial Setup
- [ ] Node.js installed
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Dev server running
- [ ] Backend connected

### Theme System
- [ ] Theme toggle visible
- [ ] Light theme works
- [ ] Dark theme works
- [ ] Theme persists
- [ ] All pages themed

### Testing
- [ ] Linter passes
- [ ] TypeScript compiles
- [ ] Manual testing done
- [ ] Mobile tested
- [ ] Accessibility checked

### Deployment
- [ ] Production build works
- [ ] Environment variables set
- [ ] Assets loading correctly
- [ ] API connected
- [ ] Theme working in production

---

## 🎉 You're All Set!

The NagarSetu frontend is now ready with:
- ✅ BHIM UPI-inspired dark theme
- ✅ Theme toggle functionality
- ✅ Performance optimizations
- ✅ Enhanced UI/UX
- ✅ Full documentation

**Happy coding! 🚀**
