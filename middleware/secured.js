const crypto = require('crypto');

// go to login page if user is not logged in
module.exports = function() {
	return function secured (req, res, next) {
		if (req.user) { return next(); }
		req.session.returnTo = req.originalUrl;
		res.redirect('/login')
	}
}
