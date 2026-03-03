// server.js — THE MAIN FILE. Run this to start your API.

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { connectDB }          = require('./config/database');
const servicesRoutes         = require('./routes/services');
const leadsRoutes            = require('./routes/leads');
const caseStudiesRoutes      = require('./routes/caseStudies');
const postsRoutes            = require('./routes/posts');
const teamRoutes             = require('./routes/team');
const testimonialsRoutes     = require('./routes/testimonials');
const authRoutes             = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE — runs on every request
app.use(cors());
app.use(express.json());

// ROUTES — maps URLs to handler files
app.use('/api/services',     servicesRoutes);
app.use('/api/leads',        leadsRoutes);
app.use('/api/case-studies', caseStudiesRoutes);
app.use('/api/posts',        postsRoutes);
app.use('/api/team',         teamRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/auth',         authRoutes);

// Health check — visit http://localhost:3000/api/health to confirm it's working
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Comex API is running!', time: new Date() });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Server error. Please try again.' });
});

// Start: connect to DB first, then open the server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Comex API running at http://localhost:${PORT}`);
  });
}
startServer();