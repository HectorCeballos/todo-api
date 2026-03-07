const express = require('express');
const tasksRouter = require('./routes/tasks');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/tasks', tasksRouter);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Todo API is running' });
});

module.exports = app;