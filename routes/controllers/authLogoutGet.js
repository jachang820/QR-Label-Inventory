module.exports = (req, res) => {

  /* Remove user data from request. */
  req.logout();

  /* Go to main page. */
  res.redirect('/');

};

