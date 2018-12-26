const async = require('async');
const passport = require('passport');
const axios = require('axios');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	
	/* Call each middleware in series, skip to last function on 
	   error. */
	async.waterfall([

		/* Confirm authentication with Auth0 and get user details. */
		(callback) => {
			passport.authenticate('auth0', function(err, user, info) {
				if (err || !user) { 
					return callback("An exception has occurred.");
				} else {
					return callback(null, user);
				}
			})(req, res, next);
		},

		/* Add user details to request. */
		(user, callback) => {
			req.logIn(user, (err) => {
				if (err) {
					return callback("Login failed.");
				} else {
					return callback(null, user);
				}
			});
		},

		/* Match user against database to determine if the email
		   used has been registered. */
		(user, callback) => {
			axios.defaults.baseURL = process.env.API_PATH;
			axios.get(`/users/${user.emails[0].value}`).then(response => {
				if (response.data) {
					return callback(null, 
													response.data.email,
													response.data.role);
				} else {
					throw Error;
				}
			}).catch(() => {
				return callback("Invalid user. Please contact your administrator.");
			})
		},

		/* Sign a JSON Web Token with a secret to return a security
		   signature. The signature along with the secret can be
		   used to determine user role. */
		(email, role, callback) => {
			req.user.token = jwt.sign({
				email: email,
				role: role
			},
			process.env.SECURITY_SECRET, {
				algorithm: 'HS256',
				expiresIn: '1 day'
			});
			return callback(null);
		},

		/* Go to dashboard or some other page user tried to visit. */
		(callback) => {
			const returnTo = req.session.returnTo;
			delete req.session.returnTo;
			return res.redirect(returnTo || '/dashboard');
		},
	], 

	/* An error has occurred. Return to main page with an error 
	   message previously generated. */
	(err) => {
		return res.render('index', {
			errors: { msg: err }
		});
	});
	
};