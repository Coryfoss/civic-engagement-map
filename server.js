import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Example API Route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// For any other routes, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
