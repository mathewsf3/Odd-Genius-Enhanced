import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --color-bg-primary: #1a1a2e;
    --color-bg-secondary: #252535;
    --color-bg-tertiary: #2A2A3C;
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #B4B4C6;
    --color-text-tertiary: #8A8AA3;
    --color-accent-primary: #6366F1;
    --color-accent-secondary: #4F46E5;
    --color-success: #34D399;
    --color-warning: #FBBF24;
    --color-danger: #F87171;
    --color-live: #EF4444;
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    line-height: 1.5;
  }
  
  a {
    color: var(--color-accent-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--color-bg-tertiary);
  }
  
  ::-webkit-scrollbar-thumb {
    background: #484860;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #5a5a75;
  }
`;