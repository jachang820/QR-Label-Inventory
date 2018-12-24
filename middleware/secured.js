const crypto = require('crypto');
const axios = require('axios');

// go to login page if user is not logged in
module.exports = function() {
	return function secured (req, res, next) {
		var hash = crypto.createHash('sha1');
		hash.setEncoding('hex');
		var secret = process.env.SECURITY_SECRET;
		var email = req.user.emails[0].value;
		hash.write(secret.concat(email));
		hash.end();
		sha1 = hash.read();
		
		var get_path = `${process.env.API_PATH}users/${email}`;

		axios.get(get_path).then((response) => {
			if (req.user.hash == sha1) {
				req.user.role = response.data.role;
				return next();
			} else {
				throw new Error('Security hash does not match.');
			}
		}).catch((err) => {
			req.session.returnTo = req.originalUrl;
			res.redirect('/auth/logout')
		})
	}
}
