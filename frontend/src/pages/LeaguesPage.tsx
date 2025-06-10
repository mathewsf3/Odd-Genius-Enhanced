import React from 'react';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import LeaguesTab from '../components/leagues/LeaguesTab';
import { League } from '../services/leaguesService';

const LeaguesPage: React.FC = () => {
  const handleLeagueSelect = (league: League) => {
    console.log('Selected league:', league);
    // Navigate to league details or matches
    // This could integrate with your routing system
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="7xl" py={8}>
        <Box mb={8} textAlign="center">
          <Heading size="xl" mb={4}>
            Football Leagues
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Explore live and upcoming football leagues from around the world
          </Text>
        </Box>
        
        <LeaguesTab
          onLeagueSelect={handleLeagueSelect}
          showFilters={true}
          defaultView="grid"
          realTimeUpdates={true}
        />
      </Container>
    </Box>
  );
};

export default LeaguesPage;
