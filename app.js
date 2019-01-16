const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const hbs = require('hbs');

const hbsRoles = require('./helpers/hbsRoles');
const hbsEquals = require('./helpers/hbsEquals');
const userInViews = require('./middleware/userInViews');
const indexRouter = require('./routes/index');

dotenv.load();

// configure passport to use auth0
var strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/auth/callback'
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile)
  }
);

passport.use(strategy);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
})


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// register all partials
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// register all helpers
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// expose locals as template data
hbs.localsAsTemplateData(app);

// register Handlebars helpers
hbsRoles(hbs);
hbsEquals(hbs);

// config session cookie
var sess = {
  secret: '7B1A5824E9F9F',
  cookie: {},
  resave: false,
  saveUninitialized: true
};

if (app.get('env') === 'production') {
  session.cookie.secure = true; // require https
}

app.use(session(sess));

app.use(passport.initialize());
app.use(passport.session());

app.use(userInViews());
app.use('/', indexRouter);

/* Throw 404 if somehow none of the middleware produced any action. */
app.use((req, res, next) => {
  next(createError(404));
});

/* Show error page with stack trace. Note that the error object
   is as passed in from an axios call. Not all functions
   generate the same fields. In particular, express rarely
   generates its own status codes and messages. */
app.use((err, req, res, next) => {
  /* If a header is sent in the middle of this custom error
     handler, delegate the default handler. */
  if (res.headersSent) {
    return next(err);
  }

  /* These are fields provided by axios. */
  res.locals.status = err.status;
  if (err.response) {
    res.locals.status = err.response.status;
    res.locals.statusText = err.response.statusText;
  }
  if (res.locals.status == null) {
    res.locals.status = 404;
  }

  if (err.config) {
    res.locals.query = `${err.config.method} ${err.config.url}`;
  }

  /* Provide error stack in development */
  res.locals.message = err.message;
  res.locals.custom = err.custom;
  if (req.app.get('env') === 'development') {
    res.locals.stack = err.stack;
  }

  /* This should be the page last visited. */
  res.locals.url = req.originalUrl;

  /* Render the error page */
  res.locals.css = ['error.css'];
  res.status(res.locals.status || err.status || 500);
  res.render('error');
});

module.exports = app;
