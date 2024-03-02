var createError     = require('http-errors');
var express         = require('express');
var session         = require('express-session');
const redis         = require('redis');
const RedisStore    = require('connect-redis').default;
var path            = require('path');
var cookieParser    = require('cookie-parser');
var logger          = require('morgan');
const mongoose      = require('mongoose');
const { userModel } = require('./models');

var indexRouter     = require('./routes/index');
var usersRouter     = require('./routes/users');
var registerRouter  = require('./routes/register');
var trasferRouter   = require('./routes/transfer');
var loginRouter     = require('./routes/login');
var logoutRouter    = require('./routes/logout');

mongoose.connect('mongodb://127.0.0.1:27017/dabloons').then(() => {
  console.log('Connection success');
}).catch(error => {
  console.error('Connection fail', error);
});

var app = express();

const redisClient = redis.createClient({
    url: "redis://localhost:6379",
});
redisClient.connect().catch(console.error);

app.locals.salt = 'NbiyU9TwbYz6sjc0hrFYSbjV6yaeoai1Y7US5mM';
app.locals.initial_dabloons = 20;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: new RedisStore({ client: redisClient }),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
  secret: 'P&;nF{8VaC}b@+,i:V4f$ND$xqF9nYr.'
}));

app.use('/',         indexRouter);
app.use('/users',    usersRouter);
app.use('/transfer', trasferRouter)
app.use('/register', registerRouter);
app.use('/login',    loginRouter);
app.use('/logout',   logoutRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
