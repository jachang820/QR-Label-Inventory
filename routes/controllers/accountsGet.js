const getModel = require('../../middleware/getModel');
const prepareList = require('../../middleware/prepareList');

/* Get the necessary information to populate form. */
module.exports = [

  /* Get all users. */
  getModel('users', 'res'),

  /* Use roles to derive how status should be handled.
     Administrator accounts should not be deleted, so
     they take on an inactive, unused status that has
     no assigned action. */
  (req, res, next) => {
    let users = res.locals.users;
    for (let i = 0; i < users.length; i++) {
      users[i].active = (users[i].role !== 'Administrator');
      users[i].used = false;
    }
    return next();
  },

  /* Get object necessary for list all. */
  prepareList('users'),

  /* Render user management form and all user data. */
  /* Render page. */
  (req, res, next) => {
    return res.render('listAll');
  }
  
];