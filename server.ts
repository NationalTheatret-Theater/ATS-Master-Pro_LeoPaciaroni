import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, SchemaType } from '@google/genai';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Robust API Key recovery for Server-side.
 */
function getApiKey(): string {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.LLAVE_EXPERTA,
    process.env.VITE_LLAVE_EXPERTA,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY
  ];

  for (const key of keys) {
    if (key && key !== 'undefined' && key !== 'null' && key.length > 10 && key.startsWith('AIza')) {
      return key;
    }
  }
  return '';
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware with large limits for CV texts
  app.use(express.json({ limit: '50mb' }));

  // Debug middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API Request] ${req.method} ${req.path}`);
    }
    next();
  });

  // API Proxy for Gemini
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        console.error("API Key not found in server environment");
        return res.status(500).json({ 
          error: "ERR_NO_KEY",
          message: "No se detectó una llave de API válida en el servidor. Por favor, asegúrate de haber configurado el Secret 'LLAVE_EXPERTA' (icono de llave 🔑) en el panel lateral superior y haber pulsado 'Restart Server'." 
        });
      }

      const { model, contents, config } = req.body;
      
      console.log(`Calling Gemini with model: ${model}`);
      
      const genAI = new GoogleGenAI(apiKey);
      const aiModel = genAI.getGenerativeModel({ model });
      
      const result = await aiModel.generateContent({
        contents,
        generationConfig: config
      });

      const response = await result.response;
      const text = response.text();
      
      console.log(`Gemini response received (${text.length} chars)`);
      res.json({ text });
    } catch (error: any) {
      console.error("AI Proxy Error details:", error);
      res.status(500).json({ 
        error: error.message || "Internal Server Error during AI generation",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Diagnostic Endpoint
  app.get('/api/diag', (req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      hasKey: !!getApiKey(),
      keyStart: getApiKey().substring(0, 5) + '...',
      envKeys: Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('LLAVE'))
    });
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
    console.log(`[Executive Engine] Server running on http://localhost:${PORT}`);
    console.log(`[Executive Engine] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Global error handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
