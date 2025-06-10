import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Icon,
  Flex,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  Tab,
  Progress,
  Badge,
  Avatar,
  Spinner,
  Divider
} from '@chakra-ui/react';
import { 
  FiTrendingUp, 
  FiRefreshCw,
  FiTarget
} from 'react-icons/fi';

interface CustomBTTSTabFootyProps {
  match: {
    id: string;
    homeTeam: { id: string; name: string; logo?: string; };
    awayTeam: { id: string; name: string; logo?: string; };
    score: { home: number; away: number; total: number; };
    potentials?: { btts?: number; over25?: number; };
  };
  gameCount: number;
  onGameCountChange: (count: number) => void;
}

const CustomBTTSTabFooty: React.FC<CustomBTTSTabFootyProps> = ({
  match,
  gameCount,
  onGameCountChange
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [homeTeamStats, setHomeTeamStats] = useState<any>(null);
  const [awayTeamStats, setAwayTeamStats] = useState<any>(null);
  const [isLoadingTeamStats, setIsLoadingTeamStats] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentGreen = useColorModeValue('green.500', 'green.300');

  // Get enhanced BTTS statistics from FootyStats data
  const getEnhancedBTTSStats = (teamStats: any, gameCount: number) => {
    if (!teamStats?.data?.data?.[0]?.stats) return null;

    const stats = teamStats.data.data[0].stats;
    
    // Calculate percentages based on actual games played
    const gamesPlayed = Math.min(stats.seasonMatchesPlayed_overall || gameCount, gameCount);
    
    return {
      seasonMatchesPlayed_overall: gamesPlayed,
      seasonGoals_overall: stats.seasonGoals_overall || stats.seasonScoredNum_overall || 0,
      seasonConceded_overall: stats.seasonConceded_overall || stats.seasonConcededNum_overall || 0,
      seasonScoredAVG_overall: stats.seasonScoredAVG_overall || 0,
      seasonConcededAVG_overall: stats.seasonConcededAVG_overall || 0,
      seasonScoredNum_overall: stats.seasonScoredNum_overall || stats.seasonGoals_overall || 0,
      // BTTS statistics
      seasonBTTS_overall: stats.seasonBTTS_overall || 0,
      seasonBTTSPercentage_overall: stats.seasonBTTSPercentage_overall || ((stats.seasonBTTS_overall || 0) / gamesPlayed * 100),
      seasonFailedToScore_overall: stats.seasonFailedToScore_overall || 0,
      seasonFailedToScorePercentage_overall: stats.seasonFailedToScorePercentage_overall || ((stats.seasonFailedToScore_overall || 0) / gamesPlayed * 100),
      // Clean sheets - handle different field name variations
      seasonCleanSheets_overall: stats.seasonCleanSheets_overall || stats.seasonCS_overall || 0,
      seasonCleanSheetsPercentage_overall: stats.seasonCleanSheetsPercentage_overall || stats.seasonCSPercentage_overall || ((stats.seasonCleanSheets_overall || stats.seasonCS_overall || 0) / gamesPlayed * 100),
      seasonCS_overall: stats.seasonCS_overall || stats.seasonCleanSheets_overall || 0,
      seasonCSPercentage_overall: stats.seasonCSPercentage_overall || stats.seasonCleanSheetsPercentage_overall || ((stats.seasonCS_overall || stats.seasonCleanSheets_overall || 0) / gamesPlayed * 100),
      // Over/Under goals
      seasonOver15_overall: stats.seasonOver15_overall || 0,
      seasonOver15Percentage_overall: stats.seasonOver15Percentage_overall || ((stats.seasonOver15_overall || 0) / gamesPlayed * 100),
      seasonOver25_overall: stats.seasonOver25_overall || 0,
      seasonOver25Percentage_overall: stats.seasonOver25Percentage_overall || ((stats.seasonOver25_overall || 0) / gamesPlayed * 100),
      seasonOver35_overall: stats.seasonOver35_overall || 0,
      seasonOver35Percentage_overall: stats.seasonOver35Percentage_overall || ((stats.seasonOver35_overall || 0) / gamesPlayed * 100),
      seasonUnder25_overall: stats.seasonUnder25_overall || 0,
      seasonUnder25Percentage_overall: stats.seasonUnder25Percentage_overall || ((stats.seasonUnder25_overall || 0) / gamesPlayed * 100)
    };
  };

  // Fetch enhanced team BTTS statistics from FootyStats API
  const fetchTeamStats = async () => {
    if (!match.homeTeam.id || !match.awayTeam.id) return;

    setIsLoadingTeamStats(true);
    try {
      console.log('🔍 Fetching BTTS stats for teams:', match.homeTeam.name, 'vs', match.awayTeam.name);

      // Fetch comprehensive team statistics from FootyStats API
      const [homeStats, awayStats] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.homeTeam.id}?include_stats=true`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.awayTeam.id}?include_stats=true`)
      ]);

      if (homeStats.ok) {
        const homeData = await homeStats.json();
        if (homeData.success) {
          console.log('✅ Home team BTTS data loaded:', homeData.data);
          setHomeTeamStats(homeData.data);
        }
      }

      if (awayStats.ok) {
        const awayData = await awayStats.json();
        if (awayData.success) {
          console.log('✅ Away team BTTS data loaded:', awayData.data);
          setAwayTeamStats(awayData.data);
        }
      }

    } catch (error) {
      console.error('❌ Error fetching BTTS team stats:', error);
    } finally {
      setIsLoadingTeamStats(false);
    }
  };

  // Load team stats on component mount and when gameCount changes
  React.useEffect(() => {
    fetchTeamStats();
  }, [match.homeTeam.id, match.awayTeam.id, gameCount]);

  // Calculate enhanced team statistics for display
  const homeStats = React.useMemo(() => {
    return homeTeamStats ? getEnhancedBTTSStats(homeTeamStats, gameCount) : {
      seasonMatchesPlayed_overall: 0,
      seasonBTTSPercentage_overall: 0,
      seasonBTTS_overall: 0,
      seasonCSPercentage_overall: 0,
      seasonCS_overall: 0,
      seasonScoredAVG_overall: 0,
      seasonScoredNum_overall: 0
    };
  }, [homeTeamStats, gameCount]);

  const awayStats = React.useMemo(() => {
    return awayTeamStats ? getEnhancedBTTSStats(awayTeamStats, gameCount) : {
      seasonMatchesPlayed_overall: 0,
      seasonBTTSPercentage_overall: 0,
      seasonBTTS_overall: 0,
      seasonCSPercentage_overall: 0,
      seasonCS_overall: 0,
      seasonScoredAVG_overall: 0,
      seasonScoredNum_overall: 0
    };
  }, [awayTeamStats, gameCount]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTeamStats();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

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
            <Icon as={FiTrendingUp} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              ⚽ BTTS Analysis
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="500" fontFamily="DIN, sans-serif">
              Both Teams To Score statistics and predictions
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={4}>
          <VStack spacing={3} align="end">
            <Text fontSize="sm" color="gray.600" fontWeight="700" textTransform="uppercase" letterSpacing="wide" fontFamily="DIN, sans-serif">
              ⚽ Show Last Matches
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
                  fontFamily="DIN, sans-serif"
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
            fontFamily="DIN, sans-serif"
          >
            🔄 Refresh
          </Button>
        </HStack>
      </Flex>
    </Box>
  );

  const renderBTTSOverview = () => {
    // Handle demo teams with realistic BTTS match data
    let homeScored, awayScored, bttsResult, bttsPotential, over25Potential, homeScore, awayScore, totalScore;

    // Always use real match data
    homeScore = match.score?.home || 0;
    awayScore = match.score?.away || 0;
    totalScore = match.score?.total || (homeScore + awayScore);
    homeScored = homeScore > 0;
    awayScored = awayScore > 0;
    bttsResult = homeScored && awayScored;
    bttsPotential = (match.potentials?.btts || 0) * 100;
    over25Potential = (match.potentials?.over25 || 0) * 100;

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
            <Icon as={FiTrendingUp} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              ⚽ BTTS Statistics Overview
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Both Teams To Score analysis • Live match data • Last {gameCount} matches
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              Real-Time Data
            </Badge>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {/* BTTS Result */}
          <Box
            bg={bttsResult ? "gradient-to-br from-green-50 to-green-100" : "gradient-to-br from-red-50 to-red-100"}
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor={bttsResult ? "green.200" : "red.200"}
            position="relative"
            overflow="hidden"
            boxShadow={bttsResult ? "0 8px 25px rgba(34, 197, 94, 0.2)" : "0 8px 25px rgba(239, 68, 68, 0.2)"}
            _hover={{
              borderColor: bttsResult ? "green.300" : "red.300",
              transform: "translateY(-4px)",
              boxShadow: bttsResult ? "0 12px 35px rgba(34, 197, 94, 0.3)" : "0 12px 35px rgba(239, 68, 68, 0.3)"
            }}
            transition="all 0.3s"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg={bttsResult ? "green.100" : "red.100"}
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="800" color={bttsResult ? "green.700" : "red.700"} fontFamily="DIN, sans-serif">
                  {bttsResult ? '✅' : '❌'}
                </Text>
                <Text fontSize="lg" fontWeight="700" color={bttsResult ? "green.800" : "red.800"} fontFamily="DIN, sans-serif">
                  Match Result
                </Text>
                <Badge colorScheme={bttsResult ? "green" : "red"} variant="solid" fontSize="xs" px={2} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                  BTTS OUTCOME
                </Badge>
              </VStack>

              <VStack spacing={4} w="100%">
                <VStack spacing={2}>
                  <Text fontSize="4xl" fontWeight="800" color={bttsResult ? "green.700" : "red.700"} fontFamily="DIN, sans-serif">
                    {bttsResult ? 'YES' : 'NO'}
                  </Text>
                  <Text fontSize="sm" color={bttsResult ? "green.600" : "red.600"} fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    BTTS Result
                  </Text>
                  <Text fontSize="lg" color={bttsResult ? "green.700" : "red.700"} fontWeight="600" fontFamily="DIN, sans-serif">
                    {homeScore} - {awayScore}
                  </Text>
                </VStack>
              </VStack>
            </VStack>
          </Box>

          {/* BTTS Potential */}
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
                <Text fontSize="3xl" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                  📊
                </Text>
                <Text fontSize="lg" fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">
                  Pre-Match Potential
                </Text>
                <Badge colorScheme="blue" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                  PREDICTION
                </Badge>
              </VStack>

              <VStack spacing={4} w="100%">
                <VStack spacing={2}>
                  <Text fontSize="4xl" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                    {bttsPotential.toFixed(1)}%
                  </Text>
                  <Text fontSize="sm" color="blue.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    BTTS Probability
                  </Text>
                  <Text fontSize="lg" color="blue.700" fontWeight="600" fontFamily="DIN, sans-serif">
                    FootyStats Prediction
                  </Text>
                </VStack>

                <Box w="100%" bg="blue.200" borderRadius="full" h="4">
                  <Box
                    w={`${bttsPotential}%`}
                    bg="blue.500"
                    h="100%"
                    borderRadius="full"
                    transition="width 0.8s ease"
                  />
                </Box>
              </VStack>
            </VStack>
          </Box>

          {/* Over 2.5 Goals */}
          <Box
            bg="gradient-to-br from-purple-50 to-purple-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="purple.200"
            position="relative"
            overflow="hidden"
            boxShadow="0 8px 25px rgba(147, 51, 234, 0.2)"
            _hover={{
              borderColor: "purple.300",
              transform: "translateY(-4px)",
              boxShadow: "0 12px 35px rgba(147, 51, 234, 0.3)"
            }}
            transition="all 0.3s"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg="purple.100"
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="800" color="purple.700" fontFamily="DIN, sans-serif">
                  🎯
                </Text>
                <Text fontSize="lg" fontWeight="700" color="purple.800" fontFamily="DIN, sans-serif">
                  Over 2.5 Goals
                </Text>
                <Badge colorScheme="purple" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                  GOAL TOTAL
                </Badge>
              </VStack>

              <VStack spacing={4} w="100%">
                <VStack spacing={2}>
                  <Text fontSize="4xl" fontWeight="800" color="purple.700" fontFamily="DIN, sans-serif">
                    {over25Potential.toFixed(1)}%
                  </Text>
                  <Text fontSize="sm" color="purple.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    O2.5 Probability
                  </Text>
                  <Text fontSize="lg" color="purple.700" fontWeight="600" fontFamily="DIN, sans-serif">
                    Total: {homeScore + awayScore}
                  </Text>
                </VStack>

                <Box w="100%" bg="purple.200" borderRadius="full" h="4">
                  <Box
                    w={`${over25Potential}%`}
                    bg="purple.500"
                    h="100%"
                    borderRadius="full"
                    transition="width 0.8s ease"
                  />
                </Box>
              </VStack>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    );
  };

  // Render enhanced BTTS analysis with FootyStats data
  const renderEnhancedBTTSAnalysis = () => {
    if (!homeTeamStats || !awayTeamStats) {
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
          <Flex align="center" mb={6}>
            <Box
              bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
              p={4}
              borderRadius="xl"
              mr={4}
              boxShadow="0 4px 12px rgba(34, 197, 94, 0.3)"
            >
              <Icon as={FiTarget} color="white" boxSize={7} />
            </Box>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
                📊 Enhanced BTTS Analysis
              </Text>
              <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
                Comprehensive FootyStats BTTS data
              </Text>
            </VStack>
          </Flex>

          {isLoadingTeamStats ? (
            <Flex justify="center" py={8}>
              <VStack spacing={4}>
                <Spinner size="xl" color="green.500" thickness="4px" />
                <Text color="gray.600" fontSize="lg" fontWeight="500" fontFamily="DIN, sans-serif">Loading comprehensive BTTS statistics...</Text>
                <Text color="gray.500" fontSize="sm" fontFamily="DIN, sans-serif">Fetching FootyStats data for detailed analysis</Text>
              </VStack>
            </Flex>
          ) : (
            <Alert status="info" borderRadius="xl" bg="blue.50" border="1px solid" borderColor="blue.200">
              <AlertIcon color="blue.500" />
              <Box>
                <Text fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">Enhanced BTTS Statistics Loading</Text>
                <Text fontSize="sm" color="blue.600" fontFamily="DIN, sans-serif">
                  Comprehensive BTTS statistics will be displayed here once loaded from FootyStats API.
                </Text>
              </Box>
            </Alert>
          )}
        </Box>
      );
    }

    const homeStats = homeTeamStats.data?.[0]?.stats || {};
    const awayStats = awayTeamStats.data?.[0]?.stats || {};

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
            <Icon as={FiTarget} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              📊 Enhanced BTTS Analysis (Last {gameCount} Matches)
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Season statistics • FootyStats data • Comprehensive analysis
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              FootyStats API
            </Badge>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Home Team BTTS Stats */}
          <VStack spacing={4}>
            <HStack spacing={4} justify="center">
              <Avatar size="lg" src={match.homeTeam.logo} name={match.homeTeam.name} />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="700" color="green.800" fontFamily="DIN, sans-serif">
                  {match.homeTeam.name}
                </Text>
                <Badge colorScheme="green" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                  🏠 HOME TEAM
                </Badge>
              </VStack>
            </HStack>

            <SimpleGrid columns={1} spacing={3} w="100%">
              <Box bg="green.50" p={3} borderRadius="lg" border="1px solid" borderColor="green.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    BTTS Rate
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="green.700" fontFamily="DIN, sans-serif">
                    {homeStats.seasonBTTSPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="green.500" fontFamily="DIN, sans-serif">
                    {homeStats.seasonBTTS_overall || 0} of {homeStats.seasonMatchesPlayed_overall || 0} games
                  </Text>
                </VStack>
              </Box>

              <Box bg="blue.50" p={3} borderRadius="lg" border="1px solid" borderColor="blue.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Clean Sheets
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                    {homeStats.seasonCSPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="blue.500" fontFamily="DIN, sans-serif">
                    {homeStats.seasonCS_overall || 0} clean sheets
                  </Text>
                </VStack>
              </Box>

              <Box bg="purple.50" p={3} borderRadius="lg" border="1px solid" borderColor="purple.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="purple.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Goals Per Game
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="purple.700" fontFamily="DIN, sans-serif">
                    {(homeStats.seasonScoredAVG_overall || 0).toFixed(2)}
                  </Text>
                  <Text fontSize="xs" color="purple.500" fontFamily="DIN, sans-serif">
                    {homeStats.seasonScoredNum_overall || 0} total goals
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>

          {/* Combined Analysis */}
          <VStack spacing={4} justify="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.700" fontFamily="DIN, sans-serif">
              VS
            </Text>
            <Divider />
            <VStack spacing={2}>
              <Text fontSize="sm" color="gray.600" textAlign="center" fontFamily="DIN, sans-serif">
                Combined Analysis
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center" fontFamily="DIN, sans-serif">
                Last {gameCount} matches
              </Text>
            </VStack>

            <Box bg="green.50" p={4} borderRadius="lg" border="1px solid" borderColor="green.200" textAlign="center">
              <VStack spacing={2}>
                <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                  Expected BTTS
                </Text>
                <Text fontSize="2xl" fontWeight="800" color="green.700" fontFamily="DIN, sans-serif">
                  {(((homeStats.seasonBTTSPercentage_overall || 0) + (awayStats.seasonBTTSPercentage_overall || 0)) / 2).toFixed(1)}%
                </Text>
                <Text fontSize="xs" color="green.500" fontFamily="DIN, sans-serif">
                  Average of both teams
                </Text>
              </VStack>
            </Box>

            <Box bg="blue.50" p={4} borderRadius="lg" border="1px solid" borderColor="blue.200" textAlign="center">
              <VStack spacing={2}>
                <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                  Expected Goals
                </Text>
                <Text fontSize="2xl" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                  {((homeStats.seasonScoredAVG_overall || 0) + (awayStats.seasonScoredAVG_overall || 0)).toFixed(1)}
                </Text>
                <Text fontSize="xs" color="blue.500" fontFamily="DIN, sans-serif">
                  Combined average
                </Text>
              </VStack>
            </Box>
          </VStack>

          {/* Away Team BTTS Stats */}
          <VStack spacing={4}>
            <HStack spacing={4} justify="center">
              <Avatar size="lg" src={match.awayTeam.logo} name={match.awayTeam.name} />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                  {match.awayTeam.name}
                </Text>
                <Badge colorScheme="orange" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                  ✈️ AWAY TEAM
                </Badge>
              </VStack>
            </HStack>

            <SimpleGrid columns={1} spacing={3} w="100%">
              <Box bg="green.50" p={3} borderRadius="lg" border="1px solid" borderColor="green.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    BTTS Rate
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="green.700" fontFamily="DIN, sans-serif">
                    {awayStats.seasonBTTSPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="green.500" fontFamily="DIN, sans-serif">
                    {awayStats.seasonBTTS_overall || 0} of {awayStats.seasonMatchesPlayed_overall || 0} games
                  </Text>
                </VStack>
              </Box>

              <Box bg="blue.50" p={3} borderRadius="lg" border="1px solid" borderColor="blue.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Clean Sheets
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                    {awayStats.seasonCSPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="blue.500" fontFamily="DIN, sans-serif">
                    {awayStats.seasonCS_overall || 0} clean sheets
                  </Text>
                </VStack>
              </Box>

              <Box bg="purple.50" p={3} borderRadius="lg" border="1px solid" borderColor="purple.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="purple.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Goals Per Game
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="purple.700" fontFamily="DIN, sans-serif">
                    {(awayStats.seasonScoredAVG_overall || 0).toFixed(2)}
                  </Text>
                  <Text fontSize="xs" color="purple.500" fontFamily="DIN, sans-serif">
                    {awayStats.seasonScoredNum_overall || 0} total goals
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </SimpleGrid>
      </Box>
    );
  };

  return (
    <VStack spacing={8} align="stretch" fontFamily="DIN, sans-serif">
      {renderGameCountSelector()}
      {renderBTTSOverview()}
      {renderEnhancedBTTSAnalysis()}
    </VStack>
  );
};

export default CustomBTTSTabFooty;
