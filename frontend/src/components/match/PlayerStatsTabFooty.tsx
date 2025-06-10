import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Button,
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
  Icon,
  Flex,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Avatar,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import {
  FiUsers,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiStar,
  FiActivity,
  FiShield,
  FiZap,
  FiAward,
  FiCrosshair,
  FiNavigation
} from 'react-icons/fi';

interface PlayerStatsTabFootyProps {
  match: {
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
    league?: {
      id?: string;
      name?: string;
    };
    lineups?: any;
  };
  gameCount: number;
  onGameCountChange: (count: number) => void;
}

const PlayerStatsTabFooty: React.FC<PlayerStatsTabFootyProps> = ({
  match,
  gameCount,
  onGameCountChange
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [homePlayersData, setHomePlayersData] = useState<any[]>([]);
  const [awayPlayersData, setAwayPlayersData] = useState<any[]>([]);
  const [isLoadingPlayerStats, setIsLoadingPlayerStats] = useState(false);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentBlue = useColorModeValue('blue.500', 'blue.300');

  // Fetch comprehensive player statistics
  const fetchPlayerStats = async () => {
    if (!match.id) return;

    setIsLoadingPlayerStats(true);
    try {
      // Always use real FootyStats data

      // Get match data with lineups for real matches
      const matchResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/match/${match.id}`);

      if (matchResponse.ok) {
        const matchResult = await matchResponse.json();
        if (matchResult.success) {
          setMatchData(matchResult.data);

          // Extract player IDs from lineups
          const homePlayerIds = matchResult.data.lineups?.team_a?.map((p: any) => p.player_id) || [];
          const awayPlayerIds = matchResult.data.lineups?.team_b?.map((p: any) => p.player_id) || [];

          // Fetch detailed player statistics with better error handling
          const fetchPlayerData = async (playerId: number) => {
            try {
              const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/player/${playerId}`);
              if (!response.ok) {
                return null;
              }
              const result = await response.json();
              if (!result.success || !result.data?.data?.length) {
                return null;
              }

              // Find current season data (2024/2025) or fall back to most recent
              const playerSeasons = result.data.data;
              const currentSeason = playerSeasons.find((season: any) =>
                season.league_type === 'Domestic League' &&
                (season.season === '2024/2025' || season.season === '2023/2024')
              );

              const playerData = currentSeason || playerSeasons[0];
              return playerData;
            } catch (error) {
              return null;
            }
          };

          // Fetch all player data
          const homePlayersPromises = homePlayerIds.slice(0, 11).map(fetchPlayerData);
          const awayPlayersPromises = awayPlayerIds.slice(0, 11).map(fetchPlayerData);

          const [homePlayersResults, awayPlayersResults] = await Promise.all([
            Promise.all(homePlayersPromises),
            Promise.all(awayPlayersPromises)
          ]);

          // Filter out null results
          const homePlayersFiltered = homePlayersResults.filter(Boolean);
          const awayPlayersFiltered = awayPlayersResults.filter(Boolean);

          setHomePlayersData(homePlayersFiltered);
          setAwayPlayersData(awayPlayersFiltered);
        }
      }

    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setIsLoadingPlayerStats(false);
    }
  };

  // Load player stats on component mount
  useEffect(() => {
    fetchPlayerStats();
  }, [match.id, match.league?.id]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPlayerStats();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Render game count selector
  const renderGameCountSelector = () => (
    <Box mb={6}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg" color={headingColor}>
          Player Statistics Analysis
        </Heading>
        <Button
          leftIcon={<Icon as={FiRefreshCw} />}
          onClick={handleRefresh}
          isLoading={isRefreshing}
          size="sm"
          variant="outline"
        >
          Refresh
        </Button>
      </Flex>
      
      <Text fontSize="sm" color={textColor} mb={4}>
        Comprehensive player analysis including lineups, key players, and performance metrics
      </Text>

      <HStack spacing={2}>
        {[5, 10, 15, 20].map((count) => (
          <Button
            key={count}
            size="sm"
            variant={gameCount === count ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => onGameCountChange(count)}
          >
            Last {count}
          </Button>
        ))}
      </HStack>
    </Box>
  );

  // Render lineups from FootyStats match data
  const renderLineups = () => {
    if (!matchData?.lineups) {
      return (
        <Alert status="info" borderRadius="lg" mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Lineups Not Available</Text>
            <Text fontSize="sm">
              {isLoadingPlayerStats ? 'Loading player lineups...' : 'Player lineups are not available for this match.'}
            </Text>
          </Box>
        </Alert>
      );
    }

    const homeLineup = matchData.lineups.team_a || [];
    const awayLineup = matchData.lineups.team_b || [];

    return (
      <Box
        bg={cardBg}
        p={6}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        mb={6}
      >
        <Flex align="center" mb={4}>
          <Icon as={FiUsers} color={accentBlue} mr={3} />
          <Heading size="md" color={headingColor}>
            Starting Lineups
          </Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Home Team Lineup */}
          <VStack spacing={4}>
            <Flex align="center" gap={3}>
              <Avatar size="md" src={match.homeTeam.logo} name={match.homeTeam.name} />
              <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                {match.homeTeam.name}
              </Text>
            </Flex>

            <Box w="100%">
              {homeLineup.map((player: any, index: number) => {
                const playerStats = homePlayersData.find(p => p.id === player.player_id);
                const hasGoal = player.player_events?.some((event: any) => event.event_type === 'Goal');
                const hasCard = player.player_events?.some((event: any) =>
                  event.event_type === 'Yellow' || event.event_type === 'Red'
                );

                // Better player name fallback
                const playerName = playerStats?.full_name ||
                                 playerStats?.known_as ||
                                 `Player #${player.shirt_number}`;

                return (
                  <Flex key={index} align="center" p={3} bg={bgColor} borderRadius="lg" mb={2}
                        border="1px solid" borderColor={borderColor}>
                    <Avatar size="sm" name={playerName} mr={3} />
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                        {playerName}
                      </Text>
                      <Text fontSize="xs" color={textColor}>
                        {playerStats?.position || 'Position TBD'}
                      </Text>
                      {playerStats && (
                        <HStack spacing={2} mt={1}>
                          <Text fontSize="xs" color="green.500">
                            {playerStats.goals_overall || 0}G
                          </Text>
                          <Text fontSize="xs" color="blue.500">
                            {playerStats.assists_overall || 0}A
                          </Text>
                          <Text fontSize="xs" color="yellow.500">
                            {playerStats.yellow_cards_overall || 0}Y
                          </Text>
                        </HStack>
                      )}
                      {!playerStats && (
                        <Text fontSize="xs" color="orange.500" mt={1}>
                          Loading player data...
                        </Text>
                      )}
                    </Box>
                    <VStack spacing={1} align="end">
                      <Badge colorScheme="blue" size="sm">
                        #{player.shirt_number}
                      </Badge>
                      {hasGoal && <Badge colorScheme="green" size="sm">⚽</Badge>}
                      {hasCard && <Badge colorScheme="yellow" size="sm">📋</Badge>}
                    </VStack>
                  </Flex>
                );
              })}
            </Box>
          </VStack>

          {/* Away Team Lineup */}
          <VStack spacing={4}>
            <Flex align="center" gap={3}>
              <Avatar size="md" src={match.awayTeam.logo} name={match.awayTeam.name} />
              <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                {match.awayTeam.name}
              </Text>
            </Flex>

            <Box w="100%">
              {awayLineup.map((player: any, index: number) => {
                const playerStats = awayPlayersData.find(p => p.id === player.player_id);
                const hasGoal = player.player_events?.some((event: any) => event.event_type === 'Goal');
                const hasCard = player.player_events?.some((event: any) =>
                  event.event_type === 'Yellow' || event.event_type === 'Red'
                );

                // Better player name fallback
                const playerName = playerStats?.full_name ||
                                 playerStats?.known_as ||
                                 `Player #${player.shirt_number}`;

                return (
                  <Flex key={index} align="center" p={3} bg={bgColor} borderRadius="lg" mb={2}
                        border="1px solid" borderColor={borderColor}>
                    <Avatar size="sm" name={playerName} mr={3} />
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                        {playerName}
                      </Text>
                      <Text fontSize="xs" color={textColor}>
                        {playerStats?.position || 'Position TBD'}
                      </Text>
                      {playerStats && (
                        <HStack spacing={2} mt={1}>
                          <Text fontSize="xs" color="green.500">
                            {playerStats.goals_overall || 0}G
                          </Text>
                          <Text fontSize="xs" color="blue.500">
                            {playerStats.assists_overall || 0}A
                          </Text>
                          <Text fontSize="xs" color="yellow.500">
                            {playerStats.yellow_cards_overall || 0}Y
                          </Text>
                        </HStack>
                      )}
                      {!playerStats && (
                        <Text fontSize="xs" color="orange.500" mt={1}>
                          Loading player data...
                        </Text>
                      )}
                    </Box>
                    <VStack spacing={1} align="end">
                      <Badge colorScheme="red" size="sm">
                        #{player.shirt_number}
                      </Badge>
                      {hasGoal && <Badge colorScheme="green" size="sm">⚽</Badge>}
                      {hasCard && <Badge colorScheme="yellow" size="sm">📋</Badge>}
                    </VStack>
                  </Flex>
                );
              })}
            </Box>
          </VStack>
        </SimpleGrid>
      </Box>
    );
  };

  // Render comprehensive player statistics
  const renderPlayerStatistics = () => {
    if (isLoadingPlayerStats) {
      return (
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
          mb={6}
        >
          <Flex justify="center" py={8}>
            <VStack spacing={3}>
              <Spinner size="lg" color="blue.500" />
              <Text color={textColor}>Loading comprehensive player statistics...</Text>
            </VStack>
          </Flex>
        </Box>
      );
    }

    if (homePlayersData.length === 0 && awayPlayersData.length === 0) {
      return (
        <Alert status="info" borderRadius="lg" mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Player Statistics Not Available</Text>
            <Text fontSize="sm">
              Detailed player statistics are not available for this match.
            </Text>
          </Box>
        </Alert>
      );
    }

    return (
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>
            <Icon as={FiTarget} mr={2} />
            Attacking Stats
          </Tab>
          <Tab>
            <Icon as={FiShield} mr={2} />
            Defensive Stats
          </Tab>
          <Tab>
            <Icon as={FiNavigation} mr={2} />
            Passing & Dribbling
          </Tab>
          <Tab>
            <Icon as={FiActivity} mr={2} />
            Physical Stats
          </Tab>
        </TabList>

        <TabPanels>
          {/* Attacking Statistics */}
          <TabPanel>
            {renderAttackingStats()}
          </TabPanel>

          {/* Defensive Statistics */}
          <TabPanel>
            {renderDefensiveStats()}
          </TabPanel>

          {/* Passing & Dribbling */}
          <TabPanel>
            {renderPassingStats()}
          </TabPanel>

          {/* Physical Statistics */}
          <TabPanel>
            {renderPhysicalStats()}
          </TabPanel>
        </TabPanels>
      </Tabs>
    );
  };

  // Render attacking statistics
  const renderAttackingStats = () => {
    const allPlayers = [...homePlayersData, ...awayPlayersData];

    if (allPlayers.length === 0) {
      return (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">No Player Data Available</Text>
            <Text fontSize="sm">
              Player statistics are not available for this match.
            </Text>
          </Box>
        </Alert>
      );
    }

    // Get players with goals
    const topScorers = allPlayers
      .filter(p => p.goals_overall > 0)
      .sort((a, b) => b.goals_overall - a.goals_overall)
      .slice(0, 5);

    // Get players with assists
    const topAssists = allPlayers
      .filter(p => p.assists_overall > 0)
      .sort((a, b) => b.assists_overall - a.assists_overall)
      .slice(0, 5);

    // Get players with shots data
    const topShots = allPlayers
      .filter(p => p.detailed?.shots_per_90_overall > 0)
      .sort((a, b) => (b.detailed?.shots_per_90_overall || 0) - (a.detailed?.shots_per_90_overall || 0))
      .slice(0, 5);

    return (
      <VStack spacing={6} align="stretch">

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Top Scorers */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiTarget} color="green.500" mr={2} />
              <Heading size="sm" color={headingColor}>Top Scorers</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {topScorers.map((player, index) => (
                <Flex key={player.id} justify="space-between" align="center">
                  <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                  <Badge colorScheme="green">{player.goals_overall} goals</Badge>
                </Flex>
              ))}
              {topScorers.length === 0 && (
                <Text fontSize="sm" color={textColor}>No goal data available</Text>
              )}
            </VStack>
          </Box>

          {/* Top Assists */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiZap} color="blue.500" mr={2} />
              <Heading size="sm" color={headingColor}>Top Assists</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {topAssists.map((player, index) => (
                <Flex key={player.id} justify="space-between" align="center">
                  <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                  <Badge colorScheme="blue">{player.assists_overall} assists</Badge>
                </Flex>
              ))}
              {topAssists.length === 0 && (
                <Text fontSize="sm" color={textColor}>No assist data available</Text>
              )}
            </VStack>
          </Box>

          {/* Top Shots per Game */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiCrosshair} color="orange.500" mr={2} />
              <Heading size="sm" color={headingColor}>Shots per 90min</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {topShots.map((player, index) => (
                <Flex key={player.id} justify="space-between" align="center">
                  <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                  <Badge colorScheme="orange">{player.detailed?.shots_per_90_overall?.toFixed(1) || 0}</Badge>
                </Flex>
              ))}
              {topShots.length === 0 && (
                <Text fontSize="sm" color={textColor}>No shot data available</Text>
              )}
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Comprehensive Player Statistics Table */}
        <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <Heading size="sm" color={headingColor} mb={4}>
            Comprehensive Player Statistics (All Requested Metrics)
          </Heading>
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Player</Th>
                  <Th>Goals</Th>
                  <Th>Assists</Th>
                  <Th>Passes/90</Th>
                  <Th>Pass Acc%</Th>
                  <Th>Tackles/90</Th>
                  <Th>Shots/90</Th>
                  <Th>Cards</Th>
                  <Th>Fouls/90</Th>
                  <Th>Minutes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {allPlayers.slice(0, 15).map((player) => (
                  <Tr key={player.id}>
                    <Td>
                      <VStack spacing={0} align="start">
                        <Text fontSize="sm" fontWeight="bold">{player.full_name}</Text>
                        <Text fontSize="xs" color={textColor}>{player.position}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack spacing={0} align="center">
                        <Text fontSize="sm" fontWeight="bold">{player.goals_overall || 0}</Text>
                        <Text fontSize="xs" color={textColor}>({(player.goals_per_90_overall || 0).toFixed(2)}/90)</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack spacing={0} align="center">
                        <Text fontSize="sm" fontWeight="bold">{player.assists_overall || 0}</Text>
                        <Text fontSize="xs" color={textColor}>({(player.assists_per_90_overall || 0).toFixed(2)}/90)</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm" fontWeight="bold" color="blue.500">
                        {player.detailed?.passes_per_90_overall?.toFixed(1) || '0.0'}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" fontWeight="bold" color="green.500">
                        {player.detailed?.pass_completion_rate_overall?.toFixed(1) || '0.0'}%
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" fontWeight="bold" color="red.500">
                        {player.detailed?.tackles_per_90_overall?.toFixed(1) || '0.0'}
                      </Text>
                    </Td>
                    <Td>
                      <VStack spacing={0} align="center">
                        <Text fontSize="sm" fontWeight="bold">{player.detailed?.shots_per_90_overall?.toFixed(1) || '0.0'}</Text>
                        <Text fontSize="xs" color={textColor}>({player.detailed?.shot_accuraccy_percentage_overall || 0}% acc)</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Badge colorScheme="yellow" size="sm">{player.yellow_cards_overall || 0}Y</Badge>
                        <Badge colorScheme="red" size="sm">{player.red_cards_overall || 0}R</Badge>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm" fontWeight="bold" color="orange.500">
                        {player.detailed?.fouls_committed_per_90_overall?.toFixed(1) || '0.0'}
                      </Text>
                    </Td>
                    <Td>
                      <VStack spacing={0} align="center">
                        <Text fontSize="sm" fontWeight="bold">{player.minutes_played_overall || 0}</Text>
                        <Text fontSize="xs" color={textColor}>({player.appearances_overall || 0} apps)</Text>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
    );
  };

  // Render defensive statistics
  const renderDefensiveStats = () => {
    const allPlayers = [...homePlayersData, ...awayPlayersData];

    return (
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Top Tacklers */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiShield} color="red.500" mr={2} />
              <Heading size="sm" color={headingColor}>Tackles per 90min</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {allPlayers
                .filter(p => p.detailed?.tackles_per_90_overall > 0)
                .sort((a, b) => (b.detailed?.tackles_per_90_overall || 0) - (a.detailed?.tackles_per_90_overall || 0))
                .slice(0, 5)
                .map((player) => (
                  <Flex key={player.id} justify="space-between" align="center">
                    <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                    <Badge colorScheme="red">{player.detailed?.tackles_per_90_overall?.toFixed(1) || 0}</Badge>
                  </Flex>
                ))}
            </VStack>
          </Box>

          {/* Top Interceptions */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiZap} color="purple.500" mr={2} />
              <Heading size="sm" color={headingColor}>Interceptions per 90min</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {allPlayers
                .filter(p => p.detailed?.interceptions_per_90_overall > 0)
                .sort((a, b) => (b.detailed?.interceptions_per_90_overall || 0) - (a.detailed?.interceptions_per_90_overall || 0))
                .slice(0, 5)
                .map((player) => (
                  <Flex key={player.id} justify="space-between" align="center">
                    <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                    <Badge colorScheme="purple">{player.detailed?.interceptions_per_90_overall?.toFixed(1) || 0}</Badge>
                  </Flex>
                ))}
            </VStack>
          </Box>

          {/* Clean Sheets */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiAward} color="green.500" mr={2} />
              <Heading size="sm" color={headingColor}>Clean Sheets</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {allPlayers
                .filter(p => p.clean_sheets_overall > 0)
                .sort((a, b) => (b.clean_sheets_overall || 0) - (a.clean_sheets_overall || 0))
                .slice(0, 5)
                .map((player) => (
                  <Flex key={player.id} justify="space-between" align="center">
                    <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                    <Badge colorScheme="green">{player.clean_sheets_overall} ({player.clean_sheets_per_overall}%)</Badge>
                  </Flex>
                ))}
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Detailed Defensive Stats Table */}
        <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <Heading size="sm" color={headingColor} mb={4}>Detailed Defensive Statistics</Heading>
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Player</Th>
                  <Th>Tackles/90</Th>
                  <Th>Interceptions/90</Th>
                  <Th>Clearances/90</Th>
                  <Th>Blocks/90</Th>
                  <Th>Clean Sheets</Th>
                  <Th>Cards</Th>
                </Tr>
              </Thead>
              <Tbody>
                {allPlayers.slice(0, 10).map((player) => (
                  <Tr key={player.id}>
                    <Td>
                      <Text fontSize="sm" fontWeight="bold">{player.full_name}</Text>
                      <Text fontSize="xs" color={textColor}>{player.position}</Text>
                    </Td>
                    <Td>{player.detailed?.tackles_per_90_overall?.toFixed(1) || '0.0'}</Td>
                    <Td>{player.detailed?.interceptions_per_90_overall?.toFixed(1) || '0.0'}</Td>
                    <Td>{player.detailed?.clearances_per_90_overall?.toFixed(1) || '0.0'}</Td>
                    <Td>{player.detailed?.blocks_per_90_overall?.toFixed(1) || '0.0'}</Td>
                    <Td>{player.clean_sheets_overall || 0}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <Badge colorScheme="yellow" size="sm">{player.yellow_cards_overall || 0}Y</Badge>
                        <Badge colorScheme="red" size="sm">{player.red_cards_overall || 0}R</Badge>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
    );
  };

  // Render passing and dribbling statistics
  const renderPassingStats = () => {
    const allPlayers = [...homePlayersData, ...awayPlayersData];

    return (
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Top Passers */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiNavigation} color="blue.500" mr={2} />
              <Heading size="sm" color={headingColor}>Passes per 90min</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {allPlayers
                .filter(p => p.detailed?.passes_per_90_overall > 0)
                .sort((a, b) => (b.detailed?.passes_per_90_overall || 0) - (a.detailed?.passes_per_90_overall || 0))
                .slice(0, 5)
                .map((player) => (
                  <Flex key={player.id} justify="space-between" align="center">
                    <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                    <Badge colorScheme="blue">{player.detailed?.passes_per_90_overall?.toFixed(1) || 0}</Badge>
                  </Flex>
                ))}
            </VStack>
          </Box>

          {/* Pass Accuracy */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiTarget} color="green.500" mr={2} />
              <Heading size="sm" color={headingColor}>Pass Accuracy</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {allPlayers
                .filter(p => p.detailed?.pass_completion_rate_overall > 0)
                .sort((a, b) => (b.detailed?.pass_completion_rate_overall || 0) - (a.detailed?.pass_completion_rate_overall || 0))
                .slice(0, 5)
                .map((player) => (
                  <Flex key={player.id} justify="space-between" align="center">
                    <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                    <Badge colorScheme="green">{player.detailed?.pass_completion_rate_overall?.toFixed(1) || 0}%</Badge>
                  </Flex>
                ))}
            </VStack>
          </Box>

          {/* Key Passes */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiZap} color="purple.500" mr={2} />
              <Heading size="sm" color={headingColor}>Key Passes per 90min</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {allPlayers
                .filter(p => p.detailed?.key_passes_per_90_overall > 0)
                .sort((a, b) => (b.detailed?.key_passes_per_90_overall || 0) - (a.detailed?.key_passes_per_90_overall || 0))
                .slice(0, 5)
                .map((player) => (
                  <Flex key={player.id} justify="space-between" align="center">
                    <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                    <Badge colorScheme="purple">{player.detailed?.key_passes_per_90_overall?.toFixed(1) || 0}</Badge>
                  </Flex>
                ))}
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Detailed Passing Stats Table */}
        <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <Heading size="sm" color={headingColor} mb={4}>Detailed Passing & Dribbling Statistics</Heading>
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Player</Th>
                  <Th>Passes/90</Th>
                  <Th>Pass Accuracy</Th>
                  <Th>Key Passes/90</Th>
                  <Th>Dribbles/90</Th>
                  <Th>Dribble Success</Th>
                  <Th>Crosses/90</Th>
                </Tr>
              </Thead>
              <Tbody>
                {allPlayers.slice(0, 10).map((player) => (
                  <Tr key={player.id}>
                    <Td>
                      <Text fontSize="sm" fontWeight="bold">{player.full_name}</Text>
                      <Text fontSize="xs" color={textColor}>{player.position}</Text>
                    </Td>
                    <Td>{player.detailed?.passes_per_90_overall?.toFixed(1) || '0.0'}</Td>
                    <Td>{player.detailed?.pass_completion_rate_overall?.toFixed(1) || '0.0'}%</Td>
                    <Td>{player.detailed?.key_passes_per_90_overall?.toFixed(1) || '0.0'}</Td>
                    <Td>{player.detailed?.dribbles_per_90_overall?.toFixed(1) || '0.0'}</Td>
                    <Td>{player.detailed?.dribbles_successful_percentage_overall || 0}%</Td>
                    <Td>{player.detailed?.crosses_per_90_overall?.toFixed(1) || '0.0'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
    );
  };

  // Render physical statistics
  const renderPhysicalStats = () => {
    const allPlayers = [...homePlayersData, ...awayPlayersData];

    return (
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Fouls Committed */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiActivity} color="red.500" mr={2} />
              <Heading size="sm" color={headingColor}>Fouls per 90min</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {allPlayers
                .filter(p => p.detailed?.fouls_committed_per_90_overall > 0)
                .sort((a, b) => (b.detailed?.fouls_committed_per_90_overall || 0) - (a.detailed?.fouls_committed_per_90_overall || 0))
                .slice(0, 5)
                .map((player) => (
                  <Flex key={player.id} justify="space-between" align="center">
                    <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                    <Badge colorScheme="red">{player.detailed?.fouls_committed_per_90_overall?.toFixed(1) || 0}</Badge>
                  </Flex>
                ))}
            </VStack>
          </Box>

          {/* Aerial Duels Won */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiTrendingUp} color="green.500" mr={2} />
              <Heading size="sm" color={headingColor}>Aerial Duels per 90min</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {allPlayers
                .filter(p => p.detailed?.aerial_duels_won_per_90_overall > 0)
                .sort((a, b) => (b.detailed?.aerial_duels_won_per_90_overall || 0) - (a.detailed?.aerial_duels_won_per_90_overall || 0))
                .slice(0, 5)
                .map((player) => (
                  <Flex key={player.id} justify="space-between" align="center">
                    <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                    <Badge colorScheme="green">{player.detailed?.aerial_duels_won_per_90_overall?.toFixed(1) || 0}</Badge>
                  </Flex>
                ))}
            </VStack>
          </Box>

          {/* Minutes Played */}
          <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={3}>
              <Icon as={FiStar} color="blue.500" mr={2} />
              <Heading size="sm" color={headingColor}>Minutes Played</Heading>
            </Flex>
            <VStack spacing={2} align="stretch">
              {allPlayers
                .filter(p => p.minutes_played_overall > 0)
                .sort((a, b) => (b.minutes_played_overall || 0) - (a.minutes_played_overall || 0))
                .slice(0, 5)
                .map((player) => (
                  <Flex key={player.id} justify="space-between" align="center">
                    <Text fontSize="sm" color={headingColor}>{player.full_name}</Text>
                    <Badge colorScheme="blue">{player.minutes_played_overall} min</Badge>
                  </Flex>
                ))}
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Detailed Physical Stats Table */}
        <Box bg={cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <Heading size="sm" color={headingColor} mb={4}>Detailed Physical Statistics</Heading>
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Player</Th>
                  <Th>Minutes</Th>
                  <Th>Appearances</Th>
                  <Th>Fouls/90</Th>
                  <Th>Fouls Drawn/90</Th>
                  <Th>Aerial Duels/90</Th>
                  <Th>Duels Won/90</Th>
                </Tr>
              </Thead>
              <Tbody>
                {allPlayers.slice(0, 10).map((player) => (
                  <Tr key={player.id}>
                    <Td>
                      <Text fontSize="sm" fontWeight="bold">{player.full_name}</Text>
                      <Text fontSize="xs" color={textColor}>{player.position}</Text>
                    </Td>
                    <Td>{player.minutes_played_overall || 0}</Td>
                    <Td>{player.appearances_overall || 0}</Td>
                    <Td>{player.detailed?.fouls_committed_per_90_overall?.toFixed(1) || '0.0'}</Td>
                    <Td>{player.detailed?.fouls_drawn_per_90_overall?.toFixed(1) || '0.0'}</Td>
                    <Td>{player.detailed?.aerial_duels_won_per_90_overall?.toFixed(1) || '0.0'}</Td>
                    <Td>{player.detailed?.duels_won_per_90_overall?.toFixed(1) || '0.0'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
    );
  };

  return (
    <VStack spacing={6} align="stretch">
      {renderGameCountSelector()}
      {renderLineups()}
      {renderPlayerStatistics()}
    </VStack>
  );
};

export default PlayerStatsTabFooty;
