require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const mongoose = require('mongoose');

var authRouter = require('./routes/auth');
var sensorDataRouter = require('./routes/sensorData');
var transactionsRouter = require('./routes/transactions')
const toggleRouter = require('./routes/toggle');

var app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())

app.use('/auth', authRouter);
app.use('/sensorData', sensorDataRouter);
app.use('/tx',transactionsRouter)
app.use('/toggle', toggleRouter);


module.exports = app;

