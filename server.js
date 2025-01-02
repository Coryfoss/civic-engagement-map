import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg'; // PostgreSQL library
import { OpenAI } from "openai";
import cors from 'cors';


const { Pool } = pkg; // Destructure Pool from pg

const app = express();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// OpenAI configuration
const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this key is in your .env file
});

// Middleware to parse JSON request bodies
app.use(express.json());
//Using CORS
app.use(cors()); // Enable CORS for all routes

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Example API Route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// New API Route for test data
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM test_table');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving test data');
  }
});

// New API Route for OpenAI GPT
app.post('/api/gpt', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).send('Prompt is required');
  }

  try {
    const response = await openAI.chat.completions.create({
      model: 'gpt-4o', // Correct model name
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 50,
    });

    res.json({ response: response.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Error with OpenAI API:', err.message);
    res.status(500).send('Error processing GPT request');
  }
});
app.get('/api/engagement-data', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT latitude, longitude, intensity FROM civic_engagement'
    );
    console.log('Query Result:', result.rows); // Log the query result
    res.json(result.rows);
  } catch (err) {
    console.error('Error retrieving engagement data:', err);
    res.status(500).json({ error: 'Error retrieving engagement data' });
  }
});

// For any other routes, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
