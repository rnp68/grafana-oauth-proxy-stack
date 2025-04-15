const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/v1/metrics', (req, res) => {
  res.json({
    metric: "cpu.usage",
    value: Math.random() * 100,
    timestamp: Date.now()
  });
});

app.listen(PORT, () => {
  console.log(`🟢 Mock Dynatrace API running at http://localhost:${PORT}`);
});
