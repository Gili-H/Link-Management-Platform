require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/user.routes');
const linkRoutes = require('./routes/link.routes');
const linkController = require('./controllers/link.controller');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);

app.get('/:id', linkController.getLinkByIdAndRedirect);

// Database connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});