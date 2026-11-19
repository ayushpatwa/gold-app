// scripts/test-angel.js - Test script for Angel One SmartAPI connection
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTOTP, loginAngelOne, fetchAngelOneCommodities } from '../api/angelone.js';

// Minimal .env loader if dotenv is not yet installed
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

async function runTest() {
  console.log('--- 🧪 Testing Angel One SmartAPI Connection ---');
  console.log('API Key:', process.env.ANGEL_API_KEY || '(Not set)');
  console.log('Client Code:', process.env.ANGEL_CLIENT_CODE || '(Not set)');
  console.log('MPIN:', process.env.ANGEL_MPIN ? '****' : '(Not set)');
  console.log('TOTP Secret:', process.env.ANGEL_TOTP_SECRET ? 'Configured' : '(Not set)');
  console.log('Fixie Proxy:', process.env.FIXIE_URL || '(None - Direct connection)');

  if (!process.env.ANGEL_CLIENT_CODE || !process.env.ANGEL_MPIN || !process.env.ANGEL_TOTP_SECRET) {
    console.log('\n⚠️ Please fill in ANGEL_CLIENT_CODE, ANGEL_MPIN, and ANGEL_TOTP_SECRET in your .env file.');
    return;
  }

  try {
    const totp = generateTOTP(process.env.ANGEL_TOTP_SECRET);
    console.log('\n1. Generated 6-digit TOTP:', totp);

    console.log('2. Authenticating with Angel One...');
    const token = await loginAngelOne();
    console.log('✅ Login successful! Session token acquired.');

    console.log('3. Fetching live MCX Gold and Silver quotes...');
    const quotes = await fetchAngelOneCommodities();
    console.log('\n📊 Live Commodities Data:');
    console.log('Gold:', quotes.gold ? `${quotes.gold.tradingSymbol}: ₹${quotes.gold.ltp}` : 'Not available');
    console.log('Silver:', quotes.silver ? `${quotes.silver.tradingSymbol}: ₹${quotes.silver.ltp}` : 'Not available');
    console.log('\n🎉 Connection working perfectly!');
  } catch (err) {
    console.error('\n❌ Error connecting to Angel One:', err.message);
  }
}

runTest();
