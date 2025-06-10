import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider, DefaultTheme } from 'styled-components';
import theme from '../theme';
// Import our theme declaration
import './styled.d.ts';

// Create a simple styled-components theme
const styledComponentsTheme: DefaultTheme = {
  colors: {
    primary: '#8b5cf6',
    primaryLight: '#a78bfa',
    secondary: '#6366F1',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    background: '#131320',
    cardBg: '#1E1E30',
    textPrimary: '#FFFFFF',
    textSecondary: '#B4B4C6',
    textMuted: '#6B7280',
  },
  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem',
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.1)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    large: '0 10px 15px rgba(0,0,0,0.1)',
  },
};

// Create an emotion cache
const emotionCache = createCache({
  key: 'odd-genius',
  // Speed up rendering
  speedy: true,
});

interface StyledChakraWrapperProps {
  children: React.ReactNode;
}

// A simplified wrapper component to combine providers
const StyledChakraWrapper: React.FC<StyledChakraWrapperProps> = ({ children }) => {
  return (
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={theme} resetCSS>
        <ThemeProvider theme={styledComponentsTheme}>
          {children}
        </ThemeProvider>
      </ChakraProvider>
    </CacheProvider>
  );
};

export default StyledChakraWrapper;
