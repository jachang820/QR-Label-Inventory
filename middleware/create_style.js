const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const axios = require('axios');

function create_style(type) {

	var type_title = ['create', type].join('_');
	var cap_type = type.charAt(0).toUpperCase() + type.substring(1);
	var type_pl = type.concat('s');
	var sl_type = '/'.concat(type);
	var new_type = ['new', type].join('_');

	module.exports[type_title] = [

		body(new_type).trim()
			.isLength({ min: 1 }).withMessage([cap_type, 'empty'].join(' '))
			.custom(value => {
				axios.defaults.baseURL = process.env.API_PATH;

				return axios.get([sl_type, value].join('/')).then(response => {
					if (response.data) {
						return Promise.reject([cap_type, 'already in use'].join(' '));
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
				axios.get(sl_type).then((response) => {
					var params = { errors: errors.array() }
					params[type_pl] = response.data;
					params[['fill', type].join('_')] = style.name;
			 		res.render('styles', { params });
					return;
				}).catch(next);

			} else { 
				axios.post(sl_type, {
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