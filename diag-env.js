import fs from 'fs';
const info = {
  SEARCH_RESULTS: Object.keys(process.env).filter(k => k.includes('KEY') || k.includes('API') || k.includes('GEMINI') || k.includes('GOOGLE')),
  ENV_VARS: Object.keys(process.env).length,
  TIMESTAMP: new Date().toISOString()
};
fs.writeFileSync('all-keys.json', JSON.stringify(info, null, 2));
console.log('Diagnostic written to all-keys.json');
