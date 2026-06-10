import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type Theme = 'feminino' | 'masculino';

interface ThemeContextValue {
  theme: Theme;
  setThemeOverride: (t: Theme | null) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'feminino',
  setThemeOverride: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [override, setOverride] = useState<Theme | null>(null);

  const urlTheme: Theme = pathname.startsWith('/masculino') ? 'masculino' : 'feminino';
  const theme: Theme = override ?? urlTheme;

  const setThemeOverride = useCallback((t: Theme | null) => {
    setOverride(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setThemeOverride }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

export function useThemeOverride() {
  return useContext(ThemeContext).setThemeOverride;
}
