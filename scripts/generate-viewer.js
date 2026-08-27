#!/usr/bin/env node

/**
 * OpenSpec-Ex Interactive Spec Viewer CLI Script
 */

const path = require('path');
let generateSpecViewer;
try {
  generateSpecViewer = require('../dist/index.cjs').generateSpecViewer;
} catch (e1) {
  try {
    generateSpecViewer = require('../../dist/index.cjs').generateSpecViewer;
  } catch (e2) {
    try {
      generateSpecViewer = require('openspec-ex').generateSpecViewer;
    } catch (err) {
      console.error('✖ Error: Unable to load OpenSpec-Ex generator module.');
      process.exit(1);
    }
  }
}

const targetDir = process.argv[2] || process.cwd();
try {
  const outputPath = generateSpecViewer(targetDir);
  console.log(`✔ Spec Viewer generated: ${outputPath}`);
} catch (e) {
  console.error(`✖ Error generating spec viewer: ${e.message}`);
  process.exit(1);
}
