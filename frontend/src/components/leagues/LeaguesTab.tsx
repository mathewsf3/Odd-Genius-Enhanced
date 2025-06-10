import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  ButtonGroup,
  Grid,
  Badge,
  Image,
  Spinner,
  Center,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Tooltip,
  Switch,
  FormControl,
  FormLabel,
  Container,
  SimpleGrid,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiPlay,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiGlobe
} from 'react-icons/fi';
import { League, LeagueFilters, LogoAsset, fetchEnhancedLeagues } from '../../services/leaguesService';

// Props interface
interface LeaguesTabProps {
  onLeagueSelect?: (league: League) => void;
  showFilters?: boolean;
  defaultView?: 'grid' | 'list';
  realTimeUpdates?: boolean;
}

// League card component
interface LeagueCardProps {
  league: League;
  onClick?: (league: League) => void;
  view: 'grid' | 'list';
}

const LeagueCard: React.FC<LeagueCardProps> = ({ league, onClick, view }) => {
  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const liveBadgeBg = useColorModeValue('red.500', 'red.600');
  const upcomingBadgeBg = useColorModeValue('blue.500', 'blue.600');

  // Status badge configuration
  const getStatusBadge = () => {
    switch (league.status) {
      case 'live':
        return (
          <Badge colorScheme="red" variant="solid" fontSize="xs" px={2} py={1}>
            <Icon as={FiPlay} mr={1} boxSize={3} />
            LIVE
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge colorScheme="blue" variant="solid" fontSize="xs" px={2} py={1}>
            <Icon as={FiClock} mr={1} boxSize={3} />
            UPCOMING
          </Badge>
        );
      case 'finished':
        return (
          <Badge colorScheme="gray" variant="solid" fontSize="xs" px={2} py={1}>
            <Icon as={FiCheckCircle} mr={1} boxSize={3} />
            FINISHED
          </Badge>
        );
      default:
        return null;
    }
  };

  // Logo component with fallback
  const LeagueLogo: React.FC<{ logo: LogoAsset; size?: string }> = ({ logo, size = "48px" }) => (
    <Image
      src={logo.url}
      alt={league.name}
      boxSize={size}
      objectFit="contain"
      fallbackSrc={logo.fallbackUrl}
      borderRadius="md"
      border="1px solid"
      borderColor={borderColor}
      p={1}
      backgroundColor="white"
      onError={(e) => {
        console.log(`[LeagueLogo] Error loading logo for ${league.name}, using fallback`);
      }}
    />
  );

  if (view === 'list') {
    return (
      <Box
        p={4}
        bg={cardBg}
        borderRadius="md"
        border="1px solid"
        borderColor={borderColor}
        cursor="pointer"
        onClick={() => onClick?.(league)}
        _hover={{ bg: hoverBg, transform: 'translateY(-1px)' }}
        transition="all 0.2s"
      >
        <Flex align="center" justify="space-between">
          <Flex align="center" flex="1">
            <LeagueLogo logo={league.logo} size="40px" />
            <Box ml={3} flex="1">
              <Text fontWeight="bold" fontSize="md" color={textColor}>
                {league.name}
              </Text>
              <Text fontSize="sm" color={mutedColor}>
                {league.country} • Season {league.season}
              </Text>
            </Box>
          </Flex>

          <HStack spacing={3}>
            {league.liveMatches && league.liveMatches > 0 && (
              <Badge colorScheme="red" variant="outline">
                {league.liveMatches} live
              </Badge>
            )}
            {league.upcomingMatches && league.upcomingMatches > 0 && (
              <Badge colorScheme="blue" variant="outline">
                {league.upcomingMatches} upcoming
              </Badge>
            )}
            {getStatusBadge()}
          </HStack>
        </Flex>
      </Box>
    );
  }

  // Grid view
  return (
    <Box
      p={5}
      bg={cardBg}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      cursor="pointer"
      onClick={() => onClick?.(league)}
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-2px)',
        boxShadow: 'lg'
      }}
      transition="all 0.2s"
      position="relative"
      minH="200px"
    >
      {/* Status badge */}
      <Box position="absolute" top={3} right={3}>
        {getStatusBadge()}
      </Box>

      <VStack spacing={4} align="center" h="full">
        {/* League logo */}
        <LeagueLogo logo={league.logo} size="64px" />

        {/* League info */}
        <VStack spacing={1} textAlign="center" flex="1">
          <Text fontWeight="bold" fontSize="md" color={textColor} noOfLines={2}>
            {league.name}
          </Text>
          <Text fontSize="sm" color={mutedColor}>
            {league.country}
          </Text>
          <Text fontSize="xs" color={mutedColor}>
            Season {league.season}
          </Text>
        </VStack>

        {/* Match counts */}
        <HStack spacing={2} mt="auto">
          {league.liveMatches && league.liveMatches > 0 && (
            <Badge colorScheme="red" variant="subtle" fontSize="xs">
              {league.liveMatches} live
            </Badge>
          )}
          {league.upcomingMatches && league.upcomingMatches > 0 && (
            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
              {league.upcomingMatches} upcoming
            </Badge>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

// Loading skeleton component
const LeagueCardSkeleton: React.FC<{ view: 'grid' | 'list' }> = ({ view }) => {
  if (view === 'list') {
    return (
      <Box p={4} borderRadius="md" border="1px solid" borderColor="gray.200">
        <Flex align="center">
          <Skeleton boxSize="40px" borderRadius="md" />
          <Box ml={3} flex="1">
            <Skeleton height="20px" width="60%" mb={2} />
            <Skeleton height="16px" width="40%" />
          </Box>
          <HStack spacing={2}>
            <Skeleton height="24px" width="60px" />
            <Skeleton height="24px" width="80px" />
          </HStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box p={5} borderRadius="lg" border="1px solid" borderColor="gray.200" minH="200px">
      <VStack spacing={4} align="center">
        <Skeleton boxSize="64px" borderRadius="md" />
        <VStack spacing={2} textAlign="center" flex="1">
          <Skeleton height="20px" width="80%" />
          <Skeleton height="16px" width="60%" />
          <Skeleton height="14px" width="40%" />
        </VStack>
        <HStack spacing={2}>
          <Skeleton height="20px" width="50px" />
          <Skeleton height="20px" width="70px" />
        </HStack>
      </VStack>
    </Box>
  );
};

const LeaguesTab: React.FC<LeaguesTabProps> = ({
  onLeagueSelect,
  showFilters = true,
  defaultView = 'grid',
  realTimeUpdates = true
}) => {
  // State management
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>(defaultView);
  const [filters, setFilters] = useState<LeagueFilters>({
    status: 'all',
    search: '',
    country: '',
    hasMatches: false
  });
  const [realTimeEnabled, setRealTimeEnabled] = useState(realTimeUpdates);

  // Theme colors
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  // Load leagues with real API integration
  useEffect(() => {
    const loadLeagues = async () => {
      setLoading(true);
      try {
        console.log('[LeaguesTab] Loading enhanced leagues with filters:', filters);

        // Fetch enhanced leagues with current filters
        const enhancedLeagues = await fetchEnhancedLeagues(filters);

        console.log(`[LeaguesTab] Successfully loaded ${enhancedLeagues.length} leagues:`, enhancedLeagues.slice(0, 3));
        setLeagues(enhancedLeagues);
        setError(null);

        // Show some sample leagues in console for debugging
        if (enhancedLeagues.length > 0) {
          console.log('[LeaguesTab] Sample leagues:', enhancedLeagues.slice(0, 5).map(l => ({
            name: l.name,
            country: l.country,
            status: l.status,
            liveMatches: l.liveMatches,
            upcomingMatches: l.upcomingMatches
          })));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load leagues';
        setError(errorMessage);
        console.error('[LeaguesTab] Error loading leagues:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLeagues();
  }, [filters]);

  // Real-time updates for live leagues
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(async () => {
      try {
        console.log('[LeaguesTab] Real-time update...');
        const updatedLeagues = await fetchEnhancedLeagues(filters);

        // Only update if there are actual changes to avoid unnecessary re-renders
        const hasChanges = updatedLeagues.some((newLeague, index) => {
          const oldLeague = leagues[index];
          return !oldLeague ||
                 newLeague.liveMatches !== oldLeague.liveMatches ||
                 newLeague.upcomingMatches !== oldLeague.upcomingMatches ||
                 newLeague.status !== oldLeague.status;
        });

        if (hasChanges) {
          console.log('[LeaguesTab] Real-time changes detected, updating...');
          setLeagues(updatedLeagues);
        }
      } catch (err) {
        console.error('[LeaguesTab] Real-time update failed:', err);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled, filters, leagues]);

  // Filtered leagues - show ALL leagues by default
  const filteredLeagues = useMemo(() => {
    console.log(`[LeaguesTab] Filtering ${leagues.length} leagues with filters:`, filters);

    const filtered = leagues.filter(league => {
      // Search filter
      if (filters.search && !league.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !league.country.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Country filter
      if (filters.country && league.country !== filters.country) {
        return false;
      }

      // Status filter - only apply if not 'all'
      if (filters.status !== 'all' && league.status !== filters.status) {
        return false;
      }

      // Only filter by hasMatches if explicitly enabled
      if (filters.hasMatches === true && (!league.liveMatches && !league.upcomingMatches)) {
        return false;
      }

      return true;
    });

    console.log(`[LeaguesTab] Filtered to ${filtered.length} leagues`);
    return filtered;
  }, [leagues, filters]);

  return (
    <Box bg={bg} minH="100vh" p={6}>
      <Container maxW="7xl">
        {/* Header */}
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="lg" color={textColor} mb={2}>
              Football Leagues
            </Heading>
            <Text color={mutedColor}>
              Discover live and upcoming football leagues from around the world
            </Text>
          </Box>

          {/* Filters and Controls */}
          {showFilters && (
            <Box
              p={4}
              bg={cardBg}
              borderRadius="lg"
              border="1px solid"
              borderColor={borderColor}
            >
              <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="center">
                {/* Search */}
                <InputGroup flex="1" maxW="300px">
                  <InputLeftElement>
                    <Icon as={FiSearch} color={mutedColor} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search leagues..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </InputGroup>

                {/* Status filter */}
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  maxW="150px"
                >
                  <option value="all">All Status</option>
                  <option value="live">Live</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="finished">Finished</option>
                </Select>

                {/* View toggle */}
                <ButtonGroup isAttached>
                  <Button
                    leftIcon={<FiGrid />}
                    variant={view === 'grid' ? 'solid' : 'outline'}
                    onClick={() => setView('grid')}
                    size="sm"
                  >
                    Grid
                  </Button>
                  <Button
                    leftIcon={<FiList />}
                    variant={view === 'list' ? 'solid' : 'outline'}
                    onClick={() => setView('list')}
                    size="sm"
                  >
                    List
                  </Button>
                </ButtonGroup>

                {/* Real-time toggle */}
                <FormControl display="flex" alignItems="center" w="auto">
                  <FormLabel htmlFor="realtime" mb="0" fontSize="sm">
                    Real-time
                  </FormLabel>
                  <Switch
                    id="realtime"
                    isChecked={realTimeEnabled}
                    onChange={(e) => setRealTimeEnabled(e.target.checked)}
                  />
                </FormControl>
              </Flex>
            </Box>
          )}

          {/* Results count */}
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text color={mutedColor} fontSize="sm">
                {loading ? 'Loading...' : `${filteredLeagues.length} leagues found`}
              </Text>
              {!loading && filteredLeagues.length > 0 && (
                <Text color="orange.500" fontSize="xs">
                  ⚠️ Backend offline - showing all leagues (live/upcoming status unavailable)
                </Text>
              )}
            </VStack>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </Flex>

          {/* Leagues grid/list */}
          {loading ? (
            <SimpleGrid columns={{ base: 1, md: view === 'grid' ? 3 : 1, lg: view === 'grid' ? 4 : 1 }} spacing={4}>
              {Array.from({ length: 8 }).map((_, i) => (
                <LeagueCardSkeleton key={i} view={view} />
              ))}
            </SimpleGrid>
          ) : error ? (
            <Center py={10}>
              <VStack spacing={4}>
                <Text color="red.500">{error}</Text>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </VStack>
            </Center>
          ) : filteredLeagues.length === 0 ? (
            <Center py={10}>
              <VStack spacing={4}>
                <Icon as={FiGlobe} boxSize={10} color={mutedColor} />
                <Text color={mutedColor}>No leagues found matching your criteria</Text>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid
              columns={{ base: 1, md: view === 'grid' ? 3 : 1, lg: view === 'grid' ? 4 : 1 }}
              spacing={4}
            >
              {filteredLeagues.map((league) => (
                <LeagueCard
                  key={league.id}
                  league={league}
                  onClick={onLeagueSelect}
                  view={view}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default LeaguesTab;
