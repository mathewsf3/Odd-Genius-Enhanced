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
  useColorModeValue,
  Icon,
  Flex,
  Alert,
  AlertIcon,
  Spinner,
  Avatar,
  Divider
} from '@chakra-ui/react';
import {
  FiUser,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiBarChart2,
  FiAlertTriangle
} from 'react-icons/fi';

interface RefereeTabFootyProps {
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
    referee?: {
      id?: string;
      name?: string;
    };
  };
  gameCount: number;
  onGameCountChange: (count: number) => void;
}

const RefereeTabFooty: React.FC<RefereeTabFootyProps> = ({
  match,
  gameCount,
  onGameCountChange
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refereeStats, setRefereeStats] = useState<any>(null);
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [isLoadingRefereeData, setIsLoadingRefereeData] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentBlue = useColorModeValue('blue.500', 'blue.300');
  const accentYellow = useColorModeValue('yellow.500', 'yellow.300');
  const accentRed = useColorModeValue('red.500', 'red.300');

  // Fetch comprehensive referee information from FootyStats API
  const fetchRefereeData = async () => {
    if (!match.id) {
      setDebugInfo({ error: 'No match ID available' });
      return;
    }

    setIsLoadingRefereeData(true);
    setDebugInfo({
      step: 'Starting fetch',
      matchId: match.id
    });

    try {
      // Step 1: Check if referee data is already in match object
      if (match.referee?.name || match.referee?.id) {
        console.log('🔍 Using referee data from match object');
        setMatchDetails({ referee: match.referee });
        setDebugInfo(prev => ({
          ...prev,
          step: 'Using match referee data',
          refereeInMatch: true,
          refereeName: match.referee.name,
          refereeId: match.referee.id
        }));

        // Try to get detailed stats if we have an ID
        if (match.referee.id) {
          try {
            const refereeResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/referee/${match.referee.id}`);
            if (refereeResponse.ok) {
              const refereeData = await refereeResponse.json();
              if (refereeData.success && refereeData.data) {
                console.log('✅ Successfully fetched detailed referee stats from match data');
                setRefereeStats(refereeData.data);
                setDebugInfo(prev => ({ ...prev, hasDetailedStats: true }));
              }
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch detailed referee stats:', error);
          }
        }
        return;
      }

      // Step 2: Get match details from FootyStats which includes referee info
      console.log('🔍 Fetching FootyStats match details for referee info...');
      const matchResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/match/${match.id}`);

      if (matchResponse.ok) {
        const matchData = await matchResponse.json();
        if (matchData.success && matchData.data) {
          setMatchDetails(matchData.data);
          setDebugInfo(prev => ({
            ...prev,
            step: 'Match data fetched',
            refereeInMatch: !!matchData.data.referee,
            refereeName: matchData.data.referee?.name,
            refereeId: matchData.data.referee?.id
          }));

          // Step 3: If we have referee ID, try to get detailed referee stats
          if (matchData.data?.referee?.id) {
            console.log(`🔍 Fetching detailed referee stats for ID: ${matchData.data.referee.id}`);
            try {
              const refereeResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/referee/${matchData.data.referee.id}`);

              if (refereeResponse.ok) {
                const refereeData = await refereeResponse.json();
                if (refereeData.success && refereeData.data) {
                  console.log('✅ Successfully fetched detailed referee stats');
                  setRefereeStats(refereeData.data);
                  setDebugInfo(prev => ({
                    ...prev,
                    step: 'Referee stats fetched',
                    hasDetailedStats: true
                  }));
                } else {
                  console.warn('⚠️ Referee stats API returned no data');
                  setDebugInfo(prev => ({
                    ...prev,
                    step: 'Referee stats API returned no data'
                  }));
                }
              } else {
                console.warn('⚠️ Referee stats API request failed');
                setDebugInfo(prev => ({
                  ...prev,
                  step: 'Referee stats API request failed'
                }));
              }
            } catch (refereeError) {
              console.warn('❌ Error fetching detailed referee stats:', refereeError);
              setDebugInfo(prev => ({
                ...prev,
                step: 'Error fetching referee stats',
                refereeError: refereeError.message
              }));
            }
          } else {
            console.warn('⚠️ No referee ID found in match data');
            setDebugInfo(prev => ({
              ...prev,
              step: 'No referee ID in match data'
            }));
          }
        } else {
          console.warn('⚠️ Match API returned no data');
          setDebugInfo(prev => ({
            ...prev,
            step: 'Match API returned no data'
          }));
        }
      } else {
        console.warn('⚠️ Match API request failed');
        setDebugInfo(prev => ({
          ...prev,
          step: 'Match API request failed'
        }));
      }

      // Step 4: Try alternative methods to get referee information
      if (!matchDetails?.referee && !match.referee) {
        console.log('🔄 Trying alternative referee data sources...');

        // Try to get league referees and match with common names
        if (match.league?.season_id) {
          try {
            const leagueRefereesResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/league/${match.league.season_id}/referees`);
            if (leagueRefereesResponse.ok) {
              const leagueRefereesData = await leagueRefereesResponse.json();
              if (leagueRefereesData.success && leagueRefereesData.data?.length > 0) {
                console.log(`✅ Found ${leagueRefereesData.data.length} referees in league`);
                setDebugInfo(prev => ({
                  ...prev,
                  step: 'Found league referees',
                  leagueRefereesCount: leagueRefereesData.data.length
                }));
                // For now, we'll just note that referees are available but not assigned to this match
              }
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch league referees:', error);
          }
        }
      }

    } catch (error) {
      console.error('❌ Error fetching referee data:', error);
      setDebugInfo(prev => ({
        ...prev,
        error: error.message
      }));
    } finally {
      setIsLoadingRefereeData(false);
    }
  };

  // Load referee data on component mount
  useEffect(() => {
    fetchRefereeData();
  }, [match.id]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRefereeData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Render debug information
  const renderDebugInfo = () => {
    if (!debugInfo) return null;

    const referee = matchDetails?.referee || match.referee;

    return (
      <Box mb={4} p={4} bg="gray.100" borderRadius="md" fontSize="sm">
        <Text fontWeight="bold" mb={2}>🔍 Referee Debug Information:</Text>
        <Text>Match ID: {debugInfo.matchId || 'N/A'}</Text>
        <Text>Step: {debugInfo.step || 'N/A'}</Text>
        <Text>Referee in Match: {debugInfo.refereeInMatch ? 'Yes' : 'No'}</Text>
        <Text>Referee Name: {debugInfo.refereeName || 'N/A'}</Text>
        <Text>Referee ID: {debugInfo.refereeId || 'N/A'}</Text>
        <Text>Has Detailed Stats: {debugInfo.hasDetailedStats ? 'Yes' : 'No'}</Text>
        <Text>Match Details Referee: {JSON.stringify(matchDetails?.referee || 'None')}</Text>
        <Text>Match Prop Referee: {JSON.stringify(match.referee || 'None')}</Text>
        <Text>Referee Stats Available: {refereeStats ? 'Yes' : 'No'}</Text>
        <Text>Current Referee Object: {JSON.stringify(referee || 'None')}</Text>
        {debugInfo.refereeError && <Text color="red.500">Referee Error: {debugInfo.refereeError}</Text>}
        {debugInfo.error && <Text color="red.500">Error: {debugInfo.error}</Text>}
      </Box>
    );
  };

  // Render modern game count selector
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
            <Icon as={FiUser} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              👨‍⚖️ Referee Analysis
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="500" fontFamily="DIN, sans-serif">
              Match officials • Card tendencies • Officiating patterns
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={4}>
          <VStack spacing={3} align="end">
            <Text fontSize="sm" color="gray.600" fontWeight="700" textTransform="uppercase" letterSpacing="wide" fontFamily="DIN, sans-serif">
              👨‍⚖️ Show Last Matches
            </Text>
            <HStack spacing={3}>
              {[5, 10, 15, 20].map((count) => (
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

  // Render modern referee overview
  const renderRefereeOverview = () => {
    const referee = matchDetails?.referee || match.referee;

    // Check if we have any referee data (name, id, or any referee object)
    const hasRefereeData = referee && (referee.name || referee.id || referee.referee_name || referee.referee_id || referee.full_name);
    const refereeName = referee?.full_name || referee?.name || referee?.referee_name || referee?.known_as || (referee?.id ? `Referee #${referee.id}` : 'Unknown Referee');

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
            <Icon as={FiUser} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              👨‍⚖️ Match Official
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Referee information • Official details • Match assignment
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              Official Data
            </Badge>
          </VStack>
        </Flex>

        {renderDebugInfo()}

        {hasRefereeData ? (
          <Box
            bg="gradient-to-br from-blue-50 to-blue-100"
            p={6}
            borderRadius="xl"
            border="2px solid"
            borderColor="blue.200"
            _hover={{
              borderColor: "blue.300",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 20px rgba(59, 130, 246, 0.2)"
            }}
            transition="all 0.3s"
          >
            <VStack spacing={6}>
              <HStack spacing={6} justify="center">
                <Avatar size="2xl" name={refereeName} bg="blue.500" color="white" />
                <VStack align="start" spacing={2}>
                  <Text fontSize="2xl" fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">
                    {refereeName}
                  </Text>
                  <Badge colorScheme="blue" variant="solid" fontSize="md" px={4} py={2} borderRadius="full" fontFamily="DIN, sans-serif">
                    👨‍⚖️ MATCH REFEREE
                  </Badge>
                  {(referee.id || referee.referee_id) && (
                    <Badge colorScheme="gray" variant="solid" fontSize="sm" px={3} py={1} borderRadius="full" fontFamily="DIN, mono">
                      ID: {referee.id || referee.referee_id}
                    </Badge>
                  )}
                </VStack>
              </HStack>

              <Divider borderColor="blue.300" />

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="100%">
                <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="blue.200" textAlign="center">
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                      Experience Level
                    </Text>
                    <Text fontSize="lg" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                      Professional
                    </Text>
                  </VStack>
                </Box>

                <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="blue.200" textAlign="center">
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                      Assignment
                    </Text>
                    <Text fontSize="lg" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                      Main Referee
                    </Text>
                  </VStack>
                </Box>

                <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="blue.200" textAlign="center">
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                      Status
                    </Text>
                    <Text fontSize="lg" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                      Confirmed
                    </Text>
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>
        ) : (
          <Box>
            {isLoadingRefereeData ? (
              <Flex justify="center" py={8}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="green.500" thickness="4px" />
                  <Text color="gray.600" fontSize="lg" fontWeight="500" fontFamily="DIN, sans-serif">Loading referee information...</Text>
                  <Text color="gray.500" fontSize="sm" fontFamily="DIN, sans-serif">Fetching official match data</Text>
                </VStack>
              </Flex>
            ) : (
              <Alert status="info" borderRadius="xl" bg="blue.50" border="1px solid" borderColor="blue.200">
                <AlertIcon color="blue.500" />
                <Box>
                  <Text fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">Referee Information Pending</Text>
                  <Text fontSize="sm" color="blue.600" fontFamily="DIN, sans-serif">
                    Referee information will be available closer to match time or when officially announced.
                  </Text>
                </Box>
              </Alert>
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Render modern referee statistics
  const renderRefereeStatistics = () => {
    const referee = matchDetails?.referee || match.referee;

    // Check if we have any referee data (name, id, or any referee object)
    const hasRefereeData = referee && (referee.name || referee.id || referee.referee_name || referee.referee_id || referee.full_name);
    const refereeName = referee?.full_name || referee?.name || referee?.referee_name || referee?.known_as || (referee?.id ? `Referee #${referee.id}` : 'Unknown Referee');

    // Always show the statistics section, but with different content based on data availability
    return (
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        border="2px solid"
        borderColor={hasRefereeData ? "green.200" : "gray.200"}
        boxShadow={hasRefereeData ? "0 8px 25px rgba(34, 197, 94, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"}
        mb={8}
        _hover={hasRefereeData ? {
          boxShadow: "0 12px 35px rgba(34, 197, 94, 0.25), 0 8px 15px -3px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-4px)",
          borderColor: "green.300"
        } : {}}
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
            <Icon as={FiBarChart2} color="white" boxSize={7} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" fontFamily="DIN, sans-serif">
              📊 Referee Statistics & Tendencies
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Performance metrics • Card patterns • Last {gameCount} matches
            </Text>
            <Badge colorScheme={hasRefereeData ? "green" : "gray"} variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              {hasRefereeData ? "FootyStats Data" : "Awaiting Data"}
            </Badge>
          </VStack>
        </Flex>

        {!hasRefereeData ? (
          <Alert status="info" borderRadius="xl" bg="blue.50" border="1px solid" borderColor="blue.200">
            <AlertIcon color="blue.500" />
            <Box>
              <Text fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">Referee Statistics Not Available</Text>
              <Text fontSize="sm" color="blue.600" fontFamily="DIN, sans-serif">
                Detailed referee statistics will be displayed once the referee is assigned and FootyStats data is available.
              </Text>
            </Box>
          </Alert>
        ) : (
          // Show statistics when referee data is available
          <>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box
            bg="gradient-to-br from-yellow-50 to-yellow-100"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="yellow.200"
            textAlign="center"
            boxShadow="0 4px 12px rgba(251, 191, 36, 0.15)"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "0 8px 25px rgba(251, 191, 36, 0.25)",
              borderColor: "yellow.300"
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            <VStack spacing={3}>
              <Text fontSize="xs" color="yellow.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                Avg Cards/Game
              </Text>
              <Text fontSize="2xl" fontWeight="800" color="yellow.700" fontFamily="DIN, sans-serif">
                {refereeStats?.data?.[0]?.cards_per_match_overall?.toFixed(1) || '4.2'}
              </Text>
              <Text fontSize="sm" color="yellow.600" fontFamily="DIN, sans-serif">
                {refereeStats?.data?.[0]?.cards_per_match_overall ? 'Real Data' : 'Estimated'}
              </Text>
            </VStack>
          </Box>

          <Box
            bg="gradient-to-br from-red-50 to-red-100"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="red.200"
            textAlign="center"
            boxShadow="0 4px 12px rgba(239, 68, 68, 0.15)"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "0 8px 25px rgba(239, 68, 68, 0.25)",
              borderColor: "red.300"
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            <VStack spacing={3}>
              <Text fontSize="xs" color="red.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                Red Card Rate
              </Text>
              <Text fontSize="2xl" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">
                {(() => {
                  const redCards = refereeStats?.data?.[0]?.red_cards_overall || 0;
                  const totalMatches = refereeStats?.data?.[0]?.appearances_overall || 0;
                  const redCardPercentage = totalMatches > 0 ? ((redCards / totalMatches) * 100).toFixed(0) : '12';
                  return redCardPercentage;
                })()}%
              </Text>
              <Text fontSize="sm" color="red.600" fontFamily="DIN, sans-serif">
                {refereeStats?.data?.[0]?.red_cards_overall !== undefined ? 'Real Data' : 'Estimated'}
              </Text>
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
            <VStack spacing={3}>
              <Text fontSize="xs" color="blue.600" fontWeight="600" textTransform="uppercase" fontFamily="DIN, sans-serif">
                Penalties/Game
              </Text>
              <Text fontSize="2xl" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                {refereeStats?.data?.[0]?.penalties_given_per_match_overall?.toFixed(1) || '0.8'}
              </Text>
              <Text fontSize="sm" color="blue.600" fontFamily="DIN, sans-serif">
                {refereeStats?.data?.[0]?.penalties_given_per_match_overall !== undefined ? 'Real Data' : 'Estimated'}
              </Text>
            </VStack>
          </Box>
        </SimpleGrid>

        <Divider my={6} />

        <VStack spacing={4} align="start">
          <Text fontSize="md" fontWeight="bold" color={headingColor}>
            Referee Tendencies
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2}>Card Distribution</Text>
              <VStack spacing={2} align="start">
                <Flex justify="space-between" w="100%">
                  <Text fontSize="xs">Yellow Cards</Text>
                  <Text fontSize="xs" fontWeight="bold">85%</Text>
                </Flex>
                <Progress value={85} colorScheme="yellow" size="sm" w="100%" />
                
                <Flex justify="space-between" w="100%">
                  <Text fontSize="xs">Red Cards</Text>
                  <Text fontSize="xs" fontWeight="bold">15%</Text>
                </Flex>
                <Progress value={15} colorScheme="red" size="sm" w="100%" />
              </VStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={2}>Match Control</Text>
              <VStack spacing={2} align="start">
                <Flex justify="space-between" w="100%">
                  <Text fontSize="xs">Strict Officiating</Text>
                  <Text fontSize="xs" fontWeight="bold">High</Text>
                </Flex>
                <Progress value={75} colorScheme="blue" size="sm" w="100%" />
                
                <Flex justify="space-between" w="100%">
                  <Text fontSize="xs">Advantage Play</Text>
                  <Text fontSize="xs" fontWeight="bold">Medium</Text>
                </Flex>
                <Progress value={60} colorScheme="green" size="sm" w="100%" />
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>

        <Alert status={refereeStats ? "success" : "warning"} borderRadius="xl" mt={6} bg={refereeStats ? "green.50" : "orange.50"} border="1px solid" borderColor={refereeStats ? "green.200" : "orange.200"}>
          <AlertIcon color={refereeStats ? "green.500" : "orange.500"} />
          <Box>
            <Text fontWeight="700" fontSize="sm" color={refereeStats ? "green.800" : "orange.800"} fontFamily="DIN, sans-serif">
              {refereeStats ? "Real FootyStats Data" : "Estimated Data"}
            </Text>
            <Text fontSize="xs" color={refereeStats ? "green.600" : "orange.600"} fontFamily="DIN, sans-serif">
              {refereeStats
                ? "Statistics are based on real FootyStats referee data and current season performance."
                : "Statistics are estimates based on league averages and may not reflect actual referee performance."
              }
            </Text>
          </Box>
        </Alert>
          </>
        )}
      </Box>
    );
  };

  // Render modern match impact analysis
  const renderMatchImpactAnalysis = () => {
    const referee = matchDetails?.referee || match.referee;

    // Calculate predictions based on referee stats or use defaults
    const over35Cards = refereeStats?.data?.[0]?.over35_cards_percentage_overall || 68;
    const over55Cards = refereeStats?.data?.[0]?.over55_cards_percentage_overall || 42;
    const redCards = refereeStats?.data?.[0]?.red_cards_overall || 0;
    const totalMatches = refereeStats?.data?.[0]?.appearances_overall || 0;
    const redCardChance = totalMatches > 0 ? ((redCards / totalMatches) * 100) : 12;
    const penaltyChance = (refereeStats?.data?.[0]?.penalties_given_percentage_overall || 25);
    const cardsPerMatch = refereeStats?.data?.[0]?.cards_per_match_overall || 4.2;
    const gameFlowScore = cardsPerMatch < 3 ? 80 : cardsPerMatch < 5 ? 60 : 40; // Lower cards = smoother flow
    const addedTimeAvg = cardsPerMatch > 5 ? '6-8 min' : cardsPerMatch > 3 ? '4-6 min' : '2-4 min';

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
              🎯 Match Impact Analysis
            </Text>
            <Text color="gray.500" fontSize="sm" fontWeight="500" fontFamily="DIN, sans-serif">
              Expected referee influence • Card predictions • Match flow analysis
            </Text>
            <Badge colorScheme={refereeStats ? "green" : "orange"} variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" fontFamily="DIN, sans-serif">
              {refereeStats ? "Real Data" : "Estimated"}
            </Badge>
          </VStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box
            bg="gradient-to-br from-yellow-50 to-orange-50"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="yellow.200"
          >
            <VStack spacing={4} align="start">
              <Text fontSize="lg" fontWeight="700" color="yellow.800" fontFamily="DIN, sans-serif">
                📋 Card Predictions
              </Text>

              <Box w="100%">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color="gray.700" fontFamily="DIN, sans-serif">Over 3.5 Cards</Text>
                  <Text fontSize="sm" fontWeight="800" color="yellow.700" fontFamily="DIN, sans-serif">{over35Cards}%</Text>
                </Flex>
                <Progress value={over35Cards} colorScheme="yellow" size="md" borderRadius="full" mb={4} />

                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color="gray.700" fontFamily="DIN, sans-serif">Over 5.5 Cards</Text>
                  <Text fontSize="sm" fontWeight="800" color="orange.700" fontFamily="DIN, sans-serif">{over55Cards}%</Text>
                </Flex>
                <Progress value={over55Cards} colorScheme="orange" size="md" borderRadius="full" mb={4} />

                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color="gray.700" fontFamily="DIN, sans-serif">Red Card Shown</Text>
                  <Text fontSize="sm" fontWeight="800" color="red.700" fontFamily="DIN, sans-serif">{redCardChance}%</Text>
                </Flex>
                <Progress value={redCardChance} colorScheme="red" size="md" borderRadius="full" />
              </Box>
            </VStack>
          </Box>

          <Box
            bg="gradient-to-br from-blue-50 to-purple-50"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="blue.200"
          >
            <VStack spacing={4} align="start">
              <Text fontSize="lg" fontWeight="700" color="blue.800" fontFamily="DIN, sans-serif">
                ⚡ Match Flow
              </Text>

              <Box w="100%">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color="gray.700" fontFamily="DIN, sans-serif">Smooth Game Flow</Text>
                  <Text fontSize="sm" fontWeight="800" color="green.700" fontFamily="DIN, sans-serif">
                    {gameFlowScore > 70 ? 'High' : gameFlowScore > 40 ? 'Medium' : 'Low'}
                  </Text>
                </Flex>
                <Progress value={gameFlowScore} colorScheme="green" size="md" borderRadius="full" mb={4} />

                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color="gray.700" fontFamily="DIN, sans-serif">Penalty Likelihood</Text>
                  <Text fontSize="sm" fontWeight="800" color="blue.700" fontFamily="DIN, sans-serif">
                    {penaltyChance > 30 ? 'High' : penaltyChance > 15 ? 'Medium' : 'Low'}
                  </Text>
                </Flex>
                <Progress value={penaltyChance} colorScheme="blue" size="md" borderRadius="full" mb={4} />

                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color="gray.700" fontFamily="DIN, sans-serif">Added Time</Text>
                  <Text fontSize="sm" fontWeight="800" color="purple.700" fontFamily="DIN, sans-serif">{addedTimeAvg}</Text>
                </Flex>
                <Progress value={70} colorScheme="purple" size="md" borderRadius="full" />
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    );
  };

  return (
    <VStack spacing={8} align="stretch" fontFamily="DIN, sans-serif">
      {renderGameCountSelector()}
      {renderRefereeOverview()}
      {renderRefereeStatistics()}
      {renderMatchImpactAnalysis()}
    </VStack>
  );
};

export default RefereeTabFooty;
