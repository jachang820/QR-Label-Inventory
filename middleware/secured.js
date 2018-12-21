const crypto = require('crypto');

// go to login page if user is not logged in
module.exports = function() {
	return function secured (req, res, next) {
		var hash = crypto.createHash('sha1');
		hash.setEncoding('hex');
		var secret = process.env.SECURITY_SECRET;
		var email = req.user.emails[0].value;
		hash.write(secret.concat(email));
		hash.end();
		if (req.user.hash == hash.read()) { return next(); }
		req.session.returnTo = req.originalUrl;
		res.redirect('/login')
	}
}
