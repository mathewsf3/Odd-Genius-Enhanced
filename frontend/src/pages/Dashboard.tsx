// @ts-nocheck
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchList from '../components/matches/MatchList';
import { useQueryClient } from 'react-query';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Icon,
  useColorModeValue,
  useToast,
  Badge,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import { FiCalendar, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { BsLightningFill, BsGraphUp } from 'react-icons/bs';

import { Match } from '../api/soccerApiService';
import soccerApiService from '../api/soccerApiService';


interface PerformanceData {
  date: string;
  wins: number;
  losses: number;
  voids: number;
  profit: number;
}

interface BookmakerOdds {
  bookmaker: string;
  home: number;
  draw: number;
  away: number;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const upcomingMatchesContainerRef = useRef<HTMLDivElement>(null);
  const [upcomingMatchesWidth, setUpcomingMatchesWidth] = useState(0);
  const toast = useToast();
  const navigate = useNavigate();

  // State for data
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [premiumPicks, setPremiumPicks] = useState<Match[]>([]);

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [bookmakerOdds, setBookmakerOdds] = useState<Record<string, BookmakerOdds[]>>({});

  // Loading states
  const [loading, setLoading] = useState({
    live: true,
    upcoming: true,
    stats: true,
    premium: true,
  });

  // Fetch functions
  const fetchLiveMatches = async () => {
    try {
      setLoading(prev => ({ ...prev, live: true }));
      const data = await soccerApiService.getLiveMatches();
      setLiveMatches(data || []);
    } catch (error) {
      console.error('Error fetching live matches:', error);
      setLiveMatches([]);
    } finally {
      setLoading(prev => ({ ...prev, live: false }));
    }
  };

  const fetchUpcomingMatches = async () => {
    try {
      setLoading(prev => ({ ...prev, upcoming: true }));
      const data = await soccerApiService.getUpcomingMatches();
      setUpcomingMatches(data || []);
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      setUpcomingMatches([]);
    } finally {
      setLoading(prev => ({ ...prev, upcoming: false }));
    }
  };

  const fetchPremiumPicks = async () => {
    try {
      setLoading(prev => ({ ...prev, premium: true }));
      const data = await soccerApiService.getPremiumPicks();
      setPremiumPicks(data || []);
    } catch (error) {
      console.error('Error fetching premium picks:', error);
      setPremiumPicks([]);
    } finally {
      setLoading(prev => ({ ...prev, premium: false }));
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchLiveMatches(),
        fetchUpcomingMatches(),
        fetchPremiumPicks()
      ]);
      toast({
        title: "Data refreshed",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error refreshing data",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Initial data load
  useEffect(() => {
    fetchLiveMatches();
    fetchUpcomingMatches();
    fetchPremiumPicks();
  }, []);

  // Debug logging for API responses
  console.log('Live Matches:', {
    isLoading: loading.live,
    dataLength: liveMatches.length,
    data: liveMatches
  });

  console.log('Upcoming Matches:', {
    isLoading: loading.upcoming,
    dataLength: upcomingMatches.length,
    data: upcomingMatches
  });

  // Process matches for display
  const displayedLiveMatches = useMemo(() => {
    const matches = [...liveMatches];
    matches.sort((a, b) => {
      if (!a.minute && !b.minute) return 0;
      if (!a.minute) return 1;
      if (!b.minute) return -1;
      return Number(b.minute) - Number(a.minute);
    });
    return matches.slice(0, 6);
  }, [liveMatches]);

  const displayedUpcomingMatches = useMemo(() => {
    const matches = [...upcomingMatches];
    matches.sort((a, b) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
    return matches.slice(0, 6);
  }, [upcomingMatches]);

  useEffect(() => {
    if (upcomingMatchesContainerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setUpcomingMatchesWidth(entry.contentRect.width);
        }
      });

      observer.observe(upcomingMatchesContainerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const totalMatches = liveMatches.length + upcomingMatches.length;
  const liveMatchesCount = liveMatches.length;
  const analyzedMatchesCount = liveMatches.filter(match => match.recommended).length +
    upcomingMatches.filter(match => match.recommended).length;

  const handleMatchClick = useCallback((matchId: string) => {
    navigate(`/match/${matchId}`);
  }, [navigate]);

  // Theme styling
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentBlue = useColorModeValue('blue.500', 'blue.400');
  const accentRed = useColorModeValue('red.500', 'red.400');
  const accentGreen = useColorModeValue('green.500', 'green.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      width="full"
      height="full"
      bg={bgColor}
      py={6}
      px={6}
      backgroundImage={`radial-gradient(circle at 25px 25px, ${useColorModeValue('gray.100', 'gray.800')} 2%, transparent 0%),
                        radial-gradient(circle at 75px 75px, ${useColorModeValue('gray.100', 'gray.800')} 2%, transparent 0%)`}
      backgroundSize="100px 100px"
    >
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        bg={cardBg}
        p={4}
        borderRadius="xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading
          size="lg"
          bgGradient={`linear(to-r, ${accentBlue}, ${accentGreen})`}
          bgClip="text"
          fontWeight="bold"
        >
          Dashboard
        </Heading>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={handleRefresh}
          isLoading={loading.live || loading.upcoming}
          colorScheme="blue"
          size="md"
          px={6}
          borderRadius="lg"
          boxShadow="sm"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "md"
          }}
          transition="all 0.2s"
        >
          Refresh
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={6} mb={8}>
        <Box
          p={5}
          boxShadow="lg"
          borderWidth="1px"
          borderRadius="xl"
          bg={cardBg}
          borderColor={borderColor}
          position="relative"
          overflow="hidden"
          transition="all 0.3s"
          _hover={{
            transform: 'translateY(-5px)',
            boxShadow: 'xl',
            borderColor: 'blue.200'
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            bg="blue.50"
            w="100px"
            h="100px"
            borderRadius="full"
            opacity="0.6"
            zIndex={0}
          />
          <Flex justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
            <Stack spacing={1}>
              <Text fontSize="sm" color={textColor} fontWeight="medium">Total Matches</Text>
              <Text fontSize="3xl" fontWeight="bold" color={headingColor}>{totalMatches}</Text>
              <Text fontSize="xs" color="blue.500" fontWeight="medium">All competitions</Text>
            </Stack>
            <Flex
              boxSize="50px"
              borderRadius="lg"
              bg="blue.50"
              color={accentBlue}
              align="center"
              justify="center"
              boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            >
              <Icon as={FiCalendar} boxSize={6} />
            </Flex>
          </Flex>
        </Box>

        <Box
          p={5}
          boxShadow="lg"
          borderWidth="1px"
          borderRadius="xl"
          bg={cardBg}
          borderColor={borderColor}
          borderLeftWidth="4px"
          borderLeftColor="red.400"
          position="relative"
          overflow="hidden"
          transition="all 0.3s"
          _hover={{
            transform: 'translateY(-5px)',
            boxShadow: 'xl',
            borderColor: 'red.200'
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            bg="red.50"
            w="100px"
            h="100px"
            borderRadius="full"
            opacity="0.6"
            zIndex={0}
          />
          <Flex justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
            <Stack spacing={1}>
              <Text fontSize="sm" color={textColor} fontWeight="medium">Live Matches</Text>
              <Text fontSize="3xl" fontWeight="bold" color={headingColor}>{liveMatchesCount}</Text>
              {liveMatchesCount > 0 ? (
                <Badge
                  colorScheme="red"
                  alignSelf="flex-start"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  boxShadow="0 0 10px rgba(245, 101, 101, 0.5)"
                  animation="pulse 2s infinite"
                  sx={{
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 0 0 rgba(245, 101, 101, 0.6)' },
                      '70%': { boxShadow: '0 0 0 10px rgba(245, 101, 101, 0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(245, 101, 101, 0)' }
                    }
                  }}
                >
                  Live Now
                </Badge>
              ) : (
                <Text fontSize="xs" color={textColor}>No matches in progress</Text>
              )}
            </Stack>
            <Flex
              boxSize="50px"
              borderRadius="lg"
              bg="red.50"
              color={accentRed}
              align="center"
              justify="center"
              boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            >
              <Icon as={BsLightningFill} boxSize={5} />
            </Flex>
          </Flex>
        </Box>

        <Box
          p={5}
          boxShadow="lg"
          borderWidth="1px"
          borderRadius="xl"
          bg={cardBg}
          borderColor={borderColor}
          borderLeftWidth="4px"
          borderLeftColor="green.400"
          position="relative"
          overflow="hidden"
          transition="all 0.3s"
          _hover={{
            transform: 'translateY(-5px)',
            boxShadow: 'xl',
            borderColor: 'green.200'
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            bg="green.50"
            w="100px"
            h="100px"
            borderRadius="full"
            opacity="0.6"
            zIndex={0}
          />
          <Flex justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
            <Stack spacing={1}>
              <Text fontSize="sm" color={textColor} fontWeight="medium">Analyzed Matches</Text>
              <Text fontSize="3xl" fontWeight="bold" color={headingColor}>{analyzedMatchesCount}</Text>
              <Text fontSize="xs" color="green.500" fontWeight="medium">+12% from yesterday</Text>
            </Stack>
            <Flex
              boxSize="50px"
              borderRadius="lg"
              bg="green.50"
              color={accentGreen}
              align="center"
              justify="center"
              boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            >
              <Icon as={BsGraphUp} boxSize={6} />
            </Flex>
          </Flex>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={1} spacing={6}>
        <Box
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Flex
            bg={useColorModeValue('rgba(254, 215, 215, 0.3)', 'rgba(229, 62, 62, 0.1)')}
            py={4}
            px={5}
            justify="space-between"
            align="center"
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
          >
            <Flex align="center">
              <Flex
                boxSize="36px"
                bg={useColorModeValue('red.500', 'red.500')}
                color="white"
                borderRadius="lg"
                justify="center"
                align="center"
                mr={3}
                boxShadow="0 4px 6px rgba(229, 62, 62, 0.2)"
              >
                <Icon as={BsLightningFill} boxSize={5} />
              </Flex>
              <Heading size="md" display="flex" alignItems="center">
                Live Matches
                <Badge
                  ml={2}
                  colorScheme="red"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                >
                  {displayedLiveMatches.length}
                </Badge>
              </Heading>
            </Flex>
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={() => navigate('/live')}
              rightIcon={<FiArrowRight />}
              _hover={{
                bg: 'red.50',
                transform: 'translateX(2px)'
              }}
              transition="all 0.2s"
            >
              See All
            </Button>
          </Flex>

          <Box p={5}>
            <MatchList
              matches={displayedLiveMatches}
              isLoading={loading.live}
              onRefresh={handleRefresh}
              onMatchClick={handleMatchClick}
              color="red.400"
              showPremiumBadge={true}
            />
          </Box>
        </Box>

        <Box
          ref={upcomingMatchesContainerRef}
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Flex
            bg={useColorModeValue('rgba(198, 246, 213, 0.3)', 'rgba(56, 161, 105, 0.1)')}
            py={4}
            px={5}
            justify="space-between"
            align="center"
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
          >
            <Flex align="center">
              <Flex
                boxSize="36px"
                bg={useColorModeValue('green.500', 'green.500')}
                color="white"
                borderRadius="lg"
                justify="center"
                align="center"
                mr={3}
                boxShadow="0 4px 6px rgba(56, 161, 105, 0.2)"
              >
                <Icon as={FiCalendar} boxSize={5} />
              </Flex>
              <Heading size="md">
                Upcoming Matches
                <Badge
                  ml={2}
                  colorScheme="green"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                >
                  {displayedUpcomingMatches.length}
                </Badge>
              </Heading>
            </Flex>
            <Button
              size="sm"
              variant="outline"
              colorScheme="green"
              onClick={() => navigate('/upcoming')}
              rightIcon={<FiArrowRight />}
              _hover={{
                bg: 'green.50',
                transform: 'translateX(2px)'
              }}
              transition="all 0.2s"
            >
              See All
            </Button>
          </Flex>

          <Box p={5}>
            <MatchList
              matches={displayedUpcomingMatches}
              isLoading={loading.upcoming}
              onRefresh={handleRefresh}
              onMatchClick={handleMatchClick}
              color="green.400"
            />
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default React.memo(Dashboard);