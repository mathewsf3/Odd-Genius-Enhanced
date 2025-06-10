import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
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
  Tabs,
  TabList,
  Tab,
  Badge,
  SimpleGrid,
  Avatar,
  Spinner,
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import {
  FiUsers,
  FiRefreshCw,
  FiTarget,
  FiShield
} from 'react-icons/fi';

interface CustomPlayerStatsTabFootyProps {
  match: {
    id: string;
    homeTeam: { id: string; name: string; logo?: string; };
    awayTeam: { id: string; name: string; logo?: string; };
    lineups?: any;
    bench?: any;
  };
  gameCount: number;
  onGameCountChange: (count: number) => void;
}

const CustomPlayerStatsTabFooty: React.FC<CustomPlayerStatsTabFootyProps> = ({
  match,
  gameCount,
  onGameCountChange
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentBlue = useColorModeValue('blue.500', 'blue.300');

  const handleRefresh = async () => {
    setIsRefreshing(true);
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
            <Icon as={FiUsers} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              👥 Player Statistics Analysis
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="500" fontFamily="DIN, sans-serif">
              Comprehensive player performance metrics and analysis
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={4}>
          <VStack spacing={3} align="end">
            <Text fontSize="sm" color="gray.600" fontWeight="700" textTransform="uppercase" letterSpacing="wide" fontFamily="DIN, sans-serif">
              👥 Show Last Matches
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

  // Render starting lineups
  const renderStartingLineups = () => {
    const homeLineup = [
      { name: "David Martinez", position: "GK", number: 1, rating: 7.8, goals: 0, assists: 0, cards: { yellow: 0, red: 0 } },
      { name: "Carlos Silva", position: "RB", number: 2, rating: 7.5, goals: 0, assists: 1, cards: { yellow: 1, red: 0 } },
      { name: "Marco Rodriguez", position: "CB", number: 4, rating: 8.1, goals: 0, assists: 0, cards: { yellow: 0, red: 0 } },
      { name: "Alex Thompson", position: "CB", number: 5, rating: 7.9, goals: 0, assists: 0, cards: { yellow: 0, red: 0 } },
      { name: "Luis Garcia", position: "LB", number: 3, rating: 7.6, goals: 0, assists: 1, cards: { yellow: 0, red: 0 } },
      { name: "James Wilson", position: "CDM", number: 6, rating: 8.0, goals: 0, assists: 1, cards: { yellow: 1, red: 0 } },
      { name: "David Rodriguez", position: "CM", number: 8, rating: 8.2, goals: 1, assists: 2, cards: { yellow: 0, red: 0 } },
      { name: "Antonio Lopez", position: "CAM", number: 10, rating: 8.4, goals: 1, assists: 1, cards: { yellow: 0, red: 0 } },
      { name: "Roberto Santos", position: "RW", number: 7, rating: 7.7, goals: 0, assists: 1, cards: { yellow: 0, red: 0 } },
      { name: "Marcus Silva", position: "ST", number: 9, rating: 8.5, goals: 2, assists: 0, cards: { yellow: 0, red: 0 } },
      { name: "Miguel Torres", position: "LW", number: 11, rating: 7.8, goals: 0, assists: 1, cards: { yellow: 0, red: 0 } }
    ];

    const awayLineup = [
      { name: "Roberto Sanchez", position: "GK", number: 1, rating: 8.1, goals: 0, assists: 0, cards: { yellow: 0, red: 0 } },
      { name: "Pedro Martinez", position: "RB", number: 2, rating: 7.4, goals: 0, assists: 0, cards: { yellow: 1, red: 0 } },
      { name: "Carlos Mendez", position: "CB", number: 4, rating: 7.7, goals: 0, assists: 0, cards: { yellow: 0, red: 0 } },
      { name: "Diego Lopez", position: "CB", number: 5, rating: 7.6, goals: 0, assists: 0, cards: { yellow: 1, red: 0 } },
      { name: "Fernando Silva", position: "LB", number: 3, rating: 7.5, goals: 0, assists: 1, cards: { yellow: 0, red: 0 } },
      { name: "Andres Garcia", position: "CDM", number: 6, rating: 7.8, goals: 0, assists: 0, cards: { yellow: 0, red: 0 } },
      { name: "James Wilson", position: "CM", number: 8, rating: 7.9, goals: 0, assists: 1, cards: { yellow: 1, red: 0 } },
      { name: "Ricardo Torres", position: "CAM", number: 10, rating: 8.0, goals: 0, assists: 1, cards: { yellow: 0, red: 0 } },
      { name: "Pablo Rodriguez", position: "RW", number: 7, rating: 7.6, goals: 0, assists: 0, cards: { yellow: 0, red: 0 } },
      { name: "Carlos Martinez", position: "ST", number: 9, rating: 8.3, goals: 1, assists: 1, cards: { yellow: 0, red: 0 } },
      { name: "Manuel Santos", position: "LW", number: 11, rating: 7.7, goals: 0, assists: 0, cards: { yellow: 0, red: 0 } }
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
            <Icon as={FiUsers} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              👥 Starting Lineups
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Formation • Player positions • Match performance
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              Official Lineups
            </Badge>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Home Team Lineup */}
          <Box
            bg="gradient-to-br from-green-50 to-green-100"
            p={6}
            borderRadius="xl"
            border="2px solid"
            borderColor="green.200"
          >
            <VStack spacing={6}>
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.homeTeam.logo} name={match.homeTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="green.800" fontFamily="DIN, sans-serif">
                    {match.homeTeam.name}
                  </Text>
                  <Badge colorScheme="green" variant="solid" fontSize="sm" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                    🏠 HOME (4-3-3)
                  </Badge>
                </VStack>
              </HStack>

              <VStack spacing={3} w="100%">
                {homeLineup.map((player, index) => (
                  <Box key={index} bg="white" p={3} borderRadius="lg" w="100%" border="1px solid" borderColor="green.200"
                    _hover={{ borderColor: "green.300", transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Box
                          bg="green.500"
                          color="white"
                          w="30px"
                          h="30px"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="700"
                          fontSize="sm"
                          fontFamily="DIN, sans-serif"
                        >
                          {player.number}
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="700" color="green.800" fontFamily="DIN, sans-serif">
                            {player.name}
                          </Text>
                          <Text fontSize="xs" color="green.600" fontFamily="DIN, sans-serif">
                            {player.position}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="700" color="green.700" fontFamily="DIN, sans-serif">
                          ⭐ {player.rating}
                        </Text>
                        {player.goals > 0 && (
                          <Badge colorScheme="blue" variant="solid" fontSize="xs" fontFamily="DIN, sans-serif">
                            ⚽ {player.goals}
                          </Badge>
                        )}
                        {player.assists > 0 && (
                          <Badge colorScheme="purple" variant="solid" fontSize="xs" fontFamily="DIN, sans-serif">
                            🎯 {player.assists}
                          </Badge>
                        )}
                        {player.cards.yellow > 0 && (
                          <Badge colorScheme="yellow" variant="solid" fontSize="xs" fontFamily="DIN, sans-serif">
                            🟨
                          </Badge>
                        )}
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </Box>

          {/* Away Team Lineup */}
          <Box
            bg="gradient-to-br from-orange-50 to-orange-100"
            p={6}
            borderRadius="xl"
            border="2px solid"
            borderColor="orange.200"
          >
            <VStack spacing={6}>
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.awayTeam.logo} name={match.awayTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                    {match.awayTeam.name}
                  </Text>
                  <Badge colorScheme="orange" variant="solid" fontSize="sm" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                    ✈️ AWAY (4-2-3-1)
                  </Badge>
                </VStack>
              </HStack>

              <VStack spacing={3} w="100%">
                {awayLineup.map((player, index) => (
                  <Box key={index} bg="white" p={3} borderRadius="lg" w="100%" border="1px solid" borderColor="orange.200"
                    _hover={{ borderColor: "orange.300", transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Box
                          bg="orange.500"
                          color="white"
                          w="30px"
                          h="30px"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="700"
                          fontSize="sm"
                          fontFamily="DIN, sans-serif"
                        >
                          {player.number}
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                            {player.name}
                          </Text>
                          <Text fontSize="xs" color="orange.600" fontFamily="DIN, sans-serif">
                            {player.position}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="700" color="orange.700" fontFamily="DIN, sans-serif">
                          ⭐ {player.rating}
                        </Text>
                        {player.goals > 0 && (
                          <Badge colorScheme="blue" variant="solid" fontSize="xs" fontFamily="DIN, sans-serif">
                            ⚽ {player.goals}
                          </Badge>
                        )}
                        {player.assists > 0 && (
                          <Badge colorScheme="purple" variant="solid" fontSize="xs" fontFamily="DIN, sans-serif">
                            🎯 {player.assists}
                          </Badge>
                        )}
                        {player.cards.yellow > 0 && (
                          <Badge colorScheme="yellow" variant="solid" fontSize="xs" fontFamily="DIN, sans-serif">
                            🟨
                          </Badge>
                        )}
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    );
  };

  // Render attacking statistics
  const renderAttackingStats = () => {
    const attackingStats = {
      home: {
        topScorers: [
          { name: "Marcus Silva", goals: 2, assists: 0, shots: 5, shotsOnTarget: 3, conversion: 40 },
          { name: "Antonio Lopez", goals: 1, assists: 1, shots: 3, shotsOnTarget: 2, conversion: 33 },
          { name: "David Rodriguez", goals: 1, assists: 2, shots: 2, shotsOnTarget: 1, conversion: 50 }
        ],
        teamStats: { totalGoals: 4, totalShots: 15, shotsOnTarget: 8, conversion: 27, bigChances: 6 }
      },
      away: {
        topScorers: [
          { name: "Carlos Martinez", goals: 1, assists: 1, shots: 4, shotsOnTarget: 2, conversion: 25 },
          { name: "Ricardo Torres", goals: 0, assists: 1, shots: 3, shotsOnTarget: 1, conversion: 0 },
          { name: "James Wilson", goals: 0, assists: 1, shots: 2, shotsOnTarget: 1, conversion: 0 }
        ],
        teamStats: { totalGoals: 1, totalShots: 12, shotsOnTarget: 5, conversion: 8, bigChances: 3 }
      }
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
            <Icon as={FiTarget} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              ⚽ Attacking Statistics
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Goals • Shots • Assists • Conversion rates • Last {gameCount} matches
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              Live Match Data
            </Badge>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Home Team Attacking Stats */}
          <Box
            bg="gradient-to-br from-blue-50 to-blue-100"
            p={6}
            borderRadius="xl"
            border="2px solid"
            borderColor="blue.200"
          >
            <VStack spacing={6}>
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.homeTeam.logo} name={match.homeTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">
                    {match.homeTeam.name}
                  </Text>
                  <Badge colorScheme="blue" variant="solid" fontSize="sm" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                    🏠 HOME ATTACK
                  </Badge>
                </VStack>
              </HStack>

              {/* Team Attack Overview */}
              <SimpleGrid columns={3} spacing={4} w="100%">
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="blue.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                    {attackingStats.home.teamStats.totalGoals}
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontFamily="DIN, sans-serif">Goals</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="blue.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                    {attackingStats.home.teamStats.totalShots}
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontFamily="DIN, sans-serif">Shots</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="blue.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                    {attackingStats.home.teamStats.conversion}%
                  </Text>
                  <Text fontSize="xs" color="blue.600" fontFamily="DIN, sans-serif">Conversion</Text>
                </Box>
              </SimpleGrid>

              <Divider borderColor="blue.300" />

              {/* Top Scorers */}
              <VStack spacing={4} w="100%">
                <Text fontSize="md" fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">
                  🌟 Top Scorers & Creators
                </Text>

                {attackingStats.home.topScorers.map((player, index) => (
                  <Box key={index} bg="white" p={4} borderRadius="lg" w="100%" border="1px solid" borderColor="blue.200">
                    <VStack spacing={3}>
                      <HStack justify="space-between" w="100%">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="md" fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">
                            {player.name}
                          </Text>
                          <Text fontSize="sm" color="blue.600" fontFamily="DIN, sans-serif">
                            {player.conversion}% conversion rate
                          </Text>
                        </VStack>
                        <HStack spacing={2}>
                          <Badge colorScheme="green" variant="solid" fontSize="sm" fontFamily="DIN, sans-serif">
                            ⚽ {player.goals}
                          </Badge>
                          <Badge colorScheme="purple" variant="solid" fontSize="sm" fontFamily="DIN, sans-serif">
                            🎯 {player.assists}
                          </Badge>
                        </HStack>
                      </HStack>

                      <SimpleGrid columns={3} spacing={2} w="100%">
                        <Box bg="blue.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                            {player.shots}
                          </Text>
                          <Text fontSize="xs" color="blue.600" fontFamily="DIN, sans-serif">Shots</Text>
                        </Box>
                        <Box bg="green.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="green.700" fontFamily="DIN, sans-serif">
                            {player.shotsOnTarget}
                          </Text>
                          <Text fontSize="xs" color="green.600" fontFamily="DIN, sans-serif">On Target</Text>
                        </Box>
                        <Box bg="purple.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="purple.700" fontFamily="DIN, sans-serif">
                            {player.conversion}%
                          </Text>
                          <Text fontSize="xs" color="purple.600" fontFamily="DIN, sans-serif">Accuracy</Text>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </Box>

          {/* Away Team Attacking Stats */}
          <Box
            bg="gradient-to-br from-orange-50 to-orange-100"
            p={6}
            borderRadius="xl"
            border="2px solid"
            borderColor="orange.200"
          >
            <VStack spacing={6}>
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.awayTeam.logo} name={match.awayTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                    {match.awayTeam.name}
                  </Text>
                  <Badge colorScheme="orange" variant="solid" fontSize="sm" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                    ✈️ AWAY ATTACK
                  </Badge>
                </VStack>
              </HStack>

              {/* Team Attack Overview */}
              <SimpleGrid columns={3} spacing={4} w="100%">
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                    {attackingStats.away.teamStats.totalGoals}
                  </Text>
                  <Text fontSize="xs" color="orange.600" fontFamily="DIN, sans-serif">Goals</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                    {attackingStats.away.teamStats.totalShots}
                  </Text>
                  <Text fontSize="xs" color="orange.600" fontFamily="DIN, sans-serif">Shots</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                    {attackingStats.away.teamStats.conversion}%
                  </Text>
                  <Text fontSize="xs" color="orange.600" fontFamily="DIN, sans-serif">Conversion</Text>
                </Box>
              </SimpleGrid>

              <Divider borderColor="orange.300" />

              {/* Top Scorers */}
              <VStack spacing={4} w="100%">
                <Text fontSize="md" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                  🌟 Top Scorers & Creators
                </Text>

                {attackingStats.away.topScorers.map((player, index) => (
                  <Box key={index} bg="white" p={4} borderRadius="lg" w="100%" border="1px solid" borderColor="orange.200">
                    <VStack spacing={3}>
                      <HStack justify="space-between" w="100%">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="md" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                            {player.name}
                          </Text>
                          <Text fontSize="sm" color="orange.600" fontFamily="DIN, sans-serif">
                            {player.conversion}% conversion rate
                          </Text>
                        </VStack>
                        <HStack spacing={2}>
                          <Badge colorScheme="green" variant="solid" fontSize="sm" fontFamily="DIN, sans-serif">
                            ⚽ {player.goals}
                          </Badge>
                          <Badge colorScheme="purple" variant="solid" fontSize="sm" fontFamily="DIN, sans-serif">
                            🎯 {player.assists}
                          </Badge>
                        </HStack>
                      </HStack>

                      <SimpleGrid columns={3} spacing={2} w="100%">
                        <Box bg="orange.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                            {player.shots}
                          </Text>
                          <Text fontSize="xs" color="orange.600" fontFamily="DIN, sans-serif">Shots</Text>
                        </Box>
                        <Box bg="green.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="green.700" fontFamily="DIN, sans-serif">
                            {player.shotsOnTarget}
                          </Text>
                          <Text fontSize="xs" color="green.600" fontFamily="DIN, sans-serif">On Target</Text>
                        </Box>
                        <Box bg="purple.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="purple.700" fontFamily="DIN, sans-serif">
                            {player.conversion}%
                          </Text>
                          <Text fontSize="xs" color="purple.600" fontFamily="DIN, sans-serif">Accuracy</Text>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </Box>
        </SimpleGrid>

      </Box>
    );
  };

  // Render defensive statistics
  const renderDefensiveStats = () => {
    const defensiveStats = {
      home: {
        topDefenders: [
          { name: "Marco Rodriguez", tackles: 8, interceptions: 5, clearances: 12, blocks: 3, duelsWon: 7 },
          { name: "Alex Thompson", tackles: 6, interceptions: 4, clearances: 9, blocks: 2, duelsWon: 5 },
          { name: "Luis Garcia", tackles: 4, interceptions: 3, clearances: 6, blocks: 1, duelsWon: 4 }
        ],
        teamStats: { totalTackles: 24, totalInterceptions: 18, totalClearances: 35, cleanSheet: false }
      },
      away: {
        topDefenders: [
          { name: "Carlos Mendez", tackles: 7, interceptions: 6, clearances: 10, blocks: 4, duelsWon: 6 },
          { name: "Diego Lopez", tackles: 5, interceptions: 3, clearances: 8, blocks: 2, duelsWon: 4 },
          { name: "Fernando Silva", tackles: 3, interceptions: 2, clearances: 5, blocks: 1, duelsWon: 3 }
        ],
        teamStats: { totalTackles: 19, totalInterceptions: 15, totalClearances: 28, cleanSheet: false }
      }
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
            <Icon as={FiShield} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              🛡️ Defensive Statistics
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Tackles • Interceptions • Clearances • Blocks • Last {gameCount} matches
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              Live Match Data
            </Badge>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Home Team Defensive Stats */}
          <Box
            bg="gradient-to-br from-red-50 to-red-100"
            p={6}
            borderRadius="xl"
            border="2px solid"
            borderColor="red.200"
          >
            <VStack spacing={6}>
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.homeTeam.logo} name={match.homeTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="red.800" fontFamily="DIN, sans-serif">
                    {match.homeTeam.name}
                  </Text>
                  <Badge colorScheme="red" variant="solid" fontSize="sm" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                    🏠 HOME DEFENSE
                  </Badge>
                </VStack>
              </HStack>

              {/* Team Defense Overview */}
              <SimpleGrid columns={3} spacing={4} w="100%">
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="red.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">
                    {defensiveStats.home.teamStats.totalTackles}
                  </Text>
                  <Text fontSize="xs" color="red.600" fontFamily="DIN, sans-serif">Tackles</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="red.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">
                    {defensiveStats.home.teamStats.totalInterceptions}
                  </Text>
                  <Text fontSize="xs" color="red.600" fontFamily="DIN, sans-serif">Interceptions</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="red.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">
                    {defensiveStats.home.teamStats.totalClearances}
                  </Text>
                  <Text fontSize="xs" color="red.600" fontFamily="DIN, sans-serif">Clearances</Text>
                </Box>
              </SimpleGrid>

              <Divider borderColor="red.300" />

              {/* Top Defenders */}
              <VStack spacing={4} w="100%">
                <Text fontSize="md" fontWeight="700" color="red.800" fontFamily="DIN, sans-serif">
                  🛡️ Top Defenders
                </Text>

                {defensiveStats.home.topDefenders.map((player, index) => (
                  <Box key={index} bg="white" p={4} borderRadius="lg" w="100%" border="1px solid" borderColor="red.200">
                    <VStack spacing={3}>
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="md" fontWeight="700" color="red.800" fontFamily="DIN, sans-serif">
                          {player.name}
                        </Text>
                        <Badge colorScheme="red" variant="solid" fontSize="sm" fontFamily="DIN, sans-serif">
                          🏆 {player.duelsWon} Duels Won
                        </Badge>
                      </HStack>

                      <SimpleGrid columns={4} spacing={2} w="100%">
                        <Box bg="red.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">
                            {player.tackles}
                          </Text>
                          <Text fontSize="xs" color="red.600" fontFamily="DIN, sans-serif">Tackles</Text>
                        </Box>
                        <Box bg="orange.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                            {player.interceptions}
                          </Text>
                          <Text fontSize="xs" color="orange.600" fontFamily="DIN, sans-serif">Interceptions</Text>
                        </Box>
                        <Box bg="yellow.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="yellow.700" fontFamily="DIN, sans-serif">
                            {player.clearances}
                          </Text>
                          <Text fontSize="xs" color="yellow.600" fontFamily="DIN, sans-serif">Clearances</Text>
                        </Box>
                        <Box bg="blue.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                            {player.blocks}
                          </Text>
                          <Text fontSize="xs" color="blue.600" fontFamily="DIN, sans-serif">Blocks</Text>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </Box>

          {/* Away Team Defensive Stats */}
          <Box
            bg="gradient-to-br from-orange-50 to-orange-100"
            p={6}
            borderRadius="xl"
            border="2px solid"
            borderColor="orange.200"
          >
            <VStack spacing={6}>
              <HStack spacing={4} justify="center">
                <Avatar size="lg" src={match.awayTeam.logo} name={match.awayTeam.name} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                    {match.awayTeam.name}
                  </Text>
                  <Badge colorScheme="orange" variant="solid" fontSize="sm" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
                    ✈️ AWAY DEFENSE
                  </Badge>
                </VStack>
              </HStack>

              {/* Team Defense Overview */}
              <SimpleGrid columns={3} spacing={4} w="100%">
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                    {defensiveStats.away.teamStats.totalTackles}
                  </Text>
                  <Text fontSize="xs" color="orange.600" fontFamily="DIN, sans-serif">Tackles</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                    {defensiveStats.away.teamStats.totalInterceptions}
                  </Text>
                  <Text fontSize="xs" color="orange.600" fontFamily="DIN, sans-serif">Interceptions</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200" textAlign="center">
                  <Text fontSize="2xl" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                    {defensiveStats.away.teamStats.totalClearances}
                  </Text>
                  <Text fontSize="xs" color="orange.600" fontFamily="DIN, sans-serif">Clearances</Text>
                </Box>
              </SimpleGrid>

              <Divider borderColor="orange.300" />

              {/* Top Defenders */}
              <VStack spacing={4} w="100%">
                <Text fontSize="md" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                  🛡️ Top Defenders
                </Text>

                {defensiveStats.away.topDefenders.map((player, index) => (
                  <Box key={index} bg="white" p={4} borderRadius="lg" w="100%" border="1px solid" borderColor="orange.200">
                    <VStack spacing={3}>
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="md" fontWeight="700" color="orange.800" fontFamily="DIN, sans-serif">
                          {player.name}
                        </Text>
                        <Badge colorScheme="orange" variant="solid" fontSize="sm" fontFamily="DIN, sans-serif">
                          🏆 {player.duelsWon} Duels Won
                        </Badge>
                      </HStack>

                      <SimpleGrid columns={4} spacing={2} w="100%">
                        <Box bg="orange.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">
                            {player.tackles}
                          </Text>
                          <Text fontSize="xs" color="orange.600" fontFamily="DIN, sans-serif">Tackles</Text>
                        </Box>
                        <Box bg="red.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">
                            {player.interceptions}
                          </Text>
                          <Text fontSize="xs" color="red.600" fontFamily="DIN, sans-serif">Interceptions</Text>
                        </Box>
                        <Box bg="yellow.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="yellow.700" fontFamily="DIN, sans-serif">
                            {player.clearances}
                          </Text>
                          <Text fontSize="xs" color="yellow.600" fontFamily="DIN, sans-serif">Clearances</Text>
                        </Box>
                        <Box bg="blue.50" p={2} borderRadius="md" textAlign="center">
                          <Text fontSize="lg" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                            {player.blocks}
                          </Text>
                          <Text fontSize="xs" color="blue.600" fontFamily="DIN, sans-serif">Blocks</Text>
                        </Box>
                      </SimpleGrid>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    );
  };

  // Render enhanced player analysis
  const renderEnhancedPlayerAnalysis = () => {
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
            <Icon as={FiUsers} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              📈 Enhanced Player Analysis
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Comprehensive FootyStats player data • Performance metrics • Season statistics
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              Coming Soon
            </Badge>
          </VStack>
        </Flex>

        <Alert status="info" borderRadius="xl" bg="blue.50" border="1px solid" borderColor="blue.200">
          <AlertIcon color="blue.500" />
          <Box>
            <Text fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">Enhanced Player Statistics Loading</Text>
            <Text fontSize="sm" color="blue.600" fontFamily="DIN, sans-serif">
              FootyStats integration will provide detailed player statistics including goals, assists,
              cards, substitutions, individual performance metrics, and comprehensive season analysis.
            </Text>
          </Box>
        </Alert>
      </Box>
    );
  };

  return (
    <VStack spacing={8} align="stretch" fontFamily="DIN, sans-serif">
      {renderGameCountSelector()}
      {renderStartingLineups()}
      {renderAttackingStats()}
      {renderDefensiveStats()}
      {renderEnhancedPlayerAnalysis()}
    </VStack>
  );
};

export default CustomPlayerStatsTabFooty;
