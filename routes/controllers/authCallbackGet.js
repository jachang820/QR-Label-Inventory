const passport = require('passport');
const axios = require('axios');
const jwt = require('jsonwebtoken');

module.exports = [

  /* Confirm authentication with Auth0 and get user details. */
  (req, res, next) => {
    passport.authenticate('auth0', function(err, user, info) {
      if (err || !user) { 
        err.custom = "An exception has occurred.";
        return next(err);
      } else {
        res.locals.user = user;
        return next();
      }
    })(req, res, next);
  },

  /* Add user details to request. */
  (req, res, next) => {
    req.logIn(res.locals.user, (err) => {
      if (err) {
        err.custom = "Login failed.";
        return next(err);
      } else {
        return next();
      }
    });
  },

  /* Match user against database to determine if the email
     used has been registered. */
  (req, res, next) => {
    axios.defaults.baseURL = process.env.API_PATH;
    let user = res.locals.user;
    axios.get(`/users/${user.emails[0].value}`).then(response => {
      if (!response.data) {
        throw Error;
      }
      
      res.locals.firstname = response.data.firstname;
      res.locals.lastname = response.data.lastname;
      res.locals.email = response.data.email;
      res.locals.role = response.data.role;
      return next();
      
    }).catch((err) => {
      err.custom = "Invalid user. Please contact your administrator.";
      return next(err);
    })
  },

  /* Sign a JSON Web Token with a secret to return a security
     signature. The signature along with the secret can be
     used to determine user role. */
  (req, res, next) => {
    req.user.token = jwt.sign({
      firstname: res.locals.firstname,
      lastname: res.locals.lastname,
      email: res.locals.email,
      role: res.locals.role
    },
    process.env.SECURITY_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1 day'
    });
    return next();
  },

  /* Go to dashboard or some other page user tried to visit. */
  (req, res, next) => {
    const returnTo = req.session.returnTo;
    delete req.session.returnTo;
    return res.redirect(returnTo || '/dashboard');
  }, 

  /* An error has occurred. Return to main page with an error 
     message previously generated. */
  (err, req, res, next) => {
    return res.render('index', {
      errors: { msg: err }
    });
  }
  
];