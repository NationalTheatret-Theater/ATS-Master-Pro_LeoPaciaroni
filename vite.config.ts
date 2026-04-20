import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Build-time diagnostic log to file
  const diag = {
    mode,
    timestamp: new Date().toISOString(),
    process_env_GEMINI: !!process.env.GEMINI_API_KEY,
    env_GEMINI: !!env.GEMINI_API_KEY,
    process_env_LLAVE: !!process.env.LLAVE_EXPERTA,
    env_LLAVE: !!env.LLAVE_EXPERTA,
    all_process_keys: Object.keys(process.env).filter(k => k.includes('LLAVE') || k.includes('GEMINI'))
  };
  fs.writeFileSync('vite-diag.json', JSON.stringify(diag, null, 2));

  // Priority recovery: Find ANY key that looks like a Gemini key
  const foundKey = process.env.GEMINI_API_KEY || 
                   env.GEMINI_API_KEY || 
                   process.env.LLAVE_EXPERTA || 
                   env.LLAVE_EXPERTA ||
                   process.env.VITE_LLAVE_EXPERTA ||
                   env.VITE_LLAVE_EXPERTA ||
                   process.env.AI_KEY || 
                   "";

  return {
    base: './',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(foundKey),
      'process.env.LLAVE_EXPERTA': JSON.stringify(foundKey),
      'process.env.VITE_LLAVE_EXPERTA': JSON.stringify(foundKey),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(foundKey),
      '__GEMINI_API_KEY__': JSON.stringify(foundKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
