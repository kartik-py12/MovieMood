// This is a pre-build script for Vercel

const fs = require('fs');
const path = require('path');

// Ensure index.html exists at the root of the build output
try {
  console.log('🔍 Running Vercel pre-build checks...');
  
  // Create a placeholder for the build directory to ensure it exists
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  }
  
  console.log('✅ Pre-build check complete');
} catch (error) {
  console.error('❌ Error in pre-build script:', error);
  process.exit(1);
}
