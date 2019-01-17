/* Register Handlebars helper function to compare two values. */
module.exports = (hbs) => {
  hbs.registerHelper('eq?', function(a, b, options) {
    /* Describe view based on equality. */
    return (a == b) ? options.fn(this) : options.inverse(this);
  });

  hbs.registerHelper('neq?', function(a, b, options) {
    /* Describe view based on equality. */
    return (a != b) ? options.fn(this) : options.inverse(this);
  });
};