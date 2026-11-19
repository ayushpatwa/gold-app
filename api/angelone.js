// api/angelone.js - Angel One SmartAPI Connector with Automated TOTP Login
import crypto from 'crypto';

// Pure JavaScript RFC 6238 TOTP Generator (Zero external dependencies)
function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const clean = (base32 || '').replace(/=+$/, '').toUpperCase().replace(/\s+/g, '');
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTOTP(secret, step = 30) {
  if (!secret) return '';
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const time = Math.floor(epoch / step);
  const timeBytes = Buffer.alloc(8);
  timeBytes.writeBigUInt64BE(BigInt(time), 0);

  const hmac = crypto.createHmac('sha1', key).update(timeBytes).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    1000000;
  return code.toString().padStart(6, '0');
}

// In-memory session state
let sessionState = {
  jwtToken: null,
  refreshToken: null,
  feedToken: null,
  expiresAt: 0
};

// Fetch helper with optional Fixie Proxy support
async function smartApiFetch(url, options = {}) {
  const fixieUrl = process.env.FIXIE_URL;
  let fetchOptions = { ...options };

  if (fixieUrl && fixieUrl.trim() !== '') {
    try {
      const { HttpsProxyAgent } = await import('https-proxy-agent');
      const agent = new HttpsProxyAgent(fixieUrl.trim());
      fetchOptions.agent = agent;
    } catch {
      // https-proxy-agent optional
    }
  }

  return await fetch(url, fetchOptions);
}

// 1. Generate Session / Login using TOTP
export async function loginAngelOne() {
  const apiKey = process.env.ANGEL_API_KEY;
  const clientCode = process.env.ANGEL_CLIENT_CODE;
  const mpin = process.env.ANGEL_MPIN;
  const totpSecret = process.env.ANGEL_TOTP_SECRET;

  if (!apiKey || !clientCode || !mpin || !totpSecret) {
    throw new Error('Missing Angel One credentials in environment variables');
  }

  const totp = generateTOTP(totpSecret);
  const clientIp = process.env.STATIC_IP || '139.5.1.214';

  const res = await smartApiFetch(
    'https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': '192.168.0.108',
        'X-ClientPublicIP': clientIp,
        'X-MACAddress': '00:1A:2B:3C:4D:5E',
        'X-PrivateKey': apiKey
      },
      body: JSON.stringify({
        clientcode: clientCode,
        password: mpin,
        totp: totp
      })
    }
  );

  const data = await res.json();
  if (!data.status || !data.data?.jwtToken) {
    throw new Error(data.message || 'Angel One login failed');
  }

  // Token valid for trading session (expires next morning)
  sessionState = {
    jwtToken: data.data.jwtToken,
    refreshToken: data.data.refreshToken,
    feedToken: data.data.feedToken,
    expiresAt: Date.now() + 18 * 60 * 60 * 1000 // 18 hours
  };

  return sessionState.jwtToken;
}

// 2. Ensure Valid Active Token
async function getAuthToken() {
  if (sessionState.jwtToken && Date.now() < sessionState.expiresAt) {
    return sessionState.jwtToken;
  }
  return await loginAngelOne();
}

// 3. Fetch MCX Gold & Silver Quotes
export async function fetchAngelOneCommodities(goldToken, silverToken) {
  const apiKey = process.env.ANGEL_API_KEY;
  const token = await getAuthToken();
  const clientIp = process.env.STATIC_IP || '139.5.1.214';

  // Active December 2026 MCX Futures: GOLD (495213), SILVER (495214)
  const gToken = String(goldToken || process.env.MCX_GOLD_TOKEN || '495213');
  const sToken = String(silverToken || process.env.MCX_SILVER_TOKEN || '495214');

  let res = await smartApiFetch('https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-UserType': 'USER',
      'X-SourceID': 'WEB',
      'X-ClientLocalIP': '192.168.0.108',
      'X-ClientPublicIP': clientIp,
      'X-MACAddress': '00:1A:2B:3C:4D:5E',
      'X-PrivateKey': apiKey,
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      mode: 'FULL',
      exchangeTokens: {
        MCX: [gToken, sToken]
      }
    })
  });

  // If token expired, re-login once and retry
  if (res.status === 401) {
    sessionState.jwtToken = null;
    const newToken = await loginAngelOne();
    res = await smartApiFetch('https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': '192.168.0.108',
        'X-ClientPublicIP': clientIp,
        'X-MACAddress': '00:1A:2B:3C:4D:5E',
        'X-PrivateKey': apiKey,
        'Authorization': `Bearer ${newToken}`
      },
      body: JSON.stringify({
        mode: 'FULL',
        exchangeTokens: {
          MCX: [gToken, sToken]
        }
      })
    });
  }

  const quoteData = await res.json();
  if (!quoteData.status || !quoteData.data?.fetched) {
    throw new Error(quoteData.message || 'Failed to fetch MCX quotes from Angel One');
  }

  const fetched = quoteData.data.fetched;
  const goldQuote = fetched.find((item) => String(item.symbolToken) === gToken) || fetched[0];
  const silverQuote = fetched.find((item) => String(item.symbolToken) === sToken) || fetched[1];

  return {
    gold: goldQuote,
    silver: silverQuote
  };
}
