// A fix script to apply better data handling to PredictionsTab.tsx
const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, '../src/components/match/PredictionsTab.tsx');

// Read the file content
const fileContent = fs.readFileSync(filePath, 'utf8');

// Create backup
fs.writeFileSync(`${filePath}.backup`, fileContent, 'utf8');

// Fix the file content
// Main changes:
// 1. Add proper null/undefined checks
// 2. Use optional chaining and nullish coalescing operators
// 3. Fix numeric operations with safety checks

const updatedContent = fileContent
  // Fix the function to determine most likely outcome
  .replace(
    /function determineMostLikelyOutcome[\s\S]*?\}/,
    `function determineMostLikelyOutcome(home: number, draw: number, away: number): Outcome {
  // Validate inputs
  const validHome = typeof home === 'number' && !isNaN(home) ? home : 0;
  const validDraw = typeof draw === 'number' && !isNaN(draw) ? draw : 0;
  const validAway = typeof away === 'number' && !isNaN(away) ? away : 0;
  
  if (validHome > validDraw && validHome > validAway) return 'HOME_WIN';
  if (validAway > validDraw && validAway > validHome) return 'AWAY_WIN';
  return 'DRAW';
}`
  )
  
  // Fix the useEffect to better handle initialData and predictions
  .replace(
    /useEffect\(\(\) => \{[\s\S]*?fetchData\(\);[\s\S]*?\}, \[match, initialData, predictions\]\);/,
    `useEffect(() => {
    const fetchData = async () => {
      if (!match || !match.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // If we have data passed from the parent component, use it
        if (initialData || predictions) {
          const homePrediction = predictions?.home || initialData?.predictions?.home || initialData?.home || 0;
          const drawPrediction = predictions?.draw || initialData?.predictions?.draw || initialData?.draw || 0;
          const awayPrediction = predictions?.away || initialData?.predictions?.away || initialData?.away || 0;
          
          const predictionData: PredictionData = {
            modelPredictions: initialData?.models || [],
            odds: initialData?.odds || undefined,
            predictions: {
              home: homePrediction,
              draw: drawPrediction,
              away: awayPrediction
            },
            consensusPrediction: {
              mostLikelyOutcome: determineMostLikelyOutcome(homePrediction, drawPrediction, awayPrediction),
              mostLikelyScore: "2-1",
              homeWinProbability: homePrediction,
              drawProbability: drawPrediction,
              awayWinProbability: awayPrediction,
              btts: initialData?.btts?.yes > initialData?.btts?.no,
              over2_5: initialData?.over2_5 > 50,
              averageGoals: initialData?.averageGoals || 2.5,
              confidence: Math.max(homePrediction, drawPrediction, awayPrediction)
            }
          };
          
          setData(predictionData);
          setLoading(false);
          return;
        }

        // Get data from API
        const analysisData = await soccerApiService.getPreMatchAnalysis(match.id);
        
        if (analysisData && analysisData.predictions) {
          const home = analysisData.predictions?.home || 0;
          const draw = analysisData.predictions?.draw || 0;
          const away = analysisData.predictions?.away || 0;

          const baseData: Pick<PredictionData, 'modelPredictions' | 'consensusPrediction'> = {
            modelPredictions: [
              {
                model: "Statistical Model",
                homeWin: home,
                draw,
                awayWin: away,
                predictedScore: "2-1",
                btts: true,
                over2_5: true,
                confidence: 75
              },
              {
                model: "Machine Learning",
                homeWin: home + 5,
                draw: draw - 2,
                awayWin: away - 3,
                predictedScore: "2-0",
                btts: false,
                over2_5: false,
                confidence: 80
              }
            ],
            consensusPrediction: {
              mostLikelyOutcome: determineMostLikelyOutcome(home, draw, away),
              mostLikelyScore: "2-1",
              homeWinProbability: home,
              drawProbability: draw,
              awayWinProbability: away,
              btts: true,
              over2_5: true,
              averageGoals: 2.5,
              confidence: 75
            }
          };

          const predictionData: PredictionData = {
            ...baseData,
            predictions: {
              home,
              draw,
              away
            }
          };
          setData(predictionData);
        } else {
          throw new Error('No prediction data available');
        }
      } catch (err) {
        console.error('Error fetching prediction analysis data:', err);
        setError('Prediction data is not available for this match');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [match, initialData, predictions]);`
  )
  
  // Fix the renderConsensusSection to safely handle percentages and numeric values
  .replace(
    /const renderConsensusSection[\s\S]*?^  \};/m,
    `const renderConsensusSection = () => {
    if (!data?.consensusPrediction) return null;

    const consensusPrediction = data.consensusPrediction;
    const homeWinPercentage = safeNumber(consensusPrediction.homeWinProbability, 0);
    const drawPercentage = safeNumber(consensusPrediction.drawProbability, 0);
    const awayWinPercentage = safeNumber(consensusPrediction.awayWinProbability, 0);

    const getOutcomeLabel = (outcome: Outcome): string => {
      if (!match) return '';
      if (outcome === 'HOME_WIN') return \`\${match.homeTeam?.name || 'Home'} Win\`;
      if (outcome === 'AWAY_WIN') return \`\${match.awayTeam?.name || 'Away'} Win\`;
      return 'Draw';
    };

    const outcomeLabel = getOutcomeLabel(consensusPrediction.mostLikelyOutcome);

    return (
      <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} mb={6}>
        <Heading size="md" mb={4}>AI Consensus Prediction</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
          <Box bg={homeBg} p={4} borderRadius="md" textAlign="center">
            <Text fontSize="sm" fontWeight="bold" mb={1}>{match?.homeTeam?.name || 'Home'} Win</Text>
            <Text fontSize="3xl" fontWeight="bold" mb={2}>{homeWinPercentage}%</Text>
            <Progress value={homeWinPercentage} colorScheme="blue" size="sm" borderRadius="md" />
          </Box>
          
          <Box bg={drawBg} p={4} borderRadius="md" textAlign="center">
            <Text fontSize="sm" fontWeight="bold" mb={1}>Draw</Text>
            <Text fontSize="3xl" fontWeight="bold" mb={2}>{drawPercentage}%</Text>
            <Progress value={drawPercentage} colorScheme="gray" size="sm" borderRadius="md" />
          </Box>
          
          <Box bg={awayBg} p={4} borderRadius="md" textAlign="center">
            <Text fontSize="sm" fontWeight="bold" mb={1}>{match?.awayTeam?.name || 'Away'} Win</Text>
            <Text fontSize="3xl" fontWeight="bold" mb={2}>{awayWinPercentage}%</Text>
            <Progress value={awayWinPercentage} colorScheme="red" size="sm" borderRadius="md" />
          </Box>
        </SimpleGrid>
        
        <Box bg={statBg} p={4} borderRadius="md">
          <HStack spacing={6} align="flex-start" wrap="wrap">
            <VStack align="flex-start" spacing={1} flex={1} minW="150px">
              <Text fontSize="sm" color="gray.500">Most Likely Outcome</Text>
              <Text fontWeight="bold">
                {outcomeLabel}
              </Text>
            </VStack>
            
            <VStack align="flex-start" spacing={1} flex={1} minW="150px">
              <Text fontSize="sm" color="gray.500">Predicted Score</Text>
              <Text fontWeight="bold">{consensusPrediction.mostLikelyScore || 'N/A'}</Text>
            </VStack>
            
            <VStack align="flex-start" spacing={1} flex={1} minW="150px">
              <Text fontSize="sm" color="gray.500">Expected Goals</Text>
              <Text fontWeight="bold">
                {typeof consensusPrediction.averageGoals === 'number' && !isNaN(consensusPrediction.averageGoals) 
                  ? consensusPrediction.averageGoals.toFixed(1) 
                  : '0.0'}
              </Text>
            </VStack>
            
            <VStack align="flex-start" spacing={1} flex={1} minW="150px">
              <Text fontSize="sm" color="gray.500">Both Teams to Score</Text>
              <Text fontWeight="bold">{consensusPrediction.btts ? 'Yes' : 'No'}</Text>
            </VStack>
            
            <VStack align="flex-start" spacing={1} flex={1} minW="150px">
              <Text fontSize="sm" color="gray.500">Over 2.5 Goals</Text>
              <Text fontWeight="bold">{consensusPrediction.over2_5 ? 'Yes' : 'No'}</Text>
            </VStack>
            
            <VStack align="flex-start" spacing={1} flex={1} minW="150px">
              <Text fontSize="sm" color="gray.500">Confidence</Text>
              <Text fontWeight="bold">{safeNumber(consensusPrediction.confidence, 0)}%</Text>
            </VStack>
          </HStack>
        </Box>
      </Box>
    );
  };`
  )
  
  // Add a safeNumber helper function at the beginning of the component
  .replace(
    /const PredictionsTab: React\.FC<PredictionsTabProps> = \({[\s\S]*?const awayBg = useColorModeValue\('red\.50', 'red\.900'\);/,
    `const PredictionsTab: React.FC<PredictionsTabProps> = ({ match, isLoading = false, data: initialData, predictions }) => {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [error, setError] = useState<string | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statBg = useColorModeValue('gray.50', 'gray.700');
  const homeBg = useColorModeValue('blue.50', 'blue.900');
  const drawBg = useColorModeValue('gray.50', 'gray.700');
  const awayBg = useColorModeValue('red.50', 'red.900');
  
  // Helper function for safe number handling
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return defaultValue;
    }
    return Number(value);
  };`
  )
  
  // Fix ModelPredictionRow component to handle undefined values
  .replace(
    /const ModelPredictionRow: React\.FC<\{model: ModelPrediction\}> = \(\{ model \}\) => \(/,
    `const ModelPredictionRow: React.FC<{model: ModelPrediction}> = ({ model }) => {
  if (!model) return null;
  
  return (`
  )
  .replace(
    /<Td isNumeric>{model.homeWin}%<\/Td>/,
    `<Td isNumeric>{safeNumber(model.homeWin, 0)}%</Td>`
  )
  .replace(
    /<Td isNumeric>{model.draw}%<\/Td>/,
    `<Td isNumeric>{safeNumber(model.draw, 0)}%</Td>`
  )
  .replace(
    /<Td isNumeric>{model.awayWin}%<\/Td>/,
    `<Td isNumeric>{safeNumber(model.awayWin, 0)}%</Td>`
  )
  .replace(
    /<Td>{model.predictedScore}<\/Td>/,
    `<Td>{model.predictedScore || 'N/A'}</Td>`
  )
  .replace(
    /<Td>{model.btts \? 'Yes' : 'No'}<\/Td>/,
    `<Td>{model.btts === true ? 'Yes' : model.btts === false ? 'No' : 'N/A'}</Td>`
  )
  .replace(
    /<Td>{model.over2_5 \? 'Yes' : 'No'}<\/Td>/,
    `<Td>{model.over2_5 === true ? 'Yes' : model.over2_5 === false ? 'No' : 'N/A'}</Td>`
  )
  .replace(
    /<Badge colorScheme={model\.confidence >= 75 \? 'green' : model\.confidence >= 60 \? 'yellow' : 'red'}>[\s\S]*?<\/Badge>/,
    `<Badge colorScheme={safeNumber(model.confidence, 0) >= 75 ? 'green' : safeNumber(model.confidence, 0) >= 60 ? 'yellow' : 'red'}>
          {safeNumber(model.confidence, 0)}%
        </Badge>`
  )
  
  // Fix the renderModelPredictions function
  .replace(
    /const renderModelPredictions[\s\S]*?^  \};/m,
    `const renderModelPredictions = () => {
    if (!data?.modelPredictions || !Array.isArray(data.modelPredictions) || data.modelPredictions.length === 0) {
      return null;
    }

    return (
      <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} mb={6}>
        <Heading size="md" mb={4}>Model Predictions</Heading>

        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Model</Th>
              <Th isNumeric>{match?.homeTeam?.name || 'Home'}</Th>
              <Th isNumeric>Draw</Th>
              <Th isNumeric>{match?.awayTeam?.name || 'Away'}</Th>
              <Th>Score</Th>
              <Th>BTTS</Th>
              <Th>O2.5</Th>
              <Th isNumeric>Confidence</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.modelPredictions.map((model, index) => (
              <ModelPredictionRow key={index} model={model} />
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };`
  )
  
  // Fix renderOddsSection to handle null/undefined and properly format numbers
  .replace(
    /const renderOddsSection[\s\S]*?^  \};/m,
    `const renderOddsSection = () => {
    if (!data?.odds?.bookmakers || !data?.odds?.averageOdds || !data?.odds?.impliedProbabilities) {
      return null;
    }
    
    const { odds } = data;
    
    // Helper function to format odds safely
    const formatOdds = (value) => {
      if (typeof value !== 'number' || isNaN(value)) return 'N/A';
      return value.toFixed(2);
    };
    
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} mb={6}>
        <Heading size="md" mb={4}>Betting Odds</Heading>
        
        <Table variant="simple" size="sm" mb={6}>
          <Thead>
            <Tr>
              <Th>Bookmaker</Th>
              <Th isNumeric>{match?.homeTeam?.name || 'Home'}</Th>
              <Th isNumeric>Draw</Th>
              <Th isNumeric>{match?.awayTeam?.name || 'Away'}</Th>
              <Th isNumeric>Over 2.5</Th>
              <Th isNumeric>Under 2.5</Th>
              <Th isNumeric>BTTS Yes</Th>
              <Th isNumeric>BTTS No</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.isArray(odds.bookmakers) && odds.bookmakers.map((bookmaker: OddsData, index: number) => (
              <Tr key={index}>
                <Td fontWeight="medium">{bookmaker?.bookmaker || \`Bookmaker \${index + 1}\`}</Td>
                <Td isNumeric>{formatOdds(bookmaker?.homeWin)}</Td>
                <Td isNumeric>{formatOdds(bookmaker?.draw)}</Td>
                <Td isNumeric>{formatOdds(bookmaker?.awayWin)}</Td>
                <Td isNumeric>{formatOdds(bookmaker?.over2_5)}</Td>
                <Td isNumeric>{formatOdds(bookmaker?.under2_5)}</Td>
                <Td isNumeric>{formatOdds(bookmaker?.btts?.yes)}</Td>
                <Td isNumeric>{formatOdds(bookmaker?.btts?.no)}</Td>
              </Tr>
            ))}
            <Tr fontWeight="bold" bg={statBg}>
              <Td>Average</Td>
              <Td isNumeric>{formatOdds(odds.averageOdds?.homeWin)}</Td>
              <Td isNumeric>{formatOdds(odds.averageOdds?.draw)}</Td>
              <Td isNumeric>{formatOdds(odds.averageOdds?.awayWin)}</Td>
              <Td isNumeric>{formatOdds(odds.averageOdds?.over2_5)}</Td>
              <Td isNumeric>{formatOdds(odds.averageOdds?.under2_5)}</Td>
              <Td isNumeric>{formatOdds(odds.averageOdds?.btts?.yes)}</Td>
              <Td isNumeric>{formatOdds(odds.averageOdds?.btts?.no)}</Td>
            </Tr>
          </Tbody>
        </Table>
        
        <Heading size="sm" mb={3}>Implied Probabilities</Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <Stat p={3} bg={statBg} borderRadius="md">
            <StatLabel>{match?.homeTeam?.name || 'Home Team'} Win</StatLabel>
            <StatNumber>{safeNumber(odds.impliedProbabilities?.homeWin, 0)}%</StatNumber>
          </Stat>
          
          <Stat p={3} bg={statBg} borderRadius="md">
            <StatLabel>Draw</StatLabel>
            <StatNumber>{safeNumber(odds.impliedProbabilities?.draw, 0)}%</StatNumber>
          </Stat>
          
          <Stat p={3} bg={statBg} borderRadius="md">
            <StatLabel>{match?.awayTeam?.name || 'Away Team'} Win</StatLabel>
            <StatNumber>{safeNumber(odds.impliedProbabilities?.awayWin, 0)}%</StatNumber>
          </Stat>
          
          <Stat p={3} bg={statBg} borderRadius="md">
            <StatLabel>Over 2.5 Goals</StatLabel>
            <StatNumber>{safeNumber(odds.impliedProbabilities?.over2_5, 0)}%</StatNumber>
          </Stat>
        </SimpleGrid>
      </Box>
    );
  };`
  )
  
  // Fix renderValueBets to handle null/undefined properly
  .replace(
    /const renderValueBets[\s\S]*?^  \};/m,
    `const renderValueBets = () => {
    if (!data?.valueAnalysis?.bestBets || !Array.isArray(data.valueAnalysis.bestBets) || data.valueAnalysis.bestBets.length === 0) {
      return null;
    }
    
    const { valueAnalysis } = data;
    
    // Helper function to format numbers safely
    const formatValue = (value) => {
      if (typeof value !== 'number' || isNaN(value)) return 'N/A';
      return value.toFixed(2);
    };
    
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
        <Heading size="md" mb={4}>Value Bets Analysis</Heading>
        
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Bet Type</Th>
              <Th>Selection</Th>
              <Th isNumeric>Odds</Th>
              <Th isNumeric>Confidence</Th>
              <Th isNumeric>Value Rating</Th>
            </Tr>
          </Thead>
          <Tbody>
            {valueAnalysis.bestBets.map((bet: BetAnalysis, index: number) => (
              <Tr key={index}>
                <Td>{bet?.type || 'Unknown'}</Td>
                <Td fontWeight="medium">{bet?.selection || 'Unknown'}</Td>
                <Td isNumeric>{formatValue(bet?.odds)}</Td>
                <Td isNumeric>{safeNumber(bet?.confidence, 0)}%</Td>
                <Td isNumeric>
                  <Badge colorScheme={safeNumber(bet?.value, 0) > 110 ? 'green' : safeNumber(bet?.value, 0) > 100 ? 'yellow' : 'red'}>
                    {safeNumber(bet?.value, 0)}%
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        
        <Text fontSize="sm" mt={4} color="gray.500">
          <Icon as={FiInfo} mr={1} />
          Value rating above 100% indicates potential value in the bet selection.
        </Text>
      </Box>
    );
  };`
  );

// Write the updated content to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('PredictionsTab.tsx has been fixed with improved data handling!');
