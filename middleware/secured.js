const jwt = require('jsonwebtoken');

/* Verify that logged in user was authenticated and reaffirm
   the user's role. If user is invalid, log out. */
module.exports = (req, res, next) => {
  const secret = process.env.SECURITY_SECRET;
  const user = req.user;

  /* User not logged in. */
  if (!user || !user.token) {
    return res.redirect('/auth/logout');
  }

  /* Verify token with secret. */
  try {
    var decoded = jwt.verify(user.token, secret);
  } catch(err) {
    /* Invalid token. */
    req.session.returnTo = req.originalUrl;
     return res.redirect('/auth/logout');
  }

  /* Store credentials. */
  res.locals.logged_in = true;
  res.locals.firstname = decoded.firstname;
  res.locals.lastname = decoded.lastname;
  res.locals.email = decoded.email;
  res.locals.role = decoded.role;
  res.locals.picture = `${decoded.email.replace('@', '-')}.jpg`;

  return next();
}
