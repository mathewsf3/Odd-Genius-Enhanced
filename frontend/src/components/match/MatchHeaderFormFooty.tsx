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
  StatHelpText,
  useColorModeValue,
  Icon,
  Flex,
  Avatar,
  Spinner
} from '@chakra-ui/react';
import { FiTrendingUp } from 'react-icons/fi';

interface MatchHeaderFormFootyProps {
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
  };
}

const MatchHeaderFormFooty: React.FC<MatchHeaderFormFootyProps> = ({ match }) => {
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
  const fetchFormData = async () => {
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
      console.error('Error fetching form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load form data on component mount
  useEffect(() => {
    fetchFormData();
  }, [match.homeTeam.id, match.awayTeam.id]);

  // Generate form string (WWLDW format) from team data
  const generateFormString = (teamData: any) => {
    if (!teamData?.data?.[0]?.last_matches) return '';

    const lastMatches = teamData.data[0].last_matches.slice(0, 5);
    return lastMatches.map((match: any) => {
      if (match.result === 'W') return 'W';
      if (match.result === 'L') return 'L';
      if (match.result === 'D') return 'D';
      return '?';
    }).join('');
  };

  if (isLoading) {
    return (
      <Box
        bg={cardBg}
        p={4}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        mb={4}
      >
        <Flex justify="center" align="center" py={4}>
          <Spinner size="sm" color="blue.500" mr={3} />
          <Text fontSize="sm" color={textColor}>Loading team form...</Text>
        </Flex>
      </Box>
    );
  }

  if (!homeTeamLastX || !awayTeamLastX) {
    return null;
  }

  const homeLastXData = homeTeamLastX.data?.[0];
  const awayLastXData = awayTeamLastX.data?.[0];

  return (
    <Box
      bg={cardBg}
      p={4}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      mb={4}
    >
      <Flex align="center" mb={4}>
        <Icon as={FiTrendingUp} color="green.500" mr={2} />
        <Heading size="sm" color={headingColor}>
          Recent Form (Last 5 Matches)
        </Heading>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Home Team Form */}
        <Flex align="center" justify="space-between">
          <Flex align="center">
            <Avatar size="sm" src={match.homeTeam.logo} name={match.homeTeam.name} mr={3} />
            <VStack spacing={0} align="start">
              <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                {match.homeTeam.name}
              </Text>
              <Text fontSize="xs" color={textColor}>
                {homeLastXData?.last5_ppg || 0} PPG
              </Text>
            </VStack>
          </Flex>

          <HStack spacing={1}>
            {homeLastXData?.last5?.split('').map((result: string, index: number) => (
              <Box
                key={index}
                w="24px"
                h="24px"
                borderRadius="full"
                bg={result === 'W' ? 'green.500' : result === 'D' ? 'yellow.500' : 'red.500'}
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                fontSize="xs"
              >
                {result}
              </Box>
            ))}
          </HStack>
        </Flex>

        {/* Away Team Form */}
        <Flex align="center" justify="space-between">
          <Flex align="center">
            <Avatar size="sm" src={match.awayTeam.logo} name={match.awayTeam.name} mr={3} />
            <VStack spacing={0} align="start">
              <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                {match.awayTeam.name}
              </Text>
              <Text fontSize="xs" color={textColor}>
                {awayLastXData?.last5_ppg || 0} PPG
              </Text>
            </VStack>
          </Flex>

          <HStack spacing={1}>
            {awayLastXData?.last5?.split('').map((result: string, index: number) => (
              <Box
                key={index}
                w="24px"
                h="24px"
                borderRadius="full"
                bg={result === 'W' ? 'green.500' : result === 'D' ? 'yellow.500' : 'red.500'}
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                fontSize="xs"
              >
                {result}
              </Box>
            ))}
          </HStack>
        </Flex>
      </SimpleGrid>

      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={4}>
        <Stat textAlign="center" bg={bgColor} p={2} borderRadius="md">
          <StatLabel fontSize="xs">Goals/Game</StatLabel>
          <StatNumber fontSize="sm" color="green.500">
            {(homeLastXData?.last5_scored_avg || 0).toFixed(1)} - {(awayLastXData?.last5_scored_avg || 0).toFixed(1)}
          </StatNumber>
        </Stat>

        <Stat textAlign="center" bg={bgColor} p={2} borderRadius="md">
          <StatLabel fontSize="xs">Conceded/Game</StatLabel>
          <StatNumber fontSize="sm" color="red.500">
            {(homeLastXData?.last5_conceded_avg || 0).toFixed(1)} - {(awayLastXData?.last5_conceded_avg || 0).toFixed(1)}
          </StatNumber>
        </Stat>

        <Stat textAlign="center" bg={bgColor} p={2} borderRadius="md">
          <StatLabel fontSize="xs">BTTS Rate</StatLabel>
          <StatNumber fontSize="sm" color="purple.500">
            {homeLastXData?.last5_btts_percentage || 0}% - {awayLastXData?.last5_btts_percentage || 0}%
          </StatNumber>
        </Stat>

        <Stat textAlign="center" bg={bgColor} p={2} borderRadius="md">
          <StatLabel fontSize="xs">Form Advantage</StatLabel>
          <StatNumber fontSize="sm" color={
            (homeLastXData?.last5_ppg || 0) > (awayLastXData?.last5_ppg || 0) ? 'green.500' :
            (homeLastXData?.last5_ppg || 0) < (awayLastXData?.last5_ppg || 0) ? 'red.500' : 'yellow.500'
          }>
            {(homeLastXData?.last5_ppg || 0) > (awayLastXData?.last5_ppg || 0) ? 'HOME' :
             (homeLastXData?.last5_ppg || 0) < (awayLastXData?.last5_ppg || 0) ? 'AWAY' : 'EVEN'}
          </StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default MatchHeaderFormFooty;
