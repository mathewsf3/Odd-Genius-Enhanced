import { extendTheme } from '@chakra-ui/react';

// Configure color mode for Chakra UI
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    gray: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      750: '#1A202E', // custom dark mode card background
      800: '#27272a',
      900: '#18181b',
    }
  },
  fonts: {
    body: "'Inter', sans-serif",
    heading: "'Inter', sans-serif",
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.50' : 'gray.900',
      },
      '@keyframes pulse': {
        '0%': {
          opacity: 0.4,
          transform: 'scale(0.8)',
        },
        '50%': {
          opacity: 1,
          transform: 'scale(1.2)',
        },
        '100%': {
          opacity: 0.4,
          transform: 'scale(0.8)',
        },
      },
      '@keyframes fadeIn': {
        '0%': {
          opacity: 0,
          transform: 'translateY(10px)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
    })
  },
  components: {
    Badge: {
      baseStyle: {
        borderRadius: 'md',
      },
    },
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.600',
          color: 'white',
          _hover: {
            bg: 'brand.700',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          _active: {
            bg: 'brand.800',
          },
          transition: 'all 0.2s',
        },
        outline: {
          border: '1px solid',
          borderColor: 'brand.600',
          color: 'brand.600',
        },
        ghost: {
          color: 'brand.600',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          overflow: 'hidden',
        },
      },
    },
    Progress: {
      baseStyle: {
        filledTrack: {
          transition: 'width 1s ease',
        },
      },
    },
  },
});

export default theme;