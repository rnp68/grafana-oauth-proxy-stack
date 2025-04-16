import express from 'express';
import axios from 'axios';
import debug from 'debug';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const debugLog = debug('oauth-proxy');

// Enable debug logging
debugLog.enabled = true;

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
    debugLog('Using cached token');
    return cachedToken;
  }

  debugLog('Requesting new token from', TOKEN_URL);
  try {
    const resp = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'openid profile email'
      }),
      {
        auth: { username: CLIENT_ID, password: CLIENT_SECRET },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    debugLog('Token response:', resp.data);
    cachedToken = resp.data.access_token;
    tokenExpiry = now + (resp.data.expires_in * 1000) - 5000;
    return cachedToken;
  } catch (err) {
    debugLog('Token request failed:', err.response?.data || err.message);
    throw err;
  }
}

// Middleware to log requests
app.use((req, res, next) => {
  debugLog(`${req.method} ${req.path} - Headers:`, req.headers);
  next();
});

// Health check endpoint for Grafana
app.get('/api/datasources/proxy/uid/:uid', async (req, res) => {
  try {
    debugLog('Grafana datasource test request received');
    const token = await getToken();
    debugLog('Token obtained successfully');
    
    // Forward the request to the Dynatrace API
    const result = await axios.get(`${DYNATRACE_API_BASE}/v1/metrics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    debugLog('Dynatrace API response:', result.data);
    res.json(result.data);
  } catch (err) {
    debugLog('Health check failed:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: "Health check failed",
      details: err.response?.data || err.message
    });
  }
});

app.get('/dynatrace/metrics', async (req, res) => {
  try {
    debugLog('Metrics request received');
    const token = await getToken();
    const result = await axios.get(`${DYNATRACE_API_BASE}/v1/metrics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    debugLog('Dynatrace API response:', result.data);
    res.json(result.data);
  } catch (err) {
    debugLog('Proxy error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: "Proxy error",
      details: err.response?.data || err.message
    });
  }
});

// Add root path handler
app.get('/', async (req, res) => {
  try {
    debugLog('Root path request received');
    const token = await getToken();
    const result = await axios.get(`${DYNATRACE_API_BASE}/v1/metrics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    debugLog('Dynatrace API response:', result.data);
    res.json(result.data);
  } catch (err) {
    debugLog('Proxy error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: "Proxy error",
      details: err.response?.data || err.message
    });
  }
});

app.get('/dynatrace/:path', async (req, res) => {
  try {
    debugLog(`Path request received: ${req.params.path}`);
    const token = await getToken();
    const result = await axios.get(`${DYNATRACE_API_BASE}/v1/${req.params.path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    debugLog('Dynatrace API response:', result.data);
    res.json(result.data);
  } catch (err) {
    debugLog('Proxy error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: "Proxy error",
      details: err.response?.data || err.message
    });
  }
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create HTTP server
const server = createServer(app);

// Listen on both IPv4 and IPv6
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🛡️ OAuth Proxy listening on port ${PORT} (IPv4 and IPv6)`);
  debugLog('Environment variables:');
  debugLog('TOKEN_URL:', TOKEN_URL);
  debugLog('CLIENT_ID:', CLIENT_ID);
  debugLog('DYNATRACE_API_BASE:', DYNATRACE_API_BASE);
});
