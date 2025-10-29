const express = require('express');
const path = require('path');
const db = require('./database/repository');
const interestScheduler = require('./services/interestScheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Initialize database
async function initializeApp() {
  try {
    await db.initializeDatabase();
    console.log('Database initialized successfully');

    // Start interest scheduler
    interestScheduler.startScheduler();
    console.log('Interest scheduler started');

    // Routes
    const accountRoutes = require('./routes/accountRoutes');
    app.use('/', accountRoutes);

    // Start server
    app.listen(PORT, () => {
      console.log(`Kids Finance Tracker running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

initializeApp();
