const express = require('express');
const path = require('path');

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, 'public')));

// Inject backend URL into config endpoint
app.get('/config', (req, res) => {
  res.json({
    backendUrl: process.env.BACKEND_URL || 'http://localhost:3000'
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend listening at http://localhost:${port}`);
});
