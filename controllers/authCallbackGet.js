const passport = require('passport');
const jwt = require('jsonwebtoken');
const https = require('https');
const fs = require('fs');
const url = require('url');
const Profiles = require('../services/profile');

module.exports = [

  /* Confirm authentication with Auth0 and get user details. */
  (req, res, next) => {
    passport.authenticate('auth0', function(err, user, info) {
      if (err || !user) {
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
      return err ? next(err): next();
    });
  },

  /* Match user against database to determine if the email
     used has been registered. */
  async (req, res, next) => {
    const profiles = new Profiles();
    let email = res.locals.user.emails[0].value;
    let profile;
    try {
      profile = await profiles.get(email);
      if (!profile) {
        throw new Error("Invalid user.");
      }

      res.locals.firstname = profile.firstName;
      res.locals.lastname = profile.lastName;
      res.locals.email = profile.email;
      res.locals.role = profile.role;
      return next();
      
    } catch (err) {
      return next(err);
    }
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
    const saveAs = `${__dirname}/../public/images/thumbs/${email}.jpg`;
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
      errors: [{ msg: err.message }]
    });
  }
  
];