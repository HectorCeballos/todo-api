const express = require('express');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Todo API is running' });
});

// Error Handler - must be last
app.use(errorHandler);

module.exports = app;