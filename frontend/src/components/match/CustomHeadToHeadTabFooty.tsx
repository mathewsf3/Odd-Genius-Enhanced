import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Button,
  SimpleGrid,
  Progress,
  Icon,
  Flex,
  Alert,
  AlertIcon,
  Spinner,
  Avatar
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiTarget,
  FiBarChart2,
  FiRefreshCw,
  FiAlertTriangle
} from 'react-icons/fi';

interface CustomHeadToHeadTabFootyProps {
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
    h2h?: {
      total_matches?: number;
      home_wins?: number;
      away_wins?: number;
      draws?: number;
      home_win_percentage?: number;
      away_win_percentage?: number;
      draw_percentage?: number;
      over25_percentage?: number;
      btts_percentage?: number;
      avg_goals_home?: number;
      avg_goals_away?: number;
      recent_matches?: Array<{
        date: string;
        home_team: string;
        away_team: string;
        score_home: number;
        score_away: number;
        match_id?: string;
      }>;
    };
    trends?: {
      team_a?: string[];
      team_b?: string[];
    };
    league?: {
      id?: string;
      name?: string;
    };
  };
  gameCount: number;
  onGameCountChange: (count: number) => void;
}

const CustomHeadToHeadTabFooty: React.FC<CustomHeadToHeadTabFootyProps> = ({
  match,
  gameCount,
  onGameCountChange
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [homeTeamStats, setHomeTeamStats] = useState<any>(null);
  const [awayTeamStats, setAwayTeamStats] = useState<any>(null);
  const [homeTeamLastX, setHomeTeamLastX] = useState<any>(null);
  const [awayTeamLastX, setAwayTeamLastX] = useState<any>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [filteredH2HMatches, setFilteredH2HMatches] = useState<any[]>([]);
  const [isLoadingTeamStats, setIsLoadingTeamStats] = useState(false);

  // Modern white and green color scheme
  const bgColor = 'white';
  const cardBg = 'gray.50';
  const borderColor = 'gray.200';
  const textColor = 'gray.600';
  const headingColor = 'gray.900';

  // Fetch enhanced team statistics and match data
  const fetchTeamStats = async () => {
    if (!match.homeTeam.id || !match.awayTeam.id || !match.id) return;

    setIsLoadingTeamStats(true);

    console.log('🔍 Team IDs being used for FootyStats API:');
    console.log('🏠 Home Team ID:', match.homeTeam.id);
    console.log('✈️ Away Team ID:', match.awayTeam.id);
    console.log('🆔 Match ID:', match.id);
    console.log('🔍 Full match object:', match);
    console.log('🔍 Home Team Object:', match.homeTeam);
    console.log('🔍 Away Team Object:', match.awayTeam);

    try {
      const [homeStats, awayStats, homeLastX, awayLastX, matchDetails] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.homeTeam.id}?include_stats=true`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.awayTeam.id}?include_stats=true`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.homeTeam.id}/lastx`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.awayTeam.id}/lastx`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/match/${match.id}`)
      ]);

      if (homeStats.ok) {
        const homeData = await homeStats.json();
        console.log('🏠 Home Team FootyStats Full Response:', homeData);
        console.log('🏠 Home Team Success Flag:', homeData.success);
        console.log('🏠 Home Team Data Object:', homeData.data);
        console.log('🏠 Home Team Data Success:', homeData.data?.success);
        console.log('🏠 Home Team Data Array:', homeData.data?.data);
        console.log('🏠 Home Team First Element:', homeData.data?.data?.[0]);
        console.log('🏠 Home Team Stats Object:', homeData.data?.data?.[0]?.stats);
        
        if (homeData.success && homeData.data?.success) {
          setHomeTeamStats(homeData.data);
          console.log('✅ Home team stats set successfully');
        } else {
          console.log('❌ Home team stats failed - no success flag');
        }
      } else {
        console.log('❌ Home team API request failed:', homeStats.status);
      }

      if (awayStats.ok) {
        const awayData = await awayStats.json();
        console.log('✈️ Away Team FootyStats Full Response:', awayData);
        console.log('✈️ Away Team Success Flag:', awayData.success);
        console.log('✈️ Away Team Data Object:', awayData.data);
        console.log('✈️ Away Team Data Success:', awayData.data?.success);
        console.log('✈️ Away Team Data Array:', awayData.data?.data);
        console.log('✈️ Away Team First Element:', awayData.data?.data?.[0]);
        console.log('✈️ Away Team Stats Object:', awayData.data?.data?.[0]?.stats);
        
        if (awayData.success && awayData.data?.success) {
          setAwayTeamStats(awayData.data);
          console.log('✅ Away team stats set successfully');
        } else {
          console.log('❌ Away team stats failed - no success flag');
        }
      } else {
        console.log('❌ Away team API request failed:', awayStats.status);
      }

      if (homeLastX.ok) {
        const homeLastXData = await homeLastX.json();
        console.log('🏠 Home Team LastX Response:', homeLastXData);
        console.log('🏠 Home Team LastX Data:', homeLastXData.data);
        if (homeLastXData.success) setHomeTeamLastX(homeLastXData.data);
      }

      if (awayLastX.ok) {
        const awayLastXData = await awayLastX.json();
        console.log('✈️ Away Team LastX Response:', awayLastXData);
        console.log('✈️ Away Team LastX Data:', awayLastXData.data);
        if (awayLastXData.success) setAwayTeamLastX(awayLastXData.data);
      }

      if (matchDetails.ok) {
        const matchDetailsData = await matchDetails.json();
        if (matchDetailsData.success) setMatchData(matchDetailsData.data);
      }

    } catch (error) {
      console.error('Error fetching team stats:', error);
    } finally {
      setIsLoadingTeamStats(false);
    }
  };

  // Load team stats on component mount
  React.useEffect(() => {
    fetchTeamStats();
  }, [match.homeTeam.id, match.awayTeam.id]);

  // Filter H2H matches based on gameCount and recalculate statistics
  React.useEffect(() => {
    if (matchData?.h2h?.previous_matches_ids) {
      const filtered = matchData.h2h.previous_matches_ids.slice(0, gameCount);
      setFilteredH2HMatches(filtered);

      // Recalculate H2H statistics for filtered matches using real data only
      if (filtered.length > 0) {
        const homeTeamId = typeof match.homeTeam.id === 'string' ? parseInt(match.homeTeam.id.replace('team-', '')) : parseInt(match.homeTeam.id);
        const awayTeamId = typeof match.awayTeam.id === 'string' ? parseInt(match.awayTeam.id.replace('team-', '')) : parseInt(match.awayTeam.id);

        let homeWins = 0;
        let awayWins = 0;
        let draws = 0;
        let totalGoals = 0;
        let over25 = 0;
        let over35 = 0;
        let btts = 0;

        filtered.forEach((match: any) => {
          const isHomeTeamA = match.team_a_id === homeTeamId;
          const homeGoals = isHomeTeamA ? match.team_a_goals : match.team_b_goals;
          const awayGoals = isHomeTeamA ? match.team_b_goals : match.team_a_goals;

          totalGoals += homeGoals + awayGoals;

          if (homeGoals > awayGoals) homeWins++;
          else if (awayGoals > homeGoals) awayWins++;
          else draws++;

          if (homeGoals + awayGoals > 2.5) over25++;
          if (homeGoals + awayGoals > 3.5) over35++;
          if (homeGoals > 0 && awayGoals > 0) btts++;
        });

        // Update the match data with recalculated statistics
        const updatedMatchData = {
          ...matchData,
          h2h: {
            ...matchData.h2h,
            previous_matches_results: {
              totalMatches: filtered.length,
              team_a_wins: homeWins,
              team_b_wins: awayWins,
              draw: draws,
              team_a_win_percent: (homeWins / filtered.length) * 100,
              team_b_win_percent: (awayWins / filtered.length) * 100
            },
            betting_stats: {
              avg_goals: totalGoals / filtered.length,
              total_goals: totalGoals,
              over25: over25,
              over25Percentage: (over25 / filtered.length) * 100,
              btts: btts,
              bttsPercentage: (btts / filtered.length) * 100,
              over35: over35,
              over35Percentage: (over35 / filtered.length) * 100
            }
          }
        };

        setMatchData(updatedMatchData);
      }
    }
  }, [matchData?.h2h?.previous_matches_ids, gameCount, match.homeTeam.id, match.awayTeam.id, match.homeTeam.name, match.awayTeam.name]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTeamStats();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Modern header with gradient green styling
  const renderGameCountSelector = () => (
    <Box
      bg="white"
      p={8}
      borderRadius="2xl"
      boxShadow="0 8px 25px rgba(34, 197, 94, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      border="2px solid"
      borderColor="green.200"
      mb={8}
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
            <Icon as={FiBarChart2} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900">
              ⚔️ Head-to-Head Analysis
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="500">
              Comprehensive team comparison and historical data
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={4}>
          <VStack spacing={3} align="end">
            <Text fontSize="sm" color="gray.600" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
              📊 Show Last Matches
            </Text>
            <HStack spacing={3}>
              {[5, 10, 20].map((count) => (
                <Button
                  key={count}
                  size="lg"
                  variant={gameCount === count ? "solid" : "outline"}
                  bg={gameCount === count ? "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" : "transparent"}
                  color={gameCount === count ? "white" : "green.600"}
                  borderColor="green.300"
                  borderWidth="2px"
                  onClick={() => onGameCountChange(count)}
                  fontSize="md"
                  fontWeight="700"
                  borderRadius="xl"
                  px={6}
                  py={3}
                  minW="60px"
                  boxShadow={gameCount === count ? "0 4px 12px rgba(34, 197, 94, 0.4)" : "none"}
                  _hover={{
                    transform: "translateY(-3px)",
                    boxShadow: gameCount === count
                      ? "0 8px 25px rgba(34, 197, 94, 0.5)"
                      : "0 4px 12px rgba(34, 197, 94, 0.3)",
                    bg: gameCount === count
                      ? "linear-gradient(135deg, #16A34A 0%, #15803D 100%)"
                      : "green.50",
                    borderColor: "green.400"
                  }}
                  _active={{
                    transform: "translateY(-1px)"
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  {count}
                </Button>
              ))}
            </HStack>
          </VStack>

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
          >
            🔄 Refresh
          </Button>
        </HStack>
      </Flex>
    </Box>
  );

  // Render H2H summary stats with filtered data
  const renderH2HSummary = () => {
    // Use FootyStats H2H data from match details
    const h2h = matchData?.h2h;

    if (!h2h || !h2h.previous_matches_results?.totalMatches || !filteredH2HMatches.length) {
      return (
        <Alert status="info" borderRadius="lg" mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">No H2H Data Available</Text>
            <Text fontSize="sm">
              {isLoadingTeamStats ? 'Loading head-to-head statistics...' : 'Head-to-head statistics are not available for this match from FootyStats.'}
            </Text>
          </Box>
        </Alert>
      );
    }

    const results = h2h.previous_matches_results;
    const bettingStats = h2h.betting_stats;

    return (
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        mb={8}
        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        _hover={{
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)"
        }}
        transition="all 0.3s"
      >
        <Flex align="center" mb={8}>
          <Box
            bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
            p={3}
            borderRadius="xl"
            mr={4}
          >
            <Icon as={FiBarChart2} color="white" boxSize={6} />
          </Box>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="gray.900" fontWeight="700">
              📊 H2H Summary
            </Heading>
            <Text color="gray.500" fontSize="sm" fontWeight="500">
              Last {gameCount} of {results.totalMatches} matches • FootyStats Data
            </Text>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={8}>
          {/* Home Team Stats */}
          <Box
            bg="gradient-to-br from-green-50 to-green-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="green.200"
            textAlign="center"
            _hover={{
              borderColor: "green.300",
              transform: "translateY(-4px)",
              boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)"
            }}
            transition="all 0.3s"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg="green.100"
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.homeTeam.logo} name={match.homeTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="green.800">
                    {match.homeTeam.name}
                  </Text>
                  <Badge colorScheme="green" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                    HOME TEAM
                  </Badge>
                </VStack>
              </HStack>

              <VStack spacing={3}>
                <Text fontSize="4xl" fontWeight="800" color="green.700">
                  {results.team_a_wins || 0}
                </Text>
                <Text fontSize="sm" color="green.600" fontWeight="600" textTransform="uppercase">
                  Wins ({Number(results.team_a_win_percent || 0).toFixed(1)}%)
                </Text>
                <Box w="100%" bg="green.200" borderRadius="full" h="3">
                  <Box
                    w={`${Number(results.team_a_win_percent || 0).toFixed(1)}%`}
                    bg="green.500"
                    h="100%"
                    borderRadius="full"
                    transition="width 0.8s ease"
                  />
                </Box>
              </VStack>
            </VStack>
          </Box>

          {/* Draws */}
          <Box
            bg="gradient-to-br from-orange-50 to-orange-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="orange.200"
            textAlign="center"
            _hover={{
              borderColor: "orange.300",
              transform: "translateY(-4px)",
              boxShadow: "0 10px 25px rgba(251, 146, 60, 0.2)"
            }}
            transition="all 0.3s"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg="orange.100"
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="800" color="orange.700">
                  🤝
                </Text>
                <Text fontSize="lg" fontWeight="700" color="orange.800">
                  Draws
                </Text>
                <Badge colorScheme="orange" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                  EQUAL RESULTS
                </Badge>
              </VStack>

              <VStack spacing={3}>
                <Text fontSize="4xl" fontWeight="800" color="orange.700">
                  {results.draw || 0}
                </Text>
                <Text fontSize="sm" color="orange.600" fontWeight="600" textTransform="uppercase">
                  {((results.draw || 0) / (results.totalMatches || 1) * 100).toFixed(1)}% of matches
                </Text>
                <Box w="100%" bg="orange.200" borderRadius="full" h="3">
                  <Box
                    w={`${(results.draw || 0) / (results.totalMatches || 1) * 100}%`}
                    bg="orange.500"
                    h="100%"
                    borderRadius="full"
                    transition="width 0.8s ease"
                  />
                </Box>
              </VStack>
            </VStack>
          </Box>

          {/* Away Team Stats */}
          <Box
            bg="gradient-to-br from-blue-50 to-blue-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="blue.200"
            textAlign="center"
            _hover={{
              borderColor: "blue.300",
              transform: "translateY(-4px)",
              boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)"
            }}
            transition="all 0.3s"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg="blue.100"
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.awayTeam.logo} name={match.awayTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="blue.800">
                    {match.awayTeam.name}
                  </Text>
                  <Badge colorScheme="blue" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                    AWAY TEAM
                  </Badge>
                </VStack>
              </HStack>

              <VStack spacing={3}>
                <Text fontSize="4xl" fontWeight="800" color="blue.700">
                  {results.team_b_wins || 0}
                </Text>
                <Text fontSize="sm" color="blue.600" fontWeight="600" textTransform="uppercase">
                  Wins ({Number(results.team_b_win_percent || 0).toFixed(1)}%)
                </Text>
                <Box w="100%" bg="blue.200" borderRadius="full" h="3">
                  <Box
                    w={`${Number(results.team_b_win_percent || 0).toFixed(1)}%`}
                    bg="blue.500"
                    h="100%"
                    borderRadius="full"
                    transition="width 0.8s ease"
                  />
                </Box>
              </VStack>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Modern Additional Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Box
            bg="gradient-to-br from-green-50 to-green-100"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="green.200"
            textAlign="center"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            <VStack spacing={3}>
              <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">
                Average Goals
              </Text>
              <Text fontSize="2xl" fontWeight="800" color="green.700">
                {Number(bettingStats.avg_goals || 0).toFixed(1)}
              </Text>
              <Text fontSize="xs" color="green.500" fontWeight="500">
                {bettingStats.total_goals || 0} total goals
              </Text>
              <Progress
                value={(bettingStats.avg_goals || 0) * 20}
                colorScheme="green"
                size="sm"
                borderRadius="full"
                w="100%"
              />
            </VStack>
          </Box>

          <Box
            bg="gradient-to-br from-orange-50 to-orange-100"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="orange.200"
            textAlign="center"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            <VStack spacing={3}>
              <Text fontSize="xs" color="orange.600" fontWeight="600" textTransform="uppercase">
                Over 2.5 Goals
              </Text>
              <Text fontSize="2xl" fontWeight="800" color="orange.700">
                {Number(bettingStats.over25Percentage || 0).toFixed(1)}%
              </Text>
              <Text fontSize="xs" color="orange.500" fontWeight="500">
                {bettingStats.over25 || 0} of {results.totalMatches} games
              </Text>
              <Progress
                value={bettingStats.over25Percentage || 0}
                colorScheme="orange"
                size="sm"
                borderRadius="full"
                w="100%"
              />
            </VStack>
          </Box>

          <Box
            bg="gradient-to-br from-purple-50 to-purple-100"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="purple.200"
            textAlign="center"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            <VStack spacing={3}>
              <Text fontSize="xs" color="purple.600" fontWeight="600" textTransform="uppercase">
                Both Teams Score
              </Text>
              <Text fontSize="2xl" fontWeight="800" color="purple.700">
                {Number(bettingStats.bttsPercentage || 0).toFixed(1)}%
              </Text>
              <Text fontSize="xs" color="purple.500" fontWeight="500">
                {bettingStats.btts || 0} of {results.totalMatches} games
              </Text>
              <Progress
                value={bettingStats.bttsPercentage || 0}
                colorScheme="purple"
                size="sm"
                borderRadius="full"
                w="100%"
              />
            </VStack>
          </Box>

          <Box
            bg="gradient-to-br from-red-50 to-red-100"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="red.200"
            textAlign="center"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            <VStack spacing={3}>
              <Text fontSize="xs" color="red.600" fontWeight="600" textTransform="uppercase">
                Over 3.5 Goals
              </Text>
              <Text fontSize="2xl" fontWeight="800" color="red.700">
                {Number(bettingStats.over35Percentage || 0).toFixed(1)}%
              </Text>
              <Text fontSize="xs" color="red.500" fontWeight="500">
                {bettingStats.over35 || 0} of {results.totalMatches} games
              </Text>
              <Progress
                value={bettingStats.over35Percentage || 0}
                colorScheme="red"
                size="sm"
                borderRadius="full"
                w="100%"
              />
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    );
  };

  // Render recent H2H matches from FootyStats
  const renderRecentMatches = () => {
    if (!filteredH2HMatches || filteredH2HMatches.length === 0) {
      return null;
    }

    return (
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        mb={8}
        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        _hover={{
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)"
        }}
        transition="all 0.3s"
      >
        <Flex align="center" mb={8}>
          <Box
            bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
            p={3}
            borderRadius="xl"
            mr={4}
          >
            <Icon as={FiTarget} color="white" boxSize={6} />
          </Box>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="gray.900" fontWeight="700">
              ⚔️ Recent H2H Matches
            </Heading>
            <Text color="gray.500" fontSize="sm" fontWeight="500">
              Historical head-to-head encounters • FootyStats Data
            </Text>
          </VStack>
        </Flex>

        <VStack spacing={4}>
          {filteredH2HMatches.map((recentMatch: any, index: number) => {
            // Determine which team is home/away based on team IDs
            const isTeamAHome = recentMatch.team_a_id === parseInt(match.homeTeam.id);
            const homeTeamGoals = isTeamAHome ? recentMatch.team_a_goals : recentMatch.team_b_goals;
            const awayTeamGoals = isTeamAHome ? recentMatch.team_b_goals : recentMatch.team_a_goals;
            const homeWin = homeTeamGoals > awayTeamGoals;
            const awayWin = awayTeamGoals > homeTeamGoals;
            const draw = homeTeamGoals === awayTeamGoals;

            return (
              <Box
                key={index}
                bg="gray.50"
                p={6}
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.200"
                w="100%"
                _hover={{
                  bg: "white",
                  transform: 'translateY(-4px)',
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                  borderColor: "gray.300"
                }}
                transition="all 0.3s"
              >
                <Flex justify="space-between" align="center">
                  {/* Date */}
                  <VStack spacing={2} align="start" minW="100px">
                    <Text fontSize="sm" color="gray.700" fontWeight="600">
                      {new Date(recentMatch.date_unix * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                    <Badge
                      colorScheme={homeWin ? 'green' : awayWin ? 'blue' : 'orange'}
                      variant="solid"
                      size="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="700"
                    >
                      {homeWin ? '🏠 HOME WIN' : awayWin ? '✈️ AWAY WIN' : '🤝 DRAW'}
                    </Badge>
                  </VStack>

                  {/* Teams and Score */}
                  <Flex align="center" flex="1" justify="center">
                    {/* Home Team */}
                    <Flex align="center" flex="1" justify="flex-end" mr={4}>
                      <VStack spacing={1} align="end" mr={3}>
                        <Text fontSize="sm" fontWeight="bold" color={headingColor} textAlign="right">
                          {match.homeTeam.name}
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          Home
                        </Text>
                      </VStack>
                      <Avatar size="sm" src={match.homeTeam.logo} name={match.homeTeam.name} />
                    </Flex>

                    {/* Score */}
                    <Box
                      bg="white"
                      px={6}
                      py={4}
                      borderRadius="xl"
                      border="2px solid"
                      borderColor={homeWin ? 'green.300' : awayWin ? 'blue.300' : 'orange.300'}
                      mx={6}
                      boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                    >
                      <Text fontSize="2xl" fontWeight="800" color={homeWin ? 'green.700' : awayWin ? 'blue.700' : 'orange.700'} textAlign="center">
                        {homeTeamGoals} - {awayTeamGoals}
                      </Text>
                    </Box>

                    {/* Away Team */}
                    <Flex align="center" flex="1" justify="flex-start" ml={4}>
                      <Avatar size="sm" src={match.awayTeam.logo} name={match.awayTeam.name} />
                      <VStack spacing={1} align="start" ml={3}>
                        <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                          {match.awayTeam.name}
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          Away
                        </Text>
                      </VStack>
                    </Flex>
                  </Flex>

                  {/* Match Stats */}
                  <VStack spacing={2} align="end" minW="120px">
                    <Box bg="white" px={3} py={2} borderRadius="lg" border="1px solid" borderColor="gray.200">
                      <Text fontSize="sm" color="gray.700" fontWeight="600" textAlign="center">
                        ⚽ {homeTeamGoals + awayTeamGoals} Goals
                      </Text>
                    </Box>
                    <Badge
                      colorScheme={homeTeamGoals + awayTeamGoals > 2.5 ? 'green' : 'red'}
                      variant="solid"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {homeTeamGoals + awayTeamGoals > 2.5 ? '📈 Over 2.5' : '📉 Under 2.5'}
                    </Badge>
                    <Badge
                      colorScheme={homeTeamGoals > 0 && awayTeamGoals > 0 ? 'green' : 'red'}
                      variant="solid"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {homeTeamGoals > 0 && awayTeamGoals > 0 ? '✅ BTTS' : '❌ No BTTS'}
                    </Badge>
                  </VStack>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Box>
    );
  };

  // Render trends from FootyStats
  const renderTrends = () => {
    const trends = matchData?.trends;
    if (!trends) return null;

    return (
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        _hover={{
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)"
        }}
        transition="all 0.3s"
      >
        <Flex align="center" mb={8}>
          <Box
            bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
            p={3}
            borderRadius="xl"
            mr={4}
          >
            <Icon as={FiTrendingUp} color="white" boxSize={6} />
          </Box>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="gray.900" fontWeight="700">
              📈 Team Trends
            </Heading>
            <Text color="gray.500" fontSize="sm" fontWeight="500">
              Performance patterns and statistical insights
            </Text>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {trends.home && (
            <Box
              bg="gradient-to-br from-green-50 to-green-100"
              p={6}
              borderRadius="xl"
              border="1px solid"
              borderColor="green.200"
              _hover={{
                borderColor: "green.300",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(34, 197, 94, 0.15)"
              }}
              transition="all 0.3s"
            >
              <HStack spacing={3} mb={4}>
                <Avatar size="md" src={match.homeTeam.logo} name={match.homeTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="green.800">
                    {match.homeTeam.name}
                  </Text>
                  <Badge colorScheme="green" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                    HOME TRENDS
                  </Badge>
                </VStack>
              </HStack>
              <VStack align="start" spacing={3}>
                {trends.home.map((trend: any, index: number) => (
                  <Box key={index} bg="white" p={3} borderRadius="lg" w="100%" border="1px solid" borderColor="green.200">
                    <Text fontSize="sm" color="green.700" fontWeight="500">
                      📊 {Array.isArray(trend) ? trend[1] : trend}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {trends.away && (
            <Box
              bg="gradient-to-br from-blue-50 to-blue-100"
              p={6}
              borderRadius="xl"
              border="1px solid"
              borderColor="blue.200"
              _hover={{
                borderColor: "blue.300",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(59, 130, 246, 0.15)"
              }}
              transition="all 0.3s"
            >
              <HStack spacing={3} mb={4}>
                <Avatar size="md" src={match.awayTeam.logo} name={match.awayTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="blue.800">
                    {match.awayTeam.name}
                  </Text>
                  <Badge colorScheme="blue" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                    AWAY TRENDS
                  </Badge>
                </VStack>
              </HStack>
              <VStack align="start" spacing={3}>
                {trends.away.map((trend: any, index: number) => (
                  <Box key={index} bg="white" p={3} borderRadius="lg" w="100%" border="1px solid" borderColor="blue.200">
                    <Text fontSize="sm" color="blue.700" fontWeight="500">
                      📊 {Array.isArray(trend) ? trend[1] : trend}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </SimpleGrid>
      </Box>
    );
  };

  // Render enhanced team comparison with TRUE FootyStats data only
  const renderEnhancedTeamComparison = () => {
    let homeStats, awayStats;

    // Always use REAL FootyStats data
    // FootyStats API returns: { success: true, data: { success: true, data: [team_stats] } }
    homeStats = homeTeamStats?.data?.data?.[0]?.stats;
    awayStats = awayTeamStats?.data?.data?.[0]?.stats;

    console.log('🔍 Enhanced Team Comparison Data Check:');
    console.log('🏠 homeTeamStats full object:', homeTeamStats);
    console.log('🏠 homeStats extracted:', homeStats);
    console.log('✈️ awayTeamStats full object:', awayTeamStats);
    console.log('✈️ awayStats extracted:', awayStats);

    // Debug: Check each level of the data structure
    if (homeTeamStats) {
      console.log('🏠 homeTeamStats.data:', homeTeamStats.data);
      if (homeTeamStats.data) {
        console.log('🏠 homeTeamStats.data.data:', homeTeamStats.data.data);
        if (homeTeamStats.data.data && homeTeamStats.data.data[0]) {
          console.log('🏠 homeTeamStats.data.data[0]:', homeTeamStats.data.data[0]);
          console.log('🏠 homeTeamStats.data.data[0].stats:', homeTeamStats.data.data[0].stats);
        }
      }
    }

    // If no real FootyStats data available, show loading or error state
    if (!homeStats || !awayStats) {
      if (isLoadingTeamStats) {
        return (
          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            mb={8}
            textAlign="center"
          >
            <VStack spacing={4}>
              <Spinner size="xl" color="green.500" thickness="4px" />
              <Text fontSize="lg" fontWeight="600" color="gray.700">
                🔄 Loading Team Statistics...
              </Text>
              <Text fontSize="sm" color="gray.500">
                Fetching real FootyStats data for {match.homeTeam.name} vs {match.awayTeam.name}
              </Text>
            </VStack>
          </Box>
        );
      }

      return (
        <Box
          bg="white"
          p={8}
          borderRadius="2xl"
          border="2px solid"
          borderColor="yellow.200"
          boxShadow="0 8px 25px rgba(251, 191, 36, 0.15)"
          mb={8}
        >
          <Flex align="center" mb={6}>
            <Box
              bg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
              p={4}
              borderRadius="xl"
              mr={4}
            >
              <Icon as={FiAlertTriangle} color="white" boxSize={7} />
            </Box>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="700" color="gray.900">
                📊 Loading Team Data...
              </Text>
              <Text color="gray.500" fontSize="sm" fontWeight="500">
                FootyStats API data is being fetched for {match.homeTeam.name} vs {match.awayTeam.name}
              </Text>
            </VStack>
          </Flex>

          <Alert status="info" borderRadius="xl">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold" color="blue.800">FootyStats Data Loading</Text>
              <Text fontSize="sm" color="blue.600">
                Team statistics are being loaded from FootyStats API. This may take a moment.
              </Text>
            </Box>
          </Alert>
        </Box>
      );
    }

    return (
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        mb={8}
        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        _hover={{
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)"
        }}
        transition="all 0.3s"
      >
        <Flex align="center" mb={8}>
          <Box
            bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
            p={3}
            borderRadius="xl"
            mr={4}
          >
            <Icon as={FiTarget} color="white" boxSize={6} />
          </Box>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="gray.900" fontWeight="700">
              🏆 Enhanced Team Comparison
            </Heading>
            <Text color="gray.500" fontSize="sm" fontWeight="500">
              Season Statistics • Comprehensive Analysis
            </Text>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {/* Home Team Column */}
          <Box
            bg="gradient-to-br from-green-50 to-green-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="green.200"
            position="relative"
            overflow="hidden"
            _hover={{
              borderColor: "green.300",
              transform: "translateY(-4px)",
              boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)"
            }}
            transition="all 0.3s"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg="green.100"
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <HStack spacing={4} justify="center">
                <Avatar size="xl" src={match.homeTeam.logo} name={match.homeTeam.name} />
                <VStack align="start" spacing={1}>
                  <Text fontSize="xl" fontWeight="700" color="green.800">
                    {match.homeTeam.name}
                  </Text>
                  <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full">
                    HOME TEAM STATS
                  </Badge>
                </VStack>
              </HStack>

              <SimpleGrid columns={2} spacing={4} w="100%">
                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="green.200">
                  <Text fontSize="2xl" fontWeight="800" color="green.700">
                    {(homeStats.seasonScoredAVG_overall || 0).toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">Goals/Game</Text>
                  <Text fontSize="xs" color="green.500" mt={1}>
                    {homeStats.seasonGoalsFor_overall || 0} in {homeStats.seasonMatchesPlayed_overall || 0} games
                  </Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="green.200">
                  <Text fontSize="2xl" fontWeight="800" color="green.700">
                    {(homeStats.seasonConcededAVG_overall || 0).toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">Conceded/Game</Text>
                  <Text fontSize="xs" color="green.500" mt={1}>
                    {homeStats.seasonGoalsAgainst_overall || 0} total
                  </Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="green.200">
                  <Text fontSize="2xl" fontWeight="800" color="green.700">
                    {Math.round((homeStats.seasonWins_overall / homeStats.seasonMatchesPlayed_overall) * 100) || 0}%
                  </Text>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">Win Rate</Text>
                  <Text fontSize="xs" color="green.500" mt={1}>
                    {homeStats.seasonWins_overall || 0}W {homeStats.seasonDraws_overall || 0}D {homeStats.seasonLosses_overall || 0}L
                  </Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="green.200">
                  <Text fontSize="2xl" fontWeight="800" color="green.700">
                    {homeStats.seasonBTTSPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">BTTS Rate</Text>
                  <Text fontSize="xs" color="green.500" mt={1}>
                    {homeStats.seasonBTTS_overall || 0} of {homeStats.seasonMatchesPlayed_overall || 0}
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* VS Column */}
          <VStack spacing={6} justify="center">
            <Box
              bg="white"
              p={8}
              borderRadius="2xl"
              textAlign="center"
              border="2px solid"
              borderColor="gray.200"
              _hover={{
                borderColor: "gray.300",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)"
              }}
              transition="all 0.3s"
            >
              <VStack spacing={4}>
                <Text fontSize="4xl" fontWeight="bold" color="gray.700" mb={2}>
                  ⚔️
                </Text>
                <Text fontSize="2xl" fontWeight="800" color="gray.800">
                  VS
                </Text>
                <Text fontSize="sm" color="gray.600" fontWeight="500">
                  Season Comparison
                </Text>
              </VStack>
            </Box>

            <VStack spacing={4}>
              <Badge colorScheme="green" variant="solid" fontSize="sm" px={4} py={2} borderRadius="full">
                📊 Statistical Analysis
              </Badge>
              <Text fontSize="xs" color="gray.600" textAlign="center" maxW="200px" fontWeight="500">
                Comprehensive season statistics based on {Math.max(homeStats.seasonMatchesPlayed_overall || 0, awayStats.seasonMatchesPlayed_overall || 0)} games played
              </Text>
            </VStack>
          </VStack>

          {/* Away Team Column */}
          <Box
            bg="gradient-to-br from-blue-50 to-blue-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="blue.200"
            position="relative"
            overflow="hidden"
            _hover={{
              borderColor: "blue.300",
              transform: "translateY(-4px)",
              boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)"
            }}
            transition="all 0.3s"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg="blue.100"
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <HStack spacing={4} justify="center">
                <Avatar size="xl" src={match.awayTeam.logo} name={match.awayTeam.name} />
                <VStack align="start" spacing={1}>
                  <Text fontSize="xl" fontWeight="700" color="blue.800">
                    {match.awayTeam.name}
                  </Text>
                  <Badge colorScheme="blue" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full">
                    AWAY TEAM STATS
                  </Badge>
                </VStack>
              </HStack>

              <SimpleGrid columns={2} spacing={4} w="100%">
                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="blue.200">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700">
                    {(awayStats.seasonScoredAVG_overall || 0).toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase">Goals/Game</Text>
                  <Text fontSize="xs" color="blue.500" mt={1}>
                    {awayStats.seasonGoalsFor_overall || 0} in {awayStats.seasonMatchesPlayed_overall || 0} games
                  </Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="blue.200">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700">
                    {(awayStats.seasonConcededAVG_overall || 0).toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase">Conceded/Game</Text>
                  <Text fontSize="xs" color="blue.500" mt={1}>
                    {awayStats.seasonGoalsAgainst_overall || 0} total
                  </Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="blue.200">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700">
                    {Math.round((awayStats.seasonWins_overall / awayStats.seasonMatchesPlayed_overall) * 100) || 0}%
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase">Win Rate</Text>
                  <Text fontSize="xs" color="blue.500" mt={1}>
                    {awayStats.seasonWins_overall || 0}W {awayStats.seasonDraws_overall || 0}D {awayStats.seasonLosses_overall || 0}L
                  </Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="blue.200">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700">
                    {awayStats.seasonBTTSPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase">BTTS Rate</Text>
                  <Text fontSize="xs" color="blue.500" mt={1}>
                    {awayStats.seasonBTTS_overall || 0} of {awayStats.seasonMatchesPlayed_overall || 0}
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    );
  };

  // Render enhanced form analysis with TRUE FootyStats data only
  const renderFormAnalysis = () => {
    let homeStats, awayStats;

    // Always use REAL FootyStats data
    // FootyStats API returns: { success: true, data: { success: true, data: [team_stats] } }
    homeStats = homeTeamStats?.data?.data?.[0]?.stats;
    awayStats = awayTeamStats?.data?.data?.[0]?.stats;

    console.log('🔍 Recent Form Analysis Data Check:');
    console.log('🏠 homeStats for form:', homeStats);
    console.log('✈️ awayStats for form:', awayStats);

    // If no real FootyStats data available, show clear message
    if (!homeStats || !awayStats) {
      return (
        <Box
          bg="white"
          p={8}
          borderRadius="2xl"
          border="2px solid"
          borderColor="red.200"
          boxShadow="0 8px 25px rgba(239, 68, 68, 0.15)"
          mb={8}
        >
          <Flex align="center" mb={6}>
            <Box
              bg="linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
              p={4}
              borderRadius="xl"
              mr={4}
            >
              <Icon as={FiAlertTriangle} color="white" boxSize={7} />
            </Box>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="700" color="gray.900">
                ⚠️ No Real FootyStats Data Available
              </Text>
              <Text color="gray.500" fontSize="sm" fontWeight="500">
                Recent Form Analysis requires FootyStats API integration for last {gameCount} matches
              </Text>
            </VStack>
          </Flex>

          <Alert status="warning" borderRadius="xl">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold" color="orange.800">Missing FootyStats Integration</Text>
              <Text fontSize="sm" color="orange.600">
                Form analysis for last {gameCount} matches needs real FootyStats API data.
              </Text>
            </Box>
          </Alert>
        </Box>
      );
    }

    // Use real FootyStats data for form analysis
    const homeLastXData = {
      stats: homeStats,
      form: homeStats.formRun_overall || ''
    };

    const awayLastXData = {
      stats: awayStats,
      form: awayStats.formRun_overall || ''
    };

    // Use the real form strings from FootyStats
    const homeFormString = homeLastXData.form;
    const awayFormString = awayLastXData.form;

    console.log('Home Form String:', homeFormString);
    console.log('Away Form String:', awayFormString);
    console.log('Home Team Data:', homeLastXData);
    console.log('Away Team Data:', awayLastXData);

    return (
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        mb={8}
        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        _hover={{
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)"
        }}
        transition="all 0.3s"
      >
        <Flex align="center" mb={8}>
          <Box
            bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
            p={3}
            borderRadius="xl"
            mr={4}
          >
            <Icon as={FiTrendingUp} color="white" boxSize={6} />
          </Box>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="gray.900" fontWeight="700">
              📈 Recent Form Analysis
            </Heading>
            <Text color="gray.500" fontSize="sm" fontWeight="500">
              Last {gameCount} Matches • Real FootyStats Data
            </Text>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {/* Home Team Form */}
          <Box
            bg="gradient-to-br from-green-50 to-green-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="green.200"
            position="relative"
            overflow="hidden"
            _hover={{
              borderColor: "green.300",
              transform: "translateY(-4px)",
              boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)"
            }}
            transition="all 0.3s"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg="green.100"
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.homeTeam.logo} name={match.homeTeam.name} />
                <VStack spacing={1} align="start">
                  <Text fontSize="xl" fontWeight="700" color="green.800">
                    {match.homeTeam.name}
                  </Text>
                  <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full">
                    RECENT FORM (LAST {gameCount})
                  </Badge>
                </VStack>
              </HStack>

              <HStack spacing={3} justify="center">
                {homeFormString.split('').slice(0, 5).map((result: string, index: number) => (
                  <Box
                    key={index}
                    w="50px"
                    h="50px"
                    borderRadius="full"
                    bg={result.toLowerCase() === 'w' ? 'green.500' :
                        result.toLowerCase() === 'd' ? 'yellow.500' : 'red.500'}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="800"
                    fontSize="lg"
                    border="2px solid white"
                    boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                    _hover={{
                      transform: "scale(1.1)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)"
                    }}
                    transition="all 0.2s"
                  >
                    {result.toUpperCase()}
                  </Box>
                ))}
              </HStack>

              {/* Form Statistics */}
              <SimpleGrid columns={2} spacing={4} w="100%">
                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="green.200">
                  <Text fontSize="2xl" fontWeight="800" color="green.700">
                    {homeLastXData?.stats?.seasonPPG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">Points/Game</Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="green.200">
                  <Text fontSize="2xl" fontWeight="800" color="green.700">
                    {homeLastXData?.stats?.seasonScoredAVG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">Goals/Game</Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="green.200">
                  <Text fontSize="2xl" fontWeight="800" color="green.700">
                    {homeLastXData?.stats?.seasonConcededAVG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">Conceded/Game</Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="green.200">
                  <Text fontSize="2xl" fontWeight="800" color="green.700">
                    {homeLastXData?.stats?.seasonBTTSPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">BTTS Rate</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Away Team Form */}
          <Box
            bg="gradient-to-br from-blue-50 to-blue-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="blue.200"
            position="relative"
            overflow="hidden"
            _hover={{
              borderColor: "blue.300",
              transform: "translateY(-4px)",
              boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)"
            }}
            transition="all 0.3s"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg="blue.100"
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.awayTeam.logo} name={match.awayTeam.name} />
                <VStack spacing={1} align="start">
                  <Text fontSize="xl" fontWeight="700" color="blue.800">
                    {match.awayTeam.name}
                  </Text>
                  <Badge colorScheme="blue" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full">
                    RECENT FORM (LAST {gameCount})
                  </Badge>
                </VStack>
              </HStack>

              <HStack spacing={3} justify="center">
                {awayFormString.split('').slice(0, 5).map((result: string, index: number) => (
                  <Box
                    key={index}
                    w="50px"
                    h="50px"
                    borderRadius="full"
                    bg={result.toLowerCase() === 'w' ? 'green.500' :
                        result.toLowerCase() === 'd' ? 'yellow.500' : 'red.500'}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="800"
                    fontSize="lg"
                    border="2px solid white"
                    boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                    _hover={{
                      transform: "scale(1.1)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)"
                    }}
                    transition="all 0.2s"
                  >
                    {result.toUpperCase()}
                  </Box>
                ))}
              </HStack>

              {/* Form Statistics */}
              <SimpleGrid columns={2} spacing={4} w="100%">
                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="blue.200">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700">
                    {awayLastXData?.stats?.seasonPPG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase">Points/Game</Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="blue.200">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700">
                    {awayLastXData?.stats?.seasonScoredAVG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase">Goals/Game</Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="blue.200">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700">
                    {awayLastXData?.stats?.seasonConcededAVG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase">Conceded/Game</Text>
                </Box>

                <Box bg="white" p={5} borderRadius="xl" textAlign="center" border="1px solid" borderColor="blue.200">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700">
                    {awayLastXData?.stats?.seasonBTTSPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase">BTTS Rate</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Modern Form Comparison - Responsive to Game Count */}
        <Box
          mt={8}
          p={8}
          bg="white"
          borderRadius="2xl"
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
          <VStack spacing={8}>
            <HStack spacing={4} align="center">
              <Box
                bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
                p={4}
                borderRadius="xl"
                boxShadow="0 4px 12px rgba(34, 197, 94, 0.3)"
              >
                <Text fontSize="3xl">⚖️</Text>
              </Box>
              <VStack align="start" spacing={1}>
                <Text fontSize="2xl" fontWeight="700" color="gray.900">
                  📊 Form Comparison (Last {gameCount} Matches)
                </Text>
                <Text fontSize="sm" color="gray.500" fontWeight="500">
                  Dynamic performance analysis • Updates with filter selection
                </Text>
                <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full">
                  Showing {gameCount} Recent Games
                </Badge>
              </VStack>
            </HStack>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              <Box
                bg="gradient-to-br from-green-50 to-green-100"
                p={6}
                borderRadius="xl"
                textAlign="center"
                border="1px solid"
                borderColor="green.200"
                boxShadow="0 4px 12px rgba(34, 197, 94, 0.15)"
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 20px rgba(34, 197, 94, 0.25)",
                  borderColor: "green.300"
                }}
                transition="all 0.3s"
              >
                <VStack spacing={3}>
                  <Text fontSize="xs" color="green.700" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                    📊 Points Per Game
                  </Text>
                  <Text fontSize="xl" fontWeight="800" color={
                    (homeLastXData?.stats?.seasonPPG_overall || 0) > (awayLastXData?.stats?.seasonPPG_overall || 0) ? 'green.600' :
                    (homeLastXData?.stats?.seasonPPG_overall || 0) < (awayLastXData?.stats?.seasonPPG_overall || 0) ? 'red.600' : 'orange.600'
                  }>
                    {homeLastXData?.stats?.seasonPPG_overall?.toFixed(1) || '0.0'} vs {awayLastXData?.stats?.seasonPPG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Badge colorScheme="green" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                    Last {gameCount} Games
                  </Badge>
                </VStack>
              </Box>

              <Box
                bg="gradient-to-br from-blue-50 to-blue-100"
                p={6}
                borderRadius="xl"
                textAlign="center"
                border="1px solid"
                borderColor="blue.200"
                boxShadow="0 4px 12px rgba(59, 130, 246, 0.15)"
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 20px rgba(59, 130, 246, 0.25)",
                  borderColor: "blue.300"
                }}
                transition="all 0.3s"
              >
                <VStack spacing={3}>
                  <Text fontSize="xs" color="blue.700" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                    ⚽ Goals Scored
                  </Text>
                  <Text fontSize="xl" fontWeight="800" color={
                    (homeLastXData?.stats?.seasonScoredAVG_overall || 0) > (awayLastXData?.stats?.seasonScoredAVG_overall || 0) ? 'green.600' :
                    (homeLastXData?.stats?.seasonScoredAVG_overall || 0) < (awayLastXData?.stats?.seasonScoredAVG_overall || 0) ? 'red.600' : 'orange.600'
                  }>
                    {homeLastXData?.stats?.seasonScoredAVG_overall?.toFixed(1) || '0.0'} vs {awayLastXData?.stats?.seasonScoredAVG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Badge colorScheme="blue" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                    Last {gameCount} Games
                  </Badge>
                </VStack>
              </Box>

              <Box
                bg="gradient-to-br from-red-50 to-red-100"
                p={6}
                borderRadius="xl"
                textAlign="center"
                border="1px solid"
                borderColor="red.200"
                boxShadow="0 4px 12px rgba(239, 68, 68, 0.15)"
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 20px rgba(239, 68, 68, 0.25)",
                  borderColor: "red.300"
                }}
                transition="all 0.3s"
              >
                <VStack spacing={3}>
                  <Text fontSize="xs" color="red.700" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                    🛡️ Goals Conceded
                  </Text>
                  <Text fontSize="xl" fontWeight="800" color={
                    (homeLastXData?.stats?.seasonConcededAVG_overall || 0) < (awayLastXData?.stats?.seasonConcededAVG_overall || 0) ? 'green.600' :
                    (homeLastXData?.stats?.seasonConcededAVG_overall || 0) > (awayLastXData?.stats?.seasonConcededAVG_overall || 0) ? 'red.600' : 'orange.600'
                  }>
                    {homeLastXData?.stats?.seasonConcededAVG_overall?.toFixed(1) || '0.0'} vs {awayLastXData?.stats?.seasonConcededAVG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Badge colorScheme="red" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                    Last {gameCount} Games
                  </Badge>
                </VStack>
              </Box>

              <Box
                bg="gradient-to-br from-purple-50 to-purple-100"
                p={6}
                borderRadius="xl"
                textAlign="center"
                border="1px solid"
                borderColor="purple.200"
                boxShadow="0 4px 12px rgba(147, 51, 234, 0.15)"
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 20px rgba(147, 51, 234, 0.25)",
                  borderColor: "purple.300"
                }}
                transition="all 0.3s"
              >
                <VStack spacing={3}>
                  <Text fontSize="xs" color="purple.700" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                    🎯 BTTS Rate
                  </Text>
                  <Text fontSize="xl" fontWeight="800" color={
                    (homeLastXData?.stats?.seasonBTTSPercentage_overall || 0) > (awayLastXData?.stats?.seasonBTTSPercentage_overall || 0) ? 'green.600' :
                    (homeLastXData?.stats?.seasonBTTSPercentage_overall || 0) < (awayLastXData?.stats?.seasonBTTSPercentage_overall || 0) ? 'red.600' : 'orange.600'
                  }>
                    {homeLastXData?.stats?.seasonBTTSPercentage_overall || 0}% vs {awayLastXData?.stats?.seasonBTTSPercentage_overall || 0}%
                  </Text>
                  <Badge colorScheme="purple" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                    Last {gameCount} Games
                  </Badge>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Box>
      </Box>
    );
  };

  return (
    <VStack spacing={6} align="stretch">
      {renderGameCountSelector()}
      {renderH2HSummary()}
      {renderEnhancedTeamComparison()}
      {renderFormAnalysis()}
      {renderRecentMatches()}
      {renderTrends()}
    </VStack>
  );
};

export default CustomHeadToHeadTabFooty;
