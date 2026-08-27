/**
 * OpenSpec-Ex Unified Test Runner
 * Executes all unit and integration test suites with zero external dependencies.
 */

const backupTests = require('./backup.test.js');
const presetsTests = require('./presets.test.js');
const cliTests = require('./cli.test.js');

async function main() {
  console.log('\n\x1b[1m\x1b[35m═══════════════════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[1m\x1b[36m▲ OpenSpec-Ex Zero-Dependency Automated Test Suite\x1b[0m');
  console.log('\x1b[1m\x1b[35m═══════════════════════════════════════════════════════════════\x1b[0m\n');

  const startTime = Date.now();

  try {
    await backupTests.runTests();
    console.log('');
    await presetsTests.runTests();
    console.log('');
    await cliTests.runTests();
    console.log('');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\x1b[1m\x1b[32m✔ ALL TEST SUITES PASSED SUCCESSFULLY!\x1b[0m \x1b[90m(' + elapsed + 's)\x1b[0m\n');
  } catch (err) {
    console.error('\n\x1b[1m\x1b[31m✖ TEST SUITE FAILURE:\x1b[0m', err);
    process.exit(1);
  }
}

main();
