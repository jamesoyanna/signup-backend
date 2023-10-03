const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors  = require('cors')
const mongoose = require('mongoose')

// Route
const userRoutes = require('./routes/userRoutes');

const passport = require('passport')
require('dotenv').config()

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use((cors()))
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req, res,) => {
    res.send("Welcome Novu backend")
})


/* passport */
app.use(passport.initialize())
require('./security/passport')(passport)

/* connect to database */
mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("MongoDB Connected Successfully..."))
.catch(err=>console.log(err))

app.use('/api/v1/users', userRoutes);

module.exports = app;

