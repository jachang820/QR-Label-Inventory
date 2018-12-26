const async = require('async');
const axios = require('axios');
const identifySelf = require('../../helpers/identifySelf');
const { Users } = require('../../models');
const roles = Users.rawAttributes.role.values;

/* Get the necessary information to populate form. */
module.exports = (req, res, next) => {

  /* Call each middleware in series, skip to last function on 
     error. */
  async.waterfall([

    /* Get user data from request. */
    (callback) => {
      const {_raw, _json, ...userProfile } = req.user;
      return callback(null, userProfile);
    },

    /* Get list of all users from database. */
    (profile, callback) => {
      axios.defaults.baseURL = process.env.API_PATH;
      axios.get('/users').then((response) => {
        
        return callback(null, profile, response.data);
      
      }).catch((err) => { 
        err.custom = "Error retrieving users from database.";
        return callback(err); 
      });
    },

    /* Adds a marker to logged-in user's account to prevent
       a delete button from appearing next to his account, since
       an admin shouldn't be able to delete his own account. */
    (profile, allUsers, callback) => {
      const email = profile.emails[0].value;
      allUsers = identifySelf(allUsers, email);
      return callback(null, profile, allUsers);
    },

    /* Render user management form and all user data. */
    (profile, allUsers, callback) => {
      res.render('profile', {
        roles: roles,
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.emails[0].value,
        users: allUsers
      });
    }
  ],

  /* An error has occurred. Pass error to error handler. */
  (err) => { return next(err); });

};