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

  return {
    base: './',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.LLAVE_EXPERTA || env.LLAVE_EXPERTA || ""),
      '__GEMINI_API_KEY__': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.LLAVE_EXPERTA || env.LLAVE_EXPERTA || ""),
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
