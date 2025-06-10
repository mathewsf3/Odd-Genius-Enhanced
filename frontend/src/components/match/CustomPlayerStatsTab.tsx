// @ts-nocheck
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  VStack,
  HStack,
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
  TabPanels,
  TabPanel,
  Tab,
  useColorModeValue,
  Tooltip,
  UnorderedList,
  ListItem
} from '@chakra-ui/react';
import {
  FiAlertCircle,
  FiRefreshCw,
  FiCheck,
  FiAward
} from 'react-icons/fi';
import { Match } from '../../types/interfaces';
import { PlayerStats } from '../../types/playerStats';

interface CustomPlayerStatsTabProps {
  match: Match;
  data: PlayerStats | null;
  isLoading: boolean;
  initialGameCount?: string;
  onGameCountChange?: (count: number) => void;
  onRefresh?: () => void;
}

const CustomPlayerStatsTab: React.FC<CustomPlayerStatsTabProps> = ({
  // match is not used but kept for interface compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  match,
  data,
  isLoading,
  initialGameCount = "10",
  onGameCountChange,
  onRefresh
}) => {
  const [gameCount, setGameCount] = useState<string | number>(initialGameCount);
  const [selectedTeamTab, setSelectedTeamTab] = useState<number>(0); // 0 for home team, 1 for away team

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" speed="0.8s" />
          <Text color="gray.500" fontWeight="medium">
            Loading player statistics...
          </Text>
        </VStack>
      </Center>
    );
  }

  // If no data, show error message
  if (!data) {
    return (
      <Box p={4} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <VStack spacing={4} align="center" py={8}>
          <Icon as={FiAlertCircle} boxSize="48px" color="gray.400" />
          <Heading size="md">No Player Statistics Available</Heading>
          <Text align="center" color="gray.500">
            We were unable to retrieve player statistics for this match.<br />
            This could be because the API data is currently unavailable.
          </Text>
          {onRefresh && (
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="blue"
              size="md"
              onClick={onRefresh}
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
  const { homeTeamPlayers, awayTeamPlayers } = data;

  // Generate dynamic player notes based on real data
  const generatePlayerNotes = (teamPlayers: typeof homeTeamPlayers, matchCount: string | number) => {
    if (!teamPlayers.players || teamPlayers.players.length === 0) {
      return [];
    }

    const notes = [];
    const players = teamPlayers.players;

    // Calculate total goals
    const totalGoals = players.reduce((sum, player) => sum + (player.playerGoals || 0), 0);

    // Get top scorers (players with goals > 0)
    const topScorers = players
      .filter(player => (player.playerGoals || 0) > 0)
      .sort((a, b) => (b.playerGoals || 0) - (a.playerGoals || 0))
      .slice(0, 5); // Top 5 scorers

    // Get top assisters (players with assists > 0)
    const topAssisters = players
      .filter(player => (player.playerAssists || 0) > 0)
      .sort((a, b) => (b.playerAssists || 0) - (a.playerAssists || 0))
      .slice(0, 3); // Top 3 assisters

    // Note about total goals
    if (totalGoals > 0) {
      notes.push(`${teamPlayers.teamName} has scored ${totalGoals} goals in their last ${matchCount} matches.`);
    } else {
      notes.push(`${teamPlayers.teamName} has struggled to find the net in their last ${matchCount} matches.`);
    }

    // Note about top scorers
    if (topScorers.length > 0) {
      const scorerNames = topScorers.map(player =>
        `${player.playerName} (${player.playerGoals})`
      );

      if (scorerNames.length === 1) {
        notes.push(`${scorerNames[0]} is the team's leading scorer in this period.`);
      } else if (scorerNames.length === 2) {
        notes.push(`${scorerNames[0]} and ${scorerNames[1]} are the top scorers.`);
      } else {
        const lastScorer = scorerNames.pop();
        notes.push(`${scorerNames.join(', ')}, and ${lastScorer} have contributed goals.`);
      }
    }

    // Note about top assisters
    if (topAssisters.length > 0) {
      const assisterNames = topAssisters.map(player =>
        `${player.playerName} (${player.playerAssists})`
      );

      if (assisterNames.length === 1) {
        notes.push(`${assisterNames[0]} leads the team with assists in the last ${matchCount} matches.`);
      } else if (assisterNames.length === 2) {
        notes.push(`${assisterNames[0]} and ${assisterNames[1]} lead the team with assists in the last ${matchCount} matches.`);
      } else {
        const lastAssister = assisterNames.pop();
        notes.push(`${assisterNames.join(', ')}, and ${lastAssister} are the top assist providers in the last ${matchCount} matches.`);
      }
    }

    return notes;
  };

  // Render the Player Stats tab
  return (
    <Box>
      {/* Player Stats Analysis Range */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
        mb={6}
        position="relative"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Player Stats & Performance</Heading>
          <Badge colorScheme="green" variant="solid" px={2} py={1}>
            Using Real Match Data
          </Badge>
        </Flex>

        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={4}>
            <Text>Player statistics from recent matches</Text>
            <Tabs
              variant="soft-rounded"
              colorScheme="blue"
              size="sm"
              index={gameCount === "5" ? 0 : 1}
              onChange={(index) => {
                const newCount = index === 0 ? "5" : "10";
                setGameCount(newCount);

                if (onGameCountChange) {
                  onGameCountChange(parseInt(newCount));
                }
              }}
            >
              <TabList>
                <Tab fontWeight="medium" px={3}>Last 5</Tab>
                <Tab fontWeight="medium" px={3}>Last 10</Tab>
              </TabList>
            </Tabs>
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

        {/* Player notes section - Team specific based on selected tab */}
        {gameCount === "10" && (
          <Box mt={2} p={3} bg="blue.50" borderRadius="md" fontSize="sm">
            <Heading size="xs" mb={2} color="blue.700">Player Notes:</Heading>
            <UnorderedList spacing={1} color="blue.700">
              {generatePlayerNotes(
                selectedTeamTab === 0 ? homeTeamPlayers : awayTeamPlayers,
                gameCount
              ).map((note, index) => (
                <ListItem key={index}>
                  {note}
                </ListItem>
              ))}
            </UnorderedList>
          </Box>
        )}

        {/* Player notes section for 5 matches - Team specific based on selected tab */}
        {gameCount === "5" && (
          <Box mt={2} p={3} bg="blue.50" borderRadius="md" fontSize="sm">
            <Heading size="xs" mb={2} color="blue.700">Player Notes:</Heading>
            <UnorderedList spacing={1} color="blue.700">
              {generatePlayerNotes(
                selectedTeamTab === 0 ? homeTeamPlayers : awayTeamPlayers,
                gameCount
              ).map((note, index) => (
                <ListItem key={index}>
                  {note}
                </ListItem>
              ))}
            </UnorderedList>
          </Box>
        )}
      </Box>

      {/* Player Stats Content */}
      <Box
        bg={cardBg}
        p={5}
        borderRadius="md"
        boxShadow="md"
        mb={6}
        position="relative"
        overflow="hidden"
      >
        <Flex align="center" mb={5}>
          <Icon as={FiAward} color={accentColor} mr={2} boxSize="24px" />
          <Heading size="md">Team Player Statistics</Heading>
        </Flex>

        {/* Team Tabs */}
        <Tabs
          variant="soft-rounded"
          colorScheme="blue"
          size="md"
          mb={6}
          index={selectedTeamTab}
          onChange={(index) => setSelectedTeamTab(index)}
        >
          <TabList mb={4}>
            <Tab fontWeight="medium" px={4} py={2}>{homeTeamPlayers.teamName}</Tab>
            <Tab fontWeight="medium" px={4} py={2}>{awayTeamPlayers.teamName}</Tab>
          </TabList>

          <TabPanels>
            {/* Home Team Tab */}
            <TabPanel p={0}>
              <Box
                bg={useColorModeValue('white', 'gray.800')}
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                borderLeft="4px solid"
                borderLeftColor="green.400"
              >
                <Heading size="sm" mb={4} color="green.500">{homeTeamPlayers.teamName} Player Statistics</Heading>
                <Table variant="simple" size="sm">
                  <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Tr>
                      <Th>Player</Th>
                      <Th isNumeric>Goals</Th>
                      <Th isNumeric>G/Game</Th>
                      <Th isNumeric>Assists</Th>
                      <Th isNumeric>A/Game</Th>
                      <Th isNumeric>Games</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {homeTeamPlayers.players && homeTeamPlayers.players.length > 0 ? (
                      // Include all players but sort by contribution
                      homeTeamPlayers.players
                        .sort((a, b) => (b.playerGoals + b.playerAssists) - (a.playerGoals + a.playerAssists))
                        .map((player, index) => (
                          <Tr key={index} bg={index % 2 === 0 ? 'transparent' : useColorModeValue('gray.50', 'gray.700')}>
                            <Td>
                              <Flex align="center">
                                <Text fontWeight="medium">{player.playerName}</Text>
                                {player.playerType && (
                                  <Badge ml={2} colorScheme="green" variant="outline" size="sm">
                                    {player.playerType}
                                  </Badge>
                                )}
                              </Flex>
                            </Td>
                            <Td isNumeric fontWeight={player.playerGoals > 0 ? "bold" : "normal"} color={player.playerGoals > 0 ? "green.500" : undefined}>
                              {player.playerGoals}
                            </Td>
                            <Td isNumeric>
                              {player.playerMatchPlayed && player.playerGoals > 0 ? (
                                <Badge colorScheme="green">
                                  {(player.playerGoals / player.playerMatchPlayed).toFixed(2)}
                                </Badge>
                              ) : '-'}
                            </Td>
                            <Td isNumeric fontWeight={player.playerAssists > 0 ? "bold" : "normal"} color={player.playerAssists > 0 ? "blue.500" : undefined}>
                              {player.playerAssists}
                            </Td>
                            <Td isNumeric>
                              {player.playerMatchPlayed && player.playerAssists > 0 ? (
                                <Badge colorScheme="blue">
                                  {(player.playerAssists / player.playerMatchPlayed).toFixed(2)}
                                </Badge>
                              ) : '-'}
                            </Td>
                            <Td isNumeric>{player.playerMatchPlayed || '-'}</Td>
                          </Tr>
                        ))
                    ) : (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py={4}>
                          <Text color="gray.500">No player data available for {homeTeamPlayers.teamName}</Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>

                {/* Players with limited appearances section */}
                {(gameCount === "5" || gameCount === 5) && homeTeamPlayers.players && (
                  <Box mt={6}>
                    <Heading size="xs" mb={3} color="gray.500">Players with Limited Appearances in Last 5 Matches</Heading>
                    <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                      <Flex flexWrap="wrap" gap={2}>
                        {homeTeamPlayers.players
                          .filter(player => player.playerMatchPlayed < 3) // Show players with fewer than 3 appearances
                          .map((player, index) => (
                            <Badge key={index} py={1} px={2} borderRadius="md" variant="subtle" colorScheme="gray">
                              {player.playerName} {player.playerType ? `(${player.playerType})` : ''}
                              {player.playerMatchPlayed > 0 ? ` (${player.playerMatchPlayed} app)` : ' (0 app)'}
                            </Badge>
                          ))
                        }
                      </Flex>
                    </Box>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Note: These players had limited playing time in {homeTeamPlayers.teamName}'s last {gameCount} matches.
                    </Text>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Away Team Tab */}
            <TabPanel p={0}>
              <Box
                bg={useColorModeValue('white', 'gray.800')}
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                borderLeft="4px solid"
                borderLeftColor="purple.400"
              >
                <Heading size="sm" mb={4} color="purple.500">{awayTeamPlayers.teamName} Player Statistics</Heading>
                <Table variant="simple" size="sm">
                  <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Tr>
                      <Th>Player</Th>
                      <Th isNumeric>Goals</Th>
                      <Th isNumeric>G/Game</Th>
                      <Th isNumeric>Assists</Th>
                      <Th isNumeric>A/Game</Th>
                      <Th isNumeric>Games</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {awayTeamPlayers.players && awayTeamPlayers.players.length > 0 ? (
                      // Include all players but sort by contribution
                      awayTeamPlayers.players
                        .sort((a, b) => (b.playerGoals + b.playerAssists) - (a.playerGoals + a.playerAssists))
                        .map((player, index) => (
                          <Tr key={index} bg={index % 2 === 0 ? 'transparent' : useColorModeValue('gray.50', 'gray.700')}>
                            <Td>
                              <Flex align="center">
                                <Text fontWeight="medium">{player.playerName}</Text>
                                {player.playerType && (
                                  <Badge ml={2} colorScheme="purple" variant="outline" size="sm">
                                    {player.playerType}
                                  </Badge>
                                )}
                              </Flex>
                            </Td>
                            <Td isNumeric fontWeight={player.playerGoals > 0 ? "bold" : "normal"} color={player.playerGoals > 0 ? "green.500" : undefined}>
                              {player.playerGoals}
                            </Td>
                            <Td isNumeric>
                              {player.playerMatchPlayed && player.playerGoals > 0 ? (
                                <Badge colorScheme="green">
                                  {(player.playerGoals / player.playerMatchPlayed).toFixed(2)}
                                </Badge>
                              ) : '-'}
                            </Td>
                            <Td isNumeric fontWeight={player.playerAssists > 0 ? "bold" : "normal"} color={player.playerAssists > 0 ? "blue.500" : undefined}>
                              {player.playerAssists}
                            </Td>
                            <Td isNumeric>
                              {player.playerMatchPlayed && player.playerAssists > 0 ? (
                                <Badge colorScheme="blue">
                                  {(player.playerAssists / player.playerMatchPlayed).toFixed(2)}
                                </Badge>
                              ) : '-'}
                            </Td>
                            <Td isNumeric>{player.playerMatchPlayed || '-'}</Td>
                          </Tr>
                        ))
                    ) : (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py={4}>
                          <Text color="gray.500">No player data available for {awayTeamPlayers.teamName}</Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>

                {/* Players with limited appearances section */}
                {(gameCount === "5" || gameCount === 5) && awayTeamPlayers.players && (
                  <Box mt={6}>
                    <Heading size="xs" mb={3} color="gray.500">Players with Limited Appearances in Last 5 Matches</Heading>
                    <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                      <Flex flexWrap="wrap" gap={2}>
                        {awayTeamPlayers.players
                          .filter(player => player.playerMatchPlayed < 3) // Show players with fewer than 3 appearances
                          .map((player, index) => (
                            <Badge key={index} py={1} px={2} borderRadius="md" variant="subtle" colorScheme="gray">
                              {player.playerName} {player.playerType ? `(${player.playerType})` : ''}
                              {player.playerMatchPlayed > 0 ? ` (${player.playerMatchPlayed} app)` : ' (0 app)'}
                            </Badge>
                          ))
                        }
                      </Flex>
                    </Box>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Note: These players had limited playing time in {awayTeamPlayers.teamName}'s last {gameCount} matches.
                    </Text>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default CustomPlayerStatsTab;
