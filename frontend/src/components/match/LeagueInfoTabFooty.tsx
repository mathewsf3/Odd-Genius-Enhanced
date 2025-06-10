import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Icon,
  Flex,
  Alert,
  AlertIcon,
  Spinner,
  Avatar,
  Progress
} from '@chakra-ui/react';
import {
  FiAward,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiBarChart2,
  FiInfo
} from 'react-icons/fi';

interface LeagueInfoTabFootyProps {
  match: {
    id: string;
    homeTeam: {
      id: string;
      name: string;
      logo?: string;
    };
    awayTeam: {
      id: string;
      name: string;
      logo?: string;
    };
    league?: {
      id?: string;
      name?: string;
      country?: string;
      logo?: string;
    };
  };
  gameCount: number;
  onGameCountChange: (count: number) => void;
}

const LeagueInfoTabFooty: React.FC<LeagueInfoTabFootyProps> = ({
  match,
  gameCount,
  onGameCountChange
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [leagueStandings, setLeagueStandings] = useState<any>(null);
  const [leagueStats, setLeagueStats] = useState<any>(null);
  const [isLoadingLeagueData, setIsLoadingLeagueData] = useState(false);
  const [leagueSeasons, setLeagueSeasons] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentBlue = useColorModeValue('blue.500', 'blue.300');
  const accentGreen = useColorModeValue('green.500', 'green.300');

  // Helper function to find season ID from league seasons data
  const findSeasonId = (leagueId: string, seasonsData: any[]) => {
    if (!seasonsData || !Array.isArray(seasonsData)) return null;

    // Look for current season (2024/2025 or 2025)
    const currentYear = new Date().getFullYear();
    const seasonPatterns = [
      `${currentYear}/${currentYear + 1}`,
      `${currentYear - 1}/${currentYear}`,
      currentYear.toString(),
      (currentYear - 1).toString()
    ];

    for (const season of seasonsData) {
      // Check if this league matches our league ID or name
      const leagueMatches =
        season.competition_name?.toLowerCase().includes(match.league?.name?.toLowerCase()) ||
        season.season_id?.toString() === leagueId;

      if (leagueMatches) {
        // Prefer current season
        for (const pattern of seasonPatterns) {
          if (season.season_name?.includes(pattern)) {
            return season.season_id;
          }
        }
        // If no current season found, return the first match
        return season.season_id;
      }
    }

    return null;
  };

  // Fetch league information from FootyStats API
  const fetchLeagueData = async () => {
    console.log('🔍 League data fetch started');
    console.log('🔍 Match league data:', match.league);
    console.log('🔍 League ID:', match.league?.id);
    console.log('🔍 Season ID:', match.league?.season_id);

    if (!match.league?.id && !match.league?.name) {
      setDebugInfo({ error: 'No league ID or name available' });
      return;
    }

    setIsLoadingLeagueData(true);
    setDebugInfo({
      step: 'Starting fetch',
      leagueId: match.league?.id,
      leagueName: match.league?.name
    });

    try {
      // Step 1: Try to get league standings directly using league ID from match data
      if (match.league?.season_id) {
        console.log(`🔍 Using season ID from match data: ${match.league.season_id}`);
        const directResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/league/${match.league.season_id}/standings`);

        if (directResponse.ok) {
          const directData = await directResponse.json();
          if (directData.success && directData.data) {
            console.log('✅ Successfully fetched league standings using match season ID');
            console.log('📊 League standings data structure:', directData.data);

            // FootyStats returns nested structure: data.data.all_matches_table_overall
            let standingsArray = null;
            console.log('🔍 Full API response structure:', JSON.stringify(directData, null, 2));

            if (directData.data.data && directData.data.data.all_matches_table_overall) {
              standingsArray = directData.data.data.all_matches_table_overall;
            } else if (directData.data.data && Array.isArray(directData.data.data)) {
              standingsArray = directData.data.data;
            } else if (Array.isArray(directData.data)) {
              standingsArray = directData.data;
            } else if (directData.data.league_table) {
              standingsArray = directData.data.league_table;
            }

            console.log('📊 Extracted standings array:', standingsArray);
            console.log('📊 Is array?', Array.isArray(standingsArray));

            if (Array.isArray(standingsArray) && standingsArray.length > 0) {
              setLeagueStandings(standingsArray);
              setDebugInfo(prev => ({ ...prev, step: 'Direct success', standingsCount: standingsArray.length }));
              return;
            } else {
              console.warn('⚠️ No valid standings array found in FootyStats response');
              setDebugInfo(prev => ({ ...prev, step: 'No standings data in response' }));
            }
          }
        }
      }

      // Step 2: Get league seasons to find the correct season_id
      console.log('🔍 Fetching FootyStats league seasons...');
      const seasonsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/league-seasons`);

      if (seasonsResponse.ok) {
        const seasonsData = await seasonsResponse.json();
        if (seasonsData.success && seasonsData.data) {
          setLeagueSeasons(seasonsData.data);
          setDebugInfo(prev => ({ ...prev, seasonsFound: seasonsData.data.length }));

          // Step 3: Find the correct season_id for our league
          const seasonId = findSeasonId(match.league.id, seasonsData.data);

          if (seasonId) {
            console.log(`✅ Found season ID: ${seasonId} for league: ${match.league?.name}`);
            setDebugInfo(prev => ({ ...prev, seasonId, step: 'Found season ID' }));

            // Step 4: Get league standings using season_id
            const standingsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/league/${seasonId}/standings`);

            if (standingsResponse.ok) {
              const standingsData = await standingsResponse.json();
              if (standingsData.success && standingsData.data) {
                console.log('✅ Successfully fetched FootyStats league standings');

                // Extract standings array from nested structure
                let standingsArray = null;
                if (standingsData.data.data && standingsData.data.data.all_matches_table_overall) {
                  standingsArray = standingsData.data.data.all_matches_table_overall;
                } else if (Array.isArray(standingsData.data)) {
                  standingsArray = standingsData.data;
                } else if (standingsData.data.league_table) {
                  standingsArray = standingsData.data.league_table;
                }

                if (Array.isArray(standingsArray) && standingsArray.length > 0) {
                  setLeagueStandings(standingsArray);
                  setDebugInfo(prev => ({ ...prev, step: 'Success', standingsCount: standingsArray.length }));
                  return;
                }
              }
            }
          } else {
            console.warn('⚠️ Could not find season ID for league:', match.league?.name);
            setDebugInfo(prev => ({ ...prev, step: 'Season ID not found' }));
          }
        }
      }

      // Step 5: Try alternative FootyStats endpoints
      console.log('🔄 Trying alternative FootyStats endpoints...');

      // Try using league name for search
      if (match.league?.name) {
        const searchResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/leagues`);
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.success && searchData.data) {
            const foundLeague = searchData.data.find((league: any) =>
              league.competition_name?.toLowerCase().includes(match.league.name.toLowerCase()) ||
              league.name?.toLowerCase().includes(match.league.name.toLowerCase())
            );

            if (foundLeague && foundLeague.season_id) {
              console.log(`✅ Found league via search: ${foundLeague.season_id}`);
              const altResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/league/${foundLeague.season_id}/standings`);

              if (altResponse.ok) {
                const altData = await altResponse.json();
                if (altData.success && altData.data) {
                  console.log('✅ Successfully fetched league standings via search');
                  setLeagueStandings(altData.data);
                  setDebugInfo(prev => ({ ...prev, step: 'Search success', standingsCount: altData.data.length }));
                  return;
                }
              }
            }
          }
        }
      }

      // Step 6: No fallback - FootyStats API only
      console.warn('🔄 FootyStats league standings not available - no fallback APIs used');
      setDebugInfo(prev => ({ ...prev, step: 'FootyStats only - no fallback' }));

      // If all methods fail, set appropriate debug info
      setDebugInfo(prev => ({ ...prev, step: 'All methods failed', error: 'No league standings data available' }));

    } catch (error) {
      console.error('❌ Error fetching league data:', error);
      setDebugInfo(prev => ({ ...prev, error: error.message }));
    } finally {
      setIsLoadingLeagueData(false);
    }
  };

  // Load league data on component mount
  useEffect(() => {
    fetchLeagueData();
  }, [match.league?.id]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLeagueData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Debug info removed for production

  // Render modern game count selector with white and green design
  const renderGameCountSelector = () => (
    <Box
      bg="white"
      p={8}
      borderRadius="2xl"
      mb={8}
      border="2px solid"
      borderColor="green.200"
      boxShadow="0 8px 25px rgba(34, 197, 94, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      _hover={{
        boxShadow: "0 12px 35px rgba(34, 197, 94, 0.25), 0 8px 15px -3px rgba(0, 0, 0, 0.15)",
        transform: "translateY(-4px)",
        borderColor: "green.300"
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <Flex align="center" justify="space-between">
        <HStack spacing={4}>
          <Box
            bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
            p={4}
            borderRadius="xl"
            boxShadow="0 4px 12px rgba(34, 197, 94, 0.3)"
          >
            <Icon as={FiInfo} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              🏆 League Information
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="500" fontFamily="DIN, sans-serif">
              League standings • Team positions • Competition details
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              FootyStats Data
            </Badge>
          </VStack>
        </HStack>

        <Button
          size="lg"
          leftIcon={<FiRefreshCw />}
          variant="outline"
          onClick={handleRefresh}
          isLoading={isRefreshing}
          colorScheme="green"
          borderRadius="xl"
          borderWidth="2px"
          px={6}
          py={3}
          fontWeight="700"
          _hover={{
            transform: "translateY(-3px)",
            boxShadow: "0 8px 20px rgba(34, 197, 94, 0.3)",
            bg: "green.50"
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          fontFamily="DIN, sans-serif"
        >
          🔄 Refresh
        </Button>
      </Flex>


    </Box>
  );

  // Render modern league overview
  const renderLeagueOverview = () => (
    <Box
      bg="white"
      p={8}
      borderRadius="2xl"
      border="2px solid"
      borderColor="green.200"
      boxShadow="0 8px 25px rgba(34, 197, 94, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      mb={8}
      _hover={{
        boxShadow: "0 12px 35px rgba(34, 197, 94, 0.25), 0 8px 15px -3px rgba(0, 0, 0, 0.15)",
        transform: "translateY(-4px)",
        borderColor: "green.300"
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <Flex align="center" mb={8}>
        <Box
          bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
          p={4}
          borderRadius="xl"
          mr={4}
          boxShadow="0 4px 12px rgba(34, 197, 94, 0.3)"
        >
          <Icon as={FiAward} color="white" boxSize={7} />
        </Box>
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
            🏆 League Overview
          </Text>
          <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
            Competition details • Team positions • League context
          </Text>
          <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
            Official Data
          </Badge>
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Box
          bg="gradient-to-br from-blue-50 to-blue-100"
          p={6}
          borderRadius="xl"
          border="1px solid"
          borderColor="blue.200"
          textAlign="center"
          boxShadow="0 4px 12px rgba(59, 130, 246, 0.15)"
          _hover={{
            transform: "translateY(-4px)",
            boxShadow: "0 8px 25px rgba(59, 130, 246, 0.25)",
            borderColor: "blue.300"
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <VStack spacing={3}>
            <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
              League
            </Text>
            <Text fontSize="lg" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif" textAlign="center">
              {match.league?.name || 'Unknown League'}
            </Text>
            <Text fontSize="sm" color="blue.600" fontFamily="DIN, sans-serif">
              {match.league?.country || 'International'}
            </Text>
          </VStack>
        </Box>

        <Box
          bg="gradient-to-br from-green-50 to-green-100"
          p={6}
          borderRadius="xl"
          border="1px solid"
          borderColor="green.200"
          textAlign="center"
          boxShadow="0 4px 12px rgba(34, 197, 94, 0.15)"
          _hover={{
            transform: "translateY(-4px)",
            boxShadow: "0 8px 25px rgba(34, 197, 94, 0.25)",
            borderColor: "green.300"
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <VStack spacing={3}>
            <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
              Home Position
            </Text>
            <Text fontSize="2xl" fontWeight="800" color="green.700" fontFamily="DIN, sans-serif">
              {getTeamPosition(match.homeTeam.id) || 'TBD'}
            </Text>
            <Text fontSize="sm" color="green.600" fontFamily="DIN, sans-serif">
              {match.homeTeam.name}
            </Text>
          </VStack>
        </Box>

        <Box
          bg="gradient-to-br from-orange-50 to-orange-100"
          p={6}
          borderRadius="xl"
          border="1px solid"
          borderColor="orange.200"
          textAlign="center"
          boxShadow="0 4px 12px rgba(251, 146, 60, 0.15)"
          _hover={{
            transform: "translateY(-4px)",
            boxShadow: "0 8px 25px rgba(251, 146, 60, 0.25)",
            borderColor: "orange.300"
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <VStack spacing={3}>
            <Text fontSize="xs" color="orange.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
              Away Position
            </Text>
            <Text fontSize="2xl" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
              {getTeamPosition(match.awayTeam.id) || 'TBD'}
            </Text>
            <Text fontSize="sm" color="orange.600" fontFamily="DIN, sans-serif">
              {match.awayTeam.name}
            </Text>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );

  // Helper function to get team position
  const getTeamPosition = (teamId: string) => {
    if (!leagueStandings || !Array.isArray(leagueStandings)) return null;
    const team = leagueStandings.find((team: any) => team.team?.id?.toString() === teamId || team.id?.toString() === teamId);
    return team ? `${team.rank || team.position}` : null;
  };

  // Render modern league standings
  const renderLeagueStandings = () => {
    if (!leagueStandings || !Array.isArray(leagueStandings)) {
      return (
        <Box
          bg="white"
          p={8}
          borderRadius="2xl"
          border="2px solid"
          borderColor="gray.200"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          mb={8}
        >
          <Flex align="center" mb={8}>
            <Box
              bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
              p={4}
              borderRadius="xl"
              mr={4}
              boxShadow="0 4px 12px rgba(34, 197, 94, 0.3)"
            >
              <Icon as={FiBarChart2} color="white" boxSize={7} />
            </Box>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
                📊 League Standings
              </Text>
              <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
                Current league table and team positions
              </Text>
            </VStack>
          </Flex>

          {isLoadingLeagueData ? (
            <Flex justify="center" py={8}>
              <VStack spacing={4}>
                <Spinner size="xl" color="green.500" thickness="4px" />
                <Text color="gray.600" fontSize="lg" fontWeight="500" fontFamily="DIN, sans-serif">Loading league standings...</Text>
                <Text color="gray.500" fontSize="sm" fontFamily="DIN, sans-serif">Fetching FootyStats data</Text>
              </VStack>
            </Flex>
          ) : (
            <Alert status="info" borderRadius="xl" bg="blue.50" border="1px solid" borderColor="blue.200">
              <AlertIcon color="blue.500" />
              <Box>
                <Text fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">League Standings Not Available</Text>
                <Text fontSize="sm" color="blue.600" fontFamily="DIN, sans-serif">
                  League standings data is not available for this competition. This may be due to the league not being covered by FootyStats or the season being inactive.
                </Text>
              </Box>
            </Alert>
          )}
        </Box>
      );
    }

    // Highlight the teams playing in this match
    const highlightTeam = (teamId: string) => {
      return teamId === match.homeTeam.id || teamId === match.awayTeam.id;
    };

    return (
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        border="2px solid"
        borderColor="green.200"
        boxShadow="0 8px 25px rgba(34, 197, 94, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        mb={8}
        _hover={{
          boxShadow: "0 12px 35px rgba(34, 197, 94, 0.25), 0 8px 15px -3px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-4px)",
          borderColor: "green.300"
        }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        <Flex align="center" mb={8}>
          <Box
            bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
            p={4}
            borderRadius="xl"
            mr={4}
            boxShadow="0 4px 12px rgba(34, 197, 94, 0.3)"
          >
            <Icon as={FiBarChart2} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              📊 League Standings
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Current league table • {leagueStandings.length} teams
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              Live Data
            </Badge>
          </VStack>
        </Flex>

        <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.200">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th fontFamily="DIN, sans-serif" color="gray.700" fontWeight="700">Pos</Th>
                <Th fontFamily="DIN, sans-serif" color="gray.700" fontWeight="700">Team</Th>
                <Th isNumeric fontFamily="DIN, sans-serif" color="gray.700" fontWeight="700">P</Th>
                <Th isNumeric fontFamily="DIN, sans-serif" color="gray.700" fontWeight="700">W</Th>
                <Th isNumeric fontFamily="DIN, sans-serif" color="gray.700" fontWeight="700">D</Th>
                <Th isNumeric fontFamily="DIN, sans-serif" color="gray.700" fontWeight="700">L</Th>
                <Th isNumeric fontFamily="DIN, sans-serif" color="gray.700" fontWeight="700">GF</Th>
                <Th isNumeric fontFamily="DIN, sans-serif" color="gray.700" fontWeight="700">GA</Th>
                <Th isNumeric fontFamily="DIN, sans-serif" color="gray.700" fontWeight="700">GD</Th>
                <Th isNumeric fontFamily="DIN, sans-serif" color="gray.700" fontWeight="700">Pts</Th>
              </Tr>
            </Thead>
            <Tbody>
              {leagueStandings.slice(0, 20).map((team: any, index: number) => (
                <Tr
                  key={team.team?.id || index}
                  bg={highlightTeam(team.team?.id?.toString()) ? 'green.50' : 'transparent'}
                  fontWeight={highlightTeam(team.team?.id?.toString()) ? 'bold' : 'normal'}
                  borderLeft={highlightTeam(team.team?.id?.toString()) ? '4px solid' : 'none'}
                  borderLeftColor="green.400"
                  _hover={{ bg: 'gray.50' }}
                  transition="all 0.2s"
                >
                  <Td fontFamily="DIN, sans-serif" fontWeight="700" color="gray.800">
                    {team.rank || team.position || index + 1}
                  </Td>
                  <Td>
                    <Flex align="center">
                      <Avatar
                        size="sm"
                        src={
                          team.team?.logo ||
                          team.logo ||
                          `https://cdn.footystats.org/img/${team.team?.name || team.name}.png` ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent((team.team?.name || team.name).substring(0, 2))}&background=22C55E&color=ffffff&bold=true&size=128`
                        }
                        name={team.team?.name || team.name}
                        mr={3}
                        border="1px solid"
                        borderColor="gray.200"
                      />
                      <Text fontSize="sm" fontWeight="600" color="gray.800" fontFamily="DIN, sans-serif" isTruncated maxW="150px">
                        {team.team?.name || team.name}
                      </Text>
                    </Flex>
                  </Td>
                  <Td isNumeric fontFamily="DIN, sans-serif" fontWeight="600" color="gray.700">
                    {team.all?.played || team.played || 0}
                  </Td>
                  <Td isNumeric fontFamily="DIN, sans-serif" fontWeight="600" color="green.600">
                    {team.all?.win || team.win || 0}
                  </Td>
                  <Td isNumeric fontFamily="DIN, sans-serif" fontWeight="600" color="yellow.600">
                    {team.all?.draw || team.draw || 0}
                  </Td>
                  <Td isNumeric fontFamily="DIN, sans-serif" fontWeight="600" color="red.600">
                    {team.all?.lose || team.lose || 0}
                  </Td>
                  <Td isNumeric fontFamily="DIN, sans-serif" fontWeight="600" color="blue.600">
                    {team.all?.goals?.for || team.goalsFor || 0}
                  </Td>
                  <Td isNumeric fontFamily="DIN, sans-serif" fontWeight="600" color="orange.600">
                    {team.all?.goals?.against || team.goalsAgainst || 0}
                  </Td>
                  <Td isNumeric fontFamily="DIN, sans-serif" fontWeight="700" color={(team.goalsDiff || team.goalDifference || 0) >= 0 ? 'green.600' : 'red.600'}>
                    {(team.goalsDiff || team.goalDifference || 0) >= 0 ? '+' : ''}{team.goalsDiff || team.goalDifference || 0}
                  </Td>
                  <Td isNumeric fontFamily="DIN, sans-serif" fontWeight="800" color="gray.800" fontSize="md">
                    {team.points || 0}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    );
  };

  // Render team comparison in league context
  const renderTeamComparison = () => {
    if (!leagueStandings || !Array.isArray(leagueStandings)) return null;

    const homeTeamData = leagueStandings.find((team: any) => team.team?.id?.toString() === match.homeTeam.id || team.id?.toString() === match.homeTeam.id);
    const awayTeamData = leagueStandings.find((team: any) => team.team?.id?.toString() === match.awayTeam.id || team.id?.toString() === match.awayTeam.id);

    if (!homeTeamData || !awayTeamData) return null;

    return (
      <Box
        bg={cardBg}
        p={6}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        mb={6}
      >
        <Flex align="center" mb={4}>
          <Icon as={FiTarget} color={accentBlue} mr={3} />
          <Heading size="md" color={headingColor}>
            Head-to-Head League Comparison
          </Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Home Team League Stats */}
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="bold" color={headingColor}>
              {match.homeTeam.name}
            </Text>
            
            <SimpleGrid columns={2} spacing={3} w="100%">
              <Stat bg={bgColor} p={3} borderRadius="lg" textAlign="center">
                <StatLabel fontSize="xs">Position</StatLabel>
                <StatNumber fontSize="lg" color={accentGreen}>
                  {homeTeamData.rank}
                </StatNumber>
              </Stat>

              <Stat bg={bgColor} p={3} borderRadius="lg" textAlign="center">
                <StatLabel fontSize="xs">Points</StatLabel>
                <StatNumber fontSize="lg" color="blue.500">
                  {homeTeamData.points}
                </StatNumber>
              </Stat>

              <Stat bg={bgColor} p={3} borderRadius="lg" textAlign="center">
                <StatLabel fontSize="xs">Form</StatLabel>
                <StatNumber fontSize="lg" color="purple.500">
                  {homeTeamData.form || 'N/A'}
                </StatNumber>
              </Stat>

              <Stat bg={bgColor} p={3} borderRadius="lg" textAlign="center">
                <StatLabel fontSize="xs">Goal Diff</StatLabel>
                <StatNumber fontSize="lg" color={homeTeamData.goalsDiff >= 0 ? 'green.500' : 'red.500'}>
                  {homeTeamData.goalsDiff >= 0 ? '+' : ''}{homeTeamData.goalsDiff}
                </StatNumber>
              </Stat>
            </SimpleGrid>
          </VStack>

          {/* Away Team League Stats */}
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="bold" color={headingColor}>
              {match.awayTeam.name}
            </Text>
            
            <SimpleGrid columns={2} spacing={3} w="100%">
              <Stat bg={bgColor} p={3} borderRadius="lg" textAlign="center">
                <StatLabel fontSize="xs">Position</StatLabel>
                <StatNumber fontSize="lg" color={accentGreen}>
                  {awayTeamData.rank}
                </StatNumber>
              </Stat>

              <Stat bg={bgColor} p={3} borderRadius="lg" textAlign="center">
                <StatLabel fontSize="xs">Points</StatLabel>
                <StatNumber fontSize="lg" color="blue.500">
                  {awayTeamData.points}
                </StatNumber>
              </Stat>

              <Stat bg={bgColor} p={3} borderRadius="lg" textAlign="center">
                <StatLabel fontSize="xs">Form</StatLabel>
                <StatNumber fontSize="lg" color="purple.500">
                  {awayTeamData.form || 'N/A'}
                </StatNumber>
              </Stat>

              <Stat bg={bgColor} p={3} borderRadius="lg" textAlign="center">
                <StatLabel fontSize="xs">Goal Diff</StatLabel>
                <StatNumber fontSize="lg" color={awayTeamData.goalsDiff >= 0 ? 'green.500' : 'red.500'}>
                  {awayTeamData.goalsDiff >= 0 ? '+' : ''}{awayTeamData.goalsDiff}
                </StatNumber>
              </Stat>
            </SimpleGrid>
          </VStack>
        </SimpleGrid>
      </Box>
    );
  };

  return (
    <VStack spacing={8} align="stretch" fontFamily="DIN, sans-serif">
      {renderGameCountSelector()}
      {renderLeagueOverview()}
      {renderTeamComparison()}
      {renderLeagueStandings()}
    </VStack>
  );
};

export default LeagueInfoTabFooty;
