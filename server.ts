import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware
  app.use(express.json());

  // Debug middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API Request] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Runtime Environment Bridge
  // Serves environment secrets to the frontend dynamically
  app.get('/env-config.js', (req, res) => {
    const key = process.env.GEMINI_API_KEY || 
                process.env.LLAVE_EXPERTA || 
                process.env.VITE_LLAVE_EXPERTA || 
                "";
    
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`window.__ENGINE_CONFIG__ = { 
  GEMINI_API_KEY: "${key}",
  lastUpdated: "${new Date().toISOString()}" 
};`);
  });

  // 404 Guard for API routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Executive Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
