import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Select,
  Flex,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data - in a real application, this would come from the API
const sampleData = [
  { date: 'Jan 1', profit: 120, wins: 5, losses: 2 },
  { date: 'Jan 8', profit: 50, wins: 3, losses: 4 },
  { date: 'Jan 15', profit: 180, wins: 6, losses: 1 },
  { date: 'Jan 22', profit: -40, wins: 2, losses: 5 },
  { date: 'Jan 29', profit: 100, wins: 4, losses: 3 },
  { date: 'Feb 5', profit: 220, wins: 7, losses: 2 },
  { date: 'Feb 12', profit: 80, wins: 4, losses: 3 },
];

const Performance: React.FC = () => {
  const [timeframe, setTimeframe] = useState('month');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Calculate summary metrics
  const totalProfit = sampleData.reduce((sum, data) => sum + data.profit, 0);
  const totalWins = sampleData.reduce((sum, data) => sum + data.wins, 0);
  const totalLosses = sampleData.reduce((sum, data) => sum + data.losses, 0);
  const winRate = totalWins / (totalWins + totalLosses) * 100;
  
  return (
    <Container maxW="container.xl" py={5}>
      <Heading mb={6}>Betting Performance</Heading>
      
      <Flex justify="space-between" align="center" mb={6}>
        <Text color="gray.500">Track your betting performance over time</Text>
        <Select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          width="150px"
          size="sm"
        >
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
        </Select>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={8}>
        <Box p={5} borderRadius="lg" boxShadow="md" bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <Stat>
            <StatLabel color="gray.500">Total Profit</StatLabel>
            <StatNumber color={totalProfit >= 0 ? "green.500" : "red.500"}>
              ${totalProfit.toFixed(2)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={totalProfit >= 0 ? "increase" : "decrease"} />
              {Math.abs(totalProfit / 10).toFixed(1)}% compared to previous period
            </StatHelpText>
          </Stat>
        </Box>
        
        <Box p={5} borderRadius="lg" boxShadow="md" bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <Stat>
            <StatLabel color="gray.500">Win Rate</StatLabel>
            <StatNumber>{winRate.toFixed(1)}%</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              5.2% compared to previous period
            </StatHelpText>
          </Stat>
        </Box>
        
        <Box p={5} borderRadius="lg" boxShadow="md" bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <Stat>
            <StatLabel color="gray.500">Wins</StatLabel>
            <StatNumber>{totalWins}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              3 more than previous period
            </StatHelpText>
          </Stat>
        </Box>
        
        <Box p={5} borderRadius="lg" boxShadow="md" bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <Stat>
            <StatLabel color="gray.500">Losses</StatLabel>
            <StatNumber>{totalLosses}</StatNumber>
            <StatHelpText>
              <StatArrow type="decrease" />
              2 less than previous period
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>
      
      <Box 
        mb={8} 
        p={5} 
        borderRadius="lg" 
        boxShadow="md" 
        bg={bgColor} 
        borderColor={borderColor} 
        borderWidth="1px" 
        height="400px"
      >
        <Heading size="md" mb={4}>Profit Trend</Heading>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#3182CE" 
              activeDot={{ r: 8 }} 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      
      <Text fontSize="sm" color="gray.500" textAlign="center">
        Note: This is a demo page with sample data. In the full version, this will display your actual betting performance.
      </Text>
    </Container>
  );
};

export default Performance;
