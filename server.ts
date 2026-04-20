import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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

  app.use(express.json({ limit: '50mb' }));

  // API Proxy for Gemini
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        return res.status(500).json({ 
          error: "ERR_NO_KEY",
          message: "No se detectó una llave de API válida en el servidor. Por favor, asegúrate de haber configurado el Secret 'LLAVE_EXPERTA' en el panel lateral y haber pulsado 'Restart Server'." 
        });
      }

      const { model, contents, config } = req.body;
      const genAI = new GoogleGenAI(apiKey);
      const aiModel = genAI.getGenerativeModel({ model });
      
      const result = await aiModel.generateContent({
        contents,
        generationConfig: config
      });

      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Diagnostic Endpoint
  app.get('/api/diag', (req, res) => {
    res.json({
      timestamp: new Date().toISOString(),
      hasKey: !!getApiKey(),
      keyLength: getApiKey().length,
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
