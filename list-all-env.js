import fs from 'fs';
const envKeys = Object.keys(process.env).sort();
fs.writeFileSync('all-env-keys.json', JSON.stringify(envKeys, null, 2));
console.log('All env keys written to all-env-keys.json');
