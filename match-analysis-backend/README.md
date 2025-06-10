# Match Analysis Backend

A comprehensive backend system for football match analysis, providing detailed statistics and predictions using the FootyStats API.

## Features

### 🎯 Core Analysis Capabilities
- **Comprehensive Match Analysis**: Complete analysis for any match between two teams
- **Team Form Analysis**: Last 5 and 10 matches for both home and away form
- **Goals Analysis**: Over/Under statistics for 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 thresholds
- **Cards Analysis**: Yellow/Red card statistics with over/under thresholds
- **Corners Analysis**: Corner statistics with 6.5-13.5 thresholds
- **Head-to-Head Analysis**: Historical matchups between teams
- **Expected Statistics**: xG, xCorners, xCards calculations
- **League Context**: Standings, averages, and home advantage statistics
- **Referee Analysis**: Historical referee statistics and patterns

### 🚀 Technical Features
- **TypeScript**: Full type safety and enhanced development experience
- **Caching**: Redis-first with memory fallback for optimal performance
- **Rate Limiting**: Built-in protection against API abuse
- **Error Handling**: Comprehensive error handling and logging
- **Data Validation**: Request validation using Joi
- **API Documentation**: Self-documenting endpoints
- **Health Monitoring**: Health check endpoints and monitoring

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Redis (optional - will fallback to memory cache)

### Installation

1. **Clone and navigate to the project**:
```bash
cd match-analysis-backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Build the project**:
```bash
npm run build
```

5. **Start the server**:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3001`

## API Endpoints

### Core Analysis Endpoints

#### POST `/api/matches/analyze`
**Get comprehensive match analysis**

Request body:
```json
{
  "homeTeamId": 123,
  "awayTeamId": 456,
  "leagueId": 789,
  "matchDate": "2025-06-15T15:00:00Z",
  "includePlayerStats": false,
  "includeExpectedStats": true,
  "cacheResults": true
}
```

Response includes:
- Complete team form analysis (last 5 and 10 matches)
- Goals, cards, and corners over/under statistics
- Head-to-head historical data
- League context and standings
- Expected statistics (xG, xCorners, xCards)
- Data quality assessment

#### GET `/api/matches/team/:teamId/form`
**Get team form analysis**

Query parameters:
- `matchType`: 'home' | 'away' | 'all' (default: 'all')
- `limit`: number of matches (1-20, default: 10)
- `leagueId`: specific league filter (optional)

#### GET `/api/matches/head-to-head`
**Get head-to-head analysis**

Query parameters:
- `homeTeamId`: number (required)
- `awayTeamId`: number (required)
- `limit`: number of matches (1-20, default: 10)

#### POST `/api/matches/predictions`
**Get match predictions and probabilities**

Same request format as `/analyze`, returns prediction-focused data including:
- Expected statistics
- Probability calculations
- Betting recommendations
- Confidence levels

#### GET `/api/matches/overview`
**Get quick match overview**

Query parameters:
- `homeTeamId`: number (required)
- `awayTeamId`: number (required)

Returns simplified match data for quick previews.

### Utility Endpoints

#### GET `/health`
**System health check**

#### GET `/api`
**API documentation and status**

#### GET `/api/matches/health`
**Match analysis service health**

## Data Structure

### Goals Analysis
- **Thresholds**: 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 goals
- **Statistics**: Over/under percentages for last 5 and 10 matches
- **Team-specific**: Goals for/against averages
- **Special metrics**: BTTS (Both Teams To Score), clean sheets, goal timing

### Cards Analysis
- **Thresholds**: 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 total cards
- **Breakdown**: Yellow cards, red cards, total cards
- **Team patterns**: Disciplinary records, referee influence
- **Advanced**: Cards per referee, home/away bias

### Corners Analysis
- **Thresholds**: 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5 total corners
- **Distribution**: First half vs second half statistics
- **Team performance**: Corners won/conceded ratios
- **Efficiency**: Corners-to-goals conversion rates

## Configuration

### Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3001
HOST=localhost

# FootyStats API
FOOTYSTATS_API_KEY=your_api_key_here
FOOTYSTATS_BASE_URL=https://api.footystats.org/api/v1
FOOTYSTATS_RPM=60  # Requests per minute
FOOTYSTATS_RPD=1000  # Requests per day

# Cache (Redis optional)
REDIS_URL=redis://localhost:6379
MEMORY_CACHE_TTL=3600

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_TO_CONSOLE=true

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Rate Limiting
- **General endpoints**: 200 requests per 15 minutes
- **Analysis endpoints**: 100 requests per 15 minutes
- **FootyStats API**: Built-in rate limiting protection

## Caching Strategy

1. **Redis Primary**: Full-featured caching with TTL
2. **Memory Fallback**: Automatic fallback if Redis unavailable
3. **Cache Keys**: Intelligent key generation based on request parameters
4. **TTL Strategy**:
   - Match analysis: 30 minutes
   - Team matches: 15 minutes
   - H2H data: 30 minutes
   - League data: 1 hour
   - Referee stats: 24 hours

## Error Handling

- **Validation Errors**: 400 with detailed validation messages
- **Not Found**: 404 for missing teams/matches
- **Rate Limiting**: 429 with retry information
- **API Errors**: Proper HTTP status codes and error details
- **Logging**: Comprehensive error logging with context

## Development

### Scripts
```bash
npm run dev          # Development mode with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
```

### Project Structure
```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Express middleware
├── models/         # TypeScript interfaces
├── routes/         # API routes
├── services/       # Business logic
│   ├── api/        # External API integrations
│   ├── analysis/   # Analysis services
│   └── cache/      # Caching services
└── utils/          # Utility functions
```

## FootyStats API Integration

The backend integrates with FootyStats API to provide:
- **Team Matches**: Historical match data
- **Head-to-Head**: Direct matchup history
- **League Data**: Standings and averages
- **Referee Stats**: Official statistics
- **Player Data**: Individual player statistics

### API Key Management
- Environment variable configuration
- Automatic rate limiting
- Error handling and fallbacks
- Request/response logging

## Monitoring and Logging

### Logging Levels
- **ERROR**: Application errors and exceptions
- **WARN**: Warning conditions
- **INFO**: General information
- **HTTP**: HTTP request/response logs
- **DEBUG**: Detailed debug information

### Log Outputs
- **Console**: Development and debugging
- **Files**: Production logging with rotation
- **Structured**: JSON format for log aggregation

### Health Monitoring
- `/health` endpoint for load balancer checks
- Service-specific health checks
- Cache connectivity monitoring
- API availability checking

## Production Deployment

### Requirements
- Node.js 18+
- Redis (recommended)
- Reverse proxy (nginx/Apache)
- Process manager (PM2/systemd)

### Recommended Setup
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name match-analysis-backend

# Configure PM2 startup
pm2 startup
pm2 save
```

### Performance Optimization
- Enable gzip compression
- Configure Redis for production
- Set appropriate cache TTLs
- Monitor memory usage
- Configure rate limiting

## Support and Contribution

### Getting Help
- Check the API documentation at `/api`
- Review the health status at `/health`
- Check logs for error details
- Validate request formats

### Contributing
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality  
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Match Analysis Backend** - Comprehensive football match analysis and predictions
