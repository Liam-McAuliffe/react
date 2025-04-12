import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { POST as geminiPostHandler } from './src/api/gemini/route.js';
dotenv.config({ path: '.env.local' });

const app = express();
const port = 3001;

// Setup middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.post('/api/gemini', (req, res) => {
  geminiPostHandler(req, res);
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);

  if (!process.env.VITE_GEMINI_API_KEY) {
    console.warn(
      'Warning: VITE_GEMINI_API_KEY was not found in the environment variables for server.js.'
    );
  }
});
