const passport = require('passport');
const jwt = require('jsonwebtoken');
const setupAxios = require('../../helpers/setupAxios');
const https = require('https');
const fs = require('fs');
const url = require('url');

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
    const axios = setupAxios();

    let email = res.locals.user.emails[0].value;
    axios.get(`/users/${email}`).then(response => {
      if (!response.data) {
        throw Error("No users selected.");
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

  /* Save user thumbnail. */
  (req, res, next) => {
    /* Download options. */
    const picUrl = url.parse(res.locals.user.picture);
    const options = {
      host: picUrl.hostname,
      port: 80,
      path: picUrl.pathname
    };

    /* Write options. */
    let email = res.locals.user.emails[0].value.replace('@', '-');
    const saveAs = `${__dirname}/../../public/images/thumbs/${email}.jpg`;
    const writeOpts = { encoding: 'binary', flag: 'w' };

    /* GET file by appending chunks of binary data. */
    const request = https.get(res.locals.user.picture, (response) => {
      let imagedata = '';
      response.setEncoding('binary');
      response.on('data', (chunk) => {
        imagedata += chunk;
      });

      /* Save file as /public/images/thumbs/[user email].jpg. */
      response.on('end', () => {
        fs.writeFile(saveAs, imagedata, writeOpts, (err) => {
          if (err) throw err;
        });
      });
    });
    return next();
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
    return res.redirect(returnTo || '/customer_orders');
  }, 

  /* An error has occurred. Return to main page with an error 
     message previously generated. */
  (err, req, res, next) => {
    console.log(err);
    return res.render('index', {
      errors: [{ msg: err.custom }]
    });
  }
  
];