// proxy.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache();
const PORT = process.env.PORT || 4000;

async function getAccessToken() {
  const cached = cache.get('access_token');
  if (cached) return cached;

  const tokenRes = await axios.post(
    process.env.OAUTH_TOKEN_URL,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const token = tokenRes.data.access_token;
  const expiresIn = tokenRes.data.expires_in;

  cache.set('access_token', token, expiresIn - 60); // refresh 1 min early
  return token;
}

app.use('/dynatrace', async (req, res) => {
  try {
    const token = await getAccessToken();

    const dynatracePath = req.originalUrl.replace('/dynatrace', '');
    const dynatraceUrl = `${process.env.DYNATRACE_API_BASE}${dynatracePath}`;

    const dynatraceRes = await axios.get(dynatraceUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: req.query,
    });

    res.status(dynatraceRes.status).json(dynatraceRes.data);
  } catch (err) {
    console.error('Error proxying to Dynatrace:', err.message);
    res.status(500).json({ error: 'Failed to fetch data from Dynatrace' });
  }
});

app.listen(PORT, () => {
  console.log(`OAuth Dynatrace proxy running on http://localhost:${PORT}`);
});
