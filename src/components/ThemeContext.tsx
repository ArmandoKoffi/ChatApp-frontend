import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type TextSize = 'small' | 'normal' | 'large';

interface ThemeContextType {
  theme: Theme;
  textSize: TextSize;
  setTheme: (theme: Theme) => void;
  setTextSize: (size: TextSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'light';
  });
  const [textSize, setTextSize] = useState<TextSize>(() => {
    const savedSize = localStorage.getItem('textSize') as TextSize | null;
    return savedSize || 'normal';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('textSize', textSize);
    document.documentElement.classList.remove('text-small', 'text-normal', 'text-large');
    document.documentElement.classList.add(`text-${textSize}`);
  }, [textSize]);

  return (
    <ThemeContext.Provider value={{ theme, textSize, setTheme, setTextSize }}>
      {children}
    </ThemeContext.Provider>
  );
};
