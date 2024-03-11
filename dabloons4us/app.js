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
var bankRouter      = require('./routes/bank');
var usersRouter     = require('./routes/users');
var trasferRouter   = require('./routes/transfer');
var redeemRouter    = require('./routes/redeem');
var registerRouter  = require('./routes/register');
var loginRouter     = require('./routes/login');
var logoutRouter    = require('./routes/logout');
const { randomUUID } = require('crypto');

mongoose.connect('mongodb://127.0.0.1:27017/dabloons').then(() => {
  console.log('Connection success');
}).catch(error => {
  console.error('Connection fail', error);
});

var app = express();

const redisClient = redis.createClient({
    url: "redis://127.0.0.1:6379",
});
redisClient.connect().catch(console.error);

setInterval(()=>{
  redisSessions(redisClient);
}, 1000 * 60 * 5); // Every 5 minutes.

app.locals.redis = redisClient;
app.locals.salt = '';
app.locals.initial_dabloons = 20;
app.locals.redeemable_dabloons = 10;
app.locals.redeem_timeout = (1000 * 60 * 60 * 23); // 23 hrs.
app.locals.secret = '';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new RedisStore({ client: redisClient }),
  genid: function(req) {
    return randomUUID()
  },
  resave: true,
  saveUninitialized: true,
  secret: app.locals.secret,
  cookie: {
    maxAge: (30 * 24 * 60 * 60 * 1000)
  },
  createdAt: Date.now
}));

app.use('/',         indexRouter);
app.use('/bank',     bankRouter);
app.use('/users',    usersRouter);
app.use('/transfer', trasferRouter);
app.use('/redeem',   redeemRouter);
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

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
}

app.listen(80, '0.0.0.0');

async function redisSessions(redisClient) {
  sessionCount = 0;
  for await(const key of redisClient.scanIterator()) {
    sessionData   = redisClient.get(await key);
    sessionObject = JSON.parse(await sessionData);
    if (!sessionObject.username) {
      redisClient.del(await key);
      sessionCount++;
    }
  }
  console.log(`Clear ${await sessionCount} empty sessions.`);
}

module.exports = app;
