import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg'; // Import the default export from pg

const { Pool } = pkg; // Destructure Pool from the default export
const app = express();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Render PostgreSQL
});


// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Example API Route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// New API Route for test data
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM test_table'); // Query the test_table
    res.json(result.rows); // Send the data as JSON
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving test data');
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
