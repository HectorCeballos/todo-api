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
  const { title, description } = req.body;
  
  const task = {
    id: nextId++,
    title,
    description: description || '',
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
  
  const { title, description, completed } = req.body;
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