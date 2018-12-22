const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const axios = require('axios');
const { Users } = require('../models');
const roles = Users.rawAttributes.role.values;

module.exports.create_user_post = [

	// Validate fields
	body('firstname').trim()
		.isLength({ min: 1 }).withMessage('First name empty.')
		.isAlpha().withMessage('First name must be alphabet letters.'),

	body('lastname').trim()
		.isLength({ min: 1 }).withMessage('Last name empty.')
		.isAlpha().withMessage('Last name must be alphabet letters.'),
	
	body('email').trim()
		.isEmail().withMessage('Must be a valid email.')
		.custom(value => {
			return Users.findOne({where: {'email': value}}).then(user => {
				if (user) {
					return Promise.reject('Email already in use');
				}
			});
		}),
	
	body('role').trim()
		.isLength({ min: 1 }).withMessage('Role unselected.')
		.custom(value => {
			if (!roles.includes(value)) {
				throw new Error('Must be a valid role.');
			} else {
				return true;
			}
		}),

	// Sanitize fields to prevent malicious injections
	sanitizeBody('firstname').trim().escape(),
	
	sanitizeBody('lastname').trim().escape(),
	
	sanitizeBody('email').trim().escape(),
	
	sanitizeBody('role').escape(),

	// Process request
	(req, res, next) => {
		var user = {
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			role: req.body.role
		};

		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			axios.get(process.env.API_PATH.concat('users'))
					 .then((response) => { 
					 		res.render('profile', {
								roles: roles,
								fill_firstname: user.firstname,
								fill_lastname: user.lastname,
								fill_email: user.email,
								users: response.data,
								errors: errors.array()
							});

							return;
						}).catch(next);
							
		} else {
			axios.post(process.env.API_PATH.concat('/users/create'), {
				firstname: user.firstname,
				lastname: user.lastname,
				email: user.email,
				role: user.role
			}).then((response) => {
		 		// Check for error
		 		if (response.msg) { return next(response); }

		 		res.redirect('/profile');
			}).catch(next);
		}
	}

];