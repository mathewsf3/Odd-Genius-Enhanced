import React from 'react';
import { ChakraProvider, Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import LeaguesTab from '../components/leagues/LeaguesTab';
import { League } from '../services/leaguesService';

const TestLeaguesPage: React.FC = () => {
  const handleLeagueSelect = (league: League) => {
    console.log('Selected league:', league);
    alert(`Selected: ${league.name} (${league.country})`);
  };

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50">
        <Container maxW="7xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading size="xl" mb={4} color="blue.600">
                🚀 Leagues Tab Test Page
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Testing the new enhanced leagues implementation with real API data
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Check browser console for debugging information
              </Text>
            </Box>
            
            <LeaguesTab
              onLeagueSelect={handleLeagueSelect}
              showFilters={true}
              defaultView="grid"
              realTimeUpdates={true}
            />
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default TestLeaguesPage;
