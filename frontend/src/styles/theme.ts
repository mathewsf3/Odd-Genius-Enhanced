const theme = {
  colors: {
    background: {
      primary: '#1E1E2A',
      secondary: '#252535',
      tertiary: '#2A2A3C',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B4B4C6',
      tertiary: '#8A8AA3',
    },
    accent: {
      primary: '#6366F1',
      secondary: '#4F46E5',
    },
    status: {
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      live: '#EF4444',
    }
  },
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
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
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    round: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  transition: {
    fast: '0.1s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  }
};
 
export default theme;
export type Theme = typeof theme;
