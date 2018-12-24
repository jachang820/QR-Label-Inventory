const crypto = require('crypto');

/* Creates a hash from user email and a secret.
   Rationale:
    - If security is based only on email, a hacker might
      be able to bypass login authentication by entering
      someone's email in the session request.
    - This hash is checked whenever a new page is visited.
*/
module.exports = function(user) {
	var hash = crypto.createHash('sha1');
	hash.setEncoding('hex');
	var secret = process.env.SECURITY_SECRET;
	var email = user.emails[0].value;
	hash.write(secret.concat(email));
	hash.end();
	user.hash = hash.read();
}
