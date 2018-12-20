const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

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
