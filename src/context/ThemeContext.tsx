import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Palette, ThemePalette, ThemeType } from '../constants/theme';

const THEME_FILE = `${FileSystem.documentDirectory || ''}theme_pref.txt`;

interface ThemeContextValue {
  theme: ThemeType;
  isDark: boolean;
  colors: ThemePalette;
  toggleTheme: () => void;
  setTheme: (mode: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  isDark: true,
  colors: Palette.dark,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('dark');

  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const info = await FileSystem.getInfoAsync(THEME_FILE);
        if (info.exists) {
          const stored = await FileSystem.readAsStringAsync(THEME_FILE);
          if (stored === 'light' || stored === 'dark') {
            setThemeState(stored);
            return;
          }
        }
        if (systemScheme === 'dark' || systemScheme === 'light') {
          setThemeState(systemScheme);
        } else {
          setThemeState('dark');
        }
      } catch {
        setThemeState('dark');
      }
    };
    loadStoredTheme();
  }, [systemScheme]);

  const setTheme = useCallback(async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await FileSystem.writeAsStringAsync(THEME_FILE, newTheme);
    } catch {
      // Handled silently
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      FileSystem.writeAsStringAsync(THEME_FILE, next).catch(() => {});
      return next;
    });
  }, []);

  const isDark = theme === 'dark';
  const colors = isDark ? Palette.dark : Palette.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
export default ThemeContext;
