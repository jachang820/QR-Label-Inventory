const async = require('async');
const axios = require('axios');
const identifySelf = require('../../helpers/identifySelf');
const { Users } = require('../../models');
const roles = Users.rawAttributes.role.values;

/* Get the necessary information to populate form. */
module.exports = [

  /* Get user data from request. */
  (req, res, next) => {
    const {_raw, _json, ...userProfile } = req.user;
    res.locals.profile = userProfile;
    return next();
  },

  /* Get list of all users from database. */
  (req, res, next) => {
    axios.defaults.baseURL = process.env.API_PATH;
    axios.get('/users').then((response) => {
      res.locals.allUsers = response.data;
      return next();
    
    }).catch((err) => { 
      err.custom = "Error retrieving users from database.";
      return next(err); 
    });
  },

  /* Adds a marker to logged-in user's account to prevent
     a delete button from appearing next to his account, since
     an admin shouldn't be able to delete his own account. */
  (req, res, next) => {
    res.locals.email = res.locals.profile.emails[0].value;
    res.locals.allUsers = identifySelf(
      res.locals.allUsers, res.locals.email);
    return next();
  },

  /* Render user management form and all user data. */
  (req, res, next) => {
    return res.render('profile', {
      roles: roles,
      firstname: res.locals.profile.firstname,
      lastname: res.locals.profile.lastname,
      email: res.locals.email,
      users: res.locals.allUsers
    });
  }
  
];