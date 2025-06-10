// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  SimpleGrid,
  Flex,
  Text,
  Icon,
  Badge,
  Skeleton,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Code,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  TabList,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { BsGraphUp, BsBarChart, BsTrophy, BsBug, BsPieChart, BsCashCoin, BsLightningFill } from 'react-icons/bs';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiCalendar, FiInfo, FiChevronUp, FiChevronDown, FiArrowRight } from 'react-icons/fi';
import soccerApiService, { Match, BettingPerformance } from '../api/soccerApiService';


// Debug mode - set to true to show debugging information
const DEBUG_MODE = false;

interface PerformanceTotals {
  totalWins: number;
  totalLosses: number;
  totalVoids: number;
  totalProfit: number;
  winRate: number;
}

// Define the debug info state type
interface DebugInfoState {
  status?: string;  initialDataLoaded?: boolean;
  refreshError?: string;
  viewAllClicked?: boolean;
}

// No mock data functions - using only live API data
// Using only live API data - no mock matches

const PremiumTipsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [performanceData, setPerformanceData] = useState<BettingPerformance[]>([]);
  const [premiumPicks, setPremiumPicks] = useState<Match[]>([]);
  const [loading, setLoading] = useState({
    performance: true, // Start with loading state
    premium: true,
  });
  const [error, setError] = useState({
    performance: false,
    premium: false,
    message: '',
  });
  const [debugInfo, setDebugInfo] = useState<DebugInfoState>({});
  const [activeTab, setActiveTab] = useState(0);
  const [showAllPremium, setShowAllPremium] = useState(false);

  // Theme colors
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableHeadBgColor = useColorModeValue('gray.50', 'gray.700');
  const totalRowBg = useColorModeValue('purple.50', 'purple.900');
  const totalRowBorderColor = useColorModeValue('purple.200', 'purple.600');
  const pageHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const pageHeaderBorder = useColorModeValue('gray.200', 'gray.600');
  const debugBg = useColorModeValue('red.50', 'red.900');
  const debugBorder = useColorModeValue('red.200', 'red.700');
  const statBgColor = useColorModeValue('gray.50', 'gray.800');

  // Calculate performance totals from performance data
  const performanceTotals = useMemo<PerformanceTotals>(() => {
    if (!performanceData.length) {
      return {
        totalWins: 0,
        totalLosses: 0,
        totalVoids: 0,
        totalProfit: 0,
        winRate: 0,
      };
    }    const totals = performanceData.reduce(
      (acc, curr) => ({
        totalWins: acc.totalWins + (curr.wins ?? curr.winningBets ?? 0),
        totalLosses: acc.totalLosses + (curr.losses ?? curr.losingBets ?? 0),
        totalVoids: acc.totalVoids + (curr.voids ?? 0),
        totalProfit: acc.totalProfit + (curr.profit ?? 0),
        matches: acc.matches + (curr.wins ?? curr.winningBets ?? 0) + (curr.losses ?? curr.losingBets ?? 0),
      }),
      { totalWins: 0, totalLosses: 0, totalVoids: 0, totalProfit: 0, matches: 0 }
    );

    const winRate = totals.matches > 0
      ? Number(((totals.totalWins / totals.matches) * 100).toFixed(1))
      : 0;

    return {
      ...totals,
      totalProfit: Number(totals.totalProfit.toFixed(2)),
      winRate,
    };
  }, [performanceData]);
  // Calculate ROI data for chart
  const roiChartData = useMemo(() => {
    return performanceData.map(day => {
      // Calculate daily ROI based on profit and stake
      const totalBets = (day.wins ?? day.winningBets ?? 0) + (day.losses ?? day.losingBets ?? 0);
      const stake = totalBets * 100; // Assuming $100 stake per bet
      const roi = stake > 0 ? ((day.profit ?? 0) / stake) * 100 : 0;

      // Ensure we have a valid date, or generate one if missing
      const date = day.date ?? new Date().toISOString().split('T')[0];

      return {
        date,
        value: parseFloat(roi.toFixed(1))
      };
    }).reverse(); // Reverse to show chronological order
  }, [performanceData]);
  // Prepare data for the bets chart
  const betsChartData = useMemo(() => {
    return performanceData.map(day => {
      // Ensure we have a valid date, or generate one if missing
      const date = day.date ?? new Date().toISOString().split('T')[0];

      return {
        date,
        wins: day.wins ?? day.winningBets ?? 0,
        losses: day.losses ?? day.losingBets ?? 0
      };
    }).reverse(); // Reverse to show chronological order
  }, [performanceData]);

  // Handle match click navigation
  const handleMatchClick = (matchId: string) => {
    navigate(`/match/${matchId}`);
  };

  // Handle "View All Premium" button click
  const handleViewAllPremium = () => {
    setShowAllPremium(true);
    setDebugInfo(prev => ({ ...prev, viewAllClicked: true }));

    // Scroll to premium section
    setTimeout(() => {
      const premiumSection = document.getElementById('premium-picks-section');
      if (premiumSection) {
        premiumSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  // Refresh data using live API only
  const handleRefreshData = async () => {
    try {
      setLoading({ performance: true, premium: true });
      setError({ performance: false, premium: false, message: '' });
      setDebugInfo({ status: 'Refreshing data...' });

      toast({
        title: "Refreshing data",
        status: "info",
        duration: 2000,
        isClosable: true,
      });

      // Fetch live data from API using the API key parameter
      const performanceData = await soccerApiService.getBettingPerformance();
      const premiumPicks = await soccerApiService.getPremiumPicks();

      // Update state with live data
      setPerformanceData(performanceData);
      setPremiumPicks(premiumPicks);

      setLoading({ performance: false, premium: false });
      setDebugInfo(prev => ({ ...prev, liveDataLoaded: true }));

      toast({
        title: "Data refreshed",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error refreshing premium page data:', error);
      setLoading({ performance: false, premium: false });
      setError({ performance: true, premium: true, message: String(error) });
      setDebugInfo(prev => ({ ...prev, refreshError: String(error) }));

      // Return empty arrays when there's an error - no mock data
      setPerformanceData([]);
      setPremiumPicks([]);

      toast({
        title: "Error refreshing data",
        description: "Could not fetch live data. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    console.log('PremiumTipsPage: Component mounted');
    setDebugInfo({ status: 'Component mounted' });
      // Load live API data immediately
    const fetchInitialData = async () => {
      try {
        const performanceData = await soccerApiService.getBettingPerformance();
        const premiumPicks = await soccerApiService.getPremiumPicks();

        setPerformanceData(performanceData);
        setPremiumPicks(premiumPicks);
        setLoading({ performance: false, premium: false });
        setDebugInfo(prev => ({ ...prev, initialDataLoaded: true }));
      } catch (error) {
        console.error('Error loading initial data:', error);
        setLoading({ performance: false, premium: false });
        setError({ performance: true, premium: true, message: String(error) });
      }
    };

    fetchInitialData();
  }, []);

  return (
    <Box minH="100vh">
      {/* Debug Information - only visible in debug mode */}
      {DEBUG_MODE && (
        <Alert
          status="warning"
          variant="solid"
          bg="orange.500"
          color="white"
          mb={0}
        >
          <AlertIcon color="white" />
          <AlertTitle mr={2}>Debug Mode</AlertTitle>
          <AlertDescription>
            PremiumTipsPage is in debug mode. Using mock data.
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <Box
        bg={pageHeaderBg}
        borderBottom="1px"
        borderColor={pageHeaderBorder}
        py={6}
        mb={8}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="xl" mb={2}>Premium Tips</Heading>
              <Text color="gray.500" fontSize="lg">Expert betting recommendations and performance analytics</Text>
            </Box>
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="purple"
              size="lg"
              isLoading={loading.performance || loading.premium}
              onClick={handleRefreshData}
              px={8}
              py={6}
              fontSize="md"
              fontWeight="600"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              Refresh Data
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" pb={10}>
        {/* Debug Information Panel */}
        {DEBUG_MODE && (
          <Box
            p={4}
            mb={6}
            bg={debugBg}
            borderRadius="md"
            borderWidth="1px"
            borderColor={debugBorder}
          >
            <Flex align="center" mb={2}>
              <Icon as={BsBug} mr={2} color="red.500" />
              <Text fontWeight="bold" color="red.500">Debug Information</Text>
            </Flex>
            <Text fontSize="sm" mb={2}>Loading state: {JSON.stringify(loading)}</Text>
            <Text fontSize="sm" mb={2}>Error state: {JSON.stringify(error)}</Text>
            <Text fontSize="sm" mb={2}>Performance data count: {performanceData.length}</Text>
            <Text fontSize="sm" mb={2}>Premium picks count: {premiumPicks.length}</Text>
            <Code p={2} fontSize="xs" w="100%" overflowX="auto">
              {JSON.stringify(debugInfo, null, 2)}
            </Code>
            <Button
              size="sm"
              colorScheme="red"
              mt={2}              onClick={() => {
                setDebugInfo(prev => ({
                  ...prev,
                  liveData: {
                    premiumPicksPreview: premiumPicks.length > 0 ? premiumPicks[0] : 'No picks',
                    performanceDataPreview: performanceData.length > 0 ? performanceData[0] : 'No data'
                  }
                }));
              }}
            >
              Show Data Preview
            </Button>
          </Box>
        )}

        {/* Error Alert */}
        {(error.performance || error.premium) && (
          <Alert status="error" borderRadius="lg" mb={6}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Error loading data</AlertTitle>              <AlertDescription>
                {error.message || "There was an error loading the data. Please try again later."}
              </AlertDescription>
            </Box>
            <Button rightIcon={<FiRefreshCw />} colorScheme="red" size="sm" onClick={handleRefreshData}>
              Try Again
            </Button>
          </Alert>
        )}

        {/* Performance Statistics Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {/* Win Rate Card */}
          <Box
            bg={cardBgColor}
            boxShadow="xl"
            borderRadius="2xl"
            overflow="hidden"
            position="relative"
            transition="transform 0.3s, box-shadow 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl' }}
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="5px"
              bgGradient="linear(to-r, green.400, green.500)"
            />
            <Box position="relative" p={6}>
              <Flex justifyContent="space-between" mb={2}>
                <Text fontSize="md" fontWeight="medium" color="gray.500">Win Rate</Text>
                <Flex
                  align="center"
                  justify="center"
                  bg="green.50"
                  _dark={{ bg: 'green.900' }}
                  color="green.400"
                  borderRadius="full"
                  w="40px"
                  h="40px"
                >
                  <Icon as={BsGraphUp} boxSize={5} />
                </Flex>
              </Flex>
              <Text fontSize="3xl" fontWeight="bold" mt={1} mb={2}>
                {performanceTotals.winRate}%
              </Text>
              <HStack mt={3} spacing={4}>
                <Flex align="center" borderRadius="full" bg="green.50" _dark={{ bg: 'green.900' }} px={3} py={1}>
                  <Badge colorScheme="green" variant="solid" mr={2}>{performanceTotals.totalWins}</Badge>
                  <Text fontSize="sm" color="green.500" fontWeight="medium">Wins</Text>
                </Flex>
                <Flex align="center" borderRadius="full" bg="red.50" _dark={{ bg: 'red.900' }} px={3} py={1}>
                  <Badge colorScheme="red" variant="solid" mr={2}>{performanceTotals.totalLosses}</Badge>
                  <Text fontSize="sm" color="red.500" fontWeight="medium">Losses</Text>
                </Flex>
              </HStack>
            </Box>
          </Box>

          {/* Profit Card */}
          <Box
            bg={cardBgColor}
            boxShadow="xl"
            borderRadius="2xl"
            overflow="hidden"
            position="relative"
            transition="transform 0.3s, box-shadow 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl' }}
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="5px"
              bgGradient={performanceTotals.totalProfit >= 0
                ? "linear(to-r, purple.400, purple.500)"
                : "linear(to-r, red.400, red.500)"}
            />
            <Box position="relative" p={6}>
              <Flex justifyContent="space-between" mb={2}>
                <Text fontSize="md" fontWeight="medium" color="gray.500">Total Profit</Text>
                <Flex
                  align="center"
                  justify="center"
                  bg={performanceTotals.totalProfit >= 0 ? "purple.50" : "red.50"}
                  _dark={{ bg: performanceTotals.totalProfit >= 0 ? "purple.900" : "red.900" }}
                  color={performanceTotals.totalProfit >= 0 ? "purple.400" : "red.400"}
                  borderRadius="full"
                  w="40px"
                  h="40px"
                >
                  <Icon as={BsCashCoin} boxSize={5} />
                </Flex>
              </Flex>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                color={performanceTotals.totalProfit >= 0 ? "green.500" : "red.500"}
                mt={1}
                mb={2}
              >
                {performanceTotals.totalProfit >= 0 ? `+$${performanceTotals.totalProfit}` : `-$${Math.abs(performanceTotals.totalProfit)}`}
              </Text>
              <Box
                mt={3}
                px={3}
                py={2}
                borderRadius="md"
                bg={performanceTotals.totalProfit >= 0 ? "green.50" : "red.50"}
                _dark={{ bg: performanceTotals.totalProfit >= 0 ? "green.900" : "red.900" }}
                display="inline-flex"
                alignItems="center"
              >
                <Icon
                  as={performanceTotals.totalProfit >= 0 ? FiTrendingUp : FiTrendingDown}
                  mr={1}
                  color={performanceTotals.totalProfit >= 0 ? "green.500" : "red.500"}
                />
                <Text fontSize="sm" color={performanceTotals.totalProfit >= 0 ? "green.500" : "red.500"}>
                  On $100 stakes
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Void Bets Card */}
          <Box
            bg={cardBgColor}
            boxShadow="xl"
            borderRadius="2xl"
            overflow="hidden"
            position="relative"
            transition="transform 0.3s, box-shadow 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl' }}
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="5px"
              bgGradient="linear(to-r, blue.400, blue.500)"
            />
            <Box position="relative" p={6}>
              <Flex justifyContent="space-between" mb={2}>
                <Text fontSize="md" fontWeight="medium" color="gray.500">Void Bets</Text>
                <Flex
                  align="center"
                  justify="center"
                  bg="blue.50"
                  _dark={{ bg: 'blue.900' }}
                  color="blue.400"
                  borderRadius="full"
                  w="40px"
                  h="40px"
                >
                  <Icon as={FiInfo} boxSize={5} />
                </Flex>
              </Flex>
              <Text fontSize="3xl" fontWeight="bold" color="blue.500" mt={1} mb={2}>
                {performanceTotals.totalVoids}
              </Text>
              <Box
                mt={3}
                px={3}
                py={2}
                borderRadius="md"
                bg="blue.50"
                _dark={{ bg: "blue.900" }}
                display="inline-flex"
                alignItems="center"
              >
                <Icon as={FiInfo} mr={1} color="blue.500" />
                <Text fontSize="sm" color="blue.500">Stakes returned</Text>
              </Box>
            </Box>
          </Box>

          {/* Total Bets Card */}
          <Box
            bg={cardBgColor}
            boxShadow="xl"
            borderRadius="2xl"
            overflow="hidden"
            position="relative"
            transition="transform 0.3s, box-shadow 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl' }}
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="5px"
              bgGradient="linear(to-r, orange.400, orange.500)"
            />
            <Box position="relative" p={6}>
              <Flex justifyContent="space-between" mb={2}>
                <Text fontSize="md" fontWeight="medium" color="gray.500">Total Bets</Text>
                <Flex
                  align="center"
                  justify="center"
                  bg="orange.50"
                  _dark={{ bg: 'orange.900' }}
                  color="orange.400"
                  borderRadius="full"
                  w="40px"
                  h="40px"
                >
                  <Icon as={BsPieChart} boxSize={5} />
                </Flex>
              </Flex>
              <Text fontSize="3xl" fontWeight="bold" color="orange.500" mt={1} mb={2}>
                {performanceTotals.totalWins + performanceTotals.totalLosses + performanceTotals.totalVoids}
              </Text>
              <Flex direction="column" gap={2}>
                <Box>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="xs" color="gray.500">Success Rate</Text>
                    <Text fontSize="xs" fontWeight="medium">{performanceTotals.winRate}%</Text>
                  </Flex>
                  <Box
                    w="full"
                    h="4px"
                    bg="gray.100"
                    _dark={{ bg: "gray.700" }}
                    borderRadius="full"
                  >
                    <Box
                      h="full"
                      bg="green.500"
                      borderRadius="full"
                      w={`${performanceTotals.winRate}%`}
                    />
                  </Box>
                </Box>
                <Text fontSize="xs" color="gray.500">Period: Last 7 days</Text>
              </Flex>
            </Box>
          </Box>
        </SimpleGrid>

        {/* Charts Section */}
        <Box
          bg={cardBgColor}
          boxShadow="xl"
          borderRadius="2xl"
          overflow="hidden"
          mb={8}
          position="relative"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="5px"
            bgGradient="linear(to-r, teal.400, teal.600)"
          />
          <Box p={6}>
            <Flex justify="space-between" align="center" mb={6}>
              <Flex align="center">
                <Flex
                  align="center"
                  justify="center"
                  bg="teal.50"
                  _dark={{ bg: "teal.900" }}
                  color="teal.400"
                  borderRadius="full"
                  w="40px"
                  h="40px"
                  mr={3}
                >
                  <Icon as={BsGraphUp} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">Performance Analytics</Text>
                  <Text color="gray.500" fontSize="sm">7-day performance visualization</Text>
                </Box>
              </Flex>
            </Flex>

            <Tabs variant="soft-rounded" colorScheme="teal" onChange={setActiveTab} index={activeTab}>
              <TabList mb={4}>
                <Tab>Bets Chart</Tab>
                <Tab>ROI Chart</Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <Box p={4} bg="gray.50" _dark={{ bg: "gray.700" }} borderRadius="xl">
                    <Text mb={4} fontWeight="medium">Win vs Loss Distribution</Text>
                    <Text color="gray.500" textAlign="center">Chart will be displayed here</Text>
                  </Box>
                </TabPanel>
                <TabPanel px={0}>
                  <Box p={4} bg="gray.50" _dark={{ bg: "gray.700" }} borderRadius="xl">
                    <Text mb={4} fontWeight="medium">Return on Investment (ROI) Over Time</Text>
                    <Text color="gray.500" textAlign="center">ROI Chart will be displayed here</Text>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>

        {/* Premium Tips Section with Grid layout */}
        <Box id="premium-picks-section" mt={8}>
          {showAllPremium ? (
            <Box position="relative" mb={8}>
              <Button
                position="absolute"
                top="-65px"
                right="0"
                zIndex={1}
                colorScheme="purple"
                size="md"
                leftIcon={<FiChevronUp />}
                onClick={() => setShowAllPremium(false)}
              >
                Show Less
              </Button>

              <PremiumPicksSection
                matches={premiumPicks}
                loading={loading.premium}
                expandedView={true}
                onViewAll={() => {}}
                onMatchClick={handleMatchClick}
              />
            </Box>
          ) : (
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
              {/* Premium Picks Section */}
              <GridItem>
                <Box
                  boxShadow="xl"
                  borderRadius="2xl"
                  overflow="hidden"
                  bg={cardBgColor}
                >
                  <PremiumPicksSection
                    matches={premiumPicks}
                    loading={loading.premium}
                    expandedView={false}
                    onViewAll={handleViewAllPremium}
                    onMatchClick={handleMatchClick}
                  />
                </Box>
              </GridItem>

              {/* Performance Overview Card */}
              <GridItem>
                <Box
                  bg={cardBgColor}
                  boxShadow="xl"
                  borderRadius="xl"
                  overflow="hidden"
                  position="relative"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    height="5px"
                    bgGradient="linear(to-r, purple.400, purple.600)"
                  />
                  <Box p={6}>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Flex align="center">
                        <Flex
                          align="center"
                          justify="center"
                          bg="purple.50"
                          _dark={{ bg: "purple.900" }}
                          color="purple.400"
                          borderRadius="full"
                          w="40px"
                          h="40px"
                          mr={3}
                        >
                          <Icon as={BsTrophy} boxSize={5} />
                        </Flex>
                        <Box>
                          <Text fontWeight="bold" fontSize="lg">Performance Summary</Text>
                          <Text color="gray.500" fontSize="sm">Your betting success metrics</Text>
                        </Box>
                      </Flex>
                    </Flex>

                    <SimpleGrid columns={1} spacing={6} mt={6}>
                      <Box
                        bg="purple.50"
                        _dark={{ bg: "purple.900" }}
                        borderRadius="xl"
                        p={5}
                        textAlign="center"
                      >
                        <Text fontSize="sm" fontWeight="medium" color="gray.600" _dark={{ color: 'gray.300' }} mb={2}>Win Rate</Text>
                        <Text fontSize="3xl" fontWeight="bold" color="purple.600" _dark={{ color: 'purple.300' }}>
                          {performanceTotals.winRate}%
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>Premium picks accuracy</Text>
                      </Box>
                      <Box
                        bg="purple.50"
                        _dark={{ bg: "purple.900" }}
                        borderRadius="xl"
                        p={5}
                        textAlign="center"
                      >
                        <Text fontSize="sm" fontWeight="medium" color="gray.600" _dark={{ color: 'gray.300' }} mb={2}>ROI</Text>
                        <Text fontSize="3xl" fontWeight="bold" color="purple.600" _dark={{ color: 'purple.300' }}>
                          {(() => {
                            const totalStake = (performanceTotals.totalWins + performanceTotals.totalLosses) * 100;
                            return totalStake ?
                              `${((performanceTotals.totalProfit / totalStake) * 100).toFixed(1)}%` :
                              '0%';
                          })()}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>Return on investment</Text>
                      </Box>
                      <Box
                        bg="purple.50"
                        _dark={{ bg: "purple.900" }}
                        borderRadius="xl"
                        p={5}
                        textAlign="center"
                      >
                        <Text fontSize="sm" fontWeight="medium" color="gray.600" _dark={{ color: 'gray.300' }} mb={2}>Profit</Text>
                        <Text fontSize="3xl" fontWeight="bold" color={performanceTotals.totalProfit >= 0 ? "green.600" : "red.500"} _dark={{ color: performanceTotals.totalProfit >= 0 ? 'green.300' : 'red.300' }}>
                          {performanceTotals.totalProfit >= 0 ? `+$${performanceTotals.totalProfit}` : `-$${Math.abs(performanceTotals.totalProfit)}`}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>On $100 stakes</Text>
                      </Box>
                    </SimpleGrid>

                    <Divider my={6} />

                    <Flex justify="center">
                      <Button
                        colorScheme="purple"
                        leftIcon={<FiCalendar />}
                        size="lg"
                        width="full"
                        onClick={handleRefreshData}
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                        transition="all 0.2s"
                      >
                        View Complete History
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              </GridItem>
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default PremiumTipsPage;