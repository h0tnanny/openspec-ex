#!/usr/bin/env node

/**
 * OpenSpec-Ex Interactive Spec Viewer CLI Script
 */

const path = require('path');
let generateSpecViewer;
try {
  generateSpecViewer = require('openspec-ex').generateSpecViewer || require('openspec-ex/src/generator.js').generateSpecViewer;
} catch (e) {
  try {
    generateSpecViewer = require('../../src/generator.js').generateSpecViewer;
  } catch (err) {
    try {
      generateSpecViewer = require('../src/generator.js').generateSpecViewer;
    } catch (err2) {
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
