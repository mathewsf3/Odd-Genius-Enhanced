import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Icon,
  Flex,
  Avatar,
  Image,
  Divider
} from '@chakra-ui/react';
import {
  FiMapPin,
  FiUser,
  FiClock,
  FiCalendar
} from 'react-icons/fi';

interface EnhancedMatchHeaderFootyProps {
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
    date?: string;
    status?: string;
  };
}

const EnhancedMatchHeaderFooty: React.FC<EnhancedMatchHeaderFootyProps> = ({ match }) => {
  const [homeTeamLastX, setHomeTeamLastX] = useState<any>(null);
  const [awayTeamLastX, setAwayTeamLastX] = useState<any>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modern white and green color scheme
  const bgColor = 'white';
  const cardBg = 'gray.50';
  const borderColor = 'gray.200';
  const textColor = 'gray.600';
  const headingColor = 'gray.900';

  // Fetch team form data and match details
  const fetchMatchData = async () => {
    if (!match.homeTeam.id || !match.awayTeam.id) return;

    setIsLoading(true);
    try {
      const [homeLastX, awayLastX, matchResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.homeTeam.id}/lastx`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/team/${match.awayTeam.id}/lastx`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/footystats/match/${match.id}`)
      ]);

      if (homeLastX.ok) {
        const homeLastXData = await homeLastX.json();
        if (homeLastXData.success) setHomeTeamLastX(homeLastXData.data);
      }

      if (awayLastX.ok) {
        const awayLastXData = await awayLastX.json();
        if (awayLastXData.success) setAwayTeamLastX(awayLastXData.data);
      }

      if (matchResponse.ok) {
        const matchResult = await matchResponse.json();
        if (matchResult.success) setMatchData(matchResult.data);
      }

    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMatchData();
  }, [match.homeTeam.id, match.awayTeam.id, match.id]);

  if (isLoading) {
    return (
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        mb={8}
        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      >
        <Text textAlign="center" color="gray.600" fontSize="lg" fontWeight="500">
          ⚽ Loading match details...
        </Text>
      </Box>
    );
  }

  const homeLastXData = homeTeamLastX?.data?.[0];
  const awayLastXData = awayTeamLastX?.data?.[0];

  return (
    <Box
      bg="white"
      p={8}
      borderRadius="2xl"
      border="2px solid"
      borderColor="green.200"
      mb={8}
      boxShadow="0 8px 25px rgba(34, 197, 94, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      _hover={{
        boxShadow: "0 12px 35px rgba(34, 197, 94, 0.25), 0 8px 15px -3px rgba(0, 0, 0, 0.15)",
        transform: "translateY(-4px)",
        borderColor: "green.300"
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      {/* Main Match Header */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} alignItems="center" mb={6}>
        {/* Home Team */}
        <VStack spacing={4}>
          <Image
            src={match.homeTeam.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.homeTeam.name.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`}
            alt={match.homeTeam.name}
            boxSize="96px"
            objectFit="contain"
            fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(match.homeTeam.name.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`}
            borderRadius="xl"
            border="2px solid"
            borderColor="gray.200"
            p={2}
            backgroundColor="white"
            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            onError={(e) => {
              console.log(`[EnhancedMatchHeaderFooty] Home team logo load error for ${match.homeTeam.name}:`, e);
            }}
          />
          <VStack spacing={2}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" textAlign="center">
              {match.homeTeam.name}
            </Text>
            <Badge colorScheme="green" variant="solid" size="md" px={4} py={1} borderRadius="full" fontSize="sm" fontWeight="700">
              🏠 HOME
            </Badge>
            {/* Home Team Form */}
            {homeLastXData?.stats?.additional_info?.formRun_overall && (
              <VStack spacing={2} mt={3}>
                <Text fontSize="sm" color="gray.600" fontWeight="600" textTransform="uppercase">Recent Form</Text>
                <HStack spacing={2}>
                  {homeLastXData.stats.additional_info.formRun_overall.split('').slice(0, 5).map((result: string, index: number) => (
                    <Box
                      key={index}
                      w="32px"
                      h="32px"
                      borderRadius="full"
                      bg={result.toLowerCase() === 'w' ? 'green.500' :
                          result.toLowerCase() === 'd' ? 'yellow.500' : 'red.500'}
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="800"
                      fontSize="sm"
                      border="2px solid white"
                      boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                      _hover={{ transform: "scale(1.1)" }}
                      transition="all 0.2s"
                    >
                      {result.toUpperCase()}
                    </Box>
                  ))}
                </HStack>
              </VStack>
            )}
          </VStack>
        </VStack>

        {/* Match Info */}
        <VStack spacing={4}>
          <Text fontSize="4xl" fontWeight="800" color="gray.800">
            ⚔️
          </Text>
          <Text fontSize="3xl" fontWeight="800" color="gray.700">
            VS
          </Text>
          <VStack spacing={3}>
            {match.date && (
              <HStack spacing={3}>
                <Icon as={FiCalendar} color="green.500" boxSize={5} />
                <Text fontSize="md" color="gray.700" fontWeight="600">
                  {new Date(match.date).toLocaleDateString()}
                </Text>
              </HStack>
            )}
            {match.status && (
              <Badge colorScheme="green" variant="solid" size="lg" px={4} py={2} borderRadius="full" fontSize="md" fontWeight="700">
                {match.status.toUpperCase()}
              </Badge>
            )}
          </VStack>
        </VStack>

        {/* Away Team */}
        <VStack spacing={4}>
          <Image
            src={match.awayTeam.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.awayTeam.name.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`}
            alt={match.awayTeam.name}
            boxSize="96px"
            objectFit="contain"
            fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(match.awayTeam.name.substring(0, 2))}&background=252535&color=6366F1&bold=true&size=128`}
            borderRadius="xl"
            border="2px solid"
            borderColor="gray.200"
            p={2}
            backgroundColor="white"
            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            onError={(e) => {
              console.log(`[EnhancedMatchHeaderFooty] Away team logo load error for ${match.awayTeam.name}:`, e);
            }}
          />
          <VStack spacing={2}>
            <Text fontSize="2xl" fontWeight="700" color="gray.900" textAlign="center">
              {match.awayTeam.name}
            </Text>
            <Badge colorScheme="blue" variant="solid" size="md" px={4} py={1} borderRadius="full" fontSize="sm" fontWeight="700">
              ✈️ AWAY
            </Badge>
            {/* Away Team Form */}
            {awayLastXData?.stats?.additional_info?.formRun_overall && (
              <VStack spacing={2} mt={3}>
                <Text fontSize="sm" color="gray.600" fontWeight="600" textTransform="uppercase">Recent Form</Text>
                <HStack spacing={2}>
                  {awayLastXData.stats.additional_info.formRun_overall.split('').slice(0, 5).map((result: string, index: number) => (
                    <Box
                      key={index}
                      w="32px"
                      h="32px"
                      borderRadius="full"
                      bg={result.toLowerCase() === 'w' ? 'green.500' :
                          result.toLowerCase() === 'd' ? 'yellow.500' : 'red.500'}
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="800"
                      fontSize="sm"
                      border="2px solid white"
                      boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                      _hover={{ transform: "scale(1.1)" }}
                      transition="all 0.2s"
                    >
                      {result.toUpperCase()}
                    </Box>
                  ))}
                </HStack>
              </VStack>
            )}
          </VStack>
        </VStack>
      </SimpleGrid>

      <Divider my={4} />

      {/* Match Details - Centered */}
      <VStack spacing={4} align="center">
        <HStack spacing={8} justify="center" wrap="wrap">
          {/* Stadium */}
          {matchData?.stadium?.name && (
            <VStack spacing={2} align="center" minW="200px">
              <HStack spacing={2}>
                <Icon as={FiMapPin} color="green.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="700" color={headingColor} textAlign="center">
                  🏟️ {matchData.stadium.name}
                </Text>
              </HStack>
              <Text fontSize="sm" color={textColor} textAlign="center">
                {matchData.stadium.location || 'Stadium Location'}
              </Text>
            </VStack>
          )}

          {/* Match Time */}
          {match.date && (
            <VStack spacing={2} align="center" minW="200px">
              <HStack spacing={2}>
                <Icon as={FiClock} color="green.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="700" color={headingColor} textAlign="center">
                  ⏰ {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </HStack>
              <Text fontSize="sm" color={textColor} textAlign="center">
                Kick-off Time
              </Text>
            </VStack>
          )}

          {/* Referee */}
          {matchData?.referee?.name && (
            <VStack spacing={2} align="center" minW="200px">
              <HStack spacing={2}>
                <Icon as={FiUser} color="green.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="700" color={headingColor} textAlign="center">
                  👨‍⚖️ {matchData.referee.name}
                </Text>
              </HStack>
              <Text fontSize="sm" color={textColor} textAlign="center">
                Match Referee
              </Text>
            </VStack>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default EnhancedMatchHeaderFooty;
