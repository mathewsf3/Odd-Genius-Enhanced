// This script fixes the GoalTimingAnalysisTab component by adding null checks for scoring patterns
const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, '..', 'src', 'components', 'match', 'GoalTimingAnalysisTab.tsx');

// Read the file
const fileContent = fs.readFileSync(filePath, 'utf8');

// Find the Scoring Patterns section and replace it with a version that has null checks
const oldPattern = /<StatNumber>{home\.scoringPatterns\.scoredFirst}[\s\S]*?{away\.scoringPatterns\.scoredFirst \+ away\.scoringPatterns\.concededFirst}\)<\/StatHelpText>/;
const newPattern = `<StatNumber>
                  {home.scoringPatterns?.scoredFirst || 0} / {(home.scoringPatterns?.scoredFirst || 0) + (home.scoringPatterns?.concededFirst || 0)}
                </StatNumber>
                <StatHelpText fontSize="xs">
                  {Math.round(((home.scoringPatterns?.scoredFirst || 0) / 
                    Math.max(1, (home.scoringPatterns?.scoredFirst || 0) + (home.scoringPatterns?.concededFirst || 0))) * 100)}% of matches
                </StatHelpText>`;

// Replace the pattern
const updatedContent = fileContent.replace(oldPattern, newPattern);

// Save the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('GoalTimingAnalysisTab.tsx has been updated with null checks for scoringPatterns.');
