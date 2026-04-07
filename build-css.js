#!/usr/bin/env node
/**
 * CSS build script — scans all HTML/JS in public/ and compiles Tailwind utilities
 */
const fs   = require('fs');
const path = require('path');
const postcss       = require('postcss');
const postcssPlugin = require('@tailwindcss/postcss');
const autoprefixer  = require('autoprefixer');

const inputFile  = path.join(__dirname, 'public/stylesheets/style.css');
const outputFile = path.join(__dirname, 'public/stylesheets/style.min.css');

const css = fs.readFileSync(inputFile, 'utf8');

postcss([postcssPlugin, autoprefixer])
  .process(css, { from: inputFile, to: outputFile, map: { inline: false } })
  .then((result) => {
    fs.writeFileSync(outputFile, result.css);
    if (result.map) fs.writeFileSync(outputFile + '.map', result.map.toString());

    const inKB  = (css.length / 1024).toFixed(2);
    const outKB = (result.css.length / 1024).toFixed(2);
    console.log('✓ CSS build completed!');
    console.log(`  Input:  ${inputFile} (${inKB} KB)`);
    console.log(`  Output: ${outputFile} (${outKB} KB)`);
  })
  .catch((err) => {
    console.error('✗ CSS build failed:', err.message);
    process.exit(1);
  });
