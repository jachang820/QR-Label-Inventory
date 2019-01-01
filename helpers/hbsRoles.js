/* Register Handlebars helper function to compare roles and determine
   whether to show certain elements. */
module.exports = (hbs) => {
	hbs.registerHelper('if-role', function(role, operator, lst, options) {
		if (operator === 'in') {
			if (lst.includes(role)) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		} else if (operator === 'notin') {
			if (!lst.includes(role)) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		} else {
			return "Error: Invalid role.";
		}
	});
};