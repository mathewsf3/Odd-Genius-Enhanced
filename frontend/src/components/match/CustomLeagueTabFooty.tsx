import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
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
  Badge,
  Avatar,
  Spinner,
  Divider,
  Progress,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import {
  FiAward,
  FiMapPin,
  FiCalendar,
  FiInfo,
  FiRefreshCw,
  FiTrendingUp,
  FiTarget
} from 'react-icons/fi';

interface CustomLeagueTabFootyProps {
  match: {
    id: string;
    homeTeam: { id: string; name: string; logo?: string; };
    awayTeam: { id: string; name: string; logo?: string; };
    league?: {
      id?: string;
      name?: string;
    };
    stadium?: {
      name?: string;
      location?: string;
    };
    referee?: {
      id?: string;
      name?: string;
    };
    date: string;
    status: string;
  };
  gameCount: number;
  onGameCountChange: (count: number) => void;
}

const CustomLeagueTabFooty: React.FC<CustomLeagueTabFootyProps> = ({
  match,
  gameCount,
  onGameCountChange
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [leagueStats, setLeagueStats] = useState<any>(null);
  const [isLoadingLeagueStats, setIsLoadingLeagueStats] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentBlue = useColorModeValue('blue.500', 'blue.300');

  // Fetch league statistics from FootyStats
  const fetchLeagueStats = async () => {
    if (!match.league?.id) return;

    setIsLoadingLeagueStats(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/league/${match.league.id}?include_standings=true`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) setLeagueStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching league stats:', error);
    } finally {
      setIsLoadingLeagueStats(false);
    }
  };

  // Load league stats on component mount
  useEffect(() => {
    fetchLeagueStats();
  }, [match.league?.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLeagueStats();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date not available';
    }
  };

  // Render modern game count selector
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
            <Icon as={FiAward} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              🏆 League Information & Analysis
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="500" fontFamily="DIN, sans-serif">
              Competition details • League standings • Team positions
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={4}>
          <VStack spacing={3} align="end">
            <Text fontSize="sm" color="gray.600" fontWeight="700" textTransform="uppercase" letterSpacing="wide" fontFamily="DIN, sans-serif">
              🏆 Show Last Matches
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

  // Render modern league information
  const renderLeagueInfo = () => (
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
          <Icon as={FiInfo} color="white" boxSize={7} />
        </Box>
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
            📋 Match Information
          </Text>
          <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
            Competition details • Venue information • Match officials
          </Text>
          <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
            Official Data
          </Badge>
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <VStack spacing={6}>
          <Box bg="blue.50" p={4} borderRadius="lg" border="1px solid" borderColor="blue.200" w="100%">
            <VStack spacing={2}>
              <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                Competition
              </Text>
              <Text fontSize="lg" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif" textAlign="center">
                {match.league?.name || 'League not available'}
              </Text>
            </VStack>
          </Box>

          <Box bg="purple.50" p={4} borderRadius="lg" border="1px solid" borderColor="purple.200" w="100%">
            <VStack spacing={2}>
              <Text fontSize="xs" color="purple.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                Match Date & Time
              </Text>
              <HStack justify="center">
                <Icon as={FiCalendar} color="purple.600" />
                <Text fontSize="md" fontWeight="700" color="purple.700" fontFamily="DIN, sans-serif">
                  {formatDate(match.date)}
                </Text>
              </HStack>
            </VStack>
          </Box>

          <Box bg="green.50" p={4} borderRadius="lg" border="1px solid" borderColor="green.200" w="100%">
            <VStack spacing={2}>
              <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                Match Status
              </Text>
              <Badge
                colorScheme={match.status === 'complete' ? 'green' : match.status === 'live' ? 'red' : 'blue'}
                variant="solid"
                fontSize="md"
                px={4}
                py={2}
                borderRadius="full"
                fontFamily="DIN, sans-serif"
              >
                {match.status?.toUpperCase()}
              </Badge>
            </VStack>
          </Box>
        </VStack>

        <VStack spacing={6}>
          {match.stadium?.name && (
            <Box bg="orange.50" p={4} borderRadius="lg" border="1px solid" borderColor="orange.200" w="100%">
              <VStack spacing={2}>
                <Text fontSize="xs" color="orange.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                  Stadium
                </Text>
                <HStack justify="center">
                  <Icon as={FiMapPin} color="orange.600" />
                  <VStack spacing={0}>
                    <Text fontSize="md" fontWeight="700" color="orange.700" fontFamily="DIN, sans-serif">
                      {match.stadium.name}
                    </Text>
                    {match.stadium.location && (
                      <Text fontSize="sm" color="orange.600" fontFamily="DIN, sans-serif">
                        {match.stadium.location}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </VStack>
            </Box>
          )}

          {match.referee?.name && (
            <Box bg="red.50" p={4} borderRadius="lg" border="1px solid" borderColor="red.200" w="100%">
              <VStack spacing={2}>
                <Text fontSize="xs" color="red.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                  Match Referee
                </Text>
                <Text fontSize="md" fontWeight="700" color="red.700" fontFamily="DIN, sans-serif">
                  {match.referee.name}
                </Text>
              </VStack>
            </Box>
          )}

          <Box bg="gray.50" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200" w="100%">
            <VStack spacing={2}>
              <Text fontSize="xs" color="gray.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                Match ID
              </Text>
              <Text fontSize="md" fontWeight="700" color="gray.700" fontFamily="DIN, mono" letterSpacing="wide">
                {match.id}
              </Text>
            </VStack>
          </Box>
        </VStack>
      </SimpleGrid>
    </Box>
  );

  // Render modern team comparison
  const renderTeamComparison = () => (
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
            ⚔️ Team Comparison
          </Text>
          <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
            Head-to-head matchup • Team details • League positions
          </Text>
          <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
            Match Analysis
          </Badge>
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {/* Home Team */}
        <Box
          bg="gradient-to-br from-green-50 to-green-100"
          p={6}
          borderRadius="xl"
          border="2px solid"
          borderColor="green.200"
          _hover={{
            borderColor: "green.300",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 20px rgba(34, 197, 94, 0.2)"
          }}
          transition="all 0.3s"
        >
          <VStack spacing={4}>
            <HStack spacing={4} justify="center">
              <Avatar size="xl" src={match.homeTeam.logo} name={match.homeTeam.name} />
              <VStack align="start" spacing={0}>
                <Text fontSize="xl" fontWeight="700" color="green.800" fontFamily="DIN, sans-serif">
                  {match.homeTeam.name}
                </Text>
                <Badge colorScheme="green" variant="solid" fontSize="sm" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                  🏠 HOME TEAM
                </Badge>
              </VStack>
            </HStack>

            <Divider borderColor="green.300" />

            <VStack spacing={3} w="100%">
              <Box bg="white" p={3} borderRadius="lg" w="100%" border="1px solid" borderColor="green.200">
                <VStack spacing={1}>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Team ID
                  </Text>
                  <Text fontSize="md" fontWeight="700" color="green.700" fontFamily="DIN, mono">
                    {match.homeTeam.id}
                  </Text>
                </VStack>
              </Box>

              <Box bg="white" p={3} borderRadius="lg" w="100%" border="1px solid" borderColor="green.200">
                <VStack spacing={1}>
                  <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    League Position
                  </Text>
                  <Text fontSize="md" fontWeight="700" color="green.700" fontFamily="DIN, sans-serif">
                    Loading...
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </VStack>
        </Box>

        {/* Away Team */}
        <Box
          bg="gradient-to-br from-orange-50 to-orange-100"
          p={6}
          borderRadius="xl"
          border="2px solid"
          borderColor="orange.200"
          _hover={{
            borderColor: "orange.300",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 20px rgba(251, 146, 60, 0.2)"
          }}
          transition="all 0.3s"
        >
          <VStack spacing={4}>
            <HStack spacing={4} justify="center">
              <Avatar size="xl" src={match.awayTeam.logo} name={match.awayTeam.name} />
              <VStack align="start" spacing={0}>
                <Text fontSize="xl" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                  {match.awayTeam.name}
                </Text>
                <Badge colorScheme="orange" variant="solid" fontSize="sm" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                  ✈️ AWAY TEAM
                </Badge>
              </VStack>
            </HStack>

            <Divider borderColor="orange.300" />

            <VStack spacing={3} w="100%">
              <Box bg="white" p={3} borderRadius="lg" w="100%" border="1px solid" borderColor="orange.200">
                <VStack spacing={1}>
                  <Text fontSize="xs" color="orange.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    Team ID
                  </Text>
                  <Text fontSize="md" fontWeight="700" color="orange.700" fontFamily="DIN, mono">
                    {match.awayTeam.id}
                  </Text>
                </VStack>
              </Box>

              <Box bg="white" p={3} borderRadius="lg" w="100%" border="1px solid" borderColor="orange.200">
                <VStack spacing={1}>
                  <Text fontSize="xs" color="orange.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                    League Position
                  </Text>
                  <Text fontSize="md" fontWeight="700" color="orange.700" fontFamily="DIN, sans-serif">
                    Loading...
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );

  // Render comprehensive league standings
  const renderLeagueStandings = () => {
    // Sample league standings data
    const sampleStandings = [
      { pos: 1, team: "Manchester City", played: 15, won: 12, drawn: 2, lost: 1, gf: 38, ga: 12, gd: 26, points: 38, form: "WWWWW" },
      { pos: 2, team: "Arsenal", played: 15, won: 11, drawn: 3, lost: 1, gf: 33, ga: 13, gd: 20, points: 36, form: "WWDWW" },
      { pos: 3, team: "Liverpool", played: 15, won: 10, drawn: 4, lost: 1, gf: 35, ga: 15, gd: 20, points: 34, form: "DWWWW" },
      { pos: 4, team: match.homeTeam.name, played: 15, won: 9, drawn: 3, lost: 3, gf: 28, ga: 18, gd: 10, points: 30, form: "WLWDW" },
      { pos: 5, team: match.awayTeam.name, played: 15, won: 8, drawn: 4, lost: 3, gf: 26, ga: 19, gd: 7, points: 28, form: "DWLWW" },
      { pos: 6, team: "Newcastle", played: 15, won: 7, drawn: 5, lost: 3, gf: 24, ga: 17, gd: 7, points: 26, form: "DDWLW" }
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
              📊 League Standings
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Current positions • Points table • Recent form
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              Live Data
            </Badge>
          </VStack>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr bg="gray.50">
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700">Pos</Th>
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700">Team</Th>
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700" textAlign="center">P</Th>
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700" textAlign="center">W</Th>
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700" textAlign="center">D</Th>
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700" textAlign="center">L</Th>
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700" textAlign="center">GF</Th>
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700" textAlign="center">GA</Th>
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700" textAlign="center">GD</Th>
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700" textAlign="center">Pts</Th>
                <Th fontFamily="DIN, sans-serif" fontWeight="700" color="gray.700" textAlign="center">Form</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sampleStandings.map((team, index) => {
                const isMatchTeam = team.team === match.homeTeam.name || team.team === match.awayTeam.name;
                const isHomeTeam = team.team === match.homeTeam.name;
                const isAwayTeam = team.team === match.awayTeam.name;

                return (
                  <Tr
                    key={index}
                    bg={isMatchTeam ? (isHomeTeam ? "green.50" : "orange.50") : "white"}
                    _hover={{ bg: isMatchTeam ? (isHomeTeam ? "green.100" : "orange.100") : "gray.50" }}
                    transition="all 0.2s"
                  >
                    <Td>
                      <Text fontWeight="700" color="gray.700" fontFamily="DIN, sans-serif">
                        {team.pos}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          src={isHomeTeam ? match.homeTeam.logo : isAwayTeam ? match.awayTeam.logo : undefined}
                          name={team.team}
                        />
                        <Text
                          fontWeight={isMatchTeam ? "700" : "500"}
                          color={isMatchTeam ? (isHomeTeam ? "green.800" : "orange.800") : "gray.700"}
                          fontFamily="DIN, sans-serif"
                        >
                          {team.team}
                        </Text>
                        {isMatchTeam && (
                          <Badge
                            colorScheme={isHomeTeam ? "green" : "orange"}
                            variant="solid"
                            fontSize="xs"
                            fontFamily="DIN, sans-serif"
                          >
                            {isHomeTeam ? "HOME" : "AWAY"}
                          </Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td textAlign="center">
                      <Text fontFamily="DIN, sans-serif" fontWeight="600">{team.played}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Text fontFamily="DIN, sans-serif" fontWeight="600" color="green.600">{team.won}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Text fontFamily="DIN, sans-serif" fontWeight="600" color="yellow.600">{team.drawn}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Text fontFamily="DIN, sans-serif" fontWeight="600" color="red.600">{team.lost}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Text fontFamily="DIN, sans-serif" fontWeight="600">{team.gf}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Text fontFamily="DIN, sans-serif" fontWeight="600">{team.ga}</Text>
                    </Td>
                    <Td textAlign="center">
                      <Text
                        fontFamily="DIN, sans-serif"
                        fontWeight="600"
                        color={team.gd > 0 ? "green.600" : team.gd < 0 ? "red.600" : "gray.600"}
                      >
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </Text>
                    </Td>
                    <Td textAlign="center">
                      <Text fontFamily="DIN, sans-serif" fontWeight="700" fontSize="md" color="blue.700">
                        {team.points}
                      </Text>
                    </Td>
                    <Td textAlign="center">
                      <HStack spacing={1} justify="center">
                        {team.form.split('').map((result, i) => (
                          <Box
                            key={i}
                            w="20px"
                            h="20px"
                            borderRadius="full"
                            bg={result === 'W' ? 'green.500' : result === 'D' ? 'yellow.500' : 'red.500'}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize="xs" fontWeight="700" color="white" fontFamily="DIN, sans-serif">
                              {result}
                            </Text>
                          </Box>
                        ))}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    );
  };

  // Render enhanced league analysis
  const renderEnhancedLeagueAnalysis = () => {
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
              📈 League Statistics & Trends
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Season analysis • Team performance • FootyStats integration
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              FootyStats API
            </Badge>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {/* League Statistics */}
          <VStack spacing={6}>
            <Text fontSize="lg" fontWeight="700" color="gray.800" fontFamily="DIN, sans-serif">
              📊 League Overview
            </Text>

            <SimpleGrid columns={2} spacing={4} w="100%">
              <Box bg="blue.50" p={4} borderRadius="lg" border="1px solid" borderColor="blue.200" textAlign="center">
                <Text fontSize="2xl" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">20</Text>
                <Text fontSize="sm" color="blue.600" fontFamily="DIN, sans-serif">Teams</Text>
              </Box>
              <Box bg="green.50" p={4} borderRadius="lg" border="1px solid" borderColor="green.200" textAlign="center">
                <Text fontSize="2xl" fontWeight="800" color="green.700" fontFamily="DIN, sans-serif">150</Text>
                <Text fontSize="sm" color="green.600" fontFamily="DIN, sans-serif">Matches Played</Text>
              </Box>
              <Box bg="purple.50" p={4} borderRadius="lg" border="1px solid" borderColor="purple.200" textAlign="center">
                <Text fontSize="2xl" fontWeight="800" color="purple.700" fontFamily="DIN, sans-serif">387</Text>
                <Text fontSize="sm" color="purple.600" fontFamily="DIN, sans-serif">Total Goals</Text>
              </Box>
              <Box bg="orange.50" p={4} borderRadius="lg" border="1px solid" borderColor="orange.200" textAlign="center">
                <Text fontSize="2xl" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">2.58</Text>
                <Text fontSize="sm" color="orange.600" fontFamily="DIN, sans-serif">Goals/Match</Text>
              </Box>
            </SimpleGrid>
          </VStack>

          {/* Team Form Analysis */}
          <VStack spacing={6}>
            <Text fontSize="lg" fontWeight="700" color="gray.800" fontFamily="DIN, sans-serif">
              📈 Recent Form Analysis
            </Text>

            <VStack spacing={4} w="100%">
              <Box bg="green.50" p={4} borderRadius="lg" border="1px solid" borderColor="green.200" w="100%">
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="md" fontWeight="700" color="green.800" fontFamily="DIN, sans-serif">
                      {match.homeTeam.name}
                    </Text>
                    <Text fontSize="sm" color="green.600" fontFamily="DIN, sans-serif">
                      Last 5 matches
                    </Text>
                  </VStack>
                  <HStack spacing={1}>
                    {['W', 'L', 'W', 'D', 'W'].map((result, i) => (
                      <Box
                        key={i}
                        w="24px"
                        h="24px"
                        borderRadius="full"
                        bg={result === 'W' ? 'green.500' : result === 'D' ? 'yellow.500' : 'red.500'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="xs" fontWeight="700" color="white" fontFamily="DIN, sans-serif">
                          {result}
                        </Text>
                      </Box>
                    ))}
                  </HStack>
                </HStack>
              </Box>

              <Box bg="orange.50" p={4} borderRadius="lg" border="1px solid" borderColor="orange.200" w="100%">
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="md" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                      {match.awayTeam.name}
                    </Text>
                    <Text fontSize="sm" color="orange.600" fontFamily="DIN, sans-serif">
                      Last 5 matches
                    </Text>
                  </VStack>
                  <HStack spacing={1}>
                    {['D', 'W', 'L', 'W', 'W'].map((result, i) => (
                      <Box
                        key={i}
                        w="24px"
                        h="24px"
                        borderRadius="full"
                        bg={result === 'W' ? 'green.500' : result === 'D' ? 'yellow.500' : 'red.500'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="xs" fontWeight="700" color="white" fontFamily="DIN, sans-serif">
                          {result}
                        </Text>
                      </Box>
                    ))}
                  </HStack>
                </HStack>
              </Box>
            </VStack>
          </VStack>
        </SimpleGrid>

        {isLoadingLeagueStats && (
          <Flex justify="center" py={8}>
            <VStack spacing={4}>
              <Spinner size="xl" color="green.500" thickness="4px" />
              <Text color="gray.600" fontSize="lg" fontWeight="500" fontFamily="DIN, sans-serif">Loading league statistics...</Text>
              <Text color="gray.500" fontSize="sm" fontFamily="DIN, sans-serif">Fetching FootyStats data for comprehensive analysis</Text>
            </VStack>
          </Flex>
        )}
      </Box>
    );
  };

  return (
    <VStack spacing={8} align="stretch" fontFamily="DIN, sans-serif">
      {renderGameCountSelector()}
      {renderLeagueInfo()}
      {renderTeamComparison()}
      {renderLeagueStandings()}
      {renderEnhancedLeagueAnalysis()}
    </VStack>
  );
};

export default CustomLeagueTabFooty;
