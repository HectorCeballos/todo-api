const db = require('./database');

const seedTasks = [
  { title: 'Learn Node.js', description: 'Build a REST API from scratch' },
  { title: 'Learn SQLite', description: 'Connect a real database to the API' },
  { title: 'Buy groceries', description: 'Milk, eggs, bread' }
];

const insert = db.prepare(`
  INSERT INTO tasks (title, description) VALUES (@title, @description)
`);

const insertMany = db.transaction((tasks) => {
  for (const task of tasks) {
    insert.run(task);
  }
});

insertMany(seedTasks);
console.log('Database seeded successfully!');