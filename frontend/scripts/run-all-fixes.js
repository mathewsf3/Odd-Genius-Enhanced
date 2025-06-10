// Script to run all fix scripts
const { exec } = require('child_process');

// Array of script filenames to run
const fixScripts = [
  'fix-head-to-head-tab.js',
  'fix-team-stats-tab.js',
  'fix-predictions-tab.js',
  'fix-over-under-analysis-tab.js'
];

// Run each script in sequence
async function runFixScripts() {
  for (const script of fixScripts) {
    console.log(`Running ${script}...`);
    
    try {
      // Execute the script using Node
      await executeScript(`node scripts/${script}`);
      console.log(`✅ Successfully applied ${script}`);
    } catch (error) {
      console.error(`❌ Error running ${script}:`, error);
    }
    
    console.log('----------------------------');
  }
  
  console.log('All fix scripts have been executed.');
}

// Helper function to execute a command and return a promise
function executeScript(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`Script error: ${stderr}`);
      }
      
      console.log(stdout);
      resolve();
    });
  });
}

// Run the fix scripts
runFixScripts();
