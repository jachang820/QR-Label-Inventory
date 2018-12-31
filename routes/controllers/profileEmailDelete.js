const axios = require('axios');
const setupAxios = require('../helpers/setupAxios');

/* Delete a user from authorization. */
module.exports = (req, res, next) => {
  const email = req.params.email;
  axios = setupAxios();

  axios.delete(`/users/${email}`).then((response) => {
    return res.redirect('/profile');

  }).catch((err) => {
    err.custom = "Failed to delete user.";
    return next(err);
  });

};