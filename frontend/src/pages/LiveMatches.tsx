// LiveMatches.tsx - A component to display live or upcoming soccer matches

// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Flex,
  Button,
  Icon,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from "@chakra-ui/react";
import { FiRefreshCw, FiCalendar, FiTrendingUp, FiActivity } from "react-icons/fi";
import { BsLightningFill } from "react-icons/bs";
import { MdAnalytics, MdSportsSoccer } from "react-icons/md";
import soccerApiService from "../api/soccerApiService";
import { Match } from "../api/soccerApiService";
import MatchCard from "../components/matches/MatchCard";
import Loader from "../components/common/Loader";


interface LeagueMatches {
  [key: string]: Match[];
}

interface LiveMatchesProps {
  isUpcoming?: boolean;
}

const LiveMatches: React.FC<LiveMatchesProps> = ({ isUpcoming = false }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if this is upcoming based on the route path as well as prop
  const isUpcomingPage = isUpcoming || location.pathname === '/upcoming';

  // Fetch matches based on mode (live or upcoming)
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (isUpcomingPage) {
        response = await soccerApiService.getUpcomingMatches(48); // Get 48 hours of upcoming matches
      } else {
        response = await soccerApiService.getLiveMatches();
      }
      setMatches(response);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${isUpcomingPage ? 'upcoming' : 'live'} matches:`, err);
      setError(`Failed to load ${isUpcomingPage ? 'upcoming' : 'live'} matches. Please try again.`);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [isUpcomingPage]); // Memoize fetchMatches with isUpcomingPage dependency

  // Initial fetch on component mount and when isUpcomingPage changes
  useEffect(() => {
    // Reset active tab when switching between live and upcoming
    setActiveTab(0);
    fetchMatches();

    // Set up auto-refresh interval - different times for live vs upcoming
    const refreshInterval = setInterval(
      fetchMatches,
      isUpcomingPage ? 60000 : 30000  // 60 seconds for upcoming, 30 seconds for live
    );

    return () => clearInterval(refreshInterval);
  }, [isUpcomingPage, fetchMatches, location.pathname]); // Added location.pathname to force re-render on route change

  // Group matches by league for organized display
  const groupedMatches: LeagueMatches = (Array.isArray(matches) ? matches : []).reduce((acc: LeagueMatches, match) => {
    const leagueName = match.league?.name || "Other Leagues";

    if (!acc[leagueName]) {
      acc[leagueName] = [];
    }

    acc[leagueName].push(match);
    return acc;
  }, {});

  // Convert grouped matches to array for easier rendering
  const leagueGroups = Object.keys(groupedMatches).map(league => ({
    name: league,
    matches: groupedMatches[league]
  }));

  // Handle refresh request
  const handleRefresh = () => {
    fetchMatches();
  };

  // Enhanced loading state with skeleton cards
  const renderLoadingState = () => (
    <Container maxW="container.xl" pt={8}>
      {/* Header skeleton */}
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <VStack align="start" spacing={2}>
          <Skeleton height="32px" width="200px" />
          <Skeleton height="16px" width="120px" />
        </VStack>
        <HStack spacing={3}>
          <Skeleton height="40px" width="100px" />
          <Skeleton height="40px" width="80px" />
        </HStack>
      </Flex>

      {/* Tab skeleton */}
      <HStack spacing={4} mb={6}>
        <Skeleton height="32px" width="100px" borderRadius="lg" />
        <Skeleton height="32px" width="120px" borderRadius="lg" />
        <Skeleton height="32px" width="140px" borderRadius="lg" />
      </HStack>

      {/* Match cards skeleton */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Box
            key={index}
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="xl"
            p={5}
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Skeleton height="16px" width="120px" />
              <Skeleton height="20px" width="60px" borderRadius="md" />
            </Flex>
            <VStack spacing={3}>
              <Flex align="center" justify="space-between" w="full">
                <HStack spacing={3}>
                  <Skeleton boxSize="32px" borderRadius="md" />
                  <VStack align="start" spacing={1}>
                    <Skeleton height="16px" width="100px" />
                    <Skeleton height="12px" width="40px" />
                  </VStack>
                </HStack>
                <Skeleton height="24px" width="40px" borderRadius="lg" />
              </Flex>
              <Skeleton height="1px" width="full" />
              <Flex align="center" justify="space-between" w="full">
                <HStack spacing={3}>
                  <Skeleton boxSize="32px" borderRadius="md" />
                  <VStack align="start" spacing={1}>
                    <Skeleton height="16px" width="100px" />
                    <Skeleton height="12px" width="40px" />
                  </VStack>
                </HStack>
                <Skeleton height="24px" width="40px" borderRadius="lg" />
              </Flex>
            </VStack>
            <Flex justify="space-between" align="center" mt={4} pt={3}>
              <Skeleton height="12px" width="80px" />
              <Skeleton boxSize="16px" />
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );

  if (loading) {
    return (
      <>
        <Loader isOpen={loading} variant="ring" />
        {renderLoadingState()}
      </>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" pt={8}>
        <Flex justifyContent="space-between" alignItems="center" mb={8}>
          <VStack align="start" spacing={2}>
            <HStack spacing={3}>
              <Icon as={isUpcomingPage ? FiCalendar : BsLightningFill}
                    color={isUpcomingPage ? "upcoming.500" : "live.500"}
                    boxSize={6} />
              <Heading size="lg" color={useColorModeValue('gray.800', 'gray.100')}>
                {isUpcomingPage ? "Upcoming Matches" : "Live Matches"}
              </Heading>
            </HStack>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              {isUpcomingPage ? "Discover upcoming football matches" : "Follow live football action"}
            </Text>
          </VStack>
          <Button
            leftIcon={<Icon as={FiRefreshCw} />}
            colorScheme={isUpcomingPage ? "upcoming" : "live"}
            onClick={handleRefresh}
            size="lg"
          >
            Retry
          </Button>
        </Flex>

        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="xl"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Unable to load matches
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {error}
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (matches.length === 0) {
    return (
      <Container maxW="container.xl" pt={8}>
        <Flex justifyContent="space-between" alignItems="center" mb={8}>
          <VStack align="start" spacing={2}>
            <HStack spacing={3}>
              <Icon as={isUpcomingPage ? FiCalendar : BsLightningFill}
                    color={isUpcomingPage ? "upcoming.500" : "live.500"}
                    boxSize={6} />
              <Heading size="lg" color={useColorModeValue('gray.800', 'gray.100')}>
                {isUpcomingPage ? "Upcoming Matches" : "Live Matches"}
              </Heading>
            </HStack>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              {isUpcomingPage ? "Discover upcoming football matches" : "Follow live football action"}
            </Text>
          </VStack>
          <Button
            leftIcon={<Icon as={FiRefreshCw} />}
            colorScheme={isUpcomingPage ? "upcoming" : "live"}
            onClick={handleRefresh}
            size="lg"
          >
            Refresh
          </Button>
        </Flex>

        <VStack spacing={6} py={12}>
          <Icon
            as={MdSportsSoccer}
            boxSize={16}
            color={useColorModeValue('gray.300', 'gray.600')}
          />
          <VStack spacing={2}>
            <Text fontSize="xl" fontWeight="600" color={useColorModeValue('gray.700', 'gray.300')}>
              {isUpcomingPage ? "No upcoming matches found" : "No live matches at the moment"}
            </Text>
            <Text color={useColorModeValue('gray.500', 'gray.500')} textAlign="center" maxW="md">
              {isUpcomingPage
                ? "Check back later for upcoming football matches or try refreshing the page."
                : "All matches have finished or haven't started yet. Check the upcoming matches tab."
              }
            </Text>
          </VStack>
          <Button
            leftIcon={<Icon as={FiRefreshCw} />}
            variant="outline"
            colorScheme={isUpcomingPage ? "upcoming" : "live"}
            onClick={handleRefresh}
          >
            Refresh Now
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue('gray.50', '#0f0f23')}
      bgGradient={useColorModeValue(
        'linear(to-br, gray.50, gray.100)',
        'linear(to-br, #0f0f23, #1a1a3a)'
      )}
    >
      <Container maxW="container.xl" pt={8} pb={12}>
        {/* Enhanced Header */}
        <VStack spacing={6} mb={8}>
          <Flex justifyContent="space-between" alignItems="center" w="full">
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg={useColorModeValue(
                    isUpcomingPage ? 'upcoming.50' : 'live.50',
                    isUpcomingPage ? 'upcoming.900' : 'live.900'
                  )}
                  border="1px solid"
                  borderColor={useColorModeValue(
                    isUpcomingPage ? 'upcoming.200' : 'live.200',
                    isUpcomingPage ? 'upcoming.700' : 'live.700'
                  )}
                >
                  <Icon
                    as={isUpcomingPage ? FiCalendar : BsLightningFill}
                    color={isUpcomingPage ? "upcoming.500" : "live.500"}
                    boxSize={6}
                  />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading
                    size="xl"
                    color={useColorModeValue('gray.800', 'gray.100')}
                    fontWeight="700"
                  >
                    {isUpcomingPage ? "Upcoming Matches" : "Live Matches"}
                  </Heading>
                  <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')}>
                    {isUpcomingPage ? "Discover upcoming football matches" : "Follow live football action"}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={MdAnalytics} />}
                colorScheme="brand"
                variant="outline"
                size="lg"
                onClick={() => navigate("/analytics")}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
              >
                Analytics
              </Button>
              <Button
                leftIcon={<Icon as={FiRefreshCw} />}
                colorScheme={isUpcomingPage ? "upcoming" : "live"}
                isLoading={loading}
                onClick={handleRefresh}
                size="lg"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
              >
                Refresh
              </Button>
            </HStack>
          </Flex>

          {/* Statistics Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
            <Stat
              bg={useColorModeValue('white', 'gray.800')}
              p={6}
              borderRadius="xl"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              boxShadow={useColorModeValue(
                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
              )}
            >
              <StatLabel color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm" fontWeight="600">
                Total Matches
              </StatLabel>
              <StatNumber
                fontSize="2xl"
                fontWeight="800"
                color={useColorModeValue('gray.800', 'gray.100')}
              >
                {matches.length}
              </StatNumber>
              <StatHelpText color={useColorModeValue('gray.500', 'gray.500')} fontSize="xs">
                <Icon as={FiActivity} mr={1} />
                Available now
              </StatHelpText>
            </Stat>

            <Stat
              bg={useColorModeValue('white', 'gray.800')}
              p={6}
              borderRadius="xl"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              boxShadow={useColorModeValue(
                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
              )}
            >
              <StatLabel color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm" fontWeight="600">
                Leagues
              </StatLabel>
              <StatNumber
                fontSize="2xl"
                fontWeight="800"
                color={useColorModeValue('gray.800', 'gray.100')}
              >
                {leagueGroups.length}
              </StatNumber>
              <StatHelpText color={useColorModeValue('gray.500', 'gray.500')} fontSize="xs">
                <Icon as={FiTrendingUp} mr={1} />
                Different competitions
              </StatHelpText>
            </Stat>

            <Stat
              bg={useColorModeValue('white', 'gray.800')}
              p={6}
              borderRadius="xl"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              boxShadow={useColorModeValue(
                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
              )}
            >
              <StatLabel color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm" fontWeight="600">
                Status
              </StatLabel>
              <StatNumber
                fontSize="2xl"
                fontWeight="800"
                color={isUpcomingPage ? 'upcoming.500' : 'live.500'}
              >
                {isUpcomingPage ? 'Upcoming' : 'Live'}
              </StatNumber>
              <StatHelpText color={useColorModeValue('gray.500', 'gray.500')} fontSize="xs">
                <Icon as={isUpcomingPage ? FiCalendar : BsLightningFill} mr={1} />
                {isUpcomingPage ? 'Scheduled matches' : 'Real-time updates'}
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </VStack>

        {/* Enhanced Tabs */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="xl"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          boxShadow={useColorModeValue(
            '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
          )}
          overflow="hidden"
        >
          <Tabs
            variant="soft-rounded"
            colorScheme={isUpcomingPage ? "upcoming" : "live"}
            index={activeTab}
            onChange={(index) => setActiveTab(index)}
          >
            <Box p={6} pb={0}>
              <TabList
                mb={6}
                overflowX="auto"
                css={{ scrollbarWidth: "thin" }}
                gap={2}
              >
                <Tab
                  _selected={{
                    bg: isUpcomingPage ? "upcoming.500" : "live.500",
                    color: "white",
                    fontWeight: "600",
                    boxShadow: "md"
                  }}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                    transform: 'translateY(-1px)'
                  }}
                  borderRadius="lg"
                  px={6}
                  py={3}
                  fontWeight="500"
                  transition="all 0.2s"
                >
                  All Matches
                  <Badge
                    ml={2}
                    variant="subtle"
                    colorScheme={isUpcomingPage ? "upcoming" : "live"}
                    borderRadius="full"
                  >
                    {matches.length}
                  </Badge>
                </Tab>
                {leagueGroups.map((league, idx) => (
                  <Tab
                    key={idx}
                    _selected={{
                      bg: isUpcomingPage ? "upcoming.500" : "live.500",
                      color: "white",
                      fontWeight: "600",
                      boxShadow: "md"
                    }}
                    _hover={{
                      bg: useColorModeValue('gray.100', 'gray.700'),
                      transform: 'translateY(-1px)'
                    }}
                    borderRadius="lg"
                    px={6}
                    py={3}
                    fontWeight="500"
                    transition="all 0.2s"
                    whiteSpace="nowrap"
                  >
                    {league.name}
                    <Badge
                      ml={2}
                      variant="subtle"
                      colorScheme={isUpcomingPage ? "upcoming" : "live"}
                      borderRadius="full"
                    >
                      {league.matches.length}
                    </Badge>
                  </Tab>
                ))}
              </TabList>
            </Box>

            <TabPanels>
              <TabPanel p={6} pt={0}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onClick={() => navigate(`/match/${match.id}`)}
                    />
                  ))}
                </SimpleGrid>
              </TabPanel>

              {leagueGroups.map((league, idx) => (
                <TabPanel key={idx} p={6} pt={0}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Divider />
                      <Text
                        fontSize="lg"
                        fontWeight="600"
                        color={useColorModeValue('gray.700', 'gray.300')}
                        whiteSpace="nowrap"
                      >
                        {league.name}
                      </Text>
                      <Divider />
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {league.matches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          onClick={() => navigate(`/match/${match.id}`)}
                        />
                      ))}
                    </SimpleGrid>
                  </VStack>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
};

export default LiveMatches;