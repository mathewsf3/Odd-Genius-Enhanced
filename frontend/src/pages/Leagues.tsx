import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { BiTrophy } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import LeaguesTab from '../components/leagues/LeaguesTab';
import { League } from '../services/leaguesService';

const Leagues: React.FC = () => {
  const navigate = useNavigate();

  // Color mode values
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const handleLeagueSelect = (league: League) => {
    console.log('Selected league:', league);
    // Navigate to league analysis page
    navigate(`/league-analysis/${encodeURIComponent(league.name)}`, {
      state: { leagueId: league.id, leagueData: league }
    });
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" color={headingColor} mb={4}>
              <Icon as={BiTrophy} color="blue.500" mr={3} />
              Football Leagues
            </Heading>
            <Text fontSize="lg" color={textColor}>
              Discover live and upcoming football leagues from around the world
            </Text>
          </Box>

          {/* Enhanced Leagues Tab */}
          <LeaguesTab
            onLeagueSelect={handleLeagueSelect}
            showFilters={true}
            defaultView="grid"
            realTimeUpdates={true}
          />
        </VStack>
      </Container>
    </Box>
  );
};

export default Leagues;
