import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Image,
  Badge,
  Flex,
  useColorModeValue,
  Spinner,
  Tooltip,
  Divider,
  Icon,
  SimpleGrid
} from '@chakra-ui/react';
import { FiCalendar, FiMapPin, FiClock, FiTrendingUp } from 'react-icons/fi';
import { Match } from '../../types/interfaces';
import { TeamForm } from '../../services/teamFormService';
import Loader from '../common/Loader';

interface MatchHeaderProps {
  match: Match;
  homeTeamForm?: TeamForm | null;
  awayTeamForm?: TeamForm | null;
  isLoadingForm?: boolean;
}

const MatchHeader: React.FC<MatchHeaderProps> = ({
  match,
  homeTeamForm,
  awayTeamForm,
  isLoadingForm = false
}) => {
  // Enhanced color scheme for modern UI
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.800', 'white');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)');
  const accentBlue = useColorModeValue('blue.500', 'blue.300');
  const accentGreen = useColorModeValue('green.500', 'green.300');

  // Enhanced function to render form badges with better styling
  const renderFormBadges = (form: TeamForm | null | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <HStack spacing={2} align="center">
          <Icon as={FiTrendingUp} color={accentBlue} boxSize={3} />
          <Loader isOpen={true} inline={true} size="1.5rem" />
        </HStack>
      );
    }

    if (!form || !form.form || form.form.length === 0) {
      return (
        <HStack spacing={2} align="center">
          <Icon as={FiTrendingUp} color={subtleTextColor} boxSize={3} />
          <Text fontSize="xs" color={subtleTextColor} fontStyle="italic">
            No recent form
          </Text>
        </HStack>
      );
    }

    // Take only the last 5 matches for display
    // Form is already sorted by date DESC (most recent first) from the service
    const recentForm = form.form.slice(0, 5);

    return (
      <VStack spacing={1} align="center">
        <HStack spacing={1} align="center">
          <Icon as={FiTrendingUp} color={accentBlue} boxSize={3} />
          <Text fontSize="xs" color={subtleTextColor} fontWeight="medium">
            Recent Form (Latest → Oldest)
          </Text>
        </HStack>
        <HStack spacing={1}>
          {recentForm.map((result, index) => {
            const colorScheme =
              result.result === 'W' ? 'green' :
              result.result === 'L' ? 'red' : 'yellow';

            const bgColor =
              result.result === 'W' ? 'green.500' :
              result.result === 'L' ? 'red.500' : 'yellow.500';

            return (
              <Tooltip
                key={index}
                label={`${result.result === 'W' ? 'Victory' : result.result === 'L' ? 'Defeat' : 'Draw'} ${result.isHome ? '(H)' : '(A)'} vs ${result.opponent} - ${result.score} ${result.date ? `on ${result.date}` : ''}`}
                fontSize="xs"
                bg={bgColor}
                color="white"
                borderRadius="md"
                px={3}
                py={2}
                maxW="300px"
                textAlign="center"
              >
                <Box
                  bg={bgColor}
                  color="white"
                  fontSize="xs"
                  fontWeight="bold"
                  w="24px"
                  h="24px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="help"
                  transition="transform 0.2s, box-shadow 0.2s"
                  _hover={{
                    transform: 'scale(1.1)',
                    boxShadow: `0 4px 12px ${shadowColor}`
                  }}
                  boxShadow={`0 2px 4px ${shadowColor}`}
                >
                  {result.result}
                </Box>
              </Tooltip>
            );
          })}
        </HStack>
      </VStack>
    );
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      boxShadow={`0 8px 32px ${shadowColor}`}
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      position="relative"
    >
      {/* Gradient Header */}
      <Box
        bgGradient="linear(to-r, blue.500, purple.600)"
        p={6}
        color="white"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: 'linear(to-r, blue.600, purple.700)',
          opacity: 0.8,
          zIndex: 0
        }}
      >
        <VStack spacing={4} position="relative" zIndex={1}>
          {/* League Info */}
          <HStack spacing={2} align="center">
            <Icon as={FiCalendar} boxSize={4} />
            <Text fontSize="sm" fontWeight="medium" opacity={0.9}>
              {match.league.name}
            </Text>
          </HStack>

          {/* Main Match Title */}
          <Heading size="xl" textAlign="center" fontWeight="bold">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </Heading>

          {/* Match Details */}
          <HStack spacing={6} justify="center" flexWrap="wrap">
            {match.date && match.time && (
              <HStack spacing={2}>
                <Icon as={FiClock} boxSize={4} />
                <Text fontSize="sm" opacity={0.9}>
                  {match.date} {match.time}
                </Text>
              </HStack>
            )}
            {match.venue && (
              <HStack spacing={2}>
                <Icon as={FiMapPin} boxSize={4} />
                <Text fontSize="sm" opacity={0.9}>
                  {match.venue}
                </Text>
              </HStack>
            )}
          </HStack>

          {/* Match Status */}
          {match.status && (
            <Badge
              colorScheme={match.status === 'NS' ? 'blue' : match.status === 'FT' ? 'green' : 'orange'}
              variant="solid"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
              bg="whiteAlpha.200"
              color="white"
              border="1px solid"
              borderColor="whiteAlpha.300"
            >
              {match.status === 'NS' ? 'Not Started' :
               match.status === 'FT' ? 'Full Time' :
               match.status}
            </Badge>
          )}
        </VStack>
      </Box>

      {/* Teams Section */}
      <Box p={6}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="center">
          {/* Home Team */}
          <VStack spacing={4} align="center">
            <Box
              position="relative"
              p={4}
              bg={cardBg}
              borderRadius="xl"
              border="2px solid"
              borderColor="blue.200"
              boxShadow={`0 4px 12px ${shadowColor}`}
              transition="transform 0.2s, box-shadow 0.3s"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${shadowColor}`
              }}
              w="full"
              maxW="200px"
            >
              <Image
                src={match.homeTeam.logo || `https://ui-avatars.com/api/?name=${match.homeTeam.name.charAt(0)}&background=252535&color=6366F1&bold=true&size=128`}
                alt={match.homeTeam.name}
                boxSize="80px"
                mx="auto"
                borderRadius="lg"
                bg="white"
                p={2}
                border="1px solid"
                borderColor={borderColor}
                fallbackSrc={`https://ui-avatars.com/api/?name=${match.homeTeam.name.charAt(0)}&background=252535&color=6366F1&bold=true&size=128`}
                onError={(e) => {
                  console.log(`[MatchHeader][ERROR] Home team logo load error for ${match.homeTeam.name}:`, e);
                }}
              />
              <Text
                fontWeight="bold"
                fontSize="lg"
                textAlign="center"
                color={headingColor}
                mt={3}
                noOfLines={2}
              >
                {match.homeTeam.name}
              </Text>
              <Box display="flex" justifyContent="center" mt={2}>
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  HOME
                </Badge>
              </Box>
            </Box>
            {renderFormBadges(homeTeamForm, isLoadingForm)}
          </VStack>

          {/* VS Section */}
          <VStack spacing={4} align="center">
            <Box
              bg={cardBg}
              borderRadius="full"
              w="80px"
              h="80px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="2px solid"
              borderColor={borderColor}
              boxShadow={`0 4px 12px ${shadowColor}`}
            >
              <Text fontSize="2xl" fontWeight="bold" color={accentBlue}>
                VS
              </Text>
            </Box>

            {/* Score (if available) */}
            {match.score && (match.score.home > 0 || match.score.away > 0) && (
              <Box
                bg={accentGreen}
                color="white"
                px={6}
                py={3}
                borderRadius="xl"
                boxShadow={`0 4px 12px ${shadowColor}`}
                border="1px solid"
                borderColor="green.300"
              >
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                  {match.score.home} - {match.score.away}
                </Text>
              </Box>
            )}
          </VStack>

          {/* Away Team */}
          <VStack spacing={4} align="center">
            <Box
              position="relative"
              p={4}
              bg={cardBg}
              borderRadius="xl"
              border="2px solid"
              borderColor="red.200"
              boxShadow={`0 4px 12px ${shadowColor}`}
              transition="transform 0.2s, box-shadow 0.3s"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${shadowColor}`
              }}
              w="full"
              maxW="200px"
            >
              <Image
                src={match.awayTeam.logo || `https://ui-avatars.com/api/?name=${match.awayTeam.name.charAt(0)}&background=252535&color=6366F1&bold=true&size=128`}
                alt={match.awayTeam.name}
                boxSize="80px"
                mx="auto"
                borderRadius="lg"
                bg="white"
                p={2}
                border="1px solid"
                borderColor={borderColor}
                fallbackSrc={`https://ui-avatars.com/api/?name=${match.awayTeam.name.charAt(0)}&background=252535&color=6366F1&bold=true&size=128`}
                onError={(e) => {
                  console.log(`[MatchHeader][ERROR] Away team logo load error for ${match.awayTeam.name}:`, e);
                }}
              />
              <Text
                fontWeight="bold"
                fontSize="lg"
                textAlign="center"
                color={headingColor}
                mt={3}
                noOfLines={2}
              >
                {match.awayTeam.name}
              </Text>
              <Box display="flex" justifyContent="center" mt={2}>
                <Badge
                  colorScheme="red"
                  variant="subtle"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  AWAY
                </Badge>
              </Box>
            </Box>
            {renderFormBadges(awayTeamForm, isLoadingForm)}
          </VStack>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default MatchHeader;
