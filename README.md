# Odd Genius - Soccer Betting Analytics Platform

## Overview

Odd Genius is a sophisticated soccer betting intelligence platform that combines real-time match data with proprietary analytics algorithms to provide data-driven wagering insights. The platform targets serious sports bettors seeking an edge through quantitative analysis rather than emotional or intuition-based betting.

## Features

- **Live Match Tracking**: Real-time updates on ongoing soccer matches
- **Upcoming Match Predictions**: Analysis and predictions for upcoming fixtures
- **Premium Betting Picks**: Curated high-confidence betting opportunities
- **Match Analytics**: Detailed statistics and performance metrics
- **Betting Performance Tracking**: ROI and win-rate analytics
- **Responsive UI**: Modern interface with multiple match card design options
- **Real-time Updates**: WebSocket integration for live score updates

## Technical Architecture

### Frontend Architecture

- **Framework**: React 17 with TypeScript for type safety and developer productivity
- **UI Library**: ChakraUI providing a comprehensive component system with theming capabilities
- **State Management**: Local React state with context providers for global state
- **Routing**: React Router v6 for navigation between various platform sections
- **Data Fetching**: Axios with custom caching layer and error handling
- **Real-time Updates**: Socket.io for live match data updates

## Documentation

For detailed project structure and development guidelines, please refer to:

- [Project Documentation](./PROJECT_DOCUMENTATION.md) - Overview of pages, API endpoints, and data flow
- [Page Structure](./PAGE_STRUCTURE.md) - The official page components and their routes
- [Cleanup Report](./CLEANUP_REPORT.md) - Summary of the duplicate page cleanup process

### Backend Architecture

- **Runtime**: Node.js server with Express framework
- **API Proxy**: Acts as middleware between frontend and third-party data sources
- **Caching System**: Multi-tiered caching with different TTLs based on data volatility
  - In-memory cache for fastest access
  - Persistent cache for larger datasets
- **Error Handling**: Comprehensive fallback mechanisms for API failures
- **WebSockets**: Socket.io implementation for real-time data updates

## Project Structure

- `frontend/` - React TypeScript frontend application
- `backend/` - Node.js Express API server
- Various utility scripts (PowerShell) for development and maintenance

## Data Models

### Match Data Model

```typescript
interface Match {
  id: string;
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  status: string;
  elapsed?: string;
  minute?: string;
  venue?: string;
  stadium?: string;
  referee?: string;
  score?: Score;
  odds: Odds;
  probability: Probability;
  recommended?: "home" | "draw" | "away";
  algorithm?: Algorithm;
  isPromo?: boolean;
  isPremiumPick?: boolean;
}
```

### Team Model

```typescript
interface Team {
  id: string;
  name: string;
  logo: string;
  rating?: number;
}
```

### Betting Data Models

```typescript
interface Odds {
  home: number;
  draw: number;
  away: number;
  [key: string]: number;
}

interface Probability {
  home: string;
  draw: string;
  away: string;
}

interface Algorithm {
  recommendation: string;
  confidence: number;
  type?: string;
}
```

## API Integration

### AllSportsAPI Integration

- API Key: `9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4`
- Documentation: https://allsportsapi.com/soccer-football-api-documentation
- Base URL: `https://apiv2.allsportsapi.com/football`

### Endpoints Used

#### Live Matches

```
GET /fixtures/live
```

#### Upcoming Matches

```
GET /fixtures/date/{date}
```

#### Match Details

```
GET /fixtures/id/{id}
```

### Caching Strategy

The platform implements tiered caching to balance freshness with performance:

```typescript
const CACHE_TTL = {
  LIVE_MATCHES: 30 * 1000, // 30 seconds for live matches
  UPCOMING_MATCHES: 5 * 60 * 1000, // 5 minutes for upcoming matches
  MATCH_DETAILS: 60 * 1000, // 60 seconds for match details
  STATS: 30 * 60 * 1000, // 30 minutes for stats
  PREMIUM_PICKS: 10 * 60 * 1000, // 10 minutes for premium picks
};
```

## Key Components

### Dashboard

- Shows 6 live matches and 6 upcoming matches
- Displays match cards with team information, scores, and betting recommendations

### Live Matches Page

- Displays all currently live matches
- Real-time score updates and match progress

### Upcoming Matches Page

- Shows scheduled matches with predictions
- Filtering by time range, league, and team

### Match Detail Page

- In-depth analysis of individual matches
- Head-to-head statistics, team form, and betting recommendations

## Quick Start

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Current Development Focus

1. Dashboard enhancement with live and upcoming matches display
2. Real data integration throughout the application
3. Consistent match card UI across all platform pages
4. Optimization of API calls and caching strategy
5. WebSocket implementation for real-time updates

## Recent Updates

### May 16, 2025: UI Enhancement and Match Card Design Updates

- Updated match card designs with new "View Analysis" CTA button
- Removed odds display from match cards according to new design requirements
- Added scripts to toggle between different match card designs
- Fixed UI issues in SideBannerVariants.tsx, improving venue display
- Fixed dashboard box size inconsistencies for better visual alignment
- Enhanced WebSocket implementation for more reliable real-time updates

### May 15, 2025: Fixed Upcoming Matches Display

- Fixed issues with upcoming matches not appearing in the dashboard
- Resolved syntax errors in the `soccerApiService.ts` file:
  - Fixed duplicate catch blocks in the `getLiveMatches` method
  - Added missing commas between method definitions
  - Fixed improperly nested try-catch blocks
  - Removed unused imports
- Cleaned up duplicate and unused files to simplify codebase
- Added comprehensive documentation in `APPLICATION_STRUCTURE.md`
- Created `verify-routes.ps1` script to verify route configuration

### May 13, 2025: Frontend Bug Fixes and Optimizations

- Fixed React hook errors related to useColorModeValue usage
- Improved component structure by removing unnecessary wrapper components
- Enhanced TypeScript typings with ExtendedMatch interface
- Fixed import/export issues in routing configuration
- Created backup system for safer development
- Implemented ESLint warning cleanup script

### May 10, 2025: Codebase Cleanup

- Removed multiple duplicate page components and backup files
- Organized API service structure
- Improved documentation with detailed route and page mapping
- Updated cleanup report in `CLEANUP_REPORT.md`
- Standardized page component naming conventions

## Documentation

For detailed project information, please refer to:

- [Project Documentation](./PROJECT_DOCUMENTATION.md) - Overview of pages, API endpoints, and data flow
- [Page Structure](./PAGE_STRUCTURE.md) - The official page components and their routes
- [Cleanup Report](./CLEANUP_REPORT.md) - Summary of the duplicate page cleanup process
- [Frontend Fixes](./FRONTEND_FIXES.md) - Details on TypeScript and ESLint error fixes
- [Match Cards README](./MATCH_CARDS_README.md) - Information about match card design updates

## Development Tools

### Utility Scripts

Several PowerShell scripts have been created to aid development:

- `toggle-match-card-design.ps1` - Toggle between original and new match card designs
- `fix-ui-issues-new.ps1` - Fix common UI issues in components
- `backup-frontend.ps1` - Create backups before making significant changes
- `cleanup-eslint-warnings.ps1` - Automatically fix common ESLint warnings
- `verify-routes.ps1` - Verify routing configuration

### Testing

- A match card test page is available at `/match-card-test` to view all card designs
- Backend test scripts are available in the `backend` directory

## License

Proprietary software. All rights reserved.
