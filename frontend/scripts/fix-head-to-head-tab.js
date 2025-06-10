// A fix script to apply better data handling to HeadToHeadTab.tsx
const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, '../src/components/match/HeadToHeadTab.tsx');

// Read the file content
const fileContent = fs.readFileSync(filePath, 'utf8');

// Create backup
fs.writeFileSync(`${filePath}.backup`, fileContent, 'utf8');

// Fix the file content
// Main changes:
// 1. Add proper null/undefined checks
// 2. Use optional chaining and nullish coalescing operators
// 3. Handle edge cases where data might be missing or in unexpected formats

const updatedContent = fileContent
  // Fix adaptH2HData function to handle more data formats safely
  .replace(
    /const adaptH2HData[\s\S]*?return \{[\s\S]*?\};/g,
    `const adaptH2HData = (data: any, match: Match): H2HData | null => {
  // Return null if both data and match are not available
  if (!data || !match) return null;

  // Check if data is already in the expected format
  if (data?.summary?.wins?.firstTeam !== undefined) {
    return data;
  }

  // Otherwise, adapt from the mock server format
  return {
    firstTeam: {
      id: String(match?.homeTeam?.id || ''),
      name: match?.homeTeam?.name || '',
      logo: match?.homeTeam?.logo || '',
    },
    secondTeam: {
      id: String(match?.awayTeam?.id || ''),
      name: match?.awayTeam?.name || '',
      logo: match?.awayTeam?.logo || '',
    },
    summary: {
      totalMatches: data?.totalMatches || 0,
      wins: {
        firstTeam: data?.homeTeamWins || 0,
        secondTeam: data?.awayTeamWins || 0,
        draws: data?.draws || 0,
      },
      goals: {
        firstTeam: data?.totalGoalsHome || 0,
        secondTeam: data?.totalGoalsAway || 0,
      },
    },
    matches: Array.isArray(data?.recentMatches) ? data.recentMatches : []
  };
};`
  )
  
  // Fix the extraction and percentage calculations
  .replace(
    /\/\/ Extract data[\s\S]*?const drawPercentage[\s\S]*?;/g,
    `// Extract data from adapted structure (safely)
  const summary = adaptedData?.summary || { 
    totalMatches: 0, 
    wins: { 
      firstTeam: 0, 
      secondTeam: 0, 
      draws: 0 
    },
    goals: {
      firstTeam: 0,
      secondTeam: 0
    }
  };
  const matches = adaptedData?.matches || [];
  const totalMatches = summary.totalMatches || 0;
  
  // Calculate percentages
  const firstTeamWinPercentage = totalMatches > 0 ? (summary.wins.firstTeam / totalMatches) * 100 : 0;
  const secondTeamWinPercentage = totalMatches > 0 ? (summary.wins.secondTeam / totalMatches) * 100 : 0;
  const drawPercentage = totalMatches > 0 ? (summary.wins.draws / totalMatches) * 100 : 0;`
  )
  
  // Fix the renderSummaryStats function to handle empty data
  .replace(
    /const renderSummaryStats[\s\S]*?^  \};/m,
    `const renderSummaryStats = () => (
    <Box bg={statBg} p={4} borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" mb={4}>Head to Head Summary</Text>
      <SimpleGrid columns={3} spacing={4}>
        <Stat>
          <StatLabel>{match?.homeTeam?.name || 'Home Team'}</StatLabel>
          <StatNumber>{summary?.wins?.firstTeam || 0}</StatNumber>
          <StatHelpText>Wins</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Draws</StatLabel>
          <StatNumber>{summary?.wins?.draws || 0}</StatNumber>
          <StatHelpText>Games</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>{match?.awayTeam?.name || 'Away Team'}</StatLabel>
          <StatNumber>{summary?.wins?.secondTeam || 0}</StatNumber>
          <StatHelpText>Wins</StatHelpText>
        </Stat>
      </SimpleGrid>
    </Box>
  );`
  )
  
  // Fix the renderWinDistribution function to handle undefined match names
  .replace(
    /const renderWinDistribution[\s\S]*?^  \};/m,
    `const renderWinDistribution = () => (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>Win Distribution</Text>
      <VStack spacing={4}>
        <Box w="100%">
          <HStack justify="space-between" mb={1}>
            <Text fontSize="sm">{match?.homeTeam?.name || 'Home Team'}</Text>
            <Text fontSize="sm">{Number.isFinite(firstTeamWinPercentage) ? firstTeamWinPercentage.toFixed(1) : '0.0'}%</Text>
          </HStack>
          <Progress value={Number.isFinite(firstTeamWinPercentage) ? firstTeamWinPercentage : 0} size="sm" colorScheme="blue" />
        </Box>
        <Box w="100%">
          <HStack justify="space-between" mb={1}>
            <Text fontSize="sm">Draw</Text>
            <Text fontSize="sm">{Number.isFinite(drawPercentage) ? drawPercentage.toFixed(1) : '0.0'}%</Text>
          </HStack>
          <Progress value={Number.isFinite(drawPercentage) ? drawPercentage : 0} size="sm" colorScheme="gray" />
        </Box>
        <Box w="100%">
          <HStack justify="space-between" mb={1}>
            <Text fontSize="sm">{match?.awayTeam?.name || 'Away Team'}</Text>
            <Text fontSize="sm">{Number.isFinite(secondTeamWinPercentage) ? secondTeamWinPercentage.toFixed(1) : '0.0'}%</Text>
          </HStack>
          <Progress value={Number.isFinite(secondTeamWinPercentage) ? secondTeamWinPercentage : 0} size="sm" colorScheme="green" />
        </Box>
      </VStack>
    </Box>
  );`
  )
  
  // Fix the renderGoalsSummary function
  .replace(
    /const renderGoalsSummary[\s\S]*?^  \};/m,
    `const renderGoalsSummary = () => {
    // Calculate average goals per game for each team using available data or defaults
    const homeTeamGoals = summary?.goals?.firstTeam || 0;
    const awayTeamGoals = summary?.goals?.secondTeam || 0;
    const safelyDivideByMatches = (goals) => {
      return Number.isFinite(goals / (totalMatches || 1)) ? 
        (goals / (totalMatches || 1)).toFixed(2) : '0.00';
    };
    
    return (
      <Box bg={statBg} p={4} borderRadius="md">
        <Text fontSize="lg" fontWeight="bold" mb={4}>Goals Summary</Text>
        <SimpleGrid columns={2} spacing={4}>
          <Stat>
            <StatLabel>{match?.homeTeam?.name || 'Home Team'}</StatLabel>
            <StatNumber>{homeTeamGoals}</StatNumber>
            <StatHelpText>{safelyDivideByMatches(homeTeamGoals)} per game</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>{match?.awayTeam?.name || 'Away Team'}</StatLabel>
            <StatNumber>{awayTeamGoals}</StatNumber>
            <StatHelpText>{safelyDivideByMatches(awayTeamGoals)} per game</StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>
    );
  };`
  )
  
  // Fix the renderRecentMatches function to handle more data scenarios
  .replace(
    /const renderRecentMatches[\s\S]*?^  \};/m,
    `const renderRecentMatches = () => {
    // Check if matches exists and is an array before rendering
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return (
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>Recent Matches</Text>
          <Text>No recent match data available</Text>
        </Box>
      );
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString();
      } catch (e) {
        return 'Invalid Date';
      }
    };
    
    const getSafeScore = (match) => {
      // Check for score in different possible structures
      const homeScore = 
        match?.score?.home !== undefined ? match.score.home :
        match?.homeTeam?.score !== undefined ? match.homeTeam.score :
        match?.homeScore !== undefined ? match.homeScore : 
        null;
        
      const awayScore = 
        match?.score?.away !== undefined ? match.score.away :
        match?.awayTeam?.score !== undefined ? match.awayTeam.score :
        match?.awayScore !== undefined ? match.awayScore : 
        null;
        
      if (homeScore !== null && awayScore !== null) {
        return \`\${homeScore}-\${awayScore}\`;
      }
      return 'vs';
    };
    
    const getTeamName = (teamData, defaultName) => {
      if (!teamData) return defaultName;
      return typeof teamData === 'object' ? (teamData.name || defaultName) : teamData;
    };
    
    return (
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={4}>Recent Matches</Text>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Home</Th>
              <Th>Score</Th>
              <Th>Away</Th>
            </Tr>
          </Thead>
          <Tbody>
            {matches.slice(0, 5).map((match, index) => {
              // Extract with safety checks
              const homeTeam = getTeamName(match?.homeTeam, 'Home Team');
              const awayTeam = getTeamName(match?.awayTeam, 'Away Team');
              const matchDate = match?.date || match?.startTime || match?.matchDate || 'N/A';
              const score = getSafeScore(match);
              
              return (
                <Tr key={index}>
                  <Td>{formatDate(matchDate)}</Td>
                  <Td>{homeTeam}</Td>
                  <Td>{score}</Td>
                  <Td>{awayTeam}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    );
  };`
  );

// Write the updated content to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('HeadToHeadTab.tsx has been fixed with improved data handling!');
