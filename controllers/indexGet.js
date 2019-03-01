/* Home page. If user is already logged in, 
   go to user dashboard. */
module.exports = (req, res, next) => {
  if (req.user && req.user.token && req.user.emails) {
    res.redirect('customer_orders');
  } else {
    res.render('index');
  }
};