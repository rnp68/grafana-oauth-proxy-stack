import express from 'express';
import debug from 'debug';

const app = express();
const debugLog = debug('mock-dynatrace-api');
const PORT = 5000;

// Enable debug logging
debugLog.enabled = true;

// Minimal configuration
app.disable('x-powered-by');
app.use(express.json({ limit: '100b' }));

// Single metric endpoint
app.get('/v1/metrics', (req, res) => {
  res.json([{
    metric: "cpu.usage",
    value: Math.random() * 100,
    timestamp: Date.now()
  }]);
});

// Minimal health check
app.get('/health', (req, res) => res.send('OK'));

// Minimal error handling
app.use((err, req, res, next) => res.status(500).send('Error'));

app.listen(PORT, () => {
  console.log(`🟢 Mock Dynatrace API running at http://localhost:${PORT}`);
});
