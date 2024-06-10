// backend/server.js
const express = require('express');
const contractRoutes = require('./routes/contract');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/contract', contractRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
