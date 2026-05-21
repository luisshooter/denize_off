import { createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type Theme = 'feminino' | 'masculino';

const ThemeContext = createContext<Theme>('feminino');

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const theme: Theme = pathname.startsWith('/masculino') ? 'masculino' : 'feminino';
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
