const axios = require('axios');
const jwt = require('jsonwebtoken');

// go to login page if user is not logged in
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
