const express = require('express');
const router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
const createHash = require('../helpers/createSecurityHash');

// after login, auth0 will redirect to callback
router.get('/login', passport.authenticate('auth0', {
	scope: 'openid email profile'
}), function (req, res) {
	res.redirect('/');
})

// check authentication validity
router.get('/callback', function (req, res, next) {
	passport.authenticate('auth0', function (err, user, info) {
		if (err) { return next(err); }
		if (!user) { return res.redirect('/auth/login'); }
		req.logIn(user, function (err) {
			if (err) { return next(err); }

			// Writes a hash to user.hash that could be used to check
			// whether user is authentic.
			createHash(user);
			
			const returnTo = req.session.returnTo;
			delete req.session.returnTo;
			res.redirect(returnTo || '/dashboard');
		});
	})(req, res, next);
});

// logout and redirect to homepage
router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;