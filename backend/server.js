const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const newsRoutes = require('./routes/newsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows frontend (port 3000) to talk to backend (port 5000)
app.use(express.json());

// Database connection (Optional - remove this block if you skip MongoDB)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/news', newsRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));