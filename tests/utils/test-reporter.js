class TestReporter {
  static generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.numTotalTests,
        passed: results.numPassedTests,
        failed: results.numFailedTests
      },
      details: results.testResults
    };

    console.log('Test Execution Report:');
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }
}

module.exports = TestReporter;