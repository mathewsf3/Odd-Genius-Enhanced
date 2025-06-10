import React from 'react';
import {
  Box,
  Text,
  Flex,
  Badge,
  Image,
  useColorModeValue,
  VStack,
  HStack,
  Divider,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiClock, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import { BsLightningFill } from 'react-icons/bs';
import { Match } from '../../api/soccerApiService';

interface MatchCardProps {
  match: Match;
  onClick: () => void;
  useModernDesign?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick, useModernDesign = true }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const cardShadow = useColorModeValue(
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
  );
  const hoverShadow = useColorModeValue(
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
  );
  const leagueTextColor = useColorModeValue('gray.600', 'gray.400');
  const timeTextColor = useColorModeValue('gray.500', 'gray.500');

  const getStatusBadge = () => {
    if (match.status === 'LIVE' || match.status === '1H' || match.status === '2H') {
      return (
        <Badge variant="live" display="flex" alignItems="center" gap={1}>
          <Icon as={BsLightningFill} boxSize="3" />
          LIVE
        </Badge>
      );
    }
    if (match.status === 'FT') {
      return <Badge variant="finished">FINISHED</Badge>;
    }
    if (match.status === 'NS') {
      return (
        <Badge variant="upcoming" display="flex" alignItems="center" gap={1}>
          <Icon as={FiClock} boxSize="3" />
          {match.time}
        </Badge>
      );
    }
    return <Badge variant="outline">{match.status}</Badge>;
  };

  const isLive = match.status === 'LIVE' || match.status === '1H' || match.status === '2H';
  const isFinished = match.status === 'FT';

  const renderTeamLogo = (logoUrl: string, teamName: string, size: string = "32px") => {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName.substring(0, 2))}&background=6366F1&color=FFFFFF&bold=true&size=128`;

    return (
      <Image
        src={logoUrl || fallbackUrl}
        alt={teamName}
        boxSize={size}
        objectFit="contain"
        fallbackSrc={fallbackUrl}
        borderRadius="md"
        border="1px solid"
        borderColor={borderColor}
        p={1}
        backgroundColor="white"
        boxShadow="sm"
      />
    );
  };

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={5}
      cursor="pointer"
      onClick={onClick}
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-4px)',
        boxShadow: hoverShadow,
        borderColor: isLive ? 'live.300' : 'upcoming.300'
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      boxShadow={cardShadow}
      position="relative"
      overflow="hidden"
      role="button"
      tabIndex={0}
      _focus={{
        outline: 'none',
        boxShadow: `${cardShadow}, 0 0 0 3px rgba(139, 92, 246, 0.1)`,
      }}
    >
      {/* Gradient overlay for live matches */}
      {isLive && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="3px"
          bgGradient="linear(to-r, live.400, live.600)"
        />
      )}

      {/* Header: League and Status */}
      <Flex justify="space-between" align="center" mb={4}>
        <Tooltip label={match.league.name} placement="top">
          <Text
            fontSize="sm"
            color={leagueTextColor}
            fontWeight="600"
            noOfLines={1}
            maxW="60%"
          >
            {match.league.name}
          </Text>
        </Tooltip>
        {getStatusBadge()}
      </Flex>

      {/* Teams Section */}
      <VStack spacing={3} align="stretch">
        {/* Home Team */}
        <Flex align="center" justify="space-between">
          <HStack spacing={3} flex={1} minW={0}>
            {renderTeamLogo(match.homeTeam.logo, match.homeTeam.name)}
            <VStack align="start" spacing={0} flex={1} minW={0}>
              <Text
                fontWeight="600"
                fontSize="md"
                noOfLines={1}
                color={useColorModeValue('gray.800', 'gray.100')}
              >
                {match.homeTeam.name}
              </Text>
              <Text fontSize="xs" color={leagueTextColor}>
                Home
              </Text>
            </VStack>
          </HStack>
          {match.score && (
            <Box
              bg={isLive ? 'live.50' : 'gray.50'}
              borderRadius="lg"
              px={3}
              py={2}
              minW="40px"
              textAlign="center"
            >
              <Text
                fontWeight="800"
                fontSize="xl"
                color={isLive ? 'live.600' : 'gray.700'}
              >
                {match.score.home}
              </Text>
            </Box>
          )}
        </Flex>

        {/* VS Divider */}
        <Flex align="center" justify="center" py={1}>
          <Divider />
          <Text
            px={3}
            fontSize="xs"
            fontWeight="600"
            color={leagueTextColor}
            bg={bg}
          >
            VS
          </Text>
          <Divider />
        </Flex>

        {/* Away Team */}
        <Flex align="center" justify="space-between">
          <HStack spacing={3} flex={1} minW={0}>
            {renderTeamLogo(match.awayTeam.logo, match.awayTeam.name)}
            <VStack align="start" spacing={0} flex={1} minW={0}>
              <Text
                fontWeight="600"
                fontSize="md"
                noOfLines={1}
                color={useColorModeValue('gray.800', 'gray.100')}
              >
                {match.awayTeam.name}
              </Text>
              <Text fontSize="xs" color={leagueTextColor}>
                Away
              </Text>
            </VStack>
          </HStack>
          {match.score && (
            <Box
              bg={isLive ? 'live.50' : 'gray.50'}
              borderRadius="lg"
              px={3}
              py={2}
              minW="40px"
              textAlign="center"
            >
              <Text
                fontWeight="800"
                fontSize="xl"
                color={isLive ? 'live.600' : 'gray.700'}
              >
                {match.score.away}
              </Text>
            </Box>
          )}
        </Flex>
      </VStack>

      {/* Footer: Match Time/Date and Analytics Button */}
      <Flex justify="space-between" align="center" mt={4} pt={3} borderTop="1px solid" borderColor={borderColor}>
        <HStack spacing={2}>
          <Icon as={FiClock} boxSize="3" color={timeTextColor} />
          <Text fontSize="xs" color={timeTextColor} fontWeight="500">
            {match.status === 'NS' ? `${match.date} ${match.time}` :
             isLive ? 'Live Now' :
             isFinished ? 'Full Time' : match.status}
          </Text>
        </HStack>
        <Tooltip label="View detailed analysis" placement="top">
          <Box>
            <Icon
              as={FiTrendingUp}
              boxSize="4"
              color={useColorModeValue('brand.500', 'brand.400')}
              _hover={{ color: useColorModeValue('brand.600', 'brand.300') }}
              transition="color 0.2s"
            />
          </Box>
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default MatchCard;
