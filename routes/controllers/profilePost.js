const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const axios = require('axios');
const identifySelf = require('../../helpers/identifySelf');
const { Users } = require('../../models');
const roles = Users.rawAttributes.role.values;
const setupAxios = require('../helpers/setupAxios');

module.exports = [

  /* Validate inputs, makes sure they are not empty and are
     the appropriate format. */
  body('firstname').trim()
    .isLength({ min: 1 }).withMessage('First name empty.')
    .isLength({ max: 32 }).withMessage('First name too long.')
    .isAlpha().withMessage('First name must be alphabet letters.'),

  body('lastname').trim()
    .isLength({ min: 1 }).withMessage('Last name empty.')
    .isLength({ max: 32 }).withMessage('Last name too long.')
    .isAlpha().withMessage('Last name must be alphabet letters.'),
  
  body('email').trim()
    .isLength({ max: 64 }).withMessage('Email too long.')
    .isEmail().withMessage('Must be a valid email.')
    .custom(value => {

      /* Checks the database to see if the email already exists. */
      axios = setupAxios();
      return axios.get('/users/'.concat(value)).then(response => {
        if (response.data) {
          return Promise.reject('Email aready in use');
        }
      });
    }),
  
  body('role').trim()
    .isLength({ min: 1 }).withMessage('Role unselected.')
    .custom(value => {
      /* Check that selected role is one of the values taken by
         the database, in case hackers try to enter their own
         values. */
      if (!roles.includes(value)) {
        throw new Error('Must be a valid role.');
      } else {
        return true;
      }
    }),

  /* Sanitize fields to prevent malicious injections,
     checks for escape characters and removes them. */
  sanitizeBody('firstname').trim().escape(),
  
  sanitizeBody('lastname').trim().escape(),
  
  sanitizeBody('email').trim().escape(),
  
  sanitizeBody('role').escape(),

  /* Returns error if they exist, otherwise create user. */
  (req, res, next) => {

    /* This is the new user that was entered into the form. */
    const user = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      role: req.body.role
    };

    /* List of errors from above validation steps. */
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      /* There are errors, so return profile page with error messages.
         Keep form filled in with user-entered values. */
      axios.get('/users').then((response) => {
        const email = res.locals.email;
        response.data = identifySelf(response.data, email); 
        return res.render('profile', {
          roles: roles,
          fill_firstname: user.firstname,
          fill_lastname: user.lastname,
          fill_email: user.email,
          users: response.data,
          errors: errors.array()
        });

      }).catch((err) => {
        err.custom = "Error retrieving users from database.";
        return next(err);
      });
              
    } else {

      /* There are no errors, so create new user. */
      axios.post('/users', {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role
      }).then((response) => {

        res.redirect('/profile');

      }).catch((err) => {
        err.custom = "Error adding new users to database.";
        return next(err);
      });
    }
  }

];