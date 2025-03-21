import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});