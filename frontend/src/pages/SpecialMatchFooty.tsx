import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Icon,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiTrendingUp,
  FiTarget,
  FiUsers,
  FiFlag,
  FiClock,
  FiBarChart2,
  FiUser
} from 'react-icons/fi';

// Import FootyStats-specific components (to be created)
import CustomHeadToHeadTabFooty from '../components/match/CustomHeadToHeadTabFooty';
import CornerTabCustomFooty from '../components/match/CornerTabCustomFooty';
import CustomCardsTabFooty from '../components/match/CustomCardsTabFooty';
import CustomBTTSTabFooty from '../components/match/CustomBTTSTabFooty';
import PlayerStatsTabFooty from '../components/match/PlayerStatsTabFooty';
import LeagueInfoTabFooty from '../components/match/LeagueInfoTabFooty';
import RefereeTabFooty from '../components/match/RefereeTabFooty';

import EnhancedMatchHeaderFooty from '../components/match/EnhancedMatchHeaderFooty';
import CustomPlayerStatsTabFooty from '../components/match/CustomPlayerStatsTabFooty';
import CustomLeagueTabFooty from '../components/match/CustomLeagueTabFooty';
import MatchHeaderFooty from '../components/match/MatchHeaderFooty';
import Loader from '../components/common/Loader';

// Types
interface FootyStatsMatch {
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
  status: string;
  date: string;
  score: {
    home: number;
    away: number;
    total: number;
  };
  stats: any;
  potentials: any;
  h2h: any;
  lineups: any;
  trends: any;
  odds: any;
  league: any;
  referee: any;
  stadium: any;
}

