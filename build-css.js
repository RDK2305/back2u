#!/usr/bin/env node
/**
 * Simple CSS build script for Tailwind CSS v4
 * Uses @tailwindcss/postcss plugin for PostCSS
 */

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssPlugin = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');

const inputFile = path.join(__dirname, 'public/stylesheets/style.css');
const outputFile = path.join(__dirname, 'public/stylesheets/style.min.css');

// Read input CSS
const css = fs.readFileSync(inputFile, 'utf8');

// Run PostCSS with Tailwind and autoprefixer plugins
postcss([
  postcssPlugin,
  autoprefixer,
])
  .process(css, {
    from: inputFile,
    to: outputFile,
    map: { inline: false },
  })
  .then((result) => {
    // Write output CSS
    fs.writeFileSync(outputFile, result.css);
    
    // Write source map if it exists
    if (result.map) {
      fs.writeFileSync(outputFile + '.map', result.map.toString());
    }
    
    const inputSize = (css.length / 1024).toFixed(2);
    const outputSize = (result.css.length / 1024).toFixed(2);
    
    console.log('✓ CSS build completed successfully!');
    console.log(`  Input:  ${inputFile} (${inputSize} KB)`);
    console.log(`  Output: ${outputFile} (${outputSize} KB)`);
  })
  .catch((error) => {
    console.error('✗ CSS build failed!');
    console.error(error.message);
    process.exit(1);
  });
