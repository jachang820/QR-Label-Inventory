/* Get information to populate form to add new customer orders. */
module.exports = [

  /* Render page. */
  (req, res, next) => {
 		res.locals.css = ['listView.css'];
 		res.locals.title = 'Add Customer Orders';
    return res.render('customer_orders');
  }
];