const SpecialMatchFooty: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  // State management
  const [matchData, setMatchData] = useState<FootyStatsMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [gameCount, setGameCount] = useState(10);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Fetch match data from FootyStats API
  const fetchMatchData = async () => {
    if (!matchId) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔍 Fetching FootyStats data for match ID: ${matchId}`);



      // Always use FootyStats API for real data
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/match/${matchId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch match data: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        console.log('✅ FootyStats match data loaded successfully:', result.data);
        console.log('🔍 Team IDs in FootyStats response:');
        console.log('🏠 Home Team ID:', result.data.homeTeam.id, '| Name:', result.data.homeTeam.name);
        console.log('✈️ Away Team ID:', result.data.awayTeam.id, '| Name:', result.data.awayTeam.name);
        setMatchData(result.data);
        console.log('✅ Match data set in state');
      } else {
        throw new Error(result.message || 'No match data available');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load match data';
      setError(errorMessage);
      toast({
        title: 'Error Loading Match',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  // Handle refresh
  const handleRefresh = () => {
    fetchMatchData();
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="center" justify="center" minH="60vh">
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <VStack spacing={2}>
            <Heading size="md" color={headingColor}>
              Loading Match Data
            </Heading>
            <Text color={textColor}>
              Fetching comprehensive match analysis from FootyStats...
            </Text>
          </VStack>
        </VStack>
      </Container>
    );
  }

  // Error state
  if (error || !matchData) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={6}>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            alignSelf="flex-start"
            onClick={handleBack}
          >
            Back to Matches
          </Button>
          
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Unable to Load Match!</AlertTitle>
              <AlertDescription>
                {error || 'Match data not found. Please try again or select a different match.'}
              </AlertDescription>
            </Box>
          </Alert>
          
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="blue"
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Modern Header */}
          <Box
            bg="white"
            p={6}
            borderRadius="2xl"
            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            border="1px solid"
            borderColor="gray.100"
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={4}>
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="ghost"
                  size="md"
                  onClick={handleBack}
                  color="gray.600"
                  _hover={{ bg: "gray.100", color: "gray.800" }}
                  borderRadius="xl"
                >
                  Back to Matches
                </Button>
                <Divider orientation="vertical" height="6" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="700" color="gray.900">
                    ⚽ Match Analysis
                  </Text>
                  <Text fontSize="sm" color="gray.500" fontWeight="500">
                    Comprehensive FootyStats Analysis
                  </Text>
                </VStack>
              </HStack>

              <Button
                leftIcon={<FiRefreshCw />}
                size="md"
                variant="outline"
                onClick={handleRefresh}
                isLoading={isLoading}
                colorScheme="green"
                borderRadius="xl"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                transition="all 0.2s"
              >
                Refresh Data
              </Button>
            </Flex>
          </Box>

          {/* Enhanced Match Header with Form, Referee & Stadium */}
          <EnhancedMatchHeaderFooty match={matchData} />

          {/* Modern Stats Overview */}
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
            <VStack spacing={6}>
              <HStack spacing={3} align="center">
                <Box
                  bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
                  p={3}
                  borderRadius="xl"
                >
                  <Icon as={FiBarChart2} color="white" boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl" fontWeight="700" color="gray.900">
                    Match Statistics Overview
                  </Text>
                  <Text fontSize="sm" color="gray.500" fontWeight="500">
                    Key metrics and probabilities
                  </Text>
                </VStack>
              </HStack>

              <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6} w="100%">
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
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">
                      Status
                    </Text>
                    <Badge
                      colorScheme="green"
                      variant="solid"
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {matchData.status?.toUpperCase() || 'LIVE'}
                    </Badge>
                  </VStack>
                </Box>

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
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase">
                      Score
                    </Text>
                    <Text fontSize="2xl" fontWeight="800" color="blue.700">
                      {matchData.score.home} - {matchData.score.away}
                    </Text>
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
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="purple.600" fontWeight="600" textTransform="uppercase">
                      Total Goals
                    </Text>
                    <Text fontSize="2xl" fontWeight="800" color="purple.700">
                      {matchData.score.total}
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
                  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="green.600" fontWeight="600" textTransform="uppercase">
                      BTTS Probability
                    </Text>
                    <Text fontSize="2xl" fontWeight="800" color="green.700">
                      {(matchData.potentials?.btts * 100 || 0).toFixed(0)}%
                    </Text>
                    <Progress
                      value={matchData.potentials?.btts * 100 || 0}
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
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="orange.600" fontWeight="600" textTransform="uppercase">
                      Over 2.5 Goals
                    </Text>
                    <Text fontSize="2xl" fontWeight="800" color="orange.700">
                      {(matchData.potentials?.over25 * 100 || 0).toFixed(0)}%
                    </Text>
                    <Progress
                      value={matchData.potentials?.over25 * 100 || 0}
                      colorScheme="orange"
                      size="sm"
                      borderRadius="full"
                      w="100%"
                    />
                  </VStack>
                </Box>

                <Box
                  bg="gradient-to-br from-teal-50 to-teal-100"
                  p={6}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="teal.200"
                  textAlign="center"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="teal.600" fontWeight="600" textTransform="uppercase">
                      Total Corners
                    </Text>
                    <Text fontSize="2xl" fontWeight="800" color="teal.700">
                      {(matchData.stats?.corners?.home || 0) + (matchData.stats?.corners?.away || 0)}
                    </Text>
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Modern Tabs */}
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="0 8px 25px rgba(34, 197, 94, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            border="2px solid"
            borderColor="green.200"
            overflow="hidden"
            _hover={{
              boxShadow: "0 12px 35px rgba(34, 197, 94, 0.25), 0 8px 15px -3px rgba(0, 0, 0, 0.15)",
              transform: "translateY(-4px)",
              borderColor: "green.300"
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            <Tabs
              index={activeTab}
              onChange={setActiveTab}
              variant="unstyled"
            >
              <TabList
                bg="gray.50"
                p={2}
                borderBottom="1px solid"
                borderColor="gray.200"
                overflowX="auto"
              >
                <Tab
                  fontSize="sm"
                  fontWeight="600"
                  px={6}
                  py={3}
                  borderRadius="xl"
                  mr={2}
                  color="gray.600"
                  _selected={{
                    bg: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                  }}
                  _hover={{
                    bg: "gray.100",
                    color: "gray.800"
                  }}
                  transition="all 0.2s"
                  whiteSpace="nowrap"
                >
                  ⚔️ H2H Analysis
                </Tab>
                <Tab
                  fontSize="sm"
                  fontWeight="600"
                  px={6}
                  py={3}
                  borderRadius="xl"
                  mr={2}
                  color="gray.600"
                  _selected={{
                    bg: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                  }}
                  _hover={{
                    bg: "gray.100",
                    color: "gray.800"
                  }}
                  transition="all 0.2s"
                  whiteSpace="nowrap"
                >
                  🚩 Corner Stats
                </Tab>
                <Tab
                  fontSize="sm"
                  fontWeight="600"
                  px={6}
                  py={3}
                  borderRadius="xl"
                  mr={2}
                  color="gray.600"
                  _selected={{
                    bg: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                  }}
                  _hover={{
                    bg: "gray.100",
                    color: "gray.800"
                  }}
                  transition="all 0.2s"
                  whiteSpace="nowrap"
                >
                  🟨 Card Analysis
                </Tab>
                <Tab
                  fontSize="sm"
                  fontWeight="600"
                  px={6}
                  py={3}
                  borderRadius="xl"
                  mr={2}
                  color="gray.600"
                  _selected={{
                    bg: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                  }}
                  _hover={{
                    bg: "gray.100",
                    color: "gray.800"
                  }}
                  transition="all 0.2s"
                  whiteSpace="nowrap"
                >
                  ⚽ BTTS Stats
                </Tab>
                <Tab
                  fontSize="sm"
                  fontWeight="600"
                  px={6}
                  py={3}
                  borderRadius="xl"
                  mr={2}
                  color="gray.600"
                  _selected={{
                    bg: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                  }}
                  _hover={{
                    bg: "gray.100",
                    color: "gray.800"
                  }}
                  transition="all 0.2s"
                  whiteSpace="nowrap"
                >
                  👤 Player Stats
                </Tab>
                <Tab
                  fontSize="sm"
                  fontWeight="600"
                  px={6}
                  py={3}
                  borderRadius="xl"
                  mr={2}
                  color="gray.600"
                  _selected={{
                    bg: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                  }}
                  _hover={{
                    bg: "gray.100",
                    color: "gray.800"
                  }}
                  transition="all 0.2s"
                  whiteSpace="nowrap"
                >
                  🏆 League Info
                </Tab>
                <Tab
                  fontSize="sm"
                  fontWeight="600"
                  px={6}
                  py={3}
                  borderRadius="xl"
                  mr={2}
                  color="gray.600"
                  _selected={{
                    bg: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                  }}
                  _hover={{
                    bg: "gray.100",
                    color: "gray.800"
                  }}
                  transition="all 0.2s"
                  whiteSpace="nowrap"
                >
                  👨‍⚖️ Referee
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={8}>
                  <CustomHeadToHeadTabFooty
                    match={matchData}
                    gameCount={gameCount}
                    onGameCountChange={setGameCount}
                  />
                </TabPanel>

                <TabPanel p={8}>
                  <CornerTabCustomFooty
                    match={matchData}
                    gameCount={gameCount}
                    onGameCountChange={setGameCount}
                  />
                </TabPanel>

                <TabPanel p={8}>
                  <CustomCardsTabFooty
                    match={matchData}
                    gameCount={gameCount}
                    onGameCountChange={setGameCount}
                  />
                </TabPanel>

                <TabPanel p={8}>
                  <CustomBTTSTabFooty
                    match={matchData}
                    gameCount={gameCount}
                    onGameCountChange={setGameCount}
                  />
                </TabPanel>

                <TabPanel p={8}>
                  <PlayerStatsTabFooty
                    match={matchData}
                    gameCount={gameCount}
                    onGameCountChange={setGameCount}
                  />
                </TabPanel>

                <TabPanel p={8}>
                  <LeagueInfoTabFooty
                    match={matchData}
                    gameCount={gameCount}
                    onGameCountChange={setGameCount}
                  />
                </TabPanel>

                <TabPanel p={8}>
                  <RefereeTabFooty
                    match={matchData}
                    gameCount={gameCount}
                    onGameCountChange={setGameCount}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default SpecialMatchFooty;
