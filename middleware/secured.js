const crypto = require('crypto');
const axios = require('axios');

/* Check security hash to make sure logged in user remains
   the same credentials. This is to prevent users from
   tampering with session requests to gain control of
   other accounts or roles. If invalid hashes are found,
   user is automatically logged out. */
module.exports = function() {
	return function secured (req, res, next) {
		/* Create hash with user email and secret */
		var hash = crypto.createHash('sha1');
		hash.setEncoding('hex');
		var secret = process.env.SECURITY_SECRET;
		var email = req.user.emails[0].value;
		hash.write(secret.concat(email));
		hash.end();
		sha1 = hash.read();
		
		var get_path = `${process.env.API_PATH}users/${email}`;

		/* Compare user security hash with created hash. If
		   they match, grant user the role associated with his
		   account. */
		axios.get(get_path).then((response) => {
			if (req.user.hash == sha1) {
				req.user.role = response.data.role;
				return next();
			} else {
				throw new Error('Security hash does not match.');
			}
		}).catch((err) => {
			/* Keep track of the page user was on, then
			   log out. */
			req.session.returnTo = req.originalUrl;
			res.redirect('/auth/logout')
		})
	}
}
