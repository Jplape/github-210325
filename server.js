const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Basic route
app.get('/', (req, res) => {
  res.send('Maintenance Manager API');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});