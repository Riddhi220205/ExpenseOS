const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Initialize SQLite database
const db = new Database(path.join(dataDir, 'expenses.db'));

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {

  res.json({ status: 'ok', timestamp: new Date().toISOString() });
  res.send('API is running');
});

// GET all expenses
app.get('/api/expenses', (req, res) => {
  try {
    const { category, from, to, sort = 'date', order = 'DESC' } = req.query;
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (from) { query += ' AND date >= ?'; params.push(from); }
    if (to)   { query += ' AND date <= ?'; params.push(to); }

    const allowedSort = ['date', 'amount', 'title', 'created_at'];
    const safeSort = allowedSort.includes(sort) ? sort : 'date';
    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${safeSort} ${safeOrder}`;

    const expenses = db.prepare(query).all(...params);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET summary
app.get('/api/expenses/summary', (req, res) => {
  try {
    const total = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses').get();
    const byCategory = db.prepare(
      'SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses GROUP BY category ORDER BY total DESC'
    ).all();
    const monthly = db.prepare(
      `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total, COUNT(*) as count
       FROM expenses GROUP BY month ORDER BY month DESC LIMIT 6`
    ).all();
    const recent = db.prepare('SELECT * FROM expenses ORDER BY created_at DESC LIMIT 5').all();

    res.json({ total: total.total, byCategory, monthly, recent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single expense
app.get('/api/expenses/:id', (req, res) => {
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  res.json(expense);
});

// POST create expense
app.post('/api/expenses', (req, res) => {
  try {
    const { title, amount, category, date, note } = req.body;
    if (!title || !amount || !category || !date)
      return res.status(400).json({ error: 'title, amount, category, date are required' });
    if (isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ error: 'amount must be a positive number' });

    const stmt = db.prepare(
      'INSERT INTO expenses (title, amount, category, date, note) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(title, Number(amount), category, date, note || '');
    const created = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update expense
app.put('/api/expenses/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });

    const { title, amount, category, date, note } = req.body;
    db.prepare(
      'UPDATE expenses SET title=?, amount=?, category=?, date=?, note=? WHERE id=?'
    ).run(
      title || existing.title,
      amount != null ? Number(amount) : existing.amount,
      category || existing.category,
      date || existing.date,
      note != null ? note : existing.note,
      req.params.id
    );
    const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE expense
app.delete('/api/expenses/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Expense not found' });
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted successfully', id: req.params.id });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Expense Tracker API running on port ${PORT}`);
});

module.exports = app;
