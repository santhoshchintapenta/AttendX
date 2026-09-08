const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'AttendX API is running' });
});

const authRoutes = require('./routes/authRoutes');

// Mount routers
app.use('/api/auth', authRoutes);

const academicRoutes = require('./routes/academicRoutes');
const studentRoutes = require('./routes/studentRoutes');
const bulkUploadRoutes = require('./routes/bulkUploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// We will mount routers here later
app.use('/api/academic', academicRoutes);
app.use('/api/students/bulk-upload', bulkUploadRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
