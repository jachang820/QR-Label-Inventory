/* Home page. If user is already logged in, 
   go to user dashboard. */

module.exports = (req, res, next) => {
	console.log(req);
  if (req.user && req.user.token && req.user.emails) {
    res.redirect('dashboard');
  } else {
    res.render('index', { title: 'Express' });
  }
};