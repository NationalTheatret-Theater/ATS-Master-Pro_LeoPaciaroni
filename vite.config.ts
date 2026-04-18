import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Build-time diagnostic log
  console.log('--- VITE BUILD DIAGNOSTIC ---');
  console.log('Mode:', mode);
  console.log('process.env.GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  console.log('env.GEMINI_API_KEY present:', !!env.GEMINI_API_KEY);
  console.log('-----------------------------');

  return {
    base: './',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.LLAVE_EXPERTA || env.LLAVE_EXPERTA || ""),
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
