/* Register Handlebars helper function to compare roles and determine
   whether to show certain elements. */
module.exports = (hbs) => {
  hbs.registerHelper('if-role', 
    function(role, operator, accept, options) {
      
      /* Convert string literal into list.
         e.g. 'AS' => ['A', 'S'] */
      const lst = accept.trim().split('');

      /* Check if role is valid. */
      const includesStartOf = function(lst, role) {
        if (role === undefined) {
          return false;
        } else {
          /* Compare user role against each accepted level for
             the route. */
          return lst.some(e => role.startsWith(e));
        }
      }
      const includes = includesStartOf(lst, role);

      /* Describe view based on role inclusion. */
      if (operator === 'in') {
        if (includes) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }

      /* Describe view based on role exclusion. */
      } else if (operator === 'notin') {
        if (!includes) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }

      } else {
        return "Error: Bad format.";
      }
    }
  );
};