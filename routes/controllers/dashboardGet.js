/* Display the dashboard after logging in. */
module.exports = (req, res, next) => {

  res.render('dashboard', {
    displayName: `${res.locals.firstname} ${res.locals.lastname}`, 
    email: res.locals.email
  });
};