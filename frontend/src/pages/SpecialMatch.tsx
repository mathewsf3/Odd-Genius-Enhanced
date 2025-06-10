// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Spinner,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Badge,
  Tooltip,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';

import { Match, H2HData } from '../types/interfaces';
import { CornerStats } from '../types/cornerStats';
import { CardStats } from '../types/cardStats';
import { BTTSStats } from '../types/bttsStats';
import { PlayerStats } from '../types/playerStats';
import Loader from '../components/common/Loader';
import axios from 'axios';

// Component imports
import CustomHeadToHeadTab from '../components/match/CustomHeadToHeadTab';
import CornerTabCustom from '../components/match/CornerTabCustom';
import CustomCardsTab from '../components/match/CustomCardsTab';
import CustomBTTSTab from '../components/match/CustomBTTSTab';
import CustomPlayerStatsTab from '../components/match/CustomPlayerStatsTab';
import CustomLeagueTab from '../components/match/CustomLeagueTab';
import MatchHeader from '../components/match/MatchHeader';

// Import services
import cornerStatsService from '../services/cornerStatsService';
import cardStatsService from '../services/cardStatsService';
import bttsStatsService from '../services/bttsStatsService';
import playerStatsService from '../services/playerStatsService';
import leagueService, { FormattedLeagueStandings } from '../services/leagueService';
import teamFormService, { TeamForm } from '../services/teamFormService';

interface SpecialMatchProps {
  matchId?: string;
}

// Initial match data structure - will be populated with real data from API
const INITIAL_MATCH_DATA: Match = {
  id: '',
  homeTeam: { id: '', name: '', logo: '' },
  awayTeam: { id: '', name: '', logo: '' },
  league: { id: '', name: '', country: '', logo: '' },
  date: '',
  time: '',
  startTime: '',
  status: '',
  venue: '',
  odds: { home: 0, draw: 0, away: 0 },
  probability: { home: '0%', draw: '0%', away: '0%' },
  score: { home: 0, away: 0 }
};

