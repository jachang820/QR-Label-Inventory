const axios = require('axios');
const jwt = require('jsonwebtoken');

/* Verify that logged in user was authenticated and reaffirm
   the user's role. If user is invalid, log out. */
module.exports = function() {
  return function secured (req, res, next) {

    var secret = process.env.SECURITY_SECRET;
    var token = req.user.token;

    try {
      var decoded = jwt.verify(token, secret)
    } catch(err) {
      req.session.returnTo = req.originalUrl;
       return res.redirect('/auth/logout')
    }

    req.user.role = decoded.role;
    return next();
  }
}
