/**
 * Fix to ensure all memoryCache.set calls in soccerApiService.ts
 * follow the correct pattern (only two arguments)
 */

const fs = require('fs');
const path = require('path');

// Main API service file
const filePath = path.resolve(__dirname, '../src/api/soccerApiService.ts');

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
    
    // Check if there are any occurrences
    let match;
    let found = false;
    while ((match = regex.exec(content)) !== null) {
      console.log(`Found 3-parameter call: ${match[0]}`);
      found = true;
    }
    
    if (!found) {
      console.log('No 3-parameter memoryCache.set calls found. File is already correct.');
      return;
    }
    
    // Replace with only 2 parameters
    const updatedContent = content.replace(regex, 'memoryCache.set($1, $2)');
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process the file
fixMemoryCacheCalls(filePath);

console.log('Finished processing');
