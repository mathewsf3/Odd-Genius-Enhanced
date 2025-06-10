import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Heading,
  VStack,
  HStack,
  Input,
  Select,
  Center,
  useColorModeValue
} from '@chakra-ui/react';

interface League {
  id: string;
  name: string;
  country: string;
  logo?: string;
  type?: string;
  season?: number;
}

const LeaguesTab: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [filteredLeagues, setFilteredLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    let filtered = leagues;

    if (searchTerm) {
      filtered = filtered.filter(league =>
        league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        league.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(league => league.country === selectedCountry);
    }

    setFilteredLeagues(filtered);
  }, [searchTerm, selectedCountry, leagues]);

  const countries = [...new Set(leagues.map(l => l.country))].sort();

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leagues');

      if (!response.ok) {
        throw new Error('Failed to fetch leagues');
      }

      const data = await response.json();
      setLeagues(data);
      setFilteredLeagues(data);
    } catch (err: any) {
      console.error('Error fetching leagues:', err);
      setError(err.message || 'Failed to load leagues');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text>Loading leagues...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Error loading leagues</Text>
          <Text fontSize="sm">{error}</Text>
        </Box>
      </Alert>
    );
  }

  if (leagues.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Text>No leagues available. The API may be loading or there might be a connection issue.</Text>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch" mb={6}>
        <Heading size="md">
          Football Leagues ({filteredLeagues.length} {filteredLeagues.length !== leagues.length && `of ${leagues.length}`})
        </Heading>

        <HStack spacing={4}>
          <Input
            placeholder="Search leagues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
          <Select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            maxW="200px"
          >
            <option value="all">All Countries ({countries.length})</option>
            {countries.map(country => (
              <option key={country} value={country}>
                {country} ({leagues.filter(l => l.country === country).length})
              </option>
            ))}
          </Select>
        </HStack>
      </VStack>

      <SimpleGrid columns={[1, 2, 3, 4, 5]} spacing={4}>
        {filteredLeagues.slice(0, 100).map((league) => (
          <Card
            key={league.id}
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            cursor="pointer"
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'lg',
              borderColor: 'blue.400'
            }}
            transition="all 0.2s"
          >
            <CardBody p={4}>
              <VStack align="stretch" spacing={2}>
                <Text fontWeight="bold" fontSize="sm" noOfLines={2} minH="2.5em">
                  {league.name}
                </Text>
                <HStack wrap="wrap" spacing={2}>
                  <Badge colorScheme="blue" fontSize="xs">
                    {league.country}
                  </Badge>
                  {league.type && (
                    <Badge colorScheme="green" fontSize="xs">
                      {league.type}
                    </Badge>
                  )}
                  {league.season && (
                    <Badge colorScheme="purple" fontSize="xs">
                      {league.season}
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {filteredLeagues.length > 100 && (
        <Text mt={4} fontSize="sm" color="gray.600" textAlign="center">
          Showing first 100 leagues. Use search to find specific leagues.
        </Text>
      )}
    </Box>
  );
};

export default LeaguesTab;