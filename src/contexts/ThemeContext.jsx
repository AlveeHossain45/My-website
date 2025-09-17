import { createContext, useContext, useEffect, useState } from 'react';
import { getItem, setItem } from '../utils/storage.js';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getItem('theme') || 'light');
  useEffect(() => setItem('theme', theme), [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  );
}