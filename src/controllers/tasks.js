const db = require('../db/database');
const { createTaskSchema, updateTaskSchema } = require('../validators/tasks');

const getAllTasks = (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.status(200).json({ data: tasks, error: null });
};

const getTaskById = (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

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

  const { title, description } = result.data;

  const insert = db.prepare(`
    INSERT INTO tasks (title, description) VALUES (@title, @description)
  `);

  const info = insert.run({ title, description: description || '' });
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);

  res.status(201).json({ data: task, error: null });
};

const updateTask = (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

  if (!task) {
    return res.status(404).json({ data: null, error: 'Task not found' });
  }

  const result = updateTaskSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ data: null, error: result.error.format() });
  }

  const { title, description, completed } = result.data;

  const updatedTask = {
    title: title !== undefined ? title : task.title,
    description: description !== undefined ? description : task.description,
    completed: completed !== undefined ? (completed ? 1 : 0) : task.completed,
    id: req.params.id
  };

  db.prepare(`
    UPDATE tasks SET title = @title, description = @description, completed = @completed WHERE id = @id
  `).run(updatedTask);

  const fresh = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.status(200).json({ data: fresh, error: null });
};

const deleteTask = (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

  if (!task) {
    return res.status(404).json({ data: null, error: 'Task not found' });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).send();
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };