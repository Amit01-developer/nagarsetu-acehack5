import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const FONT_SIZE_MIN = 14;
const FONT_SIZE_MAX = 20;
const FONT_SIZE_DEFAULT = 16;
const FONT_SIZE_STEP = 2;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    return savedFontSize ? parseInt(savedFontSize, 10) : FONT_SIZE_DEFAULT;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + FONT_SIZE_STEP, FONT_SIZE_MAX));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - FONT_SIZE_STEP, FONT_SIZE_MIN));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        fontSize,
        increaseFontSize,
        decreaseFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
