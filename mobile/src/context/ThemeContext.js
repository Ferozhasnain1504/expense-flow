
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = '@expenseflow_theme';

const lightTheme = {
  mode: 'light',
  colors: {
    background: '#F5F6FA',
    card: '#FFFFFF',
    surface: '#E9EAF2',
    text: '#171923',
    secondaryText: '#6B7280',
    primary: '#8B5CF6',
    border: '#E5E7EB',
    danger: '#DC2626',
  },
};

const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#0B1020',
    card: '#191F35',
    surface: '#252D45',
    text: '#FFFFFF',
    secondaryText: '#9298AA',
    primary: '#A78BFA',
    border: '#303750',
    danger: '#F87171',
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load previously saved theme when the app starts.
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(
          THEME_STORAGE_KEY
        );

        if (savedTheme === 'light') {
          setIsDark(false);
        } else if (savedTheme === 'dark') {
          setIsDark(true);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Save the selected theme whenever it changes.
  useEffect(() => {
    if (!isThemeLoaded) {
      return;
    }

    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          isDark ? 'dark' : 'light'
        );
      } catch (error) {
        console.log('Error saving theme:', error);
      }
    };

    saveTheme();
  }, [isDark, isThemeLoaded]);

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark((previous) => !previous);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        isThemeLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
