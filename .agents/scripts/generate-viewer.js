#!/usr/bin/env node

/**
 * OpenSpec-Ex Interactive Spec Viewer CLI Script
 */

const path = require('path');
const { generateSpecViewer } = require('../../src/generator.js');

const targetDir = process.argv[2] || process.cwd();
try {
  const outputPath = generateSpecViewer(targetDir);
  console.log(`✔ Spec Viewer generated: ${outputPath}`);
} catch (e) {
  console.error(`✖ Error generating spec viewer: ${e.message}`);
  process.exit(1);
}
