const { createTaskSchema, updateTaskSchema } = require('../validators/tasks');

let tasks = [];
let nextId = 1;

const getAllTasks = (req, res) => {
  res.status(200).json({ data: tasks, error: null });
};

const getTaskById = (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));

  if (!task) {
    return res.status(404).json({ data: null, error: 'Task not found' });
  }

  res.status(200).json({ data: task, error: null });
};

const createTask = (req, res) => {
  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ data: null, error: result.error.format() });
  }

  const task = {
    id: nextId++,
    title: result.data.title,
    description: result.data.description || '',
    completed: false,
    createdAt: new Date()
  };

  tasks.push(task);
  res.status(201).json({ data: task, error: null });
};

const updateTask = (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));

  if (!task) {
    return res.status(404).json({ data: null, error: 'Task not found' });
  }

  const result = updateTaskSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ data: null, error: result.error.format() });
  }

  const { title, description, completed } = result.data;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (completed !== undefined) task.completed = completed;

  res.status(200).json({ data: task, error: null });
};

const deleteTask = (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ data: null, error: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.status(204).send();
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };