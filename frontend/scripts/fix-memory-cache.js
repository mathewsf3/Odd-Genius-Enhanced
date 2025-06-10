// Fix for memoryCache.set issues
// This script updates memoryCache.set calls in clean and complete files
// to use only two parameters instead of three

const fs = require('fs');
const path = require('path');

// Paths to files with issues
const filesToFix = [
  '../src/api/soccerApiService.clean.ts',
  '../src/api/soccerApiService.complete.ts'
];

function fixMemoryCacheCalls(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Regular expression to find memoryCache.set calls with 3 parameters
    const regex = /memoryCache\.set\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/g;
    
    // Replace with only 2 parameters
    const updatedContent = content.replace(regex, 'memoryCache.set($1, $2)');
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process each file
filesToFix.forEach(relativeFilePath => {
  const fullPath = path.resolve(__dirname, relativeFilePath);
  fixMemoryCacheCalls(fullPath);
});

console.log('Finished processing all files');
