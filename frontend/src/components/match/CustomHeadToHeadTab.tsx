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
  Image,
  Badge,
  Tag,
  IconButton,
  Tooltip,
  ButtonGroup,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Icon,
} from '@chakra-ui/react';
import { Match, H2HData, BaseMatch } from '../../types/interfaces';
import { FiTrendingUp, FiCalendar, FiInfo, FiCheckCircle, FiXCircle, FiFilter, FiAlertCircle } from 'react-icons/fi';
import Loader from '../common/Loader';

// Define an interface for the H2H match that includes the result property
interface MatchWithResult extends BaseMatch {
  result?: 'HOME' | 'AWAY' | 'DRAW';
}

// Update the H2HData interface to use our extended match type with explicit typing
interface ExtendedH2HData extends Omit<H2HData, 'matches'> {
  matches: MatchWithResult[];
}

interface CustomHeadToHeadTabProps {
  match: Match;
  data: H2HData | null;
  isLoading: boolean;
  initialMatchRange?: number;
}

const CustomHeadToHeadTab: React.FC<CustomHeadToHeadTabProps> = ({ match, data, isLoading, initialMatchRange }) => {  // Enhanced modern betting app color scheme with neumorphic styling
  // Add state for match range (5 or 10 matches)
  const [matchRange, setMatchRange] = useState<5 | 10>(initialMatchRange === 5 ? 5 : 10);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('white', 'gray.700');
  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.06)', 'rgba(0, 0, 0, 0.3)');
  const accentBlue = useColorModeValue('blue.500', 'blue.300');
  const accentGreen = useColorModeValue('green.400', 'green.300');
  const accentOrange = useColorModeValue('orange.400', 'orange.300');
  const accentRed = useColorModeValue('red.500', 'red.300');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const headingColor = useColorModeValue('gray.800', 'white');
  const highlightColor = useColorModeValue('yellow.100', 'yellow.900');
  const softShadow = `0px 10px 25px ${shadowColor}, 0px 5px 15px ${shadowColor}`;
  const sharpShadow = `0px 4px 8px ${shadowColor}, 0px 1px 3px ${shadowColor}`;
  const innerShadow = `inset 0px 2px 4px ${shadowColor}`;
  const subtleGlow = `0 0 15px rgba(66, 153, 225, 0.4)`;
  const greenGlow = `0 0 12px rgba(72, 187, 120, 0.3)`;
  const redGlow = `0 0 12px rgba(245, 101, 101, 0.3)`;

  // Show loading state while data is being fetched
  if (isLoading || (!data && match?.homeTeam?.id && match?.awayTeam?.id)) {
    return <Loader isOpen={true} />;
  }

  // Return a message if no data is available AND we have valid match data (meaning fetch completed)
  if (!data && match?.homeTeam?.id && match?.awayTeam?.id) {
    return (
      <Box p={4} bg={cardBg} borderRadius="xl" boxShadow={softShadow}>
        <VStack spacing={4} align="center" py={8}>
          <Icon as={FiAlertCircle} boxSize="48px" color="gray.400" />
          <Heading size="md">No Head-to-Head Data Available</Heading>
          <Text align="center" color="gray.500">
            No historical matches found between these teams.<br />
            This could be their first encounter or data may be limited.
          </Text>
        </VStack>
      </Box>
    );
  }

  // If we don't have match data yet, show loading
  if (!match?.homeTeam?.id || !match?.awayTeam?.id) {
    return <Loader isOpen={true} />;
  }

  // Enhanced logging for debugging logo issues
  console.log("🔍 [H2H Component] Data received:", data);
  console.log("🔍 [H2H Component] Match prop:", match);

  if (data) {
    console.log("🔍 [H2H Component] First team:", data.firstTeam?.name, "| Logo:", data.firstTeam?.logo ? '✅' : '❌');
    console.log("🔍 [H2H Component] Second team:", data.secondTeam?.name, "| Logo:", data.secondTeam?.logo ? '✅' : '❌');
    console.log("🔍 [H2H Component] Total matches:", data.matches?.length || 0);

    if (data.matches && data.matches.length > 0) {
      const firstMatch = data.matches[0];
      console.log("🔍 [H2H Component] First match home team:", firstMatch.homeTeam?.name, "| Logo:", firstMatch.homeTeam?.logo ? '✅' : '❌');
      console.log("🔍 [H2H Component] First match away team:", firstMatch.awayTeam?.name, "| Logo:", firstMatch.awayTeam?.logo ? '✅' : '❌');

      if (firstMatch.homeTeam?.logo) {
        console.log("🔍 [H2H Component] First match home logo URL:", firstMatch.homeTeam.logo);
      }
      if (firstMatch.awayTeam?.logo) {
        console.log("🔍 [H2H Component] First match away logo URL:", firstMatch.awayTeam.logo);
      }
    }

    console.log("🔍 [H2H Component] Summary data:", data.summary);
  } else {
    console.log("❌ [H2H Component] No H2H data received");
  }
    // Extract data from H2H data
  const { summary, matches: allMatches } = data;
  const { firstTeam, secondTeam } = data;

  // Filter matches based on selected range (5 or 10)
  // Sort matches by date (newest first) to make sure we get the most recent ones
  const sortedMatches = [...allMatches].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Take only the number of matches specified by matchRange
  const filteredMatches = sortedMatches.slice(0, matchRange);
  const matches = filteredMatches;

  // Calculate stats based on the filtered matches
  const calculateMatchStats = (matchesToAnalyze: typeof matches) => {
    // Calculate win/loss/draw stats
    const stats = {
      wins: {
        firstTeam: 0,
        secondTeam: 0,
        draws: 0
      },
      goals: {
        firstTeam: 0,
        secondTeam: 0
      },
      totalMatches: matchesToAnalyze.length
    };
      matchesToAnalyze.forEach(match => {
      // Cast match to our extended interface with the result field
      const matchWithResult = match as unknown as MatchWithResult;

      // Calculate results
      if (!matchWithResult.result) {
        // If no result field exists, calculate it based on score
        if (match.score.home === match.score.away) {
          stats.wins.draws++;
        } else if (
          (match.homeTeam.id === firstTeam.id && match.score.home > match.score.away) ||
          (match.awayTeam.id === firstTeam.id && match.score.away > match.score.home)
        ) {
          stats.wins.firstTeam++;
        } else {
          stats.wins.secondTeam++;
        }
      } else if (matchWithResult.result === 'DRAW') {
        stats.wins.draws++;
      } else if (
        (matchWithResult.result === 'HOME' && match.homeTeam.id === firstTeam.id) ||
        (matchWithResult.result === 'AWAY' && match.awayTeam.id === firstTeam.id)
      ) {
        stats.wins.firstTeam++;
      } else {
        stats.wins.secondTeam++;
      }

      // Calculate goals
      if (match.score) {
        if (match.homeTeam.id === firstTeam.id) {
          stats.goals.firstTeam += parseInt(match.score.home.toString());
          stats.goals.secondTeam += parseInt(match.score.away.toString());
        } else {
          stats.goals.firstTeam += parseInt(match.score.away.toString());
          stats.goals.secondTeam += parseInt(match.score.home.toString());
        }
      }
    });

    return stats;
  };

  // Calculate stats based on filtered matches
  const currentStats = calculateMatchStats(matches);
  const totalMatches = currentStats.totalMatches;

  // Calculate percentages based on filtered data
  const firstTeamWinPercentage = totalMatches > 0 ? (currentStats.wins.firstTeam / totalMatches) * 100 : 0;
  const secondTeamWinPercentage = totalMatches > 0 ? (currentStats.wins.secondTeam / totalMatches) * 100 : 0;
  const drawPercentage = totalMatches > 0 ? (currentStats.wins.draws / totalMatches) * 100 : 0;

  // Calculate average goals per match based on filtered data
  const avgGoalsPerMatch = totalMatches > 0
    ? (currentStats.goals.firstTeam + currentStats.goals.secondTeam) / totalMatches
    : 0;
  // Helper function to render team logo with proper fallback (similar to MatchHeader)
  const renderTeamLogo = (teamId: string, teamName: string, size: string = "24px") => {
    // Determine which team logo to use based on team ID
    let logoUrl = '';

    console.log(`🔍 [H2H] renderTeamLogo called with ID: ${teamId}, Name: ${teamName}`);
    console.log(`🔍 [H2H] First team - ID: ${firstTeam?.id}, Name: ${firstTeam?.name}, Logo: ${firstTeam?.logo ? '✅' : '❌'}`);
    console.log(`🔍 [H2H] Second team - ID: ${secondTeam?.id}, Name: ${secondTeam?.name}, Logo: ${secondTeam?.logo ? '✅' : '❌'}`);

    // Try to match by team ID first
    if (teamId === firstTeam?.id) {
      logoUrl = firstTeam.logo;
      console.log(`🔍 [H2H] Matched first team by ID: ${logoUrl}`);
    } else if (teamId === secondTeam?.id) {
      logoUrl = secondTeam.logo;
      console.log(`🔍 [H2H] Matched second team by ID: ${logoUrl}`);
    } else {
      // Fallback: try to match by name
      if (teamName === firstTeam?.name) {
        logoUrl = firstTeam.logo;
        console.log(`🔍 [H2H] Matched first team by name: ${logoUrl}`);
      } else if (teamName === secondTeam?.name) {
        logoUrl = secondTeam.logo;
        console.log(`🔍 [H2H] Matched second team by name: ${logoUrl}`);
      } else {
        console.log(`🔍 [H2H] No match found for team: ${teamName} (${teamId})`);
      }
    }

    // If no logo found in H2H data, try to get from match prop as fallback
    if (!logoUrl && match) {
      if (teamName === match.homeTeam?.name || teamId === match.homeTeam?.id) {
        logoUrl = match.homeTeam?.logo;
        console.log(`🔍 [H2H] Using match home team logo as fallback: ${logoUrl}`);
      } else if (teamName === match.awayTeam?.name || teamId === match.awayTeam?.id) {
        logoUrl = match.awayTeam?.logo;
        console.log(`🔍 [H2H] Using match away team logo as fallback: ${logoUrl}`);
      }
    }

    // Create fallback URL
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`;

    console.log(`🔍 [H2H] Final logo URL for ${teamName}: ${logoUrl || 'using fallback'}`);

    return (
      <Image
        src={logoUrl || fallbackUrl}
        alt={teamName}
        boxSize={size}
        borderRadius="full"
        border="1px solid"
        borderColor={borderColor}
        bg="white"
        p="1px"
        boxShadow={`0 1px 3px ${shadowColor}`}
        fallbackSrc={fallbackUrl}
        onLoad={() => {
          console.log(`✅ [H2H] Team logo loaded successfully: ${teamName} - ${logoUrl || fallbackUrl}`);
        }}
        onError={(e) => {
          console.log(`❌ [H2H] Team logo load error for ${teamName}:`, e);
          console.log(`❌ [H2H] Attempted URL: ${logoUrl || 'none'}`);
          console.log(`❌ [H2H] Fallback URL: ${fallbackUrl}`);
        }}
      />
    );
  };// Render the summary stats section with enhanced styling
  const renderSummaryStats = () => (
    <Box
      bg={statBg}
      p={5}
      borderRadius="xl"
      boxShadow={softShadow}
      mb={6}
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: `${softShadow}, ${subtleGlow}` }}
    >
      <Flex align="center" justify="space-between" mb={4}>
        <Flex align="center">
          <FiTrendingUp size="20px" color={accentGreen} />
          <Heading size="md" ml={2} color={headingColor} fontWeight="600">Head to Head Summary</Heading>
        </Flex>
        <Badge colorScheme="blue" py={1} px={2} borderRadius="md">
          Based on {matchRange} matches
        </Badge>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Box
          borderRadius="lg"
          bg={cardBg}
          p={4}
          boxShadow={innerShadow}
          border="1px solid"
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel fontSize="sm" color={textColor}>Total Matches</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color={accentBlue}>{totalMatches}</StatNumber>
            <StatHelpText fontSize="xs">
              <Tag size="sm" colorScheme="blue" variant="subtle" mt={1}>
                All time record
              </Tag>
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          borderRadius="lg"
          bg={cardBg}
          p={4}
          boxShadow={innerShadow}
          border="1px solid"
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel fontSize="sm" color={textColor}>Average Goals / Match</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color={accentGreen}>{avgGoalsPerMatch.toFixed(1)}</StatNumber>
            <StatHelpText fontSize="xs">
              <HStack spacing={1}>
                <Box w="6px" h="6px" borderRadius="full" bg="green.400" />
                <Text>High scoring matchup</Text>
              </HStack>
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          borderRadius="lg"
          bg={cardBg}
          p={4}
          boxShadow={innerShadow}
          border="1px solid"
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel fontSize="sm" color={textColor}>Most Recent Match</StatLabel>
            <StatNumber fontSize="xl" fontWeight="bold" color={headingColor}>
              {matches && matches.length > 0
                ? new Date(matches[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'N/A'}
            </StatNumber>
            <StatHelpText fontSize="xs">
              <Flex align="center">
                <FiCalendar size="12px" />
                <Text ml={1}>Last encounter</Text>
              </Flex>
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>
    </Box>
  );  // Render the win percentage bar with enhanced styling
  const renderWinBar = () => {
    // Use the already calculated stats for the filtered matches
    const firstTeamWins = currentStats.wins.firstTeam;
    const secondTeamWins = currentStats.wins.secondTeam;
    const drawsCount = currentStats.wins.draws;

    // Percentages are already calculated at the top level based on filtered matches
    const recalcFirstTeamWinPercentage = firstTeamWinPercentage;
    const recalcSecondTeamWinPercentage = secondTeamWinPercentage;
    const recalcDrawPercentage = drawPercentage;

    return (
      <Box
        bg={statBg}
        p={5}
        borderRadius="xl"
        boxShadow={softShadow}
        mb={6}
        transition="transform 0.2s"
        _hover={{ transform: 'translateY(-2px)' }}
      >
        <Flex align="center" mb={4}>
          <FiCheckCircle size="20px" color={accentGreen} />
          <Heading size="sm" ml={2} color={headingColor} fontWeight="600">Head to Head Record</Heading>
        </Flex>
        <Box
          p={4}
          borderRadius="lg"
          bg={cardBg}
          boxShadow={innerShadow}
          border="1px solid"
          borderColor={borderColor}
          mb={4}
        >
          <Flex align="center" justify="space-between" mb={4}>
            <HStack spacing={3}>
              <Box position="relative" boxSize="40px">
                {renderTeamLogo(firstTeam.id, firstTeam.name, "40px")}
                <Badge
                  position="absolute"
                  bottom="-2px"
                  right="-2px"
                  bg="blue.500"
                  color="white"
                  borderRadius="full"
                  boxSize="20px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {firstTeamWins}
                </Badge>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="md" color={headingColor}>{firstTeam.name}</Text>
                <Text fontSize="xs" color={textColor}>Win rate: {recalcFirstTeamWinPercentage.toFixed(0)}%</Text>
              </Box>
            </HStack>

            <Box textAlign="center" px={4} py={2} borderRadius="md" bg="gray.100">
              <Text fontSize="sm" fontWeight="medium" color="gray.600">Draws</Text>
              <Text fontWeight="bold" fontSize="lg" color="gray.600">{drawsCount}</Text>
              <Text fontSize="xs" color="gray.500">{recalcDrawPercentage.toFixed(0)}%</Text>
            </Box>

            <HStack spacing={3}>
              <Box textAlign="right">
                <Text fontWeight="bold" fontSize="md" color={headingColor}>{secondTeam.name}</Text>
                <Text fontSize="xs" color={textColor}>Win rate: {recalcSecondTeamWinPercentage.toFixed(0)}%</Text>
              </Box>
              <Box position="relative" boxSize="40px">
                {renderTeamLogo(secondTeam.id, secondTeam.name, "40px")}
                <Badge
                  position="absolute"
                  bottom="-2px"
                  right="-2px"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  boxSize="20px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {secondTeamWins}
                </Badge>
              </Box>
            </HStack>
          </Flex>
        </Box>

        <Box position="relative" pt={2} px={2}>
          <Box
            position="relative"
            h="24px"
            w="100%"
            borderRadius="full"
            overflow="hidden"
            boxShadow={innerShadow}
          >
            <Flex h="100%">
              <Box
                bg="blue.500"
                h="100%"
                w={`${recalcFirstTeamWinPercentage}%`}
                transition="width 0.5s"
                _hover={{ boxShadow: subtleGlow }}
              />
              <Box
                bg="gray.300"
                h="100%"
                w={`${recalcDrawPercentage}%`}
                transition="width 0.5s"
              />
              <Box
                bg="red.500"
                h="100%"
                w={`${recalcSecondTeamWinPercentage}%`}
                transition="width 0.5s"
                _hover={{ boxShadow: redGlow }}
              />
            </Flex>
          </Box>
          <Flex justify="space-between" mt={2}>
            <Text fontSize="xs" fontWeight="bold" color="blue.500">{recalcFirstTeamWinPercentage.toFixed(0)}%</Text>
            <Text fontSize="xs" fontWeight="bold" color="gray.600">{recalcDrawPercentage.toFixed(0)}%</Text>
            <Text fontSize="xs" fontWeight="bold" color="red.500">{recalcSecondTeamWinPercentage.toFixed(0)}%</Text>
          </Flex>
        </Box>
      </Box>
    );
  };
  // Render goal stats with enhanced styling
  const renderGoalStats = () => {
    // Always recalculate goal stats directly from the match data to ensure consistency
    const calculatedGoals = {
      firstTeam: 0,
      secondTeam: 0
    };

    matches.forEach(match => {
      if (!match.score) {
        console.warn('Match missing score data:', match.id);
        return;
      }

      if (match.homeTeam.id === firstTeam.id) {
        calculatedGoals.firstTeam += parseInt(match.score.home.toString());
        calculatedGoals.secondTeam += parseInt(match.score.away.toString());
      } else {
        calculatedGoals.firstTeam += parseInt(match.score.away.toString());
        calculatedGoals.secondTeam += parseInt(match.score.home.toString());
      }
    });

    console.log("Calculated goals from matches:", calculatedGoals);
    console.log("Goals from summary:", summary.goals);

    // Always use recalculated values from actual match data for consistency
    const firstTeamGoals = calculatedGoals.firstTeam;
    const secondTeamGoals = calculatedGoals.secondTeam;
    const totalGoals = firstTeamGoals + secondTeamGoals;

    return (
      <Box
        bg={statBg}
        p={5}
        borderRadius="xl"
        boxShadow={softShadow}
        mb={6}
        transition="transform 0.2s"
        _hover={{ transform: 'translateY(-2px)' }}
      >
        <Flex align="center" mb={4}>
          <FiInfo size="20px" color={accentBlue} />
          <Heading size="sm" ml={2} color={headingColor} fontWeight="600">Goal Statistics</Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box
            p={4}
            borderRadius="lg"
            bg={cardBg}
            boxShadow={innerShadow}
            border="1px solid"
            borderColor={borderColor}
            position="relative"
            overflow="hidden"
            transition="transform 0.2s, box-shadow 0.3s"
            _hover={{ transform: 'translateY(-2px)', boxShadow: `${sharpShadow}, ${subtleGlow}` }}
          >
            <Box position="absolute" top={0} right={0} w="8px" h="8px" borderRadius="0 0 0 8px" bg="blue.500" />
            <HStack mb={2}>
              {renderTeamLogo(firstTeam.id, firstTeam.name)}
              <Text fontWeight="bold" fontSize="md" color={headingColor}>{firstTeam.name}</Text>
            </HStack>
            <Flex align="baseline">
              <Text fontSize="3xl" fontWeight="bold" color={accentBlue}>{firstTeamGoals}</Text>
              <Text ml={2} fontSize="md" color={textColor}>goals</Text>
            </Flex>
            <Box mt={3} pb={2}>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="xs" color={textColor}>Per Match</Text>
                <Text fontSize="xs" fontWeight="bold" color={accentBlue}>
                  {totalMatches > 0 ? (firstTeamGoals / totalMatches).toFixed(1) : '0'}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="xs" color={textColor}>Proportion</Text>
                <Text fontSize="xs" fontWeight="bold" color={accentBlue}>
                  {totalGoals > 0 ? ((firstTeamGoals / totalGoals) * 100).toFixed(0) : '0'}%
                </Text>
              </Flex>
            </Box>
          </Box>

          <Box
            p={4}
            borderRadius="lg"
            bg={cardBg}
            boxShadow={innerShadow}
            border="1px solid"
            borderColor={borderColor}
            position="relative"
            overflow="hidden"
            transition="transform 0.2s, box-shadow 0.3s"
            _hover={{ transform: 'translateY(-2px)', boxShadow: `${sharpShadow}, ${redGlow}` }}
          >
            <Box position="absolute" top={0} right={0} w="8px" h="8px" borderRadius="0 0 0 8px" bg="red.500" />
            <HStack mb={2}>
              {renderTeamLogo(secondTeam.id, secondTeam.name)}
              <Text fontWeight="bold" fontSize="md" color={headingColor}>{secondTeam.name}</Text>
            </HStack>
            <Flex align="baseline">
              <Text fontSize="3xl" fontWeight="bold" color="red.500">{secondTeamGoals}</Text>
              <Text ml={2} fontSize="md" color={textColor}>goals</Text>
            </Flex>
            <Box mt={3} pb={2}>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="xs" color={textColor}>Per Match</Text>
                <Text fontSize="xs" fontWeight="bold" color="red.500">
                  {totalMatches > 0 ? (secondTeamGoals / totalMatches).toFixed(1) : '0'}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="xs" color={textColor}>Proportion</Text>
                <Text fontSize="xs" fontWeight="bold" color="red.500">
                  {totalGoals > 0 ? ((secondTeamGoals / totalGoals) * 100).toFixed(0) : '0'}%
                </Text>
              </Flex>
            </Box>
          </Box>
        </SimpleGrid>

        {/* Total goals visualization */}
        <Box
          mt={4}
          p={4}
          borderRadius="lg"
          bg={cardBg}
          boxShadow={innerShadow}
          border="1px solid"
          borderColor={borderColor}
          transition="transform 0.2s"
          _hover={{ boxShadow: sharpShadow }}
        >
          <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>Goal Distribution</Text>
          <Box position="relative" h="12px" bg="gray.100" borderRadius="full" overflow="hidden">
            <Box
              position="absolute"
              left="0"
              top="0"
              h="100%"
              bg="blue.500"
              w={totalGoals > 0 ? `${(firstTeamGoals / totalGoals) * 100}%` : '0%'}
              transition="width 0.5s"
              _hover={{ boxShadow: subtleGlow }}
            />
          </Box>
          <Flex justify="space-between" mt={2}>
            <HStack>
              <Box w="10px" h="10px" borderRadius="sm" bg="blue.500" />
              <Text fontSize="xs">{firstTeam.name}</Text>
            </HStack>
            <Text fontSize="xs" fontWeight="bold">{totalGoals} total goals</Text>
            <HStack>
              <Text fontSize="xs">{secondTeam.name}</Text>
              <Box w="10px" h="10px" borderRadius="sm" bg="red.500" />
            </HStack>
          </Flex>
        </Box>
      </Box>
    );
  };
  // Render the recent matches table with enhanced styling
  const renderRecentMatches = () => (
    <Box
      bg={statBg}
      p={5}
      borderRadius="xl"
      boxShadow={softShadow}
      overflow="hidden"
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-2px)' }}
    >
      <Flex align="center" mb={4}>
        <FiCalendar size="20px" color={accentBlue} />
        <Heading size="sm" ml={2} color={headingColor} fontWeight="600">Recent Encounters</Heading>
      </Flex>

      <Box
        overflowX="auto"
        borderRadius="lg"
        bg={cardBg}
        boxShadow={innerShadow}
        border="1px solid"
        borderColor={borderColor}
      >
        <Table variant="simple" size="sm" bg={tableBg}>
          <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
            <Tr>
              <Th borderBottomColor={borderColor} color={textColor}>Date</Th>
              <Th borderBottomColor={borderColor} color={textColor}>Home</Th>
              <Th textAlign="center" borderBottomColor={borderColor} color={textColor}>Score</Th>
              <Th borderBottomColor={borderColor} color={textColor}>Away</Th>
              <Th borderBottomColor={borderColor} color={textColor}>Result</Th>
            </Tr>
          </Thead>
          <Tbody>
            {matches.map((match, idx) => {
              // Cast match to our extended interface with the result field - using a more memory-efficient approach
              const matchWithResult = match as unknown as MatchWithResult;

              // Check if the home team's name matches first team's name
              const isFirstTeamHome = matchWithResult.homeTeam?.name === firstTeam.name;

              // Get the match result - use a more direct approach to access the result property
              let result: 'HOME' | 'AWAY' | 'DRAW';
                // TypeScript-friendly way to access the result without complex casting
              const matchResult = matchWithResult.result;
              if (matchResult) {
                result = matchResult;
              } else if (matchWithResult.score) {
                if (matchWithResult.score.home > matchWithResult.score.away) {
                  result = 'HOME';
                } else if (matchWithResult.score.home < matchWithResult.score.away) {
                  result = 'AWAY';
                } else {
                  result = 'DRAW';
                }
              } else {
                result = 'DRAW'; // Default if there's no score
              }

              const isFirstTeamWin = result === 'HOME' && isFirstTeamHome || result === 'AWAY' && !isFirstTeamHome;
              const isSecondTeamWin = result === 'HOME' && !isFirstTeamHome || result === 'AWAY' && isFirstTeamHome;

              let resultText: string;
              let resultColor: string;
              let resultBg: string;
              let resultGlow: string;

              if (result === 'DRAW') {
                resultText = 'Draw';
                resultColor = 'gray.600';
                resultBg = 'gray.100';
                resultGlow = '';
              } else if (isFirstTeamWin) {
                resultText = `${firstTeam.name} Win`;
                resultColor = 'blue.700';
                resultBg = 'blue.50';
                resultGlow = subtleGlow;
              } else {
                resultText = `${secondTeam.name} Win`;
                resultColor = 'red.700';
                resultBg = 'red.50';
                resultGlow = redGlow;
              }

              // Alternate row styling for better readability
              const rowBg = idx % 2 === 0 ? 'transparent' : useColorModeValue('gray.50', 'gray.750');

              return (
                <Tr key={idx} bg={rowBg} _hover={{ bg: useColorModeValue('blue.50', 'gray.700') }}>
                  <Td borderBottomColor={borderColor} py={3}>
                    <Text fontSize="sm" fontWeight="medium">
                      {new Date(match.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </Td>
                  <Td borderBottomColor={borderColor} py={3} fontWeight={isFirstTeamHome ? 'bold' : 'normal'}>
                    <HStack>
                      {renderTeamLogo(match.homeTeam?.id || '', match.homeTeam?.name || 'Home Team')}
                      <Text>{match.homeTeam?.name || 'Home Team'}</Text>
                    </HStack>
                  </Td>
                  <Td borderBottomColor={borderColor} py={3} textAlign="center">
                  <Box
                    px={3}
                    py={1.5}
                    borderRadius="md"
                    bg={result === 'DRAW' ? 'gray.100' : isFirstTeamHome ? (isFirstTeamWin ? 'blue.50' : 'red.50') : (isFirstTeamWin ? 'blue.50' : 'red.50')}
                    display="inline-block"
                    fontWeight="bold"
                    fontSize="sm"
                    border="1px solid"
                    borderColor={result === 'DRAW' ? 'gray.200' : isFirstTeamWin ? 'blue.200' : 'red.200'}
                    boxShadow={`0 1px 2px ${shadowColor}`}
                    transition="transform 0.2s, box-shadow 0.3s"
                    _hover={{
                      transform: 'scale(1.05)',
                      boxShadow: result === 'DRAW' ? sharpShadow : `${sharpShadow}, ${resultGlow}`
                    }}
                  >
                    {match.score?.home || 0} - {match.score?.away || 0}
                  </Box>
                </Td>
                <Td borderBottomColor={borderColor} py={3} fontWeight={!isFirstTeamHome ? 'bold' : 'normal'}>
                    <HStack>
                      {renderTeamLogo(match.awayTeam?.id || '', match.awayTeam?.name || 'Away Team')}
                      <Text>{match.awayTeam?.name || 'Away Team'}</Text>
                    </HStack>
                  </Td>
                  <Td borderBottomColor={borderColor} py={3}>
                    <Badge
                      px={2}
                      py={1}
                      borderRadius="md"
                      fontSize="xs"
                      fontWeight="medium"
                      color={resultColor}
                      bg={resultBg}
                      boxShadow={`0 1px 2px ${shadowColor}`}
                      transition="transform 0.2s"
                      _hover={{ transform: 'scale(1.05)' }}
                    >
                      {resultText}
                    </Badge>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );

  // Render the match range selector
  const renderMatchRangeSelector = () => (
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
          <FiFilter size="18px" color={accentBlue} />
          <Heading size="sm" ml={2} color={headingColor} fontWeight="600">Match Analysis Range</Heading>
        </Flex>
        <Badge colorScheme="blue" fontSize="sm" py={1} px={2} borderRadius="md">
          Analyzing: Last {matchRange} matches
        </Badge>
      </Flex>      <Tabs
        variant="soft-rounded"
        colorScheme="blue"
        size="sm"
        index={matchRange === 5 ? 0 : 1}
        onChange={(index) => {
          const newRange = index === 0 ? 5 : 10;
          setMatchRange(newRange);

          // Trigger data refresh event - parent component can listen for this and refresh data
          const customEvent = new CustomEvent('gameCountChange', {
            detail: {
              gameCount: newRange,
              requiresRefetch: true
            },
            bubbles: true
          });
          document.dispatchEvent(customEvent);
          console.log(`Dispatched gameCountChange event with count: ${newRange} requiring refetch`);
        }}
      >
        <TabList>
          <Tab
            fontWeight="medium"
            _selected={{
              color: 'white',
              bg: accentBlue,
              boxShadow: subtleGlow
            }}
            px={6}
          >
            Last 5 Matches
          </Tab>
          <Tab
            fontWeight="medium"
            _selected={{
              color: 'white',
              bg: accentBlue,
              boxShadow: subtleGlow
            }}
            px={6}
          >
            Last 10 Matches
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel></TabPanel>
          <TabPanel></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );

  return (
    <Box
      p={5}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow={`${softShadow}, 0 0 5px ${shadowColor}`}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '5px',
        bg: 'linear-gradient(to right, #4299E1, #48BB78)',
        borderTopLeftRadius: 'xl',
        borderTopRightRadius: 'xl',
      }}
    >
      <VStack spacing={6} align="stretch">
        {renderMatchRangeSelector()}
        {renderSummaryStats()}
        {renderWinBar()}
        {renderGoalStats()}
        {renderRecentMatches()}
      </VStack>
    </Box>
  );
};

export default CustomHeadToHeadTab;
