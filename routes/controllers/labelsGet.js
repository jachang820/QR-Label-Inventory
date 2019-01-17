const getModel = require('../../middleware/getModel');
const prepareList = require('../../middleware/prepareList');

/* Generates middleware list to view label URL settings. */
module.exports = [

  /* Get all label URLs. */
  getModel('labels', 'res'),

  /* Get object necessary for list all. */
  prepareList('labels'),

  /* Render page. */
  (req, res, next) => {
    return res.render('listAll');
  }

];
