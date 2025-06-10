import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
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
      800: '#27272a',
      900: '#18181b',
    },
    // Sports betting theme colors
    live: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    upcoming: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    }
  },
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#0f0f23' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.50' : 'gray.900',
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
      },
      '*': {
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
      }
    })
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        _focus: {
          boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
        },
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorScheme === 'live' ? 'live.500' :
              props.colorScheme === 'upcoming' ? 'upcoming.500' : 'brand.600',
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'live' ? 'live.600' :
                props.colorScheme === 'upcoming' ? 'upcoming.600' : 'brand.700',
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: props.colorScheme === 'live' ? 'live.700' :
                props.colorScheme === 'upcoming' ? 'upcoming.700' : 'brand.800',
            transform: 'translateY(0)',
          },
        }),
        outline: (props: any) => ({
          border: '2px solid',
          borderColor: props.colorScheme === 'live' ? 'live.500' :
                      props.colorScheme === 'upcoming' ? 'upcoming.500' : 'brand.600',
          color: props.colorScheme === 'live' ? 'live.500' :
                 props.colorScheme === 'upcoming' ? 'upcoming.500' : 'brand.600',
          _hover: {
            bg: props.colorScheme === 'live' ? 'live.50' :
                props.colorScheme === 'upcoming' ? 'upcoming.50' : 'brand.50',
            transform: 'translateY(-1px)',
          },
        }),
        ghost: (props: any) => ({
          color: props.colorScheme === 'live' ? 'live.500' :
                 props.colorScheme === 'upcoming' ? 'upcoming.500' : 'brand.600',
          _hover: {
            bg: props.colorScheme === 'live' ? 'live.50' :
                props.colorScheme === 'upcoming' ? 'upcoming.50' : 'brand.50',
          },
        }),
      },
      sizes: {
        sm: {
          h: '8',
          minW: '8',
          fontSize: 'sm',
          px: '3',
        },
        md: {
          h: '10',
          minW: '10',
          fontSize: 'md',
          px: '4',
        },
        lg: {
          h: '12',
          minW: '12',
          fontSize: 'lg',
          px: '6',
        },
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          boxShadow: props.colorMode === 'dark' ?
            '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' :
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: props.colorMode === 'dark' ?
              '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)' :
              '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      }),
    },
    Badge: {
      baseStyle: {
        fontWeight: '600',
        fontSize: 'xs',
        borderRadius: 'md',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
      variants: {
        live: {
          bg: 'live.500',
          color: 'white',
          boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.2)',
        },
        upcoming: {
          bg: 'upcoming.500',
          color: 'white',
          boxShadow: '0 0 0 1px rgba(20, 184, 166, 0.2)',
        },
        finished: {
          bg: 'success.500',
          color: 'white',
          boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
        },
      },
    },
    Tab: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'lg',
        transition: 'all 0.2s',
        _focus: {
          boxShadow: 'none',
        },
      },
      variants: {
        'soft-rounded': {
          tab: {
            borderRadius: 'lg',
            fontWeight: '500',
            _selected: {
              bg: 'brand.500',
              color: 'white',
              boxShadow: 'md',
            },
            _hover: {
              bg: 'gray.100',
            },
          },
        },
      },
    },
  },
});

export default theme;