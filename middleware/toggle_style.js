const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const axios = require('axios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function toggle_style(type) {

	var type_title = ['toggle', type].join('_');
	var cap_type = type.charAt(0).toUpperCase() + type.substring(1);
	var type_pl = type.concat('s');
	var sl_type = '/'.concat(type);
	var new_type = ['new', type].join('_');

	module.exports[type_title] = [

		body(type_pl).trim()
			.exists().withMessage([cap_type, 'unselected'].join(' ')),

		sanitizeBody(type_pl).trim().escape(),

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

toggle_style('color');
toggle_style('size');