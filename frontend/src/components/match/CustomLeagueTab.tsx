import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Spinner,
  Center,
  Badge,
  Image,
  useColorModeValue,
  Tooltip,
  HStack,
  VStack,
  Divider
} from '@chakra-ui/react';
import {
  FiAlertCircle,
  FiRefreshCw,
  FiTrendingDown,
  FiInfo
} from 'react-icons/fi';
import { Match } from '../../types/interfaces';
import { FormattedLeagueStandings, FormattedTeamStanding } from '../../services/leagueService';

// Define props interface
interface CustomLeagueTabProps {
  match: Match;
  data: FormattedLeagueStandings | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

// Define promotion/relegation zone colors
const zoneColors = {
  'Promotion - Champions League (Group Stage)': 'green.500',
  'Promotion - Champions League (Qualification)': 'green.400',
  'Promotion - Europa League (Group Stage)': 'blue.500',
  'Promotion - Europa Conference League (Qualification)': 'blue.400',
  'Relegation - Championship': 'red.500',
  'Relegation': 'red.500'
};

// Define zone descriptions for the legend
const zoneDescriptions = {
  'Champions League': 'Qualification for UEFA Champions League',
  'Europa League': 'Qualification for UEFA Europa League',
  'Conference League': 'Qualification for UEFA Conference League',
  'Relegation': 'Relegation to lower division'
};

const CustomLeagueTab: React.FC<CustomLeagueTabProps> = ({ match, data, isLoading, onRefresh }) => {
  // Theme colors - ALL useColorModeValue hooks must be at the top level
  const cardBg = useColorModeValue('white', 'gray.800');
  const tableBg = useColorModeValue('white', 'gray.800');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const softShadow = useColorModeValue('0 2px 8px rgba(0, 0, 0, 0.1)', '0 2px 8px rgba(0, 0, 0, 0.4)');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const legendBg = useColorModeValue('gray.50', 'gray.700');

  // Position-based colors - moved to top level to fix React Hooks violation
  const championsLeagueBg = useColorModeValue('green.50', 'green.900');
  const europaLeagueBg = useColorModeValue('blue.50', 'blue.900');
  const relegationBg = useColorModeValue('red.50', 'red.900');
  const homeTeamComparisonBg = useColorModeValue('blue.50', 'blue.900');
  const awayTeamComparisonBg = useColorModeValue('red.50', 'red.900');
  const matchOverviewBg = useColorModeValue('gray.50', 'gray.700');
  const teamContextHomeBg = useColorModeValue('blue.50', 'blue.900');
  const teamContextAwayBg = useColorModeValue('red.50', 'red.900');
  const matchSignificanceBg = useColorModeValue('purple.50', 'purple.900');
  const matchSignificanceColor = useColorModeValue('purple.700', 'purple.200');
  const championsLeagueZoneBg = useColorModeValue('green.50', 'green.900');
  const europaLeagueZoneBg = useColorModeValue('blue.50', 'blue.900');
  const relegationZoneBg = useColorModeValue('red.50', 'red.900');
  const zoneTextColor = useColorModeValue('gray.200', 'gray.600');
  const leagueHeaderBg = useColorModeValue('blue.600', 'blue.800');

  // Extract team IDs from match data
  const homeTeamId = typeof match.homeTeam.id === 'string' ? match.homeTeam.id.replace('team-', '') : String(match.homeTeam.id);
  const awayTeamId = typeof match.awayTeam.id === 'string' ? match.awayTeam.id.replace('team-', '') : String(match.awayTeam.id);

  // Function to determine row background color based on team and position
  const getRowBgColor = (standing: FormattedTeamStanding) => {
    // Highlight match teams
    if (standing.team.id === homeTeamId || standing.team.id === awayTeamId) {
      return highlightBg;
    }

    // Color code by position using pre-defined colors
    const position = standing.position;
    const totalTeams = data?.standings.length || 20;

    if (position <= 4) {
      return championsLeagueBg;
    } else if (position <= 6) {
      return europaLeagueBg;
    } else if (position >= totalTeams - 3) {
      return relegationBg;
    }

    return 'transparent';
  };

  // Function to determine position badge color based on standing position
  const getPositionBadgeColor = (position: number, placeType: string | null) => {
    if (placeType && zoneColors[placeType as keyof typeof zoneColors]) {
      return zoneColors[placeType as keyof typeof zoneColors];
    }

    const totalTeams = data?.standings.length || 20;

    if (position <= 4) return 'green';
    if (position <= 6) return 'blue';
    if (position >= totalTeams - 3) return 'red';
    return 'gray';
  };

  // Function to render team logo with dynamic API-based logos
  const renderTeamLogo = (team: { id: string | number; name: string; logo?: string }, size: string = "32px") => {
    // Use the logo from the API data if available, otherwise fallback to UI avatars
    const logoUrl = team.logo && team.logo.startsWith('http')
      ? team.logo
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`;

    return (
      <Image
        src={logoUrl}
        alt={team.name}
        boxSize={size}
        objectFit="contain"
        fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(team.name.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`}
        mr={3}
        borderRadius="full"
        border="1px solid"
        borderColor={borderColor}
        p={1}
        backgroundColor="white"
        onError={(e) => {
          console.log(`[TeamLogo][ERROR] Logo load error for ${team.name}, falling back to avatar:`, e);
        }}
      />
    );
  };

  // Function to render league logo with dynamic API-based logos
  const renderLeagueLogo = (size: string = "40px") => {
    const league = data?.league || match.league;

    // Use the logo from the API data if available, otherwise fallback to UI avatars
    const logoUrl = league.logo && league.logo.startsWith('http')
      ? league.logo
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(league.name.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`;

    return (
      <Image
        src={logoUrl}
        alt={league.name}
        boxSize={size}
        objectFit="contain"
        fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(league.name.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`}
        borderRadius="full"
        border="2px solid"
        borderColor="white"
        p={1}
        backgroundColor="white"
        boxShadow="0 0 10px rgba(0,0,0,0.1)"
        onError={(e) => {
          console.log(`[LeagueTab][ERROR] Logo load error for ${league.name}, falling back to avatar:`, e);
        }}
      />
    );
  };

  // Function to highlight current match teams
  const highlightTeam = (teamId: string | number) => {
    // Convert all IDs to strings for comparison
    const teamIdStr = String(teamId);
    const homeIdStr = String(homeTeamId);
    const awayIdStr = String(awayTeamId);

    return teamIdStr === homeIdStr || teamIdStr === awayIdStr;
  };

  // Function to render loading state
  const renderLoading = () => (
    <Center py={10}>
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
        <Text color={mutedColor}>Loading league standings...</Text>
      </VStack>
    </Center>
  );

  // Function to render error state
  const renderError = () => (
    <Center py={10}>
      <VStack spacing={4}>
        <Icon as={FiAlertCircle} boxSize={10} color="red.500" />
        <Text color={mutedColor}>Unable to load league standings data.</Text>
        {onRefresh && (
          <Flex
            align="center"
            cursor="pointer"
            color="blue.500"
            onClick={onRefresh}
            _hover={{ textDecoration: 'underline' }}
          >
            <Icon as={FiRefreshCw} mr={2} />
            <Text>Refresh</Text>
          </Flex>
        )}
      </VStack>
    </Center>
  );

  // Function to render no data message for competitions without standings
  const renderNoStandingsMessage = () => (
    <Center py={10}>
      <VStack spacing={4}>
        <Icon as={FiInfo} boxSize={10} color="blue.500" />
        <Text color={textColor} textAlign="center" maxW="400px">
          {data?.message || 'This competition does not have traditional league standings.'}
        </Text>
        <Text fontSize="sm" color={mutedColor} textAlign="center">
          This may be a cup tournament, knockout competition, or final match.
        </Text>
        {onRefresh && (
          <Flex
            align="center"
            cursor="pointer"
            color="blue.500"
            onClick={onRefresh}
            _hover={{ textDecoration: 'underline' }}
          >
            <Icon as={FiRefreshCw} mr={2} />
            <Text>Refresh</Text>
          </Flex>
        )}
      </VStack>
    </Center>
  );

  // Function to render standings table
  const renderStandingsTable = () => {
    if (!data) {
      return renderError();
    }

    // Handle case where there are no standings (cup competitions, etc.)
    if (!data.standings || data.standings.length === 0) {
      return renderNoStandingsMessage();
    }

    return (
      <Box
        overflowX="auto"
        borderRadius="md"
        boxShadow={softShadow}
        border="1px solid"
        borderColor={borderColor}
      >
        <Table variant="simple" size="md" bg={tableBg}>
          <Thead bg={tableHeaderBg} position="sticky" top={0} zIndex={1}>
            <Tr>
              <Th width="60px" textAlign="center" py={4}>Pos</Th>
              <Th width="50%" py={4}>Team</Th>
              <Th isNumeric py={4}>P</Th>
              <Th isNumeric py={4}>W</Th>
              <Th isNumeric py={4}>D</Th>
              <Th isNumeric py={4}>L</Th>
              <Th isNumeric py={4}>GF</Th>
              <Th isNumeric py={4}>GA</Th>
              <Th isNumeric py={4}>GD</Th>
              <Th isNumeric py={4}>Pts</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.standings.map((standing) => (
              <Tr
                key={standing.team.id}
                bg={getRowBgColor(standing)}
                fontWeight={highlightTeam(standing.team.id) ? 'bold' : 'normal'}
                _hover={{ bg: hoverBg }}
                transition="background-color 0.2s"
              >
                <Td textAlign="center">
                  <Badge
                    colorScheme={getPositionBadgeColor(standing.position, null)}
                    borderRadius="full"
                    px={2}
                    py={1}
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    {standing.position}
                  </Badge>
                </Td>
                <Td>
                  <Flex align="center">
                    {renderTeamLogo(standing.team, "28px")}
                    <Text
                      fontWeight={highlightTeam(standing.team.id) ? 'bold' : 'medium'}
                      color={highlightTeam(standing.team.id) ? 'blue.500' : textColor}
                      fontSize="md"
                    >
                      {standing.team.name}
                    </Text>
                    {highlightTeam(standing.team.id) && (
                      <Badge ml={2} colorScheme={String(standing.team.id) === String(homeTeamId) ? "blue" : "red"} variant="subtle">
                        {String(standing.team.id) === String(homeTeamId) ? "Home" : "Away"}
                      </Badge>
                    )}
                  </Flex>
                </Td>
                <Td isNumeric>{standing.played}</Td>
                <Td isNumeric>{standing.won}</Td>
                <Td isNumeric>{standing.drawn}</Td>
                <Td isNumeric>{standing.lost}</Td>
                <Td isNumeric>{standing.goalsFor}</Td>
                <Td isNumeric>{standing.goalsAgainst}</Td>
                <Td isNumeric>{standing.goalDifference}</Td>
                <Td isNumeric fontWeight="bold">{standing.points}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  // Function to render match teams comparison
  const renderTeamsComparison = () => {
    if (!data || !data.standings || data.standings.length === 0) {
      return null;
    }

    const homeTeamStanding = data.standings.find(s => s.team.id === homeTeamId);
    const awayTeamStanding = data.standings.find(s => s.team.id === awayTeamId);

    if (!homeTeamStanding || !awayTeamStanding) {
      return null;
    }

    // Calculate position difference
    const positionDiff = homeTeamStanding.position - awayTeamStanding.position;
    const pointsDiff = homeTeamStanding.points - awayTeamStanding.points;

    return (
      <Box
        mt={6}
        p={5}
        bg={cardBg}
        borderRadius="lg"
        boxShadow={softShadow}
        border="1px solid"
        borderColor={borderColor}
      >
        <Heading size="md" mb={4} pb={2} borderBottom="1px solid" borderColor={borderColor}>
          Teams League Comparison
        </Heading>
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" gap={4}>
          <Box
            flex="1"
            p={4}
            borderRadius="md"
            bg={homeTeamComparisonBg}
            boxShadow="md"
          >
            <Flex align="center" mb={4}>
              {renderTeamLogo(match.homeTeam, "40px")}
              <Text fontWeight="bold" fontSize="lg">{match.homeTeam.name}</Text>
            </Flex>
            <HStack spacing={4} mb={2}>
              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="80px">
                <Text fontSize="xs" color={mutedColor}>Position</Text>
                <Badge colorScheme="blue" fontSize="md" px={2} py={1}>
                  {homeTeamStanding.position}
                </Badge>
              </Flex>
              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="80px">
                <Text fontSize="xs" color={mutedColor}>Points</Text>
                <Text fontWeight="bold" fontSize="lg">{homeTeamStanding.points}</Text>
              </Flex>
            </HStack>
            <HStack spacing={4} mb={2}>
              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="80px">
                <Text fontSize="xs" color={mutedColor}>W-D-L</Text>
                <Text fontWeight="medium">
                  {homeTeamStanding.won}-{homeTeamStanding.drawn}-{homeTeamStanding.lost}
                </Text>
              </Flex>
              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="80px">
                <Text fontSize="xs" color={mutedColor}>GF-GA</Text>
                <Text fontWeight="medium">
                  {homeTeamStanding.goalsFor}-{homeTeamStanding.goalsAgainst}
                </Text>
              </Flex>
            </HStack>
          </Box>

          <Center p={2} fontWeight="bold" fontSize="xl">
            <Flex direction="column" align="center">
              <Text fontSize="sm" color={mutedColor} mb={1}>Position Diff</Text>
              <Badge
                colorScheme={positionDiff < 0 ? "green" : positionDiff > 0 ? "red" : "gray"}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                {positionDiff === 0 ? "Same" :
                  positionDiff < 0 ? `+${Math.abs(positionDiff)}` : `-${positionDiff}`}
              </Badge>

              <Text fontSize="sm" color={mutedColor} mt={4} mb={1}>Points Diff</Text>
              <Badge
                colorScheme={pointsDiff > 0 ? "green" : pointsDiff < 0 ? "red" : "gray"}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                {pointsDiff === 0 ? "Equal" :
                  pointsDiff > 0 ? `+${pointsDiff}` : `${pointsDiff}`}
              </Badge>
            </Flex>
          </Center>

          <Box
            flex="1"
            p={4}
            borderRadius="md"
            bg={awayTeamComparisonBg}
            boxShadow="md"
          >
            <Flex align="center" mb={4}>
              {renderTeamLogo(match.awayTeam, "40px")}
              <Text fontWeight="bold" fontSize="lg">{match.awayTeam.name}</Text>
            </Flex>
            <HStack spacing={4} mb={2}>
              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="80px">
                <Text fontSize="xs" color={mutedColor}>Position</Text>
                <Badge colorScheme="red" fontSize="md" px={2} py={1}>
                  {awayTeamStanding.position}
                </Badge>
              </Flex>
              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="80px">
                <Text fontSize="xs" color={mutedColor}>Points</Text>
                <Text fontWeight="bold" fontSize="lg">{awayTeamStanding.points}</Text>
              </Flex>
            </HStack>
            <HStack spacing={4} mb={2}>
              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="80px">
                <Text fontSize="xs" color={mutedColor}>W-D-L</Text>
                <Text fontWeight="medium">
                  {awayTeamStanding.won}-{awayTeamStanding.drawn}-{awayTeamStanding.lost}
                </Text>
              </Flex>
              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="80px">
                <Text fontSize="xs" color={mutedColor}>GF-GA</Text>
                <Text fontWeight="medium">
                  {awayTeamStanding.goalsFor}-{awayTeamStanding.goalsAgainst}
                </Text>
              </Flex>
            </HStack>
          </Box>
        </Flex>
      </Box>
    );
  };

  // Function to render match overview
  const renderMatchOverview = () => {
    if (!data || !data.standings || data.standings.length === 0) {
      return null;
    }

    const homeTeamStanding = data.standings.find(s => s.team.id === homeTeamId);
    const awayTeamStanding = data.standings.find(s => s.team.id === awayTeamId);

    if (!homeTeamStanding || !awayTeamStanding) {
      return null;
    }

    return (
      <Box
        mt={6}
        p={5}
        bg={cardBg}
        borderRadius="lg"
        boxShadow={softShadow}
        border="1px solid"
        borderColor={borderColor}
      >
        <Heading size="md" mb={4} pb={2} borderBottom="1px solid" borderColor={borderColor}>
          Match Overview: {match.homeTeam.name} vs {match.awayTeam.name}
        </Heading>

        <Flex direction="column" gap={4}>
          {/* Match details */}
          <Flex
            justify="space-between"
            align="center"
            bg={matchOverviewBg}
            p={4}
            borderRadius="md"
          >
            <Flex align="center" flex={1} justify="center" direction="column">
              {renderTeamLogo(match.homeTeam, "56px")}
              <Text fontWeight="bold" fontSize="lg" mt={2}>{match.homeTeam.name}</Text>
            </Flex>

            <Box textAlign="center" px={4}>
              <Text fontSize="sm" color={mutedColor} mb={1}>
                {match.date} • {match.time}
              </Text>
              <Text fontWeight="bold" fontSize="xl">VS</Text>
              <Text fontSize="sm" color={mutedColor} mt={1}>
                {match.venue || "Stadio Olimpico"}
              </Text>
            </Box>

            <Flex align="center" flex={1} justify="center" direction="column">
              {renderTeamLogo(match.awayTeam, "56px")}
              <Text fontWeight="bold" fontSize="lg" mt={2}>{match.awayTeam.name}</Text>
            </Flex>
          </Flex>

          {/* League context */}
          <Box p={4} bg={matchOverviewBg} borderRadius="md">
            <Heading size="sm" mb={3}>League Context</Heading>
            <Text mb={3}>
              This {data.league?.name || match.league.name} match features {match.homeTeam.name}
              (currently {homeTeamStanding.position}{getOrdinalSuffix(homeTeamStanding.position)} in the table)
              hosting {match.awayTeam.name} (currently {awayTeamStanding.position}{getOrdinalSuffix(awayTeamStanding.position)}).
            </Text>

            <HStack spacing={4} wrap="wrap">
              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="120px">
                <Text fontSize="xs" color={mutedColor}>Points Gap</Text>
                <Text fontWeight="bold" fontSize="lg">
                  {Math.abs(homeTeamStanding.points - awayTeamStanding.points)}
                </Text>
              </Flex>

              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="120px">
                <Text fontSize="xs" color={mutedColor}>Position Gap</Text>
                <Text fontWeight="bold" fontSize="lg">
                  {Math.abs(homeTeamStanding.position - awayTeamStanding.position)}
                </Text>
              </Flex>

              <Flex direction="column" align="center" p={2} bg={cardBg} borderRadius="md" minW="120px">
                <Text fontSize="xs" color={mutedColor}>Goal Difference</Text>
                <Text fontWeight="bold" fontSize="lg">
                  {homeTeamStanding.goalDifference} / {awayTeamStanding.goalDifference}
                </Text>
              </Flex>
            </HStack>
          </Box>
        </Flex>
      </Box>
    );
  };

  // Helper function to get ordinal suffix
  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return num + "st";
    }
    if (j === 2 && k !== 12) {
      return num + "nd";
    }
    if (j === 3 && k !== 13) {
      return num + "rd";
    }
    return num + "th";
  };

  // Function to render league information
  const renderLeagueInfo = () => {
    if (!data || !data.standings || data.standings.length === 0) {
      return null;
    }

    const homeTeamStanding = data.standings.find(s => String(s.team.id) === String(homeTeamId));
    const awayTeamStanding = data.standings.find(s => String(s.team.id) === String(awayTeamId));

    // Calculate team positions relative to qualification zones
    const getTeamZoneStatus = (position: number) => {
      if (position <= 4) return "Champions League qualification";
      if (position <= 6) return "Europa League qualification";
      if (position >= data.standings.length - 2) return "relegation zone";
      return "mid-table";
    };

    // Get home team form description
    const getHomeTeamContext = () => {
      if (!homeTeamStanding) return "";

      const position = homeTeamStanding.position;
      const points = homeTeamStanding.points;
      const played = homeTeamStanding.played;
      const won = homeTeamStanding.won;
      const zoneStatus = getTeamZoneStatus(position);

      if (position <= 4) {
        return `${match.homeTeam.name} are currently in ${getOrdinalSuffix(position)} place, in ${zoneStatus}. They've won ${won} of their ${played} matches this season with a total of ${points} points.`;
      } else if (position <= 6) {
        return `${match.homeTeam.name} are fighting for European football in ${getOrdinalSuffix(position)} place. They're in ${zoneStatus} with ${points} points from ${played} games.`;
      } else if (position >= data.standings.length - 2) {
        return `${match.homeTeam.name} are battling relegation in ${getOrdinalSuffix(position)} place. They need to improve their form to escape the ${zoneStatus}. They currently have ${points} points.`;
      } else {
        return `${match.homeTeam.name} are in ${getOrdinalSuffix(position)} place with ${points} points. They're currently in the ${zoneStatus}.`;
      }
    };

    // Get away team form description
    const getAwayTeamContext = () => {
      if (!awayTeamStanding) return "";

      const position = awayTeamStanding.position;
      const points = awayTeamStanding.points;
      const played = awayTeamStanding.played;
      const goalDiff = awayTeamStanding.goalDifference;
      const zoneStatus = getTeamZoneStatus(position);

      if (position <= 4) {
        return `${match.awayTeam.name} are performing well in ${getOrdinalSuffix(position)} place, in ${zoneStatus}. They've accumulated ${points} points from ${played} matches so far.`;
      } else if (position <= 6) {
        return `${match.awayTeam.name} are in ${getOrdinalSuffix(position)} place, competing for ${zoneStatus}. They have ${points} points with a goal difference of ${goalDiff}.`;
      } else if (position >= data.standings.length - 2) {
        return `${match.awayTeam.name} are struggling in ${getOrdinalSuffix(position)} place with ${points} points. They're currently in the ${zoneStatus} and fighting to stay in the division.`;
      } else {
        return `${match.awayTeam.name} are mid-table in ${getOrdinalSuffix(position)} place with ${points} points from ${played} games.`;
      }
    };

    // Get match significance description
    const getMatchSignificance = () => {
      if (!homeTeamStanding || !awayTeamStanding) return "";

      const positionDiff = Math.abs(homeTeamStanding.position - awayTeamStanding.position);
      const pointsDiff = Math.abs(homeTeamStanding.points - awayTeamStanding.points);

      if (positionDiff <= 3) {
        return `This is a crucial match between closely ranked teams, separated by just ${positionDiff} ${positionDiff === 1 ? 'position' : 'positions'} and ${pointsDiff} points. The result could have significant implications for both teams' league ambitions.`;
      } else if (homeTeamStanding.position <= 6 && awayTeamStanding.position <= 6) {
        return `This is an important clash between two teams competing for European qualification. Despite being separated by ${positionDiff} positions, both teams have European ambitions.`;
      } else if (homeTeamStanding.position >= data.standings.length - 3 && awayTeamStanding.position >= data.standings.length - 3) {
        return `This is a vital relegation battle. Both teams are fighting to avoid the drop, and the result could be decisive in determining which team stays in the division.`;
      } else {
        return `With ${positionDiff} positions and ${pointsDiff} points separating these teams, ${homeTeamStanding.position < awayTeamStanding.position ? match.homeTeam.name : match.awayTeam.name} will be favorites, but league form doesn't always predict match outcomes.`;
      }
    };

    return (
      <Box
        mt={6}
        p={5}
        bg={cardBg}
        borderRadius="lg"
        boxShadow={softShadow}
        border="1px solid"
        borderColor={borderColor}
      >
        <Heading size="md" mb={4} pb={2} borderBottom="1px solid" borderColor={borderColor}>
          League Context & Match Significance
        </Heading>

        <Text mb={4} fontSize="md" color={textColor}>
          The table shows the current standings for {data.league?.name || match.league.name}.
          Teams are ranked by total points, with goal difference as the first tiebreaker.
        </Text>

        {/* Team context section */}
        {homeTeamStanding && awayTeamStanding && (
          <Box
            mb={4}
            p={4}
            bg={matchOverviewBg}
            borderRadius="md"
            border="1px solid"
            borderColor={zoneTextColor}
          >
            <Heading size="sm" mb={3} pb={2} borderBottom="1px solid" borderColor={zoneTextColor}>
              Match Context
            </Heading>

            <Flex mb={4} gap={4} flexDirection={{ base: "column", md: "row" }}>
              <Box flex="1" p={3} bg={teamContextHomeBg} borderRadius="md">
                <Flex align="center" mb={2}>
                  {renderTeamLogo(match.homeTeam, "24px")}
                  <Text fontWeight="bold" ml={2} fontSize="sm">
                    {match.homeTeam.name}
                  </Text>
                </Flex>
                <Text fontSize="sm">
                  {getHomeTeamContext()}
                </Text>
              </Box>

              <Box flex="1" p={3} bg={teamContextAwayBg} borderRadius="md">
                <Flex align="center" mb={2}>
                  {renderTeamLogo(match.awayTeam, "24px")}
                  <Text fontWeight="bold" ml={2} fontSize="sm">
                    {match.awayTeam.name}
                  </Text>
                </Flex>
                <Text fontSize="sm">
                  {getAwayTeamContext()}
                </Text>
              </Box>
            </Flex>

            <Box p={3} bg={matchSignificanceBg} borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" color={matchSignificanceColor}>
                <Icon as={FiInfo} mr={2} />
                {getMatchSignificance()}
              </Text>
            </Box>
          </Box>
        )}

        <Heading size="sm" mb={3}>Qualification & Relegation Zones</Heading>

        <Flex wrap="wrap" gap={3} mb={4}>
          <Flex
            align="center"
            bg={championsLeagueZoneBg}
            p={2}
            borderRadius="md"
            borderLeft="4px solid"
            borderColor="green.500"
          >
            <Badge colorScheme="green" mr={2}>1-4</Badge>
            <Text fontSize="sm">Champions League</Text>
            {homeTeamStanding && homeTeamStanding.position <= 4 && (
              <Badge ml={2} colorScheme="blue" variant="outline" fontSize="xs">
                {match.homeTeam.name}
              </Badge>
            )}
            {awayTeamStanding && awayTeamStanding.position <= 4 && (
              <Badge ml={2} colorScheme="red" variant="outline" fontSize="xs">
                {match.awayTeam.name}
              </Badge>
            )}
          </Flex>

          <Flex
            align="center"
            bg={europaLeagueZoneBg}
            p={2}
            borderRadius="md"
            borderLeft="4px solid"
            borderColor="blue.500"
          >
            <Badge colorScheme="blue" mr={2}>5-6</Badge>
            <Text fontSize="sm">Europa League</Text>
            {homeTeamStanding && homeTeamStanding.position > 4 && homeTeamStanding.position <= 6 && (
              <Badge ml={2} colorScheme="blue" variant="outline" fontSize="xs">
                {match.homeTeam.name}
              </Badge>
            )}
            {awayTeamStanding && awayTeamStanding.position > 4 && awayTeamStanding.position <= 6 && (
              <Badge ml={2} colorScheme="red" variant="outline" fontSize="xs">
                {match.awayTeam.name}
              </Badge>
            )}
          </Flex>

          <Flex
            align="center"
            bg={relegationZoneBg}
            p={2}
            borderRadius="md"
            borderLeft="4px solid"
            borderColor="red.500"
          >
            <Badge colorScheme="red" mr={2}>{data.standings.length-2}-{data.standings.length}</Badge>
            <Text fontSize="sm">Relegation Zone</Text>
            {homeTeamStanding && homeTeamStanding.position >= data.standings.length - 2 && (
              <Badge ml={2} colorScheme="blue" variant="outline" fontSize="xs">
                {match.homeTeam.name}
              </Badge>
            )}
            {awayTeamStanding && awayTeamStanding.position >= data.standings.length - 2 && (
              <Badge ml={2} colorScheme="red" variant="outline" fontSize="xs">
                {match.awayTeam.name}
              </Badge>
            )}
          </Flex>
        </Flex>

        <Text fontSize="sm" color={mutedColor}>
          * The exact number of teams qualifying for European competitions may vary based on
          domestic cup winners and additional qualifying spots.
        </Text>
      </Box>
    );
  };

  // Function to render H2H summary in league context
  const renderH2HSummary = () => {
    if (!data || !data.standings || data.standings.length === 0) {
      return null;
    }

    const homeTeamStanding = data.standings.find(s => s.team.id === homeTeamId);
    const awayTeamStanding = data.standings.find(s => s.team.id === awayTeamId);

    if (!homeTeamStanding || !awayTeamStanding) {
      return null;
    }

    return (
      <Box
        mt={6}
        p={5}
        bg={cardBg}
        borderRadius="lg"
        boxShadow={softShadow}
        border="1px solid"
        borderColor={borderColor}
      >
        <Heading size="md" mb={4} pb={2} borderBottom="1px solid" borderColor={borderColor}>
          Head-to-Head League Summary
        </Heading>

        <Flex direction="column" gap={4}>
          <Text fontSize="md">
            This season, {match.homeTeam.name} and {match.awayTeam.name} are separated by
            {' '}<strong>{Math.abs(homeTeamStanding.position - awayTeamStanding.position)}</strong>{' '}
            positions and{' '}
            <strong>{Math.abs(homeTeamStanding.points - awayTeamStanding.points)}</strong>{' '}
            points in the league table.
          </Text>

          <Box p={4} bg={matchOverviewBg} borderRadius="md">
            <Heading size="sm" mb={3}>Key League Statistics</Heading>

            <Flex wrap="wrap" gap={6} justify="space-between">
              <Box>
                <Text fontWeight="bold" color="blue.500">
                  {match.homeTeam.name}
                </Text>
                <Text>Goals scored: {homeTeamStanding.goalsFor} ({(homeTeamStanding.goalsFor / homeTeamStanding.played).toFixed(1)}/game)</Text>
                <Text>Goals conceded: {homeTeamStanding.goalsAgainst} ({(homeTeamStanding.goalsAgainst / homeTeamStanding.played).toFixed(1)}/game)</Text>
                <Text>Win rate: {((homeTeamStanding.won / homeTeamStanding.played) * 100).toFixed(0)}%</Text>
              </Box>

              <Box>
                <Text fontWeight="bold" color="red.500">
                  {match.awayTeam.name}
                </Text>
                <Text>Goals scored: {awayTeamStanding.goalsFor} ({(awayTeamStanding.goalsFor / awayTeamStanding.played).toFixed(1)}/game)</Text>
                <Text>Goals conceded: {awayTeamStanding.goalsAgainst} ({(awayTeamStanding.goalsAgainst / awayTeamStanding.played).toFixed(1)}/game)</Text>
                <Text>Win rate: {((awayTeamStanding.won / awayTeamStanding.played) * 100).toFixed(0)}%</Text>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Box>
    );
  };

  // Function to render league header
  const renderLeagueHeader = () => {
    const league = data?.league || match.league;
    const homeTeamStanding = data?.standings?.find(s => String(s.team.id) === String(homeTeamId));
    const awayTeamStanding = data?.standings?.find(s => String(s.team.id) === String(awayTeamId));

    return (
      <Box
        p={5}
        bg={leagueHeaderBg}
        color="white"
        borderRadius="lg"
        boxShadow={softShadow}
        position="relative"
        overflow="hidden"
      >
        {/* Background pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          bgGradient="radial(circle at 20% 30%, white 0%, transparent 50%)"
        />

        <Flex align="center" position="relative" zIndex={1} mb={4}>
          {/* League logo */}
          <Box
            bg="white"
            borderRadius="full"
            p={2}
            mr={4}
            boxShadow="0 4px 8px rgba(0,0,0,0.2)"
          >
            {renderLeagueLogo("48px")}
          </Box>

          {/* League info */}
          <Box flex="1">
            <Heading size="md" fontWeight="bold" mb={1}>
              {league.name}
            </Heading>
            <Text fontSize="sm" opacity={0.9}>
              {league.country || "League Standings"} • {data?.league?.season || "Current Season"}
            </Text>
          </Box>

          {/* Refresh button */}
          {onRefresh && (
            <Tooltip label="Refresh data">
              <Box
                as="button"
                onClick={onRefresh}
                p={2}
                borderRadius="md"
                _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                transition="all 0.2s"
              >
                <Icon as={FiRefreshCw} boxSize={5} />
              </Box>
            </Tooltip>
          )}
        </Flex>

        {/* Match context information */}
        {homeTeamStanding && awayTeamStanding && (
          <Box
            mt={2}
            p={3}
            bg="rgba(255,255,255,0.1)"
            borderRadius="md"
            position="relative"
            zIndex={1}
          >
            <Flex align="center" justify="space-between" mb={3}>
              <Flex align="center" flex="1">
                {renderTeamLogo(match.homeTeam, "36px")}
                <Box ml={2}>
                  <Text fontWeight="bold" fontSize="md">
                    {match.homeTeam.name}
                  </Text>
                  <Badge colorScheme="blue" variant="solid" fontSize="xs">
                    {getOrdinalSuffix(homeTeamStanding.position)} place
                  </Badge>
                </Box>
              </Flex>

              <Box mx={4}>
                <Text fontWeight="bold" fontSize="md" color="gray.500">vs</Text>
              </Box>

              <Flex align="center" flex="1" justifyContent="flex-end">
                <Box mr={2} textAlign="right">
                  <Text fontWeight="bold" fontSize="md">
                    {match.awayTeam.name}
                  </Text>
                  <Badge colorScheme="red" variant="solid" fontSize="xs">
                    {getOrdinalSuffix(awayTeamStanding.position)} place
                  </Badge>
                </Box>
                {renderTeamLogo(match.awayTeam, "36px")}
              </Flex>
            </Flex>

            <Box p={3} bg="rgba(0,0,0,0.1)" borderRadius="md" mt={3}>
              <Text fontSize="sm" color="white" fontWeight="medium" mb={2}>
                Match Preview
              </Text>
              <Text fontSize="xs" color="white" opacity={0.9}>
                This {league.name} clash features {match.homeTeam.name} ({homeTeamStanding.points} pts) hosting {match.awayTeam.name} ({awayTeamStanding.points} pts).
                {Math.abs(homeTeamStanding.position - awayTeamStanding.position) <= 3 ?
                  ` A crucial match with just ${Math.abs(homeTeamStanding.position - awayTeamStanding.position)} positions separating these teams in the table.` :
                  ` The teams are separated by ${Math.abs(homeTeamStanding.position - awayTeamStanding.position)} positions in the standings.`
                }
                {Math.abs(homeTeamStanding.points - awayTeamStanding.points) <= 6 ?
                  ` With only ${Math.abs(homeTeamStanding.points - awayTeamStanding.points)} points between them, this match could significantly impact their league positions.` :
                  ``
                }
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* League Header Section */}
      {renderLeagueHeader()}

      {/* Match Overview Section */}
      {!isLoading && renderMatchOverview()}

      {/* League Standings Section */}
      <Box
        mt={6}
        p={5}
        bg={cardBg}
        borderRadius="lg"
        boxShadow={softShadow}
        border="1px solid"
        borderColor={borderColor}
      >
        <Heading size="md" mb={4} pb={2} borderBottom="1px solid" borderColor={borderColor}>
          League Standings
        </Heading>

        {isLoading ? renderLoading() : renderStandingsTable()}
      </Box>

      {!isLoading && renderTeamsComparison()}
      {!isLoading && renderLeagueInfo()}
      {!isLoading && renderH2HSummary()}
    </Box>
  );
};

export default CustomLeagueTab;
