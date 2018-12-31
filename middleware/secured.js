const axios = require('axios');
const jwt = require('jsonwebtoken');

/* Determine whether request was made from an axios call
   within the back-end. */
function serverRequest(req) {
  let auth = req.headers.authorization;
  if (auth && auth.startsWith("Basic ")) {
    let base64 = auth.substring(6);
    let pair = Buffer.from(base64, 'base64')
                     .toString('ascii')
                     .split(':');
    if (pair.length === 2 && pair[0] === "server" &&
      pair[1] === process.env.SERVER_SECRET) {

      return true;
    }
  } else {
    return false;
  }
}

/* Verify that logged in user was authenticated and reaffirm
   the user's role. If user is invalid, log out. */
module.exports = function() {
  return function secured (req, res, next) {

    if (!serverRequest(req)) {

      let secret = process.env.SECURITY_SECRET;
      let token = req.user.token;

      try {
        var decoded = jwt.verify(token, secret);
      } catch(err) {
        req.session.returnTo = req.originalUrl;
         return res.redirect('/auth/logout');
      }

      res.locals.firstname = decoded.firstname;
      res.locals.lastname = decoded.lastname;
      res.locals.email = decoded.email;
      res.locals.role = decoded.role;

    } else {

      res.locals.role = 'Administrator';

    }

    return next();
  }
}
