import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './database.js';
import { 
  setMongoConnectedStatus, 
  seedDB, 
  getAllStaff, 
  createStaff, 
  getAllTasks, 
  createTask, 
  updateTask, 
  deleteTask 
} from './dbStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await getAllStaff();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const newStaff = await createStaff(req.body);
    res.status(201).json(newStaff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = await createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updated = await updateTask(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const deleted = await deleteTask(req.params.id);
    res.json(deleted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Serve static frontend files in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      // If index.html is missing (e.g. during local dev without build folder), show a friendly backend message
      res.status(200).send('MSV Associates API is running. Build the frontend to view the complete dashboard.');
    }
  });
});

// Startup Database and Server Connection
const startServer = async () => {
  const isConnected = await connectDB();
  setMongoConnectedStatus(isConnected);
  await seedDB();
  
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` MSV Insurance Server running on port ${PORT}`);
    console.log(` Server mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===================================================`);
  });
};

startServer();
