# Odd Genius Architecture

This document provides a detailed overview of the Odd Genius platform architecture, data models, and component relationships.

## System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│                 │     │                  │     │                   │
│  React Frontend │◄───►│  Express Backend │◄───►│  AllSportsAPI     │
│                 │     │                  │     │                   │
└─────────────────┘     └──────────────────┘     └───────────────────┘
```

### Frontend Architecture

The frontend is built as a React Single Page Application (SPA) using TypeScript for type safety. The application uses ChakraUI for consistent, accessible components with responsive design.

#### Key Frontend Modules:

- **Pages**: Main application views (Dashboard, Live Matches, etc.)
- **Components**: Reusable UI elements organized by domain
- **API Services**: Communication layer with backend API
- **Hooks**: Custom React hooks for shared state and logic
- **Context**: Global state management

### Backend Architecture

The backend server is built with Node.js and Express, acting as both an API server and a proxy to external services.

#### Key Backend Modules:

- **Controllers**: Request handlers organized by domain
- **Services**: Business logic layer
- **Routes**: API endpoint definitions
- **Middleware**: Request processing functions
- **Utils**: Helper functions and utilities

## Data Flow

1. User interacts with the React frontend
2. Frontend makes API calls to the backend
3. Backend either serves cached data or proxies to AllSportsAPI
4. Data is transformed, enriched with analytics, and returned to frontend
5. Frontend renders the data with appropriate UI components

## Caching Strategy

Multiple caching layers are implemented to optimize performance and reduce API calls:

1. **Browser Cache**: For static assets and reused API responses
2. **Memory Cache**: Short-lived data like live match scores (30 seconds TTL)
3. **Persistent Cache**: Longer-lived data like league standings (up to 24 hours TTL)

## Component Structure

### Match Card Component System

The match card component is implemented with multiple variants to support different use cases:

- **Standard**: Basic match information display
- **Compact**: Space-efficient version for lists
- **Detailed**: Complete match data with additional stats
- **Live**: Real-time updating version for live matches

### Dashboard Layout

The dashboard follows a modular structure with independent sections:
- Live Matches (6 cards)
- Upcoming Matches (6 cards)
- Performance Stats
- Premium Picks

## Authentication Flow

1. User submits credentials via Login form
2. Backend validates credentials and generates JWT token
3. Token is stored in browser localStorage
4. Token is included in Authorization header for authenticated requests
5. Protected routes check for valid token before serving content

## API Integration Details

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details on the AllSportsAPI integration.
