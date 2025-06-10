import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ApiStatusProvider } from './context/ApiStatusContext';
import { MatchProvider } from './context/MatchContext';
import StyledChakraWrapper from './theme/StyledChakraWrapper';

// Create a React Query client with optimized settings for performance
const queryOptions = {
  refetchOnWindowFocus: false,  // Don't refetch on window focus for better performance
  staleTime: 30 * 1000,         // Data is considered fresh for 30 seconds
  cacheTime: 10 * 60 * 1000,    // Cache data for 10 minutes
  retry: 1,                     // Only retry failed requests once
  retryDelay: 1000,             // Wait 1 second between retries
  suspense: false,              // Don't use React Suspense
  useErrorBoundary: false,      // Don't use error boundaries
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: queryOptions
  }
});

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StyledChakraWrapper>
        <ApiStatusProvider>
          <MatchProvider>
            <App />
          </MatchProvider>
        </ApiStatusProvider>
      </StyledChakraWrapper>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals();