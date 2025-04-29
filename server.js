const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('Error: dist directory does not exist. Make sure the build process completed successfully.');
  fs.mkdirSync(distPath, { recursive: true });
}

// Log the directory structure for debugging
console.log('Current directory:', __dirname);
console.log('Files in current directory:', fs.readdirSync(__dirname));
console.log('Dist path:', distPath);

try {
  console.log('Files in dist directory:', fs.existsSync(distPath) ? fs.readdirSync(distPath) : 'dist directory does not exist');
} catch (error) {
  console.error('Error checking dist directory:', error);
}

// Serve static files from the dist directory
app.use(express.static(distPath));

// Send all other requests to the index.html file
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found. Please make sure the build process completed successfully.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
