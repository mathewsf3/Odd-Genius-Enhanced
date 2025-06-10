const fs = require('fs');
const path = require('path');

// Path to the file we need to modify
const filePath = path.join(__dirname, '..', 'src', 'components', 'match', 'CornerAnalysisTab.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Safely update averageCornersFor and averageCornersAgainst
content = content.replace(
  /<StatNumber>{homeStats\.averageCornersFor\.toFixed\(1\)}<\/StatNumber>/g, 
  '<StatNumber>{typeof homeStats.averageCornersFor === "number" ? homeStats.averageCornersFor.toFixed(1) : "0.0"}</StatNumber>'
);

content = content.replace(
  /<StatNumber>{homeStats\.averageCornersAgainst\.toFixed\(1\)}<\/StatNumber>/g, 
  '<StatNumber>{typeof homeStats.averageCornersAgainst === "number" ? homeStats.averageCornersAgainst.toFixed(1) : "0.0"}</StatNumber>'
);

content = content.replace(
  /<StatNumber>{awayStats\.averageCornersFor\.toFixed\(1\)}<\/StatNumber>/g, 
  '<StatNumber>{typeof awayStats.averageCornersFor === "number" ? awayStats.averageCornersFor.toFixed(1) : "0.0"}</StatNumber>'
);

content = content.replace(
  /<StatNumber>{awayStats\.averageCornersAgainst\.toFixed\(1\)}<\/StatNumber>/g, 
  '<StatNumber>{typeof awayStats.averageCornersAgainst === "number" ? awayStats.averageCornersAgainst.toFixed(1) : "0.0"}</StatNumber>'
);

// Fix average calculations
content = content.replace(
  /<Text fontSize="sm" mb={1}>Average per Match: {(homeStats\.averageCornersFor \+ homeStats\.averageCornersAgainst)\.toFixed\(1\)}<\/Text>/g,
  '<Text fontSize="sm" mb={1}>Average per Match: {(Number(homeStats.averageCornersFor || 0) + Number(homeStats.averageCornersAgainst || 0)).toFixed(1)}</Text>'
);

content = content.replace(
  /<Text fontSize="sm" mb={1}>Average per Match: {(awayStats\.averageCornersFor \+ awayStats\.averageCornersAgainst)\.toFixed\(1\)}<\/Text>/g,
  '<Text fontSize="sm" mb={1}>Average per Match: {(Number(awayStats.averageCornersFor || 0) + Number(awayStats.averageCornersAgainst || 0)).toFixed(1)}</Text>'
);

// Fix toFixed calls in percentages
content = content.replace(
  /<Text fontSize="xs">{homeStats\.averageCornersFor\.toFixed\(1\)} \({calculatePercentage\(homeStats\.averageCornersFor, homeStats\.averageCornersFor \+ homeStats\.averageCornersAgainst\)}%\)<\/Text>/g,
  '<Text fontSize="xs">{typeof homeStats.averageCornersFor === "number" ? homeStats.averageCornersFor.toFixed(1) : "0.0"} ({calculatePercentage(homeStats.averageCornersFor, homeStats.averageCornersFor + homeStats.averageCornersAgainst)}%)</Text>'
);

content = content.replace(
  /<Text fontSize="xs">{homeStats\.averageCornersAgainst\.toFixed\(1\)} \({calculatePercentage\(homeStats\.averageCornersAgainst, homeStats\.averageCornersFor \+ homeStats\.averageCornersAgainst\)}%\)<\/Text>/g,
  '<Text fontSize="xs">{typeof homeStats.averageCornersAgainst === "number" ? homeStats.averageCornersAgainst.toFixed(1) : "0.0"} ({calculatePercentage(homeStats.averageCornersAgainst, homeStats.averageCornersFor + homeStats.averageCornersAgainst)}%)</Text>'
);

content = content.replace(
  /<Text fontSize="xs">{awayStats\.averageCornersFor\.toFixed\(1\)} \({calculatePercentage\(awayStats\.averageCornersFor, awayStats\.averageCornersFor \+ awayStats\.averageCornersAgainst\)}%\)<\/Text>/g,
  '<Text fontSize="xs">{typeof awayStats.averageCornersFor === "number" ? awayStats.averageCornersFor.toFixed(1) : "0.0"} ({calculatePercentage(awayStats.averageCornersFor, awayStats.averageCornersFor + awayStats.averageCornersAgainst)}%)</Text>'
);

content = content.replace(
  /<Text fontSize="xs">{awayStats\.averageCornersAgainst\.toFixed\(1\)} \({calculatePercentage\(awayStats\.averageCornersAgainst, awayStats\.averageCornersFor \+ awayStats\.averageCornersAgainst\)}%\)<\/Text>/g,
  '<Text fontSize="xs">{typeof awayStats.averageCornersAgainst === "number" ? awayStats.averageCornersAgainst.toFixed(1) : "0.0"} ({calculatePercentage(awayStats.averageCornersAgainst, awayStats.averageCornersFor + awayStats.averageCornersAgainst)}%)</Text>'
);

// Write the updated content back to the file
fs.writeFileSync(filePath, content);

console.log('CornerAnalysisTab.tsx has been updated with safe numeric operations.');
