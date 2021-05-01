const { Router } = require('express');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import Routes
const authRoute = require('./routes/authenticate');
const contactsRoute = require('./routes/contacts');

dotenv.config();

mongoose.connect(
    process.env.DB_CONNECT, 
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('[Giftory] Connected to database.')
);

// Middlewares
app.use(express.json());

// Route Middleware
app.use('/api/user', authRoute);
app.use('/api/contacts', contactsRoute);

app.listen(8000, () => console.log('[Giftory] Server initialized.'));