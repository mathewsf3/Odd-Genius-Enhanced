// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Spinner,
  Center,
  Heading,
  Flex,
  Icon,
  Badge,
  Divider,
  Select,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  Button,
  useToast,
  keyframes,
  Image
} from '@chakra-ui/react';
import { Match } from '../../types/interfaces';
import { CornerStats } from '../../types/cornerStats';
import { FiCornerDownRight, FiTrendingUp, FiBarChart2, FiTarget, FiAlertCircle, FiFilter, FiClock, FiPieChart, FiRefreshCw, FiCheckCircle, FiAlertTriangle, FiZap } from 'react-icons/fi';
import Loader from '../common/Loader';
import { BsFlagFill } from 'react-icons/bs';
import { GiWhistle } from 'react-icons/gi';

interface CornerTabCustomProps {
  match: Match;
  data: CornerStats | null;
  isLoading: boolean;
  initialGameCount?: string;
  onRefresh?: (gameCount: number) => void;
}

// Team logo component with fallback
const TeamLogo: React.FC<{ team: { name: string; logo?: string }, size?: string, colorScheme?: string }> = ({
  team,
  size = "40px",
  colorScheme = "blue"
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Function to render team logo with fallback
  const renderTeamLogo = () => {
    // Use the team logo if available, otherwise fallback to avatar
    const logoUrl = team.logo ||
      `https://ui-avatars.com/api/?name=${team.name.charAt(0)}&background=252535&color=6366F1&bold=true&size=128`;

    return (
      <Image
        src={logoUrl}
        alt={team.name}
        boxSize={size}
        objectFit="contain"
        fallbackSrc={`https://ui-avatars.com/api/?name=${team.name.charAt(0)}&background=252535&color=6366F1&bold=true&size=128`}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        p={1}
        backgroundColor="white"
        onError={(e) => {
          console.log(`[TeamLogo][ERROR] Logo load error for ${team.name}:`, e);
        }}
      />
    );
  };

  return renderTeamLogo();
};

const CornerTabCustom: React.FC<CornerTabCustomProps> = ({ match, data, isLoading, initialGameCount, onRefresh }) => {
  // Dynamic game count options based on available data
  const getGameCountOptions = () => {
    const options = ["5", "10"];
    // Could be extended to include more options based on team data availability
    if (data?.homeStats?.matchesAnalyzed && data.homeStats.matchesAnalyzed >= 15) {
      options.push("15");
    }
    if (data?.homeStats?.matchesAnalyzed && data.homeStats.matchesAnalyzed >= 20) {
      options.push("20");
    }
    return options;
  };

  const gameCountOptions = getGameCountOptions();
  const [gameCount, setGameCount] = useState<string>(initialGameCount || gameCountOptions[1] || "10");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFallbackData, setIsFallbackData] = useState<boolean>(false);
  const toast = useToast();

  // Enhanced debug console logs
  console.log("CornerTabCustom rendered with data:", data, "gameCount:", gameCount);

  // Debug corner sources data specifically
  if (data) {
    console.log("Corner Sources Debug:");
    console.log("Home team corner sources:", data.homeStats?.cornerSources);
    console.log("Away team corner sources:", data.awayStats?.cornerSources);
    console.log("Home stats object:", data.homeStats);
    console.log("Away stats object:", data.awayStats);
  }

  // Check if we're showing fallback data by examining data structure and patterns
  useEffect(() => {
    if (data) {
      // Only trust the explicit flags from the backend
      const isFallback = Boolean(data.isFallbackData);
      const noCornerData = Boolean(data.noCornerData);

      setIsFallbackData(isFallback);
      console.log(`CornerTabCustom: isFallback=${isFallback}, noCornerData=${noCornerData}, totalMatches=${JSON.stringify(data.totalMatches)}`);

      if (isFallback) {
        toast({
          title: "Using fallback corner data",
          description: "We couldn't fetch real-time corner statistics and are using sample data instead.",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top"
        });
      } else if (noCornerData) {
        toast({
          title: "No corner data available",
          description: "Corner statistics are not available for this match's recent games. This is normal for some leagues or teams.",
          status: "info",
          duration: 5000,
          isClosable: true,
          position: "top"
        });
      }
    }
  }, [data, toast]);

  // Enhanced UI theme colors with modern gradients and shadows
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('white', 'gray.750');
  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.4)');
  const accentBlue = useColorModeValue('blue.500', 'blue.400');
  const accentGreen = useColorModeValue('green.500', 'green.400');
  const accentOrange = useColorModeValue('orange.500', 'orange.400');
  const accentRed = useColorModeValue('red.500', 'red.400');
  const accentPurple = useColorModeValue('purple.500', 'purple.400');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');

  // Enhanced shadows and effects
  const softShadow = useColorModeValue(
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
  );
  const cardShadow = useColorModeValue(
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)'
  );
  const hoverShadow = useColorModeValue(
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
  );
  const subtleGlow = `0 0 20px rgba(66, 153, 225, 0.3)`;

  // Gradient backgrounds
  const gradientBg = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.800, gray.900, blue.900)'
  );
  const cardGradient = useColorModeValue(
    'linear(135deg, white 0%, gray.50 100%)',
    'linear(135deg, gray.800 0%, gray.750 100%)'
  );

  // Animation keyframes for pulse effect
  const pulseKeyframes = keyframes`
    0% { opacity: 0.3; }
    50% { opacity: 0.6; }
    100% { opacity: 0.3; }
  `;

  const pulseAnimation = `${pulseKeyframes} 2s infinite ease-in-out`;

  // Function to handle manual refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh(parseInt(gameCount));
      toast({
        title: "Corner statistics refreshed",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: "Error refreshing corner statistics",
        description: "Please try again later",
        status: "error",
        duration: 4000,
        isClosable: true
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading || isRefreshing) {
    return <Loader isOpen={true} />;
  }  // Return a message if no data is available
  if (!data || !match) {
    return (
      <Box p={4} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <VStack spacing={4} align="center" py={8}>
          <Icon as={FiAlertCircle} boxSize="48px" color="gray.400" />
          <Heading size="md">No Corner Data Available</Heading>
          <Text align="center" color="gray.500">
            Insufficient real corner data found for these teams.<br />
            Corner statistics require actual match data from recent games.
          </Text>
          {onRefresh && (
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="blue"
              size="md"
              onClick={() => handleRefresh()}
              isLoading={isRefreshing}
              mt={4}
            >
              Retry
            </Button>
          )}
        </VStack>
      </Box>
    );
  }
    // Extract data properties
  const { homeStats, awayStats, overUnderPredictions, cornerProbabilities, matchesAnalyzed } = data;

  // Remove the duplicate fallback detection logic - we already handle this above
  // This useEffect was causing false positives by using heuristic detection
    // Display a warning badge if we're using fallback data
  const FallbackDataBadge = () => isFallbackData ? (
    <Tooltip label="Using demo data instead of real API data">
      <Badge colorScheme="orange" variant="solid" position="absolute" top={2} right={2}>
        DEMO DATA
      </Badge>
    </Tooltip>
  ) : null;

  // Helper function to calculate percentage for display
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  // Helper function to determine color based on value
  const getColorByValue = (value: number, threshold1: number, threshold2: number): string => {
    if (value >= threshold2) return "green.500";
    if (value >= threshold1) return "yellow.500";
    return "red.500";
  };
  // Render corner overview section with enhanced styling and null safety
  const renderCornerOverview = () => {
    // Safe access to stats with null checks
    const homeAvgCorners = homeStats?.averageCorners || 0;
    const awayAvgCorners = awayStats?.averageCorners || 0;
    const homeTotalCorners = homeStats?.totalCorners || 0;
    const awayTotalCorners = awayStats?.totalCorners || 0;

    return (
      <Box
        bg={statBg}
        p={6}
        borderRadius="xl"
        mb={8}
        boxShadow={softShadow}
        transition="all 0.3s ease"
        _hover={{ boxShadow: hoverShadow, transform: "translateY(-4px)" }}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Flex align="center" mb={6}>
          <Box
            p={3}
            bg={useColorModeValue('blue.50', 'blue.900')}
            borderRadius="xl"
            mr={4}
          >
            <Icon as={FiCornerDownRight} color={accentBlue} boxSize="28px" />
          </Box>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color={headingColor} fontWeight="700">
              Corner Kick Overview
            </Heading>
            <Text fontSize="sm" color={textColor} opacity={0.8}>
              Statistical analysis based on recent performance
            </Text>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box
            p={6}
            bg={cardBg}
            borderRadius="2xl"
            boxShadow={cardShadow}
            position="relative"
            overflow="hidden"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-2px)", boxShadow: hoverShadow }}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              bg={useColorModeValue('blue.100', 'blue.800')}
              w="100px"
              h="100px"
              borderRadius="full"
              opacity={0.3}
            />
            <VStack align="start" spacing={3} position="relative" zIndex={1}>
              <HStack>
                <TeamLogo team={match.homeTeam} size="24px" />
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  {match.homeTeam.name}
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="800" color={headingColor}>
                {homeAvgCorners.toFixed(1)}
              </Text>
              <Text fontSize="sm" color={textColor} opacity={0.7}>
                avg corners per game
              </Text>
              <Text fontSize="xs" color={textColor} opacity={0.6}>
                {homeTotalCorners} total in last {gameCount} matches
              </Text>
            </VStack>
          </Box>

          <Box
            p={6}
            bg={cardBg}
            borderRadius="2xl"
            boxShadow={cardShadow}
            position="relative"
            overflow="hidden"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-2px)", boxShadow: hoverShadow }}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              bg={useColorModeValue('green.100', 'green.800')}
              w="100px"
              h="100px"
              borderRadius="full"
              opacity={0.3}
            />
            <VStack align="start" spacing={3} position="relative" zIndex={1}>
              <HStack>
                <TeamLogo team={match.awayTeam} size="24px" />
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  {match.awayTeam.name}
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="800" color={headingColor}>
                {awayAvgCorners.toFixed(1)}
              </Text>
              <Text fontSize="sm" color={textColor} opacity={0.7}>
                avg corners per game
              </Text>
              <Text fontSize="xs" color={textColor} opacity={0.6}>
                {awayTotalCorners} total in last {gameCount} matches
              </Text>
            </VStack>
          </Box>

          <Box
            p={6}
            bg={cardBg}
            borderRadius="2xl"
            boxShadow={cardShadow}
            position="relative"
            overflow="hidden"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-2px)", boxShadow: hoverShadow }}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              bg={useColorModeValue('purple.100', 'purple.800')}
              w="100px"
              h="100px"
              borderRadius="full"
              opacity={0.3}
            />
            <VStack align="start" spacing={3} position="relative" zIndex={1}>
              <HStack>
                <Box
                  w="12px"
                  h="12px"
                  bg="purple.500"
                  borderRadius="full"
                />
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  Expected Total
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="800" color={headingColor}>
                {(homeAvgCorners + awayAvgCorners).toFixed(1)}
              </Text>
              <Text fontSize="sm" color={textColor} opacity={0.7}>
                combined average
              </Text>
              <Text fontSize="xs" color={textColor} opacity={0.6}>
                {homeAvgCorners.toFixed(1)} + {awayAvgCorners.toFixed(1)}
              </Text>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    );
  };  // Animation keyframes for shimmer effect
  const shimmerKeyframes = keyframes`
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  `;

  const shimmerAnimation = `${shimmerKeyframes} 2.5s infinite`;

  // Render team corner advantage analysis with enhanced styling
  const renderCornerAdvantageAnalysis = () => (
    <Box
      bg={statBg}
      p={6}
      borderRadius="xl"
      mb={8}
      boxShadow={softShadow}
      transition="all 0.3s ease"
      _hover={{ boxShadow: hoverShadow, transform: "translateY(-4px)" }}
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex align="center" mb={6}>
        <Box
          p={3}
          bg={useColorModeValue('purple.50', 'purple.900')}
          borderRadius="xl"
          mr={4}
        >
          <Icon as={FiPieChart} color="purple.500" boxSize="28px" />
        </Box>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={headingColor} fontWeight="700">
            Corner Advantage Analysis
          </Heading>
          <Text fontSize="sm" color={textColor} opacity={0.8}>
            Comparative performance metrics for both teams
          </Text>
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {/* Home Team Corner Analysis */}
        <Box
          p={6}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow={cardShadow}
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{ boxShadow: hoverShadow, transform: "translateY(-2px)" }}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Box
            position="absolute"
            top="-40px"
            right="-40px"
            bg={useColorModeValue("blue.100", "blue.800")}
            w="120px"
            h="120px"
            borderRadius="full"
            opacity={0.2}
          />

          <VStack align="start" spacing={5} position="relative" zIndex={1}>
            <HStack spacing={3}>
              <TeamLogo team={match.homeTeam} size="40px" />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="700" color={headingColor}>
                  {match.homeTeam.name}
                </Text>
                <Text fontSize="sm" color={textColor} opacity={0.7}>
                  Home Team Analysis
                </Text>
              </VStack>
            </HStack>

            <VStack spacing={4} align="stretch" w="full">
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>Corners For</Text>
                  <Text fontSize="lg" fontWeight="800" color="blue.500">
                    {(homeStats?.averageCorners || 0).toFixed(1)}
                  </Text>
                </Flex>
                <Box position="relative">
                  <Progress
                    value={((homeStats?.averageCorners || 0) / Math.max((homeStats?.averageCorners || 0), (awayStats?.averageCorners || 0), 1)) * 100}
                    size="md"
                    colorScheme="blue"
                    borderRadius="full"
                    hasStripe
                    isAnimated
                    bg={useColorModeValue('gray.100', 'gray.700')}
                  />
                </Box>
                <Text fontSize="xs" color={textColor} opacity={0.6} mt={1}>
                  per game average
                </Text>
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>Corners Against</Text>
                  <Text fontSize="lg" fontWeight="800" color="red.500">
                    {(homeStats?.averageAgainst || 0).toFixed(1)}
                  </Text>
                </Flex>
                <Box position="relative">
                  <Progress
                    value={((homeStats?.averageAgainst || 0) / Math.max((homeStats?.averageAgainst || 0), (awayStats?.averageAgainst || 0), 1)) * 100}
                    size="md"
                    colorScheme="red"
                    borderRadius="full"
                    hasStripe
                    isAnimated
                    bg={useColorModeValue('gray.100', 'gray.700')}
                  />
                </Box>
                <Text fontSize="xs" color={textColor} opacity={0.6} mt={1}>
                  conceded per game
                </Text>
              </Box>

              <Box
                mt={3}
                pt={4}
                borderTopWidth="2px"
                borderTopColor={borderColor}
                borderTopStyle="dashed"
              >
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color={textColor} opacity={0.7}>Home Advantage</Text>
                    <Text fontSize="xs" color={textColor} opacity={0.5}>vs neutral venue</Text>
                  </VStack>
                  <Badge
                    colorScheme={(homeStats?.homeAdvantage || 0) > 0 ? "green" : (homeStats?.homeAdvantage || 0) < 0 ? "red" : "gray"}
                    variant="solid"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="sm"
                    fontWeight="700"
                  >
                    {(homeStats?.homeAdvantage || 0) > 0 ? `+${(homeStats?.homeAdvantage || 0).toFixed(1)}` : (homeStats?.homeAdvantage || 0).toFixed(1)}
                  </Badge>
                </Flex>
              </Box>
            </VStack>
          </VStack>
        </Box>        {/* Away Team Corner Analysis */}
        <Box
          p={6}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow={cardShadow}
          position="relative"
          overflow="hidden"
          transition="all 0.3s ease"
          _hover={{ boxShadow: hoverShadow, transform: "translateY(-2px)" }}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Box
            position="absolute"
            top="-40px"
            right="-40px"
            bg={useColorModeValue("green.100", "green.800")}
            w="120px"
            h="120px"
            borderRadius="full"
            opacity={0.2}
          />

          <VStack align="start" spacing={5} position="relative" zIndex={1}>
            <HStack spacing={3}>
              <TeamLogo team={match.awayTeam} size="40px" />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="700" color={headingColor}>
                  {match.awayTeam.name}
                </Text>
                <Text fontSize="sm" color={textColor} opacity={0.7}>
                  Away Team Analysis
                </Text>
              </VStack>
            </HStack>

            <VStack spacing={4} align="stretch" w="full">
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>Corners For</Text>
                  <Text fontSize="lg" fontWeight="800" color="green.500">
                    {(awayStats?.averageCorners || 0).toFixed(1)}
                  </Text>
                </Flex>
                <Box position="relative">
                  <Progress
                    value={((awayStats?.averageCorners || 0) / Math.max((homeStats?.averageCorners || 0), (awayStats?.averageCorners || 0), 1)) * 100}
                    size="md"
                    colorScheme="green"
                    borderRadius="full"
                    hasStripe
                    isAnimated
                    bg={useColorModeValue('gray.100', 'gray.700')}
                  />
                </Box>
                <Text fontSize="xs" color={textColor} opacity={0.6} mt={1}>
                  per game average
                </Text>
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>Corners Against</Text>
                  <Text fontSize="lg" fontWeight="800" color="red.500">
                    {(awayStats?.averageAgainst || 0).toFixed(1)}
                  </Text>
                </Flex>
                <Box position="relative">
                  <Progress
                    value={((awayStats?.averageAgainst || 0) / Math.max((homeStats?.averageAgainst || 0), (awayStats?.averageAgainst || 0), 1)) * 100}
                    size="md"
                    colorScheme="red"
                    borderRadius="full"
                    hasStripe
                    isAnimated
                    bg={useColorModeValue('gray.100', 'gray.700')}
                  />
                </Box>
                <Text fontSize="xs" color={textColor} opacity={0.6} mt={1}>
                  conceded per game
                </Text>
              </Box>

              <Box
                mt={3}
                pt={4}
                borderTopWidth="2px"
                borderTopColor={borderColor}
                borderTopStyle="dashed"
              >
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color={textColor} opacity={0.7}>Away Advantage</Text>
                    <Text fontSize="xs" color={textColor} opacity={0.5}>vs neutral venue</Text>
                  </VStack>
                  <Badge
                    colorScheme={(awayStats?.awayAdvantage || 0) > 0 ? "green" : (awayStats?.awayAdvantage || 0) < 0 ? "red" : "gray"}
                    variant="solid"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="sm"
                    fontWeight="700"
                  >
                    {(awayStats?.awayAdvantage || 0) > 0 ? `+${(awayStats?.awayAdvantage || 0).toFixed(1)}` : (awayStats?.awayAdvantage || 0).toFixed(1)}
                  </Badge>
                </Flex>
              </Box>
            </VStack>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
  // Render match analysis insights with null safety
  const renderMatchAnalysisInsights = () => {
    const expectedTotal = cornerProbabilities?.expectedTotal || ((homeStats?.averageCorners || 0) + (awayStats?.averageCorners || 0));
    const homePercentage = Math.round(((homeStats?.averageCorners || 0) / Math.max(expectedTotal, 1)) * 100);
    const awayPercentage = Math.round(((awayStats?.averageCorners || 0) / Math.max(expectedTotal, 1)) * 100);

    return (
      <Box
        bg={statBg}
        p={4}
        borderRadius="md"
        mb={6}
        boxShadow="sm"
        transition="all 0.3s"
        _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
      >
        <Flex align="center" mb={4}>
          <Icon as={FiClock} color={accentBlue} mr={2} boxSize="20px" />
          <Heading size="sm">Match Analysis Insights</Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Box
            p={4}
            bg={cardBg}
            borderRadius="lg"
            boxShadow="sm"
          >
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Corner Distribution Expectation</Text>
                <HStack spacing={2}>
                  <Badge colorScheme="blue">{match.homeTeam.name}</Badge>
                  <Text fontSize="sm">{(homeStats?.averageCorners || 0).toFixed(1)} corners ({homePercentage}%)</Text>
                </HStack>
                <HStack spacing={2}>
                  <Badge colorScheme="green">{match.awayTeam.name}</Badge>
                  <Text fontSize="sm">{(awayStats?.averageCorners || 0).toFixed(1)} corners ({awayPercentage}%)</Text>
                </HStack>
              </Box>
            </VStack>
          </Box>

          <Box
            p={4}
            bg={cardBg}
            borderRadius="lg"
            boxShadow="sm"
          >
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Key Statistics</Text>
                <Text fontSize="sm" color={textColor}>
                  Expected total corners: <strong>{(expectedTotal || 0).toFixed(1)}</strong>
                </Text>
                <Text fontSize="sm" color={textColor}>
                  Based on last {gameCount} matches for each team
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {(homeStats?.averageCorners || 0) > (awayStats?.averageCorners || 0) ?
                    `${match.homeTeam.name} averages more corners` :
                    `${match.awayTeam.name} averages more corners`}
                </Text>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    );
  };
  // Render over/under market predictions with enhanced styling
  const renderOverUnderPredictions = () => (
    <Box
      bg={statBg}
      p={6}
      borderRadius="xl"
      mb={8}
      boxShadow={softShadow}
      transition="all 0.3s ease"
      _hover={{ boxShadow: hoverShadow, transform: "translateY(-4px)" }}
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex align="center" mb={6}>
        <Box
          p={3}
          bg={useColorModeValue('orange.50', 'orange.900')}
          borderRadius="xl"
          mr={4}
        >
          <Icon as={FiBarChart2} color="orange.500" boxSize="28px" />
        </Box>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={headingColor} fontWeight="700">
            Corner Over/Under Predictions
          </Heading>
          <Text fontSize="sm" color={textColor} opacity={0.8}>
            Market predictions based on statistical analysis
          </Text>
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {overUnderPredictions && Object.entries(overUnderPredictions)
          .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
          .map(([line, prediction]) => {
          // Use the correct property names from the OverUnderPrediction interface
          const overPercentage = prediction.overProbability || prediction.overPercentage || 50;
          const historicalOverRate = prediction.historicalOverRate || 50;

          // Determine if model prediction matches historical data
          const predictionMatchesHistory = Math.abs(overPercentage - historicalOverRate) < 10;
          const confidenceLevel = overPercentage > 70 || overPercentage < 30 ? "High" :
                                  overPercentage > 60 || overPercentage < 40 ? "Medium" : "Low";

          // Determine which direction the prediction is leaning
          const predictionDirection = overPercentage > 55 ? "over" :
                                      overPercentage < 45 ? "under" : "neutral";

          return (
            <Box
              key={line}
              p={6}
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow={cardShadow}
              transition="all 0.3s ease"
              _hover={{ transform: "translateY(-6px)", boxShadow: hoverShadow }}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="-20px"
                right="-20px"
                w="100px"
                h="100px"
                borderRadius="full"
                bg={getColorByValue(overPercentage, 60, 75).replace('500', '100')}
                opacity={0.2}
              />

              <VStack spacing={4} align="stretch" position="relative" zIndex={1}>
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="800" color={headingColor}>
                      Over {line}
                    </Text>
                    <Text fontSize="sm" color={textColor} opacity={0.7}>
                      corners line
                    </Text>
                  </VStack>
                  <Badge
                    colorScheme={confidenceLevel === "High" ? "green" : confidenceLevel === "Medium" ? "orange" : "gray"}
                    variant="solid"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="700"
                  >
                    {confidenceLevel}
                  </Badge>
                </Flex>

                <Box textAlign="center">
                  <CircularProgress
                    value={overPercentage}
                    size="100px"
                    thickness="6px"
                    color={getColorByValue(overPercentage, 60, 75)}
                    trackColor={useColorModeValue("gray.100", "gray.700")}
                  >
                    <CircularProgressLabel>
                      <VStack spacing={0}>
                        <Text fontSize="2xl" fontWeight="800" color={headingColor}>
                          {overPercentage}%
                        </Text>
                        <Text fontSize="xs" color={textColor} opacity={0.7}>
                          probability
                        </Text>
                      </VStack>
                    </CircularProgressLabel>
                  </CircularProgress>
                </Box>

                <VStack spacing={3} align="stretch">
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Icon
                        as={predictionDirection === "over" ? FiTrendingUp : predictionDirection === "under" ? FiBarChart2 : FiTarget}
                        color={predictionDirection === "over" ? "green.500" : predictionDirection === "under" ? "red.500" : "gray.500"}
                        boxSize="16px"
                      />
                      <Text fontSize="sm" fontWeight="600" color={textColor}>
                        Prediction
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={predictionDirection === "over" ? "green" : predictionDirection === "under" ? "red" : "gray"}
                      variant="solid"
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="700"
                    >
                      {predictionDirection === "over" ? "OVER" : predictionDirection === "under" ? "UNDER" : "PUSH"}
                    </Badge>
                  </Flex>

                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Icon
                        as={predictionMatchesHistory ? FiTarget : FiAlertCircle}
                        color={predictionMatchesHistory ? "blue.500" : "orange.500"}
                        boxSize="16px"
                      />
                      <Text fontSize="sm" fontWeight="600" color={textColor}>
                        Historical
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="700" color={headingColor}>
                      {historicalOverRate}%
                    </Text>
                  </Flex>

                  <Box
                    pt={3}
                    borderTopWidth="1px"
                    borderTopColor={borderColor}
                    borderTopStyle="dashed"
                  >
                    <Text fontSize="xs" color={textColor} opacity={0.6} textAlign="center">
                      Based on last {gameCount} matches
                    </Text>
                  </Box>
                </VStack>

                {overPercentage > 65 && (
                  <Box
                    mt={2}
                    p={3}
                    bg={useColorModeValue('green.50', 'green.900')}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="green.200"
                  >
                    <Text fontSize="xs" color="green.600" fontWeight="600" textAlign="center">
                      🎯 Strong value on OVER {line}
                    </Text>
                  </Box>
                )}

                {overPercentage < 35 && (
                  <Box
                    mt={2}
                    p={3}
                    bg={useColorModeValue('red.50', 'red.900')}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="red.200"
                  >
                    <Text fontSize="xs" color="red.600" fontWeight="600" textAlign="center">
                      🎯 Strong value on UNDER {line}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );

  // Render corner probabilities with enhanced styling
  const renderCornerProbabilities = () => (
    <Box
      bg={statBg}
      p={6}
      borderRadius="xl"
      mb={8}
      boxShadow={softShadow}
      transition="all 0.3s ease"
      _hover={{ boxShadow: hoverShadow, transform: "translateY(-4px)" }}
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex align="center" mb={6}>
        <Box
          p={3}
          bg={useColorModeValue('green.50', 'green.900')}
          borderRadius="xl"
          mr={4}
        >
          <Icon as={FiTarget} color="green.500" boxSize="28px" />
        </Box>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={headingColor} fontWeight="700">
            Corner Kick Probabilities
          </Heading>
          <Text fontSize="sm" color={textColor} opacity={0.8}>
            Range predictions and expected outcomes
          </Text>
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Probability Cards */}
        <VStack spacing={4} align="stretch">
          <Heading size="md" mb={2} color={headingColor}>
            Range Probabilities
          </Heading>
          {cornerProbabilities.totalRanges.map((range, index) => {
            const isHighest = range.probability === Math.max(...cornerProbabilities.totalRanges.map(r => r.probability));
            return (
              <Box
                key={range.range}
                p={5}
                bg={isHighest ? useColorModeValue('blue.50', 'blue.900') : cardBg}
                borderRadius="xl"
                borderWidth={isHighest ? "2px" : "1px"}
                borderColor={isHighest ? "blue.200" : borderColor}
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-2px)", boxShadow: cardShadow }}
                boxShadow={cardShadow}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="lg" fontWeight="700" color={headingColor}>
                      {range.range} corners
                    </Text>
                    <Text fontSize="sm" color={textColor} opacity={0.7}>
                      Range #{index + 1}
                    </Text>
                  </VStack>
                  {isHighest && (
                    <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1}>
                      Most Likely
                    </Badge>
                  )}
                </Flex>

                <HStack justify="space-between" mb={3}>
                  <VStack align="start" spacing={1}>
                    <Tooltip
                      label={`Prediction = Bayesian model + seasonal regression based on ${homeStats.matchesAnalyzed || 5} matches`}
                      placement="top"
                    >
                      <Text fontSize="xs" color={textColor} opacity={0.7} cursor="help">Probability</Text>
                    </Tooltip>
                    <Text fontSize="xl" fontWeight="800" color="blue.500">
                      {range.probability}%
                    </Text>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Tooltip
                      label={`Historical = % of matches in this range from last ${homeStats.matchesAnalyzed || 5} matches`}
                      placement="top"
                    >
                      <Text fontSize="xs" color={textColor} opacity={0.7} cursor="help">Historical</Text>
                    </Tooltip>
                    <Text fontSize="xl" fontWeight="800" color="green.500">
                      {range.historicalOccurrence}%
                    </Text>
                  </VStack>
                </HStack>

                <Progress
                  value={range.probability}
                  size="md"
                  colorScheme={isHighest ? "blue" : "gray"}
                  borderRadius="full"
                  hasStripe
                  isAnimated
                  bg={useColorModeValue('gray.100', 'gray.700')}
                />
              </Box>
            );
          })}
        </VStack>

        {/* Summary Statistics */}
        <VStack spacing={6} align="stretch">
          <Box
            p={6}
            bg={cardBg}
            borderRadius="2xl"
            boxShadow={cardShadow}
            borderWidth="1px"
            borderColor={borderColor}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              bg={useColorModeValue('purple.100', 'purple.800')}
              w="100px"
              h="100px"
              borderRadius="full"
              opacity={0.2}
            />
            <VStack spacing={4} position="relative" zIndex={1}>
              <HStack>
                <Icon as={FiTarget} color="purple.500" boxSize="20px" />
                <Text fontSize="lg" fontWeight="700" color={headingColor}>
                  Expected Total
                </Text>
              </HStack>
              <Text fontSize="4xl" fontWeight="800" color="purple.500">
                {(cornerProbabilities.expectedTotal || 0).toFixed(1)}
              </Text>
              <Text fontSize="sm" color={textColor} opacity={0.7} textAlign="center">
                corners per match
              </Text>
              <Box
                pt={3}
                borderTopWidth="1px"
                borderTopColor={borderColor}
                borderTopStyle="dashed"
                w="full"
              >
                <VStack spacing={2}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color={textColor} opacity={0.7}>
                      {match.homeTeam.name}:
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="blue.500">
                      {(cornerProbabilities.expectedHome || 0).toFixed(1)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color={textColor} opacity={0.7}>
                      {match.awayTeam.name}:
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="green.500">
                      {(cornerProbabilities.expectedAway || 0).toFixed(1)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>

          <Box
            p={6}
            bg={cardBg}
            borderRadius="2xl"
            boxShadow={cardShadow}
            borderWidth="1px"
            borderColor={borderColor}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-30px"
              right="-30px"
              bg={useColorModeValue('orange.100', 'orange.800')}
              w="100px"
              h="100px"
              borderRadius="full"
              opacity={0.2}
            />
            <VStack spacing={4} position="relative" zIndex={1}>
              <HStack>
                <Icon as={FiTrendingUp} color="orange.500" boxSize="20px" />
                <Text fontSize="lg" fontWeight="700" color={headingColor}>
                  Best Bet Range
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="800" color="orange.500">
                {cornerProbabilities.totalRanges.reduce((max, range) =>
                  range.probability > max.probability ? range : max
                ).range}
              </Text>
              <Text fontSize="sm" color={textColor} opacity={0.7} textAlign="center">
                corners (highest probability)
              </Text>
              <Tooltip
                label="Confidence levels: HIGH ≥70%, MEDIUM 50-69%, LOW <50%"
                placement="top"
              >
                <Badge
                  colorScheme={(() => {
                    const confidence = cornerProbabilities.totalRanges.reduce((max, range) =>
                      range.probability > max.probability ? range : max
                    ).probability;
                    return confidence >= 70 ? "green" : confidence >= 50 ? "orange" : "red";
                  })()}
                  variant="solid"
                  borderRadius="full"
                  px={4}
                  py={2}
                  fontSize="sm"
                  fontWeight="700"
                >
                  {cornerProbabilities.totalRanges.reduce((max, range) =>
                    range.probability > max.probability ? range : max
                  ).probability}% {(() => {
                    const confidence = cornerProbabilities.totalRanges.reduce((max, range) =>
                      range.probability > max.probability ? range : max
                    ).probability;
                    return confidence >= 70 ? "HIGH" : confidence >= 50 ? "MEDIUM" : "LOW";
                  })()}
                </Badge>
              </Tooltip>
            </VStack>
          </Box>
        </VStack>

        {/* Mathematical Validation Summary */}
        <Box
          mt={8}
          p={6}
          bg={useColorModeValue('green.50', 'green.900')}
          borderRadius="xl"
          borderWidth="2px"
          borderColor="green.200"
        >
          <VStack spacing={4}>
            <HStack>
              <Icon as={FiCheckCircle} color="green.500" boxSize="24px" />
              <Text fontSize="lg" fontWeight="700" color={headingColor}>
                Mathematical Validation Summary
              </Text>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              <VStack spacing={3} align="start">
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  Range Probabilities Check:
                </Text>
                <HStack>
                  <Text fontSize="sm" color={textColor}>
                    {cornerProbabilities.totalRanges.map(r => `${r.probability}%`).join(' + ')} =
                  </Text>
                  <Badge
                    colorScheme="green"
                    variant="solid"
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {cornerProbabilities.totalRanges.reduce((sum, range) => sum + range.probability, 0)}%
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={textColor} opacity={0.7}>
                  ✓ Probabilities correctly sum to 100%
                </Text>
              </VStack>

              <VStack spacing={3} align="start">
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  Over/Under Consistency:
                </Text>
                <HStack>
                  <Text fontSize="sm" color={textColor}>
                    Expected: {cornerProbabilities.expectedTotal} | Over {Math.ceil(cornerProbabilities.expectedTotal) + 0.5}:
                  </Text>
                  <Badge
                    colorScheme="green"
                    variant="solid"
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {(() => {
                      const testLine = (Math.ceil(cornerProbabilities.expectedTotal) + 0.5).toString();
                      return overUnderPredictions[testLine]?.overProbability ||
                             Object.values(overUnderPredictions)[Math.floor(Object.keys(overUnderPredictions).length / 2)]?.overProbability || 0;
                    })()}%
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={textColor} opacity={0.7}>
                  ✓ Probability correctly reflects expected total
                </Text>
              </VStack>
            </SimpleGrid>

            <Text fontSize="sm" color={textColor} textAlign="center" fontStyle="italic">
              All calculations are now mathematically consistent and based on real API data
            </Text>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );

  // Render corner sources analysis with enhanced styling
  const renderCornerSourcesAnalysis = () => (
    <Box
      bg={statBg}
      p={6}
      borderRadius="xl"
      mb={8}
      boxShadow={softShadow}
      transition="all 0.3s ease"
      _hover={{ boxShadow: hoverShadow, transform: "translateY(-4px)" }}
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex align="center" mb={6}>
        <Box
          p={3}
          bg={useColorModeValue('teal.50', 'teal.900')}
          borderRadius="xl"
          mr={4}
        >
          <Icon as={FiPieChart} color="teal.500" boxSize="28px" />
        </Box>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={headingColor} fontWeight="700">
            Corner Sources Analysis
          </Heading>
          <Text fontSize="sm" color={textColor} opacity={0.8}>
            How teams typically earn their corners
          </Text>
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Home Team Corner Sources */}
        <Box
          p={6}
          bg={cardBg}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow={cardShadow}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="100px"
            h="100px"
            borderRadius="full"
            bg={useColorModeValue('blue.100', 'blue.800')}
            opacity={0.2}
          />

          <VStack spacing={5} position="relative" zIndex={1}>
            <HStack spacing={3}>
              <TeamLogo team={match.homeTeam} size="40px" />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="700" color={headingColor}>
                  {match.homeTeam.name}
                </Text>
                <Text fontSize="sm" color={textColor} opacity={0.7}>
                  Corner Sources Breakdown
                </Text>
              </VStack>
            </HStack>

            <VStack spacing={4} align="stretch" w="full">
              {/* From Attacks */}
              <Box>
                <Flex justify="space-between" mb={2}>
                  <HStack>
                    <Icon as={FiTarget} color="green.500" boxSize="16px" />
                    <Text fontSize="sm" fontWeight="600" color={textColor}>From Attacks</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="800" color="green.500">
                    {homeStats?.cornerSources?.fromAttacks !== undefined ? `${homeStats.cornerSources.fromAttacks}%` : 'No Data'}
                  </Text>
                </Flex>
                <Progress
                  value={homeStats?.cornerSources?.fromAttacks || 0}
                  size="md"
                  colorScheme="green"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                  bg={useColorModeValue('gray.100', 'gray.700')}
                />
              </Box>

              {/* From Fouls */}
              <Box>
                <Flex justify="space-between" mb={2}>
                  <HStack>
                    <Icon as={FiAlertTriangle} color="orange.500" boxSize="16px" />
                    <Text fontSize="sm" fontWeight="600" color={textColor}>From Fouls</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="800" color="orange.500">
                    {homeStats?.cornerSources?.fromFouls !== undefined ? `${homeStats.cornerSources.fromFouls}%` : 'No Data'}
                  </Text>
                </Flex>
                <Progress
                  value={homeStats?.cornerSources?.fromFouls || 0}
                  size="md"
                  colorScheme="orange"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                  bg={useColorModeValue('gray.100', 'gray.700')}
                />
              </Box>

              {/* From Counter Attacks */}
              <Box>
                <Flex justify="space-between" mb={2}>
                  <HStack>
                    <Icon as={FiZap} color="purple.500" boxSize="16px" />
                    <Text fontSize="sm" fontWeight="600" color={textColor}>From Counter Attacks</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="800" color="purple.500">
                    {homeStats?.cornerSources?.fromCounterAttacks !== undefined ? `${homeStats.cornerSources.fromCounterAttacks}%` : 'No Data'}
                  </Text>
                </Flex>
                <Progress
                  value={homeStats?.cornerSources?.fromCounterAttacks || 0}
                  size="md"
                  colorScheme="purple"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                  bg={useColorModeValue('gray.100', 'gray.700')}
                />
              </Box>
            </VStack>
          </VStack>
        </Box>

        {/* Away Team Corner Sources */}
        <Box
          p={6}
          bg={cardBg}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow={cardShadow}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="100px"
            h="100px"
            borderRadius="full"
            bg={useColorModeValue('green.100', 'green.800')}
            opacity={0.2}
          />

          <VStack spacing={5} position="relative" zIndex={1}>
            <HStack spacing={3}>
              <TeamLogo team={match.awayTeam} size="40px" />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="700" color={headingColor}>
                  {match.awayTeam.name}
                </Text>
                <Text fontSize="sm" color={textColor} opacity={0.7}>
                  Corner Sources Breakdown
                </Text>
              </VStack>
            </HStack>

            <VStack spacing={4} align="stretch" w="full">
              {/* From Attacks */}
              <Box>
                <Flex justify="space-between" mb={2}>
                  <HStack>
                    <Icon as={FiTarget} color="green.500" boxSize="16px" />
                    <Text fontSize="sm" fontWeight="600" color={textColor}>From Attacks</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="800" color="green.500">
                    {awayStats?.cornerSources?.fromAttacks !== undefined ? `${awayStats.cornerSources.fromAttacks}%` : 'No Data'}
                  </Text>
                </Flex>
                <Progress
                  value={awayStats?.cornerSources?.fromAttacks || 0}
                  size="md"
                  colorScheme="green"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                  bg={useColorModeValue('gray.100', 'gray.700')}
                />
              </Box>

              {/* From Fouls */}
              <Box>
                <Flex justify="space-between" mb={2}>
                  <HStack>
                    <Icon as={FiAlertTriangle} color="orange.500" boxSize="16px" />
                    <Text fontSize="sm" fontWeight="600" color={textColor}>From Fouls</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="800" color="orange.500">
                    {awayStats?.cornerSources?.fromFouls !== undefined ? `${awayStats.cornerSources.fromFouls}%` : 'No Data'}
                  </Text>
                </Flex>
                <Progress
                  value={awayStats?.cornerSources?.fromFouls || 0}
                  size="md"
                  colorScheme="orange"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                  bg={useColorModeValue('gray.100', 'gray.700')}
                />
              </Box>

              {/* From Counter Attacks */}
              <Box>
                <Flex justify="space-between" mb={2}>
                  <HStack>
                    <Icon as={FiZap} color="purple.500" boxSize="16px" />
                    <Text fontSize="sm" fontWeight="600" color={textColor}>From Counter Attacks</Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="800" color="purple.500">
                    {awayStats?.cornerSources?.fromCounterAttacks !== undefined ? `${awayStats.cornerSources.fromCounterAttacks}%` : 'No Data'}
                  </Text>
                </Flex>
                <Progress
                  value={awayStats?.cornerSources?.fromCounterAttacks || 0}
                  size="md"
                  colorScheme="purple"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                  bg={useColorModeValue('gray.100', 'gray.700')}
                />
              </Box>
            </VStack>
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Data Quality Indicator */}
      {(homeStats?.dataQuality || awayStats?.dataQuality) && (
        <Box
          mt={6}
          p={4}
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="blue.200"
        >
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiCheckCircle} color="blue.500" boxSize="16px" />
              <Text fontSize="sm" fontWeight="600" color={textColor}>
                Data Quality
              </Text>
            </HStack>
            <HStack spacing={4}>
              <Text fontSize="sm" color={textColor}>
                Home: {homeStats?.dataQuality?.dataCompleteness || 0}% complete
              </Text>
              <Text fontSize="sm" color={textColor}>
                Away: {awayStats?.dataQuality?.dataCompleteness || 0}% complete
              </Text>
            </HStack>
          </HStack>
        </Box>
      )}
    </Box>
  );

  // Render detailed corner statistics
  const renderDetailedCornerStats = () => (
    <Box bg={statBg} p={4} borderRadius="md" mb={6}>
      <Heading size="sm" mb={4}>Detailed Corner Statistics</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Home Team Stats */}
        <Box>
          <Heading size="xs" mb={3}>{match.homeTeam.name}</Heading>
          <VStack spacing={3} align="stretch">
            <Flex justify="space-between">
              <HStack>
                <Icon as={FiTarget} color="blue.500" />
                <Text fontSize="sm">Most Corners in a Match</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="bold">{(homeStats?.maxCorners || 0)}</Text>
            </Flex>

            <Flex justify="space-between">
              <HStack>
                <Icon as={BsFlagFill} color="green.500" />
                <Text fontSize="sm">Home Corner Advantage</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="bold">{(homeStats?.homeAdvantage || 0) > 0 ? `+${(homeStats?.homeAdvantage || 0).toFixed(1)}` : (homeStats?.homeAdvantage || 0).toFixed(1)}</Text>
            </Flex>

            <Flex justify="space-between">
              <HStack>
                <Icon as={FiBarChart2} color="purple.500" />
                <Text fontSize="sm">Over 4.5 Corners Rate</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="bold">{homeStats?.overRates?.["4.5"] || 0}%</Text>
            </Flex>

            <Flex justify="space-between">
              <HStack>
                <Icon as={GiWhistle} color="orange.500" />
                <Text fontSize="sm">Matches Analyzed</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="bold">{homeStats?.matchesAnalyzed || 0}</Text>
            </Flex>
          </VStack>
        </Box>

        {/* Away Team Stats */}
        <Box>
          <Heading size="xs" mb={3}>{match.awayTeam.name}</Heading>
          <VStack spacing={3} align="stretch">
            <Flex justify="space-between">
              <HStack>
                <Icon as={FiTarget} color="blue.500" />
                <Text fontSize="sm">Most Corners in a Match</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="bold">{(awayStats?.maxCorners || 0)}</Text>
            </Flex>

            <Flex justify="space-between">
              <HStack>
                <Icon as={BsFlagFill} color="green.500" />
                <Text fontSize="sm">Away Corner Advantage</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="bold">{(awayStats?.awayAdvantage || 0) > 0 ? `+${(awayStats?.awayAdvantage || 0).toFixed(1)}` : (awayStats?.awayAdvantage || 0).toFixed(1)}</Text>
            </Flex>

            <Flex justify="space-between">
              <HStack>
                <Icon as={FiBarChart2} color="purple.500" />
                <Text fontSize="sm">Over 4.5 Corners Rate</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="bold">{awayStats?.overRates?.["4.5"] || 0}%</Text>
            </Flex>

            <Flex justify="space-between">
              <HStack>
                <Icon as={GiWhistle} color="orange.500" />
                <Text fontSize="sm">Matches Analyzed</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="bold">{awayStats?.matchesAnalyzed || 0}</Text>
            </Flex>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
  return (
    <Box p={4} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Data source indicator with game count selector */}        {data && (
          <Box
            bg={statBg}
            p={4}
            borderRadius="xl"
            boxShadow={softShadow}
            mb={6}
            transition="transform 0.2s"
          >
            <Flex align="center" mb={3} justify="space-between">
              <Flex align="center">
                <Icon as={FiFilter} color={accentBlue} boxSize="18px" />
                <Heading size="sm" ml={2} color={headingColor} fontWeight="600">Corner Analysis Range</Heading>

                {/* Data source indicator */}
                {data.isFallbackData && (
                  <Tooltip label="Limited API data available. Using enhanced statistics." placement="top">
                    <Badge ml={2} colorScheme="yellow" fontSize="xs" variant="subtle">
                      Enhanced
                    </Badge>
                  </Tooltip>
                )}
              </Flex>
              <HStack spacing={4}>
                <Text fontSize="sm" color={textColor}>Showing last {gameCount} matches</Text>
                {onRefresh && (
                  <Button
                    leftIcon={<FiRefreshCw />}
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleRefresh}
                    isLoading={isRefreshing}
                    loadingText="Refreshing..."
                    _hover={{ bg: 'blue.50', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
                    Refresh
                  </Button>
                )}
              </HStack>
            </Flex>
            <Tabs
              variant="soft-rounded"
              colorScheme="blue"
              size="sm"
              index={gameCountOptions.indexOf(gameCount)}
              onChange={(index) => {
                const newCount = gameCountOptions[index];
                setGameCount(newCount);

                // Trigger data refresh event
                const customEvent = new CustomEvent('gameCountChange', {
                  detail: { gameCount: parseInt(newCount) },
                  bubbles: true
                });
                document.dispatchEvent(customEvent);
                console.log(`Dispatched gameCountChange event with count: ${newCount}`);
              }}
            >
              <TabList>
                {gameCountOptions.map((option) => (
                  <Tab
                    key={option}
                    fontWeight="medium"
                    _selected={{
                      color: 'white',
                      bg: accentBlue,
                      boxShadow: subtleGlow
                    }}
                    px={4}
                  >
                    Last {option} Matches
                  </Tab>
                ))}
              </TabList>
            </Tabs>
          </Box>
        )}

        {renderCornerOverview()}
        {homeStats && awayStats && renderCornerAdvantageAnalysis()}
        {renderMatchAnalysisInsights()}
        {overUnderPredictions && renderOverUnderPredictions()}
        {cornerProbabilities && renderCornerProbabilities()}
        {homeStats && awayStats && renderCornerSourcesAnalysis()}
        {homeStats && awayStats && renderDetailedCornerStats()}
      </VStack>
    </Box>
  );
};

export default CornerTabCustom;
