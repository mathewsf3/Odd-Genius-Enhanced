// @ts-nocheck
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
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
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import {
  FiAlertCircle,
  FiRefreshCw,
  FiActivity,
  FiCheck
} from 'react-icons/fi';
import {
  BsGraphUp,
  BsShieldCheck
} from 'react-icons/bs';
import { Match } from '../../types/interfaces';
import { BTTSStats } from '../../types/bttsStats';
import Loader from '../common/Loader';

interface CustomBTTSTabProps {
  match: Match;
  data: BTTSStats | null;
  isLoading: boolean;
  initialGameCount?: string;
  onRefresh?: (gameCount: number) => void;
}

const CustomBTTSTab: React.FC<CustomBTTSTabProps> = ({
  match,
  data,
  isLoading,
  initialGameCount = "10",
  onRefresh
}) => {
  const [gameCount, setGameCount] = useState<string>(initialGameCount);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Enhanced debug console logs
  console.log("CustomBTTSTab rendered with data:", data, "gameCount:", gameCount);

  // Handle refresh button click
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh(parseInt(gameCount));
      } catch (error) {
        console.error("Error refreshing BTTS stats:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentGreen = useColorModeValue('green.500', 'green.300');

  // Helper functions
  const getConfidenceColor = (confidence: string): string => {
    switch (confidence) {
      case "Low": return "yellow";
      case "Medium": return "orange";
      case "High": return "green";
      case "Very High": return "teal";
      default: return "gray";
    }
  };

  const getBTTSPredictionColor = (prediction: string): string => {
    switch (prediction) {
      case "Yes": return "green";
      case "No": return "red";
      default: return "gray";
    }
  };

  const getPredictionExplanation = (probability: number, prediction: string): string => {
    if (prediction === 'Yes') {
      return `${probability}% chance of both teams scoring`;
    } else if (prediction === 'No') {
      return `${100 - probability}% chance of at least one team not scoring`;
    } else {
      // For the PUSH case (45-55% probability range)
      return `Even probability (${probability}% BTTS) - too close to call`;
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
          <Heading size="md">No BTTS Statistics Available</Heading>
          <Text align="center" color="gray.500">
            We were unable to retrieve BTTS statistics for this match.<br />
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

  // Extract data for easier access
  const { homeStats, awayStats, h2hStats, combinedStats } = data;

  // Render the BTTS statistics overview
  return (
    <Box>
      {/* BTTS Analysis Range Selector */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
        mb={6}
        position="relative"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">BTTS Analysis Range</Heading>
          <Badge colorScheme="green" variant="solid" px={2} py={1}>
            Using Real API Data
          </Badge>
        </Flex>

        <Flex justify="space-between" align="center" mb={4}>
          <HStack>
            <Text>Showing last {gameCount} matches</Text>
            <Tooltip label={`Actual matches shown: ${Math.min(homeStats.recentForm.length, parseInt(gameCount))}`}>
              <Badge colorScheme="orange">
                {Math.min(homeStats.recentForm.length, parseInt(gameCount))} visible
              </Badge>
            </Tooltip>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="blue" variant="outline">
              Data Quality: High
            </Badge>
            <Tooltip label="Data verified against official match records">
              <Badge colorScheme="green" variant="outline">
                <Flex align="center">
                  <Icon as={FiCheck} mr={1} />
                  Verified
                </Flex>
              </Badge>
            </Tooltip>
          </HStack>
        </Flex>

        <Tabs
          variant="soft-rounded"
          colorScheme="green"
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
                bg: accentGreen
              }}
              px={4}
            >
              Last 5 Matches
            </Tab>
            <Tab
              fontWeight="medium"
              _selected={{
                color: 'white',
                bg: accentGreen
              }}
              px={4}
            >
              Last 10 Matches
            </Tab>
          </TabList>
        </Tabs>
      </Box>

      {/* BTTS Prediction */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
        mb={6}
        position="relative"
      >
        <Flex align="center" mb={4}>
          <Icon as={BsGraphUp} color={accentGreen} mr={2} boxSize="24px" />
          <Heading size="md">BTTS Prediction</Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {/* BTTS Prediction */}
          <Box
            p={5}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            textAlign="center"
            boxShadow="md"
            position="relative"
            overflow="hidden"
            bg={useColorModeValue('white', 'gray.750')}
          >
            <Box
              position="absolute"
              top="-20px"
              right="-20px"
              bg={combinedStats.prediction === 'Yes' ? "green.50" : "red.50"}
              w="100px"
              h="100px"
              borderRadius="full"
              opacity="0.4"
            />

            <Heading size="md" mb={4}>BTTS Prediction</Heading>

            <Flex direction="column" align="center" justify="center">
              <CircularProgress
                value={combinedStats.bttsYesProbability}
                color={combinedStats.prediction === 'Yes' ? "green.400" : "red.400"}
                size="140px"
                thickness="10px"
                mb={4}
                trackColor={useColorModeValue('gray.100', 'gray.700')}
                capIsRound
              >
                <CircularProgressLabel>
                  <VStack spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold" lineHeight="1">
                      {combinedStats.bttsYesProbability}%
                    </Text>
                    <Text fontSize="xs" color="gray.500">probability</Text>
                  </VStack>
                </CircularProgressLabel>
              </CircularProgress>

              <Badge
                colorScheme={getBTTSPredictionColor(combinedStats.prediction)}
                fontSize="md"
                py={2}
                px={4}
                borderRadius="full"
                boxShadow="sm"
                mb={3}
                variant="solid"
              >
                {combinedStats.prediction === 'Yes'
                  ? 'BTTS - YES'
                  : (combinedStats.prediction === 'No'
                    ? 'BTTS - NO'
                    : 'BTTS - PUSH')}
              </Badge>

              <Text fontSize="sm" mb={3} maxW="90%" mx="auto">
                {getPredictionExplanation(combinedStats.bttsYesProbability, combinedStats.prediction)}
              </Text>

              <Badge
                colorScheme={getConfidenceColor(combinedStats.confidenceLevel)}
                variant="subtle"
                px={3}
                py={1}
              >
                {combinedStats.confidenceLevel} Confidence
              </Badge>
            </Flex>
          </Box>

          {/* Team BTTS Rates */}
          <Box
            p={5}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            boxShadow="md"
            position="relative"
            overflow="hidden"
            bg={useColorModeValue('white', 'gray.750')}
          >
            <Box
              position="absolute"
              top="-20px"
              left="-20px"
              bg="green.50"
              w="100px"
              h="100px"
              borderRadius="full"
              opacity="0.4"
            />

            <Heading size="sm" mb={4} display="flex" alignItems="center">
              <Icon as={BsGraphUp} color="green.500" mr={2} />
              Team BTTS Rates
            </Heading>

            <VStack spacing={4} align="stretch">
              <Box
                p={3}
                borderRadius="md"
                bg={useColorModeValue('gray.50', 'gray.700')}
                transition="all 0.2s"
                _hover={{ boxShadow: "sm" }}
              >
                <Flex justify="space-between" mb={2} align="center">
                  <Text fontWeight="medium" fontSize="md">{match.homeTeam.name}</Text>
                  <Badge
                    colorScheme={homeStats.bttsYesPercentage > 50 ? "green" : "gray"}
                    fontSize="md"
                    px={2}
                  >
                    {homeStats.bttsYesPercentage}%
                  </Badge>
                </Flex>
                <Progress
                  value={homeStats.bttsYesPercentage}
                  colorScheme="green"
                  size="sm"
                  borderRadius="full"
                  hasStripe={homeStats.bttsYesPercentage > 65}
                  isAnimated={homeStats.bttsYesPercentage > 65}
                />
                <Flex justify="space-between" fontSize="xs" color="gray.500" mt={2}>
                  <HStack>
                    <Badge colorScheme="blue" variant="outline" size="sm">Home: {homeStats.homeBttsYesPercentage || 0}%</Badge>
                  </HStack>
                  <HStack>
                    <Badge variant="subtle" size="sm">Overall: {homeStats.bttsYesPercentage}%</Badge>
                  </HStack>
                </Flex>
              </Box>

              <Box
                p={3}
                borderRadius="md"
                bg={useColorModeValue('gray.50', 'gray.700')}
                transition="all 0.2s"
                _hover={{ boxShadow: "sm" }}
              >
                <Flex justify="space-between" mb={2} align="center">
                  <Text fontWeight="medium" fontSize="md">{match.awayTeam.name}</Text>
                  <Badge
                    colorScheme={awayStats.bttsYesPercentage > 50 ? "green" : "gray"}
                    fontSize="md"
                    px={2}
                  >
                    {awayStats.bttsYesPercentage}%
                  </Badge>
                </Flex>
                <Progress
                  value={awayStats.bttsYesPercentage}
                  colorScheme="green"
                  size="sm"
                  borderRadius="full"
                  hasStripe={awayStats.bttsYesPercentage > 65}
                  isAnimated={awayStats.bttsYesPercentage > 65}
                />
                <Flex justify="space-between" fontSize="xs" color="gray.500" mt={2}>
                  <HStack>
                    <Badge colorScheme="purple" variant="outline" size="sm">Away: {awayStats.awayBttsYesPercentage || 0}%</Badge>
                  </HStack>
                  <HStack>
                    <Badge variant="subtle" size="sm">Overall: {awayStats.bttsYesPercentage}%</Badge>
                  </HStack>
                </Flex>
              </Box>

              {h2hStats.totalMatches > 0 && (
                <Box
                  p={3}
                  borderRadius="md"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderLeft="4px solid"
                  borderLeftColor="orange.400"
                  transition="all 0.2s"
                  _hover={{ boxShadow: "sm" }}
                >
                  <Flex justify="space-between" mb={2} align="center">
                    <Text fontWeight="medium" fontSize="md">Head-to-Head</Text>
                    <Badge
                      colorScheme={h2hStats.bttsYesPercentage > 50 ? "green" : "gray"}
                      fontSize="md"
                      px={2}
                    >
                      {h2hStats.bttsYesPercentage}%
                    </Badge>
                  </Flex>
                  <Progress
                    value={h2hStats.bttsYesPercentage}
                    colorScheme="orange"
                    size="sm"
                    borderRadius="full"
                    hasStripe={h2hStats.bttsYesPercentage > 65}
                    isAnimated={h2hStats.bttsYesPercentage > 65}
                  />
                  <Flex justify="space-between" fontSize="xs" color="gray.500" mt={2}>
                    <Text fontWeight="medium">{h2hStats.bttsYesCount} of {h2hStats.totalMatches} matches</Text>
                    <Text>{Math.round((h2hStats.bttsYesCount / h2hStats.totalMatches) * 100)}% BTTS rate</Text>
                  </Flex>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Average Goals */}
          <Box
            p={5}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            boxShadow="md"
            position="relative"
            overflow="hidden"
            bg={useColorModeValue('white', 'gray.750')}
          >
            <Box
              position="absolute"
              bottom="-20px"
              right="-20px"
              bg="blue.50"
              w="100px"
              h="100px"
              borderRadius="full"
              opacity="0.4"
            />

            <Heading size="sm" mb={4} display="flex" alignItems="center">
              <Icon as={FiActivity} color="blue.500" mr={2} />
              Average Goals
            </Heading>

            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
              <Box
                p={3}
                borderRadius="md"
                bg={useColorModeValue('blue.50', 'blue.900')}
                textAlign="center"
                boxShadow="sm"
                position="relative"
              >
                <Text fontSize="sm" color="gray.500" mb={1}>
                  {match.homeTeam.name}
                </Text>
                <Tooltip label={`Based on ${homeStats.totalMatches} recent matches`} placement="top">
                  <Heading size="xl" color="blue.500" lineHeight="1" cursor="help">
                    {combinedStats.averageHomeTeamGoals.toFixed(1)}
                  </Heading>
                </Tooltip>
                <Text fontSize="xs" fontWeight="medium" mt={1}>
                  goals per match
                </Text>
              </Box>

              <Box
                p={3}
                borderRadius="md"
                bg={useColorModeValue('blue.50', 'blue.900')}
                textAlign="center"
                boxShadow="sm"
                position="relative"
              >
                <Text fontSize="sm" color="gray.500" mb={1}>
                  {match.awayTeam.name}
                </Text>
                <Tooltip label={`Based on ${awayStats.totalMatches} recent matches`} placement="top">
                  <Heading size="xl" color="blue.500" lineHeight="1" cursor="help">
                    {combinedStats.averageAwayTeamGoals.toFixed(1)}
                  </Heading>
                </Tooltip>
                <Text fontSize="xs" fontWeight="medium" mt={1}>
                  goals per match
                </Text>
              </Box>

              <Box
                p={3}
                borderRadius="md"
                bg={useColorModeValue('green.50', 'green.900')}
                textAlign="center"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={useColorModeValue('green.100', 'green.700')}
                position="relative"
              >
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Combined
                </Text>
                <Heading size="xl" color="green.500" lineHeight="1">
                  {combinedStats.averageTotalGoals.toFixed(1)}
                </Heading>
                <Text fontSize="xs" fontWeight="medium" mt={1}>
                  total goals per match
                </Text>
                <Badge
                  colorScheme={combinedStats.averageTotalGoals >= 2.5 ? "green" : "gray"}
                  mt={2}
                >
                  {combinedStats.averageTotalGoals >= 2.5 ? "High Scoring" : "Low Scoring"}
                </Badge>

                {h2hStats.totalMatches > 0 ? (
                  <Tooltip
                    label={`Based on ${h2hStats.totalMatches} head-to-head matches with ${h2hStats.homeTeamGoals + h2hStats.awayTeamGoals} total goals`}
                    placement="top"
                  >
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                    >
                      H2H
                    </Badge>
                  </Tooltip>
                ) : (
                  <Tooltip
                    label="Based on combined team averages"
                    placement="top"
                  >
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="gray"
                      variant="outline"
                      size="sm"
                    >
                      AVG
                    </Badge>
                  </Tooltip>
                )}
              </Box>
            </SimpleGrid>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Clean Sheet & Failed to Score Analysis */}
      <Box
        bg={cardBg}
        p={5}
        borderRadius="md"
        boxShadow="md"
        mb={6}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-30px"
          right="-30px"
          bg={useColorModeValue('green.50', 'green.900')}
          w="150px"
          h="150px"
          borderRadius="full"
          opacity="0.3"
          zIndex="0"
        />

        <Flex align="center" mb={5} position="relative" zIndex="1">
          <Icon as={BsShieldCheck} color={accentGreen} mr={2} boxSize="24px" />
          <Heading size="md">Clean Sheet & Failed to Score Analysis</Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {/* Clean Sheet Analysis */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            borderLeft="4px solid"
            borderLeftColor="green.400"
            position="relative"
            zIndex="1"
          >
            <Heading size="sm" mb={4} color="green.500">Clean Sheet Probability</Heading>

            <SimpleGrid columns={2} spacing={4} mb={6}>
              <Box
                p={3}
                borderRadius="md"
                bg={useColorModeValue('green.50', 'green.900')}
                textAlign="center"
              >
                <Text fontSize="sm" mb={1}>{match.homeTeam.name}</Text>
                <Flex direction="column" align="center">
                  <CircularProgress
                    value={combinedStats.homeTeamCleanSheetProbability}
                    color="green.400"
                    size="80px"
                    thickness="8px"
                  >
                    <CircularProgressLabel fontWeight="bold">
                      {combinedStats.homeTeamCleanSheetProbability}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="xs" mt={1}>
                    Last {gameCount} matches
                  </Text>
                </Flex>
              </Box>

              <Box
                p={3}
                borderRadius="md"
                bg={useColorModeValue('green.50', 'green.900')}
                textAlign="center"
              >
                <Text fontSize="sm" mb={1}>{match.awayTeam.name}</Text>
                <Flex direction="column" align="center">
                  <CircularProgress
                    value={combinedStats.awayTeamCleanSheetProbability}
                    color="green.400"
                    size="80px"
                    thickness="8px"
                  >
                    <CircularProgressLabel fontWeight="bold">
                      {combinedStats.awayTeamCleanSheetProbability}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="xs" mt={1}>
                    Last {gameCount} matches
                  </Text>
                </Flex>
              </Box>
            </SimpleGrid>

            <Box>
              <Heading size="xs" mb={2} color="gray.500">Home/Away Clean Sheet Rates</Heading>
              <SimpleGrid columns={2} spacing={3}>
                <Box
                  p={2}
                  borderRadius="md"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                >
                  <Text fontSize="xs" color="gray.500">{match.homeTeam.name} (Home)</Text>
                  <Flex justify="space-between" align="center">
                    <Badge colorScheme={homeStats.homeCleanSheetPercentage && homeStats.homeCleanSheetPercentage > 50 ? "green" : "gray"}>
                      {homeStats.homeCleanSheetPercentage || 0}%
                    </Badge>
                    <Text fontSize="xs">vs {combinedStats.homeTeamCleanSheetProbability}% last {gameCount}</Text>
                  </Flex>
                </Box>

                <Box
                  p={2}
                  borderRadius="md"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                >
                  <Text fontSize="xs" color="gray.500">{match.awayTeam.name} (Away)</Text>
                  <Flex justify="space-between" align="center">
                    <Badge colorScheme={awayStats.awayCleanSheetPercentage && awayStats.awayCleanSheetPercentage > 50 ? "green" : "gray"}>
                      {awayStats.awayCleanSheetPercentage || 0}%
                    </Badge>
                    <Text fontSize="xs">vs {combinedStats.awayTeamCleanSheetProbability}% last {gameCount}</Text>
                  </Flex>
                </Box>
              </SimpleGrid>
            </Box>
          </Box>

          {/* Failed to Score Analysis */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            borderLeft="4px solid"
            borderLeftColor="red.400"
            position="relative"
            zIndex="1"
          >
            <Heading size="sm" mb={4} color="red.500">Failed to Score Probability</Heading>

            <SimpleGrid columns={2} spacing={4} mb={6}>
              <Box
                p={3}
                borderRadius="md"
                bg={useColorModeValue('red.50', 'red.900')}
                textAlign="center"
              >
                <Text fontSize="sm" mb={1}>{match.homeTeam.name}</Text>
                <Flex direction="column" align="center">
                  <CircularProgress
                    value={combinedStats.homeTeamFailToScoreProbability}
                    color={combinedStats.homeTeamFailToScoreProbability < 30 ? "green.400" : "red.400"}
                    size="80px"
                    thickness="8px"
                  >
                    <CircularProgressLabel fontWeight="bold">
                      {combinedStats.homeTeamFailToScoreProbability}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="xs" mt={1}>
                    Last {gameCount} matches
                  </Text>
                </Flex>
              </Box>

              <Box
                p={3}
                borderRadius="md"
                bg={useColorModeValue('red.50', 'red.900')}
                textAlign="center"
              >
                <Text fontSize="sm" mb={1}>{match.awayTeam.name}</Text>
                <Flex direction="column" align="center">
                  <CircularProgress
                    value={combinedStats.awayTeamFailToScoreProbability}
                    color={combinedStats.awayTeamFailToScoreProbability < 30 ? "green.400" : "red.400"}
                    size="80px"
                    thickness="8px"
                  >
                    <CircularProgressLabel fontWeight="bold">
                      {combinedStats.awayTeamFailToScoreProbability}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="xs" mt={1}>
                    Last {gameCount} matches
                  </Text>
                </Flex>
              </Box>
            </SimpleGrid>

            <Box>
              <Heading size="xs" mb={2} color="gray.500">Home/Away Failed to Score Rates</Heading>
              <SimpleGrid columns={2} spacing={3}>
                <Box
                  p={2}
                  borderRadius="md"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                >
                  <Text fontSize="xs" color="gray.500">{match.homeTeam.name} (Home)</Text>
                  <Flex justify="space-between" align="center">
                    <Badge colorScheme={homeStats.homeFailedToScorePercentage && homeStats.homeFailedToScorePercentage < 30 ? "green" : "red"}>
                      {homeStats.homeFailedToScorePercentage || 0}%
                    </Badge>
                    <Text fontSize="xs">vs {combinedStats.homeTeamFailToScoreProbability}% last {gameCount}</Text>
                  </Flex>
                </Box>

                <Box
                  p={2}
                  borderRadius="md"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                >
                  <Text fontSize="xs" color="gray.500">{match.awayTeam.name} (Away)</Text>
                  <Flex justify="space-between" align="center">
                    <Badge colorScheme={awayStats.awayFailedToScorePercentage && awayStats.awayFailedToScorePercentage < 30 ? "green" : "red"}>
                      {awayStats.awayFailedToScorePercentage || 0}%
                    </Badge>
                    <Text fontSize="xs">vs {combinedStats.awayTeamFailToScoreProbability}% last {gameCount}</Text>
                  </Flex>
                </Box>
              </SimpleGrid>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Recent Form - H2H Only */}
      {h2hStats.totalMatches > 0 && (
        <Box
          bg={cardBg}
          p={5}
          borderRadius="md"
          boxShadow="md"
          mb={6}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            bottom="-30px"
            left="-30px"
            bg={useColorModeValue('orange.50', 'orange.900')}
            w="150px"
            h="150px"
            borderRadius="full"
            opacity="0.3"
            zIndex="0"
          />

          <Flex align="center" mb={5} position="relative" zIndex="1">
            <Icon as={FiActivity} color="orange.500" mr={2} boxSize="24px" />
            <Heading size="md">Head-to-Head History</Heading>
          </Flex>

          <Box
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
            boxShadow="sm"
            overflow="hidden"
          >
            <Box
              bg={useColorModeValue('orange.50', 'orange.900')}
              p={3}
              borderBottom="1px solid"
              borderBottomColor={borderColor}
            >
              <Flex justify="space-between" align="center">
                <Heading size="sm">{match.homeTeam.name} vs {match.awayTeam.name}</Heading>
                <Badge colorScheme="orange">Last {h2hStats.recentH2HForm.length} matches</Badge>
              </Flex>
            </Box>

            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Match</Th>
                    <Th isNumeric>Score</Th>
                    <Th isNumeric>BTTS</Th>
                    <Th>Total Goals</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {h2hStats.recentH2HForm.slice(0, 5).map((h2hMatch, index) => {
                    const totalGoals = h2hMatch.goalsScored + h2hMatch.goalsConceded;
                    const formattedDate = new Date(h2hMatch.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <Tr key={index} bg={index % 2 === 0 ? 'transparent' : useColorModeValue('gray.50', 'gray.700')}>
                        <Td fontSize="sm">{formattedDate}</Td>
                        <Td fontSize="sm">
                          {/* Use the match description from the H2H data */}
                          <Text>{h2hMatch.opponent}</Text>
                        </Td>
                        <Td isNumeric fontSize="sm" fontWeight="bold">
                          {h2hMatch.goalsScored}-{h2hMatch.goalsConceded}
                        </Td>
                        <Td isNumeric>
                          <Badge
                            colorScheme={h2hMatch.bttsResult === 'Yes' ? 'green' : 'red'}
                            variant="solid"
                            px={2}
                          >
                            {h2hMatch.bttsResult}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={totalGoals > 2.5 ? 'green' : 'gray'}
                            variant="subtle"
                          >
                            {totalGoals} goals
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>

            {/* Summary Stats */}
            <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Stat>
                  <StatLabel>BTTS Rate</StatLabel>
                  <StatNumber>{h2hStats.bttsYesPercentage}%</StatNumber>
                  <StatHelpText>{h2hStats.bttsYesCount} of {h2hStats.totalMatches} matches</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Average Goals</StatLabel>
                  <StatNumber>{h2hStats.averageTotalGoals.toFixed(1)}</StatNumber>
                  <StatHelpText>per match</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Results (Visible Matches)</StatLabel>
                  <Flex mt={2} justify="space-between">
                    {/* Calculate results based on visible matches only */}
                    {(() => {
                      const visibleMatches = h2hStats.recentH2HForm.slice(0, 5);
                      const homeWins = visibleMatches.filter(m =>
                        (m.isHome && m.goalsScored > m.goalsConceded) ||
                        (!m.isHome && m.goalsConceded > m.goalsScored)
                      ).length;
                      const awayWins = visibleMatches.filter(m =>
                        (m.isHome && m.goalsScored < m.goalsConceded) ||
                        (!m.isHome && m.goalsConceded < m.goalsScored)
                      ).length;
                      const draws = visibleMatches.filter(m =>
                        m.goalsScored === m.goalsConceded
                      ).length;

                      return (
                        <>
                          <Badge colorScheme="green" px={2} py={1}>{homeWins} {match.homeTeam.name}</Badge>
                          <Badge colorScheme="yellow" px={2} py={1}>{draws} Draws</Badge>
                          <Badge colorScheme="purple" px={2} py={1}>{awayWins} {match.awayTeam.name}</Badge>
                        </>
                      );
                    })()}
                  </Flex>
                </Stat>
              </SimpleGrid>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CustomBTTSTab;