const SpecialMatch: React.FC<SpecialMatchProps> = ({ matchId: propMatchId }) => {
  const params = useParams();
  const matchId = propMatchId || params.id || '1530359';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [h2hData, setH2hData] = useState<H2HData | null>(null);
  const [cornerStatsData, setCornerStatsData] = useState<CornerStats | null>(null);
  const [cardStatsData, setCardStatsData] = useState<CardStats | null>(null);
  const [bttsStatsData, setBttsStatsData] = useState<BTTSStats | null>(null);
  const [playerStatsData, setPlayerStatsData] = useState<PlayerStats | null>(null);
  const [leagueStandingsData, setLeagueStandingsData] = useState<FormattedLeagueStandings | null>(null);
  const [homeTeamForm, setHomeTeamForm] = useState<TeamForm | null>(null);
  const [awayTeamForm, setAwayTeamForm] = useState<TeamForm | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [gameCount, setGameCount] = useState<number>(10);
  const [matchData, setMatchData] = useState<Match>(INITIAL_MATCH_DATA);
  const [dataSource, setDataSource] = useState<string>('Unknown');
  const bgColor = useColorModeValue('white', 'gray.800');

  // Enhanced match data fetching with better unified system support
  const fetchMatchData = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`🔍 [SpecialMatch] Fetching match data for ID: ${id}`);

      // Clear all existing data
      setH2hData(null);
      setCornerStatsData(null);
      setCardStatsData(null);
      setBttsStatsData(null);
      setPlayerStatsData(null);
      setLeagueStandingsData(null);
      setHomeTeamForm(null);
      setAwayTeamForm(null);

      // Try standard endpoint first, then fallback to live/upcoming if team data is missing
      console.log('🔍 Using standard match endpoint');
      let response = await axios.get(`http://localhost:5000/api/matches/${id}`, {
        timeout: 15000
      });

      let result = response.data?.result;
      let needsFallback = false;

      // Check if we got valid team data
      if (response.data && response.data.success && result) {
        // Check if team data is missing or incomplete
        const hasValidTeamData = (
          (result.homeTeam?.name || result.event_home_team) &&
          (result.awayTeam?.name || result.event_away_team)
        );

        if (!hasValidTeamData) {
          console.log('⚠️ Main endpoint returned incomplete team data, trying fallback endpoints');
          needsFallback = true;
        }
      } else {
        needsFallback = true;
      }

      // Try fallback endpoints if needed
      if (needsFallback) {
        console.log('🔍 Trying live matches endpoint as fallback');
        try {
          const liveResponse = await axios.get('http://localhost:5000/api/matches/live', {
            timeout: 10000
          });

          if (liveResponse.data?.success && liveResponse.data.result) {
            const liveMatches = liveResponse.data.result;
            const targetMatch = liveMatches.find((m: any) => m.id === id);

            if (targetMatch) {
              console.log('✅ Found match in live matches');
              result = targetMatch;
              needsFallback = false;
            }
          }
        } catch (liveError) {
          console.warn('Live matches fallback failed:', liveError);
        }

        // If still no data, try upcoming matches
        if (needsFallback) {
          console.log('🔍 Trying upcoming matches endpoint as fallback');
          try {
            const upcomingResponse = await axios.get('http://localhost:5000/api/matches/upcoming', {
              timeout: 10000
            });

            if (upcomingResponse.data?.success && upcomingResponse.data.result) {
              const upcomingMatches = upcomingResponse.data.result;
              const targetMatch = upcomingMatches.find((m: any) => m.id === id);

              if (targetMatch) {
                console.log('✅ Found match in upcoming matches');
                result = targetMatch;
                needsFallback = false;
              }
            }
          } catch (upcomingError) {
            console.warn('Upcoming matches fallback failed:', upcomingError);
          }
        }
      }

      if (result && !needsFallback) {
        console.log('✅ Match data received:', result);
        let matchData: Match;

        // Handle different response formats
        if (result.universal) {
          // New unified format
          console.log('🔄 Processing unified system data');
          const universal = result.universal;
          const merged = result.merged || {};
          const sources = result.sources || {};

          // Determine data source
          const availableSources = [];
          if (sources.allSports) availableSources.push('AllSports');
          if (sources.apiFootball) availableSources.push('API Football');
          setDataSource(availableSources.join(' + ') || 'Unknown');

          matchData = {
            id: universal.id || id,
            homeTeam: {
              id: universal.homeTeam?.id?.toString() || '',
              name: universal.homeTeam?.name || merged.homeTeam?.name || 'Unknown Team',
              logo: universal.homeTeam?.logo ||
                    merged.homeTeam?.logo ||
                    result.allSports?.homeTeam?.logo ||
                    result.allSports?.rawData?.home_team_logo ||
                    sources.allSports?.homeTeam?.logo ||
                    sources.apiFootball?.homeTeam?.logo || ''
            },
            awayTeam: {
              id: universal.awayTeam?.id?.toString() || '',
              name: universal.awayTeam?.name || merged.awayTeam?.name || 'Unknown Team',
              logo: universal.awayTeam?.logo ||
                    merged.awayTeam?.logo ||
                    result.allSports?.awayTeam?.logo ||
                    result.allSports?.rawData?.away_team_logo ||
                    sources.allSports?.awayTeam?.logo ||
                    sources.apiFootball?.awayTeam?.logo || ''
            },
            league: {
              id: universal.league?.id?.toString() || '',
              name: universal.league?.name || merged.league?.name || 'Unknown League',
              country: universal.league?.country || merged.league?.country || '',
              logo: universal.league?.logo ||
                    merged.league?.logo ||
                    result.allSports?.league?.logo ||
                    result.allSports?.rawData?.league_logo ||
                    sources.allSports?.league?.logo ||
                    sources.apiFootball?.league?.logo || ''
            },
            date: universal.date || merged.date || new Date().toISOString().split('T')[0],
            time: merged.time || universal.time || '',
            startTime: `${universal.date || merged.date}T${merged.time || '00:00'}:00`,
            status: merged.status || universal.status || 'NS',
            venue: merged.venue || sources.allSports?.venue || sources.apiFootball?.venue || '',
            odds: merged.odds || { home: 0, draw: 0, away: 0 },
            probability: merged.probability || { home: '0%', draw: '0%', away: '0%' },
            score: merged.score || { home: 0, away: 0 }
          };

          // Store the full result for reference
          matchData._raw = result;
        } else {
          // Legacy format or direct API response
          console.log('🔄 Processing standard format data');
          setDataSource('AllSports API');

          matchData = {
            id: result.id || id,
            homeTeam: {
              id: result.homeTeam?.id?.toString() || result.home_team_key?.toString() || '',
              name: result.homeTeam?.name || result.event_home_team || 'Unknown Team',
              logo: result.homeTeam?.logo || result.home_team_logo || ''
            },
            awayTeam: {
              id: result.awayTeam?.id?.toString() || result.away_team_key?.toString() || '',
              name: result.awayTeam?.name || result.event_away_team || 'Unknown Team',
              logo: result.awayTeam?.logo || result.away_team_logo || ''
            },
            league: {
              id: result.league?.id?.toString() || result.league_key?.toString() || '',
              name: result.league?.name || result.league_name || 'Unknown League',
              country: result.league?.country || result.country_name || '',
              logo: result.league?.logo || result.league_logo || ''
            },
            date: result.date || result.event_date || new Date().toISOString().split('T')[0],
            time: result.time || result.event_time || '',
            startTime: result.startTime || result.event_timestamp || '',
            status: result.status || result.event_status || 'NS',
            venue: result.venue || result.event_stadium || '',
            odds: result.odds || { home: 0, draw: 0, away: 0 },
            probability: result.probability || { home: '0%', draw: '0%', away: '0%' },
            score: {
              home: result.score?.home || parseInt(result.event_final_result?.split('-')[0]) || 0,
              away: result.score?.away || parseInt(result.event_final_result?.split('-')[1]) || 0
            }
          };
        }

        console.log('📊 Final processed match data:', matchData);
        setMatchData(matchData);
        setIsLoading(false);
        return matchData;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ [SpecialMatch] Error fetching match data:', error);

      let errorMessage = `Unable to load match data for ID: ${id}.`;

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMessage = 'Match not found. Please check the match ID or select a different match.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please check your connection.';
        }
      }

      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Enhanced H2H fetching with better error handling
  const fetchH2HData = async () => {
    try {
      console.log('🔍 [H2H Fetch] Starting H2H data fetch for match:', matchData);
      console.log('🔍 [H2H Fetch] Match ID:', matchId);
      console.log('🔍 [H2H Fetch] Home Team:', matchData.homeTeam);
      console.log('🔍 [H2H Fetch] Away Team:', matchData.awayTeam);

      // Extract team IDs - handle different formats
      let homeTeamId = matchData.homeTeam.id;
      let awayTeamId = matchData.awayTeam.id;

      // Remove prefixes if present
      homeTeamId = homeTeamId.replace(/^team-/, '');
      awayTeamId = awayTeamId.replace(/^team-/, '');

      // Check if we have valid IDs
      if (!homeTeamId || !awayTeamId || homeTeamId === '0' || awayTeamId === '0') {
        console.warn('⚠️ [H2H Fetch] Invalid team IDs for H2H:', { homeTeamId, awayTeamId });
        setH2hData(null);
        return;
      }

      console.log(`📊 [H2H Fetch] Fetching H2H for teams: ${homeTeamId} vs ${awayTeamId}`);
      console.log(`📊 [H2H Fetch] API URL: http://localhost:5000/api/matches/${matchId}/h2h`);

      const response = await axios.get(`http://localhost:5000/api/matches/${matchId}/h2h`, {
        timeout: 15000
      });

      console.log('📊 [H2H Fetch] Response received:', response.data);

      if (response.data?.success && response.data.result) {
        const h2hData = response.data.result;
        console.log('✅ [H2H Fetch] H2H data received:', h2hData);

        // Validate H2H data structure
        if (h2hData.matches && h2hData.summary) {
          setH2hData(h2hData);
          console.log(`✅ [H2H Fetch] Processed ${h2hData.matches.length} H2H matches`);
        } else {
          console.warn('⚠️ [H2H Fetch] Invalid H2H data structure - missing matches or summary');
          setH2hData(null);
        }
      } else {
        console.warn('⚠️ [H2H Fetch] No H2H data in response');
        setH2hData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching H2H data:', error);
      // Don't set error state for H2H failures - just show no data
      setH2hData(null);
    }
  };

  // Fetch corner stats data
  const fetchCornerStatsData = async (count: number = gameCount) => {
    try {
      console.log(`🔍 Fetching corner stats for ${count} games`);

      if (count !== gameCount) {
        setCornerStatsData(null);
      }

      const data = await cornerStatsService.fetchCornerStats(matchId, count);
      console.log('✅ Corner stats received:', data);

      if (count !== gameCount) {
        setGameCount(count);
      }

      setCornerStatsData(data);
      return data;
    } catch (err) {
      console.error('❌ Error fetching corner stats:', err);
      setCornerStatsData(null);
      throw err;
    }
  };

  // Fetch card stats data
  const fetchCardStatsData = async (count: number = gameCount) => {
    try {
      console.log(`🔍 Fetching card stats for ${count} games`);

      if (count !== gameCount) {
        setCardStatsData(null);
      }

      const data = await cardStatsService.fetchCardStats(matchId, count);
      console.log('✅ Card stats received:', data);

      if (count !== gameCount) {
        setGameCount(count);
      }

      setCardStatsData(data);
      return data;
    } catch (err) {
      console.error('❌ Error fetching card stats:', err);
      setCardStatsData(null);
      throw err;
    }
  };

  // Fetch BTTS stats data
  const fetchBTTSStatsData = async (count: number = gameCount) => {
    try {
      console.log(`🔍 Fetching BTTS stats for ${count} games`);

      setBttsStatsData(null);

      const data = await bttsStatsService.fetchBTTSStats(matchId, count);
      console.log('✅ BTTS stats received:', data);

      if (count !== gameCount) {
        setGameCount(count);
      }

      setBttsStatsData(data);
      return data;
    } catch (err) {
      console.error('❌ Error fetching BTTS stats:', err);
      setBttsStatsData(null);
      throw err;
    }
  };

  // Fetch player stats data
  const fetchPlayerStatsData = async (count: number = gameCount) => {
    try {
      console.log(`🔍 Fetching player stats for ${count} games`);

      setPlayerStatsData(null);

      const data = await playerStatsService.fetchPlayerStatsForMatch(matchId, count);
      console.log('✅ Player stats received:', data);

      if (count !== gameCount) {
        setGameCount(count);
      }

      setPlayerStatsData(data);
      return data;
    } catch (err) {
      console.error('❌ Error fetching player stats:', err);
      setPlayerStatsData(null);
      throw err;
    }
  };

  // Fetch team form data
  const fetchTeamFormData = async () => {
    try {
      console.log('🔍 Fetching team form data');

      setHomeTeamForm(null);
      setAwayTeamForm(null);

      // Extract clean team IDs
      const homeTeamId = typeof matchData.homeTeam.id === 'string' ? matchData.homeTeam.id.replace(/^team-/, '') : String(matchData.homeTeam.id);
      const awayTeamId = typeof matchData.awayTeam.id === 'string' ? matchData.awayTeam.id.replace(/^team-/, '') : String(matchData.awayTeam.id);

      // Validate IDs
      if (!homeTeamId || !awayTeamId || homeTeamId === '0' || awayTeamId === '0') {
        console.warn('⚠️ Invalid team IDs for form data');
        return;
      }

      const formData = await teamFormService.fetchMatchTeamsForm(
        homeTeamId,
        matchData.homeTeam.name,
        awayTeamId,
        matchData.awayTeam.name
      );

      console.log('✅ Team form data received:', formData);

      setHomeTeamForm(formData.homeTeamForm);
      setAwayTeamForm(formData.awayTeamForm);
      return formData;
    } catch (err) {
      console.error('❌ Error fetching team form:', err);
      setHomeTeamForm(null);
      setAwayTeamForm(null);
      throw err;
    }
  };

  // Fetch league standings data
  const fetchLeagueStandingsData = async () => {
    try {
      console.log('🔍 Fetching league standings');

      setLeagueStandingsData(null);

      const leagueId = matchData.league.id;
      const homeTeamId = typeof matchData.homeTeam.id === 'string' ? matchData.homeTeam.id.replace(/^team-/, '') : String(matchData.homeTeam.id);
      const awayTeamId = typeof matchData.awayTeam.id === 'string' ? matchData.awayTeam.id.replace(/^team-/, '') : String(matchData.awayTeam.id);

      if (!leagueId || leagueId === '0') {
        console.warn('⚠️ Invalid league ID');
        return;
      }

      const data = await leagueService.fetchLeagueStandings(
        leagueId,
        homeTeamId,
        awayTeamId,
        matchData.id
      );

      console.log('✅ League standings received:', data);
      setLeagueStandingsData(data);
      return data;
    } catch (err) {
      console.error('❌ Error fetching league standings:', err);
      setLeagueStandingsData(null);
      throw err;
    }
  };

  // Fetch all statistics when match data is ready
  useEffect(() => {
    console.log('📊 [Stats Effect] Match data changed:', {
      homeTeamId: matchData.homeTeam.id,
      awayTeamId: matchData.awayTeam.id,
      homeTeamName: matchData.homeTeam.name,
      awayTeamName: matchData.awayTeam.name
    });

    if (matchData.homeTeam.id && matchData.awayTeam.id &&
        matchData.homeTeam.id !== '' && matchData.awayTeam.id !== '') {
      console.log('📊 [Stats Effect] Match data ready, fetching all statistics...');

      // Fetch all data with error handling for each
      fetchH2HData().catch(console.error);
      fetchCornerStatsData().catch(console.error);
      fetchCardStatsData().catch(console.error);
      fetchBTTSStatsData().catch(console.error);
      fetchPlayerStatsData().catch(console.error);
      fetchLeagueStandingsData().catch(console.error);
      fetchTeamFormData().catch(console.error);
    } else {
      console.log('📊 [Stats Effect] Match data not ready yet, waiting...');
    }
  }, [matchData.homeTeam.id, matchData.awayTeam.id]);

  // Handle game count changes
  useEffect(() => {
    const handleGameCountChange = (e: CustomEvent) => {
      const newGameCount = e.detail.gameCount;
      console.log(`📊 Game count changed to ${newGameCount}`);

      setGameCount(newGameCount);

      // Clear and refetch data
      setCornerStatsData(null);
      setCardStatsData(null);
      setBttsStatsData(null);
      setPlayerStatsData(null);

      // Refetch with new count
      fetchCornerStatsData(newGameCount).catch(console.error);
      fetchCardStatsData(newGameCount).catch(console.error);
      fetchBTTSStatsData(newGameCount).catch(console.error);
      fetchPlayerStatsData(newGameCount).catch(console.error);
    };

    document.addEventListener('gameCountChange', handleGameCountChange as EventListener);
    return () => {
      document.removeEventListener('gameCountChange', handleGameCountChange as EventListener);
    };
  }, [matchId]); // Include matchId to ensure we're fetching for the right match

  // Fetch match data on mount or ID change
  useEffect(() => {
    console.log(`🎯 SpecialMatch mounted with matchId: ${matchId}`);
    fetchMatchData(matchId);
  }, [matchId]);

  if (isLoading) {
    return <Loader isOpen={true} />;
  }

  if (error) {
    return (
      <Container centerContent py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error Loading Match</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={5}>
        <Box bg={bgColor} p={4} borderRadius="md" boxShadow="sm" mb={4}>
          {/* Match Header */}
          <MatchHeader
            match={matchData}
            homeTeamForm={homeTeamForm}
            awayTeamForm={awayTeamForm}
            isLoadingForm={!homeTeamForm && !awayTeamForm && !error}
          />

          {/* Data Source Info */}
          <Box mt={2} p={2} bg="blue.50" borderRadius="md" fontSize="sm" color="blue.700">
            <Flex justifyContent="space-between" alignItems="center">
              <Box>
                <strong>Data Source:</strong> {dataSource} |
                <strong> Match ID:</strong> {matchData.id} |
                <strong> Updated:</strong> {new Date().toLocaleString()}
              </Box>
              <Flex alignItems="center" gap={2}>
                <Badge colorScheme="blue" fontSize="sm">
                  Analyzing: Last {gameCount} matches
                </Badge>
                <Tooltip label="Clear all cached data and refresh">
                  <Button
                    size="xs"
                    colorScheme="blue"
                    variant="ghost"
                    onClick={() => {
                      // Clear all caches
                      cornerStatsService.clearCornerStatsCache();
                      cardStatsService.clearCardStatsCache();
                      bttsStatsService.clearBTTSStatsCache();
                      playerStatsService.clearPlayerStatsCache();
                      leagueService.clearLeagueStandingsCache();
                      teamFormService.clearAllCache();

                      // Refetch all data
                      fetchMatchData(matchId);
                    }}
                  >
                    Reset Cache
                  </Button>
                </Tooltip>
              </Flex>
            </Flex>
          </Box>
        </Box>

        {/* Tabs */}
        <Box mt={6}>
          <Tabs
            isFitted
            variant="enclosed"
            colorScheme="blue"
            index={tabIndex}
            onChange={setTabIndex}
          >
            <TabList mb="1em">
              <Tab fontWeight="medium">Head to Head</Tab>
              <Tab fontWeight="medium">Corner Stats</Tab>
              <Tab fontWeight="medium">Card Stats</Tab>
              <Tab fontWeight="medium">BTTS Stats</Tab>
              <Tab fontWeight="medium">Player Stats</Tab>
              <Tab fontWeight="medium">League</Tab>
            </TabList>

            <TabPanels>
              {/* H2H Tab */}
              <TabPanel p={0}>
                <CustomHeadToHeadTab
                  key={`h2h-${matchId}-${gameCount}`}
                  match={matchData}
                  data={h2hData}
                  isLoading={isLoading || (!h2hData && !error && matchData.homeTeam.id && matchData.awayTeam.id)}
                  initialMatchRange={gameCount}
                />
              </TabPanel>

              {/* Corner Stats Tab */}
              <TabPanel p={0}>
                <CornerTabCustom
                  key={`corners-${matchId}-${gameCount}`}
                  match={matchData}
                  data={cornerStatsData}
                  isLoading={!cornerStatsData && !error}
                  initialGameCount={gameCount.toString()}
                  onRefresh={fetchCornerStatsData}
                />
              </TabPanel>

              {/* Card Stats Tab */}
              <TabPanel p={0}>
                <CustomCardsTab
                  key={`cards-${matchId}-${gameCount}`}
                  match={matchData}
                  data={cardStatsData}
                  isLoading={!cardStatsData && !error}
                  initialGameCount={gameCount.toString()}
                  onRefresh={fetchCardStatsData}
                />
              </TabPanel>

              {/* BTTS Tab */}
              <TabPanel p={0}>
                <CustomBTTSTab
                  key={`btts-${matchId}-${gameCount}`}
                  match={matchData}
                  data={bttsStatsData}
                  isLoading={!bttsStatsData && !error}
                  initialGameCount={gameCount.toString()}
                  onRefresh={fetchBTTSStatsData}
                />
              </TabPanel>

              {/* Player Stats Tab */}
              <TabPanel p={0}>
                <CustomPlayerStatsTab
                  key={`players-${matchId}-${gameCount}`}
                  match={matchData}
                  data={playerStatsData}
                  isLoading={!playerStatsData && !error}
                  initialGameCount={gameCount.toString()}
                  onGameCountChange={(count) => {
                    const customEvent = new CustomEvent('gameCountChange', {
                      detail: { gameCount: count, requiresRefetch: true },
                      bubbles: true
                    });
                    document.dispatchEvent(customEvent);
                  }}
                  onRefresh={fetchPlayerStatsData}
                />
              </TabPanel>

              {/* League Tab */}
              <TabPanel p={0}>
                <CustomLeagueTab
                  key={`league-${matchId}`}
                  match={matchData}
                  data={leagueStandingsData}
                  isLoading={!leagueStandingsData && !error}
                  onRefresh={fetchLeagueStandingsData}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
};

export default SpecialMatch;