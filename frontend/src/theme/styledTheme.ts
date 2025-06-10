// This file defines the theme for styled-components
import { DefaultTheme } from 'styled-components';

const styledTheme: DefaultTheme = {
  colors: {
    primary: '#8b5cf6',        // violet
    primaryLight: '#a78bfa',   // light violet
    secondary: '#6366F1',      // indigo
    success: '#10b981',        // emerald
    danger: '#ef4444',         // red
    warning: '#f59e0b',        // amber
    background: '#131320',     // dark background
    cardBg: '#1E1E2D',         // dark card background
    textPrimary: '#FFFFFF',    // white
    textSecondary: '#B4B4C6',  // light gray
    textMuted: '#8A8AA3',      // muted gray
  },
  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem',
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    large: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)',
  },
};

export default styledTheme;
