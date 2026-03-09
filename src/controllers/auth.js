const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { registerSchema, loginSchema } = require('../validators/auth');

const register = (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ data: null, error: result.error.format() });
  }

  const { username, email, password } = result.data;

  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return res.status(400).json({ data: null, error: 'Email already in use' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const insert = db.prepare(`
    INSERT INTO users (username, email, password) VALUES (@username, @email, @password)
  `);

  const info = insert.run({ username, email, password: hashedPassword });
  const user = db.prepare('SELECT id, username, email, createdAt FROM users WHERE id = ?').get(info.lastInsertRowid);

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ data: { user, token }, error: null });
};

const login = (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ data: null, error: result.error.format() });
  }

  const { email, password } = result.data;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ data: null, error: 'Invalid email or password' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ data: null, error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  const { password: _, ...safeUser } = user;
  res.status(200).json({ data: { user: safeUser, token }, error: null });
};

module.exports = { register, login };