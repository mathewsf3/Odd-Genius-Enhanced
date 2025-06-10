// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  VStack,
  HStack,
  Progress,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Spinner,
  Center,
  Button,
  Tabs,
  TabList,
  Tab,
  useColorModeValue,
  Tooltip,
  keyframes
} from '@chakra-ui/react';
import {
  FiAlertCircle,
  FiRefreshCw,
  FiClock,
  FiUsers,
  FiBarChart2,
  FiTrendingUp
} from 'react-icons/fi';
import {
  BsCardText,
  BsCardHeading,
  BsCardList,
  BsExclamationTriangle
} from 'react-icons/bs';
import { Match } from '../../types/interfaces';
import { CardStats, TeamCardStats } from '../../types/cardStats';
import cardStatsService from '../../services/cardStatsService';
import Loader from '../common/Loader';

interface CustomCardsTabProps {
  match: Match;
  data: CardStats | null;
  isLoading: boolean;
  initialGameCount?: string;
  onRefresh?: (gameCount: number) => void;
}

const CustomCardsTab: React.FC<CustomCardsTabProps> = ({
  match,
  data,
  isLoading,
  initialGameCount = "10",
  onRefresh
}) => {
  const [gameCount, setGameCount] = useState<string>(initialGameCount);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Enhanced debug console logs
  console.log("CustomCardsTab rendered with data:", data, "gameCount:", gameCount);

  // Debug player data specifically
  if (data) {
    console.log("Player Data Debug:");
    console.log("Home team mostCardedPlayers:", data.homeStats?.mostCardedPlayers);
    console.log("Away team mostCardedPlayers:", data.awayStats?.mostCardedPlayers);
    console.log("Home team mostCardedPlayers length:", data.homeStats?.mostCardedPlayers?.length);
    console.log("Away team mostCardedPlayers length:", data.awayStats?.mostCardedPlayers?.length);

    // Log individual player data if available
    if (data.homeStats?.mostCardedPlayers?.length > 0) {
      console.log("First home player:", data.homeStats.mostCardedPlayers[0]);
    }
    if (data.awayStats?.mostCardedPlayers?.length > 0) {
      console.log("First away player:", data.awayStats.mostCardedPlayers[0]);
    }

    // Log the raw data structure to understand what we're receiving
    console.log("Full homeStats structure:", data.homeStats);
    console.log("Full awayStats structure:", data.awayStats);

    // Check if mostCardedPlayers is undefined vs empty array
    console.log("Home mostCardedPlayers type:", typeof data.homeStats?.mostCardedPlayers);
    console.log("Away mostCardedPlayers type:", typeof data.awayStats?.mostCardedPlayers);
    console.log("Home mostCardedPlayers is array:", Array.isArray(data.homeStats?.mostCardedPlayers));
    console.log("Away mostCardedPlayers is array:", Array.isArray(data.awayStats?.mostCardedPlayers));
  }

  // Handle refresh button click
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh(parseInt(gameCount));
      } catch (error) {
        console.error("Error refreshing card stats:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentRed = useColorModeValue('red.500', 'red.300');
  const accentYellow = useColorModeValue('yellow.500', 'yellow.300');
  const textColor = useColorModeValue('gray.800', 'white');

  // Animation keyframes
  const pulseAnimation = keyframes`
    0% { opacity: 0.3; }
    50% { opacity: 0.7; }
    100% { opacity: 0.3; }
  `;
  const pulse = `${pulseAnimation} 2s infinite`;
  const subtleGlow = useColorModeValue(
    '0 0 15px rgba(66, 153, 225, 0.5)',
    '0 0 15px rgba(99, 179, 237, 0.5)'
  );

  // Helper functions
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  // Get confidence level with fixed thresholds: HIGH ≥70%, MEDIUM 40-69%, LOW <40%
  const getConfidenceLevel = (percentage: number, hasValidData: boolean = true): string => {
    // If we don't have valid data, return "No Data"
    if (!hasValidData || (percentage === 0 && !hasValidData)) {
      return "No Data";
    }

    // Fixed confidence thresholds
    if (percentage >= 70) return "HIGH";         // ≥70%
    if (percentage >= 40) return "MEDIUM";       // 40-69%
    return "LOW";                                // <40%
  };

  // Get appropriate color for confidence level
  const getConfidenceColor = (confidence: string): string => {
    switch (confidence) {
      case "LOW": return "red";
      case "MEDIUM": return "orange";
      case "HIGH": return "green";
      case "No Data": return "gray";
      default: return "gray";
    }
  };

  // Get prediction based on percentage (OVER probability)
  const getPrediction = (percentage: number, hasValidData: boolean = true): string => {
    // If we don't have valid data, return "No Data"
    if (!hasValidData || (percentage === 0 && !hasValidData)) {
      return "NO DATA";
    }

    if (percentage > 55) return "OVER";
    if (percentage < 45) return "UNDER";
    return "PUSH";
  };

  // Get a clear explanation of the prediction
  const getPredictionExplanation = (percentage: number, hasValidData: boolean = true): string => {
    // If we don't have valid data, return appropriate message
    if (!hasValidData || (percentage === 0 && !hasValidData)) {
      return "Insufficient data for prediction";
    }

    if (percentage > 55) {
      return `${percentage}% chance of OVER`;
    } else if (percentage < 45) {
      return `${100 - percentage}% chance of UNDER`;
    } else {
      return "50/50 chance";
    }
  };

  // If loading or no data, show loading spinner
  if (isLoading || isRefreshing) {
    return <Loader isOpen={true} />;
  }

  // If no data, show error message
  if (!data) {
    return (
      <Box p={4} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <VStack spacing={4} align="center" py={8}>
          <Icon as={FiAlertCircle} boxSize="48px" color="gray.400" />
          <Heading size="md">No Card Statistics Available</Heading>
          <Text align="center" color="gray.500">
            We were unable to retrieve card statistics for this match.<br />
            This could be because the API data is currently unavailable.
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

  // Log that we're using real API data
  console.log(`CustomCardsTab: Using REAL API data from backend`);
  console.log(`CustomCardsTab: Card stats data:`, data);

  // Extract data for easier access
  const { homeStats, awayStats, combinedStats } = data;

  // Debug the over rates specifically
  console.log(`CustomCardsTab: Combined over rates:`, combinedStats.overRates);
  console.log(`CustomCardsTab: Home over rates:`, homeStats.overRates);
  console.log(`CustomCardsTab: Away over rates:`, awayStats.overRates);
  console.log(`CustomCardsTab: Expected cards: ${combinedStats.averageCardsPerMatch}`);

  // Check if we have valid statistical data
  const hasValidData = combinedStats.averageCardsPerMatch > 0 &&
                      (combinedStats.overRates["3.5"] > 0 || combinedStats.overRates["4.5"] > 0 || combinedStats.overRates["5.5"] > 0);

  // Render the card statistics overview
  return (
    <Box>
      {/* Card Analysis Range Selector */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
        mb={6}
        position="relative"
      >
        <Heading size="md" mb={4}>Card Analysis Range</Heading>
        <Text mb={4}>Showing last {gameCount} matches</Text>

        <Tabs
          variant="soft-rounded"
          colorScheme="red"
          size="sm"
          index={gameCount === "5" ? 0 : 1}
          onChange={(index) => {
            const newCount = index === 0 ? "5" : "10";
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
            <Tab
              fontWeight="medium"
              _selected={{
                color: 'white',
                bg: accentRed,
                boxShadow: subtleGlow
              }}
              px={4}
            >
              Last 5 Matches
            </Tab>
            <Tab
              fontWeight="medium"
              _selected={{
                color: 'white',
                bg: accentRed,
                boxShadow: subtleGlow
              }}
              px={4}
            >
              Last 10 Matches
            </Tab>
          </TabList>
        </Tabs>
      </Box>

      {/* Card Statistics Overview */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
        mb={6}
        position="relative"
      >
        <Flex align="center" mb={4}>
          <Icon as={BsCardText} color={accentRed} mr={2} boxSize="24px" />
          <Heading size="md">Card Statistics Overview</Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {/* Home Team Card Stats */}
          <Stat
            p={3}
            bg={statBg}
            borderRadius="lg"
            boxShadow="sm"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-20px"
              right="-20px"
              bg="red.50"
              w="80px"
              h="80px"
              borderRadius="full"
              opacity="0.4"
            />
            <StatLabel>Cards Per Match ({match.homeTeam.name})</StatLabel>
            <StatNumber>{homeStats.averageCardsPerMatch.toFixed(1)}</StatNumber>
            <StatHelpText>
              <HStack spacing={2}>
                <Badge colorScheme="yellow">{homeStats.totalYellowCards} Yellow</Badge>
                <Badge colorScheme="red">{homeStats.totalRedCards} Red</Badge>
              </HStack>
            </StatHelpText>
          </Stat>

          {/* Away Team Card Stats */}
          <Stat
            p={3}
            bg={statBg}
            borderRadius="lg"
            boxShadow="sm"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-20px"
              right="-20px"
              bg="red.50"
              w="80px"
              h="80px"
              borderRadius="full"
              opacity="0.4"
            />
            <StatLabel>Cards Per Match ({match.awayTeam.name})</StatLabel>
            <StatNumber>{awayStats.averageCardsPerMatch.toFixed(1)}</StatNumber>
            <StatHelpText>
              <HStack spacing={2}>
                <Badge colorScheme="yellow">{awayStats.totalYellowCards} Yellow</Badge>
                <Badge colorScheme="red">{awayStats.totalRedCards} Red</Badge>
              </HStack>
            </StatHelpText>
          </Stat>

          {/* Combined Card Stats */}
          <Stat
            p={3}
            bg={statBg}
            borderRadius="lg"
            boxShadow="sm"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-20px"
              right="-20px"
              bg="red.50"
              w="80px"
              h="80px"
              borderRadius="full"
              opacity="0.4"
            />
            <StatLabel>Expected Cards per Match</StatLabel>
            <StatNumber>{combinedStats.averageCardsPerMatch.toFixed(1)}</StatNumber>
            <StatHelpText>
              <Tooltip label={`Based on last ${gameCount} matches for each team`} placement="top">
                <Text cursor="help">
                  {match.homeTeam.name}: {homeStats.averageCardsPerMatch.toFixed(1)} | {match.awayTeam.name}: {awayStats.averageCardsPerMatch.toFixed(1)}
                </Text>
              </Tooltip>
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>

      {/* Cards by Time Period */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
        mb={6}
      >
        <Flex align="center" mb={4}>
          <Icon as={FiClock} color={accentRed} mr={2} boxSize="24px" />
          <Heading size="md">Cards by Time Period</Heading>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 6 }} spacing={4}>
          {Object.entries(combinedStats.cardsByPeriod).map(([period, count]) => {
            const homeCount = homeStats.cardsByPeriod[period as keyof typeof homeStats.cardsByPeriod];
            const awayCount = awayStats.cardsByPeriod[period as keyof typeof awayStats.cardsByPeriod];

            return (
              <Tooltip
                key={period}
                label={`${match.homeTeam.name}: ${homeCount} | ${match.awayTeam.name}: ${awayCount}`}
                placement="top"
              >
                <Box
                  p={3}
                  bg={statBg}
                  borderRadius="lg"
                  boxShadow="sm"
                  textAlign="center"
                  cursor="help"
                >
                  <Badge colorScheme="red" mb={2}>{period} min</Badge>
                  <Heading size="md">{count}</Heading>
                  <Text fontSize="sm" color="gray.500">cards</Text>

                  <Flex justify="center" mt={2}>
                    <Box
                      w="15px"
                      h={`${Math.max(15, (homeCount / Math.max(1, count)) * 50)}px`}
                      bg="red.400"
                      borderRadius="sm"
                      mr={1}
                    />
                    <Box
                      w="15px"
                      h={`${Math.max(15, (awayCount / Math.max(1, count)) * 50)}px`}
                      bg="red.600"
                      borderRadius="sm"
                    />
                  </Flex>
                  <Flex justify="space-between" mt={1} px={1}>
                    <Text fontSize="xs">{homeCount}</Text>
                    <Text fontSize="xs">{awayCount}</Text>
                  </Flex>
                </Box>
              </Tooltip>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Most Carded Players */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
        mb={6}
      >
        <Flex align="center" mb={4}>
          <Icon as={FiUsers} color={accentRed} mr={2} boxSize="24px" />
          <Heading size="md">Most Carded Players</Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Home Team Players */}
          <Box>
            <Heading size="sm" mb={3}>{match.homeTeam.name}</Heading>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Player</Th>
                  <Th isNumeric>Yellow</Th>
                  <Th isNumeric>Red</Th>
                  <Th isNumeric>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {homeStats.mostCardedPlayers && homeStats.mostCardedPlayers.length > 0 ? (
                  homeStats.mostCardedPlayers.map(player => (
                    <Tr key={player.playerId}>
                      <Td>{player.playerName}</Td>
                      <Td isNumeric>
                        <Badge colorScheme="yellow">{player.yellowCards}</Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme="red">{player.redCards}</Badge>
                      </Td>
                      <Td isNumeric>{player.totalCards}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={4} textAlign="center" color="gray.500">
                      No player card data available for last {gameCount} matches
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>

          {/* Away Team Players */}
          <Box>
            <Heading size="sm" mb={3}>{match.awayTeam.name}</Heading>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Player</Th>
                  <Th isNumeric>Yellow</Th>
                  <Th isNumeric>Red</Th>
                  <Th isNumeric>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {awayStats.mostCardedPlayers && awayStats.mostCardedPlayers.length > 0 ? (
                  awayStats.mostCardedPlayers.map(player => (
                    <Tr key={player.playerId}>
                      <Td>{player.playerName}</Td>
                      <Td isNumeric>
                        <Badge colorScheme="yellow">{player.yellowCards}</Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme="red">{player.redCards}</Badge>
                      </Td>
                      <Td isNumeric>{player.totalCards}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={4} textAlign="center" color="gray.500">
                      No player card data available for last {gameCount} matches
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Card Over/Under Predictions */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
        mb={6}
      >
        <Flex align="center" mb={4}>
          <Icon as={FiBarChart2} color={accentRed} mr={2} boxSize="24px" />
          <Heading size="md">Card Over/Under Predictions</Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {/* Over 3.5 Cards */}
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
          >
            <Heading size="sm" mb={3}>Over 3.5 Cards</Heading>
            <Heading size="xl" color={accentRed} mb={2}>
              {Math.round(combinedStats.overRates["3.5"])}%
            </Heading>
            <Tooltip
              label="Confidence levels: HIGH ≥70%, MEDIUM 40-69%, LOW <40%"
              placement="top"
            >
              <Badge
                colorScheme={getConfidenceColor(getConfidenceLevel(combinedStats.overRates["3.5"], hasValidData))}
                mb={2}
                cursor="help"
              >
                {getConfidenceLevel(combinedStats.overRates["3.5"], hasValidData)} Confidence
              </Badge>
            </Tooltip>
            <Text fontWeight="bold">
              Prediction: {getPrediction(combinedStats.overRates["3.5"], hasValidData)}
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              {getPredictionExplanation(combinedStats.overRates["3.5"], hasValidData)}
            </Text>
            <Tooltip
              label={`Historical = % of matches with >3.5 cards from last ${gameCount} matches`}
              placement="top"
            >
              <Text fontSize="sm" color="gray.500" mt={2} cursor="help">
                Based on last {gameCount} matches
              </Text>
            </Tooltip>
          </Box>

          {/* Over 4.5 Cards */}
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
          >
            <Heading size="sm" mb={3}>Over 4.5 Cards</Heading>
            <Heading size="xl" color={accentRed} mb={2}>
              {Math.round(combinedStats.overRates["4.5"])}%
            </Heading>
            <Badge
              colorScheme={getConfidenceColor(getConfidenceLevel(combinedStats.overRates["4.5"], hasValidData))}
              mb={2}
            >
              {getConfidenceLevel(combinedStats.overRates["4.5"], hasValidData)} Confidence
            </Badge>
            <Text fontWeight="bold">
              Prediction: {getPrediction(combinedStats.overRates["4.5"], hasValidData)}
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              {getPredictionExplanation(combinedStats.overRates["4.5"], hasValidData)}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Based on last {gameCount} matches
            </Text>
          </Box>

          {/* Over 5.5 Cards */}
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
          >
            <Heading size="sm" mb={3}>Over 5.5 Cards</Heading>
            <Heading size="xl" color={accentRed} mb={2}>
              {Math.round(combinedStats.overRates["5.5"])}%
            </Heading>
            <Badge
              colorScheme={getConfidenceColor(getConfidenceLevel(combinedStats.overRates["5.5"], hasValidData))}
              mb={2}
            >
              {getConfidenceLevel(combinedStats.overRates["5.5"], hasValidData)} Confidence
            </Badge>
            <Text fontWeight="bold">
              Prediction: {getPrediction(combinedStats.overRates["5.5"], hasValidData)}
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              {getPredictionExplanation(combinedStats.overRates["5.5"], hasValidData)}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Based on last {gameCount} matches
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Team Card Comparison */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
      >
        <Flex align="center" mb={4}>
          <Icon as={FiTrendingUp} color={accentRed} mr={2} boxSize="24px" />
          <Heading size="md">Team Card Comparison</Heading>
        </Flex>

        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th>Team</Th>
              <Th isNumeric>Yellow/Match</Th>
              {(homeStats.totalRedCards > 0 || awayStats.totalRedCards > 0) && (
                <Th isNumeric>Red/Match</Th>
              )}
              <Th isNumeric>Total/Match</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{match.homeTeam.name}</Td>
              <Td isNumeric>{homeStats.averageYellowCardsPerMatch.toFixed(1)}</Td>
              {(homeStats.totalRedCards > 0 || awayStats.totalRedCards > 0) && (
                <Td isNumeric>{homeStats.averageRedCardsPerMatch.toFixed(1)}</Td>
              )}
              <Td isNumeric fontWeight="bold">{homeStats.averageCardsPerMatch.toFixed(1)}</Td>
            </Tr>
            <Tr>
              <Td>{match.awayTeam.name}</Td>
              <Td isNumeric>{awayStats.averageYellowCardsPerMatch.toFixed(1)}</Td>
              {(homeStats.totalRedCards > 0 || awayStats.totalRedCards > 0) && (
                <Td isNumeric>{awayStats.averageRedCardsPerMatch.toFixed(1)}</Td>
              )}
              <Td isNumeric fontWeight="bold">{awayStats.averageCardsPerMatch.toFixed(1)}</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default CustomCardsTab;
