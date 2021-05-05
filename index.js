const { Router } = require('express');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

// Import Routes
const authRoute = require('./routes/authenticate');
const contactsRoute = require('./routes/contacts');

app.get('/', function (req, res, next) {
    res.render('index', { title: 'Giftstory' });
});

mongoose.connect(
    process.env.DB_CONNECT, 
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('[Giftstory] Connected to database.')
);

// Middlewares
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

// Route Middleware
app.use('/api/user', authRoute);
app.use('/api/contacts', contactsRoute);

// View Engine
app.set('view engine', 'ejs');

app.listen(process.env.PORT || 8000, () => console.log('[Giftstory] Server initialized.'));