import express from 'express';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 4000;
const TOKEN_URL = process.env.OAUTH_TOKEN_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const DYNATRACE_API_BASE = process.env.DYNATRACE_API_BASE;

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const resp = await axios.post(
    TOKEN_URL,
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      auth: { username: CLIENT_ID, password: CLIENT_SECRET },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );

  cachedToken = resp.data.access_token;
  tokenExpiry = now + (resp.data.expires_in * 1000) - 5000;
  return cachedToken;
}

app.get('/dynatrace/:path', async (req, res) => {
  try {
    const token = await getToken();
    const result = await axios.get(`${DYNATRACE_API_BASE}/v1/${req.params.path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(result.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Proxy error");
  }
});

app.listen(PORT, () => {
  console.log(`🛡️ OAuth Proxy listening on port ${PORT}`);
});
