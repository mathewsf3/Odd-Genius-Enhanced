import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Spinner,
  Center,
  Button,
  VStack,
} from '@chakra-ui/react';
import { Match } from '../../api/soccerApiService';
import MatchCard from './MatchCard';

interface MatchListProps {
  matches: Match[];
  isLoading: boolean;
  onRefresh: () => void;
  onMatchClick: (matchId: string) => void;
  color?: string;
  showPremiumBadge?: boolean;
}

const MatchList: React.FC<MatchListProps> = ({
  matches,
  isLoading,
  onRefresh,
  onMatchClick,
  color = "blue.500",
  showPremiumBadge = false,
}) => {
  if (isLoading) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="lg" color={color} />
          <Text color="gray.500">Loading matches...</Text>
        </VStack>
      </Center>
    );
  }

  if (matches.length === 0) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Text color="gray.500" fontSize="lg">
            No matches found
          </Text>
          <Button onClick={onRefresh} colorScheme="blue" variant="outline">
            Refresh
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onClick={() => onMatchClick(match.id)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default MatchList;
