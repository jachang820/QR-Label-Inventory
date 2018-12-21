const crypto = require('crypto');

// go to login page if user is not logged in
module.exports = function(user) {
	var hash = crypto.createHash('sha1');
	hash.setEncoding('hex');
	var secret = process.env.SECURITY_SECRET;
	var email = user.emails[0].value;
	hash.write(secret.concat(email));
	hash.end();
	user.hash = hash.read();
}
