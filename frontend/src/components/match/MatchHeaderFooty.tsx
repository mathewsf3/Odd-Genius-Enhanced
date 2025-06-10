import React from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Image,
  useColorModeValue,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { 
  FiClock, 
  FiMapPin, 
  FiUser,
  FiTrendingUp,
  FiTarget,
  FiFlag
} from 'react-icons/fi';

interface MatchHeaderFootyProps {
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
    status: string;
    date: string;
    score: {
      home: number;
      away: number;
      total: number;
    };
    potentials?: {
      btts?: number;
      over25?: number;
      corners?: number;
      cards?: number;
    };
    league?: {
      name?: string;
    };
    stadium?: {
      name?: string;
      location?: string;
    };
    referee?: {
      name?: string;
    };
  };
}

const MatchHeaderFooty: React.FC<MatchHeaderFootyProps> = ({ match }) => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const statBg = useColorModeValue('gray.50', 'gray.700');

  // Team logo component with fallback
  const TeamLogo: React.FC<{ team: { name: string; logo?: string }, size?: string }> = ({
    team,
    size = "80px"
  }) => {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name.substring(0, 2))}&background=6366F1&color=FFFFFF&bold=true&size=128`;

    return (
      <Image
        src={team.logo || fallbackUrl}
        alt={team.name}
        boxSize={size}
        objectFit="contain"
        fallbackSrc={fallbackUrl}
        borderRadius="lg"
        border="2px solid"
        borderColor={borderColor}
        p={2}
        backgroundColor="white"
        boxShadow="md"
      />
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date not available';
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'complete':
      case 'ft':
        return 'green';
      case 'live':
      case '1h':
      case '2h':
        return 'red';
      case 'upcoming':
      case 'scheduled':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      boxShadow="lg"
    >
      {/* Header with league and status */}
      <Box
        bg={useColorModeValue('blue.50', 'blue.900')}
        px={6}
        py={4}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color={textColor} fontWeight="medium">
              {match.league?.name || 'League not available'}
            </Text>
            <HStack spacing={2}>
              <Icon as={FiClock} color={textColor} />
              <Text fontSize="sm" color={textColor}>
                {formatDate(match.date)}
              </Text>
            </HStack>
          </VStack>
          
          <Badge
            colorScheme={getStatusColor(match.status)}
            variant="solid"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            fontWeight="bold"
          >
            {match.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </Flex>
      </Box>

      {/* Main match info */}
      <Box p={6}>
        <Flex align="center" justify="space-between" mb={6}>
          {/* Home Team */}
          <VStack spacing={3} flex={1} align="center">
            <TeamLogo team={match.homeTeam} />
            <VStack spacing={1}>
              <Heading size="md" textAlign="center" color={headingColor}>
                {match.homeTeam.name}
              </Heading>
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Home
              </Text>
            </VStack>
          </VStack>

          {/* Score */}
          <VStack spacing={2} mx={8}>
            <HStack spacing={4}>
              <Box
                bg={statBg}
                borderRadius="xl"
                px={6}
                py={4}
                textAlign="center"
                minW="60px"
              >
                <Text fontSize="3xl" fontWeight="bold" color={headingColor}>
                  {match.score.home}
                </Text>
              </Box>
              
              <Text fontSize="2xl" color={textColor} fontWeight="bold">
                -
              </Text>
              
              <Box
                bg={statBg}
                borderRadius="xl"
                px={6}
                py={4}
                textAlign="center"
                minW="60px"
              >
                <Text fontSize="3xl" fontWeight="bold" color={headingColor}>
                  {match.score.away}
                </Text>
              </Box>
            </HStack>
            
            <Text fontSize="sm" color={textColor}>
              Total Goals: {match.score.total}
            </Text>
          </VStack>

          {/* Away Team */}
          <VStack spacing={3} flex={1} align="center">
            <TeamLogo team={match.awayTeam} />
            <VStack spacing={1}>
              <Heading size="md" textAlign="center" color={headingColor}>
                {match.awayTeam.name}
              </Heading>
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Away
              </Text>
            </VStack>
          </VStack>
        </Flex>

        <Divider mb={6} />

        {/* Match details */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
          {match.stadium?.name && (
            <HStack spacing={2}>
              <Icon as={FiMapPin} color={textColor} />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                  {match.stadium.name}
                </Text>
                {match.stadium.location && (
                  <Text fontSize="xs" color={textColor}>
                    {match.stadium.location}
                  </Text>
                )}
              </VStack>
            </HStack>
          )}

          {match.referee?.name && (
            <HStack spacing={2}>
              <Icon as={FiUser} color={textColor} />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                  Referee
                </Text>
                <Text fontSize="xs" color={textColor}>
                  {match.referee.name}
                </Text>
              </VStack>
            </HStack>
          )}

          <HStack spacing={2}>
            <Icon as={FiFlag} color={textColor} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                Match ID
              </Text>
              <Text fontSize="xs" color={textColor}>
                {match.id}
              </Text>
            </VStack>
          </HStack>
        </SimpleGrid>

        {/* Pre-match potentials */}
        {match.potentials && (
          <>
            <Divider mb={4} />
            <Box>
              <Heading size="sm" mb={3} color={headingColor}>
                Pre-Match Potentials
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {match.potentials.btts !== undefined && (
                  <Tooltip label="Both Teams To Score probability">
                    <Stat bg={statBg} p={3} borderRadius="lg">
                      <StatLabel fontSize="xs">BTTS</StatLabel>
                      <StatNumber fontSize="lg">
                        {(match.potentials.btts * 100).toFixed(1)}%
                      </StatNumber>
                    </Stat>
                  </Tooltip>
                )}

                {match.potentials.over25 !== undefined && (
                  <Tooltip label="Over 2.5 Goals probability">
                    <Stat bg={statBg} p={3} borderRadius="lg">
                      <StatLabel fontSize="xs">O2.5</StatLabel>
                      <StatNumber fontSize="lg">
                        {(match.potentials.over25 * 100).toFixed(1)}%
                      </StatNumber>
                    </Stat>
                  </Tooltip>
                )}

                {match.potentials.corners !== undefined && (
                  <Tooltip label="Expected corners average">
                    <Stat bg={statBg} p={3} borderRadius="lg">
                      <StatLabel fontSize="xs">Corners</StatLabel>
                      <StatNumber fontSize="lg">
                        {match.potentials.corners.toFixed(1)}
                      </StatNumber>
                    </Stat>
                  </Tooltip>
                )}

                {match.potentials.cards !== undefined && (
                  <Tooltip label="Expected cards average">
                    <Stat bg={statBg} p={3} borderRadius="lg">
                      <StatLabel fontSize="xs">Cards</StatLabel>
                      <StatNumber fontSize="lg">
                        {match.potentials.cards.toFixed(1)}
                      </StatNumber>
                    </Stat>
                  </Tooltip>
                )}
              </SimpleGrid>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MatchHeaderFooty;
