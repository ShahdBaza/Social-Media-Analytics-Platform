// app.js — Entry point
const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API root
app.get('/', (req, res) => {
  res.json({
    name: 'Social Media Analytics API',
    version: '1.0.0',
    patterns: ['Chain of Responsibility', 'Adapter', 'Command', 'Observer'],
    principles: ['SRP', 'OCP', 'LSP', 'ISP', 'DIP'],
    endpoints: '/api/v1'
  });
});

app.use('/api/v1', routes);

// Global error handler (SRP: single place for error handling)
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Social Analytics API running on http://localhost:${PORT}`);
  console.log('📋 Patterns active: Chain, Adapter, Command, Observer');
  console.log('🏗️  SOLID principles applied across all modules\n');
});

module.exports = app;
