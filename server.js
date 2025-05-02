import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Use Vite's connect instance as middleware
  app.use(vite.middlewares);

  // Handle all routes
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // If requesting a static file that exists in public, serve it directly
      const publicPath = path.join(__dirname, 'public', url);
      if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
        return res.sendFile(publicPath);
      }

      // Load index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );

      // Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template);

      // Send transformed HTML
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      // If error, let Vite handle it
      vite.ssrFixStacktrace(e);
      console.error(e);
      next(e);
    }
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer(); 