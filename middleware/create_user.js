const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const axios = require('axios');
const identify_self = require('../helpers/identifySelf');
const { Users } = require('../models');
const roles = Users.rawAttributes.role.values;

module.exports.create_user_post = [

	// Validate fields
	(req, res, next) => {
		console.log(req.body.role);
		return next();
	}
	,
	body('firstname').trim()
		.isLength({ min: 1 }).withMessage('First name empty.')
		.isAlpha().withMessage('First name must be alphabet letters.'),

	body('lastname').trim()
		.isLength({ min: 1 }).withMessage('Last name empty.')
		.isAlpha().withMessage('Last name must be alphabet letters.'),
	
	body('email').trim()
		.isEmail().withMessage('Must be a valid email.')
		.custom(value => {
			axios.defaults.baseURL = process.env.API_PATH;
			return axios.get('/users/'.concat(value)).then(response => {
				if (response.data) {
					return Promise.reject('Email aready in use');
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
		axios.defaults.baseURL = process.env.API_PATH;

		if (!errors.isEmpty()) {
			axios.get('/users')
					 .then((response) => {
					 		var email = req.user.emails[0].value;
					 		response.data = identify_self(response.data, email); 
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
			axios.post('/users/create', {
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