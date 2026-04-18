import fs from 'fs';
const info = {
  GEMINI_API_KEY_ENV: !!process.env.GEMINI_API_KEY,
  GEMINI_API_KEY_ENV_LENGTH: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
  ALL_ENV_KEYS: Object.keys(process.env).filter(k => k.includes('GEMINI')),
  TIMESTAMP: new Date().toISOString()
};
fs.writeFileSync('env-check.json', JSON.stringify(info, null, 2));
console.log('Env check written to env-check.json');
