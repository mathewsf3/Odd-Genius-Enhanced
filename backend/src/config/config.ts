export const config = {
  PORT: process.env.PORT || 3000,
  FOOTYSTATS_API_KEY: '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CACHE_EXPIRY: {
    MATCH_DATA: 60 * 60, // 1 hour
    TEAM_DATA: 3 * 60 * 60, // 3 hours
    REFEREE_DATA: 24 * 60 * 60, // 24 hours
    LEAGUE_DATA: 12 * 60 * 60, // 12 hours
  }
};