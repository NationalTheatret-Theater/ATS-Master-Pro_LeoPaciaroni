import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. EMERGENCY CONFIG BRIDGE (MUST BE FIRST)
  app.get('/env-config.js', (req, res) => {
    // Collect all potential keys
    const keys = [
      { name: 'GEMINI_API_KEY', val: process.env.GEMINI_API_KEY?.trim() || "" },
      { name: 'LLAVE_EXPERTA', val: process.env.LLAVE_EXPERTA?.trim() || "" },
      { name: 'VITE_LLAVE_EXPERTA', val: process.env.VITE_LLAVE_EXPERTA?.trim() || "" }
    ];

    // Priority 1: Pick the one that looks like a real 39-char key
    let bestKey = keys.find(k => k.val.length === 39 || k.val.startsWith('AIzaSy'));
    
    // Priority 2: Pick the longest one if none look perfect
    if (!bestKey) {
      bestKey = keys.reduce((prev, current) => (prev.val.length > current.val.length) ? prev : current);
    }

    const key = bestKey.val;
    const source = bestKey.name;

    console.log(`[Bridge] SELECTOR HIT. Chosen: ${source}, Length: ${key.length}, LooksValid: ${key.startsWith('AIzaSy')}`);
    
    if (key.length === 0) {
      console.warn('[Bridge] CRITICAL: No API Keys found in process.env. Check Secrets/Env variables.');
    }

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(`window.__ENGINE_CONFIG__ = { 
  GEMINI_API_KEY: "${key}",
  lastUpdated: "${new Date().toISOString()}",
  source: "${source}",
  envKeysDetected: ${JSON.stringify(keys.map(k => ({ name: k.name, len: k.val.length })))}
}; console.log('Executive Engine: Bridge Connected via ${source}');`);
  });

  // 2. MIDDLEWARES
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
