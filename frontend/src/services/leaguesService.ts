import axios from 'axios';
import API_CONFIG from '../config/api-config';

// Base URLs for APIs - FootyStats Only
const BACKEND_BASE_URL = API_CONFIG.BACKEND_BASE_URL || 'http://localhost:5000/api';

// Cache configuration
const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes for leagues
const LOGO_CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours for logos
const leaguesCache: { [key: string]: { data: any; timestamp: number } } = {};
const logoCache: { [key: string]: LogoAsset } = {};

// Logo management utilities
const createLogoAsset = (url: string, quality: 'high' | 'medium' | 'low' = 'medium'): LogoAsset => {
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(url.split('/').pop()?.substring(0, 2) || 'L')}&background=252535&color=6366F1&bold=true&size=128`;

  return {
    url: url || fallbackUrl,
    fallbackUrl,
    cached: false,
    quality,
    format: url?.includes('.svg') ? 'svg' : url?.includes('.webp') ? 'webp' : 'png',
    size: 'md'
  };
};

const optimizeLogo = (logoAsset: LogoAsset, targetSize: 'sm' | 'md' | 'lg' = 'md'): LogoAsset => {
  const sizeMap = { sm: '64', md: '128', lg: '256' };
  const size = sizeMap[targetSize];

  // If it's a UI avatar, update the size parameter
  if (logoAsset.url.includes('ui-avatars.com')) {
    const updatedUrl = logoAsset.url.replace(/size=\d+/, `size=${size}`);
    return { ...logoAsset, url: updatedUrl, size: targetSize };
  }

  return { ...logoAsset, size: targetSize };
};

// Enhanced League interface based on AI team analysis
export interface League {
  id: string;
  name: string;
  country: string;
  logo: LogoAsset;
  season: number;
  status: 'live' | 'upcoming' | 'finished';
  currentRound?: number;
  totalRounds?: number;
  liveMatches?: number;
  upcomingMatches?: number;
  finishedMatches?: number;
  lastUpdated: Date;
  api: 'allsports' | 'apifootball';
  type?: string;
  isActive?: boolean;
  priority?: number; // For sorting popular leagues
}

// Logo asset management interface
export interface LogoAsset {
  url: string;
  fallbackUrl?: string;
  cached: boolean;
  quality: 'high' | 'medium' | 'low';
  format: 'svg' | 'png' | 'webp';
  size?: 'sm' | 'md' | 'lg';
}

// League filters interface
export interface LeagueFilters {
  country?: string;
  status?: 'live' | 'upcoming' | 'finished' | 'all';
  search?: string;
  hasMatches?: boolean;
  minMatches?: number;
}

// Enhanced league state interface
export interface LeaguesState {
  leagues: League[];
  filteredLeagues: League[];
  loading: boolean;
  error: string | null;
  filters: LeagueFilters;
  view: 'grid' | 'list';
  realTimeEnabled: boolean;
}

export interface LeagueGroup {
  country: string;
  leagues: League[];
  totalMatches: number;
  liveMatches: number;
  upcomingMatches: number;
}

export interface LiveLeaguesResponse {
  success: boolean;
  result: {
    leagues: League[];
    groupedByCountry: LeagueGroup[];
    totalLeagues: number;
    totalMatches: number;
    liveMatches: number;
    upcomingMatches: number;
    lastUpdated: string;
  };
}

/**
 * Enhanced function to fetch all leagues with live/upcoming status
 */
const fetchEnhancedLeagues = async (filters?: LeagueFilters, signal?: AbortSignal): Promise<League[]> => {
  try {
    console.log('[LeaguesService] Fetching enhanced leagues with filters:', filters);

    // Check cache first
    const cacheKey = `enhanced_leagues_${JSON.stringify(filters || {})}`;
    const cachedData = leaguesCache[cacheKey];

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
      console.log('[LeaguesService] Using cached enhanced leagues data');
      return cachedData.data;
    }

    // Use backend API instead of direct AllSportsAPI call
    const backendUrl = filters?.status === 'live' || filters?.hasMatches
      ? `${BACKEND_BASE_URL}/leagues/live`
      : `${BACKEND_BASE_URL}/leagues`;

    console.log(`[LeaguesService] Fetching from backend: ${backendUrl}`);

    const response = await axios.get(backendUrl, {
      params: {
        ...(filters?.country && { countryId: filters.country })
      },
      signal,
      timeout: 15000
    });

    if (!response.data?.success || !response.data?.result) {
      console.warn('[LeaguesService] No leagues data from backend');
      console.log('[LeaguesService] Response data:', response.data);
      return [];
    }

    console.log('[LeaguesService] Backend response structure:', {
      success: response.data.success,
      resultType: Array.isArray(response.data.result) ? 'array' : typeof response.data.result,
      resultLength: Array.isArray(response.data.result) ? response.data.result.length : 'not array',
      firstItem: Array.isArray(response.data.result) ? response.data.result[0] : response.data.result
    });

    // Try to fetch live/upcoming matches, but don't fail if backend is down
    let liveMatches: any[] = [];
    let upcomingMatches: any[] = [];

    try {
      console.log('[LeaguesService] Attempting to fetch live matches...');
      const liveMatchesResponse = await axios.get(`${BACKEND_BASE_URL}/matches/live`, {
        signal,
        timeout: 5000
      });
      liveMatches = liveMatchesResponse.data?.result || [];
      console.log(`[LeaguesService] Successfully fetched ${liveMatches.length} live matches`);
    } catch (error) {
      console.warn('[LeaguesService] Backend not available for live matches, showing all leagues');
    }

    try {
      console.log('[LeaguesService] Attempting to fetch upcoming matches...');
      const upcomingMatchesResponse = await axios.get(`${BACKEND_BASE_URL}/matches/upcoming`, {
        signal,
        timeout: 5000
      });
      upcomingMatches = upcomingMatchesResponse.data?.result || [];
      console.log(`[LeaguesService] Successfully fetched ${upcomingMatches.length} upcoming matches`);
    } catch (error) {
      console.warn('[LeaguesService] Backend not available for upcoming matches, showing all leagues');
    }

    console.log(`[LeaguesService] Using ${liveMatches.length} live matches and ${upcomingMatches.length} upcoming matches for league status`);

    // Process leagues with enhanced data
    let rawLeagues: any[] = [];

    if (backendUrl.includes('/leagues/live')) {
      // Live leagues endpoint returns a different format
      const liveData = response.data.result;
      rawLeagues = liveData.leagues || [];
    } else {
      // All leagues endpoint
      rawLeagues = Array.isArray(response.data.result) ? response.data.result : [];
    }

    console.log('[LeaguesService] Processing', rawLeagues.length, 'raw leagues');
    console.log('[LeaguesService] Sample raw league:', rawLeagues[0]);

    const enhancedLeagues: League[] = rawLeagues.map((apiLeague: any) => {
      const leagueId = apiLeague.id || apiLeague.league_key;

      // Count matches for this league - check multiple possible league ID formats
      const liveCount = liveMatches.filter((match: any) => {
        const matchLeagueId = match.league?.id || match.league?.key || match.league_key || match.league_id;
        return matchLeagueId === leagueId || matchLeagueId === String(leagueId);
      }).length;

      const upcomingCount = upcomingMatches.filter((match: any) => {
        const matchLeagueId = match.league?.id || match.league?.key || match.league_key || match.league_id;
        return matchLeagueId === leagueId || matchLeagueId === String(leagueId);
      }).length;

      // Determine league status
      let status: 'live' | 'upcoming' | 'finished' = 'finished';
      if (liveCount > 0) status = 'live';
      else if (upcomingCount > 0) status = 'upcoming';

      // Create logo asset
      const logoUrl = apiLeague.logo || apiLeague.league_logo;
      const logoAsset = createLogoAsset(logoUrl, 'high');

      // Handle different response formats
      const leagueName = apiLeague.name || apiLeague.league_name;
      const countryName = apiLeague.country || apiLeague.country_name;

      const league = {
        id: leagueId,
        name: leagueName,
        country: countryName,
        logo: logoAsset,
        season: apiLeague.season || apiLeague.league_season || new Date().getFullYear(),
        status,
        liveMatches: liveCount,
        upcomingMatches: upcomingCount,
        finishedMatches: 0, // Would need additional API call
        lastUpdated: new Date(),
        api: 'allsports' as const,
        priority: getPriorityForLeague(leagueName, countryName)
      };

      // Debug logging for popular leagues
      if (league.priority <= 10) {
        console.log(`[LeaguesService] Popular league: ${league.name} (${league.country}) - Live: ${liveCount}, Upcoming: ${upcomingCount}, Status: ${status}`);
      }

      return league;
    });

    console.log('[LeaguesService] Enhanced leagues created:', enhancedLeagues.length);
    console.log('[LeaguesService] Sample enhanced league:', enhancedLeagues[0]);

    // Apply filters - but show all leagues by default, not just those with matches
    const filteredLeagues = enhancedLeagues.filter(league => {
      // Status filter
      if (filters?.status && filters.status !== 'all' && league.status !== filters.status) {
        return false;
      }

      // Only filter by hasMatches if explicitly requested
      if (filters?.hasMatches === true && !league.liveMatches && !league.upcomingMatches) {
        return false;
      }

      // Search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        return league.name.toLowerCase().includes(searchLower) ||
               league.country.toLowerCase().includes(searchLower);
      }

      return true;
    });

    console.log(`[LeaguesService] Filtered ${filteredLeagues.length} leagues from ${enhancedLeagues.length} total`);

    // Sort by priority and status
    const sortedLeagues = filteredLeagues.sort((a, b) => {
      // Live leagues first
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;

      // Then by priority
      if (a.priority !== b.priority) return (a.priority || 999) - (b.priority || 999);

      // Then by match count
      const aMatches = (a.liveMatches || 0) + (a.upcomingMatches || 0);
      const bMatches = (b.liveMatches || 0) + (b.upcomingMatches || 0);
      return bMatches - aMatches;
    });

    // Cache the result
    leaguesCache[cacheKey] = {
      data: sortedLeagues,
      timestamp: Date.now()
    };

    console.log(`[LeaguesService] Successfully fetched ${sortedLeagues.length} enhanced leagues`);
    return sortedLeagues;

  } catch (error) {
    console.error('[LeaguesService] Error fetching enhanced leagues:', error);
    return [];
  }
};

// Helper function to assign priority to popular leagues
const getPriorityForLeague = (leagueName: string, countryName: string): number => {
  const name = leagueName.toLowerCase();
  const country = countryName.toLowerCase();

  // Top tier leagues
  if (name.includes('premier league') && country.includes('england')) return 1;
  if (name.includes('la liga') || name.includes('primera división')) return 2;
  if (name.includes('bundesliga') && country.includes('germany')) return 3;
  if (name.includes('serie a') && country.includes('italy')) return 4;
  if (name.includes('ligue 1') && country.includes('france')) return 5;

  // Champions League and Europa League
  if (name.includes('champions league')) return 1;
  if (name.includes('europa league')) return 6;
  if (name.includes('conference league')) return 7;

  // Other major leagues
  if (name.includes('eredivisie')) return 8;
  if (name.includes('primeira liga')) return 9;
  if (name.includes('championship') && country.includes('england')) return 10;

  // Default priority
  return 50;
};

/**
 * Fetch all live leagues with current matches (legacy function for compatibility)
 */
const fetchLiveLeagues = async (signal?: AbortSignal): Promise<LiveLeaguesResponse | null> => {
  try {
    const leagues = await fetchEnhancedLeagues({ status: 'live', hasMatches: true }, signal);

    // Convert to legacy format
    const leagueMap = new Map<string, any>();
    leagues.forEach(league => {
      leagueMap.set(league.id, {
        id: league.id,
        name: league.name,
        country: league.country,
        logo: league.logo.url,
        matchCount: league.liveMatches || 0,
        isLive: league.status === 'live',
        api: league.api
      });
    });

    // Group leagues by country
    const countryGroups = new Map<string, any[]>();
    Array.from(leagueMap.values()).forEach(league => {
      const country = league.country || 'International';
      if (!countryGroups.has(country)) {
        countryGroups.set(country, []);
      }
      countryGroups.get(country)!.push(league);
    });

    // Convert to grouped format
    const groupedByCountry: LeagueGroup[] = Array.from(countryGroups.entries())
      .map(([country, leagues]) => ({
        country,
        leagues: leagues.sort((a, b) => (b.matchCount || 0) - (a.matchCount || 0)),
        totalMatches: leagues.reduce((sum, league) => sum + (league.matchCount || 0), 0)
      }))
      .sort((a, b) => b.totalMatches - a.totalMatches);

    return {
      leagues: Array.from(leagueMap.values()),
      groupedByCountry,
      totalLiveMatches: leagues.reduce((sum, league) => sum + (league.liveMatches || 0), 0),
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('[LeaguesService] Error fetching live leagues:', error);
    return null;
  }
};

/**
 * Fetch all available leagues (not just live ones)
 */
const fetchAllLeagues = async (countryId?: string, signal?: AbortSignal): Promise<League[]> => {
  try {
    console.log('[LeaguesService] Fetching all available leagues...');

    const cacheKey = `all_leagues_${countryId || 'all'}`;
    const cachedData = leaguesCache[cacheKey];

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
      console.log('[LeaguesService] Using cached all leagues data');
      return cachedData.data;
    }

    // Fetch from AllSportsAPI
    const params: any = {
      met: 'Leagues',
      APIkey: API_KEY
    };

    if (countryId) {
      params.countryId = countryId;
    }

    const response = await axios.get(ALLSPORTS_BASE_URL, {
      params,
      signal,
      timeout: 15000
    });

    if (!response.data?.success || !response.data?.result) {
      console.warn('[LeaguesService] No leagues data available from AllSportsAPI');
      return [];
    }

    const leagues: League[] = response.data.result.map((league: any) => ({
      id: league.league_key,
      name: league.league_name,
      country: league.country_name,
      logo: league.league_logo,
      season: league.league_season || new Date().getFullYear(),
      type: 'league',
      isLive: false,
      api: 'allsports' as const
    }));

    // Cache the result
    leaguesCache[cacheKey] = {
      data: leagues,
      timestamp: Date.now()
    };

    console.log(`[LeaguesService] Successfully fetched ${leagues.length} leagues`);
    return leagues;

  } catch (error) {
    console.error('[LeaguesService] Error fetching all leagues:', error);
    return [];
  }
};

/**
 * Get league details with current standings
 */
const getLeagueDetails = async (leagueId: string, signal?: AbortSignal) => {
  try {
    console.log(`[LeaguesService] Fetching details for league ${leagueId}`);

    const response = await axios.get(`${BACKEND_BASE_URL}/leagues/${leagueId}/standings`, {
      signal,
      timeout: 10000
    });

    if (!response.data?.success) {
      console.warn(`[LeaguesService] No standings data for league ${leagueId}`);
      return null;
    }

    return response.data.result;

  } catch (error) {
    console.error(`[LeaguesService] Error fetching league details for ${leagueId}:`, error);
    return null;
  }
};

/**
 * Clear leagues cache
 */
const clearLeaguesCache = () => {
  Object.keys(leaguesCache).forEach(key => {
    delete leaguesCache[key];
  });
  console.log('[LeaguesService] Cache cleared');
};

/**
 * Get countries with leagues
 */
const fetchCountries = async (signal?: AbortSignal) => {
  try {
    console.log('[LeaguesService] Fetching countries...');

    const response = await axios.get(ALLSPORTS_BASE_URL, {
      params: {
        met: 'Countries',
        APIkey: API_KEY
      },
      signal,
      timeout: 10000
    });

    if (!response.data?.success || !response.data?.result) {
      return [];
    }

    return response.data.result.map((country: any) => ({
      id: country.country_key,
      name: country.country_name,
      logo: country.country_logo
    }));

  } catch (error) {
    console.error('[LeaguesService] Error fetching countries:', error);
    return [];
  }
};

// Export the service
const leaguesService = {
  fetchLiveLeagues,
  fetchAllLeagues,
  fetchEnhancedLeagues,
  getLeagueDetails,
  fetchCountries,
  clearLeaguesCache,
  createLogoAsset,
  optimizeLogo
};

export default leaguesService;

// Named exports for enhanced functionality
export {
  fetchEnhancedLeagues,
  createLogoAsset,
  optimizeLogo,
  getPriorityForLeague
};
