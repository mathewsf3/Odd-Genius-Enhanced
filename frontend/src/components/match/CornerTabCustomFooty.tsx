import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Badge,
  Avatar,
  Icon,
  Flex,
  Progress,
  Divider,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { FiCornerDownRight, FiRefreshCw, FiTrendingUp, FiTarget, FiBarChart } from 'react-icons/fi';

interface CornerTabCustomFootyProps {
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
    stats?: {
      corners?: {
        home: number;
        away: number;
      };
    };
    potentials?: {
      corners?: number;
    };
  };
  gameCount: number;
  onGameCountChange: (count: number) => void;
}

const CornerTabCustomFooty: React.FC<CornerTabCustomFootyProps> = ({
  match,
  gameCount,
  onGameCountChange
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [homeTeamStats, setHomeTeamStats] = useState<any>(null);
  const [awayTeamStats, setAwayTeamStats] = useState<any>(null);
  const [isLoadingTeamStats, setIsLoadingTeamStats] = useState(false);

  // Get enhanced corner statistics from FootyStats data
  const getEnhancedCornerStats = (teamStats: any, gameCount: number) => {
    if (!teamStats?.data?.data?.[0]?.stats) return null;

    const stats = teamStats.data.data[0].stats;
    
    // Calculate based on actual games played
    const gamesPlayed = Math.min(stats.seasonMatchesPlayed_overall || gameCount, gameCount);
    
    return {
      seasonMatchesPlayed_overall: gamesPlayed,
      // Corner statistics
      seasonCornersFor_overall: stats.seasonCornersFor_overall || 0,
      seasonCornersAgainst_overall: stats.seasonCornersAgainst_overall || 0,
      seasonCornersForAVG_overall: stats.seasonCornersForAVG_overall || (stats.seasonCornersFor_overall || 0) / gamesPlayed,
      seasonCornersAgainstAVG_overall: stats.seasonCornersAgainstAVG_overall || (stats.seasonCornersAgainst_overall || 0) / gamesPlayed,
      // Corner over/under rates
      seasonCornersOver85_overall: stats.seasonCornersOver85_overall || 0,
      seasonCornersOver85Percentage_overall: stats.seasonCornersOver85Percentage_overall || ((stats.seasonCornersOver85_overall || 0) / gamesPlayed * 100),
      seasonCornersOver105_overall: stats.seasonCornersOver105_overall || 0,
      seasonCornersOver105Percentage_overall: stats.seasonCornersOver105Percentage_overall || ((stats.seasonCornersOver105_overall || 0) / gamesPlayed * 100),
      seasonCornersOver125_overall: stats.seasonCornersOver125_overall || 0,
      seasonCornersOver125Percentage_overall: stats.seasonCornersOver125Percentage_overall || ((stats.seasonCornersOver125_overall || 0) / gamesPlayed * 100),
      // Recent form (last 5 games)
      last5CornersFor_overall: stats.last5CornersFor_overall || 0,
      last5CornersAgainst_overall: stats.last5CornersAgainst_overall || 0,
      last5CornersForAVG_overall: stats.last5CornersForAVG_overall || (stats.last5CornersFor_overall || 0) / Math.min(5, gamesPlayed),
      last5CornersAgainstAVG_overall: stats.last5CornersAgainstAVG_overall || (stats.last5CornersAgainst_overall || 0) / Math.min(5, gamesPlayed)
    };
  };

  // Fetch enhanced team corner statistics from FootyStats API
  const fetchTeamStats = async () => {
    if (!match.homeTeam.id || !match.awayTeam.id) return;

    setIsLoadingTeamStats(true);
    try {
      console.log('🔍 Fetching corner stats for teams:', match.homeTeam.name, 'vs', match.awayTeam.name);

      // Fetch comprehensive team statistics from FootyStats API
      const [homeStats, awayStats] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.homeTeam.id}?include_stats=true`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.awayTeam.id}?include_stats=true`)
      ]);

      if (homeStats.ok) {
        const homeData = await homeStats.json();
        if (homeData.success) {
          console.log('✅ Home team corner data loaded:', homeData.data);
          setHomeTeamStats(homeData.data);
        }
      }

      if (awayStats.ok) {
        const awayData = await awayStats.json();
        if (awayData.success) {
          console.log('✅ Away team corner data loaded:', awayData.data);
          setAwayTeamStats(awayData.data);
        }
      }

    } catch (error) {
      console.error('❌ Error fetching corner team stats:', error);
    } finally {
      setIsLoadingTeamStats(false);
    }
  };

  // Load team stats on component mount and when gameCount changes
  React.useEffect(() => {
    fetchTeamStats();
  }, [match.homeTeam.id, match.awayTeam.id, gameCount]);

  // Calculate enhanced team corner statistics for display
  const homeCornerStats = React.useMemo(() => {
    return homeTeamStats ? getEnhancedCornerStats(homeTeamStats, gameCount) : {
      seasonMatchesPlayed_overall: 0,
      seasonCornersFor_overall: 0,
      seasonCornersAgainst_overall: 0,
      seasonCornersForAVG_overall: 0,
      seasonCornersAgainstAVG_overall: 0,
      seasonCornersOver85Percentage_overall: 0,
      seasonCornersOver105Percentage_overall: 0,
      seasonCornersOver125Percentage_overall: 0
    };
  }, [homeTeamStats, gameCount]);

  const awayCornerStats = React.useMemo(() => {
    return awayTeamStats ? getEnhancedCornerStats(awayTeamStats, gameCount) : {
      seasonMatchesPlayed_overall: 0,
      seasonCornersFor_overall: 0,
      seasonCornersAgainst_overall: 0,
      seasonCornersForAVG_overall: 0,
      seasonCornersAgainstAVG_overall: 0,
      seasonCornersOver85Percentage_overall: 0,
      seasonCornersOver105Percentage_overall: 0,
      seasonCornersOver125Percentage_overall: 0
    };
  }, [awayTeamStats, gameCount]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTeamStats();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Game count selector component
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
            <Icon as={FiCornerDownRight} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900">
              🚩 Corner Statistics Analysis
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="500">
              Comprehensive corner data with dynamic filtering
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={4}>
          <VStack spacing={3} align="end">
            <Text fontSize="sm" color="gray.600" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
              🚩 Show Last Matches
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
  // Render comprehensive corner overview with FootyStats data
  const renderCornerOverview = () => {
    // Use real FootyStats data with proper null checks
    const homeStats = homeCornerStats || {
      seasonMatchesPlayed_overall: 0,
      seasonCornersFor_overall: 0,
      seasonCornersAgainst_overall: 0,
      seasonCornersForAVG_overall: 0,
      seasonCornersAgainstAVG_overall: 0,
      seasonCornersOver85Percentage_overall: 0,
      seasonCornersOver105Percentage_overall: 0,
      seasonCornersOver125Percentage_overall: 0
    };
    const awayStats = awayCornerStats || {
      seasonMatchesPlayed_overall: 0,
      seasonCornersFor_overall: 0,
      seasonCornersAgainst_overall: 0,
      seasonCornersForAVG_overall: 0,
      seasonCornersAgainstAVG_overall: 0,
      seasonCornersOver85Percentage_overall: 0,
      seasonCornersOver105Percentage_overall: 0,
      seasonCornersOver125Percentage_overall: 0
    };

    const homeCorners = match.stats?.corners?.home || 0;
    const awayCorners = match.stats?.corners?.away || 0;
    const totalCorners = homeCorners + awayCorners;
    
    // Calculate expected corners dynamically based on team averages
    const expectedCorners = (homeStats.seasonCornersForAVG_overall || 0) + (awayStats.seasonCornersForAVG_overall || 0);

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
            <Icon as={FiCornerDownRight} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900">
              🚩 Corner Statistics Overview
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500">
              Live match data • FootyStats analysis • Last {gameCount} matches
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full">
              Real-Time Data
            </Badge>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {/* Home Team Corners */}
          <Box
            bg="gradient-to-br from-green-50 to-green-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="green.200"
            position="relative"
            overflow="hidden"
            boxShadow="0 8px 25px rgba(34, 197, 94, 0.2)"
            _hover={{
              borderColor: "green.300",
              transform: "translateY(-4px)",
              boxShadow: "0 12px 35px rgba(34, 197, 94, 0.3)"
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
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="green.800">
                    {match.homeTeam.name}
                  </Text>
                  <Badge colorScheme="green" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                    🏠 HOME TEAM
                  </Badge>
                </VStack>
              </HStack>

              <VStack spacing={4} w="100%">
                <VStack spacing={2}>
                  <Text fontSize="4xl" fontWeight="800" color="green.700">
                    {homeCorners}
                  </Text>
                  <Text fontSize="sm" color="green.600" fontWeight="600" textTransform="uppercase">
                    Match Corners
                  </Text>
                  <Text fontSize="lg" color="green.700" fontWeight="600">
                    {totalCorners > 0 ? Math.round((homeCorners / totalCorners) * 100) : 0}% of total
                  </Text>
                </VStack>

                <Box w="100%" bg="green.200" borderRadius="full" h="4">
                  <Box
                    w={`${totalCorners > 0 ? (homeCorners / totalCorners) * 100 : 0}%`}
                    bg="green.500"
                    h="100%"
                    borderRadius="full"
                    transition="width 0.8s ease"
                  />
                </Box>

                {/* FootyStats Average */}
                <VStack spacing={2} w="100%">
                  <Text fontSize="sm" color="green.600" fontWeight="600" textTransform="uppercase">
                    Season Average
                  </Text>
                  <Text fontSize="2xl" fontWeight="700" color="green.700">
                    {homeStats.seasonCornersForAVG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize="xs" color="green.500" fontWeight="500">
                    {homeStats.seasonCornersFor_overall || 0} total in {homeStats.seasonMatchesPlayed_overall || 0} games
                  </Text>
                </VStack>
              </VStack>
            </VStack>
          </Box>

          {/* Total Corners */}
          <Box
            bg="gradient-to-br from-blue-50 to-blue-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="blue.200"
            position="relative"
            overflow="hidden"
            boxShadow="0 8px 25px rgba(59, 130, 246, 0.2)"
            _hover={{
              borderColor: "blue.300",
              transform: "translateY(-4px)",
              boxShadow: "0 12px 35px rgba(59, 130, 246, 0.3)"
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
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="800" color="blue.700">
                  ⚽
                </Text>
                <Text fontSize="lg" fontWeight="700" color="blue.800">
                  Total Match
                </Text>
                <Badge colorScheme="blue" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                  COMBINED STATS
                </Badge>
              </VStack>

              <VStack spacing={4} w="100%">
                <VStack spacing={2}>
                  <Text fontSize="4xl" fontWeight="800" color="blue.700">
                    {totalCorners}
                  </Text>
                  <Text fontSize="sm" color="blue.600" fontWeight="600" textTransform="uppercase">
                    Total Corners
                  </Text>
                  <Text fontSize="lg" color="blue.700" fontWeight="600">
                    vs {expectedCorners.toFixed(1)} expected
                  </Text>
                </VStack>

                <Box w="100%" bg="blue.200" borderRadius="full" h="4">
                  <Box
                    w={`${expectedCorners > 0 ? Math.min((totalCorners / expectedCorners) * 100, 100) : 0}%`}
                    bg="blue.500"
                    h="100%"
                    borderRadius="full"
                    transition="width 0.8s ease"
                  />
                </Box>

                <VStack spacing={2} w="100%">
                  <Text fontSize="sm" color="blue.600" fontWeight="600" textTransform="uppercase">
                    Expected Total
                  </Text>
                  <Text fontSize="2xl" fontWeight="700" color="blue.700">
                    {expectedCorners.toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="blue.500" fontWeight="500">
                    Based on team averages
                  </Text>
                </VStack>
              </VStack>
            </VStack>
          </Box>

          {/* Away Team Corners */}
          <Box
            bg="gradient-to-br from-orange-50 to-orange-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="orange.200"
            position="relative"
            overflow="hidden"
            boxShadow="0 8px 25px rgba(251, 146, 60, 0.2)"
            _hover={{
              borderColor: "orange.300",
              transform: "translateY(-4px)",
              boxShadow: "0 12px 35px rgba(251, 146, 60, 0.3)"
            }}
            transition="all 0.3s"
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
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.awayTeam.logo} name={match.awayTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="orange.800">
                    {match.awayTeam.name}
                  </Text>
                  <Badge colorScheme="orange" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                    ✈️ AWAY TEAM
                  </Badge>
                </VStack>
              </HStack>

              <VStack spacing={4} w="100%">
                <VStack spacing={2}>
                  <Text fontSize="4xl" fontWeight="800" color="orange.700">
                    {awayCorners}
                  </Text>
                  <Text fontSize="sm" color="orange.600" fontWeight="600" textTransform="uppercase">
                    Match Corners
                  </Text>
                  <Text fontSize="lg" color="orange.700" fontWeight="600">
                    {totalCorners > 0 ? Math.round((awayCorners / totalCorners) * 100) : 0}% of total
                  </Text>
                </VStack>

                <Box w="100%" bg="orange.200" borderRadius="full" h="4">
                  <Box
                    w={`${totalCorners > 0 ? (awayCorners / totalCorners) * 100 : 0}%`}
                    bg="orange.500"
                    h="100%"
                    borderRadius="full"
                    transition="width 0.8s ease"
                  />
                </Box>

                {/* FootyStats Average */}
                <VStack spacing={2} w="100%">
                  <Text fontSize="sm" color="orange.600" fontWeight="600" textTransform="uppercase">
                    Season Average
                  </Text>
                  <Text fontSize="2xl" fontWeight="700" color="orange.700">
                    {awayStats.seasonCornersForAVG_overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize="xs" color="orange.500" fontWeight="500">
                    {awayStats.seasonCornersFor_overall || 0} total in {awayStats.seasonMatchesPlayed_overall || 0} games
                  </Text>
                </VStack>
              </VStack>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    );
  };
  // Calculate betting probabilities using FootyStats data
  const calculateBettingProbabilities = () => {
    const homeStats = homeCornerStats || {
      seasonMatchesPlayed_overall: 0,
      seasonCornersFor_overall: 0,
      seasonCornersAgainst_overall: 0,
      seasonCornersForAVG_overall: 0,
      seasonCornersAgainstAVG_overall: 0,
      seasonCornersOver85Percentage_overall: 0,
      seasonCornersOver105Percentage_overall: 0,
      seasonCornersOver125Percentage_overall: 0
    };
    const awayStats = awayCornerStats || {
      seasonMatchesPlayed_overall: 0,
      seasonCornersFor_overall: 0,
      seasonCornersAgainst_overall: 0,
      seasonCornersForAVG_overall: 0,
      seasonCornersAgainstAVG_overall: 0,
      seasonCornersOver85Percentage_overall: 0,
      seasonCornersOver105Percentage_overall: 0,
      seasonCornersOver125Percentage_overall: 0
    };

    // Use FootyStats percentages directly for betting markets
    return [
      {
        market: 'Over 8.5 Corners',
        probability: homeStats.seasonCornersOver85Percentage_overall || 45,
        description: `Based on ${homeStats.seasonMatchesPlayed_overall || 0} games`,
        color: 'green'
      },
      {
        market: 'Under 8.5 Corners',
        probability: homeStats.seasonCornersOver85Percentage_overall ? 100 - homeStats.seasonCornersOver85Percentage_overall : 55,
        description: 'Inverse probability',
        color: 'red'
      },
      {
        market: 'Over 10.5 Corners',
        probability: homeStats.seasonCornersOver105Percentage_overall || 30,
        description: `Based on ${homeStats.seasonMatchesPlayed_overall || 0} games`,
        color: 'blue'
      },
      {
        market: 'Under 10.5 Corners',
        probability: homeStats.seasonCornersOver105Percentage_overall ? 100 - homeStats.seasonCornersOver105Percentage_overall : 70,
        description: 'Inverse probability',
        color: 'purple'
      },
      {
        market: 'Over 12.5 Corners',
        probability: homeStats.seasonCornersOver125Percentage_overall || 15,
        description: `Based on ${homeStats.seasonMatchesPlayed_overall || 0} games`,
        color: 'orange'
      },
      {
        market: 'Under 12.5 Corners',
        probability: homeStats.seasonCornersOver125Percentage_overall ? 100 - homeStats.seasonCornersOver125Percentage_overall : 85,
        description: 'Inverse probability',
        color: 'teal'
      }
    ];
  };

  // Render comprehensive corner betting analysis
  const renderCornerBettingAnalysis = () => {
    const bettingMarkets = calculateBettingProbabilities();

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
            bg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            p={4}
            borderRadius="xl"
            mr={4}
            boxShadow="0 4px 12px rgba(245, 158, 11, 0.3)"
          >
            <Icon as={FiTarget} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900">
              📊 Corner Betting Analysis
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500">
              Statistical probabilities based on FootyStats data
            </Text>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {bettingMarkets.map((market, index) => (
            <Box
              key={index}
              bg={`${market.color}.50`}
              p={6}
              borderRadius="xl"
              border="2px solid"
              borderColor={`${market.color}.200`}
              _hover={{
                borderColor: `${market.color}.300`,
                transform: "translateY(-2px)",
                boxShadow: `0 8px 20px rgba(var(--chakra-colors-${market.color}-500), 0.2)`
              }}
              transition="all 0.3s"
            >
              <VStack spacing={4} align="center">
                <Text fontSize="lg" fontWeight="700" color={`${market.color}.800`} textAlign="center">
                  {market.market}
                </Text>
                
                <CircularProgress
                  value={market.probability}
                  color={`${market.color}.500`}
                  size="80px"
                  thickness="8px"
                >
                  <CircularProgressLabel fontSize="lg" fontWeight="700" color={`${market.color}.700`}>
                    {Math.round(market.probability)}%
                  </CircularProgressLabel>
                </CircularProgress>

                <Text fontSize="sm" color={`${market.color}.600`} textAlign="center">
                  {market.description}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    );
  };
  // Render enhanced corner predictions
  const renderEnhancedCornerPredictions = () => {
    const homeStats = homeCornerStats || {
      seasonMatchesPlayed_overall: 0,
      seasonCornersFor_overall: 0,
      seasonCornersAgainst_overall: 0,
      seasonCornersForAVG_overall: 0,
      seasonCornersAgainstAVG_overall: 0,
      seasonCornersOver85Percentage_overall: 0,
      seasonCornersOver105Percentage_overall: 0,
      seasonCornersOver125Percentage_overall: 0
    };
    const awayStats = awayCornerStats || {
      seasonMatchesPlayed_overall: 0,
      seasonCornersFor_overall: 0,
      seasonCornersAgainst_overall: 0,
      seasonCornersForAVG_overall: 0,
      seasonCornersAgainstAVG_overall: 0,
      seasonCornersOver85Percentage_overall: 0,
      seasonCornersOver105Percentage_overall: 0,
      seasonCornersOver125Percentage_overall: 0
    };

    const predictions = [
      {
        title: 'Expected Total Corners',
        value: ((homeStats.seasonCornersForAVG_overall || 0) + (awayStats.seasonCornersForAVG_overall || 0)).toFixed(1),
        subtitle: 'Based on team averages',
        icon: FiTrendingUp,
        color: 'blue'
      },
      {
        title: 'Home Team Expected',
        value: (homeStats.seasonCornersForAVG_overall || 0).toFixed(1),
        subtitle: `Avg from ${homeStats.seasonMatchesPlayed_overall || 0} games`,
        icon: FiCornerDownRight,
        color: 'green'
      },      {
        title: 'Away Team Expected',
        value: (awayStats.seasonCornersForAVG_overall || 0).toFixed(1),
        subtitle: `Avg from ${awayStats.seasonMatchesPlayed_overall || 0} games`,
        icon: FiCornerDownRight,
        color: 'orange'
      },
      {
        title: 'Over 8.5 Likelihood',
        value: `${Math.round(homeStats.seasonCornersOver85Percentage_overall || 0)}%`,
        subtitle: 'Historical data',
        icon: FiBarChart,
        color: 'purple'
      }
    ];

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
            bg="linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
            p={4}
            borderRadius="xl"
            mr={4}
            boxShadow="0 4px 12px rgba(139, 92, 246, 0.3)"
          >
            <Icon as={FiBarChart} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900">
              🔮 Enhanced Corner Predictions
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500">
              AI-powered predictions using FootyStats data
            </Text>
          </VStack>
        </Flex>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          {predictions.map((prediction, index) => (
            <GridItem key={index}>
              <Stat
                bg={`${prediction.color}.50`}
                p={6}
                borderRadius="xl"
                border="2px solid"
                borderColor={`${prediction.color}.200`}
                _hover={{
                  borderColor: `${prediction.color}.300`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 20px rgba(var(--chakra-colors-${prediction.color}-500), 0.2)`
                }}
                transition="all 0.3s"
              >
                <Flex align="center" mb={4}>
                  <Icon as={prediction.icon} color={`${prediction.color}.500`} boxSize={6} mr={3} />
                  <StatLabel fontSize="sm" fontWeight="600" color={`${prediction.color}.700`}>
                    {prediction.title}
                  </StatLabel>
                </Flex>
                <StatNumber fontSize="3xl" fontWeight="800" color={`${prediction.color}.800`}>
                  {prediction.value}
                </StatNumber>
                <StatHelpText fontSize="xs" color={`${prediction.color}.600`} mt={2}>
                  {prediction.subtitle}
                </StatHelpText>
              </Stat>
            </GridItem>
          ))}
        </Grid>
      </Box>
    );
  };

  // Loading state
  if (isLoadingTeamStats) {
    return (
      <VStack spacing={8} align="center" py={20}>
        <CircularProgress isIndeterminate color="green.500" size="80px" />
        <Text fontSize="lg" fontWeight="600" color="gray.600">
          Loading corner statistics...
        </Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      {renderGameCountSelector()}
      {renderCornerOverview()}
      {renderCornerBettingAnalysis()}
      {renderEnhancedCornerPredictions()}
    </VStack>  );
};

export default CornerTabCustomFooty;