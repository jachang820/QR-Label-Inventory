/* Register Handlebars helper function to compare two values. */
module.exports = (hbs) => {
  hbs.registerHelper('eq?', function(a, b, options) {
    /* Describe view based on equality. */
    if (a == b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  hbs.registerHelper('neq?', function(a, b, options) {
    /* Describe view based on equality. */
    if (a != b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
};