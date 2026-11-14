
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
