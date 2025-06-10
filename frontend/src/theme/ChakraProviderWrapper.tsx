import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import theme from '../theme';
import styledTheme from './styledTheme'; 
import { createEmotionCache } from './emotionCache';

// This creates a stable emotion cache for the ChakraProvider
const emotionCache = createEmotionCache();

interface ChakraProviderWrapperProps {
  children: React.ReactNode;
}

// This wrapper component combines all the providers needed for proper styling
const ChakraProviderWrapper: React.FC<ChakraProviderWrapperProps> = ({ children }) => {
  return (
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={theme} resetCSS>
        <StyledThemeProvider theme={styledTheme}>
          {children}
        </StyledThemeProvider>
      </ChakraProvider>
    </CacheProvider>
  );
};

export default ChakraProviderWrapper;
