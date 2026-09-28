import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Palette, ThemePalette, ThemeType } from '../constants/theme';

const THEME_STORAGE_KEY = '@lightweight_scanner_theme_mode';

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
  const [theme, setThemeState] = useState<ThemeType>('light');

  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeState(storedTheme);
        } else if (systemScheme === 'dark' || systemScheme === 'light') {
          setThemeState(systemScheme);
        } else {
          setThemeState('light');
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      }
    };
    loadStoredTheme();
  }, [systemScheme]);

  const setTheme = useCallback(async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch((e) =>
        console.warn('Failed to save theme toggle:', e)
      );
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
