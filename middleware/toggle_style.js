const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const axios = require('axios');

function toggle_style(type) {

	var cap_type = type.charAt(0).toUpperCase() + type.substring(1);
	var type_pl = type.concat('s');
	var sl_type = '/'.concat(type);

	module.exports[`toggle_${type}`] = [

		body(type_pl).trim()
			.exists().withMessage(`${cap_type} unselected`),

		sanitizeBody(type_pl).trim().escape(),

		(req, res, next) => {
			var style = {
				name: req.body[`new_${type}`],
			};

			axios.defaults.baseURL = process.env.API_PATH;
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				console.log("NOT EMPTY");
				axios.get(`/${type}`).then((response) => {
					var params = { errors: errors.array() }
					params[type_pl] = response.data;
					params[`fill_${type}`] = style.name;
			 		res.render('styles', { params });
					return;
				}).catch(next);

			} else { 
				console.log("ERRORS IS EMPTY");
				axios.get(`/${type}s`, {
					constraints: {
						name: req.body[type_pl]
					}
				}).then(response => {
					console.log("SLIM SHADY:");
					console.log(response.data);
					res.redirect('/styles');
				}).catch(next);

				/*
				axios.post(sl_type, {
					name: style.name
				}).then((response) => {
		 			// Check for error
		 			if (response.msg) { return next(response); }
					
					res.redirect('/styles');

				}).catch(next); */
			}
		}
	];
}

toggle_style('color');
toggle_style('size');