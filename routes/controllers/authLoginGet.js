const passport = require('passport');

module.exports = [
	
	/* Authenticate with Auth0. If success, write user data in
	   the designated scope to req.user. */
	passport.authenticate('auth0', {
		scope: 'openid email profile'
	}), 

	/* Redirect to callback with updated request. */
	(req, res) => {
		return res.redirect('/callback');
	}

];