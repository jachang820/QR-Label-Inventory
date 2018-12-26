const axios = require('axios');

/* Delete a user from authorization. */
module.exports = (req, res, next) => {
	const email = req.params.email;
	axios.defaults.baseURL = process.env.API_PATH;

	axios.delete(`/users/${email}`).then((response) => {
		return res.redirect('/profile');

	}).catch((err) => {
		err.custom = "Failed to delete user.";
		return next(err);
	});

};