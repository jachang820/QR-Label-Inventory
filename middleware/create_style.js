const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const axios = require('axios');

/* Generates middleware lists for creating colors and sizes. */
function create_style(type) {

	var cap_type = type.charAt(0).toUpperCase() + type.substring(1);
	var new_type = `new_${type}`;

	module.exports[`create_${type}`] = [

		body(new_type).trim()
			.isLength({ min: 1 }).withMessage(`${cap_type} empty`)
			.custom(value => {
				axios.defaults.baseURL = process.env.API_PATH;

				return axios.get(`/${type}/${value}`).then(response => {
					if (response.data) {
						return Promise.reject(`${cap_type} already in use`);
					}
				});
			}),

		sanitizeBody(new_type).trim().escape(),

		(req, res, next) => {
			var style = {
				name: req.body[new_type],
			};

			axios.defaults.baseURL = process.env.API_PATH;
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				axios.get(`/${type}`).then((response) => {
					var params = { errors: errors.array() }
					params[`${type}s`] = response.data;
					params[`fill_${type}`] = style.name;
			 		res.render('styles', { params });
					return;
				}).catch(next);

			} else { 
				axios.post(`/${type}s`, {
					name: style.name
				}).then((response) => {
		 			// Check for error
		 			if (response.msg) { return next(response); }
					
					res.redirect('/styles');

				}).catch(next);
			}
		}
	];
}

create_style('color');
create_style('size');