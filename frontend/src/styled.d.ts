// This file defines the types for styled-components theme
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryLight: string;
      secondary: string;
      success: string;
      danger: string;
      warning: string;
      background: string;
      cardBg: string;
      textPrimary: string;
      textSecondary: string;
      textMuted: string;
    };
    borderRadius: {
      small: string;
      medium: string;
      large: string;
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
    };
  }
}