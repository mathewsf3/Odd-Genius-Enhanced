import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Button,
  Spinner,
  Divider,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { BiFootball, BiTrophy } from 'react-icons/bi';
import { BsGraphUp, BsBarChart } from 'react-icons/bs';
import { Match } from '../api/soccerApiService';
import soccerApiService from '../api/soccerApiService';
import MatchCard from '../components/matches/MatchCard';


const LeagueAnalysis: React.FC = () => {
  const { leagueName } = useParams<{ leagueName: string }>();
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string | null>(null);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const topBgColor = useColorModeValue('blue.50', 'blue.900');

  // Fetch match data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLiveLoading(true);
        const liveData = await soccerApiService.getLiveMatches();
        setLiveMatches(liveData || []);
      } catch (error) {
        console.error('Error fetching live matches:', error);
        setLiveMatches([]);
      } finally {
        setLiveLoading(false);
      }

      try {
        setUpcomingLoading(true);
        const upcomingData = await soccerApiService.getUpcomingMatches();
        setUpcomingMatches(upcomingData || []);
      } catch (error) {
        console.error('Error fetching upcoming matches:', error);
        setUpcomingMatches([]);
      } finally {
        setUpcomingLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter matches for this league only
  const leagueMatches = [...liveMatches, ...upcomingMatches].filter(match =>
    match.league.name === leagueName
  );

  // Get league logo from the first match
  useEffect(() => {
    if (leagueMatches.length > 0 && leagueMatches[0].league.logo) {
      setLogo(leagueMatches[0].league.logo);
    }
  }, [leagueMatches]);

  // Calculate league statistics
  const liveLeagueMatches = liveMatches.filter(match => match.league.name === leagueName);
  const upcomingLeagueMatches = upcomingMatches.filter(match => match.league.name === leagueName);
  const totalMatches = liveLeagueMatches.length + upcomingLeagueMatches.length;
  const recommendedMatches = leagueMatches.filter(match => match.recommended).length;

  // Mock team standings data (in a real app, this would come from an API)
  const mockTeamStandings = Array(6).fill(0).map((_, i) => ({
    position: i + 1,
    teamName: `Team ${i + 1}`,
    played: 10 + Math.floor(Math.random() * 5),
    won: 5 + Math.floor(Math.random() * 5),
    drawn: Math.floor(Math.random() * 5),
    lost: Math.floor(Math.random() * 5),
    goalDifference: Math.floor(Math.random() * 20) - 5,
    points: 15 + Math.floor(Math.random() * 30)
  })).sort((a, b) => b.points - a.points);

  // Calculate recent form based on recommended picks
  const recentForm = leagueMatches.filter(match => match.recommended).length > 0
    ? 'Strong'
    : 'Average';

  if (liveLoading || upcomingLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" direction="column" my={16}>
          <Spinner size="xl" thickness="4px" color="purple.500" mb={4} />
          <Text>Loading league data...</Text>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header with back button */}
      <Flex align="center" mb={8}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          onClick={() => navigate(-1)}
          mr={3}
        >
          Back
        </Button>

        <Flex align="center">
          {logo && (
            <Image
              src={logo}
              boxSize="48px"
              mr={4}
              fallbackSrc="https://via.placeholder.com/48"
              borderRadius="full"
            />
          )}
          <Box>
            <Heading size="lg">{decodeURIComponent(leagueName || '')}</Heading>
            <Text color="gray.500">League Analysis Dashboard</Text>
          </Box>
        </Flex>
      </Flex>

      {/* League stats summary */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Stat p={4} bg={bgColor} borderRadius="lg" boxShadow="md">
          <Flex align="center">
            <Box
              p={2}
              bg="blue.100"
              borderRadius="md"
              display="inline-block"
              mr={3}
            >
              <Icon as={BiFootball} color="blue.500" boxSize={5} />
            </Box>
            <Box>
              <StatLabel>Live & Upcoming</StatLabel>
              <StatNumber>{totalMatches}</StatNumber>
              <StatHelpText>Matches in this league</StatHelpText>
            </Box>
          </Flex>
        </Stat>

        <Stat p={4} bg={bgColor} borderRadius="lg" boxShadow="md">
          <Flex align="center">
            <Box
              p={2}
              bg="purple.100"
              borderRadius="md"
              display="inline-block"
              mr={3}
            >
              <Icon as={BsGraphUp} color="purple.500" boxSize={5} />
            </Box>
            <Box>
              <StatLabel>Recommended</StatLabel>
              <StatNumber>{recommendedMatches}</StatNumber>
              <StatHelpText>Picks available</StatHelpText>
            </Box>
          </Flex>
        </Stat>

        <Stat p={4} bg={bgColor} borderRadius="lg" boxShadow="md">
          <Flex align="center">
            <Box
              p={2}
              bg="green.100"
              borderRadius="md"
              display="inline-block"
              mr={3}
            >
              <Icon as={BiTrophy} color="green.500" boxSize={5} />
            </Box>
            <Box>
              <StatLabel>League Form</StatLabel>
              <StatNumber>{recentForm}</StatNumber>
              <StatHelpText>Recent performance</StatHelpText>
            </Box>
          </Flex>
        </Stat>
      </SimpleGrid>

      {/* League Table */}
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="md"
        mb={8}
        overflow="hidden"
      >
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <Heading size="md">League Table</Heading>
        </Box>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Team</Th>
              <Th isNumeric>P</Th>
              <Th isNumeric>W</Th>
              <Th isNumeric>D</Th>
              <Th isNumeric>L</Th>
              <Th isNumeric>GD</Th>
              <Th isNumeric>Pts</Th>
            </Tr>
          </Thead>          <Tbody>
            {(() => {
              // Using topBgColor from component scope
              return mockTeamStandings.map((team, index) => {
                // Use the color mode value directly from outside the callback
                const bgColor = index < 4 ? topBgColor : undefined;

                return (
                  <Tr key={index} bg={bgColor}>
                    <Td>{team.position}</Td>
                    <Td>{team.teamName}</Td>
                    <Td isNumeric>{team.played}</Td>
                    <Td isNumeric>{team.won}</Td>
                    <Td isNumeric>{team.drawn}</Td>
                    <Td isNumeric>{team.lost}</Td>
                    <Td isNumeric>{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</Td>
                    <Td isNumeric fontWeight="bold">{team.points}</Td>
                  </Tr>
                );
              });
            })()}
          </Tbody>
        </Table>
      </Box>

      {/* League Matches */}
      <Box mb={8}>
        <Heading size="md" mb={4}>League Matches</Heading>

        {/* Live Matches */}
        {liveLeagueMatches.length > 0 && (
          <>
            <Box mb={4}>
              <Text fontWeight="bold" color="red.500" mb={2}>Live Matches</Text>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {liveLeagueMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={{
                      ...match,
                      status: 'LIVE',
                      elapsed: match.elapsed || '45'
                    } as Match}
                    onClick={() => navigate(`/match/${match.id}`)}
                    useModernDesign={false}
                  />
                ))}
              </SimpleGrid>
            </Box>
            <Divider my={6} />
          </>
        )}

        {/* Upcoming Matches */}
        {upcomingLeagueMatches.length > 0 && (
          <>
            <Box>
              <Text fontWeight="bold" color="blue.500" mb={2}>Upcoming Matches</Text>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {upcomingLeagueMatches.slice(0, 6).map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => navigate(`/match/${match.id}`)}
                    useModernDesign={false}
                  />
                ))}
              </SimpleGrid>
            </Box>
          </>
        )}

        {liveLeagueMatches.length === 0 && upcomingLeagueMatches.length === 0 && (
          <Flex justify="center" p={8} bg="gray.50" borderRadius="md">
            <Text>No matches are currently available for this league</Text>
          </Flex>
        )}
      </Box>
    </Container>
  );
};

export default LeagueAnalysis;
