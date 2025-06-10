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
  FiAlertTriangle, 
  FiRefreshCw,
  FiTarget
} from 'react-icons/fi';

interface CustomCardsTabFootyProps {
  match: {
    id: string;
    homeTeam: { id: string; name: string; logo?: string; };
    awayTeam: { id: string; name: string; logo?: string; };
    stats?: {
      cards?: {
        home: { yellow: number; red: number; total: number; };
        away: { yellow: number; red: number; total: number; };
      };
    };
    potentials?: { cards?: number; };
  };
  gameCount: number;
  onGameCountChange: (count: number) => void;
}

const CustomCardsTabFooty: React.FC<CustomCardsTabFootyProps> = ({
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
  const accentRed = useColorModeValue('red.500', 'red.300');



  // Fetch enhanced team card statistics - TRUE FootyStats data only
  const fetchTeamStats = async () => {
    if (!match.homeTeam.id || !match.awayTeam.id) return;

    setIsLoadingTeamStats(true);
    try {
      // Always use real FootyStats data

      // For real teams, fetch from FootyStats API
      const [homeStats, awayStats, homeCardStats, awayCardStats] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.homeTeam.id}?include_stats=true`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.awayTeam.id}?include_stats=true`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.homeTeam.id}/cards`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.awayTeam.id}/cards`)
      ]);

      if (homeStats.ok) {
        const homeData = await homeStats.json();
        if (homeData.success) {
          setHomeTeamStats(homeData.data);

          // Merge card-specific data if available
          if (homeCardStats.ok) {
            const homeCardData = await homeCardStats.json();
            if (homeCardData.success) {
              setHomeTeamStats(prev => ({
                ...prev,
                cardStats: homeCardData.data
              }));
            }
          }
        }
      }

      if (awayStats.ok) {
        const awayData = await awayStats.json();
        if (awayData.success) {
          setAwayTeamStats(awayData.data);

          // Merge card-specific data if available
          if (awayCardStats.ok) {
            const awayCardData = await awayCardStats.json();
            if (awayCardData.success) {
              setAwayTeamStats(prev => ({
                ...prev,
                cardStats: awayCardData.data
              }));
            }
          }
        }
      }

    } catch (error) {
      console.error('Error fetching team card stats:', error);
    } finally {
      setIsLoadingTeamStats(false);
    }
  };

  // Load team stats on component mount and when gameCount changes
  React.useEffect(() => {
    fetchTeamStats();
  }, [match.homeTeam.id, match.awayTeam.id, gameCount]);

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
            <Icon as={FiAlertTriangle} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              🟨 Card Statistics Analysis
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="500" fontFamily="DIN, sans-serif">
              Comprehensive card data with disciplinary insights
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={4}>
          <VStack spacing={3} align="end">
            <Text fontSize="sm" color="gray.600" fontWeight="700" textTransform="uppercase" letterSpacing="wide" fontFamily="DIN, sans-serif">
              🟨 Show Last Matches
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

  const renderCardOverview = () => {
    // Handle demo teams with realistic match card data
    let homeCards, awayCards, totalCards, expectedCards;

    // Always use real match data
    homeCards = match.stats?.cards?.home?.total || 0;
    awayCards = match.stats?.cards?.away?.total || 0;
    totalCards = homeCards + awayCards;
    expectedCards = match.potentials?.cards || 0;

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
            <Icon as={FiAlertTriangle} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              🟨 Card Statistics Overview
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Live match data • FootyStats analysis • Last {gameCount} matches
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              Real-Time Data
            </Badge>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {/* Home Team Cards */}
          <Box
            bg="gradient-to-br from-yellow-50 to-yellow-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="yellow.200"
            position="relative"
            overflow="hidden"
            boxShadow="0 8px 25px rgba(251, 191, 36, 0.2)"
            _hover={{
              borderColor: "yellow.300",
              transform: "translateY(-4px)",
              boxShadow: "0 12px 35px rgba(251, 191, 36, 0.3)"
            }}
            transition="all 0.3s"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg="yellow.100"
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.homeTeam.logo} name={match.homeTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="yellow.800" fontFamily="DIN, sans-serif">
                    {match.homeTeam.name}
                  </Text>
                  <Badge colorScheme="yellow" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                    🏠 HOME TEAM
                  </Badge>
                </VStack>
              </HStack>

              <VStack spacing={4} w="100%">
                <VStack spacing={2}>
                  <Text fontSize="4xl" fontWeight="800" color="yellow.700" fontFamily="DIN, sans-serif">
                    {homeCards}
                  </Text>
                  <Text fontSize="sm" color="yellow.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Match Cards
                  </Text>
                  <Text fontSize="lg" color="yellow.700" fontWeight="600" fontFamily="DIN, sans-serif">
                    Y: {match.stats?.cards?.home?.yellow || 0} | R: {match.stats?.cards?.home?.red || 0}
                  </Text>
                </VStack>

                <Box w="100%" bg="yellow.200" borderRadius="full" h="4">
                  <Box
                    w={`${totalCards > 0 ? (homeCards / totalCards) * 100 : 0}%`}
                    bg="yellow.500"
                    h="100%"
                    borderRadius="full"
                    transition="width 0.8s ease"
                  />
                </Box>
              </VStack>
            </VStack>
          </Box>

          {/* Total Cards */}
          <Box
            bg="gradient-to-br from-red-50 to-red-100"
            p={8}
            borderRadius="2xl"
            border="2px solid"
            borderColor="red.200"
            position="relative"
            overflow="hidden"
            boxShadow="0 8px 25px rgba(239, 68, 68, 0.2)"
            _hover={{
              borderColor: "red.300",
              transform: "translateY(-4px)",
              boxShadow: "0 12px 35px rgba(239, 68, 68, 0.3)"
            }}
            transition="all 0.3s"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              w="100px"
              h="100px"
              bg="red.100"
              borderRadius="full"
              opacity="0.5"
            />
            <VStack spacing={6} position="relative">
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">
                  🟥
                </Text>
                <Text fontSize="lg" fontWeight="700" color="red.800" fontFamily="DIN, sans-serif">
                  Total Match
                </Text>
                <Badge colorScheme="red" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                  COMBINED STATS
                </Badge>
              </VStack>

              <VStack spacing={4} w="100%">
                <VStack spacing={2}>
                  <Text fontSize="4xl" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">
                    {totalCards}
                  </Text>
                  <Text fontSize="sm" color="red.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Total Cards
                  </Text>
                  <Text fontSize="lg" color="red.700" fontWeight="600" fontFamily="DIN, sans-serif">
                    Expected: {expectedCards.toFixed(1)}
                  </Text>
                </VStack>

                <Box w="100%" bg="red.200" borderRadius="full" h="4">
                  <Box
                    w={`${expectedCards > 0 ? Math.min((totalCards / expectedCards) * 100, 100) : 0}%`}
                    bg="red.500"
                    h="100%"
                    borderRadius="full"
                    transition="width 0.8s ease"
                  />
                </Box>
              </VStack>
            </VStack>
          </Box>

          {/* Away Team Cards */}
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
                  <Text fontSize="lg" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                    {match.awayTeam.name}
                  </Text>
                  <Badge colorScheme="orange" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                    ✈️ AWAY TEAM
                  </Badge>
                </VStack>
              </HStack>

              <VStack spacing={4} w="100%">
                <VStack spacing={2}>
                  <Text fontSize="4xl" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                    {awayCards}
                  </Text>
                  <Text fontSize="sm" color="orange.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Match Cards
                  </Text>
                  <Text fontSize="lg" color="orange.700" fontWeight="600" fontFamily="DIN, sans-serif">
                    Y: {match.stats?.cards?.away?.yellow || 0} | R: {match.stats?.cards?.away?.red || 0}
                  </Text>
                </VStack>

                <Box w="100%" bg="orange.200" borderRadius="full" h="4">
                  <Box
                    w={`${totalCards > 0 ? (awayCards / totalCards) * 100 : 0}%`}
                    bg="orange.500"
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

  // Render enhanced card analysis with FootyStats data
  const renderEnhancedCardAnalysis = () => {
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
                📊 Enhanced Card Analysis
              </Text>
              <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
                Comprehensive FootyStats card data
              </Text>
            </VStack>
          </Flex>

          {isLoadingTeamStats ? (
            <Flex justify="center" py={8}>
              <VStack spacing={4}>
                <Spinner size="xl" color="green.500" thickness="4px" />
                <Text color="gray.600" fontSize="lg" fontWeight="500" fontFamily="DIN, sans-serif">Loading comprehensive card statistics...</Text>
                <Text color="gray.500" fontSize="sm" fontFamily="DIN, sans-serif">Fetching FootyStats data for detailed analysis</Text>
              </VStack>
            </Flex>
          ) : (
            <Alert status="info" borderRadius="xl" bg="blue.50" border="1px solid" borderColor="blue.200">
              <AlertIcon color="blue.500" />
              <Box>
                <Text fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">Enhanced Card Statistics Loading</Text>
                <Text fontSize="sm" color="blue.600" fontFamily="DIN, sans-serif">
                  Comprehensive card statistics will be displayed here once loaded from FootyStats API.
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
              📊 Enhanced Card Analysis (Last {gameCount} Matches)
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Season averages • FootyStats data • Comprehensive statistics
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              FootyStats API
            </Badge>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Home Team Card Stats */}
          <VStack spacing={4}>
            <HStack spacing={4} justify="center">
              <Avatar size="lg" src={match.homeTeam.logo} name={match.homeTeam.name} />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="700" color="yellow.800" fontFamily="DIN, sans-serif">
                  {match.homeTeam.name}
                </Text>
                <Badge colorScheme="yellow" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                  🏠 HOME TEAM
                </Badge>
              </VStack>
            </HStack>

            <SimpleGrid columns={1} spacing={3} w="100%">
              <Box bg="yellow.50" p={3} borderRadius="lg" border="1px solid" borderColor="yellow.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="yellow.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Cards Per Game
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="yellow.700" fontFamily="DIN, sans-serif">
                    {(homeStats.cardsAVG_overall || 0).toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="yellow.500" fontFamily="DIN, sans-serif">
                    {homeStats.cardsTotal_overall || 0} total in {homeStats.seasonMatchesPlayed_overall || 0} games
                  </Text>
                </VStack>
              </Box>

              <Box bg="orange.50" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="orange.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Over 3.5 Cards
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                    {homeStats.over35CardsPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="orange.500" fontFamily="DIN, sans-serif">
                    {homeStats.over35Cards_overall || 0} of {homeStats.cardsRecorded_matches_overall || 0} games
                  </Text>
                </VStack>
              </Box>

              <Box bg="red.50" p={3} borderRadius="lg" border="1px solid" borderColor="red.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="red.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Over 5.5 Cards
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">
                    {homeStats.over55CardsPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="red.500" fontFamily="DIN, sans-serif">
                    {homeStats.over55Cards_overall || 0} of {homeStats.cardsRecorded_matches_overall || 0} games
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>

          {/* Away Team Card Stats */}
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
              <Box bg="yellow.50" p={3} borderRadius="lg" border="1px solid" borderColor="yellow.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="yellow.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Cards Per Game
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="yellow.700" fontFamily="DIN, sans-serif">
                    {(awayStats.cardsAVG_overall || 0).toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="yellow.500" fontFamily="DIN, sans-serif">
                    {awayStats.cardsTotal_overall || 0} total in {awayStats.seasonMatchesPlayed_overall || 0} games
                  </Text>
                </VStack>
              </Box>

              <Box bg="orange.50" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="orange.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Over 3.5 Cards
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                    {awayStats.over35CardsPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="orange.500" fontFamily="DIN, sans-serif">
                    {awayStats.over35Cards_overall || 0} of {awayStats.cardsRecorded_matches_overall || 0} games
                  </Text>
                </VStack>
              </Box>

              <Box bg="red.50" p={3} borderRadius="lg" border="1px solid" borderColor="red.200">
                <VStack spacing={2}>
                  <Text fontSize="xs" color="red.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Over 5.5 Cards
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">
                    {awayStats.over55CardsPercentage_overall || 0}%
                  </Text>
                  <Text fontSize="xs" color="red.500" fontFamily="DIN, sans-serif">
                    {awayStats.over55Cards_overall || 0} of {awayStats.cardsRecorded_matches_overall || 0} games
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </SimpleGrid>

        {/* Expected Cards Prediction */}
        <Box mt={6} p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
          <VStack spacing={2}>
            <Text fontSize="sm" fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif" textTransform="uppercase">
              Expected Total Cards
            </Text>
            <Text fontSize="2xl" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
              {((homeStats.cardsAVG_overall || 0) + (awayStats.cardsAVG_overall || 0)).toFixed(1)}
            </Text>
            <Text fontSize="xs" color="blue.500" fontFamily="DIN, sans-serif">
              Based on {match.homeTeam.name}: {(homeStats.cardsAVG_overall || 0).toFixed(1)} + {match.awayTeam.name}: {(awayStats.cardsAVG_overall || 0).toFixed(1)}
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  };

  return (
    <VStack spacing={8} align="stretch" fontFamily="DIN, sans-serif">
      {renderGameCountSelector()}
      {renderCardOverview()}
      {renderEnhancedCardAnalysis()}
    </VStack>
  );
};

export default CustomCardsTabFooty;
