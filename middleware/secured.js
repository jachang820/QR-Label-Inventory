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
module.exports = (req, res, next) => {

  if (!serverRequest(req)) {

    const secret = process.env.SECURITY_SECRET;
    const user = req.user;
    if (!user || !user.token) {
      return res.redirect('/auth/logout');
    }

    try {
      var decoded = jwt.verify(user.token, secret);
    } catch(err) {
      req.session.returnTo = req.originalUrl;
       return res.redirect('/auth/logout');
    }

    res.locals.firstname = decoded.firstname;
    res.locals.lastname = decoded.lastname;
    res.locals.email = decoded.email;
    res.locals.role = decoded.role;
    if (req.user.picture) {
      res.locals.user_picture = req.user.picture;
    }

  } else {

    res.locals.role = 'Administrator';

  }

  return next();
}
