// A simple script to verify that the analysis tabs load correctly
const fs = require('fs');
const path = require('path');

// Function to test if a file exists and can be read
function testFileReadable(filePath) {
  console.log(`Testing file: ${filePath}`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ Successfully read: ${path.basename(filePath)}`);
    console.log(`File size: ${content.length} characters`);
    return true;
  } catch (error) {
    console.error(`❌ Error reading ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

// Paths to the files we want to test
const baseDir = path.join(__dirname, '..', 'src', 'components', 'match');
console.log(`Base directory: ${baseDir}`);

const filesToTest = [
  path.join(baseDir, 'CardAnalysisTab.tsx'),
  path.join(baseDir, 'CornerAnalysisTab.tsx'),
  path.join(baseDir, 'GoalTimingAnalysisTab.tsx')
];

console.log('Testing analysis tab components...');
let allPassed = true;

// Test each file
filesToTest.forEach(filePath => {
  const result = testFileReadable(filePath);
  if (!result) {
    allPassed = false;
  }
});

if (allPassed) {
  console.log('✅ All analysis tab files are readable');
} else {
  console.log('❌ Some analysis tab files have issues');
}
